// Shared Hero/Boss impact armour — Hardware Gate 01 bench firmware (MKE-K01 ESP32-S3).
// Three TSOP38238 receivers decode the Arc Bow's NEC-style packet on interrupts, so the
// zone that saw a shot is known. Reports SHOT_SEEN / HIT_REJECT over USB serial; Unity
// decides HIT_CONFIRM and damage. No library beyond the Arduino core.
#include <Arduino.h>

namespace Pins {
constexpr uint8_t ReceiverLeft = 6;   // TSOP38238 OUT; 100 Ohm + 4.7 uF at each receiver
constexpr uint8_t ReceiverChest = 7;
constexpr uint8_t ReceiverRight = 8;
}

namespace Tuning {
constexpr uint32_t CollectWindowMs = 40;   // one packet reaching several zones = one shot
constexpr uint32_t DuplicateWindowMs = 1500;
constexpr uint8_t ExpectedAddressMask = 0xF0;
constexpr uint8_t ExpectedAddressTag = 0xA0;  // Atlas shooters use 0xA1..0xAF
}

constexpr uint8_t ZoneCount = 3;
const uint8_t zonePins[ZoneCount] = {Pins::ReceiverLeft, Pins::ReceiverChest, Pins::ReceiverRight};
const char *const zoneNames[ZoneCount] = {"left", "chest", "right"};

// ---- Per-receiver NEC decoder (falling edge = start of a carrier burst) -----------------
struct Decoder {
  volatile uint32_t lastFallUs = 0;
  volatile uint32_t bits = 0;
  volatile int8_t bitCount = -1;  // -1 = waiting for leader
};

struct Frame {
  uint32_t data;
  uint8_t zone;
  uint32_t atMs;
};

Decoder decoders[ZoneCount];
constexpr uint8_t QueueSize = 16;
volatile Frame queue[QueueSize];
volatile uint8_t queueHead = 0;
volatile uint8_t queueTail = 0;
portMUX_TYPE queueLock = portMUX_INITIALIZER_UNLOCKED;

void IRAM_ATTR onFall(uint8_t zone) {
  Decoder &d = decoders[zone];
  const uint32_t now = micros();
  const uint32_t dt = now - d.lastFallUs;
  d.lastFallUs = now;

  if (dt >= 12000 && dt <= 15000) {  // 9 ms mark + 4.5 ms space
    d.bitCount = 0;
    d.bits = 0;
    return;
  }
  if (d.bitCount < 0) return;
  if (dt >= 900 && dt <= 1450) {
    d.bitCount = d.bitCount + 1;  // logical 0 (1.125 ms period)
  } else if (dt >= 1900 && dt <= 2600) {
    d.bits |= (1UL << d.bitCount);
    d.bitCount = d.bitCount + 1;  // logical 1 (2.25 ms period)
  } else {
    d.bitCount = -1;  // noise or a broken frame
    return;
  }
  if (d.bitCount == 32) {
    portENTER_CRITICAL_ISR(&queueLock);
    const uint8_t next = (queueHead + 1) % QueueSize;
    if (next != queueTail) {
      queue[queueHead].data = d.bits;
      queue[queueHead].zone = zone;
      queue[queueHead].atMs = millis();
      queueHead = next;
    }
    portEXIT_CRITICAL_ISR(&queueLock);
    d.bitCount = -1;
  }
}

void IRAM_ATTR onFallLeft() { onFall(0); }
void IRAM_ATTR onFallChest() { onFall(1); }
void IRAM_ATTR onFallRight() { onFall(2); }

bool popFrame(Frame &out) {
  bool has = false;
  portENTER_CRITICAL(&queueLock);
  if (queueTail != queueHead) {
    out.data = queue[queueTail].data;
    out.zone = queue[queueTail].zone;
    out.atMs = queue[queueTail].atMs;
    queueTail = (queueTail + 1) % QueueSize;
    has = true;
  }
  portEXIT_CRITICAL(&queueLock);
  return has;
}

// ---- Shot grouping and reporting ---------------------------------------------------------
uint32_t sequenceNumber = 0;
bool pending = false;
uint8_t pendingShot = 0;
uint8_t pendingShooter = 0;
uint8_t pendingZone = 0;
uint8_t pendingMask = 0;
uint32_t pendingSince = 0;
bool hasReported = false;
uint8_t lastReportedShot = 0;
uint32_t lastReportedAt = 0;
uint32_t feedbackUntil = 0;

void setStatus(uint8_t red, uint8_t green, uint8_t blue) {
#ifdef RGB_BUILTIN
  rgbLedWrite(RGB_BUILTIN, red, green, blue);
#endif
}

void printHeader(const char *type, uint32_t now) {
  Serial.printf("{\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":%lu,\"type\":\"%s\",\"atMs\":%lu",
                static_cast<unsigned long>(++sequenceNumber), type, static_cast<unsigned long>(now));
}

void reportSeen(uint32_t now) {
  printHeader("SHOT_SEEN", now);
  Serial.printf(",\"shot\":%u,\"shooter\":%u,\"zone\":\"%s\",\"zones\":[", pendingShot, pendingShooter, zoneNames[pendingZone]);
  bool first = true;
  for (uint8_t z = 0; z < ZoneCount; z++) {
    if (pendingMask & (1 << z)) {
      Serial.printf("%s\"%s\"", first ? "" : ",", zoneNames[z]);
      first = false;
    }
  }
  Serial.print("]}\n");

  static const uint8_t colours[ZoneCount][3] = {{30, 0, 18}, {30, 6, 0}, {0, 6, 30}};
  setStatus(colours[pendingZone][0], colours[pendingZone][1], colours[pendingZone][2]);
  feedbackUntil = now + 150;
}

void handleFrame(const Frame &frame) {
  const uint8_t address = frame.data & 0xFF;
  const uint8_t addressCheck = (frame.data >> 8) & 0xFF;
  const uint8_t command = (frame.data >> 16) & 0xFF;
  const uint8_t commandCheck = (frame.data >> 24) & 0xFF;

  if (static_cast<uint8_t>(~address) != addressCheck || static_cast<uint8_t>(~command) != commandCheck ||
      (address & Tuning::ExpectedAddressMask) != Tuning::ExpectedAddressTag) {
    printHeader("HIT_REJECT", frame.atMs);
    Serial.printf(",\"zone\":\"%s\",\"reason\":\"INVALID_CODE\"}\n", zoneNames[frame.zone]);
    return;
  }

  if (pending && command == pendingShot) {
    pendingMask |= (1 << frame.zone);
    return;
  }
  if (hasReported && command == lastReportedShot && frame.atMs - lastReportedAt < Tuning::DuplicateWindowMs) {
    printHeader("DUPLICATE_IGNORED", frame.atMs);
    Serial.printf(",\"shot\":%u,\"zone\":\"%s\"}\n", command, zoneNames[frame.zone]);
    return;
  }

  pending = true;
  pendingShot = command;
  pendingShooter = address & 0x0F;
  pendingZone = frame.zone;
  pendingMask = 1 << frame.zone;
  pendingSince = frame.atMs;
}

void setup() {
  Serial.begin(115200);
  for (uint8_t pin : zonePins) pinMode(pin, INPUT_PULLUP);  // TSOP output idles high
  attachInterrupt(digitalPinToInterrupt(Pins::ReceiverLeft), onFallLeft, FALLING);
  attachInterrupt(digitalPinToInterrupt(Pins::ReceiverChest), onFallChest, FALLING);
  attachInterrupt(digitalPinToInterrupt(Pins::ReceiverRight), onFallRight, FALLING);
  setStatus(0, 10, 0);
  Serial.printf("ATLAS_PROP_READY v1 impact-armour-01 zones=left:%u,chest:%u,right:%u\n", Pins::ReceiverLeft,
                Pins::ReceiverChest, Pins::ReceiverRight);
}

void loop() {
  const uint32_t now = millis();
  Frame frame;
  while (popFrame(frame)) handleFrame(frame);

  if (pending && now - pendingSince >= Tuning::CollectWindowMs) {
    reportSeen(now);
    hasReported = true;
    lastReportedShot = pendingShot;
    lastReportedAt = pendingSince;
    pending = false;
  }
  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    setStatus(0, 10, 0);
  }
}

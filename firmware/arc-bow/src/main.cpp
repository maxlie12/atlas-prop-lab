// Arc Bow — Hardware Gate 01 bench firmware (MKE-K01 or ESP32-S3-DevKitC-1).
// Hall draw sensing -> DRAW_START / DRAW_READY / FIRE over USB serial, plus one coded
// 38 kHz IR packet per FIRE for the impact armour. No library beyond the Arduino core.
//
// Bench commands (one character over serial, ignored by the Unity bridge):
//   ?  print ATLAS_PROP_INFO with device id, pins, rest level and thresholds
//   h  toggle ATLAS_HALL lines (10 Hz raw reading) for placing the magnet
//   r  re-measure the rest level (string must be at rest)
// Text lines never start with '{', so JSON consumers skip them.
#include <Arduino.h>

namespace Pins {
constexpr uint8_t HallAnalog = 4;  // ADC1; KY-024 AO, metered <= 3.3 V before connecting
constexpr uint8_t IrTx = 5;        // 2N2222 base through 1 kOhm, never the IR LED directly
}

namespace Tuning {
constexpr uint16_t DrawStartCounts = 150;  // |reading - rest| that starts a draw
constexpr uint16_t DrawReadyCounts = 600;  // deviation that arms a shot
constexpr uint32_t SampleMs = 2;
constexpr uint32_t RefireLockMs = 250;     // no second FIRE from one release bounce
constexpr uint32_t CarrierHz = 38000;
constexpr uint8_t ShooterAddress = 0xA1;   // packet address byte: Atlas bow #1
}

enum class Draw { Rest, Drawing, Ready };

Draw draw = Draw::Rest;
int restLevel = 0;
uint32_t sequenceNumber = 0;
uint8_t shotId = 0;
uint32_t lastFireAt = 0;
uint32_t lastSampleAt = 0;
bool hallMonitor = false;
uint32_t lastMonitorAt = 0;
int lastRaw = 0;

void emit(const char *action, uint32_t now, int deviation) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":%lu,"
      "\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"shot\":%u,\"hall\":%d,\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action, shotId, deviation,
      static_cast<unsigned long>(now));
}

void setStatus(uint8_t red, uint8_t green, uint8_t blue) {
#ifdef RGB_BUILTIN
  rgbLedWrite(RGB_BUILTIN, red, green, blue);
#endif
}

// NEC-style frame: 9 ms mark + 4.5 ms space, then address, ~address, shot, ~shot (LSB
// first; 562 us mark, 562/1687 us space), then a closing mark. ~68 ms, blocking by design.
void mark(uint32_t us) {
  ledcWrite(Pins::IrTx, 128);
  delayMicroseconds(us);
}

void space(uint32_t us) {
  ledcWrite(Pins::IrTx, 0);
  delayMicroseconds(us);
}

void sendPacket(uint8_t address, uint8_t command) {
  const uint8_t bytes[4] = {address, static_cast<uint8_t>(~address), command, static_cast<uint8_t>(~command)};
  mark(9000);
  space(4500);
  for (uint8_t value : bytes) {
    for (uint8_t bit = 0; bit < 8; bit++) {
      mark(562);
      space((value >> bit) & 1 ? 1687 : 562);
    }
  }
  mark(562);
  space(0);
}

const char *drawName() {
  return draw == Draw::Rest ? "rest" : draw == Draw::Drawing ? "drawing" : "ready";
}

// banner = "ATLAS_PROP_READY" at boot; "ATLAS_PROP_INFO" on request, so the bridge does not
// mistake a bench query for a reboot.
void printIdentity(const char *banner) {
  Serial.printf("%s v1 archer-bow-01 hall=%u ir=%u hallRest=%d start=%u ready=%u\n", banner, Pins::HallAnalog,
                Pins::IrTx, restLevel, Tuning::DrawStartCounts, Tuning::DrawReadyCounts);
}

int measureRest() {
  long sum = 0;
  for (int i = 0; i < 64; i++) {
    sum += analogRead(Pins::HallAnalog);
    delay(2);
  }
  return static_cast<int>(sum / 64);
}

void handleCommand(char command) {
  switch (command) {
    case '?':
      printIdentity("ATLAS_PROP_INFO");
      break;
    case 'h':
      hallMonitor = !hallMonitor;
      Serial.printf("ATLAS_HALL_MONITOR %s\n", hallMonitor ? "on" : "off");
      break;
    case 'r':
      if (draw != Draw::Rest) {
        Serial.print("ATLAS_HALL_REST busy: release the string first\n");
        break;
      }
      restLevel = measureRest();
      printIdentity("ATLAS_PROP_INFO");
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  ledcAttach(Pins::IrTx, Tuning::CarrierHz, 8);  // Arduino-ESP32 core 3.x pin-based LEDC
  ledcWrite(Pins::IrTx, 0);
  analogReadResolution(12);

  // Calibrate the undrawn rest level; the string must be at rest during boot.
  restLevel = measureRest();
  setStatus(0, 0, 12);
  printIdentity("ATLAS_PROP_READY");
}

void loop() {
  while (Serial.available() > 0) handleCommand(static_cast<char>(Serial.read()));

  const uint32_t now = millis();
  if (now - lastSampleAt < Tuning::SampleMs) return;
  lastSampleAt = now;

  lastRaw = analogRead(Pins::HallAnalog);
  const int deviation = abs(lastRaw - restLevel);
  if (hallMonitor && now - lastMonitorAt >= 100) {
    lastMonitorAt = now;
    Serial.printf("ATLAS_HALL raw=%d rest=%d dev=%d state=%s\n", lastRaw, restLevel, deviation, drawName());
  }
  switch (draw) {
    case Draw::Rest:
      if (deviation >= Tuning::DrawStartCounts) {
        draw = Draw::Drawing;
        emit("DRAW_START", now, deviation);
        setStatus(12, 8, 0);
      }
      break;
    case Draw::Drawing:
      if (deviation >= Tuning::DrawReadyCounts) {
        draw = Draw::Ready;
        emit("DRAW_READY", now, deviation);
        setStatus(30, 18, 0);
      } else if (deviation < Tuning::DrawStartCounts) {
        draw = Draw::Rest;  // let down before READY: no shot
        setStatus(0, 0, 12);
      }
      break;
    case Draw::Ready:
      if (deviation < Tuning::DrawStartCounts) {
        draw = Draw::Rest;
        if (now - lastFireAt >= Tuning::RefireLockMs) {
          lastFireAt = now;
          shotId = shotId == 255 ? 1 : shotId + 1;
          emit("FIRE", now, deviation);
          setStatus(0, 30, 30);
          sendPacket(Tuning::ShooterAddress, shotId);
          setStatus(0, 0, 12);
        }
      }
      break;
  }
}

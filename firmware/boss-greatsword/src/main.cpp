// Dark Knight greatsword (Boss) — bench firmware for the shared MKE-K01 ESP32-S3 core.
// Primary trigger + swing -> SWEEP; both triggers + swing (two-handed) -> SLAM;
// secondary tap alone -> MARK; both triggers held still for 1.5 s -> PHASE_SKILL.
// The game decides whether PHASE_SKILL is charged. The three-zone armour runs its own
// firmware (firmware/impact-armour); this blade never calculates damage.
// Prints contract-v1 PLAYER_INTENT lines over USB serial; Unity decides every outcome.
#include <Adafruit_MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <Wire.h>

namespace Pins {
constexpr uint8_t Sda = 1;
constexpr uint8_t Scl = 2;
constexpr uint8_t PrimaryTrigger = 10;    // upper grip
constexpr uint8_t SecondaryTrigger = 11;  // lower grip / pommel hand
constexpr uint8_t BladeLed = 12;
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t ImuSampleMs = 10;
constexpr uint32_t SwingMaxMs = 320;
constexpr uint32_t SweepCooldownMs = 1500;
constexpr uint32_t SlamCooldownMs = 3000;
constexpr uint32_t MarkTapMs = 300;         // a secondary press shorter than this is a MARK
constexpr uint32_t MarkCooldownMs = 1000;
constexpr uint32_t PhaseHoldMs = 1500;      // both triggers held still this long
constexpr uint32_t PhaseCooldownMs = 3000;
constexpr uint32_t FeedbackMs = 180;
}

namespace Thresholds {
constexpr float SwingStartMs2 = 17.0f;  // a long two-handed blade needs a deliberate swing
constexpr float SwingEndMs2 = 12.0f;
}

struct Button {
  uint8_t pin;
  bool stable;
  bool reading;
  uint32_t changedAt;
  uint32_t pressedAt;
};

struct Cooldown {
  uint32_t ms;
  uint32_t lastAt;
  bool used;
};

Adafruit_MPU6050 imu;
Adafruit_NeoPixel blade(40, Pins::BladeLed, NEO_GRB + NEO_KHZ800);
Button primary{Pins::PrimaryTrigger, HIGH, HIGH, 0, 0};
Button secondary{Pins::SecondaryTrigger, HIGH, HIGH, 0, 0};
Cooldown sweepCooldown{Timing::SweepCooldownMs, 0, false};
Cooldown slamCooldown{Timing::SlamCooldownMs, 0, false};
Cooldown markCooldown{Timing::MarkCooldownMs, 0, false};
Cooldown phaseCooldown{Timing::PhaseCooldownMs, 0, false};
uint32_t sequenceNumber = 0;
uint32_t feedbackUntil = 0;
uint32_t lastImuAt = 0;
uint32_t bothHeldSince = 0;
bool imuReady = false;
bool swinging = false;
bool swingTwoHanded = false;
bool secondaryTainted = false;  // this secondary press was part of a two-handed move
bool phaseSent = false;
uint32_t swingStartedAt = 0;

void setBlade(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < blade.numPixels(); pixel++) blade.setPixelColor(pixel, blade.Color(red, green, blue));
  blade.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"boss-greatsword-01\",\"role\":\"BOSS\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action, static_cast<unsigned long>(now));
}

void emitLocalReject(const char *action, uint32_t remainingMs) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"boss-greatsword-01\",\"type\":\"LOCAL_REJECT\",\"action\":\"%s\","
      "\"reason\":\"COOLDOWN\",\"remainingMs\":%lu}\n",
      action, static_cast<unsigned long>(remainingMs));
}

bool take(Cooldown &cooldown, const char *action, uint32_t now) {
  if (cooldown.used && now - cooldown.lastAt < cooldown.ms) {
    emitLocalReject(action, cooldown.ms - (now - cooldown.lastAt));
    return false;
  }
  cooldown.used = true;
  cooldown.lastAt = now;
  return true;
}

int8_t updateButton(Button &button, uint32_t now) {
  const bool reading = digitalRead(button.pin);
  if (reading != button.reading) {
    button.reading = reading;
    button.changedAt = now;
  }
  if (now - button.changedAt < Timing::DebounceMs || reading == button.stable) return 0;
  button.stable = reading;
  if (button.stable == LOW) button.pressedAt = now;
  return button.stable == LOW ? 1 : -1;
}

void acknowledge(uint32_t now, uint8_t red, uint8_t green, uint8_t blue) {
  setBlade(red, green, blue);
  feedbackUntil = now + Timing::FeedbackMs;
}

void finishSwing(uint32_t now) {
  swinging = false;
  if (swingTwoHanded) {
    if (take(slamCooldown, "SLAM", now)) {
      emitEvent("SLAM", now);
      acknowledge(now, 200, 20, 10);
    }
  } else if (take(sweepCooldown, "SWEEP", now)) {
    emitEvent("SWEEP", now);
    acknowledge(now, 160, 40, 30);
  }
}

void updateSwing(uint32_t now) {
  if (!imuReady || now - lastImuAt < Timing::ImuSampleMs) return;
  lastImuAt = now;
  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temperature;
  imu.getEvent(&acceleration, &gyro, &temperature);
  const float magnitude = sqrtf(
      acceleration.acceleration.x * acceleration.acceleration.x +
      acceleration.acceleration.y * acceleration.acceleration.y +
      acceleration.acceleration.z * acceleration.acceleration.z);

  if (!swinging) {
    if (primary.stable == LOW && magnitude >= Thresholds::SwingStartMs2) {
      swinging = true;
      swingTwoHanded = secondary.stable == LOW;
      swingStartedAt = now;
      bothHeldSince = 0;  // a swing cancels the phase-skill charge pose
    }
    return;
  }
  if (magnitude < Thresholds::SwingEndMs2 || now - swingStartedAt >= Timing::SwingMaxMs) finishSwing(now);
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::PrimaryTrigger, INPUT_PULLUP);
  pinMode(Pins::SecondaryTrigger, INPUT_PULLUP);
  blade.begin();
  blade.setBrightness(64);
  setBlade(24, 4, 4);

  Wire.begin(Pins::Sda, Pins::Scl);
  imuReady = imu.begin();
  if (imuReady) {
    imu.setAccelerometerRange(MPU6050_RANGE_8_G);
    imu.setGyroRange(MPU6050_RANGE_500_DEG);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  // Without the IMU a primary press alone sends SWEEP so the bench proof still runs.
  Serial.printf("ATLAS_PROP_READY v1 boss-greatsword-01 imu=%s\n", imuReady ? "ready" : "missing(primary=SWEEP)");
}

void loop() {
  const uint32_t now = millis();
  const int8_t primaryEdge = updateButton(primary, now);
  const int8_t secondaryEdge = updateButton(secondary, now);

  if (!imuReady && primaryEdge == 1 && secondary.stable == HIGH && take(sweepCooldown, "SWEEP", now)) {
    emitEvent("SWEEP", now);
    acknowledge(now, 160, 40, 30);
  }
  if (secondaryEdge == 1) secondaryTainted = false;
  if (secondary.stable == LOW && (primary.stable == LOW || swinging)) secondaryTainted = true;
  if (secondaryEdge == -1 && !secondaryTainted &&
      now - secondary.pressedAt < Timing::MarkTapMs && take(markCooldown, "MARK", now)) {
    emitEvent("MARK", now);
    acknowledge(now, 120, 0, 60);
  }

  updateSwing(now);

  // PHASE_SKILL: both triggers held still (no swing) for PhaseHoldMs, once per hold.
  const bool bothHeld = primary.stable == LOW && secondary.stable == LOW;
  if (!bothHeld) {
    bothHeldSince = 0;
    phaseSent = false;
  } else if (!swinging && !phaseSent) {
    if (!bothHeldSince) bothHeldSince = now ? now : 1;
    if (now - bothHeldSince >= Timing::PhaseHoldMs) {
      phaseSent = true;
      if (take(phaseCooldown, "PHASE_SKILL", now)) {
        emitEvent("PHASE_SKILL", now);
        acknowledge(now, 140, 40, 220);
      }
    }
  }

  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    setBlade(24, 4, 4);
  }
  delay(2);
}

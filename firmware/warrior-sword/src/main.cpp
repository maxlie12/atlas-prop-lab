// Pulse Sword (Warrior, reserve kit) — bench firmware for the shared MKE-K01 ESP32-S3 core.
// The index trigger gates swings measured by the guard IMU: a swing -> STRIKE, a hard swing ->
// HEAVY_STRIKE; a quick trigger tap without a swing -> PARRY. The game side for these actions
// is still planned (docs/unity-bridge.md); the lines are already contract-v1 exact.
#include <Adafruit_MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <Wire.h>

namespace Pins {
constexpr uint8_t Sda = 1;
constexpr uint8_t Scl = 2;
constexpr uint8_t IndexTrigger = 10;
constexpr uint8_t LedSpine = 12;
constexpr uint8_t VibrationDriver = 13;  // transistor/MOSFET input, never a bare motor
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t ImuSampleMs = 10;
constexpr uint32_t SwingMaxMs = 260;
constexpr uint32_t StrikeLockMs = 300;
constexpr uint32_t HeavyCooldownMs = 4000;
constexpr uint32_t ParryTapMs = 250;
constexpr uint32_t ParryCooldownMs = 2000;
constexpr uint32_t FeedbackMs = 140;
}

namespace Thresholds {
constexpr float SwingStartMs2 = 16.0f;  // |a| including gravity that starts a swing (~1.6 g)
constexpr float SwingEndMs2 = 12.0f;
constexpr float HeavyPeakMs2 = 26.0f;
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
Adafruit_NeoPixel spine(24, Pins::LedSpine, NEO_GRB + NEO_KHZ800);
Button trigger{Pins::IndexTrigger, HIGH, HIGH, 0, 0};
Cooldown strikeLock{Timing::StrikeLockMs, 0, false};
Cooldown heavyCooldown{Timing::HeavyCooldownMs, 0, false};
Cooldown parryCooldown{Timing::ParryCooldownMs, 0, false};
uint32_t sequenceNumber = 0;
uint32_t feedbackUntil = 0;
uint32_t lastImuAt = 0;
bool imuReady = false;
bool swinging = false;
bool swungThisPress = false;
float swingPeak = 0;
uint32_t swingStartedAt = 0;

void setSpine(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < spine.numPixels(); pixel++) spine.setPixelColor(pixel, spine.Color(red, green, blue));
  spine.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"warrior-sword-01\",\"role\":\"WARRIOR\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action, static_cast<unsigned long>(now));
}

void emitLocalReject(const char *action, uint32_t remainingMs) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"warrior-sword-01\",\"type\":\"LOCAL_REJECT\",\"action\":\"%s\","
      "\"reason\":\"COOLDOWN\",\"remainingMs\":%lu}\n",
      action, static_cast<unsigned long>(remainingMs));
}

bool take(Cooldown &cooldown, const char *action, uint32_t now, bool reportReject) {
  if (cooldown.used && now - cooldown.lastAt < cooldown.ms) {
    if (reportReject) emitLocalReject(action, cooldown.ms - (now - cooldown.lastAt));
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
  setSpine(red, green, blue);
  digitalWrite(Pins::VibrationDriver, HIGH);
  feedbackUntil = now + Timing::FeedbackMs;
}

void finishSwing(uint32_t now) {
  swinging = false;
  if (swingPeak >= Thresholds::HeavyPeakMs2) {
    if (take(heavyCooldown, "HEAVY_STRIKE", now, true)) {
      emitEvent("HEAVY_STRIKE", now);
      acknowledge(now, 60, 110, 255);
    }
  } else if (take(strikeLock, "STRIKE", now, false)) {
    emitEvent("STRIKE", now);
    acknowledge(now, 30, 60, 160);
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
    if (trigger.stable == LOW && magnitude >= Thresholds::SwingStartMs2) {
      swinging = true;
      swungThisPress = true;
      swingPeak = magnitude;
      swingStartedAt = now;
    }
    return;
  }
  if (magnitude > swingPeak) swingPeak = magnitude;
  if (magnitude < Thresholds::SwingEndMs2 || now - swingStartedAt >= Timing::SwingMaxMs) finishSwing(now);
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::IndexTrigger, INPUT_PULLUP);
  pinMode(Pins::VibrationDriver, OUTPUT);
  digitalWrite(Pins::VibrationDriver, LOW);
  spine.begin();
  spine.setBrightness(56);
  setSpine(6, 12, 30);

  Wire.begin(Pins::Sda, Pins::Scl);
  imuReady = imu.begin();
  if (imuReady) {
    imu.setAccelerometerRange(MPU6050_RANGE_8_G);
    imu.setGyroRange(MPU6050_RANGE_500_DEG);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  Serial.printf("ATLAS_PROP_READY v1 warrior-sword-01 imu=%s\n", imuReady ? "ready" : "missing(trigger=STRIKE)");
}

void loop() {
  const uint32_t now = millis();
  const int8_t edge = updateButton(trigger, now);
  if (edge == 1) {
    swungThisPress = false;
    if (!imuReady && take(strikeLock, "STRIKE", now, false)) {
      emitEvent("STRIKE", now);
      acknowledge(now, 30, 60, 160);
    }
  }
  if (edge == -1) {
    if (swinging) finishSwing(now);
    else if (imuReady && !swungThisPress && now - trigger.pressedAt < Timing::ParryTapMs && take(parryCooldown, "PARRY", now, true)) {
      emitEvent("PARRY", now);
      acknowledge(now, 120, 120, 120);
    }
  }
  updateSwing(now);

  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    digitalWrite(Pins::VibrationDriver, LOW);
    setSpine(6, 12, 30);
  }
  delay(2);
}

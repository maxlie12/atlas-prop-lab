// Shade Daggers (Assassin) — bench firmware for the shared MKE-K01 ESP32-S3 core.
// The active dagger's grip trigger gates stabs measured by its guard IMU:
// a stab -> QUICK_STRIKE, a hard lunge -> HEAVY_STRIKE (the game dashes first).
// The wrist button -> PLACE_TRAP. The off-hand dagger is passive foam with no electronics.
// Prints contract-v1 PLAYER_INTENT lines over USB serial; Unity decides every outcome.
#include <Adafruit_MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <Wire.h>

namespace Pins {
constexpr uint8_t Sda = 1;
constexpr uint8_t Scl = 2;
constexpr uint8_t GripTrigger = 10;
constexpr uint8_t TrapButton = 11;  // wrist pad, separate from the dagger
constexpr uint8_t StatusLed = 12;
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t ImuSampleMs = 10;
constexpr uint32_t SwingMaxMs = 220;          // a stab is classified at its end or after this
constexpr uint32_t QuickLockMs = 250;         // one stab, one event
constexpr uint32_t HeavyCooldownMs = 4000;    // dash cooldown; the game keeps its own
constexpr uint32_t TrapCooldownMs = 8000;
constexpr uint32_t FeedbackMs = 120;
}

namespace Thresholds {
constexpr float StabStartMs2 = 15.0f;  // |a| including gravity that starts a stab (~1.5 g)
constexpr float StabEndMs2 = 11.0f;    // hysteresis
constexpr float HeavyPeakMs2 = 24.0f;  // peak that turns a stab into a dash strike
}

struct Button {
  uint8_t pin;
  bool stable;
  bool reading;
  uint32_t changedAt;
};

struct Cooldown {
  uint32_t ms;
  uint32_t lastAt;
  bool used;
};

Adafruit_MPU6050 imu;
Adafruit_NeoPixel status(4, Pins::StatusLed, NEO_GRB + NEO_KHZ800);
Button grip{Pins::GripTrigger, HIGH, HIGH, 0};
Button trap{Pins::TrapButton, HIGH, HIGH, 0};
Cooldown quickLock{Timing::QuickLockMs, 0, false};
Cooldown heavyCooldown{Timing::HeavyCooldownMs, 0, false};
Cooldown trapCooldown{Timing::TrapCooldownMs, 0, false};
uint32_t sequenceNumber = 0;
uint32_t feedbackUntil = 0;
uint32_t lastImuAt = 0;
bool imuReady = false;
bool stabbing = false;
float stabPeak = 0;
uint32_t stabStartedAt = 0;

void setStatus(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < status.numPixels(); pixel++) status.setPixelColor(pixel, status.Color(red, green, blue));
  status.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"assassin-daggers-01\",\"role\":\"ASSASSIN\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action, static_cast<unsigned long>(now));
}

void emitLocalReject(const char *action, uint32_t remainingMs) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"assassin-daggers-01\",\"type\":\"LOCAL_REJECT\",\"action\":\"%s\","
      "\"reason\":\"COOLDOWN\",\"remainingMs\":%lu}\n",
      action, static_cast<unsigned long>(remainingMs));
}

// Local cooldowns only stop accidental spam; LOCAL_REJECT is diagnostic and never gameplay.
bool take(Cooldown &cooldown, const char *action, uint32_t now, bool reportReject) {
  if (cooldown.used && now - cooldown.lastAt < cooldown.ms) {
    if (reportReject) emitLocalReject(action, cooldown.ms - (now - cooldown.lastAt));
    return false;
  }
  cooldown.used = true;
  cooldown.lastAt = now;
  return true;
}

// Returns +1 on a debounced press (LOW), -1 on release, 0 otherwise.
int8_t updateButton(Button &button, uint32_t now) {
  const bool reading = digitalRead(button.pin);
  if (reading != button.reading) {
    button.reading = reading;
    button.changedAt = now;
  }
  if (now - button.changedAt < Timing::DebounceMs || reading == button.stable) return 0;
  button.stable = reading;
  return button.stable == LOW ? 1 : -1;
}

void acknowledge(uint32_t now, uint8_t red, uint8_t green, uint8_t blue) {
  setStatus(red, green, blue);
  feedbackUntil = now + Timing::FeedbackMs;
}

void classifyStab(uint32_t now) {
  const bool heavy = stabPeak >= Thresholds::HeavyPeakMs2;
  stabbing = false;
  if (heavy) {
    if (take(heavyCooldown, "HEAVY_STRIKE", now, true)) {
      emitEvent("HEAVY_STRIKE", now);
      acknowledge(now, 90, 50, 180);
    }
    return;
  }
  if (take(quickLock, "QUICK_STRIKE", now, false)) {
    emitEvent("QUICK_STRIKE", now);
    acknowledge(now, 50, 30, 120);
  }
}

void updateStab(uint32_t now) {
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

  if (!stabbing) {
    if (grip.stable == LOW && magnitude >= Thresholds::StabStartMs2) {
      stabbing = true;
      stabPeak = magnitude;
      stabStartedAt = now;
    }
    return;
  }
  if (magnitude > stabPeak) stabPeak = magnitude;
  if (magnitude < Thresholds::StabEndMs2 || now - stabStartedAt >= Timing::SwingMaxMs) classifyStab(now);
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::GripTrigger, INPUT_PULLUP);
  pinMode(Pins::TrapButton, INPUT_PULLUP);
  status.begin();
  status.setBrightness(48);
  setStatus(10, 6, 24);

  Wire.begin(Pins::Sda, Pins::Scl);
  imuReady = imu.begin();
  if (imuReady) {
    imu.setAccelerometerRange(MPU6050_RANGE_8_G);
    imu.setGyroRange(MPU6050_RANGE_500_DEG);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  // Without the IMU the grip trigger alone sends QUICK_STRIKE so the bench proof still runs.
  Serial.printf("ATLAS_PROP_READY v1 assassin-daggers-01 imu=%s\n", imuReady ? "ready" : "missing(grip=QUICK_STRIKE)");
}

void loop() {
  const uint32_t now = millis();
  const int8_t gripEdge = updateButton(grip, now);
  if (!imuReady && gripEdge == 1 && take(quickLock, "QUICK_STRIKE", now, false)) {
    emitEvent("QUICK_STRIKE", now);
    acknowledge(now, 50, 30, 120);
  }
  if (gripEdge == -1 && stabbing) classifyStab(now);
  updateStab(now);

  if (updateButton(trap, now) == 1 && take(trapCooldown, "PLACE_TRAP", now, true)) {
    emitEvent("PLACE_TRAP", now);
    acknowledge(now, 120, 20, 160);
  }

  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    setStatus(10, 6, 24);
  }
  delay(2);
}

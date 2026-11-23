// Lumen Staff (Mage) — bench firmware for the shared MKE-K01 ESP32-S3 core.
// CAST tap -> CAST_HEAL, CAST hold -> CHANNEL (staff bolt), SPECIAL -> TEAM_SHIELD.
// The IMU is mounted for later gesture tuning; the first bench proof uses the two buttons.
// Prints contract-v1 PLAYER_INTENT lines over USB serial; Unity decides every outcome.
#include <Adafruit_MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <Wire.h>

namespace Pins {
constexpr uint8_t Sda = 1;
constexpr uint8_t Scl = 2;
constexpr uint8_t CastButton = 10;
constexpr uint8_t SpecialButton = 11;
constexpr uint8_t OrbLed = 12;
constexpr uint8_t VibrationDriver = 13;  // transistor/MOSFET input, never a bare motor
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t ChannelHoldMs = 600;       // CAST held this long becomes CHANNEL, not a heal
constexpr uint32_t HealCooldownMs = 4000;     // matches the game's heal cooldown
constexpr uint32_t ChannelLockMs = 1200;
constexpr uint32_t ShieldCooldownMs = 14000;  // matches the game's team-shield cooldown
constexpr uint32_t FeedbackMs = 160;
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
Adafruit_NeoPixel orb(12, Pins::OrbLed, NEO_GRB + NEO_KHZ800);
Button cast{Pins::CastButton, HIGH, HIGH, 0, 0};
Button special{Pins::SpecialButton, HIGH, HIGH, 0, 0};
Cooldown healCooldown{Timing::HealCooldownMs, 0, false};
Cooldown channelLock{Timing::ChannelLockMs, 0, false};
Cooldown shieldCooldown{Timing::ShieldCooldownMs, 0, false};
uint32_t sequenceNumber = 0;
uint32_t feedbackUntil = 0;
bool channelSent = false;
bool imuReady = false;

void setOrb(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < orb.numPixels(); pixel++) orb.setPixelColor(pixel, orb.Color(red, green, blue));
  orb.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"mage-staff-01\",\"role\":\"MAGE\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action, static_cast<unsigned long>(now));
}

void emitLocalReject(const char *action, uint32_t remainingMs) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"mage-staff-01\",\"type\":\"LOCAL_REJECT\",\"action\":\"%s\","
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
  setOrb(red, green, blue);
  digitalWrite(Pins::VibrationDriver, HIGH);
  feedbackUntil = now + Timing::FeedbackMs;
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::CastButton, INPUT_PULLUP);
  pinMode(Pins::SpecialButton, INPUT_PULLUP);
  pinMode(Pins::VibrationDriver, OUTPUT);
  digitalWrite(Pins::VibrationDriver, LOW);
  orb.begin();
  orb.setBrightness(56);
  setOrb(6, 28, 18);

  Wire.begin(Pins::Sda, Pins::Scl);
  imuReady = imu.begin();
  if (imuReady) {
    imu.setAccelerometerRange(MPU6050_RANGE_4_G);
    imu.setGyroRange(MPU6050_RANGE_500_DEG);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  Serial.printf("ATLAS_PROP_READY v1 mage-staff-01 imu=%s\n", imuReady ? "ready" : "missing");
}

void loop() {
  const uint32_t now = millis();

  const int8_t castEdge = updateButton(cast, now);
  if (castEdge == 1) channelSent = false;
  if (cast.stable == LOW && !channelSent && now - cast.pressedAt >= Timing::ChannelHoldMs) {
    channelSent = true;  // one CHANNEL per hold
    if (take(channelLock, "CHANNEL", now)) {
      emitEvent("CHANNEL", now);
      acknowledge(now, 20, 90, 120);
    }
  }
  if (castEdge == -1 && !channelSent && take(healCooldown, "CAST_HEAL", now)) {
    emitEvent("CAST_HEAL", now);
    acknowledge(now, 30, 140, 70);
  }

  if (updateButton(special, now) == 1 && take(shieldCooldown, "TEAM_SHIELD", now)) {
    emitEvent("TEAM_SHIELD", now);
    acknowledge(now, 90, 160, 220);
  }

  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    digitalWrite(Pins::VibrationDriver, LOW);
    setOrb(6, 28, 18);
  }
  delay(2);
}

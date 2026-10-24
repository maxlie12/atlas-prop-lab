#include <Adafruit_MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <Wire.h>

namespace Pins {
constexpr uint8_t Sda = 20;
constexpr uint8_t Scl = 21;
constexpr uint8_t Trigger = 25;
constexpr uint8_t LedRim = 18;
constexpr uint8_t VibrationDriver = 27; // transistor/MOSFET input, never a bare motor
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t TauntCooldownMs = 2500;
constexpr uint32_t FeedbackMs = 140;
}

namespace Thresholds {
constexpr float TauntAccelerationMs2 = 18.0f;
}

Adafruit_MPU6050 imu;
Adafruit_NeoPixel rim(30, Pins::LedRim, NEO_GRB + NEO_KHZ800);

bool triggerStable = HIGH;
bool triggerReading = HIGH;
uint32_t triggerChangedAt = 0;
uint32_t lastTauntAt = 0;
uint32_t feedbackUntil = 0;
uint32_t sequenceNumber = 0;
bool imuReady = false;

void setRim(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < rim.numPixels(); pixel++) {
    rim.setPixelColor(pixel, rim.Color(red, green, blue));
  }
  rim.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"guardian-shield-01\",\"role\":\"GUARDIAN\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action,
      static_cast<unsigned long>(now));
}

void acknowledge(uint32_t now, uint8_t red, uint8_t green, uint8_t blue) {
  setRim(red, green, blue);
  digitalWrite(Pins::VibrationDriver, HIGH);
  feedbackUntil = now + Timing::FeedbackMs;
}

void updateTrigger(uint32_t now) {
  const bool reading = digitalRead(Pins::Trigger);
  if (reading != triggerReading) {
    triggerReading = reading;
    triggerChangedAt = now;
  }
  if (now - triggerChangedAt < Timing::DebounceMs || reading == triggerStable) return;

  triggerStable = reading;
  if (triggerStable == LOW) {
    emitEvent("BLOCK_START", now);
    acknowledge(now, 145, 82, 4);
  } else {
    emitEvent("BLOCK_END", now);
    acknowledge(now, 20, 70, 95);
  }
}

void updateTaunt(uint32_t now) {
  if (!imuReady || triggerStable == LOW || now - lastTauntAt < Timing::TauntCooldownMs) return;
  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temperature;
  imu.getEvent(&acceleration, &gyro, &temperature);
  const float magnitude = sqrtf(
      acceleration.acceleration.x * acceleration.acceleration.x +
      acceleration.acceleration.y * acceleration.acceleration.y +
      acceleration.acceleration.z * acceleration.acceleration.z);
  if (magnitude < Thresholds::TauntAccelerationMs2) return;

  lastTauntAt = now;
  emitEvent("TAUNT", now);
  acknowledge(now, 150, 25, 18);
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::Trigger, INPUT_PULLUP);
  pinMode(Pins::VibrationDriver, OUTPUT);
  digitalWrite(Pins::VibrationDriver, LOW);

  rim.begin();
  rim.setBrightness(64);
  setRim(18, 28, 4);

  Wire.begin(Pins::Sda, Pins::Scl);
  imuReady = imu.begin();
  if (imuReady) {
    imu.setAccelerometerRange(MPU6050_RANGE_8_G);
    imu.setGyroRange(MPU6050_RANGE_500_DEG);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  Serial.printf("ATLAS_PROP_READY v1 guardian-shield-01 imu=%s\n", imuReady ? "ready" : "missing");
}

void loop() {
  const uint32_t now = millis();
  updateTrigger(now);
  updateTaunt(now);

  if (feedbackUntil && now >= feedbackUntil) {
    feedbackUntil = 0;
    digitalWrite(Pins::VibrationDriver, LOW);
    setRim(triggerStable == LOW ? 70 : 18, triggerStable == LOW ? 40 : 28, 4);
  }
  delay(4);
}


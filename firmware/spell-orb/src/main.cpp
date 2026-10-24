#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

namespace Pins {
constexpr uint8_t CastButton = 25;
constexpr uint8_t SpecialButton = 26;
constexpr uint8_t LedRing = 18;
constexpr uint8_t Buzzer = 27;
}

namespace Timing {
constexpr uint32_t DebounceMs = 35;
constexpr uint32_t CastCooldownMs = 700;
constexpr uint32_t SpecialCooldownMs = 4000;
}

struct ButtonState {
  explicit ButtonState(uint8_t buttonPin) : pin(buttonPin) {}

  uint8_t pin;
  bool stable = HIGH;
  bool previousReading = HIGH;
  uint32_t changedAt = 0;
};

Adafruit_NeoPixel ring(16, Pins::LedRing, NEO_GRB + NEO_KHZ800);
ButtonState castButton{Pins::CastButton};
ButtonState specialButton{Pins::SpecialButton};

uint32_t sequenceNumber = 0;
uint32_t lastCastAt = 0;
uint32_t lastSpecialAt = 0;

void setRing(uint8_t red, uint8_t green, uint8_t blue) {
  for (uint16_t pixel = 0; pixel < ring.numPixels(); pixel++) {
    ring.setPixelColor(pixel, ring.Color(red, green, blue));
  }
  ring.show();
}

void emitEvent(const char *action, uint32_t now) {
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"hero-orb-01\",\"role\":\"ARCHER\","
      "\"seq\":%lu,\"type\":\"PLAYER_INTENT\",\"action\":\"%s\",\"atMs\":%lu}\n",
      static_cast<unsigned long>(++sequenceNumber), action,
      static_cast<unsigned long>(now));
}

void acceptAction(const char *action, uint32_t now, bool special) {
  if (special) {
    setRing(88, 30, 160);
    tone(Pins::Buzzer, 880, 180);
  } else {
    setRing(15, 95, 150);
    tone(Pins::Buzzer, 660, 90);
  }
  emitEvent(action, now);
}

void rejectCooldown(const char *action, uint32_t remainingMs) {
  setRing(120, 12, 8);
  tone(Pins::Buzzer, 180, 80);
  Serial.printf(
      "{\"v\":1,\"deviceId\":\"hero-orb-01\",\"type\":\"LOCAL_REJECT\","
      "\"action\":\"%s\",\"reason\":\"COOLDOWN\",\"remainingMs\":%lu}\n",
      action, static_cast<unsigned long>(remainingMs));
}

bool pressed(ButtonState &button, uint32_t now) {
  const bool reading = digitalRead(button.pin);
  if (reading != button.previousReading) {
    button.changedAt = now;
    button.previousReading = reading;
  }

  if (now - button.changedAt >= Timing::DebounceMs && reading != button.stable) {
    button.stable = reading;
    return button.stable == LOW;
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  pinMode(Pins::CastButton, INPUT_PULLUP);
  pinMode(Pins::SpecialButton, INPUT_PULLUP);
  pinMode(Pins::Buzzer, OUTPUT);

  ring.begin();
  ring.setBrightness(80);
  setRing(0, 35, 18);

  Serial.println("ATLAS_PROP_READY v1 hero-orb-01");
}

void loop() {
  const uint32_t now = millis();

  if (pressed(castButton, now)) {
    const uint32_t elapsed = now - lastCastAt;
    if (lastCastAt == 0 || elapsed >= Timing::CastCooldownMs) {
      lastCastAt = now;
      acceptAction("CAST", now, false);
    } else {
      rejectCooldown("CAST", Timing::CastCooldownMs - elapsed);
    }
  }

  if (pressed(specialButton, now)) {
    const uint32_t elapsed = now - lastSpecialAt;
    if (lastSpecialAt == 0 || elapsed >= Timing::SpecialCooldownMs) {
      lastSpecialAt = now;
      acceptAction("SPECIAL", now, true);
    } else {
      rejectCooldown("SPECIAL", Timing::SpecialCooldownMs - elapsed);
    }
  }

  if (now - lastCastAt > 220 && now - lastSpecialAt > 220) {
    setRing(0, 20, 10);
  }

  delay(2);
}

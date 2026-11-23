// Host-side Arduino stand-in for firmware logic tests (not used by PlatformIO builds).
// It models pins, a controllable millis() clock and Serial.printf so a role firmware's
// setup()/loop() can run on a PC and its contract lines can be asserted.
#pragma once
#include <cmath>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <map>
#include <string>
#include <vector>

#define HIGH 1
#define LOW 0
#define INPUT 0x01
#define OUTPUT 0x03
#define INPUT_PULLUP 0x05

namespace mock {
inline uint32_t &clock() { static uint32_t value = 0; return value; }
inline std::map<uint8_t, int> &pins() { static std::map<uint8_t, int> value; return value; }
inline std::map<uint8_t, int> &analog() { static std::map<uint8_t, int> value; return value; }
inline std::vector<std::string> &lines() { static std::vector<std::string> value; return value; }
inline std::string &pending() { static std::string value; return value; }
inline void set(uint8_t pin, int level) { pins()[pin] = level; }
}  // namespace mock

inline uint32_t millis() { return mock::clock(); }
inline uint32_t micros() { return mock::clock() * 1000u; }
inline void delay(uint32_t ms) { mock::clock() += ms; }
inline void delayMicroseconds(uint32_t) {}
inline void pinMode(uint8_t pin, uint8_t mode) { if (mode == INPUT_PULLUP && !mock::pins().count(pin)) mock::pins()[pin] = HIGH; }
inline int digitalRead(uint8_t pin) { return mock::pins().count(pin) ? mock::pins()[pin] : HIGH; }
inline void digitalWrite(uint8_t pin, int level) { mock::pins()[pin] = level; }
inline int analogRead(uint8_t pin) { return mock::analog().count(pin) ? mock::analog()[pin] : 0; }
inline void analogReadResolution(int) {}
inline bool ledcAttach(uint8_t, uint32_t, uint8_t) { return true; }
inline void ledcWrite(uint8_t, uint32_t) {}

struct MockSerial {
  void begin(unsigned long) {}
  int printf(const char *format, ...) {
    char buffer[512];
    va_list args;
    va_start(args, format);
    const int written = vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    for (const char *c = buffer; *c; ++c) {
      if (*c == '\n') { mock::lines().push_back(mock::pending()); mock::pending().clear(); }
      else mock::pending() += *c;
    }
    return written;
  }
  void println(const char *text) { printf("%s\n", text); }
};
inline MockSerial Serial;

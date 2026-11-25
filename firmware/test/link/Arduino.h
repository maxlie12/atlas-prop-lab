// Microsecond Arduino stand-in for the Gate 01 digital twin (not used by PlatformIO builds).
// Unlike firmware/test/host/Arduino.h it keeps one µs clock, so delayMicroseconds() inside
// the Arc Bow's blocking IR packet really advances time, and receiver edges scheduled by the
// channel model fire their interrupt handlers at the exact µs they occur.
#pragma once
#include <cmath>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <deque>
#include <functional>
#include <map>
#include <string>
#include <vector>

#define HIGH 1
#define LOW 0
#define INPUT 0x01
#define OUTPUT 0x03
#define INPUT_PULLUP 0x05
#define FALLING 0x02
#define IRAM_ATTR
#define portENTER_CRITICAL(lock) ((void)(lock))
#define portEXIT_CRITICAL(lock) ((void)(lock))
#define portENTER_CRITICAL_ISR(lock) ((void)(lock))
#define portEXIT_CRITICAL_ISR(lock) ((void)(lock))
struct portMUX_TYPE {};
#define portMUX_INITIALIZER_UNLOCKED {}

namespace mock {
struct Edge {
  uint64_t atUs;
  uint8_t pin;
  int level;
};
inline uint64_t &us() { static uint64_t value = 0; return value; }
inline std::map<uint8_t, int> &pins() { static std::map<uint8_t, int> value; return value; }
inline std::map<uint8_t, int> &analog() { static std::map<uint8_t, int> value; return value; }
inline std::map<uint8_t, void (*)()> &isrs() { static std::map<uint8_t, void (*)()> value; return value; }
inline std::vector<Edge> &edges() { static std::vector<Edge> value; return value; }
// Called on every LEDC duty change: (pin, carrierOn, atUs). The channel model hooks it.
inline std::function<void(uint8_t, bool, uint64_t)> &carrierHook() {
  static std::function<void(uint8_t, bool, uint64_t)> value;
  return value;
}

inline void schedule(uint64_t atUs, uint8_t pin, int level) {
  auto &list = edges();
  auto it = list.begin();
  while (it != list.end() && it->atUs <= atUs) ++it;
  list.insert(it, Edge{atUs, pin, level});
}

// Move the clock forward, firing every scheduled edge on the way at its own timestamp.
inline void advance(uint64_t deltaUs) {
  const uint64_t target = us() + deltaUs;
  auto &list = edges();
  while (!list.empty() && list.front().atUs <= target) {
    const Edge edge = list.front();
    list.erase(list.begin());
    if (edge.atUs > us()) us() = edge.atUs;
    const int before = pins().count(edge.pin) ? pins()[edge.pin] : HIGH;
    pins()[edge.pin] = edge.level;
    if (before == HIGH && edge.level == LOW && isrs().count(edge.pin)) isrs()[edge.pin]();
  }
  us() = target;
}
}  // namespace mock

inline uint32_t millis() { return static_cast<uint32_t>(mock::us() / 1000u); }
inline uint32_t micros() { return static_cast<uint32_t>(mock::us()); }
inline void delay(uint32_t ms) { mock::advance(static_cast<uint64_t>(ms) * 1000u); }
inline void delayMicroseconds(uint32_t value) { mock::advance(value); }
inline void pinMode(uint8_t pin, uint8_t mode) { if (mode == INPUT_PULLUP && !mock::pins().count(pin)) mock::pins()[pin] = HIGH; }
inline int digitalRead(uint8_t pin) { return mock::pins().count(pin) ? mock::pins()[pin] : HIGH; }
inline void digitalWrite(uint8_t pin, int level) { mock::pins()[pin] = level; }
inline int analogRead(uint8_t pin) { return mock::analog().count(pin) ? mock::analog()[pin] : 0; }
inline void analogReadResolution(int) {}
inline uint8_t digitalPinToInterrupt(uint8_t pin) { return pin; }
inline void attachInterrupt(uint8_t pin, void (*handler)(), int) { mock::isrs()[pin] = handler; }
inline bool ledcAttach(uint8_t, uint32_t, uint8_t) { return true; }
inline void ledcWrite(uint8_t pin, uint32_t duty) {
  if (mock::carrierHook()) mock::carrierHook()(pin, duty > 0, mock::us());
}

// One serial port per device: each firmware is compiled inside its own namespace that
// declares `inline MockSerial Serial{"bow"};`, so name lookup picks the device's port.
struct SerialLine {
  std::string device;
  uint64_t atUs;
  std::string text;
};
namespace mock {
inline std::vector<SerialLine> &serialLog() { static std::vector<SerialLine> value; return value; }
}  // namespace mock

struct MockSerial {
  explicit MockSerial(const char *name) : device(name) {}
  const char *device;
  std::string pending;
  std::deque<char> input;
  void begin(unsigned long) {}
  int available() { return static_cast<int>(input.size()); }
  int read() {
    if (input.empty()) return -1;
    const char c = input.front();
    input.pop_front();
    return c;
  }
  void type(const std::string &text) { input.insert(input.end(), text.begin(), text.end()); }
  int printf(const char *format, ...) {
    char buffer[512];
    va_list args;
    va_start(args, format);
    const int written = vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    for (const char *c = buffer; *c; ++c) {
      if (*c == '\n') {
        mock::serialLog().push_back(SerialLine{device, mock::us(), pending});
        pending.clear();
      } else {
        pending += *c;
      }
    }
    return written;
  }
  void print(const char *text) { printf("%s", text); }
  void println(const char *text) { printf("%s\n", text); }
};

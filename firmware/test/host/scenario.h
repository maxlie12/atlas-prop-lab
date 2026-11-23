// Tiny scenario runner for host firmware tests: drive pins and the IMU, advance time through
// loop(), then assert which contract actions were printed. Every printed line is echoed as
// "LINE <json>" so scripts/validate-firmware-host.mjs can also check it against the contract.
#pragma once
#include <cstdio>
#include <string>
#include <vector>
#include "Adafruit_MPU6050.h"
#include "Arduino.h"

void setup();
void loop();

namespace scenario {
inline int &failures() { static int value = 0; return value; }
inline size_t &mark() { static size_t value = 0; return value; }

inline void run(uint32_t ms) {
  const uint32_t end = millis() + ms;
  while (millis() < end) loop();
}
inline void press(uint8_t pin) { mock::set(pin, LOW); }
inline void release(uint8_t pin) { mock::set(pin, HIGH); }
// A swing: acceleration magnitude at `peak` for `ms`, then back to rest (gravity only).
inline void swing(float peak, uint32_t ms) {
  mock::setAccelMagnitude(peak);
  run(ms);
  mock::setAccelMagnitude(9.81f);
  run(40);
}
inline std::string field(const std::string &line, const std::string &key) {
  const std::string token = "\"" + key + "\":\"";
  const size_t at = line.find(token);
  if (at == std::string::npos) return "";
  const size_t from = at + token.size();
  return line.substr(from, line.find('"', from) - from);
}
// Actions (PLAYER_INTENT) and local rejects (LOCAL_REJECT:<action>) printed since the last check.
inline std::vector<std::string> take() {
  std::vector<std::string> out;
  auto &lines = mock::lines();
  for (size_t i = mark(); i < lines.size(); ++i) {
    std::printf("LINE %s\n", lines[i].c_str());
    const std::string type = field(lines[i], "type");
    if (type == "PLAYER_INTENT") out.push_back(field(lines[i], "action"));
    else if (type == "LOCAL_REJECT") out.push_back("LOCAL_REJECT:" + field(lines[i], "action"));
  }
  mark() = lines.size();
  return out;
}
inline void expect(const char *name, const std::vector<std::string> &want) {
  const std::vector<std::string> got = take();
  const bool ok = got == want;
  if (!ok) failures()++;
  std::string text;
  for (const auto &item : got) text += (text.empty() ? "" : ",") + item;
  std::printf("%s %s%s%s\n", ok ? "PASS" : "FAIL", name, ok ? "" : " — got: ", ok ? "" : (text.empty() ? "(none)" : text.c_str()));
}
inline void expectBanner(const char *deviceId) {
  auto &lines = mock::lines();
  const bool ok = !lines.empty() && lines.front().rfind(std::string("ATLAS_PROP_READY v1 ") + deviceId, 0) == 0;
  if (!ok) failures()++;
  std::printf("%s READY banner names %s\n", ok ? "PASS" : "FAIL", deviceId);
  mark() = lines.size();
}
inline int finish() {
  std::printf("RESULT %s\n", failures() ? "FAIL" : "PASS");
  return failures() ? 1 : 0;
}
}  // namespace scenario

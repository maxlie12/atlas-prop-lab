// Gate 01 digital twin: the real Arc Bow and impact-armour firmware run together on one µs
// clock. The bow's LEDC carrier bursts go through a TSOP38238 timing model (falling-edge
// delay ≤ 7/f0 ≈ 184 µs, jitter, per-receiver spread) into the armour's interrupt handlers.
// Every serial line is printed as "LINE <device> <us> <text>" so
// scripts/validate-ir-link.mjs can replay them through the web bench judge.
//
// This proves the two firmwares agree on timing and framing. It does NOT prove IR range,
// ambient-light immunity, LED current or the real receiver's behaviour — only the bench does.
#include "Arduino.h"
#include <algorithm>
#include <random>

namespace bow {
inline MockSerial Serial{"bow"};
#include "../arc-bow/src/main.cpp"
}  // namespace bow

namespace armour {
inline MockSerial Serial{"armour"};
#include "../impact-armour/src/main.cpp"
}  // namespace armour

namespace twin {
std::mt19937 rng(20261125);
int failures = 0;
size_t mark = 0;

uint32_t uniform(uint32_t low, uint32_t high) { return std::uniform_int_distribution<uint32_t>(low, high)(rng); }

// ---- TSOP38238 model ------------------------------------------------------------------
// Output goes LOW a short delay after a 38 kHz burst starts and HIGH after it stops. The
// armour decodes falling-edge spacing only, so per-burst delay jitter is what matters.
struct Channel {
  std::vector<uint8_t> lit;  // receiver pins the bow is currently aimed at
  uint32_t onDelayMin = 105, onDelayMax = 184;
  bool carrier = false;
  // A copy of each burst start, so a reflection can be replayed later.
  std::vector<uint64_t> burstStarts;
  std::vector<uint64_t> burstEnds;
} channel;

void onCarrier(uint8_t pin, bool on, uint64_t atUs) {
  if (pin != bow::Pins::IrTx || on == channel.carrier) return;
  channel.carrier = on;
  (on ? channel.burstStarts : channel.burstEnds).push_back(atUs);
  for (uint8_t rx : channel.lit) {
    if (on) mock::schedule(atUs + uniform(channel.onDelayMin, channel.onDelayMax), rx, LOW);
    else mock::schedule(atUs + uniform(60, 240), rx, HIGH);
  }
}

// Schedule an arbitrary NEC frame (e.g. a TV remote) on one receiver, starting at `atUs`.
void scheduleNec(uint8_t rx, uint64_t atUs, uint8_t address, uint8_t command) {
  const uint8_t bytes[4] = {address, static_cast<uint8_t>(~address), command, static_cast<uint8_t>(~command)};
  uint64_t t = atUs;
  auto burst = [&](uint32_t markUs, uint32_t spaceUs) {
    mock::schedule(t + 150, rx, LOW);
    mock::schedule(t + markUs + 120, rx, HIGH);
    t += markUs + spaceUs;
  };
  burst(9000, 4500);
  for (uint8_t value : bytes)
    for (uint8_t bit = 0; bit < 8; bit++) burst(562, (value >> bit) & 1 ? 1687 : 562);
  burst(562, 0);
}

// Replay the last recorded packet (a reflection) on `rx`, `lagUs` after it was first sent.
void replayLastPacket(uint8_t rx, uint64_t lagUs) {
  const size_t marks = 34;  // leader + 32 bits + closing mark
  const size_t starts = channel.burstStarts.size(), ends = channel.burstEnds.size();
  for (size_t i = 0; i < marks; i++) {
    mock::schedule(channel.burstStarts[starts - marks + i] + lagUs + uniform(105, 184), rx, LOW);
    mock::schedule(channel.burstEnds[ends - marks + i] + lagUs + uniform(60, 240), rx, HIGH);
  }
}

// ---- Scheduler ----------------------------------------------------------------------------
void run(uint32_t ms) {
  const uint64_t end = mock::us() + static_cast<uint64_t>(ms) * 1000u;
  while (mock::us() < end) {
    bow::loop();
    armour::loop();
    mock::advance(250);
  }
}

constexpr int Rest = 2048;  // KY-024 AO near mid-supply at 12 bits
void hall(int value) { mock::analog()[bow::Pins::HallAnalog] = value; }

// A real draw: the magnet approaches over `rampMs`, holds, then the string snaps back.
void drawAndRelease(int deviation, uint32_t rampMs = 300, uint32_t holdMs = 200) {
  const int steps = 15;
  for (int i = 1; i <= steps; i++) {
    hall(Rest + deviation * i / steps);
    run(rampMs / steps);
  }
  run(holdMs);
  hall(Rest + deviation / 6);
  run(4);
  hall(Rest);
  run(10);
}

// ---- Assertions ---------------------------------------------------------------------------
std::string field(const std::string &line, const std::string &key) {
  const std::string quoted = "\"" + key + "\":\"";
  size_t at = line.find(quoted);
  if (at != std::string::npos) {
    const size_t from = at + quoted.size();
    return line.substr(from, line.find('"', from) - from);
  }
  const std::string bare = "\"" + key + "\":";
  at = line.find(bare);
  if (at == std::string::npos) return "";
  const size_t from = at + bare.size();
  return line.substr(from, line.find_first_of(",}", from) - from);
}

// Compact summary of new lines: "bow:FIRE#3", "armour:SHOT_SEEN#3@chest", "bow:INFO", ...
std::vector<std::string> take() {
  std::vector<std::string> out;
  auto &log = mock::serialLog();
  for (size_t i = mark; i < log.size(); ++i) {
    const auto &line = log[i];
    std::printf("LINE %s %llu %s\n", line.device.c_str(), static_cast<unsigned long long>(line.atUs), line.text.c_str());
    const std::string who = line.device + ":";
    if (line.text.rfind("ATLAS_PROP_READY", 0) == 0) out.push_back(who + "READY");
    else if (line.text.rfind("ATLAS_PROP_INFO", 0) == 0) out.push_back(who + "INFO");
    else if (line.text.rfind("ATLAS_HALL_MONITOR", 0) == 0) out.push_back(who + "MONITOR_" + line.text.substr(19));
    else if (line.text.rfind("ATLAS_HALL_REST", 0) == 0) out.push_back(who + "REST_BUSY");
    else if (line.text.rfind("ATLAS_HALL ", 0) == 0) { if (out.empty() || out.back() != who + "HALL") out.push_back(who + "HALL"); }
    else {
      const std::string type = field(line.text, "type");
      std::string item = who + (type == "PLAYER_INTENT" ? field(line.text, "action") : type);
      const std::string shot = field(line.text, "shot");
      if (!shot.empty()) item += "#" + shot;
      const std::string zone = field(line.text, "zone");
      if (!zone.empty()) item += "@" + zone;
      const std::string reason = field(line.text, "reason");
      if (!reason.empty()) item += "!" + reason;
      out.push_back(item);
    }
  }
  mark = log.size();
  return out;
}

void expect(const char *name, const std::vector<std::string> &want) {
  const std::vector<std::string> got = take();
  const bool ok = got == want;
  if (!ok) failures++;
  std::string text;
  for (const auto &item : got) text += (text.empty() ? "" : ",") + item;
  std::printf("%s %s%s%s\n", ok ? "PASS" : "FAIL", name, ok ? "" : " — got: ", ok ? "" : (text.empty() ? "(none)" : text.c_str()));
}

void check(const char *name, bool ok) {
  if (!ok) failures++;
  std::printf("%s %s\n", ok ? "PASS" : "FAIL", name);
}

std::string lastText(const char *device) {
  auto &log = mock::serialLog();
  for (auto it = log.rbegin(); it != log.rend(); ++it)
    if (it->device == device) return it->text;
  return "";
}
}  // namespace twin

using namespace twin;

int main() {
  mock::carrierHook() = onCarrier;
  hall(Rest);
  bow::setup();
  armour::setup();
  check("bow banner names archer-bow-01 and its pins", lastText("bow").rfind("ATLAS_PROP_READY v1 archer-bow-01 hall=4 ir=5 hallRest=2048", 0) == 0);
  check("armour banner names impact-armour-01 and its receivers",
        mock::serialLog().size() >= 2 && mock::serialLog()[1].text == "ATLAS_PROP_READY v1 impact-armour-01 zones=left:6,chest:7,right:8");
  take();
  run(50);

  // ---- Bench commands -------------------------------------------------------------------
  bow::Serial.type("?");
  armour::Serial.type("?");
  run(5);
  expect("'?' answers with INFO, not a reboot banner", {"bow:INFO", "armour:INFO"});
  bow::Serial.type("h");
  run(350);
  hall(Rest + 300);
  run(300);
  hall(Rest);
  run(20);
  bow::Serial.type("h");
  run(5);
  expect("'h' streams ATLAS_HALL lines until toggled off", {"bow:MONITOR_on", "bow:HALL", "bow:DRAW_START#0", "bow:HALL", "bow:MONITOR_off"});
  hall(Rest + 700);
  run(80);
  bow::Serial.type("r");
  run(5);
  hall(Rest);
  run(20);
  expect("'r' refuses while the string is drawn", {"bow:DRAW_START#0", "bow:DRAW_READY#0", "bow:REST_BUSY", "bow:FIRE#1"});
  run(300);
  take();
  hall(Rest + 120);  // magnet moved a little closer at rest
  run(20);
  bow::Serial.type("r");
  run(200);
  check("'r' at rest re-measures the rest level", lastText("bow").find("hallRest=2168") != std::string::npos);
  take();
  hall(Rest);
  run(20);
  bow::Serial.type("r");
  run(200);
  take();

  // ---- Hall draw state machine ------------------------------------------------------------
  channel.lit = {armour::Pins::ReceiverChest};
  drawAndRelease(700);
  run(150);
  expect("full draw -> DRAW_START, DRAW_READY, FIRE, and the chest sees the shot",
         {"bow:DRAW_START#1", "bow:DRAW_READY#1", "bow:FIRE#2", "armour:SHOT_SEEN#2@chest"});
  run(400);
  drawAndRelease(400);
  run(150);
  expect("partial draw then let-down sends no FIRE", {"bow:DRAW_START#2"});
  run(400);
  drawAndRelease(-700);
  run(150);
  expect("reversed magnet polarity still fires", {"bow:DRAW_START#2", "bow:DRAW_READY#2", "bow:FIRE#3", "armour:SHOT_SEEN#3@chest"});
  run(400);
  drawAndRelease(700);
  run(120);
  hall(Rest + 650);  // release bounce: the string swings back past READY
  run(20);
  hall(Rest);
  run(200);
  expect("release bounce inside the refire lock sends one FIRE only",
         {"bow:DRAW_START#3", "bow:DRAW_READY#3", "bow:FIRE#4", "armour:SHOT_SEEN#4@chest", "bow:DRAW_START#4", "bow:DRAW_READY#4"});
  run(600);

  // ---- IR link ----------------------------------------------------------------------------
  channel.lit = {armour::Pins::ReceiverLeft, armour::Pins::ReceiverChest};
  drawAndRelease(700);
  run(150);
  {
    const auto got = take();
    const bool ok = got.size() == 4 && got[2] == "bow:FIRE#5" && got[3].rfind("armour:SHOT_SEEN#5@", 0) == 0 &&
                    lastText("armour").find("\"zones\":[\"left\",\"chest\"]") != std::string::npos;
    check("one packet on two receivers is ONE shot listing both zones", ok);
  }
  run(400);

  channel.lit = {armour::Pins::ReceiverRight};
  drawAndRelease(700);
  replayLastPacket(armour::Pins::ReceiverRight, 180000);  // wall reflection 180 ms later
  run(400);
  expect("a reflection of the same shot is ignored, not counted twice",
         {"bow:DRAW_START#5", "bow:DRAW_READY#5", "bow:FIRE#6", "armour:SHOT_SEEN#6@right", "armour:DUPLICATE_IGNORED#6@right"});
  run(400);

  scheduleNec(armour::Pins::ReceiverChest, mock::us() + 1000, 0x04, 0x08);  // a TV remote
  run(200);
  expect("a non-Atlas NEC code is rejected", {"armour:HIT_REJECT@chest!INVALID_CODE"});

  channel.lit = {};
  drawAndRelease(700);
  run(400);
  expect("out of range: FIRE with no SHOT_SEEN (the bench judge scores MISS)",
         {"bow:DRAW_START#6", "bow:DRAW_READY#6", "bow:FIRE#7"});

  // Fluorescent-style noise: short random dips on every receiver, then a real shot.
  for (int i = 0; i < 300; i++) {
    const uint64_t at = mock::us() + uniform(0, 250000);
    const uint8_t rx = static_cast<uint8_t>(armour::Pins::ReceiverLeft + uniform(0, 2));
    mock::schedule(at, rx, LOW);
    mock::schedule(at + uniform(80, 600), rx, HIGH);
  }
  run(300);
  expect("random receiver noise produces no shot", {});
  channel.lit = {armour::Pins::ReceiverChest};
  drawAndRelease(700);
  run(150);
  expect("a real shot still decodes after the noise", {"bow:DRAW_START#7", "bow:DRAW_READY#7", "bow:FIRE#8", "armour:SHOT_SEEN#8@chest"});
  run(400);

  // ---- Campaign: 100 shots, random aim and timing -----------------------------------------
  std::printf("CAMPAIGN START\n");
  int fires = 0, seen = 0;
  for (int i = 0; i < 100; i++) {
    channel.lit.clear();
    for (uint8_t rx : {armour::Pins::ReceiverLeft, armour::Pins::ReceiverChest, armour::Pins::ReceiverRight})
      if (uniform(0, 2) == 0) channel.lit.push_back(rx);
    if (channel.lit.empty()) channel.lit.push_back(armour::Pins::ReceiverChest);
    drawAndRelease(static_cast<int>(uniform(650, 1400)) * (uniform(0, 1) ? 1 : -1), uniform(200, 600), uniform(80, 900));
    run(150);
    for (const auto &item : take()) {
      if (item.rfind("bow:FIRE#", 0) == 0) fires++;
      if (item.rfind("armour:SHOT_SEEN#", 0) == 0) seen++;
    }
    run(uniform(300, 1500));
    take();
  }
  std::printf("CAMPAIGN END\n");
  check("campaign: 100 draws -> 100 FIRE", fires == 100);
  check("campaign: 100 FIRE -> 100 SHOT_SEEN", seen == 100);

  std::printf("RESULT %s\n", failures ? "FAIL" : "PASS");
  return failures ? 1 : 0;
}

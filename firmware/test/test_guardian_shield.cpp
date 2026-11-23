#include "host/scenario.h"
#include "../guardian-shield/src/main.cpp"
using namespace scenario;

int main() {
  setup();
  expectBanner("guardian-shield-01");
  run(100);

  press(Pins::Trigger); run(200);
  expect("thumb trigger down -> BLOCK_START", {"BLOCK_START"});
  swing(22.0f, 40);
  expect("no TAUNT while blocking", {});
  release(Pins::Trigger); run(60);
  expect("thumb trigger up -> BLOCK_END", {"BLOCK_END"});

  run(2600);  // the shield's taunt lock also covers the first 2.5 s after boot

  swing(22.0f, 40);
  expect("shield thrust -> TAUNT", {"TAUNT"});
  swing(22.0f, 40);
  expect("second thrust inside the local cooldown sends nothing", {});
  return finish();
}

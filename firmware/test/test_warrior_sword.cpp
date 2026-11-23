#include "host/scenario.h"
#include "../warrior-sword/src/main.cpp"
using namespace scenario;

int main() {
  setup();
  expectBanner("warrior-sword-01");
  run(100);

  press(Pins::IndexTrigger); run(60);
  swing(19.0f, 70);
  expect("trigger + swing -> STRIKE", {"STRIKE"});
  run(400);
  swing(30.0f, 70);
  expect("trigger + hard swing -> HEAVY_STRIKE", {"HEAVY_STRIKE"});
  release(Pins::IndexTrigger); run(60);
  expect("releasing after a swing is not a PARRY", {});

  press(Pins::IndexTrigger); run(120); release(Pins::IndexTrigger); run(60);
  expect("quick tap without a swing -> PARRY", {"PARRY"});
  press(Pins::IndexTrigger); run(120); release(Pins::IndexTrigger); run(60);
  expect("PARRY again inside 2 s -> LOCAL_REJECT", {"LOCAL_REJECT:PARRY"});
  press(Pins::IndexTrigger); run(600); release(Pins::IndexTrigger); run(60);
  expect("a long press without a swing sends nothing", {});
  return finish();
}

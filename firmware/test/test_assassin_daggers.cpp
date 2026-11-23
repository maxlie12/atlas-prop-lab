#include "host/scenario.h"
#include "../assassin-daggers/src/main.cpp"
using namespace scenario;

int main() {
  setup();
  expectBanner("assassin-daggers-01");
  run(100);

  swing(18.0f, 60);
  expect("a stab without the grip trigger sends nothing", {});

  press(Pins::GripTrigger); run(60);
  swing(18.0f, 60);
  expect("grip + stab -> QUICK_STRIKE", {"QUICK_STRIKE"});
  run(300);
  swing(28.0f, 60);
  expect("grip + hard lunge -> HEAVY_STRIKE", {"HEAVY_STRIKE"});
  run(300);
  swing(28.0f, 60);
  expect("second lunge inside 4 s -> LOCAL_REJECT only", {"LOCAL_REJECT:HEAVY_STRIKE"});
  release(Pins::GripTrigger); run(60);

  press(Pins::TrapButton); run(60); release(Pins::TrapButton); run(60);
  expect("wrist button -> PLACE_TRAP", {"PLACE_TRAP"});
  press(Pins::TrapButton); run(60); release(Pins::TrapButton); run(60);
  expect("trap again inside 8 s -> LOCAL_REJECT", {"LOCAL_REJECT:PLACE_TRAP"});

  // Contact bounce shorter than the debounce window never fires.
  press(Pins::TrapButton); run(10); release(Pins::TrapButton); run(10); press(Pins::TrapButton); run(10); release(Pins::TrapButton); run(8100);
  expect("bounce shorter than 35 ms is ignored", {});
  return finish();
}

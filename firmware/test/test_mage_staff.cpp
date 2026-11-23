#include "host/scenario.h"
#include "../mage-staff/src/main.cpp"
using namespace scenario;

int main() {
  setup();
  expectBanner("mage-staff-01");
  run(100);

  press(Pins::CastButton); run(150); release(Pins::CastButton); run(60);
  expect("CAST tap -> CAST_HEAL on release", {"CAST_HEAL"});
  press(Pins::CastButton); run(150); release(Pins::CastButton); run(60);
  expect("second heal inside 4 s -> LOCAL_REJECT", {"LOCAL_REJECT:CAST_HEAL"});

  press(Pins::CastButton); run(800);
  expect("CAST hold -> CHANNEL once, while held", {"CHANNEL"});
  run(1500); release(Pins::CastButton); run(60);
  expect("releasing a channel does not also heal", {});

  press(Pins::SpecialButton); run(60); release(Pins::SpecialButton); run(60);
  expect("SPECIAL -> TEAM_SHIELD", {"TEAM_SHIELD"});
  run(5000);
  press(Pins::SpecialButton); run(60); release(Pins::SpecialButton); run(60);
  expect("TEAM_SHIELD again inside 14 s -> LOCAL_REJECT", {"LOCAL_REJECT:TEAM_SHIELD"});
  run(9500);
  press(Pins::SpecialButton); run(60); release(Pins::SpecialButton); run(60);
  expect("TEAM_SHIELD after 14 s is sent again", {"TEAM_SHIELD"});
  return finish();
}

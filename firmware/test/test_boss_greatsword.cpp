#include "host/scenario.h"
#include "../boss-greatsword/src/main.cpp"
using namespace scenario;

int main() {
  setup();
  expectBanner("boss-greatsword-01");
  run(100);

  swing(20.0f, 80);
  expect("a swing with no trigger sends nothing", {});

  press(Pins::PrimaryTrigger); run(60);
  swing(20.0f, 80);
  expect("primary + swing -> SWEEP", {"SWEEP"});
  release(Pins::PrimaryTrigger); run(60);

  press(Pins::PrimaryTrigger); press(Pins::SecondaryTrigger); run(60);
  swing(22.0f, 80);
  release(Pins::SecondaryTrigger); release(Pins::PrimaryTrigger); run(60);
  expect("two-handed swing -> SLAM (and no MARK on release)", {"SLAM"});

  press(Pins::SecondaryTrigger); run(120); release(Pins::SecondaryTrigger); run(60);
  expect("secondary tap alone -> MARK", {"MARK"});
  press(Pins::SecondaryTrigger); run(500); release(Pins::SecondaryTrigger); run(60);
  expect("a long secondary press is not a MARK", {});

  run(3000);
  press(Pins::PrimaryTrigger); press(Pins::SecondaryTrigger); run(1700);
  expect("both triggers held still 1.5 s -> PHASE_SKILL once", {"PHASE_SKILL"});
  run(2000); release(Pins::SecondaryTrigger); release(Pins::PrimaryTrigger); run(60);
  expect("holding longer or releasing sends nothing more", {});

  press(Pins::PrimaryTrigger); press(Pins::SecondaryTrigger); run(800);
  swing(22.0f, 80);
  run(1000);
  release(Pins::SecondaryTrigger); release(Pins::PrimaryTrigger); run(60);
  expect("a swing during the charge pose is a SLAM, not a PHASE_SKILL", {"SLAM"});
  return finish();
}

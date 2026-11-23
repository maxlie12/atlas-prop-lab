#pragma once
#include "Arduino.h"
#define NEO_GRB 0x52
#define NEO_KHZ800 0x0000
class Adafruit_NeoPixel {
 public:
  Adafruit_NeoPixel(uint16_t count, int16_t, uint16_t) : count_(count) {}
  void begin() {}
  void show() { shows++; }
  void setBrightness(uint8_t) {}
  void setPixelColor(uint16_t, uint32_t color) { last = color; }
  static uint32_t Color(uint8_t r, uint8_t g, uint8_t b) { return (uint32_t(r) << 16) | (uint32_t(g) << 8) | b; }
  uint16_t numPixels() const { return count_; }
  uint32_t last = 0;
  uint32_t shows = 0;
 private:
  uint16_t count_;
};

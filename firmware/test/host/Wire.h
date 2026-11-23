#pragma once
#include "Arduino.h"
struct TwoWire { bool begin(int = -1, int = -1) { return true; } };
inline TwoWire Wire;

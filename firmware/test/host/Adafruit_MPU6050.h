// Host stand-in for the Adafruit MPU6050 driver: tests set the acceleration the IMU reports.
#pragma once
#include "Arduino.h"

struct sensors_vec_t { float x = 0, y = 0, z = 0; };
struct sensors_event_t { sensors_vec_t acceleration; sensors_vec_t gyro; float temperature = 0; };
enum mpu6050_accel_range_t { MPU6050_RANGE_2_G, MPU6050_RANGE_4_G, MPU6050_RANGE_8_G, MPU6050_RANGE_16_G };
enum mpu6050_gyro_range_t { MPU6050_RANGE_250_DEG, MPU6050_RANGE_500_DEG, MPU6050_RANGE_1000_DEG, MPU6050_RANGE_2000_DEG };
enum mpu6050_bandwidth_t { MPU6050_BAND_260_HZ, MPU6050_BAND_184_HZ, MPU6050_BAND_94_HZ, MPU6050_BAND_44_HZ, MPU6050_BAND_21_HZ, MPU6050_BAND_10_HZ, MPU6050_BAND_5_HZ };

namespace mock {
inline bool &imuPresent() { static bool value = true; return value; }
inline sensors_vec_t &accel() { static sensors_vec_t value{0, 0, 9.81f}; return value; }
inline void setAccelMagnitude(float magnitude) { accel() = {0, 0, magnitude}; }
}  // namespace mock

class Adafruit_MPU6050 {
 public:
  bool begin() { return mock::imuPresent(); }
  void setAccelerometerRange(mpu6050_accel_range_t) {}
  void setGyroRange(mpu6050_gyro_range_t) {}
  void setFilterBandwidth(mpu6050_bandwidth_t) {}
  bool getEvent(sensors_event_t *a, sensors_event_t *g, sensors_event_t *t) {
    a->acceleration = mock::accel();
    g->gyro = {};
    t->temperature = 25;
    return true;
  }
};

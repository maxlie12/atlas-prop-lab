# Guardian electronics profile v1

## Pin contract

| ESP32-S3 pin | Device | Rule |
| --- | --- | --- |
| GPIO20 | MPU6050 SDA | 3.3 V I2C |
| GPIO21 | MPU6050 SCL | 3.3 V I2C |
| GPIO25 | Thumb trigger | `INPUT_PULLUP`; switch to GND |
| GPIO18 | WS2812B data | Real build uses level shifter and 330 Ω resistor |
| GPIO27 | Vibration driver input | Use transistor/MOSFET driver; never connect motor directly |

## Event behavior

- Trigger press after debounce: `BLOCK_START`.
- Trigger release after debounce: `BLOCK_END`.
- Acceleration above the reference threshold while not blocking: `TAUNT`, limited to once per 2.5 seconds.
- Unity remains authoritative for whether an event changes gameplay.

## Simulation boundary

The Wokwi LED on GPIO27 is only a vibration-driver proxy. The simulator does not prove motor current, transistor selection, heat, cable strain, IMU mounting, false positives or player comfort. The GY-521 and MKE-K01 physical dimensions must be measured after purchase before the service cavity is finalized.

## USB-first PASS

1. Serial prints `ATLAS_PROP_READY v1 guardian-shield-01 imu=ready`.
2. 100 trigger cycles produce one start and one end each, in order.
3. No brownout, reset or duplicate sequence number occurs.
4. Ten controlled shield raises do not produce `TAUNT`; ten deliberate sharp presentation gestures do.
5. LED feedback runs for ten minutes without unsafe heat.


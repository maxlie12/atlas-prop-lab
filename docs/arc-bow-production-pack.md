# Arc Bow — safe production reference pack

Status: **Reference**. This pack produces a powerless fit mock-up for a no-projectile game controller. It is not a functional archery bow and must not be converted into one.

## Drawing set

- `dist/downloads/arc-bow-template-900mm.svg`: 900 × 430 mm full-size silhouette, centre lines, low-tension cosmetic cord, 100 mm print check, and forbidden arrow-rest zone.
- `dist/downloads/arc-bow-riser-layout.svg`: A4 grip/riser layout with the Hall sensor, magnet slider, ESP32 cavity, cable path, removable cover and layer section.

## Starting geometry

| Item | Starting value | Must be verified by |
| --- | ---: | --- |
| Overall height | 900 mm | Full-size cardboard reach test |
| Overall width | 430 mm maximum | Venue clearance test |
| Riser / grip zone | 200 × 80 mm | Three-user hand and wrist test |
| ESP32 cavity | 110 × 58 × 28 mm | Exact board, plug and strain relief |
| Hall sensor gap | 8–25 mm calibration travel | Selected sensor and magnet on USB bench |
| Cord extension | 60 mm maximum for prototype | Force gauge; must remain unable to launch an object |
| Target mass | below 900 g | Finished mock-up scale |

## Build order

1. Print at **Actual size / 100%** with **Fit to page** disabled. Reject the print if the 100 mm bar differs by more than 1 mm.
2. Transfer the silhouette to cardboard only. Add a paper or soft elastic cord and test three users for reach and face clearance.
3. Bench-test the Hall sensor and magnet with the ESP32 over USB. Do not install a battery yet.
4. Make the body from light EVA or another non-launching foam structure. Do not use a rigid full-length limb core.
5. Put the sensor, ESP32, connectors and strain relief inside the removable central riser.
6. Install a low-tension cosmetic cord. The red zone on the drawing must remain free of an arrow rest, guide, notch or projectile geometry.
7. Calibrate `REST`, `READY` and `RELEASE` positions for three users, then run 100 draws including partial releases.

## Hard safety boundary

No arrow, bolt, dart, launcher, arrow rest, nocking point or draw-and-release projectile test. The cord exists only to move a lightweight magnet slider. If the shape can store useful projectile energy, reject and rebuild it as a softer controller.

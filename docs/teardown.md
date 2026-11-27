# Teardown mode · Chế độ tháo rời

Revision 0.15. The 3D twin of every prop can be taken apart step by step, like a teardown video,
in the order you would actually service it: what went on last comes off first. Each step lists the
real components that come out, with what to check, an estimated price and where to look for it.

Mô hình 3D của từng đạo cụ có thể tháo rời từng bước như video teardown, theo đúng thứ tự bảo trì
thật: phần lắp sau cùng ra trước. Mỗi bước liệt kê linh kiện thật được tháo ra, việc cần kiểm, giá
ước tính và chỗ tìm mua.

## Using it · Cách dùng

- Press **Tháo rời (Teardown)** on the 3D stage or in the panel below it.
- ◀ ▶ (or the arrow keys) move one step; **Tự chạy / Play** steps on its own; **Về đầu / Restart** returns to the assembled prop.
- The parts of the current step slide out along their exploded-view direction and glow; parts removed earlier stay laid out and dim; the camera flies to a close-up of what is coming out. You can still orbit and zoom.
- Click any part of the model to jump to the step that removes it.
- **Tải bảng teardown (.md)** downloads every step with its parts table, totals and the whole-prop bill of materials.
- The exploded-view slider is paused while teardown is on and comes back when you leave.

## Step order · Thứ tự tháo

| Prop | Steps after the overview |
| --- | --- |
| Arc Bow | cosmetic cord → riser cover → ESP32 core → Hall sensor + magnet → IR emitter (TSAL6200, 2N2222A, resistors, lens tube) → haptic motor → limb LEDs → foam frame |
| Aegis Shield | arm straps → rear ESP32 box → IMU → thumb button → LED rim → shield face |
| Pulse Sword | wrist loop → grip cover → ESP32 → guard IMU → trigger → spine LEDs → blade and grip |
| Shade Daggers | passive dagger → wrist trap → hilt cover → ESP32 → IMU → trigger → active dagger shell |
| Lumen Staff | padded end → grip cover → ESP32 → IMU → CAST + SPECIAL → orb and LEDs → shaft |
| Dark Knight | armour receiver box (2nd ESP32, 3 × TSOP38238) → three LED zones → bib → greatsword ESP32 → IMU → two triggers → fuller LEDs → six blade panels |

The Dark Knight is two devices (greatsword and hit armour), so it carries two ESP32 boards.

## Prices · Giá

- Unit price ranges in VND from Vietnamese component shops and Shopee searches, checked 2026-11-25, shipping excluded. They are estimates, not quotes; recheck before ordering.
- Tags: **Gate 01 · mua ngay** (already on the Gate 01 bench list), **Sau Gate 01** (buy when that prop is built), **Vỏ và đeo** (shell and wearable materials).
- Links open a Shopee search for the exact part name, not a specific shop. Check the listing against the "Kiểm tra" line on the card (for example TSOP38238, not VS1838B; 74AHCT125, not 74HC125).
- The Gate 01 purchase plan in the hardware gate keeps its own, more conservative budget ranges; the teardown shows per-unit market prices.

## Data and code · Dữ liệu và mã

- `dist/teardown-data.js`: `window.ATLAS_TEARDOWN = { catalog, props, gates, totals }`. A step is `{ id, detach: [groups], title, how, caution?, parts: [[catalogId, qty]] }`. Step 0 is the assembled overview; the last step detaches `shell`.
- A mesh group is the mesh's `userData.td` if set (for example `cover`, `emitter`, `haptic`, `armour-receiver`), otherwise its module key (`core`, `sensor`, `light`…). Set it with the `td` option of `addPart`/`linePart`/`addRivet` in `dist/three-lab.js`.
- `dist/teardown-ui.js` owns the step state and the panel and announces `atlas-teardown-change`; `dist/three-lab.js` draws it and sends `atlas-teardown-pick` when a part is clicked. The panel works without WebGL.
- `scripts/validate-teardown.mjs` builds all six models with stubs and fails if any mesh group is never removed or removed twice, if a step names a group that does not exist, or if a part lacks bilingual copy, a valid price or a Shopee link.

To add a part to a model: give the new mesh a `td` group (or use an existing module key), add a step that detaches it, and list its parts. Run `node scripts/validate-all.mjs`.

## Boundary · Giới hạn

The models are concept geometry and the parts are the planned bill of materials. Teardown shows
how the prop is meant to come apart; it is not a measurement of a built prop. Physical evidence
remains empty until the parts are bought and the Gate 01 tests are run.

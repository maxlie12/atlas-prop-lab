# CAD-style concept sheets / CAD-01

This pass adds deterministic SVG sheets to Page 1 for all six props. These are dimensioned design proposals, not AutoCAD DWG files or manufacturing-release drawings.

## Contract

- Source units: mm. Display units: cm with an accompanying mm table.
- Overall width, height and depth come from `ATLAS_PROP_MANIFESTS.dimensionsMm`.
- Front: vector silhouette. Rear: proposed core cavity, sensor marker, and Guardian straps. Side: simplified overall depth envelope, **not** a true section through internal components.
- Grid pitch: 10 mm / 1 cm. Origin: top-left corner of the outer bounding envelope; X right and Y down.
- Thick solid line: silhouette. Thin line: construction detail. Chain line: centre line. Dashed line: provisional cavity.
- SVG downloads preserve vector geometry but do not declare a physical print scale. Existing role templates remain the 1:1-print references. Never infer centimetres from screen pixels.
- Proposed core positions and cavity dimensions are not verified hardware fit. In particular, Assassin and narrow-grip layouts may need a wrist-mounted core or a different controller package after measuring the actual board.

## Not complete yet

- Dimension chains for every curve, tangent radius, hole, connector, adhesive allowance, and seam.
- True internal sections and separate layer cut files for every prop.
- Exact board and connector envelopes from delivered hardware measurements.
- Synchronized CAD and existing Three.js manufacturing geometry: the present web models are still independent concept twins.
- DXF/DWG export and tiled 1:1 templates for roles without existing templates.
- Fit, mass, electrical, thermal, and physical safety validation.

Do not describe this revision as cut-ready. Use it to mark a full-size cardboard envelope, locate the proposed electronics and find fit problems cheaply.

## Appearance asset

`dist/assets/guardian-cad-render-v1.webp` is generated with the built-in image-generation tool. Prompt: two matching front/rear studio views of a hand-buildable matte charcoal EVA Guardian shield, 50 cm diameter / 5.5 cm envelope, amber LED ring at radius 23 cm, provisional 9 × 6 cm rear service core, 2.5 cm padded straps with 15 cm centre spacing; no text or rigid spikes. AI proportions are not authoritative; all measurements must come from the vector sheets and physical verification.

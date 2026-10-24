# Product engine proof 1

This is a bounded deterministic compiler proof, not an LLM research service or manufacturing release. Existing six-role data and workflows are unchanged.

## Contract v1

`schemaVersion` is `1.0`; `id` is lowercase kebab-case; `name` has `vi` and `en`; `geometry` is currently only `rectangular-panel`. `dimensionsMm` contains finite width, height and depth in (0, 2000]. `dimensionEvidence` is `assumed` or `measured` (self-reported, not independently verified).

`parts` contains 1–50 unique IDs, VI/EN names, positive quantity, unit, evidence (`assumed`, `referenced`, `measured`) and a sources array. Source records contain an HTTPS URL, title and YYYY-MM-DD checkedAt. A referenced part requires at least one source. Source format validation is not verification of the page or claim.

`assembly` contains 1–50 ordered steps with known partIds, VI/EN instruction and passGate. User-authored assembly text is exported as supplied; changing dimensions does NOT rewrite these instructions. Review instruction measurements after resizing.

## Output and limits

Outputs: normalized input JSON, dimensioned SVG envelope (not a cut template), BOM and assembly Markdown, warnings. Invalid input blocks output. All outputs remain concept-only regardless of evidence labels. No prices or suppliers are invented. No AI calls, API keys, web research, embeddings, Wokwi adapter, 3D adapter, structural analysis or electrical approval exist in this proof.

The sample is a non-electrical STEM cardboard panel, deliberately outside the six cosplay roles. It tests adding a new product through data rather than adding role-specific application code. This does not establish general CAD generation or commercial readiness.

Run `node scripts/validate-product-engine.mjs`.

## Proof 2: six role adapters

`manifest.schema.json` documents the v1 structural contract using JSON Schema draft-07. Runtime validation remains the dependency-free validator plus semantic checks (unique part IDs, source evidence, step references). Schema alone does not prove compatibility or technical correctness.

`atlas-reference` geometry requires a supported `role`. The playground reuses AtlasCad and the original reference dimensions. Editing those dimensions blocks generation; it never fabricates a rectangular substitute for a bow/sword. The headless compiler returns no SVG for reference roles until a CAD adapter supplies one.

`generate-role-products.mjs` derives all six adapters from the existing role data and shared part IDs. The six parts are **module groups, not purchase quantities**. All are marked assumed; no verified source is invented. Eight VI/EN assembly instructions are preserved, but PASS gates in this migration are generic review gates, not the existing detailed guided-build criteria. Use the full Atlas role build workflow for actual construction.

Run the generator after changing source role data, then run `validate-product-engine.mjs` and `validate-cad.mjs`.

Next: full purchase BOM and detailed PASS-gate adapters, source-backed research with human approval, then a simulation adapter for one verified electronics template. Keep private partner data off this public Site.

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../dist/product-engine.js', import.meta.url), 'utf8'), context);
const engine = context.AtlasProductEngine;
vm.runInContext('this.window = {};', context);
vm.runInContext(fs.readFileSync(new URL('../dist/prop-manifests.js', import.meta.url),'utf8'),context);
context.ATLAS_PROP_MANIFESTS=context.window.ATLAS_PROP_MANIFESTS;
const sample = JSON.parse(fs.readFileSync(new URL('../dist/product-engine/sample-panel.json', import.meta.url), 'utf8'));
for (const lang of ['vi','en']) {
  const r = engine.compile(sample, lang);
  assert.equal(r.errors.length,0); assert.ok(r.warnings.length >= 3);
  assert.ok(r.output.svg.includes('300 mm')); assert.ok(r.output.markdown.includes('NOT MANUFACTURING READY'));
}
for (const value of [null, [], {}, {schemaVersion:'2.0'}, {...sample,dimensionsMm:{width:-1,height:200,depth:30}}, {...sample,assembly:[{partIds:['unknown']}]}, {...sample,parts:[null]}, {...sample,parts:[{...sample.parts[0],evidence:'referenced'}]}]) {
  assert.equal(engine.compile(value).output,null);
}
const resized = structuredClone(sample); resized.dimensionsMm.width = 450;
assert.ok(engine.compile(resized).output.svg.includes('450 mm'));
const escaped = structuredClone(sample); escaped.name.vi='<script>alert(1)</script>';
assert.ok(!engine.compile(escaped).output.svg.includes('<script>'));
console.log('Product engine PASS: VI/EN generation, resize, invalid-input blocking, source gates and SVG escaping.');
const roles=JSON.parse(fs.readFileSync(new URL('../dist/product-engine/atlas-roles.json',import.meta.url),'utf8'));
const schema=JSON.parse(fs.readFileSync(new URL('../dist/product-engine/manifest.schema.json',import.meta.url),'utf8'));
assert.equal(schema.properties.schemaVersion.const,'1.0');
assert.equal(Object.keys(roles).length,6);
for(const [role,product] of Object.entries(roles)) {
  const reference=context.ATLAS_PROP_MANIFESTS[role];
  assert.deepEqual(product.parts.map(p=>p.id),Array.from(reference.modules,m=>m.id));
  assert.equal(product.assembly.length,8);
  for(const lang of ['vi','en']) {
    const result=engine.compile(product,lang);
    assert.equal(result.errors.length,0,result.errors.join('\n'));
    assert.equal(result.output.svg,null,'Reference roles must not get a rectangular drawing');
    assert.ok(result.output.markdown.includes(product.name[lang]));
  }
  const wrong=structuredClone(product);wrong.dimensionsMm.width+=10;
  assert.equal(engine.compile(wrong).output,null,'Changed reference dimensions must block');
  const badParts=structuredClone(product);badParts.parts[1].id=badParts.parts[0].id;
  assert.equal(engine.compile(badParts).output,null,'Duplicate part IDs must block');
}
console.log('Role adapters PASS: six roles × VI/EN, original part IDs, eight steps, dimension lock and no placeholder SVG.');

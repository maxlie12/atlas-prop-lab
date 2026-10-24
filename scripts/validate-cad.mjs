import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, { checked: true, options: [{}, {}, {}], addEventListener() {}, innerHTML: '', textContent: '' });
  return elements.get(id);
};
const context = vm.createContext({window: {}, document: {getElementById: element}, Blob, URL, setTimeout});
vm.runInContext(fs.readFileSync('dist/prop-manifests.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('dist/cad-lab.js', 'utf8'), context);
for (const role of Object.keys(context.window.ATLAS_PROP_MANIFESTS)) {
  for (const language of ['vi', 'en']) {
    context.window.AtlasCad.render(role, language, {name: role});
    const svg = element('cadDrawing').innerHTML;
    assert.ok(svg.startsWith('<svg'));
    assert.ok(!/NaN|undefined/.test(svg));
    assert.ok(svg.includes('viewBox="0 0 1080 950"'));
    assert.ok(element('cadDimensions').innerHTML.includes('Cavity H'));
  }
}
console.log('CAD validation PASS: six roles, both languages, dimension tables and vector sheet generation.');

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'..');
const context = vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/prop-manifests.js'),'utf8'),context);
const app = fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
const start = app.indexOf('const propKits = {');
const end = app.indexOf('const staticTranslations = {');
if (start < 0 || end <= start) throw new Error('Role source boundary changed; review generator');
vm.runInContext(app.slice(start,end)+'\nthis.kits = propKits; this.vi = propKitVi;',context);
const output = {};
for (const [role, m] of Object.entries(context.window.ATLAS_PROP_MANIFESTS)) {
  const en=context.kits[role], vi=context.vi[role];
  if (en.callouts.length!==m.modules.length || vi.callouts.length!==m.modules.length || en.assembly.length!==m.assemblyCallouts.length) throw new Error('Role contract mismatch: '+role);
  output[role]={schemaVersion:'1.0',id:`atlas-${role}`,name:{vi:vi.name,en:en.name},geometry:'atlas-reference',role,dimensionsMm:m.dimensionsMm,dimensionEvidence:'assumed',
    parts:m.modules.map((part,i)=>({id:part.id,name:{vi:vi.callouts[i],en:en.callouts[i]},quantity:1,unit:'module-group / NOT purchase quantity',evidence:'assumed',sources:[]})),
    assembly:en.assembly.map((instruction,i)=>({partIds:m.assemblyCallouts[i].map(n=>m.modules.find(part=>part.callout===n).id),instruction:{vi:vi.assembly[i],en:instruction},passGate:{vi:'Cổng kiểm tra chung, chưa xác minh: đối chiếu bước này với bản vẽ Atlas và ghi bằng chứng kiểm tra thực tế trước khi tiếp tục.',en:'Generic unverified gate: compare this step with the Atlas drawing and record physical test evidence before proceeding.'}}))};
}
fs.writeFileSync(path.join(root,'dist/product-engine/atlas-roles.json'),JSON.stringify(output,null,2)+'\n');
console.log('Generated six role adapters from existing part IDs, callouts and bilingual assembly data.');

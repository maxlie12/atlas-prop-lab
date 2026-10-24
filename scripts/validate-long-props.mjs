// Three stubs check geometry contracts, not rendered appearance or physical safety.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url),source=fs.readFileSync(new URL('three-lab.js',root),'utf8');
class Shape{constructor(){this.commands=[];}moveTo(...p){this.commands.push(['M',...p]);}lineTo(...p){this.commands.push(['L',...p]);}quadraticCurveTo(...p){this.commands.push(['Q',...p]);}closePath(){this.commands.push(['Z']);}}
class Geometry{constructor(...args){this.args=args;}translate(){}computeVertexNormals(){}}
const context=vm.createContext({window:{},THREE:{Group:class{constructor(){this.children=[];this.userData={};}},Shape,ExtrudeGeometry:Geometry,BoxGeometry:Geometry,CylinderGeometry:Geometry,SphereGeometry:Geometry,TorusGeometry:Geometry},plateGeometry:(...args)=>new Geometry(...args),
 addPart:(group,geometry,color,key,position,rotation,scale,options)=>{const mesh={geometry,color,position,rotation,scale,options,userData:{partKey:key,electronic:!!options.electronic}};group.children.push(mesh);return mesh;},
 linePart:(group,points,color,key,options)=>{const mesh={points,options,userData:{partKey:key,electronic:!!options.electronic}};group.children.push(mesh);return mesh;}});
vm.runInContext(fs.readFileSync(new URL('prop-manifests.js',root),'utf8'),context);context.propManifests=context.window.ATLAS_PROP_MANIFESTS;
context.finishModel=(group,role)=>{group.children.forEach(mesh=>{const module=context.propManifests[role].modules.find(m=>m.modelKey===mesh.userData.partKey);assert.ok(module);mesh.userData.moduleId=module.id;});return group;};
vm.runInContext(source.slice(source.indexOf('  function buildStaff('),source.indexOf('  const builders =')),context);
for(const [role,builder]of [['mage','buildStaff'],['boss','buildBoss']]){
 const model=vm.runInContext(`${builder}(0x39cc93)`,context);
 assert.equal(new Set(model.children.map(m=>m.userData.partKey)).size,6);
 assert.equal(model.userData.designEnvelopeMm.height,role==='mage'?1100:1150);
 assert.ok(model.children.filter(m=>m.userData.partKey==='shell').every(m=>!m.userData.electronic));
 for(const key of ['core','control','sensor'])assert.ok(model.children.filter(m=>m.userData.partKey===key).every(m=>m.userData.electronic));
 if(role==='mage'){
  const lights=model.children.filter(m=>m.userData.partKey==='light');assert.equal(lights.length,2);
  assert.equal(lights.filter(m=>m.userData.electronic).length,1);
  assert.equal(lights[0].geometry.args[0],70/175);
  assert.ok(model.children.filter(m=>m.userData.partKey==='wearable').every(m=>!m.userData.electronic));
 }else{
  const panels=model.children.slice(0,6);assert.ok(panels.every(m=>m.geometry.args[0] instanceof Shape));
  assert.ok(panels.every(m=>m.geometry.args[1].depth===.045));
  assert.deepEqual(Array.from(model.children.filter(m=>m.userData.feedbackZone),m=>m.userData.feedbackZone).sort(),['chest','left-shoulder','right-shoulder']);
  assert.equal(model.children.filter(m=>m.userData.deviceRole==='armour-receiver').length,1);
  assert.ok(model.children.filter(m=>m.userData.partKey==='wearable').some(m=>!m.userData.electronic));
 }
}
assert.ok(source.includes('roleSteps.mage=["shell","core","shell","light","sensor","core","control","shell"]'));
assert.ok(source.includes('roleSteps.boss=["shell","core","shell","sensor","wearable","wearable","control","shell"]'));
console.log('Long props PASS: 6 modules each, staff diffuser/LED split, padded end, six hollow-head panels, three armour zones, receiver and step mapping. No WebGL visual verification.');

// Contract tests with Three stubs, not a rendered/WebGL safety or appearance test.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);
const source=fs.readFileSync(new URL('three-lab.js',root),'utf8');
class Shape{constructor(){this.commands=[];}moveTo(...p){this.commands.push(['M',...p]);}lineTo(...p){this.commands.push(['L',...p]);}quadraticCurveTo(...p){this.commands.push(['Q',...p]);}closePath(){this.commands.push(['Z']);}}
class Geometry{constructor(...args){this.args=args;}translate(){}computeVertexNormals(){}}
const context=vm.createContext({window:{},THREE:{Group:class{constructor(){this.children=[];this.userData={};}},Shape,ExtrudeGeometry:Geometry,BoxGeometry:Geometry,CylinderGeometry:Geometry,SphereGeometry:Geometry,TorusGeometry:Geometry},plateGeometry:(...args)=>new Geometry(...args),
  addPart:(group,geometry,color,key,position,rotation,scale,options)=>{const mesh={geometry,color,position,scale,options,userData:{partKey:key,electronic:!!options.electronic}};group.children.push(mesh);return mesh;},
  linePart:(group,points,color,key,options)=>{const mesh={points,color,options,userData:{partKey:key,electronic:!!options.electronic}};group.children.push(mesh);return mesh;}});
vm.runInContext(fs.readFileSync(new URL('prop-manifests.js',root),'utf8'),context);
context.propManifests=context.window.ATLAS_PROP_MANIFESTS;
context.finishModel=(group,role)=>{group.children.forEach(mesh=>{const module=context.propManifests[role].modules.find(m=>m.modelKey===mesh.userData.partKey);assert.ok(module);mesh.userData.moduleId=module.id;});return group;};
vm.runInContext(source.slice(source.indexOf('  function softBladeGeometry('),source.indexOf('  function buildBow(')),context);
vm.runInContext(source.slice(source.indexOf('  function buildDaggers('),source.indexOf('  function buildStaff(')),context);
for(const [role,builder]of [['warrior','buildSword'],['assassin','buildDaggers']]){
  const group=vm.runInContext(`${builder}(0x7057d9)`,context);
  const keys=new Set(group.children.map(m=>m.userData.partKey));assert.equal(keys.size,6);
  assert.equal(group.userData.designEnvelopeMm.height,role==='warrior'?650:320);
  assert.ok(group.children.filter(m=>m.userData.partKey==='shell').every(m=>!m.userData.electronic));
  for(const key of ['core','sensor','control'])assert.ok(group.children.filter(m=>m.userData.partKey===key).every(m=>m.userData.electronic));
  const blades=group.children.filter(m=>m.geometry?.args[0]instanceof Shape);
  assert.equal(blades.length,role==='warrior'?1:2);
  blades.forEach(m=>assert.equal(m.geometry.args[0].commands.filter(c=>c[0]==='Q').length,2));
  if(role==='assassin'){
    const passive=group.children.filter(m=>m.userData.partKey==='passive');assert.ok(passive.length>0);
    assert.ok(passive.every(m=>!m.userData.electronic&&!m.options.emissive));
    assert.ok(group.children.filter(m=>m.userData.partKey==='wearable').some(m=>m.userData.electronic));
    assert.ok(!keys.has('light'),'No fake LEDs on the passive dagger');
  }
}
assert.ok(source.includes('"sensor","control","passive","wearable","shell"'));
console.log('Blade contracts PASS: sword and two daggers, six selectable groups, rounded tip paths, passive electronics exclusion, wrist trap and preserved IDs. No rendered visual verification.');

// Geometry contract test with lightweight Three stubs; not WebGL visual QA.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../dist/three-lab.js',import.meta.url),'utf8');
const start=source.indexOf('  function buildBow(accent) {');
const end=source.indexOf('  function buildDaggers(accent)',start);
class Shape {
  constructor(){this.commands=[];}
  moveTo(...p){this.commands.push(['M',...p]);}
  lineTo(...p){this.commands.push(['L',...p]);}
  bezierCurveTo(...p){this.commands.push(['C',...p]);}
  closePath(){this.commands.push(['Z']);}
}
class Geometry {constructor(...args){this.args=args;}translate(){}computeVertexNormals(){}}
const meshes=[];
const context=vm.createContext({THREE:{Group:class{constructor(){this.children=[];this.userData={};}},Shape,ExtrudeGeometry:Geometry,BoxGeometry:Geometry},
  propManifests:{archer:{modules:[['shell',1,'recurve-limbs'],['wearable',2,'cosmetic-cord'],['control',3,'draw-magnet'],['sensor',4,'hall-sensor'],['core',5,'esp32-riser'],['light',6,'limb-led']].map(([modelKey,callout,id])=>({modelKey,callout,id}))}},
  plateGeometry:(...args)=>new Geometry(...args),
  addPart:(group,geometry,color,key,position,rotation,scale,options)=>{const mesh={geometry,position,options,userData:{partKey:key,electronic:!!options?.electronic}};group.children.push(mesh);meshes.push(mesh);return mesh;},
  linePart:(group,points,color,key,options)=>{const mesh={points,options,userData:{partKey:key,electronic:!!options.electronic}};group.children.push(mesh);return mesh;},
  addRivet:(group,position,key)=>group.children.push({position,userData:{partKey:key}}),finishModel:group=>group});
vm.runInContext(source.slice(start,end)+'\nthis.bow=buildBow(0x16a6c9);',context);
const bow=context.bow;
assert.equal(bow.userData.designEnvelopeMm.height,900);
assert.equal(new Set(bow.children.map(m=>m.userData.partKey)).size,6);
for(const mesh of bow.children){assert.ok(mesh.userData.moduleId);assert.ok(mesh.userData.callout);}
assert.ok(bow.children.filter(m=>m.userData.partKey==='shell').every(m=>!m.userData.electronic));
for(const key of ['sensor','control','core','light'])assert.ok(bow.children.filter(m=>m.userData.partKey===key).every(m=>m.userData.electronic));
const cords=bow.children.filter(m=>m.userData.partKey==='wearable');
assert.equal(cords.length,1);assert.equal(cords[0].points.length,2);assert.equal(cords[0].points[0][0],cords[0].points[1][0]);
assert.equal(cords[0].points[0][1]-cords[0].points[1][1],6);
const frame=meshes[0].geometry;
assert.equal(frame.args[0].commands.filter(c=>c[0]==='C').length,8);
assert.equal(frame.args[1].depth,.24);
assert.ok(source.includes('["shell", "core", "wearable", "sensor", "core", "light", "control", "shell"]'));
console.log('Bow contract PASS: CAD cubic contour, 900 mm scale, one cosmetic cord, six numbered modules, shell/electronics separation and assembly mapping. No WebGL visual verification.');

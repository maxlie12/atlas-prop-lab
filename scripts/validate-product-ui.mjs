// DOM contract test, not a real browser visual/layout test.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);
const html=fs.readFileSync(new URL('product-lab.html',root),'utf8');
const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(match=>[match[1],{value:'',textContent:'',innerHTML:'',disabled:false,checked:true,options:[{}],handlers:{},classList:{toggle(){}},addEventListener(event,fn){this.handlers[event]=fn;},replaceChildren(){this.innerHTML='';this.textContent='';},append(){}}]));
elements.get('template').value='stem';elements.get('cadView').value='front';
const context=vm.createContext({window:{},document:{documentElement:{lang:'vi'},getElementById:id=>elements.get(id)||null,createElement:()=>({})},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(url,root),'utf8'))}),setTimeout,Blob,URL});
for(const file of ['prop-manifests.js','cad-lab.js','product-engine.js']) vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context);
context.ATLAS_PROP_MANIFESTS=context.window.ATLAS_PROP_MANIFESTS;
vm.runInContext(fs.readFileSync(new URL('product-lab.js',root),'utf8'),context);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(elements.get('template').disabled,false);
for(const role of ['guardian','warrior','archer','assassin','mage','boss']) {
  elements.get('template').value=role;elements.get('template').handlers.change();
  for(const lang of ['vi','en']) {
    elements.get(lang).handlers.click();
    assert.ok(elements.get('drawing').innerHTML.includes('1080 950'));
    assert.equal(elements.get('svg').disabled,false);
  }
}
const changed=JSON.parse(elements.get('manifest').value);changed.dimensionsMm.width+=10;
elements.get('manifest').value=JSON.stringify(changed);elements.get('manifest').handlers.input();
assert.equal(elements.get('json').disabled,true);
elements.get('compile').handlers.click();assert.equal(elements.get('svg').disabled,true);
elements.get('manifest').value='{bad';elements.get('compile').handlers.click();assert.equal(elements.get('md').disabled,true);
elements.get('sample').handlers.click();assert.ok(elements.get('drawing').innerHTML.includes('300 mm'));
console.log('UI DOM contract PASS: six roles × VI/EN, CAD required elements, stale-output invalidation, malformed/dimension blocking. No browser layout verification.');

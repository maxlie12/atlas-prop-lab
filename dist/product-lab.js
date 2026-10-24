(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let lang = 'vi', output = null, productId = 'product', sample = null, roles = null;
  const copy = {
    vi:{title:'Thêm sản phẩm bằng dữ liệu',intro:'Sửa manifest, kiểm tra và sinh bản kích thước, BOM cùng hướng dẫn. Chưa có AI research, 3D hoặc mô phỏng điện.',inputLabel:'Manifest sản phẩm (JSON)',sample:'Nạp mẫu STEM',compile:'Kiểm tra & sinh',privacy:'Xử lý trong trình duyệt; không gửi dữ liệu đến API. Không lưu khi đóng trang.',outputLabel:'Kết quả',md:'BOM + hướng dẫn',boundary:'Chỉ là đường bao concept, không phải mẫu cắt 1:1. Thay kích thước không tự sửa số đo trong hướng dẫn. Cần rà soát và thử mẫu thật.',pass:'Manifest hợp lệ · CONCEPT / CHƯA ĐƯỢC XÁC MINH',fail:'Bị chặn: sửa lỗi manifest trước khi sinh',dirty:'Dữ liệu đã thay đổi — bấm Kiểm tra & sinh',loading:'Đang nạp mẫu…',loadFail:'Không nạp được mẫu. Thử tải lại trang.'},
    en:{title:'Add a product through data',intro:'Edit a manifest, validate and generate a dimension envelope, BOM and assembly guide. AI research, 3D and circuit simulation are not connected.',inputLabel:'Product manifest (JSON)',sample:'Load STEM sample',compile:'Validate & generate',privacy:'Processed in your browser; no API upload. Not saved when you close this page.',outputLabel:'Output',md:'BOM + assembly',boundary:'Concept envelope only, not a 1:1 cutting template. Resizing does not update measurements inside assembly text. Review and build a physical mockup.',pass:'Valid manifest · CONCEPT / NOT VERIFIED',fail:'Blocked: fix manifest errors before generating',dirty:'Input changed — validate & generate again',loading:'Loading sample…',loadFail:'Sample could not load. Reload this page.'}
  };
  function clear() {
    output = null; ['json','svg','md'].forEach(id => $(id).disabled = true);
    $('drawing').replaceChildren(); $('pack').textContent=''; $('issues').replaceChildren();
  }
  function generate() {
    clear();
    let product;
    try {
      if ($('manifest').value.length > 200000) throw new Error('Manifest exceeds 200 KB');
      product = JSON.parse($('manifest').value);
    } catch (e) { $('status').textContent = copy[lang].fail; $('issues').textContent = e.message; return; }
    const result = AtlasProductEngine.compile(product, lang);
    $('status').textContent = result.errors.length ? copy[lang].fail : copy[lang].pass;
    [...result.errors,...result.warnings].forEach(message => {const li=document.createElement('li');li.textContent=message;$('issues').append(li);});
    if (!result.output) return;
    output=result.output; productId=product.id;
    if (product.geometry === 'atlas-reference') {
      const original = window.ATLAS_PROP_MANIFESTS[product.role];
      if (!original || ['width','height','depth'].some(key => original.dimensionsMm[key] !== product.dimensionsMm[key])) {
        clear(); $('status').textContent=copy[lang].fail; $('issues').textContent=lang==='vi'?'Kích thước không khớp bản vẽ tham chiếu Atlas.':'Dimensions do not match the Atlas reference drawing.'; return;
      }
      window.AtlasCad.render(product.role,lang,{name:product.name[lang]});
      output.svg=$('cadDrawing').innerHTML;
    }
    $('drawing').innerHTML=output.svg; $('pack').textContent=output.markdown;
    ['json','svg','md'].forEach(id => $(id).disabled=false);
  }
  function download(type) {
    if (!output) return;
    const content={json:output.manifest,svg:output.svg,md:output.markdown}[type];
    const url=URL.createObjectURL(new Blob([content],{type:{json:'application/json',svg:'image/svg+xml',md:'text/markdown'}[type]}));
    const a=document.createElement('a');a.href=url;a.download=`${productId}-${lang}.${type}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  for (const language of ['vi','en']) $(language).addEventListener('click',()=>{
    lang=language;document.documentElement.lang=lang;
    Object.entries(copy[lang]).forEach(([id,value])=>{if($(id))$(id).textContent=value;});
    $('templateLabel').textContent=lang==='vi'?'Chọn mẫu':'Choose template';
    $('schemaLink').textContent=lang==='vi'?'Tải schema v1':'Download schema v1';
    $('roleBoundary').textContent=lang==='vi'?'Mẫu Atlas giữ part ID và 8 bước lắp hiện có. Danh sách module chưa phải BOM mua hàng đầy đủ; không tự đổi kích thước bản vẽ đạo cụ.':'Atlas templates preserve part IDs and eight assembly steps. Module lists are not complete purchase BOMs; prop drawing dimensions cannot be changed here.';
    $('vi').classList.toggle('is-active',lang==='vi');$('en').classList.toggle('is-active',lang==='en');
    generate();
  });
  $('compile').addEventListener('click',generate);
  $('manifest').addEventListener('input',()=>{clear();$('status').textContent=copy[lang].dirty;});
  ['json','svg','md'].forEach(id=>$(id).addEventListener('click',()=>download(id)));
  function loadSelected() { const data=$('template').value==='stem'?sample:roles?.[$('template').value]; if(data){$('manifest').value=JSON.stringify(data,null,2);generate();} }
  $('sample').disabled=true; $('template').disabled=true;
  $('sample').addEventListener('click',()=>{$('template').value='stem';loadSelected();});
  $('template').addEventListener('change',loadSelected);
  $('status').textContent=copy[lang].loading;
  Promise.all(['sample-panel.json','atlas-roles.json'].map(file=>fetch('product-engine/'+file).then(r=>{if(!r.ok)throw new Error();return r.json();}))).then(([data,roleData])=>{
    sample=data;roles=roleData;$('sample').disabled=false;$('template').disabled=false;loadSelected();
  }).catch(()=>{$('status').textContent=copy[lang].loadFail;});
})();

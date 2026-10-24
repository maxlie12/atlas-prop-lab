(function (root) {
  'use strict';
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validId = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value);
  const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1000;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
  function validate(p) {
    const errors = [], warnings = [];
    if (!object(p)) return {errors:['manifest: expected object'], warnings};
    if (p.schemaVersion !== '1.0') errors.push('schemaVersion: expected 1.0');
    if (!validId(p.id)) errors.push('id: use lowercase letters, digits and hyphens');
    if (!object(p.name) || !text(p.name.vi) || !text(p.name.en)) errors.push('name: Vietnamese and English are required');
    if (!['rectangular-panel','atlas-reference'].includes(p.geometry)) errors.push('geometry: rectangular-panel or atlas-reference');
    if (p.geometry === 'atlas-reference' && !['guardian','warrior','archer','assassin','mage','boss'].includes(p.role)) errors.push('role: unsupported Atlas role');
    if (p.geometry === 'atlas-reference') {
      warnings.push('Role parts are module groups, not a complete purchase BOM. Supplier specifications, quantities and role-specific PASS gates still require review.');
      const reference = root.ATLAS_PROP_MANIFESTS?.[p.role];
      if (reference && ['width','height','depth'].some(key => p.dimensionsMm?.[key] !== reference.dimensionsMm[key])) errors.push('dimensionsMm: Atlas reference dimensions are locked; resize in the role CAD pipeline first');
    }
    if (!object(p.dimensionsMm)) errors.push('dimensionsMm: required');
    for (const key of ['width','height','depth']) {
      const v = p.dimensionsMm?.[key];
      if (!Number.isFinite(v) || v <= 0 || v > 2000) errors.push(`dimensionsMm.${key}: expected 0 < mm <= 2000`);
    }
    if (!['assumed','measured'].includes(p.dimensionEvidence)) errors.push('dimensionEvidence: assumed or measured');
    if (p.dimensionEvidence !== 'measured') warnings.push('Dimensions are assumptions; measure a physical sample before cutting final material.');
    const parts = Array.isArray(p.parts) ? p.parts : [];
    if (!parts.length || parts.length > 50) errors.push('parts: expected 1–50 parts');
    const ids = new Set();
    parts.forEach((part, i) => {
      if (!object(part)) { errors.push(`parts[${i}]: expected object`); return; }
      if (!validId(part.id) || ids.has(part.id)) errors.push(`parts[${i}].id: invalid or duplicate`);
      ids.add(part.id);
      if (!object(part.name) || !text(part.name.vi) || !text(part.name.en)) errors.push(`parts[${i}].name: VI/EN required`);
      if (!Number.isFinite(part.quantity) || part.quantity <= 0 || part.quantity > 10000) errors.push(`parts[${i}].quantity: invalid`);
      if (!text(part.unit)) errors.push(`parts[${i}].unit: required`);
      if (!['assumed','referenced','measured'].includes(part.evidence)) errors.push(`parts[${i}].evidence: invalid`);
      if (!Array.isArray(part.sources)) errors.push(`parts[${i}].sources: expected array`);
      else part.sources.forEach((s, j) => {
        if (!object(s) || !text(s.title) || !/^https:\/\//.test(s.url || '') || !/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt || '')) errors.push(`parts[${i}].sources[${j}]: HTTPS URL, title and checkedAt required`);
      });
      if (part.evidence === 'referenced' && !part.sources?.length) errors.push(`parts[${i}]: referenced requires a source`);
      if (part.evidence === 'assumed') warnings.push(`${part.id}: no verified supplier/specification; do not purchase from this draft alone.`);
    });
    const steps = Array.isArray(p.assembly) ? p.assembly : [];
    if (!steps.length || steps.length > 50) errors.push('assembly: expected 1–50 steps');
    steps.forEach((step, i) => {
      if (!object(step)) {errors.push(`assembly[${i}]: expected object`); return;}
      for (const key of ['instruction','passGate']) if (!object(step[key]) || !text(step[key].vi) || !text(step[key].en)) errors.push(`assembly[${i}].${key}: VI/EN required`);
      if (!Array.isArray(step.partIds) || !step.partIds.length || step.partIds.some(id => !ids.has(id))) errors.push(`assembly[${i}].partIds: missing/unknown part`);
    });
    return {errors, warnings};
  }
  function compile(p, language = 'vi') {
    const result = validate(p);
    if (result.errors.length) return {...result, output:null};
    const lang = language === 'en' ? 'en' : 'vi';
    const d = p.dimensionsMm, w = d.width, h = d.height;
    const scale = Math.min(620 / w, 470 / h), rw = w * scale, rh = h * scale;
    const x = (800-rw)/2, y = 100;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 720" role="img" aria-label="${escape(p.name[lang])}"><rect width="800" height="720" fill="#0c1c26"/><g fill="none" stroke="#76d7e7" stroke-width="2"><rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="10"/><path d="M ${x} ${y+rh+20} v 30 M ${x+rw} ${y+rh+20} v 30 M ${x} ${y+rh+40} H ${x+rw} M ${x-30} ${y} H ${x-10} M ${x-30} ${y+rh} H ${x-10} M ${x-20} ${y} V ${y+rh}"/></g><g fill="#eaf5f7" font-family="sans-serif" font-size="20" text-anchor="middle"><text x="400" y="50">${escape(p.name[lang])}</text><text x="400" y="${y+rh+70}">${w} mm / ${w/10} cm</text><text transform="translate(${x-40},${y+rh/2}) rotate(-90)">${h} mm / ${h/10} cm</text><text x="400" y="650">Depth: ${d.depth} mm · CONCEPT / NOT TO SCALE</text><text x="400" y="690">Envelope only — no holes, cavities, wiring or structural proof</text></g></svg>`;
    const lines = [`# ${p.name[lang]}`, '', 'CONCEPT ONLY — NOT MANUFACTURING READY', '', `ID: ${p.id} | schema: ${p.schemaVersion}`, `Envelope: ${w} × ${h} × ${d.depth} mm`, `Dimension evidence: ${p.dimensionEvidence}`, '', '## BOM / Vật tư', ''];
    p.parts.forEach(part => {
      lines.push(`- ${part.id}: ${part.name[lang]} — ${part.quantity} ${part.unit} [${part.evidence}]`);
      part.sources.forEach(s => lines.push(`  Source: ${s.title} — ${s.url} (${s.checkedAt})`));
    });
    lines.push('', '## Assembly / Lắp ráp', '');
    p.assembly.forEach((step, i) => lines.push(`${i+1}. ${step.instruction[lang]}`, `   Parts: ${step.partIds.join(', ')}`, `   PASS: ${step.passGate[lang]}`));
    lines.push('', '## Unverified / Chưa xác minh', '', ...result.warnings.map(warning => `- ${warning}`), '', 'Simulation: not generated. Three.js geometry and Wokwi circuit adapters are not implemented for this product. Physical fit, electrical safety and supplier availability remain unverified.');
    return {...result, output:{svg:p.geometry === 'atlas-reference' ? null : svg, markdown:lines.join('\n'), manifest:JSON.stringify(p,null,2)}};
  }
  root.AtlasProductEngine = Object.freeze({validate, compile});
})(globalThis);

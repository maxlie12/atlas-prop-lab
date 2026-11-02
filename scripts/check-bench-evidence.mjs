#!/usr/bin/env node
// Atlas Prop Lab: evidence checker for physical Arc Bow ↔ armour bench trials.
// Accepts CSV from a real test campaign; never fabricates measurements.
import { readFileSync } from 'node:fs';

export function parseCsv(input) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field.trim()); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && input[i + 1] === '\n') i++;
      row.push(field.trim()); field = '';
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (field || row.length) { row.push(field.trim()); if (row.some(Boolean)) rows.push(row); }
  if (rows.length < 2) throw new Error('Expected header and at least one trial');
  const headers = rows.shift().map((h, i) => i === 0 ? h.replace(/^\uFEFF/, '').toLowerCase() : h.toLowerCase());
  for (const h of ['trial_id', 'result', 'latency_ms']) if (!headers.includes(h)) throw new Error('Missing required column: ' + h);
  const result = rows.map((fields, index) => {
    if (fields.length !== headers.length) throw new Error('CSV column count mismatch, row ' + (index + 2));
    return Object.fromEntries(headers.map((h, i) => [h, fields[i]]));
  });
  return result;
}

export function evaluate(rows, options = {}) {
  const minTrials = options.minTrials ?? 100;
  const maxP95Ms = options.maxP95Ms ?? 150;
  const ids = new Set(), counts = { PASS: 0, MISS: 0, DUPLICATE: 0, REJECT: 0 };
  const latencies = [];
  for (const [index, row] of rows.entries()) {
    const id = String(row.trial_id || '').trim();
    if (!id || ids.has(id)) throw new Error('Missing or repeated trial_id at row ' + (index + 2));
    ids.add(id);
    const status = String(row.result || '').toUpperCase();
    if (!Object.hasOwn(counts, status)) throw new Error('Unknown result: ' + row.result);
    counts[status]++;
    const raw = String(row.latency_ms || '').trim();
    if (raw) {
      const ms = Number(raw);
      if (!Number.isFinite(ms) || ms < 0) throw new Error('Invalid latency_ms at row ' + (index + 2));
      if (status !== 'PASS') throw new Error('Only PASS rows may report hit latency (row ' + (index + 2) + ')');
      latencies.push(ms);
    } else if (status === 'PASS') throw new Error('PASS missing latency_ms at row ' + (index + 2));
  }
  latencies.sort((a, b) => a - b);
  const p95Ms = latencies.length ? latencies[Math.ceil(latencies.length * .95) - 1] : null;
  const checks = {
    sampleSize: rows.length >= minTrials,
    passesObserved: counts.PASS > 0,
    p95Latency: p95Ms !== null && p95Ms <= maxP95Ms,
  };
  return { total: rows.length, counts, p95Ms, criteria: { minTrials, maxP95Ms }, checks,
    readyForReview: Object.values(checks).every(Boolean),
    note: 'Review only. This does not certify electrical, IR range, fit, heat, or field safety.' };
}

function selfTest() {
  const csv = 'trial_id,result,latency_ms\n1,PASS,34\n2,MISS,\n3,DUPLICATE,\n4,REJECT,';
  const rows = parseCsv(csv);
  const report = evaluate(rows, { minTrials: 4, maxP95Ms: 50 });
  if (!report.readyForReview || report.counts.PASS !== 1 || report.p95Ms !== 34) throw new Error('Basic evaluator test failed');
  for (const bad of ['trial_id,result,latency_ms\n1,PASS,\n', 'trial_id,result,latency_ms\n1,FAIL,5\n']) {
    let rejected = false;
    try { evaluate(parseCsv(bad)); } catch { rejected = true; }
    if (!rejected) throw new Error('Invalid evidence accepted');
  }
  console.log('Atlas evidence checker self-test PASS');
}
const invoked = process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href;
if (invoked) {
  try {
    if (process.argv[2] === '--self-test') selfTest();
    else {
      if (!process.argv[2]) throw new Error('Usage: node scripts/check-bench-evidence.mjs trials.csv [minTrials] [maxP95Ms]');
      const minTrials = process.argv[3] === undefined ? 100 : Number(process.argv[3]);
      const maxP95Ms = process.argv[4] === undefined ? 150 : Number(process.argv[4]);
      if (!Number.isInteger(minTrials) || minTrials < 1 || !Number.isFinite(maxP95Ms) || maxP95Ms <= 0) throw new Error('Invalid thresholds');
      const report = evaluate(parseCsv(readFileSync(process.argv[2], 'utf8')), { minTrials, maxP95Ms });
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.readyForReview ? 0 : 2;
    }
  } catch (error) { console.error('Evidence invalid:', error.message); process.exitCode = 1; }
}

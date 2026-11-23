(function () {
  const $ = selector => document.querySelector(selector);
  if (!$("#benchEvidence")) return;
  const key = "atlas-bench-evidence-v1";
  let active = "bow";
  let state = { bow: [], hit: [] };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch {}
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: {
      label: "BẰNG CHỨNG PHẦN CỨNG THẬT", title: "Ghi 100 lần kéo/thả và 100 packet hit", status: n => `${n} / 2 CAMPAIGNS PASS`, tabs: ["01 · Nhả dây cung", "02 · Giáp nhận hit"], kicker: ["CAMPAIGN 01", "CAMPAIGN 02"], names: ["Độ tin cậy Hall kéo/thả", "Độ tin cậy receiver và chống lặp"], latency: "Latency đo được", note: "Ghi chú tùy chọn", placeholder: "Ánh sáng, góc, khoảng cách…", total: "TỔNG", success: "PASS", error: "LỖI", p95: "P95 LATENCY", export: "Tải CSV", clear: "Xóa campaign này", lock: "Phải PASS đủ 5 wiring gates trước khi ghi test phần cứng.", unlocked: "Wiring gates đã PASS. Mỗi nút bấm phải tương ứng đúng một thử nghiệm thật.", outcomes: { pass: "PASS", miss: "MISS", duplicate: "DUPLICATE", reject: "REJECT" }, rule: "PASS khi đủ 100 thử nghiệm, không MISS, không DUPLICATE và không REJECT.", passed: "CAMPAIGN PASS · 100/100 sạch", empty: "Chưa có phép thử thật", confirm: "Xóa toàn bộ kết quả campaign đang mở?" },
    en: {
      label: "REAL HARDWARE EVIDENCE", title: "Record 100 draw/releases and 100 hit packets", status: n => `${n} / 2 CAMPAIGNS PASS`, tabs: ["01 · Bow release", "02 · Armour hit"], kicker: ["CAMPAIGN 01", "CAMPAIGN 02"], names: ["Hall draw/release reliability", "Receiver and de-duplication reliability"], latency: "Measured latency", note: "Optional note", placeholder: "Light, angle, distance…", total: "TOTAL", success: "PASS", error: "ERRORS", p95: "P95 LATENCY", export: "Download CSV", clear: "Clear this campaign", lock: "All five wiring gates must pass before recording hardware evidence.", unlocked: "Wiring gates passed. Each click must represent exactly one real trial.", outcomes: { pass: "PASS", miss: "MISS", duplicate: "DUPLICATE", reject: "REJECT" }, rule: "PASS requires 100 trials with zero MISS, DUPLICATE, or REJECT events.", passed: "CAMPAIGN PASS · CLEAN 100/100", empty: "No real trials recorded", confirm: "Delete every result in the active campaign?" }
  };
  const records = () => state[active];
  const campaignPass = name => state[name].length === 100 && state[name].every(row => row.outcome === "pass");
  const wiringReady = () => { try { return (JSON.parse(localStorage.getItem("atlas-physical-wiring-v1") || "{}").gates || []).length === 5; } catch { return false; } };
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  function percentile(values, p) { if (!values.length) return null; const sorted = [...values].sort((a,b) => a-b); return sorted[Math.ceil(p * sorted.length) - 1]; }
  function render() {
    const t = copy[lang()]; const list = records(); const errors = list.filter(row => row.outcome !== "pass"); const passCount = list.length - errors.length; const p95 = percentile(list.map(row => row.latencyMs).filter(value => value != null), .95); const passed = campaignPass(active); const ready = wiringReady();
    $("#benchEvidenceLabel").textContent = t.label; $("#benchEvidenceTitle").textContent = t.title; $("#benchEvidenceStatus").textContent = t.status(["bow","hit"].filter(campaignPass).length);
    $("#benchBowTab").textContent = t.tabs[0]; $("#benchHitTab").textContent = t.tabs[1]; $("#benchCampaignKicker").textContent = t.kicker[active === "bow" ? 0 : 1]; $("#benchCampaignTitle").textContent = t.names[active === "bow" ? 0 : 1];
    $("#benchLatencyLabel").textContent = t.latency; $("#benchNoteLabel").textContent = t.note; $("#benchNote").placeholder = t.placeholder; $("#benchTotalLabel").textContent = t.total; $("#benchSuccessLabel").textContent = t.success; $("#benchErrorLabel").textContent = t.error; $("#benchP95Label").textContent = t.p95;
    $("#benchProgressText").textContent = `${list.length} / 100`; $("#benchProgressBar").style.width = `${Math.min(100,list.length)}%`; $("#benchTotal").textContent = list.length; $("#benchSuccess").textContent = passCount; $("#benchError").textContent = errors.length; $("#benchP95").textContent = p95 == null ? "—" : `${p95} ms`;
    $("#benchOutcomeActions").innerHTML = Object.entries(t.outcomes).map(([id,label]) => `<button type="button" data-outcome="${id}" ${!ready || list.length >= 100 ? "disabled" : ""}>${label}</button>`).join("");
    $("#benchLockNote").textContent = ready ? t.unlocked : t.lock; const rule = $("#benchPassRule"); rule.classList.toggle("is-pass", passed); rule.textContent = passed ? t.passed : t.rule;
    $("#benchRecentLog").innerHTML = list.length ? list.slice(-8).reverse().map(row => `<li><b>#${row.trial}</b><em>${t.outcomes[row.outcome]}</em><span>${row.latencyMs == null ? "—" : `${row.latencyMs} ms`}${row.note ? ` · ${row.note}` : ""}</span></li>`).join("") : `<li><span>${t.empty}</span></li>`;
    $("#exportBenchCsv").textContent = t.export; $("#clearBenchCampaign").textContent = t.clear;
    document.querySelectorAll("[data-bench-campaign]").forEach(button => button.classList.toggle("is-active", button.dataset.benchCampaign === active));
    if (campaignPass("bow") && campaignPass("hit")) window.dispatchEvent(new CustomEvent("atlas-journey-complete", { detail: { step: "bench" } }));
  }
  $(".bench-campaign-tabs").addEventListener("click", event => { const button = event.target.closest("[data-bench-campaign]"); if (!button) return; active = button.dataset.benchCampaign; render(); });
  // One trial = one row. Manual buttons and the Web Serial bench (bench-serial.js) both record
  // through here, so the wiring-gate lock and the 100-trial cap apply to either source.
  function recordTrial(campaign, outcome, latencyMs, note, source) {
    if (!wiringReady() || !state[campaign] || state[campaign].length >= 100) return false;
    state[campaign].push({ trial: state[campaign].length + 1, outcome, latencyMs: latencyMs == null || latencyMs === "" ? null : Math.max(0, Math.min(5000, Math.round(Number(latencyMs) || 0))), note: note || "", source, recordedAt: new Date().toISOString() });
    save(); render(); return true;
  }
  window.ATLAS_BENCH_EVIDENCE = { recordTrial, wiringReady, count: campaign => state[campaign]?.length ?? 0 };
  $("#benchOutcomeActions").addEventListener("click", event => { const button = event.target.closest("[data-outcome]"); if (!button || button.disabled) return; if (recordTrial(active, button.dataset.outcome, $("#benchLatency").value, $("#benchNote").value.trim(), "manual")) $("#benchNote").value = ""; });
  $("#clearBenchCampaign").addEventListener("click", () => { if (!records().length || !confirm(copy[lang()].confirm)) return; state[active] = []; save(); render(); });
  $("#exportBenchCsv").addEventListener("click", () => { const header = "campaign,trial,outcome,latency_ms,source,note,recorded_at"; const rows = records().map(row => [active,row.trial,row.outcome,row.latencyMs,row.source || "manual",`\"${row.note.replaceAll('"','""')}\"`,row.recordedAt].join(",")); const blob = new Blob([[header,...rows].join("\n")], { type: "text/csv" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `atlas-${active}-bench-evidence.csv`; link.click(); URL.revokeObjectURL(link.href); });
  window.addEventListener("storage", render); window.addEventListener("atlas-language-change", render); render();
})();

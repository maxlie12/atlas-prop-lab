(function () {
  // Field simulator signal source: Simulation (buttons + network sliders), Live (the real Arc
  // Bow and armour over the Web Serial ports opened on the bench page) or Replay (a pasted
  // Serial Monitor log). Live and Replay lines go straight into the same bridge rules as the
  // simulated props, so the 3D arena reacts to the real hardware. A replay is judged by a
  // rehearsal copy of the bench judge and is NEVER written to hardware evidence.

  // ---- Pure log parsing (shared with scripts/validate-field-live.mjs) -------------------
  // Accepts: digital-twin "LINE bow 2254030 {...}", PlatformIO monitor_filters=time
  // "14:02:02.294 > {...}", Arduino IDE "14:02:02.294 -> {...}", or bare lines.
  function parseLogLine(raw) {
    const line = String(raw).replace(/\r$/, "");
    let hostMs = null, text = line.trim(), device = null;
    let match = /^LINE (bow|armour) (\d+) (.*)$/.exec(line);
    if (match) { device = match[1]; hostMs = Number(match[2]) / 1000; text = match[3].trim(); }
    else if ((match = /^\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-?>\s?(.*)$/.exec(line))) {
      hostMs = ((Number(match[1]) * 60 + Number(match[2])) * 60 + Number(match[3])) * 1000 + Number(match[4].padEnd(3, "0"));
      text = match[5].trim();
    }
    if (!text) return null;
    let evt = null;
    if (text.startsWith("{")) { try { evt = JSON.parse(text); } catch { return null; } }
    const id = evt?.deviceId || /^ATLAS_PROP_(?:READY|INFO) v\d+ (\S+)/.exec(text)?.[1] || (text.startsWith("ATLAS_HALL") ? "archer-bow-01" : null);
    if (id) device = id.startsWith("archer-bow") ? "bow" : id.startsWith("impact-armour") ? "armour" : device;
    if (!evt && !text.startsWith("ATLAS_")) return null;
    return { hostMs, text, device, evt, banner: /^ATLAS_PROP_READY/.test(text) };
  }

  // Order lines on one host timeline. Untimed lines use each board's own atMs deltas; a line
  // from the other board with no host time follows the previous line by `crossGapMs`.
  function buildTimeline(input, crossGapMs = 110) {
    const parsed = String(input).split("\n").map(parseLogLine).filter(Boolean);
    const timed = parsed.some(item => item.hostMs != null);
    const events = []; const lastAt = {}; const lastT = {};
    let clock = 0, first = null;
    for (const item of parsed) {
      let t;
      if (timed && item.hostMs != null) { if (first == null) first = item.hostMs; t = item.hostMs - first; if (t < clock - 12 * 3600e3) t += 24 * 3600e3; }
      else if (item.evt && Number.isFinite(item.evt.atMs) && lastAt[item.device] != null) t = lastT[item.device] + Math.max(0, item.evt.atMs - lastAt[item.device]);
      else t = events.length ? clock + (events[events.length - 1].device !== item.device ? crossGapMs : 0) : 0;
      t = Math.max(clock, t); clock = t;
      if (item.evt && Number.isFinite(item.evt.atMs)) { lastAt[item.device] = item.evt.atMs; lastT[item.device] = t; }
      events.push({ ...item, t });
    }
    return events;
  }

  // Judge a timeline the way the bench page would, without recording anything.
  function rehearse(events, createBenchJudge) {
    const trials = [];
    const judge = createBenchJudge((campaign, outcome, latencyMs, note) => trials.push({ campaign, outcome, latencyMs, note }));
    for (const item of events) {
      judge.tick(item.t);
      if (!item.evt) continue;
      if (item.device === "bow") judge.onBow(item.evt, item.t); else if (item.device === "armour") judge.onArmour(item.evt, item.t);
    }
    judge.tick(Infinity);
    const count = (campaign, outcome) => trials.filter(row => row.campaign === campaign && row.outcome === outcome).length;
    const latencies = trials.filter(row => row.latencyMs != null).map(row => row.latencyMs).sort((a, b) => a - b);
    return {
      trials,
      bow: { pass: count("bow", "pass"), duplicate: count("bow", "duplicate"), reject: count("bow", "reject") },
      hit: { pass: count("hit", "pass"), miss: count("hit", "miss"), duplicate: count("hit", "duplicate"), reject: count("hit", "reject") },
      p95: latencies.length ? Math.round(latencies[Math.ceil(latencies.length * 0.95) - 1]) : null
    };
  }

  const SAMPLE_LOG = [
    "14:02:00.010 > ATLAS_PROP_READY v1 archer-bow-01 hall=4 ir=5 hallRest=2048 start=150 ready=600",
    "14:02:00.020 > ATLAS_PROP_READY v1 impact-armour-01 zones=left:6,chest:7,right:8",
    "14:02:01.854 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":5,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_START\",\"shot\":1,\"hall\":186,\"atMs\":1814}",
    "14:02:02.034 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":6,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_READY\",\"shot\":1,\"hall\":606,\"atMs\":1994}",
    "14:02:02.294 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":7,\"type\":\"PLAYER_INTENT\",\"action\":\"FIRE\",\"shot\":2,\"hall\":116,\"atMs\":2254}",
    "14:02:02.401 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":1,\"type\":\"SHOT_SEEN\",\"atMs\":2361,\"shot\":2,\"shooter\":1,\"zone\":\"chest\",\"zones\":[\"chest\"]}",
    "14:02:06.698 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":17,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_START\",\"shot\":4,\"hall\":186,\"atMs\":6658}",
    "14:02:06.878 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":18,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_READY\",\"shot\":4,\"hall\":606,\"atMs\":6838}",
    "14:02:07.138 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":19,\"type\":\"PLAYER_INTENT\",\"action\":\"FIRE\",\"shot\":5,\"hall\":116,\"atMs\":7098}",
    "14:02:07.245 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":4,\"type\":\"SHOT_SEEN\",\"atMs\":7205,\"shot\":5,\"shooter\":1,\"zone\":\"left\",\"zones\":[\"left\",\"chest\"]}",
    "14:02:07.828 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":20,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_START\",\"shot\":5,\"hall\":186,\"atMs\":7788}",
    "14:02:08.008 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":21,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_READY\",\"shot\":5,\"hall\":606,\"atMs\":7968}",
    "14:02:08.268 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":22,\"type\":\"PLAYER_INTENT\",\"action\":\"FIRE\",\"shot\":6,\"hall\":116,\"atMs\":8228}",
    "14:02:08.375 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":5,\"type\":\"SHOT_SEEN\",\"atMs\":8335,\"shot\":6,\"shooter\":1,\"zone\":\"right\",\"zones\":[\"right\"]}",
    "14:02:08.515 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":6,\"type\":\"DUPLICATE_IGNORED\",\"atMs\":8475,\"shot\":6,\"zone\":\"right\"}",
    "14:02:09.215 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":7,\"type\":\"HIT_REJECT\",\"atMs\":9175,\"zone\":\"chest\",\"reason\":\"INVALID_CODE\"}",
    "14:02:09.408 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":23,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_START\",\"shot\":6,\"hall\":186,\"atMs\":9368}",
    "14:02:09.588 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":24,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_READY\",\"shot\":6,\"hall\":606,\"atMs\":9548}",
    "14:02:09.848 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":25,\"type\":\"PLAYER_INTENT\",\"action\":\"FIRE\",\"shot\":7,\"hall\":116,\"atMs\":9808}",
    "14:02:10.688 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":26,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_START\",\"shot\":7,\"hall\":186,\"atMs\":10648}",
    "14:02:10.868 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":27,\"type\":\"PLAYER_INTENT\",\"action\":\"DRAW_READY\",\"shot\":7,\"hall\":606,\"atMs\":10828}",
    "14:02:11.128 > {\"v\":1,\"deviceId\":\"archer-bow-01\",\"role\":\"ARCHER\",\"seq\":28,\"type\":\"PLAYER_INTENT\",\"action\":\"FIRE\",\"shot\":8,\"hall\":116,\"atMs\":11088}",
    "14:02:11.235 > {\"v\":1,\"deviceId\":\"impact-armour-01\",\"role\":\"ARMOUR\",\"seq\":8,\"type\":\"SHOT_SEEN\",\"atMs\":11195,\"shot\":8,\"shooter\":1,\"zone\":\"chest\",\"zones\":[\"chest\"]}"
  ].join("\n");
  window.ATLAS_FIELD_LIVE = { parseLogLine, buildTimeline, rehearse, SAMPLE_LOG };

  const $ = selector => document.querySelector(selector);
  const field = () => window.AtlasFieldUI;
  if (!$("#signalSource") || !field()) return;
  const DEVICES = ["archer-bow-01", "impact-armour-01"];
  const lang = () => (document.documentElement.lang === "en" ? "en" : "vi");
  const copy = {
    vi: { label: "Nguồn tín hiệu", modes: { sim: "Mô phỏng", live: "Board thật", replay: "Phát lại log" },
      notes: { sim: "Bấm nút hoặc phím 1–4; độ trễ và mất gói lấy từ thanh trượt bên trên.", live: "Cung và giáp thật điều khiển ghế Cung thủ: kéo/thả dây thật, phát trúng giáp thật sẽ trừ máu Boss trong 3D. Kết nối board ở Event Kit → Ghi bằng chứng (Kết nối cung / Kết nối giáp).", replay: "Dán log Serial Monitor của một hoặc cả hai board (nên bật monitor_filters = time để có giờ). Phát lại chạy qua cùng luật game và chấm thử như bàn test — KHÔNG ghi vào bằng chứng thật. 2×/4× nén thời gian trong 3D; độ trễ thật xem ở dòng chấm thử." },
      bow: "Cung", armour: "Giáp", on: "đang nối", off: "chưa nối", lines: n => `${n} dòng trong phiên`, download: "Tải log phiên", sample: "Log mẫu", run: "Phát lại", stop: "Dừng", speed: "Tốc độ",
      placeholder: "14:02:02.294 > {\"v\":1,\"deviceId\":\"archer-bow-01\",…}", empty: "Chưa có dòng nào đọc được trong log.", running: (done, total) => `Đang phát ${done}/${total}…`,
      summary: r => `Chấm thử (không ghi): cung ${r.bow.pass} PASS${r.bow.duplicate ? ` · ${r.bow.duplicate} DUPLICATE` : ""}${r.bow.reject ? ` · ${r.bow.reject} REJECT` : ""} · giáp ${r.hit.pass} HIT${r.hit.miss ? ` · ${r.hit.miss} MISS` : ""}${r.hit.reject ? ` · ${r.hit.reject} REJECT` : ""}${r.hit.duplicate ? ` · ${r.hit.duplicate} DUPLICATE` : ""}${r.p95 != null ? ` · p95 ${r.p95} ms` : ""}`,
      autoLive: "Có tín hiệu từ board thật — chuyển sang chế độ Board thật.", rehearsal: "THỬ" },
    en: { label: "Signal source", modes: { sim: "Simulation", live: "Real boards", replay: "Replay log" },
      notes: { sim: "Press the buttons or keys 1–4; latency and loss come from the sliders above.", live: "The real bow and armour drive the Archer seat: a real draw/release and a real hit on the armour damage the Boss in 3D. Connect the boards in Event Kit → Bench evidence (Connect bow / Connect armour).", replay: "Paste the Serial Monitor log of one or both boards (monitor_filters = time adds host timestamps). Replay goes through the same game rules and a rehearsal bench judge — it is NEVER written to real evidence. 2×/4× compress time in 3D; the real latency is in the rehearsal line." },
      bow: "Bow", armour: "Armour", on: "connected", off: "not connected", lines: n => `${n} lines this session`, download: "Download session log", sample: "Sample log", run: "Replay", stop: "Stop", speed: "Speed",
      placeholder: "14:02:02.294 > {\"v\":1,\"deviceId\":\"archer-bow-01\",…}", empty: "No readable line in the log.", running: (done, total) => `Replaying ${done}/${total}…`,
      summary: r => `Rehearsal (not recorded): bow ${r.bow.pass} PASS${r.bow.duplicate ? ` · ${r.bow.duplicate} DUPLICATE` : ""}${r.bow.reject ? ` · ${r.bow.reject} REJECT` : ""} · armour ${r.hit.pass} HIT${r.hit.miss ? ` · ${r.hit.miss} MISS` : ""}${r.hit.reject ? ` · ${r.hit.reject} REJECT` : ""}${r.hit.duplicate ? ` · ${r.hit.duplicate} DUPLICATE` : ""}${r.p95 != null ? ` · p95 ${r.p95} ms` : ""}`,
      autoLive: "Real board signal detected — switched to Real boards.", rehearsal: "REHEARSAL" }
  };
  let mode = "sim";
  const boards = { bow: false, armour: false };
  const session = [];
  let replay = null;

  const stamp = date => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}.${String(date.getMilliseconds()).padStart(3, "0")}`;
  function setMode(next) {
    if (replay && next !== "replay") stopReplay();
    mode = next;
    for (const id of DEVICES) field().setLiveDevice(id, mode !== "sim");
    render();
  }
  function render() {
    const t = copy[lang()];
    $("#signalSourceLabel").textContent = t.label;
    document.querySelectorAll("[data-signal]").forEach(button => { button.textContent = t.modes[button.dataset.signal]; button.classList.toggle("is-active", button.dataset.signal === mode); });
    $("#signalSourceNote").textContent = t.notes[mode];
    $("#signalLive").hidden = mode !== "live";
    $("#signalReplay").hidden = mode !== "replay";
    $("#signalBoards").innerHTML = ["bow", "armour"].map(kind => `<span data-on="${boards[kind]}"><i></i>${t[kind]} · ${boards[kind] ? t.on : t.off}</span>`).join("");
    $("#signalSessionCount").textContent = t.lines(session.length);
    $("#signalDownload").textContent = t.download;
    $("#replaySample").textContent = t.sample;
    $("#replayRun").textContent = replay ? t.stop : t.run;
    $("#replaySpeedLabel").textContent = t.speed;
    $("#replayInput").placeholder = t.placeholder;
  }

  // ---- Live ---------------------------------------------------------------------------------
  window.addEventListener("atlas-bench-boards", event => { boards.bow = Boolean(event.detail?.bow); boards.armour = Boolean(event.detail?.armour); render(); });
  window.addEventListener("atlas-device-text", event => {
    const { text, kind } = event.detail || {};
    session.push(`${stamp(new Date())} > ${text}`);
    if (/^ATLAS_PROP_READY/.test(text) && mode === "live") field().sim.resetDevice(kind === "bow" ? DEVICES[0] : DEVICES[1]);
    if (mode === "live") render();
  });
  window.addEventListener("atlas-device-line", event => {
    const { evt, text } = event.detail || {};
    session.push(`${stamp(new Date())} > ${text || JSON.stringify(evt)}`);
    if (mode === "sim" && !replay) { setMode("live"); field().select?.("archer"); toast(copy[lang()].autoLive); }
    if (mode === "live") field().injectDeviceLine(evt, "live");
    render();
  });
  $("#signalDownload").addEventListener("click", () => {
    const blob = new Blob([session.join("\n") + "\n"], { type: "text/plain" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `atlas-gate01-session-${Date.now()}.log`; link.click(); URL.revokeObjectURL(link.href);
  });

  // ---- Replay -------------------------------------------------------------------------------
  function stopReplay() {
    if (!replay) return;
    replay.timers.forEach(clearTimeout); replay = null; render();
  }
  function startReplay() {
    const t = copy[lang()];
    const events = buildTimeline($("#replayInput").value);
    if (!events.some(item => item.evt)) { $("#replaySummary").textContent = t.empty; return; }
    const speed = Number($("#replaySpeed").value) || 1;
    for (const id of DEVICES) { field().setLiveDevice(id, true); field().sim.resetDevice(id); }
    field().select?.("archer");
    const result = rehearse(events, window.ATLAS_BENCH_JUDGE.createBenchJudge);
    let done = 0;
    const start = performance.now();
    replay = { timers: [] };
    for (const item of events) {
      replay.timers.push(setTimeout(() => {
        done++;
        if (item.banner) field().sim.resetDevice(item.device === "bow" ? DEVICES[0] : DEVICES[1]);
        if (item.evt) field().injectDeviceLine(item.evt, "replay", start + item.t / speed);
        $("#replaySummary").textContent = t.running(done, events.length);
        if (done === events.length) { replay = null; $("#replaySummary").textContent = t.summary(result); render(); }
      }, item.t / speed));
    }
    render();
  }
  $("#replaySample").addEventListener("click", () => { $("#replayInput").value = SAMPLE_LOG; });
  $("#replayRun").addEventListener("click", () => (replay ? stopReplay() : startReplay()));
  $("#signalSource").addEventListener("click", event => { const button = event.target.closest("[data-signal]"); if (button) setMode(button.dataset.signal); });
  window.addEventListener("atlas-language-change", render);
  function toast(text) { const box = $("#toast"); if (!box) return; box.textContent = text; box.classList.add("is-visible"); setTimeout(() => box.classList.remove("is-visible"), 2600); }
  window.AtlasFieldLive = { setMode, mode: () => mode, startReplay, stopReplay, sessionLines: () => [...session] };
  render();
})();

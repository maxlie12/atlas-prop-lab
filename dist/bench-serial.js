(function () {
  // Hardware Gate 01 automation: reads the Arc Bow and impact-armour boards over Web Serial
  // and turns their JSON lines into bench-evidence trials. The judge below is pure (no DOM,
  // no serial) so scripts/validate-bench-serial.mjs can replay synthetic lines through it.
  const HIT_WINDOW_MS = 400;   // FIRE line -> 68 ms IR packet -> 40 ms armour grouping -> SHOT_SEEN
  const REFIRE_MS = 200;

  function createBenchJudge(record) {
    let armed = false;
    let lastFireAt = -Infinity;
    const openShots = new Map();   // shot -> host ms of its FIRE line
    const closedShots = new Map(); // shot -> host ms it was judged

    function onBow(evt, now) {
      if (evt.type !== "PLAYER_INTENT") return;
      if (evt.action === "DRAW_READY") { armed = true; return; }
      if (evt.action !== "FIRE") return;
      if (now - lastFireAt < REFIRE_MS) record("bow", "duplicate", null, `shot ${evt.shot}: second FIRE ${Math.round(now - lastFireAt)} ms after the last`);
      else if (!armed) record("bow", "reject", null, `shot ${evt.shot}: FIRE without DRAW_READY`);
      else record("bow", "pass", null, `shot ${evt.shot}`);
      armed = false;
      lastFireAt = now;
      if (Number.isInteger(evt.shot)) { openShots.set(evt.shot, now); closedShots.delete(evt.shot); }
    }

    function onArmour(evt, now) {
      if (evt.type === "SHOT_SEEN") {
        if (openShots.has(evt.shot)) {
          record("hit", "pass", now - openShots.get(evt.shot), `shot ${evt.shot} · ${evt.zone} (${(evt.zones || []).join("+")})`);
          openShots.delete(evt.shot); closedShots.set(evt.shot, now);
        } else if (closedShots.has(evt.shot)) {
          record("hit", "duplicate", null, `shot ${evt.shot} reported again`);
        } else {
          record("hit", "reject", null, `shot ${evt.shot}: no matching FIRE`);
        }
      } else if (evt.type === "HIT_REJECT") {
        const oldest = [...openShots.entries()].sort((a, b) => a[1] - b[1])[0];
        if (oldest) { openShots.delete(oldest[0]); closedShots.set(oldest[0], now); }
        record("hit", "reject", null, `${evt.zone}: ${evt.reason}${oldest ? ` (shot ${oldest[0]})` : ""}`);
      }
    }

    function tick(now) {
      for (const [shot, firedAt] of openShots) {
        if (now - firedAt > HIT_WINDOW_MS) {
          openShots.delete(shot); closedShots.set(shot, now);
          record("hit", "miss", null, `shot ${shot}: no SHOT_SEEN within ${HIT_WINDOW_MS} ms`);
        }
      }
    }

    return { onBow, onArmour, tick };
  }

  window.ATLAS_BENCH_JUDGE = { createBenchJudge, HIT_WINDOW_MS, REFIRE_MS };

  // Pure parser for the bench text lines, shared with scripts/validate-bench-serial.mjs.
  // "ATLAS_PROP_READY v1 archer-bow-01 hall=4 ir=5 hallRest=2048 start=150 ready=600"
  // "ATLAS_PROP_INFO v1 impact-armour-01 zones=left:6,chest:7,right:8"
  // "ATLAS_HALL raw=2790 rest=2048 dev=742 state=ready"
  function parseBenchText(line) {
    const identity = /^ATLAS_PROP_(READY|INFO) v(\d+) (\S+)(.*)$/.exec(line);
    if (identity) {
      const fields = Object.fromEntries([...identity[4].matchAll(/(\w+)=(\S+)/g)].map(match => [match[1], match[2]]));
      const deviceId = identity[3];
      const kind = deviceId.startsWith("archer-bow") ? "bow" : deviceId.startsWith("impact-armour") ? "armour" : "other";
      const pins = {};
      if (fields.hall) pins.hall = Number(fields.hall);
      if (fields.ir) pins.irTx = Number(fields.ir);
      if (fields.zones) for (const [zone, pin] of fields.zones.split(",").map(pair => pair.split(":"))) pins[zone] = Number(pin);
      return { type: identity[1] === "READY" ? "ready" : "info", version: Number(identity[2]), deviceId, kind, pins,
        hallRest: fields.hallRest == null ? null : Number(fields.hallRest), start: fields.start == null ? null : Number(fields.start), ready: fields.ready == null ? null : Number(fields.ready) };
    }
    const hall = /^ATLAS_HALL raw=(-?\d+) rest=(-?\d+) dev=(\d+) state=(\w+)/.exec(line);
    if (hall) return { type: "hall", raw: Number(hall[1]), rest: Number(hall[2]), dev: Number(hall[3]), state: hall[4] };
    const monitor = /^ATLAS_HALL_MONITOR (on|off)/.exec(line);
    if (monitor) return { type: "monitor", on: monitor[1] === "on" };
    return null;
  }
  // Pin-map comparison between what the firmware reports and the web wiring map.
  function pinMismatches(reported, wiringPins) {
    return Object.entries(reported).filter(([key, pin]) => wiringPins[key] != null && Number(wiringPins[key]) !== pin)
      .map(([key, pin]) => ({ key, firmware: pin, wiring: Number(wiringPins[key]) }));
  }
  window.ATLAS_BENCH_JUDGE.parseBenchText = parseBenchText;
  window.ATLAS_BENCH_JUDGE.pinMismatches = pinMismatches;

  const $ = selector => document.querySelector(selector);
  if (!$("#benchSerial")) return;
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: { title: "Tự ghi từ board qua USB", hint: "Chrome/Edge trên máy tính: nối cung và giáp bằng cáp USB data, web tự nhận board, tự chấm từng lần thử và tự đo latency. Lần nhả dây không được nhận ra vẫn bấm MISS bằng tay.", bow: "Kết nối cung", armour: "Kết nối giáp", idle: "CHƯA KẾT NỐI", live: n => `${n}/2 BOARD ĐANG ĐỌC`, unsupported: "Trình duyệt này không có Web Serial — dùng Chrome hoặc Edge trên máy tính.", locked: "Campaign này chưa mở khóa ở bước sơ đồ dây — xem các kiểm tra trước khi ghi.", ready: id => `${id} sẵn sàng`,
      boardEmpty: "Chưa nối", noBanner: "Board chưa trả lời sau 3 giây. Kiểm tra: (1) đã nạp firmware arc-bow / impact-armour chưa; (2) bo có 2 cổng USB-C thì cắm cổng ghi COM hoặc UART; (3) nhấn nút RST trên bo rồi kết nối lại.",
      swapped: (pressed, kind) => `Board này là ${kind === "bow" ? "CUNG" : "GIÁP"} (bạn bấm "${pressed === "bow" ? "Kết nối cung" : "Kết nối giáp"}") — đã tự xếp đúng chỗ.`,
      duplicate: kind => `Đã có một ${kind === "bow" ? "cung" : "giáp"} đang nối. Mỗi loại chỉ một board.`, other: id => `Board này chạy firmware ${id}, không phải cung/giáp Gate 01. Nạp firmware/arc-bow hoặc firmware/impact-armour.`,
      pinWarn: list => `Chân không khớp sơ đồ dây trên web: ${list.map(item => `${item.key} firmware GPIO${item.firmware} ≠ sơ đồ GPIO${item.wiring}`).join("; ")}. Sửa sơ đồ hoặc firmware cho giống nhau.`,
      pinOk: "Chân khớp sơ đồ dây", restWarn: rest => `Mức nghỉ Hall = ${rest}, sát mép 0/4095: kiểm tra dây AO, nguồn 3V3 và GND của KY-024.`,
      oldFirmware: "Firmware cũ: chưa báo chân. Nạp lại bản mới để web kiểm tra được chân.", hallOn: "Đo Hall trực tiếp", hallOff: "Tắt đo Hall", rest: "Đặt lại mức nghỉ", hallTitle: "Hall trực tiếp (cung)",
      hallHint: (start, ready) => `Kéo dây hết cỡ: thanh phải vượt vạch READY (${ready}) rõ ràng, nên ≥ ${Math.round(ready * 1.3)}. Thả dây: phải về dưới vạch START (${start}). Không vượt READY → đưa nam châm gần cảm biến hơn. Lúc nghỉ đã vượt START → nam châm đang quá gần, lùi ra rồi bấm "Đặt lại mức nghỉ".`,
      states: { rest: "NGHỈ", drawing: "ĐANG KÉO", ready: "SẴN SÀNG BẮN" }, restDone: rest => `Đã đo lại mức nghỉ: ${rest}` },
    en: { title: "Record straight from the boards over USB", hint: "Desktop Chrome/Edge: connect the bow and armour with USB data cables; the page identifies each board, judges every trial and times it. An undetected release is still recorded as MISS by hand.", bow: "Connect bow", armour: "Connect armour", idle: "NOT CONNECTED", live: n => `${n}/2 BOARDS LIVE`, unsupported: "This browser has no Web Serial — use desktop Chrome or Edge.", locked: "This campaign is not unlocked in the wiring step yet — complete its checks before recording.", ready: id => `${id} ready`,
      boardEmpty: "Not connected", noBanner: "No answer from the board after 3 s. Check: (1) firmware arc-bow / impact-armour is flashed; (2) on a two-port board use the port labelled COM or UART; (3) press RST and connect again.",
      swapped: (pressed, kind) => `This board is the ${kind === "bow" ? "BOW" : "ARMOUR"} (you pressed "${pressed === "bow" ? "Connect bow" : "Connect armour"}") — placed in the right slot.`,
      duplicate: kind => `A ${kind} is already connected. One board of each kind.`, other: id => `This board runs ${id}, not the Gate 01 bow or armour. Flash firmware/arc-bow or firmware/impact-armour.`,
      pinWarn: list => `Pins differ from the web wiring map: ${list.map(item => `${item.key} firmware GPIO${item.firmware} ≠ map GPIO${item.wiring}`).join("; ")}. Make the map and firmware agree.`,
      pinOk: "Pins match the wiring map", restWarn: rest => `Hall rest level = ${rest}, close to 0/4095: check the KY-024 AO, 3V3 and GND wires.`,
      oldFirmware: "Older firmware: pins not reported. Reflash to let the page check pins.", hallOn: "Live Hall reading", hallOff: "Stop Hall reading", rest: "Re-measure rest", hallTitle: "Live Hall (bow)",
      hallHint: (start, ready) => `Full draw: the bar must clearly pass READY (${ready}), ideally ≥ ${Math.round(ready * 1.3)}. Release: it must fall below START (${start}). Never reaching READY → move the magnet closer. Past START at rest → the magnet is too close; move it back and press "Re-measure rest".`,
      states: { rest: "REST", drawing: "DRAWING", ready: "READY TO FIRE" }, restDone: rest => `Rest level re-measured: ${rest}` }
  };
  const boards = { bow: null, armour: null };   // session per slot
  const hall = { on: false, start: 150, ready: 600, last: null };
  const evidence = () => window.ATLAS_BENCH_EVIDENCE;
  const wiringPins = () => { try { return JSON.parse(localStorage.getItem("atlas-physical-wiring-v1") || "{}").pins || { hall: 4, irTx: 5, left: 6, chest: 7, right: 8 }; } catch { return {}; } };
  const escape = text => String(text).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
  const log = (text, isError) => {
    const item = document.createElement("li");
    if (isError) item.className = "is-error";
    item.innerHTML = `<b>${new Date().toLocaleTimeString()}</b> ${escape(text)}`;
    $("#benchSerialLog").prepend(item);
    while ($("#benchSerialLog").children.length > 40) $("#benchSerialLog").lastChild.remove();
  };
  const judge = createBenchJudge((campaign, outcome, latencyMs, note) => {
    const ok = evidence()?.recordTrial(campaign, outcome, latencyMs, note, "serial");
    log(`${campaign.toUpperCase()} ${outcome.toUpperCase()}${latencyMs != null ? ` ${Math.round(latencyMs)} ms` : ""} · ${note}`, !ok || outcome !== "pass");
    if (!ok) log(copy[lang()].locked, true);
  });
  setInterval(() => judge.tick(performance.now()), 50);

  function boardCard(kind) {
    const t = copy[lang()]; const session = boards[kind];
    const name = kind === "bow" ? "ARC BOW · archer-bow-01" : "ARMOUR · impact-armour-01";
    if (!session) return `<article class="bench-board" data-state="empty"><b>${name}</b><span>${t.boardEmpty}</span></article>`;
    const info = session.info;
    const pins = info ? Object.entries(info.pins).map(([key, pin]) => `${key} GPIO${pin}`).join(" · ") : "…";
    const notes = session.notes.map(note => `<small class="${note.warn ? "is-warn" : ""}">${escape(note.text)}</small>`).join("");
    return `<article class="bench-board" data-state="${session.notes.some(note => note.warn) ? "warn" : info ? "ok" : "wait"}"><b>${name}</b><span>${escape(pins)}${info && info.hallRest != null ? ` · rest ${info.hallRest}` : ""}</span>${notes}</article>`;
  }

  function renderHall() {
    const t = copy[lang()]; const box = $("#benchHall"); if (!box) return;
    box.hidden = !boards.bow;
    $("#benchHallToggle").textContent = hall.on ? t.hallOff : t.hallOn;
    $("#benchHallRest").textContent = t.rest;
    $("#benchHallTitle").textContent = t.hallTitle;
    $("#benchHallHint").textContent = t.hallHint(hall.start, hall.ready);
    const scale = Math.max(hall.ready * 2, 1200);
    $("#benchHallStart").style.left = `${hall.start / scale * 100}%`;
    $("#benchHallReady").style.left = `${hall.ready / scale * 100}%`;
    const reading = hall.last;
    $("#benchHallBar").style.width = reading ? `${Math.min(100, reading.dev / scale * 100)}%` : "0%";
    $("#benchHallBar").dataset.state = reading?.state || "rest";
    $("#benchHallValues").textContent = reading ? `dev ${reading.dev} · raw ${reading.raw} · rest ${reading.rest} · ${t.states[reading.state] || reading.state}` : "—";
  }

  function render() {
    const t = copy[lang()];
    $("#benchSerialTitle").textContent = t.title;
    $("#benchSerialHint").textContent = "serial" in navigator ? t.hint : t.unsupported;
    $("#benchConnectBow").textContent = t.bow;
    $("#benchConnectArmour").textContent = t.armour;
    const live = Object.values(boards).filter(Boolean).length;
    $("#benchSerialStatus").textContent = live ? t.live(live) : t.idle;
    $("#benchConnectBow").classList.toggle("is-connected", Boolean(boards.bow));
    $("#benchConnectArmour").classList.toggle("is-connected", Boolean(boards.armour));
    $("#benchConnectBow").disabled = !("serial" in navigator) || Boolean(boards.bow);
    $("#benchConnectArmour").disabled = !("serial" in navigator) || Boolean(boards.armour);
    $("#benchBoards").innerHTML = boardCard("bow") + boardCard("armour");
    renderHall();
    window.dispatchEvent(new CustomEvent("atlas-bench-boards", { detail: { bow: Boolean(boards.bow), armour: Boolean(boards.armour) } }));
  }

  async function send(session, text) {
    try { await session.writer?.write(new TextEncoder().encode(text)); } catch (error) { log(`${session.kind || session.pressed}: ${error.message}`, true); }
  }

  // A session is placed in a slot by what the board says it is, not by which button was pressed.
  function place(session, kind) {
    const t = copy[lang()];
    if (session.kind === kind) return true;
    if (kind === "other") return false;
    if (boards[kind] && boards[kind] !== session) { log(t.duplicate(kind), true); return false; }
    if (session.kind && boards[session.kind] === session) boards[session.kind] = null;
    session.kind = kind; boards[kind] = session;
    if (kind !== session.pressed) log(t.swapped(session.pressed, kind));
    render();
    return true;
  }

  function identify(session, info) {
    const t = copy[lang()];
    clearTimeout(session.timer);
    if (info.kind === "other") { log(t.other(info.deviceId), true); return; }
    if (!place(session, info.kind)) return;
    session.info = info; session.notes = [];
    if (!Object.keys(info.pins).length) session.notes.push({ text: t.oldFirmware, warn: true });
    else {
      const wrong = pinMismatches(info.pins, wiringPins());
      session.notes.push(wrong.length ? { text: t.pinWarn(wrong), warn: true } : { text: t.pinOk, warn: false });
      if (wrong.length) log(t.pinWarn(wrong), true);
    }
    if (info.kind === "bow" && info.hallRest != null) {
      if (info.start) hall.start = info.start;
      if (info.ready) hall.ready = info.ready;
      if (info.hallRest < 300 || info.hallRest > 3800) { session.notes.push({ text: t.restWarn(info.hallRest), warn: true }); log(t.restWarn(info.hallRest), true); }
      if (info.type === "info" && session.awaitingRest) { log(t.restDone(info.hallRest)); session.awaitingRest = false; }
    }
    if (info.type === "ready" || !session.announced) { log(t.ready(info.deviceId)); session.announced = true; }
    render();
  }

  async function connect(pressed) {
    let session = null;
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      session = { port, pressed, kind: null, info: null, notes: [], writer: port.writable ? port.writable.getWriter() : null, timer: null };
      place(session, pressed);
      session.timer = setTimeout(() => { if (!session.info) { log(copy[lang()].noBanner, true); session.notes = [{ text: copy[lang()].noBanner, warn: true }]; render(); } }, 3000);
      setTimeout(() => send(session, "?"), 250);   // boards that booted before the page opened still identify
      const reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let newline;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          handleLine(session, line, performance.now());
        }
      }
    } catch (error) {
      log(`${pressed}: ${error.message}`, true);
    }
    if (session) {
      clearTimeout(session.timer);
      try { session.writer?.releaseLock(); } catch {}
      if (session.kind && boards[session.kind] === session) boards[session.kind] = null;
      if (session.kind === "bow") { hall.on = false; hall.last = null; }
    }
    render();
  }

  function handleLine(session, line, now) {
    if (!line) return;
    if (line.startsWith("ATLAS_")) {
      const parsed = parseBenchText(line);
      if (parsed?.type !== "hall") window.dispatchEvent(new CustomEvent("atlas-device-text", { detail: { kind: parsed?.kind || session.kind, text: line, at: now } }));
      if (parsed?.type === "ready" || parsed?.type === "info") identify(session, parsed);
      else if (parsed?.type === "hall") { hall.last = parsed; hall.on = true; renderHall(); }
      else if (parsed?.type === "monitor") { hall.on = parsed.on; if (!parsed.on) hall.last = null; renderHall(); }
      else log(line);
      return;
    }
    let evt;
    try { evt = JSON.parse(line); } catch { return; }
    const kind = evt.deviceId?.startsWith("archer-bow") ? "bow" : evt.deviceId?.startsWith("impact-armour") ? "armour" : session.kind;
    if (kind !== session.kind && !place(session, kind)) return;
    window.dispatchEvent(new CustomEvent("atlas-device-line", { detail: { kind, evt, text: line, at: now, source: "serial" } }));
    if (kind === "bow") judge.onBow(evt, now); else if (kind === "armour") judge.onArmour(evt, now);
  }

  $("#benchConnectBow").addEventListener("click", () => connect("bow"));
  $("#benchConnectArmour").addEventListener("click", () => connect("armour"));
  $("#benchHallToggle").addEventListener("click", () => boards.bow && send(boards.bow, "h"));
  $("#benchHallRest").addEventListener("click", () => { if (!boards.bow) return; boards.bow.awaitingRest = true; send(boards.bow, "r"); });
  window.addEventListener("atlas-language-change", render);
  window.addEventListener("atlas-wiring-change", () => {
    for (const session of Object.values(boards)) if (session?.info) identify(session, session.info);
  });
  render();
})();

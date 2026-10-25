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

  const $ = selector => document.querySelector(selector);
  if (!$("#benchSerial")) return;
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: { title: "Tự ghi từ board qua USB", hint: "Chrome/Edge trên máy tính: nối cung và giáp bằng cáp USB data, web tự chấm từng lần thử và tự đo latency. Lần nhả dây không được nhận ra vẫn bấm MISS bằng tay.", bow: "Kết nối cung", armour: "Kết nối giáp", idle: "CHƯA KẾT NỐI", live: n => `${n}/2 BOARD ĐANG ĐỌC`, unsupported: "Trình duyệt này không có Web Serial — dùng Chrome hoặc Edge trên máy tính.", locked: "Cần PASS đủ 5 wiring gate trước khi ghi.", ready: id => `${id} sẵn sàng` },
    en: { title: "Record straight from the boards over USB", hint: "Desktop Chrome/Edge: connect the bow and armour with USB data cables and every trial is judged and timed automatically. An undetected release is still recorded as MISS by hand.", bow: "Connect bow", armour: "Connect armour", idle: "NOT CONNECTED", live: n => `${n}/2 BOARDS LIVE`, unsupported: "This browser has no Web Serial — use desktop Chrome or Edge.", locked: "All five wiring gates must pass before recording.", ready: id => `${id} ready` }
  };
  const ports = { bow: null, armour: null };
  const evidence = () => window.ATLAS_BENCH_EVIDENCE;
  const log = (text, isError) => {
    const item = document.createElement("li");
    if (isError) item.className = "is-error";
    item.innerHTML = `<b>${new Date().toLocaleTimeString()}</b> ${text.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c])}`;
    $("#benchSerialLog").prepend(item);
    while ($("#benchSerialLog").children.length > 40) $("#benchSerialLog").lastChild.remove();
  };
  const judge = createBenchJudge((campaign, outcome, latencyMs, note) => {
    const ok = evidence()?.recordTrial(campaign, outcome, latencyMs, note, "serial");
    log(`${campaign.toUpperCase()} ${outcome.toUpperCase()}${latencyMs != null ? ` ${Math.round(latencyMs)} ms` : ""} · ${note}`, !ok || outcome !== "pass");
    if (!ok) log(copy[lang()].locked, true);
  });
  setInterval(() => judge.tick(performance.now()), 50);

  function render() {
    const t = copy[lang()];
    $("#benchSerialTitle").textContent = t.title;
    $("#benchSerialHint").textContent = "serial" in navigator ? t.hint : t.unsupported;
    $("#benchConnectBow").textContent = t.bow;
    $("#benchConnectArmour").textContent = t.armour;
    const live = Object.values(ports).filter(Boolean).length;
    $("#benchSerialStatus").textContent = live ? t.live(live) : t.idle;
    $("#benchConnectBow").classList.toggle("is-connected", Boolean(ports.bow));
    $("#benchConnectArmour").classList.toggle("is-connected", Boolean(ports.armour));
    $("#benchConnectBow").disabled = !("serial" in navigator) || Boolean(ports.bow);
    $("#benchConnectArmour").disabled = !("serial" in navigator) || Boolean(ports.armour);
  }

  async function connect(kind) {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      ports[kind] = port;
      render();
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
          handleLine(kind, line, performance.now());
        }
      }
    } catch (error) {
      log(`${kind}: ${error.message}`, true);
    }
    ports[kind] = null;
    render();
  }

  function handleLine(kind, line, now) {
    if (!line) return;
    if (line.startsWith("ATLAS_PROP_READY")) { log(copy[lang()].ready(line.split(" ")[2] || kind)); return; }
    let evt;
    try { evt = JSON.parse(line); } catch { return; }
    if (kind === "bow") judge.onBow(evt, now); else judge.onArmour(evt, now);
  }

  $("#benchConnectBow").addEventListener("click", () => connect("bow"));
  $("#benchConnectArmour").addEventListener("click", () => connect("armour"));
  window.addEventListener("atlas-language-change", render);
  render();
})();

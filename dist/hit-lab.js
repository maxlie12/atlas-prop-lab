(function () {
  const armour = window.ATLAS_IMPACT_ARMOUR;
  const $ = selector => document.querySelector(selector);
  if (!armour || !$("#hitLab")) return;

  const profiles = {
    hero: { maxHp: 100, damage: 18 },
    boss: { maxHp: 520, damage: 18 }
  };
  const copy = {
    vi: {
      label: "CUNG → GIÁP / KIỂM CHỨNG",
      title: "Chứng minh giáp xác nhận hit trước khi game trừ máu",
      status: "MÔ PHỎNG LOGIC / CHƯA TEST IR THẬT",
      profile: "Người mặc giáp", scenario: "Tình huống", run: "Chạy một phát bắn", reset: "Đặt lại",
      shot: "SHOT ID", zone: "VÙNG XÁC NHẬN", health: "MÁU", verdict: "KẾT QUẢ",
      eventTitle: "Event log có thể kiểm tra", copyJson: "Copy JSON",
      boundaryTitle: "PASS ở đây chỉ chứng minh logic",
      boundaryText: "Chưa chứng minh khoảng cách IR, ánh sáng môi trường, vùng che khuất, pin, độ vừa áo hoặc độ trễ phần cứng ngoài đời.",
      ready: "Chờ chạy test", running: "ĐANG CHẠY", pass: "PASS · TRỪ 1 LẦN", miss: "MISS · KHÔNG TRỪ MÁU", reject: "REJECT · SAI MÃ", duplicate: "PASS · CHẶN GÓI LẶP",
      copied: "Đã copy bằng chứng JSON", nodes: ["Hall nhận nhả dây", "Mã bắn, không tia nhìn thấy", "Receiver xác nhận vùng", "Chống lặp + trừ máu"],
      scenarios: ["Trúng vùng ngực", "Trúng vai trái", "Trúng vai phải", "Bắn trượt", "Nhiễu / sai mã", "Gói hit bị lặp"]
    },
    en: {
      label: "BOW → ARMOUR / PROOF",
      title: "Prove the armour confirms a hit before the game applies damage",
      status: "LOGIC SIMULATOR / REAL IR UNTESTED",
      profile: "Armour wearer", scenario: "Scenario", run: "Run one shot", reset: "Reset",
      shot: "SHOT ID", zone: "CONFIRMED ZONE", health: "HEALTH", verdict: "VERDICT",
      eventTitle: "Inspectable event log", copyJson: "Copy JSON",
      boundaryTitle: "A PASS here proves logic only",
      boundaryText: "Real IR range, ambient light, occlusion, battery, garment fit, and hardware latency are not yet proven.",
      ready: "Waiting for test", running: "RUNNING", pass: "PASS · ONE DAMAGE", miss: "MISS · NO DAMAGE", reject: "REJECT · BAD CODE", duplicate: "PASS · DUPLICATE BLOCKED",
      copied: "JSON evidence copied", nodes: ["Hall release", "Coded shot, no visible beam", "Receiver confirms a zone", "De-duplicate and apply damage"],
      scenarios: ["Chest confirmed", "Left shoulder confirmed", "Right shoulder confirmed", "Miss", "Interference / bad code", "Duplicate hit packet"]
    }
  };

  let shotCounter = 0;
  let state = { profile: "hero", hp: profiles.hero.maxHp, events: [], processed: new Set(), busy: false };
  const language = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function renderCopy() {
    const t = copy[language()];
    $("#hitLabLabel").textContent = t.label; $("#hitLabTitle").textContent = t.title; $("#hitLabStatus").textContent = t.status;
    $("#hitProfileLabel").textContent = t.profile; $("#hitScenarioLabel").textContent = t.scenario; $("#runHitTest").textContent = t.run; $("#resetHitTest").textContent = t.reset;
    $("#hitShotLabel").textContent = t.shot; $("#hitZoneLabel").textContent = t.zone; $("#hitHealthLabel").textContent = t.health; $("#hitVerdictLabel").textContent = t.verdict;
    $("#hitEventTitle").textContent = t.eventTitle; $("#copyHitEvidence").textContent = t.copyJson; $("#hitBoundaryTitle").textContent = t.boundaryTitle; $("#hitBoundaryText").textContent = t.boundaryText;
    [...$("#hitScenario").options].forEach((option, index) => { option.textContent = t.scenarios[index]; });
    ["bow", "beam", "armour", "game"].forEach((node, index) => { document.querySelector(`[data-hit-node="${node}"] span`).textContent = t.nodes[index]; });
  }

  function addEvent(type, detail, shotId) {
    const event = { sequence: state.events.length + 1, elapsedMs: state.events.length * 90, type, shotId, profile: state.profile, ...detail };
    state.events.push(event);
    const li = document.createElement("li");
    li.innerHTML = `<time>${String(event.elapsedMs).padStart(3, "0")} ms</time><code>${type}</code><span>${detail.note || detail.zone || "—"}</span>`;
    $("#hitEventLog").append(li);
  }

  function activate(node) {
    document.querySelectorAll("[data-hit-node]").forEach(item => item.classList.toggle("is-active", item.dataset.hitNode === node));
  }

  function applyConfirmedHit(shotId, zone) {
    if (state.processed.has(shotId)) {
      addEvent("DUPLICATE_IGNORED", { zone, note: "shotId already processed" }, shotId);
      return false;
    }
    state.processed.add(shotId);
    state.hp = Math.max(0, state.hp - profiles[state.profile].damage);
    addEvent("DAMAGE_APPLIED", { zone, damage: profiles[state.profile].damage, hpAfter: state.hp }, shotId);
    return true;
  }

  async function run() {
    if (state.busy) return;
    state.busy = true;
    $("#runHitTest").disabled = true;
    const t = copy[language()];
    const scenario = $("#hitScenario").value;
    const shotId = `BOW-${String(++shotCounter).padStart(4, "0")}`;
    const zone = scenario === "left" ? "left-shoulder" : scenario === "right" ? "right-shoulder" : "chest";
    state.events = [];
    $("#hitEventLog").innerHTML = ""; $("#hitShotId").textContent = shotId; $("#hitZoneValue").textContent = "—"; $("#hitVerdict").textContent = t.running;

    activate("bow"); addEvent("DRAW_READY", { note: "Hall threshold crossed" }, shotId); await wait(90);
    addEvent("FIRE", { note: "Release edge detected" }, shotId); activate("beam"); await wait(90);
    addEvent("IR_PACKET", { note: scenario === "interference" ? "CRC invalid" : "coded shot broadcast" }, shotId); await wait(90);

    if (scenario === "miss") {
      addEvent("MISS_TIMEOUT", { note: "No armour receiver saw this shot" }, shotId); $("#hitVerdict").textContent = t.miss;
    } else if (scenario === "interference") {
      activate("armour"); addEvent("HIT_REJECT", { zone, note: "receiver rejected invalid code" }, shotId); $("#hitVerdict").textContent = t.reject;
    } else {
      activate("armour"); addEvent("SHOT_SEEN", { zone }, shotId); await wait(90); addEvent("HIT_CONFIRM", { zone }, shotId);
      $("#hitZoneValue").textContent = zone; activate("game"); await wait(90); applyConfirmedHit(shotId, zone);
      if (scenario === "duplicate") { await wait(90); addEvent("HIT_CONFIRM", { zone, note: "duplicate delivery" }, shotId); applyConfirmedHit(shotId, zone); }
      $("#hitVerdict").textContent = scenario === "duplicate" ? t.duplicate : t.pass;
      window.dispatchEvent(new CustomEvent("atlas-journey-complete", { detail: { step: "hit" } }));
    }
    $("#hitHealthValue").textContent = `${state.hp} / ${profiles[state.profile].maxHp}`;
    setTimeout(() => activate(""), 450); state.busy = false; $("#runHitTest").disabled = false;
  }

  function reset() {
    state.profile = $("#hitProfile").value; state.hp = profiles[state.profile].maxHp; state.events = []; state.processed = new Set(); state.busy = false;
    $("#hitEventLog").innerHTML = `<li><time>00.000</time><code>SYSTEM_READY</code><span>${copy[language()].ready}</span></li>`;
    $("#hitShotId").textContent = "—"; $("#hitZoneValue").textContent = "—"; $("#hitHealthValue").textContent = `${state.hp} / ${profiles[state.profile].maxHp}`; $("#hitVerdict").textContent = "READY"; activate("");
  }

  $("#runHitTest").addEventListener("click", run);
  $("#resetHitTest").addEventListener("click", reset);
  $("#hitProfile").addEventListener("change", reset);
  $("#copyHitEvidence").addEventListener("click", async () => {
    const evidence = { simulator: "atlas-hit-lab-v1", physicalProof: false, profile: state.profile, hpAfter: state.hp, events: state.events };
    try { await navigator.clipboard.writeText(JSON.stringify(evidence, null, 2)); $("#copyHitEvidence").textContent = copy[language()].copied; } catch { $("#copyHitEvidence").textContent = "JSON unavailable"; }
  });
  window.addEventListener("atlas-language-change", () => { renderCopy(); reset(); });
  renderCopy(); reset();
})();

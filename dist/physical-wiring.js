(function () {
  const $ = selector => document.querySelector(selector);
  if (!$("#physicalWiring")) return;
  const storageKey = "atlas-physical-wiring-v1";
  const availablePins = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  let state = { pins: { hall: 4, irTx: 5, left: 6, chest: 7, right: 8 }, gates: [] };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch {}
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: {
      label: "BENCH WIRING / CHỈ NGUỒN USB", title: "Sơ đồ dây an toàn trước khi cấp nguồn", status: "PIN TẠM THỜI · PHẢI ĐỐI CHIẾU BOARD", config: "PIN MAP CÓ THỂ ĐỔI",
      pins: ["Hall AO / DRAW", "IR TX / RMT", "Receiver vai trái", "Receiver ngực", "Receiver vai phải"],
      nodes: { hall: ["HALL KY-024", "3V3 · GND", "AO → GPIO{hall} sau khi đo ≤3,3 V"], driver: ["IR DRIVER", "GPIO{irTx} → 1 kΩ → B 2N2222", "5V → 100 Ω → TSAL6200 → C · E → GND"], board: ["MKE-K01 ESP32-S3", "USB-C DATA + POWER", "3V3 LOGIC ONLY · COMMON GND"], left: ["RX LEFT", "TSOP38238", "OUT → GPIO{left} · VS 3V3 qua 100 Ω"], chest: ["RX CHEST", "TSOP38238", "OUT → GPIO{chest} · 4,7 µF sát VS/GND"], right: ["RX RIGHT", "TSOP38238", "OUT → GPIO{right} · active LOW"] },
      calc: "Dòng IR bench ước tính", calcNote: "Đây là phép tính thiết kế, phải đo thực tế bằng đồng hồ.",
      verdictBlocked: "BLOCKED · chưa được cấp nguồn", verdictConflict: "BLOCKED · GPIO bị trùng", verdictReady: "READY FOR USB POWER · lưu ảnh và số đo",
      gates: ["Board chưa cấp nguồn khi đi dây; continuity không chập 5V–GND.","Đã đo AO/DO Hall và mọi output ≤3,3 V.","Đã đối chiếu anode/cathode TSAL6200 và pin OUT/GND/VS của TSOP38238.","Đã tra đúng chân E/B/C của transistor thực nhận.","Tất cả khối dùng chung GND; chưa gắn pin/battery."],
      boundary: "Chỉ cấp nguồn USB sau khi năm kiểm tra đều PASS. Các GPIO chỉ là đề xuất bench, chưa phải pinout sản xuất.", next: "Tiếp theo: ghi 100 lần test"
    },
    en: {
      label: "BENCH WIRING / USB ONLY", title: "Safe wiring map before applying power", status: "PROVISIONAL PINS · MATCH THE RECEIVED BOARD", config: "EDITABLE PIN MAP",
      pins: ["Hall AO / DRAW", "IR TX / RMT", "Left receiver", "Chest receiver", "Right receiver"],
      nodes: { hall: ["HALL KY-024", "3V3 · GND", "AO → GPIO{hall} after meter proves ≤3.3 V"], driver: ["IR DRIVER", "GPIO{irTx} → 1 kΩ → B 2N2222", "5V → 100 Ω → TSAL6200 → C · E → GND"], board: ["MKE-K01 ESP32-S3", "USB-C DATA + POWER", "3V3 LOGIC ONLY · COMMON GND"], left: ["RX LEFT", "TSOP38238", "OUT → GPIO{left} · VS 3V3 through 100 Ω"], chest: ["RX CHEST", "TSOP38238", "OUT → GPIO{chest} · 4.7 µF at VS/GND"], right: ["RX RIGHT", "TSOP38238", "OUT → GPIO{right} · active LOW"] },
      calc: "Estimated bench IR current", calcNote: "This is a design calculation; verify with a meter.",
      verdictBlocked: "BLOCKED · do not apply power", verdictConflict: "BLOCKED · duplicate GPIO", verdictReady: "READY FOR USB POWER · save photos and readings",
      gates: ["Board is unpowered during wiring; continuity finds no 5V–GND short.","Hall AO/DO and every output measured ≤3.3 V.","TSAL6200 polarity and TSOP38238 OUT/GND/VS match their datasheets.","E/B/C was checked for the exact transistor received.","All blocks share GND; no battery is connected."],
      boundary: "Apply USB power only after all five checks pass. GPIO values are bench proposals, not a production pinout.", next: "Next: record 100 trials"
    }
  };
  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  function substitute(text) { return text.replace(/\{(\w+)\}/g, (_, key) => state.pins[key]); }
  function render() {
    const t = copy[lang()]; const pinKeys = ["hall", "irTx", "left", "chest", "right"];
    $("#physicalWiringLabel").textContent = t.label; $("#physicalWiringTitle").textContent = t.title; $("#physicalWiringStatus").textContent = t.status; $("#wiringConfigEyebrow").textContent = t.config;
    $("#wiringMap").innerHTML = ["hall","driver","board","left","chest","right"].map(key => { const node = t.nodes[key]; const kind = ["left","chest","right"].includes(key) ? "receiver" : key; return `<article class="wiring-node" data-kind="${kind}"><b>${node[0]}</b><strong>${substitute(node[1])}</strong><span>${substitute(node[2])}</span><i></i></article>`; }).join("");
    $("#wiringPinGrid").innerHTML = pinKeys.map((key,index) => `<label><span>${t.pins[index]}</span><select data-wiring-pin="${key}">${availablePins.map(pin => `<option value="${pin}" ${pin === Number(state.pins[key]) ? "selected" : ""}>GPIO${pin}</option>`).join("")}</select></label>`).join("");
    const currentMa = ((5 - 1.35 - 0.2) / 100 * 1000).toFixed(1); $("#wiringCalculation").innerHTML = `<strong>${t.calc}: <code>≈ ${currentMa} mA</code></strong><br><code>(5 V − 1,35 V − 0,2 V) ÷ 100 Ω</code><br>${t.calcNote}`;
    $("#wiringGates").innerHTML = t.gates.map((gate,index) => `<label><input type="checkbox" data-wiring-gate="${index}" ${state.gates.includes(index) ? "checked" : ""}><span>${gate}</span></label>`).join("");
    const duplicate = new Set(Object.values(state.pins).map(Number)).size !== pinKeys.length; const ready = !duplicate && state.gates.length === t.gates.length; const verdict = $("#wiringVerdict"); verdict.dataset.state = ready ? "ready" : "blocked"; verdict.textContent = duplicate ? t.verdictConflict : ready ? t.verdictReady : `${t.verdictBlocked} · ${state.gates.length}/5 PASS`;
    if (ready) window.dispatchEvent(new CustomEvent("atlas-journey-complete", { detail: { step: "wire" } }));
    $("#wiringBoundary").textContent = t.boundary; $("#openBenchEvidence").textContent = t.next;
  }
  $("#wiringPinGrid").addEventListener("change", event => { const select = event.target.closest("[data-wiring-pin]"); if (!select) return; state.pins[select.dataset.wiringPin] = Number(select.value); save(); render(); });
  $("#wiringGates").addEventListener("change", event => { const box = event.target.closest("[data-wiring-gate]"); if (!box) return; const index = Number(box.dataset.wiringGate); state.gates = box.checked ? [...new Set([...state.gates,index])] : state.gates.filter(item => item !== index); save(); render(); });
  window.addEventListener("atlas-language-change", render); render();
})();

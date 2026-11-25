(function () {
  // Gate 01 step-by-step assembly, ordered the way parts arrive: order 1 (bow core), order 2
  // (IR parts), then garment + coverage. One data source drives the web checklist and the
  // printable Markdown, and every GPIO comes from the wiring map so the two never disagree.
  const steps = [
    { phase: "core", id: "board-id", gate: null, link: null,
      vi: ["Nhận đúng bo", "Module in chữ ESP32-S3-WROOM-1 (không phải ESP32-WROOM-32 hay C3). Ghi bản N8R2/N16R8/N4, chụp hai mặt bo. Dán băng dính ghi CUNG lên bo 1, GIÁP lên bo 2."],
      en: ["Confirm the boards", "The module reads ESP32-S3-WROOM-1 (not ESP32-WROOM-32 or C3). Note N8R2/N16R8/N4, photograph both sides. Tape a BOW label on board 1 and ARMOUR on board 2."] },
    { phase: "core", id: "board-pins", gate: null, link: null,
      vi: ["Tìm chân trên nhãn in", "Tìm 3V3, 5V, GND và GPIO {hall}, {irTx}, {left}, {chest}, {right}. Bo hai cổng USB-C: tìm cổng ghi COM hoặc UART — luôn cắm cổng này."],
      en: ["Find the pins on the printed labels", "Find 3V3, 5V, GND and GPIO {hall}, {irTx}, {left}, {chest}, {right}. On a two-port board find the port labelled COM or UART and always use it."] },
    { phase: "core", id: "flash", gate: null, link: null,
      vi: ["Nạp firmware khi bo còn trống", "Chưa nối gì. VS Code + PlatformIO: mở firmware/arc-bow → Upload vào bo CUNG; mở firmware/impact-armour → Upload vào bo GIÁP. Serial Monitor 115200, nhấn RST: phải thấy ATLAS_PROP_READY. Rút USB."],
      en: ["Flash firmware while the boards are bare", "Nothing connected. VS Code + PlatformIO: open firmware/arc-bow → Upload to the BOW board; open firmware/impact-armour → Upload to the ARMOUR board. Serial Monitor at 115200, press RST: ATLAS_PROP_READY must appear. Unplug USB."] },
    { phase: "core", id: "seat", gate: null, link: null,
      vi: ["Cắm bo cung lên breadboard", "Cắm bo ngang qua rãnh giữa breadboard để hai hàng chân không bị nối tắt với nhau. USB vẫn rút."],
      en: ["Seat the bow board", "Place it across the breadboard's centre gap so the two pin rows are not shorted together. USB stays unplugged."] },
    { phase: "core", id: "hall-power", gate: null, link: null,
      vi: ["Cấp nguồn cho KY-024 (chưa nối AO)", "Chân + của KY-024 → 3V3 (không dùng 5V). Chân G → GND. Không nối DO. Chưa nối AO."],
      en: ["Power the KY-024 (AO not yet connected)", "KY-024 + → 3V3 (not 5V). G → GND. Leave DO unconnected. Do not connect AO yet."] },
    { phase: "core", id: "continuity", gate: 0, link: "#physicalWiring",
      vi: ["Đo chập trước khi cấp điện", "Đồng hồ ở chế độ kêu bíp: 5V–GND và 3V3–GND không được kêu. Kêu là có chập — tìm dây sai trước khi cắm USB."],
      en: ["Check for shorts before power", "Meter on continuity: 5V–GND and 3V3–GND must not beep. A beep is a short — find the wrong wire before plugging USB."] },
    { phase: "core", id: "measure-ao", gate: 1, link: "#physicalWiring",
      vi: ["Đo chân AO", "Cắm USB. Đo DC giữa AO và GND, đưa nam châm lại gần bằng cả hai mặt: số đo phải luôn ≤ 3,3 V. Ghi lại số lớn nhất. Rút USB."],
      en: ["Measure AO", "Plug USB. Measure DC between AO and GND while bringing each face of the magnet close: it must stay ≤ 3.3 V. Note the highest reading. Unplug USB."] },
    { phase: "core", id: "connect-ao", gate: null, link: null,
      vi: ["Nối AO vào GPIO", "USB rút. AO của KY-024 → GPIO{hall}."],
      en: ["Connect AO", "USB unplugged. KY-024 AO → GPIO{hall}."] },
    { phase: "core", id: "stage-1", gate: 4, link: "#physicalWiring",
      vi: ["Tick giai đoạn 1 trên web", "Ở Sơ đồ dây: tick kiểm tra 1, 2, 5 và ô \"Giai đoạn 1 · chỉ lõi cung\". Campaign 01 mở khóa; campaign 02 vẫn khóa."],
      en: ["Tick stage 1 on the page", "In the wiring map tick checks 1, 2, 5 and \"Stage 1 · bow core only\". Campaign 01 unlocks; campaign 02 stays locked."] },
    { phase: "core", id: "connect-bow", gate: null, link: "#benchEvidence",
      vi: ["Kết nối cung với web", "Cắm USB, bấm \"Kết nối cung\" (Chrome/Edge). Thẻ bo phải xanh: \"Chân khớp sơ đồ dây\". Nếu báo mức nghỉ sát 0/4095 → kiểm tra dây AO, 3V3, GND."],
      en: ["Connect the bow to the page", "Plug USB, press \"Connect bow\" (Chrome/Edge). The board card must turn green: \"Pins match the wiring map\". A rest level near 0/4095 means checking the AO, 3V3 and GND wires."] },
    { phase: "core", id: "place-magnet", gate: null, link: "#benchEvidence",
      vi: ["Đặt nam châm bằng thanh Hall trực tiếp", "Bấm \"Đo Hall trực tiếp\". Gắn nam châm lên que (giả dây cung), cố định cảm biến bằng băng dính. Kéo hết cỡ: thanh vượt vạch READY rõ ràng; thả: về dưới vạch START. Khi đứng yên bấm \"Đặt lại mức nghỉ\", rồi tắt đo Hall."],
      en: ["Place the magnet with the live Hall bar", "Press \"Live Hall reading\". Tape the magnet to a stick (stand-in string) and fix the sensor. Full draw: clearly past READY; release: below START. At rest press \"Re-measure rest\", then stop the reading."] },
    { phase: "core", id: "campaign-1", gate: null, link: "#benchEvidence",
      vi: ["Campaign 01: 100 lần kéo/thả", "Mỗi lần kéo hết cỡ rồi thả. Web tự ghi PASS/DUPLICATE/REJECT. Lần thả mà log không có FIRE → bấm MISS bằng tay. Đủ 100 sạch → Tải CSV."],
      en: ["Campaign 01: 100 draw/releases", "Each time draw fully and release. The page records PASS/DUPLICATE/REJECT. A release with no FIRE in the log → press MISS by hand. 100 clean → Download CSV."] },
    { phase: "ir", id: "unplug", gate: null, link: null,
      vi: ["Rút USB cả hai bo", "Mọi thay đổi dây làm khi bo không có điện."],
      en: ["Unplug both boards", "Every wiring change is done with the boards unpowered."] },
    { phase: "ir", id: "transistor", gate: 3, link: "#physicalWiring",
      vi: ["Tra chân transistor", "Đọc mã in trên 2N2222A, tra datasheet của đúng mã đó để biết E-B-C (mỗi hãng xếp khác). Chụp ảnh kèm ghi chú."],
      en: ["Identify the transistor pins", "Read the marking on the 2N2222A and look up E-B-C in that exact part's datasheet (makers differ). Photograph it with a note."] },
    { phase: "ir", id: "polarity", gate: 2, link: "#physicalWiring",
      vi: ["Xác định cực LED và mắt thu", "TSAL6200: chân dài là cực dương (+). TSOP38238: nhìn mặt có vòm, chân chĩa xuống, trái → phải là OUT – GND – VS."],
      en: ["Identify LED and receiver pins", "TSAL6200: the long lead is the anode (+). TSOP38238: dome facing you, leads down, left → right is OUT – GND – VS."] },
    { phase: "ir", id: "driver", gate: null, link: null,
      vi: ["Lắp mạch phát trên bo cung", "GPIO{irTx} → điện trở 1 kΩ → chân B. Chân E → GND. 5V → điện trở 100 Ω → chân + của TSAL6200; chân − → chân C. Gập chân để LED chĩa ngang ra mép bàn, không chĩa vào mắt."],
      en: ["Build the emitter on the bow board", "GPIO{irTx} → 1 kΩ → B. E → GND. 5V → 100 Ω → TSAL6200 anode; cathode → C. Bend the leads so the LED points sideways off the bench, never at eyes."] },
    { phase: "ir", id: "receivers", gate: null, link: null,
      vi: ["Lắp mắt thu trên bo giáp", "Bo giáp cắm breadboard thứ hai. Mỗi mắt thu: 3V3 → 100 Ω → VS; tụ 4,7 µF từ VS xuống GND sát chân (chân dài của tụ phía VS); GND → GND; OUT → GPIO{left} (vai trái), GPIO{chest} (ngực), GPIO{right} (vai phải). Làm mắt ngực trước."],
      en: ["Build the receivers on the armour board", "Seat the armour board on the second breadboard. Each receiver: 3V3 → 100 Ω → VS; 4.7 µF from VS to GND right at the pins (long lead to VS); GND → GND; OUT → GPIO{left} (left), GPIO{chest} (chest), GPIO{right} (right). Start with the chest."] },
    { phase: "ir", id: "continuity-2", gate: 0, link: "#physicalWiring",
      vi: ["Đo chập lần hai", "Cả hai bo: 5V–GND và 3V3–GND không kêu bíp. Tick kiểm tra 3 và 4 — sơ đồ dây phải báo READY FOR USB POWER."],
      en: ["Second short check", "Both boards: 5V–GND and 3V3–GND must not beep. Tick checks 3 and 4 — the wiring map must say READY FOR USB POWER."] },
    { phase: "ir", id: "connect-both", gate: null, link: "#benchEvidence",
      vi: ["Kết nối cả hai bo", "Laptop ở giữa: cung cáp 1 m, giáp qua cáp nối dài. Bấm kết nối cả hai — bấm nhầm nút cũng được, web tự nhận đúng bo. Hai thẻ phải xanh."],
      en: ["Connect both boards", "Laptop in the middle: bow on a 1 m cable, armour on the extension. Connect both — the wrong button is fine, the page identifies each board. Both cards must be green."] },
    { phase: "ir", id: "first-shot", gate: null, link: "#benchEvidence",
      vi: ["Phát bắn đầu tiên ở 1 m", "Chĩa LED vào mắt ngực, kéo và thả. Log phải có HIT PASS khoảng 110 ms. MISS: soi LED bằng camera trước điện thoại (thấy chớp tím khi bắn); không chớp → kiểm tra GPIO{irTx}, transistor, chiều LED."],
      en: ["First shot at 1 m", "Aim the LED at the chest receiver, draw and release. The log must show HIT PASS near 110 ms. MISS: watch the LED through a phone's front camera (a violet flash on each shot); no flash → check GPIO{irTx}, the transistor and LED polarity."] },
    { phase: "ir", id: "campaign-2", gate: null, link: "#benchEvidence",
      vi: ["Campaign 02: 100 phát", "100 phát ở 1 m thẳng. Đủ 100 sạch → Tải CSV, rồi chạy: node scripts/check-bench-evidence.mjs atlas-hit-bench-evidence.csv"],
      en: ["Campaign 02: 100 shots", "100 shots at 1 m centre. 100 clean → Download CSV, then run: node scripts/check-bench-evidence.mjs atlas-hit-bench-evidence.csv"] },
    { phase: "wear", id: "mockup", gate: null, link: "#armourFitGate",
      vi: ["Gắn mắt thu lên áo bìa", "Nối dài dây OUT/VS/GND bằng dây đực-cái, gắn 3 mắt thu lên áo bìa ở vai trái, ngực, vai phải. Mạch lọc 100 Ω + 4,7 µF vẫn để sát mắt thu."],
      en: ["Mount receivers on the cardboard bib", "Extend OUT/VS/GND with male-female jumpers and mount the three receivers at left shoulder, chest and right shoulder. Keep the 100 Ω + 4.7 µF filter next to each receiver."] },
    { phase: "wear", id: "fit", gate: null, link: "#armourFitGate",
      vi: ["Thử áo hai người", "Người nhỏ nhất và lớn nhất mặc 5 phút; ghi số đo và 4 kiểm tra ở phần Fit."],
      en: ["Two-person fit", "Smallest and largest wearer for 5 minutes each; record measurements and the four checks under Fit."] },
    { phase: "wear", id: "matrix", gate: null, link: "#armourFitGate",
      vi: ["Bảng 15 ô dưới ánh sáng sự kiện", "Mốc 1 m, 3 m, 5 m thẳng và 3 m lệch 30° (2,6 m tới trước, 1,5 m sang ngang). Mỗi ô một phát, đúng vùng báo trúng."],
      en: ["15-cell matrix under event light", "Marks at 1 m, 3 m, 5 m centre and 3 m at 30° (2.6 m forward, 1.5 m sideways). One shot per cell; the correct zone must report."] },
    { phase: "wear", id: "measure", gate: null, link: null,
      vi: ["Đo linh kiện thật cho CAD", "Đo kích thước bo, cảm biến, LED, mắt thu thật bằng thước kẹp trước khi sửa hốc trong file CAD."],
      en: ["Measure the received parts for CAD", "Caliper the real board, sensor, LED and receivers before editing the CAD cavities."] }
  ];
  const phases = {
    core: { vi: ["ĐƠN 1 VỀ", "Lõi cung + cảm biến kéo"], en: ["ORDER 1 ARRIVES", "Bow core + draw sensor"] },
    ir: { vi: ["ĐƠN 2 VỀ", "Phát và nhận hồng ngoại"], en: ["ORDER 2 ARRIVES", "IR emitter and receivers"] },
    wear: { vi: ["ÁO + PHỦ", "Áo bìa và bảng 15 ô"], en: ["GARMENT + COVERAGE", "Cardboard bib and 15-cell matrix"] }
  };
  const gateNames = { vi: ["kiểm tra 1", "kiểm tra 2", "kiểm tra 3", "kiểm tra 4", "kiểm tra 5"], en: ["check 1", "check 2", "check 3", "check 4", "check 5"] };
  window.ATLAS_GATE01_ASSEMBLY = { steps, phases };

  const $ = selector => document.querySelector(selector);
  if (!$("#gate01Assembly")) return;
  const key = "atlas-gate01-assembly-v1";
  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch {}
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: { label: "GATE 01 / LẮP TỪNG BƯỚC", title: "Hàng về là cắm theo thứ tự này", status: (n, total) => `${n} / ${total} BƯỚC`, print: "Tải bản in (.md)", reset: "Bỏ tick tất cả", open: "Mở", gate: "liên quan", note: "Chân GPIO lấy từ Sơ đồ dây bên dưới; đổi ở đó thì hướng dẫn đổi theo. Mọi thay đổi dây làm khi bo đã rút USB.", confirm: "Bỏ tick toàn bộ hướng dẫn lắp?" },
    en: { label: "GATE 01 / STEP BY STEP", title: "When parts arrive, wire in this order", status: (n, total) => `${n} / ${total} STEPS`, print: "Download printable (.md)", reset: "Untick all", open: "Open", gate: "relates to", note: "GPIO numbers come from the wiring map below; change them there and this guide follows. Every wiring change is done with USB unplugged.", confirm: "Untick the whole assembly guide?" }
  };
  const pins = () => { try { return { hall: 4, irTx: 5, left: 6, chest: 7, right: 8, ...(JSON.parse(localStorage.getItem("atlas-physical-wiring-v1") || "{}").pins || {}) }; } catch { return { hall: 4, irTx: 5, left: 6, chest: 7, right: 8 }; } };
  const fill = text => { const map = pins(); return text.replace(/\{(\w+)\}/g, (_, name) => map[name] ?? `{${name}}`); };
  const escape = text => String(text).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
  const save = () => localStorage.setItem(key, JSON.stringify([...done]));

  function render() {
    const l = lang(); const t = copy[l];
    $("#gate01AssemblyLabel").textContent = t.label;
    $("#gate01AssemblyTitle").textContent = t.title;
    $("#gate01AssemblyStatus").textContent = t.status(steps.filter(step => done.has(step.id)).length, steps.length);
    $("#gate01AssemblyNote").textContent = t.note;
    $("#gate01AssemblyPrint").textContent = t.print;
    $("#gate01AssemblyReset").textContent = t.reset;
    let number = 0;
    $("#gate01AssemblyPhases").innerHTML = Object.entries(phases).map(([phase, names]) => {
      const list = steps.filter(step => step.phase === phase);
      const finished = list.filter(step => done.has(step.id)).length;
      return `<section class="assembly-phase" data-complete="${finished === list.length}"><header><span>${names[l][0]}</span><strong>${names[l][1]}</strong><em>${finished}/${list.length}</em></header><ol>${list.map(step => {
        number++;
        const [title, body] = step[l];
        const extras = [step.gate != null ? `<small>${t.gate} ${gateNames[l][step.gate]}</small>` : "", step.link ? `<a href="${step.link}">${t.open} →</a>` : ""].join("");
        return `<li data-done="${done.has(step.id)}"><label><input type="checkbox" data-assembly-step="${step.id}" ${done.has(step.id) ? "checked" : ""}><b>${number}</b><span><strong>${escape(fill(title))}</strong><span>${escape(fill(body))}</span></span></label>${extras ? `<div class="assembly-step-extras">${extras}</div>` : ""}</li>`;
      }).join("")}</ol></section>`;
    }).join("");
  }

  function markdown() {
    const l = lang(); let number = 0;
    const lines = [`# Atlas Gate 01 — ${copy[l].title}`, "", `> ${copy[l].note}`, ""];
    for (const [phase, names] of Object.entries(phases)) {
      lines.push(`## ${names[l][0]} · ${names[l][1]}`, "");
      for (const step of steps.filter(item => item.phase === phase)) {
        number++;
        const [title, body] = step[l];
        lines.push(`- [${done.has(step.id) ? "x" : " "}] **${number}. ${fill(title)}** — ${fill(body)}${step.gate != null ? ` _(${copy[l].gate} ${gateNames[l][step.gate]})_` : ""}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  $("#gate01AssemblyPhases").addEventListener("change", event => {
    const box = event.target.closest("[data-assembly-step]"); if (!box) return;
    if (box.checked) done.add(box.dataset.assemblyStep); else done.delete(box.dataset.assemblyStep);
    save(); render();
  });
  $("#gate01AssemblyPrint").addEventListener("click", () => {
    const blob = new Blob([markdown()], { type: "text/markdown" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `atlas-gate01-assembly-${lang()}.md`; link.click(); URL.revokeObjectURL(link.href);
  });
  $("#gate01AssemblyReset").addEventListener("click", () => { if (!done.size || !confirm(copy[lang()].confirm)) return; done = new Set(); save(); render(); });
  window.addEventListener("atlas-wiring-change", render);
  window.addEventListener("atlas-language-change", render);
  render();
})();

(function () {
  const $ = selector => document.querySelector(selector);
  if (!$("#projectHandoff")) return;
  const copy = {
    vi: {
      label: "PROTOTYPE 01 / BÀN GIAO", title: "Arc Bow + giáp dùng chung đang ở đâu?", status: "4/5 DIGITAL PASS · PHẦN CỨNG BLOCKED",
      nextEyebrow: "BƯỚC TIẾP THEO ÍT TỐN NHẤT", nextTitle: "Không làm thêm 3D trước khi qua bench proof", json: "Tải hồ sơ bàn giao JSON", md: "Tải checklist Markdown", open: "Mở Hardware Gate",
      gates: [["01 · PASS","Luồng làm sản phẩm","Bắt đầu → thiết kế → mua → test → lắp → hit test → nghiệm thu."],["02 · PASS","Giáp Hero/Boss dùng chung","Ba vùng nhận, một phần cứng; profile game đổi máu và hiệu ứng."],["03 · PASS","Liên kết linh kiện","Mỗi part nối được mua gì, đặt ở đâu, dây, bước lắp và test."],["04 · PASS","Logic hit có chống lặp","Giáp phải xác nhận trước khi game trừ máu; miss/reject không gây damage."],["05 · BLOCKED","Bằng chứng phần cứng thật","Cần mua một bộ tối thiểu, đo IR/độ vừa/pin/nhiệt/latency và ghi kết quả."]],
      next: ["Chốt đúng board ESP32-S3, Hall + nam châm và một cặp IR emitter/receiver.","Test trên bàn bằng USB; lưu log 100 lần kéo/thả và 100 packet hit.","Làm một bib carton/EVA ba vùng, thử trên người nhỏ nhất và lớn nhất.","Chỉ sau PASS mới đo khoang, sửa CAD và đặt in 3D/vỏ hoàn thiện."]
    },
    en: {
      label: "PROTOTYPE 01 / HANDOFF", title: "Where does the Arc Bow + shared armour stand?", status: "4/5 DIGITAL PASS · PHYSICAL BLOCKED",
      nextEyebrow: "LOWEST-COST NEXT STEP", nextTitle: "Do not add more 3D detail before bench proof", json: "Download handoff JSON", md: "Download Markdown checklist", open: "Open Hardware Gate",
      gates: [["01 · PASS","Product journey","Start → design → buy → bench → assemble → hit test → acceptance."],["02 · PASS","Shared Hero/Boss armour","Three zones and one hardware build; game profiles change health and feedback."],["03 · PASS","Linked components","Every part connects purchase, placement, wiring, assembly, and test."],["04 · PASS","De-duplicated hit logic","Armour confirms before damage; misses and rejects apply no damage."],["05 · BLOCKED","Real hardware evidence","Buy one minimal set and measure IR, fit, pins, heat, and latency."]],
      next: ["Confirm the exact ESP32-S3 board, Hall sensor and magnet, and one IR emitter/receiver pair.","Bench-test over USB; save 100 draw/release trials and 100 hit packets.","Make one three-zone cardboard/EVA bib and fit the smallest and largest wearer.","Only after PASS, measure cavities, revise CAD, and order finished prints or shells."]
    }
  };
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  function render() {
    const t = copy[lang()];
    $("#projectHandoffLabel").textContent = t.label; $("#projectHandoffTitle").textContent = t.title; $("#projectHandoffStatus").textContent = t.status;
    $("#projectNextEyebrow").textContent = t.nextEyebrow; $("#projectNextTitle").textContent = t.nextTitle; $("#downloadHandoffJson").textContent = t.json; $("#downloadHandoffMd").textContent = t.md; $("#openHardwareGate").textContent = t.open;
    $("#projectGates").innerHTML = t.gates.map((gate, index) => `<article data-gate="${index + 1}" class="${index === 4 ? "is-blocked" : ""}"><b>${gate[0]}</b><strong>${gate[1]}</strong><span>${gate[2]}</span></article>`).join("");
    ["One", "Two", "Three", "Four"].forEach((suffix, index) => { $("#projectNext" + suffix).textContent = t.next[index]; });
  }
  $("#downloadHandoffJson").addEventListener("click", () => {
    const graph = window.ATLAS_BUILD_GRAPH || {};
    const armour = window.ATLAS_IMPACT_ARMOUR || {};
    const payload = {
      schema: "atlas-prototype-handoff/v1", projectId: graph.projectId || "arc-bow-impact-armour-proof-01", generatedAt: new Date().toISOString(),
      status: { digitalGatesPassed: 4, totalGates: 5, physicalProof: false, manufacturingReady: false },
      components: graph.components || [], armour,
      nextGate: ["confirm exact ESP32-S3 and IR parts", "USB bench test", "100 bow release trials", "100 hit packet trials", "S-to-XL wearable fit test", "measure final cavities before CAD release"]
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "atlas-arc-bow-impact-armour-handoff.json"; link.click(); URL.revokeObjectURL(link.href);
    window.dispatchEvent(new CustomEvent("atlas-journey-complete", { detail: { step: "export" } }));
  });
  window.addEventListener("atlas-language-change", render);
  render();
})();

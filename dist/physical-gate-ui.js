(function () {
  const kit = window.ATLAS_PHYSICAL_KIT;
  const $ = selector => document.querySelector(selector);
  if (!kit || !$("#physicalGate")) return;
  let selected = kit.parts[0].id;
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const copy = {
    vi: { label: "PHYSICAL GATE / BENCH KIT 01", title: "Mua tối thiểu để chứng minh cung bắn và giáp nhận", state: "CHƯA MUA · CHƯA ĐO", estimate: "ƯỚC TÍNH", now: "MUA TRƯỚC", later: "CHƯA MUA", estimateNote: "Không gồm vận chuyển và vỏ hoàn thiện", nowNote: "Chỉ đồ test trên bàn", laterNote: "Pin, PCB, vỏ in 3D", why: "Dùng để làm gì", verify: "Phải kiểm tra khi nhận", sources: "Nguồn tham chiếu", boundary: "Nguồn bán chỉ là đường dẫn tham chiếu. Phải đối chiếu đúng mã linh kiện và đo điện áp trước khi nối ESP32.", next: "Tiếp theo: xem sơ đồ dây", buy: "MUA GATE 01", defer: "ĐỂ SAU" },
    en: { label: "PHYSICAL GATE / BENCH KIT 01", title: "Buy the minimum needed to prove bow-to-armour hits", state: "NOT BOUGHT · NOT MEASURED", estimate: "ESTIMATE", now: "BUY FIRST", later: "DO NOT BUY", estimateNote: "Excludes shipping and finished shells", nowNote: "Bench-proof items only", laterNote: "Battery, PCB, and 3D shells", why: "Why it exists", verify: "Verify on arrival", sources: "Reference sources", boundary: "Seller links are references. Match the exact part code and measure voltage before connecting an ESP32.", next: "Next: open wiring map", buy: "GATE 01", defer: "DEFER" }
  };
  function money(value) { return new Intl.NumberFormat(lang() === "vi" ? "vi-VN" : "en-US").format(value) + " ₫"; }
  function render() {
    const t = copy[lang()]; const buy = kit.parts.filter(part => part.buyNow); const min = buy.reduce((sum, part) => sum + part.priceVnd[0], 0); const max = buy.reduce((sum, part) => sum + part.priceVnd[1], 0);
    $("#physicalGateLabel").textContent = t.label; $("#physicalGateTitle").textContent = t.title; $("#physicalGateState").textContent = t.state;
    $("#physicalBudgetLabel").textContent = t.estimate; $("#physicalBudget").textContent = `${money(min)}–${money(max)}`; $("#physicalBudgetNote").textContent = t.estimateNote;
    $("#physicalNowLabel").textContent = t.now; $("#physicalNowCount").textContent = `${buy.length} groups`; $("#physicalNowNote").textContent = t.nowNote;
    $("#physicalLaterLabel").textContent = t.later; $("#physicalLaterCount").textContent = `${kit.parts.length - buy.length} group`; $("#physicalLaterNote").textContent = t.laterNote;
    $("#physicalGateBoundary").textContent = t.boundary; $("#openPhysicalWiring").textContent = t.next;
    $("#physicalKitList").innerHTML = kit.parts.map((part, index) => `<button type="button" data-physical-part="${part.id}" class="${part.id === selected ? "is-active" : ""}"><b>${String(index + 1).padStart(2,"0")}</b><span><strong>${part.name[lang()]}</strong><small>${part.id}</small></span><em data-buy-now="${part.buyNow}">${part.buyNow ? t.buy : t.defer}</em></button>`).join("");
    const part = kit.parts.find(item => item.id === selected) || kit.parts[0];
    $("#physicalKitDetail").innerHTML = `<div class="physical-detail-head"><div><span>${part.id}</span><h3>${part.name[lang()]}</h3></div><b>${part.qty || "—"}×</b></div><section><h4>${t.why}</h4><p>${part.why[lang()]}</p></section><section class="is-warning"><h4>${t.verify}</h4><p>${part.verify[lang()]}</p></section><section><h4>${t.sources}</h4><div class="physical-source-links">${part.sources.length ? part.sources.map(source => `<a href="${source.url}" target="_blank" rel="noreferrer"><span>${source.kind}</span>${source.label}</a>`).join("") : `<span>${t.defer}</span>`}</div></section>`;
  }
  $("#physicalKitList").addEventListener("click", event => { const button = event.target.closest("[data-physical-part]"); if (!button) return; selected = button.dataset.physicalPart; render(); });
  window.addEventListener("atlas-language-change", render); render();
})();

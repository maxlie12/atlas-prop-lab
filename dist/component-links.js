(function () {
  const graph = window.ATLAS_BUILD_GRAPH;
  if (!graph) return;
  const $ = selector => document.querySelector(selector);
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  let subsystem = "bow";
  let selectedId = graph.components[0].id;
  const copy = {
    vi: { label: "MỘT PART ID / MỌI GÓC NHÌN", title: "Chọn linh kiện để biết mua gì và đặt ở đâu", buy: "Mua gì", place: "Đặt ở đâu", wire: "Nối như nào", test: "Điều kiện PASS", view: "Xem vị trí 3D", assembly: "Mở bước lắp", bench: "Mở test mạch", states: { referenced: "CÓ NGUỒN THAM CHIẾU", unverified: "CHƯA TEST", assumed: "GIẢ ĐỊNH", "missing-physical-proof": "THIẾU PROOF THẬT" } },
    en: { label: "ONE PART ID / EVERY VIEW", title: "Select a part to see what to buy and where it belongs", buy: "What to buy", place: "Where it goes", wire: "How it connects", test: "PASS gate", view: "Show in 3D", assembly: "Open assembly step", bench: "Open bench test", states: { referenced: "REFERENCED", unverified: "UNVERIFIED", assumed: "ASSUMED", "missing-physical-proof": "PHYSICAL PROOF MISSING" } }
  };

  function selected() { return graph.components.find(item => item.id === selectedId) || graph.components[0]; }
  function render() {
    const t = copy[lang()];
    $("#linkedPartsLabel").textContent = t.label; $("#linkedPartsTitle").textContent = t.title;
    document.querySelectorAll("[data-linked-subsystem]").forEach(button => button.classList.toggle("is-active", button.dataset.linkedSubsystem === subsystem));
    const items = graph.components.filter(item => item.subsystem === subsystem);
    if (!items.some(item => item.id === selectedId)) selectedId = items[0].id;
    $("#linkedPartsList").innerHTML = items.map((item, index) => `<button type="button" data-linked-part="${item.id}" class="${item.id === selectedId ? "is-active" : ""}"><b>${String(index + 1).padStart(2, "0")}</b><span><strong>${item.label[lang()]}</strong><small>${item.id}</small></span><em>${t.states[item.evidence] || item.evidence}</em></button>`).join("");
    const item = selected();
    $("#linkedPartDetail").innerHTML = `
      <div class="linked-detail-head"><div><span>${item.id}</span><h3>${item.label[lang()]}</h3></div><b data-evidence="${item.evidence}">${t.states[item.evidence] || item.evidence}</b></div>
      <div class="linked-detail-grid">
        <section><h4>${t.buy}</h4><p>${item.purchase[lang()]}</p></section>
        <section><h4>${t.place}</h4><p>${item.placement[lang()]}</p></section>
        <section><h4>${t.wire}</h4><p><code>${item.wiring}</code></p></section>
        <section><h4>${t.test}</h4><p>${item.test[lang()]}</p></section>
      </div>
      <div class="linked-detail-actions">
        <button type="button" class="button secondary" data-linked-action="view">${t.view}</button>
        <button type="button" class="button secondary" data-linked-action="assembly">${t.assembly}</button>
        <button type="button" class="button ghost" data-linked-action="bench">${t.bench}</button>
      </div>`;
  }

  function selectBowRole() { document.querySelector("[data-prop='archer']")?.click(); }
  function openAction(action) {
    const item = selected();
    if (action === "bench") {
      selectBowRole(); if (typeof showView === "function") showView("prototype");
      requestAnimationFrame(() => document.getElementById("prototype-title")?.scrollIntoView({ behavior: "smooth" }));
      return;
    }
    if (item.subsystem === "armour") {
      if (typeof showView === "function") showView("event-kit");
      document.querySelectorAll("[data-impact-zone]").forEach(zone => zone.classList.toggle("is-linked", item.id === "armour-ir-zones" || item.id === "armour-zone-feedback"));
      document.getElementById("impactArmourSystem")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    selectBowRole();
    if (action === "assembly") {
      if (typeof showView === "function") showView("event-kit");
      requestAnimationFrame(() => {
        document.querySelector(`[data-guided-step="${item.assemblyStep}"]`)?.click();
        document.getElementById("guided-build-title")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }
    window.ATLAS_PENDING_PART = { prop: "archer", modelKey: item.manifest.modelKey };
    if (item.manifest.modelKey) {
      window.dispatchEvent(new CustomEvent("atlas-select-prop-part", { detail: window.ATLAS_PENDING_PART }));
    }
    if (typeof showView === "function") showView("event-kit");
    requestAnimationFrame(() => document.getElementById("threePropStage")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  $("#linkedPartsList")?.addEventListener("click", event => { const button = event.target.closest("[data-linked-part]"); if (button) { selectedId = button.dataset.linkedPart; render(); } });
  document.querySelector(".linked-subsystem-switch")?.addEventListener("click", event => {
    const button = event.target.closest("[data-linked-subsystem]"); if (!button) return;
    subsystem = button.dataset.linkedSubsystem; selectedId = graph.components.find(item => item.subsystem === subsystem)?.id; render();
  });
  $("#linkedPartDetail")?.addEventListener("click", event => { const button = event.target.closest("[data-linked-action]"); if (button) openAction(button.dataset.linkedAction); });
  window.addEventListener("atlas-language-change", render);
  render();
})();

(function () {
  // Teardown panel and the step bar on the 3D stage. This script owns the step state, so the panel
  // works even when WebGL does not load; three-lab.js draws whatever state it announces.
  const data = window.ATLAS_TEARDOWN;
  const panel = document.querySelector("#teardownPanel");
  if (!data || !panel) return;
  const $ = selector => document.querySelector(selector);
  const lang = () => document.documentElement.lang === "en" ? "en" : "vi";
  const STORE = "atlas-teardown-v1";
  const names = {
    guardian: ["Aegis Shield", "Khiên Aegis"], warrior: ["Pulse Sword", "Kiếm Pulse"], archer: ["Arc Bow", "Cung Arc"],
    assassin: ["Shade Daggers", "Dao găm Shade"], mage: ["Lumen Staff", "Gậy Lumen"], boss: ["Dark Knight greatsword + armour", "Đại kiếm + giáp Hiệp sĩ Hắc giáp"]
  };
  const copy = {
    vi: {
      eyebrow: "TEARDOWN · THÁO RỜI TỪNG LỚP", title: name => `${name} · tháo rời`,
      intro: "Tháo đạo cụ theo đúng thứ tự bảo trì: phần lắp sau cùng ra trước. Mỗi bước hiện linh kiện được tháo ra, việc cần kiểm, giá ước tính và chỗ tìm mua.",
      on: "Thoát tháo rời", off: "Tháo rời (Teardown)", play: "▶ Tự chạy", pause: "❚❚ Dừng", reset: "Về đầu",
      prev: "◀ Bước trước", next: "Bước tiếp ▶", step: "Bước", parts: "linh kiện", none: "Tổng quan: chưa tháo gì. Bấm Bước tiếp để bắt đầu.",
      caution: "An toàn", verify: "Kiểm tra", each: "/ cái", line: "thành tiền", shop: "Tìm trên Shopee ↗",
      thisStep: "Bước này", soFar: "Đã tháo tới đây", whole: "Cả đạo cụ", bom: count => `Bảng linh kiện của đạo cụ (${count} linh kiện)`,
      th: ["Linh kiện", "SL", "Đơn giá", "Nhóm", "Tháo ở bước"], download: "Tải bảng teardown (.md)",
      hint: "Bấm vào một bộ phận trên mô hình 3D để nhảy tới bước tháo nó.",
      note: "Giá là khoảng ước tính từ cửa hàng linh kiện và tìm kiếm Shopee (11/2026), chưa gồm phí ship; kiểm lại trước khi đặt. Link là trang tìm kiếm Shopee, không phải một shop cụ thể.",
      boss: "Boss là hai thiết bị: đại kiếm và giáp nhận hit, nên có hai bo ESP32.",
      stage: (step, last, title) => step ? `Bước ${step}/${last} · ${title}` : `Tổng quan · ${last} bước`
    },
    en: {
      eyebrow: "TEARDOWN · LAYER BY LAYER", title: name => `${name} · teardown`,
      intro: "Take the prop apart in real service order: what went on last comes off first. Each step shows the parts that come out, what to check, an estimated price and where to look for it.",
      on: "Exit teardown", off: "Teardown", play: "▶ Play", pause: "❚❚ Pause", reset: "Restart",
      prev: "◀ Previous", next: "Next ▶", step: "Step", parts: "parts", none: "Overview: nothing removed yet. Press Next to begin.",
      caution: "Safety", verify: "Check", each: "each", line: "line", shop: "Search on Shopee ↗",
      thisStep: "This step", soFar: "Removed so far", whole: "Whole prop", bom: count => `Bill of materials (${count} parts)`,
      th: ["Part", "Qty", "Unit price", "Group", "Removed at step"], download: "Download teardown (.md)",
      hint: "Click any part of the 3D model to jump to the step that removes it.",
      note: "Prices are estimated ranges from component shops and Shopee searches (Nov 2026), shipping excluded; recheck before ordering. Links open a Shopee search, not a specific shop.",
      boss: "The boss is two devices, greatsword and hit armour, so it has two ESP32 boards.",
      stage: (step, last, title) => step ? `Step ${step}/${last} · ${title}` : `Overview · ${last} steps`
    }
  };
  let remembered = {};
  try { remembered = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch { remembered = {}; }
  const validProp = prop => data.props[prop] ? prop : null;
  const steps = () => data.props[state.prop].steps;
  const clamp = step => Math.max(0, Math.min(steps().length - 1, Math.round(Number(step) || 0)));
  const state = { prop: validProp($("#roleSelect")?.value) || "guardian", step: 0, active: false };
  state.step = clamp(remembered[state.prop]);
  let playTimer = null;

  const money = value => `${new Intl.NumberFormat(lang() === "vi" ? "vi-VN" : "en-US").format(value)} ₫`;
  const range = ([low, high]) => low === high ? money(low) : `${money(low).replace(" ₫", "")}–${money(high)}`;
  const sum = list => list.reduce((acc, [id, qty]) => { const price = data.catalog[id].priceVnd; acc[0] += price[0] * qty; acc[1] += price[1] * qty; return acc; }, [0, 0]);
  const escape = text => String(text).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const partCount = step => step.parts.reduce((total, [, qty]) => total + qty, 0);

  function bom() {
    const rows = new Map();
    steps().forEach((step, index) => step.parts.forEach(([id, qty]) => {
      const row = rows.get(id) || { id, qty: 0, steps: [] };
      row.qty += qty; if (!row.steps.includes(index)) row.steps.push(index); rows.set(id, row);
    }));
    return [...rows.values()];
  }
  function stepFor(id) { return steps().findIndex(step => step.detach.includes(id)); }

  function announce(reason) {
    try { remembered[state.prop] = state.step; localStorage.setItem(STORE, JSON.stringify(remembered)); } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent("atlas-teardown-change", { detail: { ...state, reason } }));
  }
  function setStep(step, { activate = true } = {}) {
    state.step = clamp(step);
    if (activate) state.active = true;
    render(); announce("step");
  }
  function setActive(active) {
    state.active = Boolean(active);
    if (!state.active) stopPlay();
    render(); announce("active");
  }
  function stopPlay() { clearInterval(playTimer); playTimer = null; }
  function play() {
    if (playTimer) { stopPlay(); render(); return; }
    if (state.step >= steps().length - 1) state.step = 0;
    state.active = true;
    playTimer = setInterval(() => {
      if (state.step >= steps().length - 1) { stopPlay(); render(); return; }
      setStep(state.step + 1);
    }, 1900);
    setStep(state.step + (state.step === 0 ? 1 : 0));
  }

  function card([id, qty]) {
    const item = data.catalog[id], l = lang(), t = copy[l];
    const total = [item.priceVnd[0] * qty, item.priceVnd[1] * qty];
    return `<article class="td-card gate-${item.gate}" data-td-part="${id}">
      <div class="td-card-head"><span class="td-qty">×${qty}</span><strong>${escape(item.name[l])}</strong><span class="td-gate">${escape(data.gates[item.gate][l])}</span></div>
      <p>${escape(item.role[l])}</p>
      <p class="td-verify"><b>${t.verify}:</b> ${escape(item.verify[l])}</p>
      <div class="td-card-foot"><span class="td-price">${range(item.priceVnd)} <small>${qty > 1 ? `${t.each} · ${t.line} ${range(total)}` : t.each}</small></span><a href="${item.url}" target="_blank" rel="noopener">${t.shop}</a></div>
    </article>`;
  }

  function render() {
    const l = lang(), t = copy[l], list = steps(), last = list.length - 1, current = list[state.step];
    const name = names[state.prop][l === "vi" ? 1 : 0];
    $("#teardownEyebrow").textContent = t.eyebrow;
    $("#teardown-title").textContent = t.title(name);
    $("#teardownIntro").textContent = t.intro;
    $("#teardownHint").textContent = t.hint;
    $("#teardownToggleMain").textContent = state.active ? t.on : t.off;
    $("#teardownToggleMain").setAttribute("aria-pressed", String(state.active));
    $("#teardownPlay").textContent = playTimer ? t.pause : t.play;
    $("#teardownReset").textContent = t.reset;
    $("#teardownSteps").innerHTML = list.map((step, index) => {
      const status = index < state.step ? "is-done" : index === state.step ? "is-current" : "";
      const count = partCount(step);
      return `<li><button type="button" class="${status}" data-td-step="${index}" aria-current="${index === state.step ? "step" : "false"}"><span class="td-num">${index}</span><span class="td-step-title">${escape(step.title[l])}</span>${count ? `<small>${count} ${t.parts}</small>` : ""}</button></li>`;
    }).join("");
    const stepTotal = sum(current.parts), soFar = sum(list.slice(0, state.step + 1).flatMap(step => step.parts)), whole = sum(list.flatMap(step => step.parts));
    $("#teardownDetail").innerHTML = `
      <div class="td-detail-head">
        <p class="eyebrow">${state.step ? `${t.step} ${state.step}/${last}` : `${t.step} 0/${last}`}</p>
        <h3>${escape(current.title[l])}</h3>
        <p>${escape(current.how[l])}</p>
        ${current.caution ? `<p class="td-caution"><b>${t.caution}:</b> ${escape(current.caution[l])}</p>` : ""}
      </div>
      ${current.parts.length ? `<div class="td-cards">${current.parts.map(card).join("")}</div>` : `<p class="td-empty">${t.none}</p>`}
      <div class="td-totals">
        <div><span>${t.thisStep}</span><b>${current.parts.length ? range(stepTotal) : "—"}</b></div>
        <div><span>${t.soFar}</span><b>${state.step ? range(soFar) : "—"}</b></div>
        <div><span>${t.whole}</span><b>${range(whole)}</b></div>
      </div>
      ${state.prop === "boss" ? `<p class="td-note">${t.boss}</p>` : ""}
      <nav class="td-nav"><button type="button" class="button secondary" data-td-go="-1" ${state.step === 0 ? "disabled" : ""}>${t.prev}</button><button type="button" class="button primary" data-td-go="1" ${state.step === last ? "disabled" : ""}>${t.next}</button></nav>`;
    const rows = bom();
    $("#teardownBomSummary").textContent = t.bom(rows.reduce((total, row) => total + row.qty, 0));
    $("#teardownBom").innerHTML = `<thead><tr>${t.th.map(head => `<th>${head}</th>`).join("")}</tr></thead><tbody>${rows.map(row => {
      const item = data.catalog[row.id];
      return `<tr><td><a href="${item.url}" target="_blank" rel="noopener">${escape(item.name[l])}</a></td><td>${row.qty}</td><td>${range(item.priceVnd)}</td><td><span class="td-gate gate-${item.gate}">${escape(data.gates[item.gate][l])}</span></td><td>${row.steps.join(", ")}</td></tr>`;
    }).join("")}</tbody><tfoot><tr><td>${t.whole}</td><td>${rows.reduce((total, row) => total + row.qty, 0)}</td><td colspan="3">${range(whole)}</td></tr></tfoot>`;
    $("#teardownNote").textContent = t.note;
    $("#teardownDownload").textContent = t.download;
    // Stage bar over the 3D model.
    const toggle = $("#teardownToggle");
    toggle.textContent = state.active ? "✕" : t.off;
    toggle.setAttribute("aria-pressed", String(state.active));
    toggle.setAttribute("aria-label", state.active ? t.on : t.off);
    toggle.classList.toggle("is-active", state.active);
    $("#teardownStageNav").hidden = !state.active;
    $("#teardownStageText").textContent = t.stage(state.step, last, current.title[l]);
    $("#teardownPrev").disabled = state.step === 0;
    $("#teardownNext").disabled = state.step === last;
    $("#teardownPrev").setAttribute("aria-label", t.prev.replace(/[◀▶]\s?|\s?[◀▶]/g, ""));
    $("#teardownNext").setAttribute("aria-label", t.next.replace(/[◀▶]\s?|\s?[◀▶]/g, ""));
    panel.classList.toggle("is-active", state.active);
  }

  function markdown() {
    const l = lang(), t = copy[l], list = steps(), name = names[state.prop][l === "vi" ? 1 : 0];
    const lines = [`# ${t.title(name)}`, "", t.intro, "", `> ${t.note}`, ""];
    if (state.prop === "boss") lines.push(`> ${t.boss}`, "");
    list.forEach((step, index) => {
      if (!index) return;
      lines.push(`## ${t.step} ${index}. ${step.title[l]}`, "", step.how[l], "");
      if (step.caution) lines.push(`**${t.caution}:** ${step.caution[l]}`, "");
      if (step.parts.length) {
        lines.push(`| ${t.th[0]} | ${t.th[1]} | ${t.th[2]} | ${t.th[3]} | ${t.verify} |`, "|---|---|---|---|---|");
        step.parts.forEach(([id, qty]) => { const item = data.catalog[id]; lines.push(`| [${item.name[l]}](${item.url}) | ${qty} | ${range(item.priceVnd)} | ${data.gates[item.gate][l]} | ${item.verify[l]} |`); });
        lines.push("", `${t.thisStep}: **${range(sum(step.parts))}**`, "");
      }
    });
    const rows = bom();
    lines.push(`## ${t.bom(rows.reduce((total, row) => total + row.qty, 0))}`, "", `| ${t.th.join(" | ")} |`, "|---|---|---|---|---|");
    rows.forEach(row => { const item = data.catalog[row.id]; lines.push(`| ${item.name[l]} | ${row.qty} | ${range(item.priceVnd)} | ${data.gates[item.gate][l]} | ${row.steps.join(", ")} |`); });
    lines.push("", `${t.whole}: **${range(sum(list.flatMap(step => step.parts)))}**`, "", `_${data.revision} · ${data.pricesCheckedAt}_`, "");
    return lines.join("\n");
  }
  function download() {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `atlas-teardown-${state.prop}-${lang()}.md`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  }

  panel.addEventListener("click", event => {
    const stepButton = event.target.closest("[data-td-step]");
    if (stepButton) { stopPlay(); setStep(Number(stepButton.dataset.tdStep)); return; }
    const go = event.target.closest("[data-td-go]");
    if (go) { stopPlay(); setStep(state.step + Number(go.dataset.tdGo)); }
  });
  $("#teardownToggleMain").addEventListener("click", () => setActive(!state.active));
  $("#teardownToggle").addEventListener("click", () => setActive(!state.active));
  $("#teardownPrev").addEventListener("click", () => { stopPlay(); setStep(state.step - 1); });
  $("#teardownNext").addEventListener("click", () => { stopPlay(); setStep(state.step + 1); });
  $("#teardownPlay").addEventListener("click", play);
  $("#teardownReset").addEventListener("click", () => { stopPlay(); setStep(0); });
  $("#teardownDownload").addEventListener("click", download);
  [panel, $("#teardownStageBar")].forEach(root => root.addEventListener("keydown", event => {
    if (!state.active || !["ArrowLeft", "ArrowRight"].includes(event.key) || event.target.closest("input, textarea, select")) return;
    event.preventDefault(); stopPlay(); setStep(state.step + (event.key === "ArrowRight" ? 1 : -1));
  }));
  window.addEventListener("atlas-teardown-pick", event => {
    const { prop, id } = event.detail || {};
    if (prop !== state.prop) return;
    const index = stepFor(id);
    if (index >= 0) { stopPlay(); setStep(index); }
  });
  window.addEventListener("atlas-prop-change", event => {
    const prop = validProp(event.detail?.prop);
    if (!prop || prop === state.prop) return;
    stopPlay(); state.prop = prop; state.step = clamp(remembered[prop]);
    render(); announce("prop");
  });
  window.addEventListener("atlas-language-change", () => { render(); announce("language"); });

  window.AtlasTeardown = Object.freeze({
    state: () => ({ ...state }), setStep, setActive, next: () => setStep(state.step + 1), prev: () => setStep(state.step - 1),
    stepFor, markdown, bom, playing: () => Boolean(playTimer)
  });
  render();
})();

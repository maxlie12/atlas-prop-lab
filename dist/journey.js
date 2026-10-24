(function () {
  const key = "atlas-product-journey-v2";
  const targets = [
    { id: "start", target: "buildJourney", view: "event-kit" },
    { id: "design", target: "threePropStage", view: "event-kit" },
    { id: "buy", target: "physicalGate", view: "event-kit" },
    { id: "wire", target: "physicalWiring", view: "event-kit" },
    { id: "bench", target: "benchEvidence", view: "event-kit" },
    { id: "assemble", target: "guided-build-title", view: "event-kit" },
    { id: "hit", target: "hitLabTitle", view: "event-kit" },
    { id: "fit", target: "armourFitGate", view: "event-kit" },
    { id: "validate", target: "field-title", view: "field" },
    { id: "export", target: "projectHandoff", view: "event-kit" }
  ];
  const copy = {
    vi: {
      steps: ["Bắt đầu", "Thiết kế", "Mua đồ", "Đi dây", "Bench 100×", "Lắp ráp", "Hit test", "Fit giáp", "Nghiệm thu", "Xuất hồ sơ"],
      states: ["CHƯA BẮT ĐẦU", "ĐANG THỰC HIỆN", "ĐÃ HOÀN THÀNH"],
      next: "BƯỚC HIỆN TẠI",
      notes: [
        "Chọn cách chế tạo và khởi tạo hồ sơ Arc Bow + giáp dùng chung.",
        "Kiểm tra mô hình, kích thước, module và vị trí lắp.",
        "Mua bench kit tối thiểu; hoãn pin, PCB và vỏ hoàn thiện.",
        "Đối chiếu pin, đo điện áp và qua đủ năm gate trước khi cấp USB.",
        "Ghi 100 lần nhả dây và 100 hit packet; xuất CSV bằng chứng.",
        "Đặt từng module đúng vị trí và kiểm tra sau mỗi bước.",
        "Thử FIRE → HIT_CONFIRM → DAMAGE trên giáp.",
        "Thử người nhỏ/lớn và 15 góc-khoảng cách dưới ánh sáng sự kiện.",
        "Thử lỗi, độ trễ, độ vừa, nhiệt và chuyển động ngoài đời.",
        "Tải gói mua hàng, gia công, điện tử và biên bản kiểm tra."
      ],
      open: "Mở bước hiện tại", start: "Bắt đầu sản phẩm", resume: "Tiếp tục bước đang làm"
    },
    en: {
      steps: ["Start", "Design", "Buy", "Wire", "Bench 100×", "Assemble", "Hit test", "Armour fit", "Validate", "Export"],
      states: ["NOT STARTED", "IN PROGRESS", "COMPLETE"],
      next: "CURRENT STEP",
      notes: [
        "Choose a build route and create the Arc Bow + shared armour project.",
        "Inspect geometry, dimensions, modules, and placement.",
        "Buy the minimum bench kit; defer batteries, PCBs, and finished shells.",
        "Match pins, meter voltages, and clear five gates before USB power.",
        "Record 100 releases and 100 hit packets; export evidence CSV.",
        "Place every module and verify each assembly step.",
        "Prove FIRE → HIT_CONFIRM → DAMAGE on the armour.",
        "Fit the smallest/largest wearer and run 15 shots under event light.",
        "Test faults, latency, fit, heat, and real movement.",
        "Download procurement, fabrication, electronics, and test packs."
      ],
      open: "Open current step", start: "Start product", resume: "Continue current step"
    }
  };

  let state = { started: false, current: 0, complete: [], mode: "hybrid" };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch {}
  const $ = selector => document.querySelector(selector);
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  function openStep(index) {
    const item = targets[index];
    if (!item) return;
    state.current = index; save(); render();
    if (typeof showView === "function") showView(item.view);
    requestAnimationFrame(() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function render() {
    const t = copy[lang()];
    const shell = $("#buildJourney");
    if (!shell) return;
    shell.dataset.started = String(state.started);
    $("#journeyStateLabel").textContent = state.started ? t.states[1] : t.states[0];
    $("#startProductButton").textContent = t.start;
    $("#resumeProductButton").textContent = t.resume;
    $("#resumeProductButton").hidden = !state.started;
    $("#journeyCurrentKicker").textContent = t.next;
    $("#journeyCurrentTitle").textContent = t.steps[state.current];
    $("#journeyCurrentNote").textContent = t.notes[state.current];
    $("#journeyNextButton").textContent = t.open;
    $("#journeySteps").innerHTML = targets.map((item, index) => {
      const classes = ["journey-step", index === state.current ? "is-current" : "", state.complete.includes(index) ? "is-complete" : ""].filter(Boolean).join(" ");
      const status = state.complete.includes(index) ? "PASS" : index === state.current ? "NOW" : "WAIT";
      return `<button type="button" class="${classes}" data-journey-step="${index}"><b>${String(index + 1).padStart(2, "0")} · ${status}</b><strong>${t.steps[index]}</strong><span>${t.notes[index]}</span></button>`;
    }).join("");
    document.querySelectorAll("[data-build-mode]").forEach(button => button.classList.toggle("is-active", button.dataset.buildMode === state.mode));
  }

  $("#startProductButton")?.addEventListener("click", () => {
    state.started = true; state.current = 1; state.complete = [0]; save();
    document.querySelector("[data-prop='archer']")?.click();
    render(); openStep(1);
  });
  $("#resumeProductButton")?.addEventListener("click", () => openStep(state.current));
  $("#journeyNextButton")?.addEventListener("click", () => openStep(state.current));
  $("#journeySteps")?.addEventListener("click", event => {
    const button = event.target.closest("[data-journey-step]");
    if (button) openStep(Number(button.dataset.journeyStep));
  });
  $("#journeyBuildMode")?.addEventListener("click", event => {
    const button = event.target.closest("[data-build-mode]");
    if (!button) return;
    state.mode = button.dataset.buildMode; save(); render();
  });
  window.addEventListener("atlas-language-change", render);
  window.addEventListener("atlas-journey-complete", event => {
    const index = targets.findIndex(item => item.id === event.detail?.step);
    if (index < 0) return;
    if (!state.complete.includes(index)) state.complete.push(index);
    state.current = Math.min(index + 1, targets.length - 1); state.started = true; save(); render();
  });
  render();
})();

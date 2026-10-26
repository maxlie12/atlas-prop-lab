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

  // Build route: who owns each of the ten steps, plus the route-specific instruction when it
  // differs from the default note. Roles: you · vendor · review (vendor builds, you accept) · shared.
  const modes = {
    diy: {
      label: { vi: ["Tự làm", "Tự chế tạo và lắp điện tử"], en: ["Build it yourself", "You make the shell and the electronics"] },
      roles: ["you", "you", "you", "you", "you", "you", "you", "you", "you", "you"],
      notes: { vi: {}, en: {} },
      handoff: { vi: [], en: [] }
    },
    hybrid: {
      label: { vi: ["Thuê một phần", "Thuê vỏ/in 3D, tự test hệ thống"], en: ["Outsource part", "Hire the shell / 3D print, test the system yourself"] },
      roles: ["you", "you", "you", "you", "you", "shared", "you", "you", "you", "shared"],
      notes: {
        vi: { 1: "Chốt kích thước và khoang điện tử trên bản vẽ; đây là file sẽ gửi thợ làm vỏ.", 2: "Bạn mua bench kit điện tử; đặt thợ làm vỏ EVA/in 3D theo bản vẽ đã chốt.", 5: "Thợ giao vỏ đúng bản vẽ; bạn đo khoang rồi tự lắp điện tử vào.", 9: "Gửi thợ bản vẽ SVG + kích thước khoang; giữ lại biên bản test điện tử của bạn." },
        en: { 1: "Lock dimensions and the electronics cavity on the drawing; this is the file the shell maker receives.", 2: "You buy the electronics bench kit; order the EVA/3D-printed shell from the locked drawing.", 5: "The maker delivers the shell to the drawing; you measure the cavity and install the electronics.", 9: "Send the maker the SVG drawing + cavity sizes; keep your own electronics test records." }
      },
      handoff: { vi: ["Bản vẽ SVG kích thước (vỏ)", "Kích thước khoang điện tử"], en: ["Dimensioned SVG drawing (shell)", "Electronics cavity sizes"] }
    },
    turnkey: {
      label: { vi: ["Thuê trọn bộ", "Giao hồ sơ và tập trung nghiệm thu"], en: ["Turnkey", "Hand over the pack and focus on acceptance"] },
      roles: ["you", "you", "vendor", "vendor", "review", "vendor", "review", "you", "you", "you"],
      notes: {
        vi: { 0: "Chọn sản phẩm rồi tải hồ sơ ngay: thợ cần đủ bản vẽ, BOM và hợp đồng GPIO trước khi báo giá.", 1: "Bạn duyệt mô hình và kích thước; thợ không được tự đổi khoang hoặc vị trí cảm biến.", 2: "Thợ mua theo BOM; yêu cầu gửi ảnh nhãn linh kiện và hoá đơn trước khi lắp.", 3: "Thợ đi dây theo bảng GPIO S3; yêu cầu ảnh mạch và kết quả đo 5 wiring gate.", 4: "Thợ chạy 100 lần thử bằng Web Serial; bạn nhận file CSV và tự xem kết quả.", 5: "Thợ lắp hoàn chỉnh theo 8 bước; yêu cầu ảnh từng bước.", 6: "Bạn tự bắn thử trước mặt thợ: FIRE → HIT_CONFIRM → DAMAGE phải chạy đúng.", 9: "Bạn đã gửi hồ sơ ở bước 1; giờ lưu biên bản nghiệm thu và CSV làm bằng chứng." },
        en: { 0: "Pick the product and download the pack now: the maker needs drawings, BOM and the GPIO contract before quoting.", 1: "You approve the model and sizes; the maker must not change cavities or sensor positions.", 2: "The maker buys from the BOM; ask for photos of part markings and receipts before assembly.", 3: "The maker wires to the S3 GPIO table; ask for wiring photos and the five wiring-gate readings.", 4: "The maker runs the 100 trials over Web Serial; you receive the CSV and read it yourself.", 5: "The maker assembles all eight steps; ask for a photo of each step.", 6: "Fire it yourself in front of the maker: FIRE → HIT_CONFIRM → DAMAGE must work.", 9: "You sent the pack at step 1; now keep the acceptance record and CSVs as evidence." }
      },
      handoff: { vi: ["Bản vẽ SVG kích thước", "BOM + nguồn mua", "Bảng GPIO ESP32-S3 + firmware", "Checklist 8 bước lắp + 5 wiring gate"], en: ["Dimensioned SVG drawings", "BOM + sources", "ESP32-S3 GPIO table + firmware", "8-step assembly + five wiring-gate checklist"] }
    }
  };
  const roleCopy = {
    vi: { you: "BẠN LÀM", vendor: "THUÊ THỢ", review: "THỢ LÀM · BẠN NGHIỆM THU", shared: "BẠN + THỢ" },
    en: { you: "YOU", vendor: "HIRED", review: "HIRED · YOU ACCEPT", shared: "YOU + MAKER" }
  };
  window.ATLAS_JOURNEY_MODES = { modes, roleCopy, stepCount: targets.length };

  function modeSummary(t, mode, language) {
    const counts = { you: 0, vendor: 0, review: 0, shared: 0 };
    mode.roles.forEach(role => counts[role]++);
    const vi = language === "vi";
    const parts = [
      `${counts.you} ${vi ? "bước bạn tự làm" : "steps you do"}`,
      counts.shared ? `${counts.shared} ${vi ? "bước làm cùng thợ" : "shared with a maker"}` : "",
      counts.vendor + counts.review ? `${counts.vendor + counts.review} ${vi ? "bước thuê thợ" : "steps hired out"}${counts.review ? ` (${counts.review} ${vi ? "bạn nghiệm thu" : "you accept"})` : ""}` : ""
    ].filter(Boolean);
    const handoff = mode.handoff[language];
    return `${parts.join(" · ")}${handoff.length ? ` — ${vi ? "Gửi thợ" : "Send the maker"}: ${handoff.join(", ")}` : ""}`;
  }

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
    const language = lang();
    const t = copy[language];
    const shell = $("#buildJourney");
    if (!shell) return;
    if (!modes[state.mode]) state.mode = "hybrid";
    const mode = modes[state.mode];
    const noteFor = index => mode.notes[language][index] || t.notes[index];
    $("#journeyModeTitle").textContent = language === "vi" ? "Bạn sẽ chế tạo theo cách nào?" : "How will you build it?";
    $("#journeyModeNote").textContent = language === "vi" ? "Có thể đổi sau. Mỗi bước bên dưới ghi rõ ai làm và cần gửi thợ những gì." : "You can change this later. Every step below shows who does it and what the maker needs.";
    for (const [id, data] of Object.entries(modes)) {
      const key = id === "diy" ? "Diy" : id === "hybrid" ? "Hybrid" : "Turnkey";
      $(`#journeyMode${key}`).textContent = data.label[language][0];
      $(`#journeyMode${key}Note`).textContent = data.label[language][1];
    }
    $("#journeyModeSummary").textContent = modeSummary(t, mode, language);
    shell.dataset.started = String(state.started);
    $("#journeyStateLabel").textContent = state.started ? t.states[1] : t.states[0];
    $("#startProductButton").textContent = t.start;
    $("#resumeProductButton").textContent = t.resume;
    $("#resumeProductButton").hidden = !state.started;
    $("#journeyCurrentKicker").textContent = t.next;
    $("#journeyCurrentTitle").textContent = t.steps[state.current];
    $("#journeyCurrentNote").textContent = `${roleCopy[language][mode.roles[state.current]]} · ${noteFor(state.current)}`;
    $("#journeyNextButton").textContent = t.open;
    $("#journeySteps").innerHTML = targets.map((item, index) => {
      const role = mode.roles[index];
      const classes = ["journey-step", `role-${role}`, index === state.current ? "is-current" : "", state.complete.includes(index) ? "is-complete" : ""].filter(Boolean).join(" ");
      const status = state.complete.includes(index) ? "PASS" : index === state.current ? "NOW" : "WAIT";
      return `<button type="button" class="${classes}" data-journey-step="${index}"><b>${String(index + 1).padStart(2, "0")} · ${status}</b><em class="journey-role">${roleCopy[language][role]}</em><strong>${t.steps[index]}</strong><span>${noteFor(index)}</span></button>`;
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

(function () {
  const manifest = window.ATLAS_IMPACT_ARMOUR;
  if (!manifest) return;
  const key = "atlas-impact-armour-profile-v1";
  let profile = localStorage.getItem(key) === "boss" ? "boss" : "hero";
  const copy = {
    vi: {
      label: "BỘ NHẬN SÁT THƯƠNG DÙNG CHUNG", title: "Một bộ giáp cho cả Hero và Boss",
      status: "Ý TƯỞNG / CHƯA TEST THẬT", eyebrow: "CHỌN NGƯỜI MẶC / KHÔNG ĐỔI PHẦN CỨNG",
      hero: "Hero profile", heroNote: "Phản hồi nhanh, máu và màu theo role",
      boss: "Boss profile", bossNote: "Nhiều máu, phase và hiệu ứng mạnh hơn",
      labels: ["Người mặc", "Vùng nhận", "Event xác nhận", "Luật máu"],
      values: { hero: ["Mọi Hero", "3 vùng", "HIT_CONFIRM", "Theo role"], boss: ["Boss", "3 vùng", "HIT_CONFIRM", "Theo phase"] },
      fit: "Áo nền mở hai bên, dây điều chỉnh và module tháo rời. Phải thử người nhỏ nhất và lớn nhất trước khi chốt kích thước.",
      boundaryTitle: "Phần dùng chung",
      boundary: "Ba vùng nhận hit, receiver sau lưng, dây tháo nhanh, LED tán sáng và cùng event HIT_CONFIRM. Profile chỉ đổi luật game."
    },
    en: {
      label: "SHARED DAMAGE RECEIVER", title: "One impact armour for Heroes and Boss",
      status: "CONCEPT / NOT PHYSICALLY TESTED", eyebrow: "CHOOSE WEARER / KEEP THE SAME HARDWARE",
      hero: "Hero profile", heroNote: "Fast feedback; role health and colour",
      boss: "Boss profile", bossNote: "Larger health pool, phases, stronger feedback",
      labels: ["Wearer", "Hit zones", "Confirmed event", "Health rule"],
      values: { hero: ["Any Hero", "3 zones", "HIT_CONFIRM", "By role"], boss: ["Boss", "3 zones", "HIT_CONFIRM", "By phase"] },
      fit: "Open-side base vest, adjustable straps, and removable modules. Fit the smallest and largest intended player before locking dimensions.",
      boundaryTitle: "Shared hardware",
      boundary: "Three hit zones, rear receiver, quick release, diffused LEDs, and the same HIT_CONFIRM event. The profile changes game rules only."
    }
  };
  const $ = selector => document.querySelector(selector);
  const lang = () => localStorage.getItem("atlas-language") === "en" ? "en" : "vi";

  function render() {
    const t = copy[lang()];
    $("#impactArmourLabel").textContent = t.label;
    $("#impactArmourTitle").textContent = t.title;
    $("#impactArmourStatus").textContent = t.status;
    $("#impactProfileEyebrow").textContent = t.eyebrow;
    $("#impactHeroTitle").textContent = t.hero; $("#impactHeroNote").textContent = t.heroNote;
    $("#impactBossTitle").textContent = t.boss; $("#impactBossNote").textContent = t.bossNote;
    $("#impactFitBoundary").textContent = t.fit;
    $("#impactBoundaryTitle").textContent = t.boundaryTitle;
    $("#impactBoundaryText").textContent = t.boundary;
    document.querySelectorAll("[data-impact-profile]").forEach(button => button.classList.toggle("is-active", button.dataset.impactProfile === profile));
    $("#impactContract").innerHTML = t.labels.map((label, index) => `<div><span>${label}</span><strong>${t.values[profile][index]}</strong></div>`).join("");
  }
  document.querySelector(".impact-profile-switch")?.addEventListener("click", event => {
    const button = event.target.closest("[data-impact-profile]");
    if (!button) return;
    profile = button.dataset.impactProfile; localStorage.setItem(key, profile); render();
    window.dispatchEvent(new CustomEvent("atlas-impact-profile-change", { detail: { profile } }));
  });
  window.addEventListener("atlas-language-change", render);
  render();
})();

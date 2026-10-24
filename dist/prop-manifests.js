(function () {
  const manifests = {
    guardian: {
      revision: "0.1", status: "reference", dimensionsMm: { width: 500, height: 500, depth: 55 },
      assets: [
        { id: "face-template", href: "downloads/guardian-template-500mm.svg" },
        { id: "rear-layout", href: "downloads/guardian-rear-layout.svg" }
      ],
      modules: [
        { callout: 1, id: "shield-face", modelKey: "shell" },
        { callout: 2, id: "esp32-service-box", modelKey: "core" },
        { callout: 3, id: "imu-centre", modelKey: "sensor" },
        { callout: 4, id: "thumb-trigger", modelKey: "control" },
        { callout: 5, id: "led-rim", modelKey: "light" },
        { callout: 6, id: "arm-straps", modelKey: "wearable" }
      ],
      procurement: [
        {
          id: "double-wall-cardboard", gate: "fit", state: "reference", priceVnd: [20000, 60000],
          specEn: "Two flat double-wall sheets, each at least 600 × 600 mm; reject wet, crushed or deeply creased board.",
          specVi: "2 tấm carton 2 lớp phẳng, mỗi tấm tối thiểu 600 × 600 mm; không nhận tấm ẩm, bẹp hoặc gãy nếp sâu.",
          checkEn: "Bring the 500 mm face-template measurement; both shield faces must fit with margin.",
          checkVi: "Mang theo số đo mẫu mặt 500 mm; mỗi mặt khiên phải đặt lọt và còn mép dư.",
          sources: [
            { labelEn: "Find nearby carton shop", labelVi: "Tìm cửa hàng carton gần bạn", kind: "local", url: "https://www.google.com/maps/search/th%C3%B9ng+carton" },
            { labelEn: "Marketplace search", labelVi: "Tìm trên Shopee", kind: "market", url: "https://shopee.vn/search?keyword=t%E1%BA%A5m%20carton%202%20l%E1%BB%9Bp%2060x60" }
          ]
        },
        {
          id: "paper-tape-marker", gate: "fit", state: "reference", priceVnd: [30000, 80000],
          specEn: "One 24–48 mm masking-tape roll plus one dark permanent marker; no duct tape for the fit test.",
          specVi: "1 cuộn băng keo giấy rộng 24–48 mm và 1 bút lông đậm; chưa dùng băng keo vải cho mẫu thử.",
          checkEn: "Tape must peel from cardboard without tearing the surface during size iterations.",
          checkVi: "Băng keo phải bóc khỏi carton mà không xé mặt giấy khi chỉnh kích thước.",
          sources: [
            { labelEn: "Find nearby stationery", labelVi: "Tìm nhà sách gần bạn", kind: "local", url: "https://www.google.com/maps/search/nh%C3%A0+s%C3%A1ch" },
            { labelEn: "Marketplace search", labelVi: "Tìm trên Shopee", kind: "market", url: "https://shopee.vn/search?keyword=b%C4%83ng%20keo%20gi%E1%BA%A5y%2048mm%20b%C3%BAt%20l%C3%B4ng" }
          ]
        },
        {
          id: "nylon-webbing-25mm", gate: "fit", state: "reference", priceVnd: [20000, 50000],
          specEn: "1.5 m of soft 25 mm backpack webbing; buy black first so replacement is easy.",
          specVi: "1,5 m dây đai balo mềm rộng đúng 25 mm; nên mua màu đen trước để dễ thay.",
          checkEn: "Thread it through a 25 mm buckle before buying the full length; reject sharp or abrasive edges.",
          checkVi: "Luồn thử qua khóa 25 mm trước khi mua đủ chiều dài; bỏ loại có mép sắc hoặc cọ da.",
          sources: [
            { labelEn: "25 mm webbing search", labelVi: "Mua dây đai 25 mm", kind: "market", url: "https://shopee.vn/search?keyword=d%C3%A2y%20%C4%91ai%20balo%20nylon%2025mm" },
            { labelEn: "Find sewing-supply shop", labelVi: "Tìm tiệm phụ liệu may", kind: "local", url: "https://www.google.com/maps/search/ph%E1%BB%A5+li%E1%BB%87u+may" }
          ]
        },
        {
          id: "adjustable-buckles-25mm", gate: "fit", state: "reference", priceVnd: [10000, 40000],
          specEn: "Two 25 mm side-release backpack buckles matched to the webbing; buy one male/female pair per strap.",
          specVi: "2 khóa bấm balo tháo nhanh cỡ 25 mm, vừa với dây đai; mỗi quai cần đủ một cặp đực/cái.",
          checkEn: "Close and release each buckle 20 times; it must not jam and must be reachable with the free hand.",
          checkVi: "Bấm/mở mỗi khóa 20 lần; không được kẹt và phải với tới bằng tay còn lại.",
          sources: [
            { labelEn: "25 mm buckle search", labelVi: "Mua khóa bấm 25 mm", kind: "market", url: "https://shopee.vn/search?keyword=kh%C3%B3a%20b%E1%BA%A5m%20balo%2025mm" },
            { labelEn: "Find sewing-supply shop", labelVi: "Tìm tiệm phụ liệu may", kind: "local", url: "https://www.google.com/maps/search/ph%E1%BB%A5+li%E1%BB%87u+may" }
          ]
        },
        {
          id: "eva-offcut", gate: "fit", state: "reference", priceVnd: [0, 50000],
          specEn: "One palm-size EVA offcut, ideally 5 mm and 10 mm, to test glue, paint and rounded edges.",
          specVi: "Miếng EVA thừa cỡ lòng bàn tay, tốt nhất có cả 5 mm và 10 mm để thử keo, sơn và bo cạnh.",
          checkEn: "Ask a cosplay shop for offcuts before buying full sheets; foam must recover after a thumb press.",
          checkVi: "Hỏi xin/mua miếng thừa ở tiệm cosplay trước khi mua tấm lớn; xốp phải hồi lại sau khi ấn ngón tay.",
          sources: [
            { labelEn: "EVA 5/10 mm search", labelVi: "Tìm EVA 5/10 mm", kind: "market", url: "https://shopee.vn/search?keyword=x%E1%BB%91p%20EVA%20cosplay%205mm%2010mm" },
            { labelEn: "Ask Hanoi prop shop", labelVi: "Hỏi tiệm đạo cụ Hà Nội", kind: "local", url: "https://ariescosplay.com/" }
          ]
        },
        {
          id: "mke-k01-esp32-s3", gate: "after-fit", state: "reference", priceVnd: [230000, 230000], checkedAt: "2026-10-04",
          specEn: "Exact reference: MKE-K01 ESP32-S3 Dev Kit, N4 (4 MB, no PSRAM), USB-C version, ESP32-S3-WROOM-1.",
          specVi: "Mẫu tham chiếu chính xác: MKE-K01 ESP32-S3 Dev Kit, bản N4 (4 MB, không PSRAM), cổng USB-C, ESP32-S3-WROOM-1.",
          checkEn: "Select N4 and confirm the pictured unit has USB-C because the listing notes connector variants. Buy one board only.",
          checkVi: "Chọn N4 và xác nhận board giao thực tế có USB-C vì trang bán ghi có nhiều biến thể cổng. Chỉ mua 1 board.",
          sources: [{ labelEn: "Open exact Hshop SKU", labelVi: "Mở đúng SKU tại Hshop", kind: "exact", url: "https://hshop.vn/mach-phat-trien-mke-k01-esp32-s3-dev-kit" }]
        },
        {
          id: "gy-521-mpu6050", gate: "after-fit", state: "reference", priceVnd: [85000, 85000], checkedAt: "2026-10-04",
          specEn: "Exact reference: GY-521 MPU6050, I2C breakout board with header pins.",
          specVi: "Mẫu tham chiếu chính xác: GY-521 MPU6050, board giao tiếp I2C có hàng chân.",
          checkEn: "Confirm GY-521/MPU6050 in the listing and measure the board before cutting the centre cavity.",
          checkVi: "Đối chiếu GY-521/MPU6050 trên trang bán và đo board trước khi cắt khoang giữa.",
          sources: [{ labelEn: "Open exact Hshop SKU", labelVi: "Mở đúng SKU tại Hshop", kind: "exact", url: "https://hshop.vn/cam-bien-6-dof-bac-tu-do-gy-521-mpu6050" }]
        },
        {
          id: "pbs-11b-12mm", gate: "after-fit", state: "reference", priceVnd: [10000, 10000], checkedAt: "2026-10-04",
          specEn: "Exact reference: PBS-11B 12 mm momentary push button with cable; not a latching switch.",
          specVi: "Mẫu tham chiếu chính xác: nút nhấn nhả PBS-11B 12 mm có dây; không lấy loại nhấn giữ trạng thái.",
          checkEn: "Listing must say momentary. Confirm 12 mm mounting hole and enough rear clearance for the cable.",
          checkVi: "Trang bán phải ghi nhấn nhả. Kiểm tra lỗ lắp 12 mm và đủ khoảng trống phía sau cho dây.",
          sources: [{ labelEn: "Open exact Hshop SKU", labelVi: "Mở đúng SKU tại Hshop", kind: "exact", url: "https://hshop.vn/nut-nhan-nha-tron-pbs-11b-12mm-kem-cap" }]
        },
        {
          id: "ws2812b-strip-1m", gate: "after-fit", state: "reference", priceVnd: [60000, 180000], checkedAt: "2026-10-04",
          specEn: "1 m WS2812B strip, 5 V, 60 LED/m, non-waterproof IP30 for the protected internal rim.",
          specVi: "1 m dải WS2812B, 5 V, 60 LED/m, loại IP30 không phủ silicon để đặt trong viền bảo vệ.",
          checkEn: "Select exactly 5 V + 60 LED/m + 1 m + IP30. Do not substitute a 12 V strip.",
          checkVi: "Chọn đúng 5 V + 60 LED/m + dài 1 m + IP30. Không thay bằng dải 12 V.",
          sources: [{ labelEn: "Search exact variant", labelVi: "Tìm đúng biến thể", kind: "market", url: "https://shopee.vn/search?keyword=WS2812B%205V%2060LED%201m%20IP30" }]
        },
        {
          id: "wire-connectors", gate: "after-fit", state: "reference", priceVnd: [50000, 150000], checkedAt: "2026-10-04",
          specEn: "Flexible 22–24 AWG stranded wire plus locking 3-pin JST-SM pigtails; red/black/data colours.",
          specVi: "Dây đồng mềm nhiều lõi 22–24 AWG cùng cặp giắc khóa JST-SM 3 pin có dây; đủ màu đỏ/đen/data.",
          checkEn: "Buy one small set first. Pull-test every crimp and confirm the connector cannot be reversed.",
          checkVi: "Mua 1 bộ nhỏ trước. Kéo thử từng đầu bấm và xác nhận giắc không thể cắm ngược.",
          sources: [{ labelEn: "Wire + JST-SM search", labelVi: "Tìm dây + giắc JST-SM", kind: "market", url: "https://shopee.vn/search?keyword=d%C3%A2y%2022AWG%20gi%E1%BA%AFc%20JST%20SM%203P" }]
        }
      ],
      assemblyCallouts: [[1], [2, 3, 4, 5], [1], [3], [4], [5], [2, 6], [1, 2, 3, 4, 5, 6]]
    },
    warrior: {
      revision: "0.1", status: "reference", dimensionsMm: { width: 110, height: 650, depth: 45 },
      modules: [
        { callout: 1, id: "eva-blade", modelKey: "shell" },
        { callout: 2, id: "led-spine", modelKey: "light" },
        { callout: 3, id: "guard-imu", modelKey: "sensor" },
        { callout: 4, id: "index-trigger", modelKey: "control" },
        { callout: 5, id: "esp32-hilt", modelKey: "core" },
        { callout: 6, id: "wrist-loop", modelKey: "wearable" }
      ],
      assemblyCallouts: [[1, 6], [3, 4, 5], [1], [2], [3], [4, 5], [6], [1, 2, 3, 4, 5, 6]]
    },
    archer: {
      revision: "0.2", status: "reference", dimensionsMm: { width: 430, height: 900, depth: 60 },
      assets: [
        { id: "bow-template", href: "downloads/arc-bow-template-900mm.svg" },
        { id: "riser-layout", href: "downloads/arc-bow-riser-layout.svg" }
      ],
      modules: [
        { callout: 1, id: "recurve-limbs", modelKey: "shell" },
        { callout: 2, id: "cosmetic-cord", modelKey: "wearable" },
        { callout: 3, id: "draw-magnet", modelKey: "control" },
        { callout: 4, id: "hall-sensor", modelKey: "sensor" },
        { callout: 5, id: "esp32-riser", modelKey: "core" },
        { callout: 6, id: "limb-led", modelKey: "light" }
      ],
      assemblyCallouts: [[1, 2], [3, 4, 5], [2], [3, 4], [5], [1, 6], [3, 4], [1, 2, 3, 4, 5, 6]]
    },
    assassin: {
      revision: "0.1", status: "reference", dimensionsMm: { width: 75, height: 320, depth: 40 },
      modules: [
        { callout: 1, id: "active-dagger", modelKey: "shell" },
        { callout: 2, id: "passive-dagger", modelKey: "passive" },
        { callout: 3, id: "active-imu", modelKey: "sensor" },
        { callout: 4, id: "grip-trigger", modelKey: "control" },
        { callout: 5, id: "esp32-active-hilt", modelKey: "core" },
        { callout: 6, id: "wrist-trap-pad", modelKey: "wearable" }
      ],
      assemblyCallouts: [[1, 2], [3, 4, 5, 6], [1, 2], [3], [4, 5], [2], [6], [1, 2, 3, 4, 5, 6]]
    },
    mage: {
      revision: "0.1", status: "reference", dimensionsMm: { width: 140, height: 1100, depth: 140 },
      modules: [
        { callout: 1, id: "diffused-orb", modelKey: "light" },
        { callout: 2, id: "padded-head", modelKey: "shell" },
        { callout: 3, id: "cast-button", modelKey: "control" },
        { callout: 4, id: "grip-imu", modelKey: "sensor" },
        { callout: 5, id: "esp32-lower-grip", modelKey: "core" },
        { callout: 6, id: "padded-end", modelKey: "wearable" }
      ],
      assemblyCallouts: [[1, 2, 6], [1, 3, 4, 5], [2, 6], [1], [4], [5], [3, 4], [1, 2, 3, 4, 5, 6]]
    },
    boss: {
      revision: "0.1", status: "reference", dimensionsMm: { width: 360, height: 1150, depth: 180 },
      modules: [
        { callout: 1, id: "hollow-hammer-head", modelKey: "shell" },
        { callout: 2, id: "head-led", modelKey: "light" },
        { callout: 3, id: "primary-trigger", modelKey: "control" },
        { callout: 4, id: "balance-imu", modelKey: "sensor" },
        { callout: 5, id: "esp32-lower-grip", modelKey: "core" },
        { callout: 6, id: "three-zone-armour", modelKey: "wearable" }
      ],
      assemblyCallouts: [[1], [2, 3, 4, 5], [1], [4, 5], [6], [2, 5, 6], [3, 4], [1, 2, 3, 4, 5, 6]]
    }
  };

  const impactArmour = {
    revision: "0.1",
    status: "concept-unverified",
    id: "atlas-impact-armour-v1",
    name: { vi: "Giáp nhận sát thương Atlas", en: "Atlas Impact Armour" },
    sharedHardware: true,
    wearerProfiles: {
      hero: {
        id: "hero",
        hpAuthority: "unity-role-profile",
        feedback: ["role-colour", "hit-zone-flash", "short-haptic"],
        notes: { vi: "Dùng cho mọi Hero; màu và máu lấy từ role trong Unity.", en: "Used by any Hero; colour and health come from the Unity role profile." }
      },
      boss: {
        id: "boss",
        hpAuthority: "unity-boss-phase-profile",
        feedback: ["red-white-hit-zone", "phase-colour", "strong-haptic"],
        notes: { vi: "Cùng phần cứng; Unity thêm máu lớn và chuyển phase.", en: "The same hardware; Unity adds the larger health pool and phase changes." }
      }
    },
    zones: [
      { id: "left-shoulder", callout: 1, input: "ir-receiver-left", output: "led-left" },
      { id: "chest", callout: 2, input: "ir-receiver-chest", output: "led-chest" },
      { id: "right-shoulder", callout: 3, input: "ir-receiver-right", output: "led-right" }
    ],
    modules: [
      { id: "adjustable-bib", kind: "wearable", state: "assumed" },
      { id: "receiver-core", kind: "electronics", state: "unverified" },
      { id: "three-ir-receivers", kind: "sensor", state: "unverified" },
      { id: "three-led-diffusers", kind: "feedback", state: "unverified" },
      { id: "quick-release-harness", kind: "safety", state: "assumed" }
    ],
    events: ["SHOT_SEEN", "HIT_CONFIRM", "HIT_REJECT", "ARMOUR_STATUS"],
    boundaries: {
      vi: "Chưa xác minh IR ngoài đời, độ vừa, nhiệt, nguồn, độ che phủ vùng nhận hoặc độ thoải mái.",
      en: "Real IR, fit, heat, power, receiver coverage, and comfort remain unverified."
    }
  };

  Object.freeze(manifests);
  Object.freeze(impactArmour);
  window.ATLAS_PROP_MANIFESTS = manifests;
  window.ATLAS_IMPACT_ARMOUR = impactArmour;
})();

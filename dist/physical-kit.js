(function () {
  window.ATLAS_PHYSICAL_KIT = {
    revision: "0.1",
    checkedAt: "2026-10-16",
    projectId: "arc-bow-impact-armour-proof-01",
    currency: "VND",
    rules: {
      power: "USB bench supply only; no battery in Gate 01",
      logic: "ESP32 GPIO must never receive more than 3.3 V",
      emitter: "IR LED requires a transistor driver; never drive it directly from a GPIO",
      optical: "940 nm IR is invisible; never aim an unverified high-power emitter at eyes"
    },
    parts: [
      {
        id: "bench-esp32-s3", group: "controller", buyNow: true, qty: 2, priceVnd: [460000, 460000], evidence: "exact-local-reference",
        name: { vi: "MKE-K01 ESP32-S3 Dev Kit · bản N4 USB-C", en: "MKE-K01 ESP32-S3 Dev Kit · N4 USB-C" },
        why: { vi: "Hai board: một làm lõi cung (phát IR), một làm lõi giáp (3 receiver) để thử bắn ở 1–5 m như ma trận phủ yêu cầu; cả hai tái dùng sau khi test đạt.", en: "Two boards: one bow core (IR out) and one armour core (three receivers), so shots can be tested at the 1–5 m the coverage matrix needs; both are reused after proof." },
        verify: { vi: "Chọn N4, kiểm tra đúng USB-C và ảnh nhãn chân trước khi cấp nguồn.", en: "Choose N4; verify USB-C and photograph the pin labels before power-up." },
        sources: [{ kind: "local", label: "Hshop · exact reference", url: "https://hshop.vn/mach-phat-trien-mke-k01-esp32-s3-dev-kit" }]
      },
      {
        id: "bench-hall", group: "bow-input", buyNow: true, qty: 1, priceVnd: [5000, 30000], evidence: "local-candidate-measure-first",
        name: { vi: "Module Hall KY-024 + nam châm nhỏ", en: "KY-024 Hall module + small magnet" },
        why: { vi: "Proxy rẻ cho ngưỡng DRAW_READY và cạnh nhả dây; chưa phải sensor sản xuất cuối.", en: "Low-cost proxy for DRAW_READY and release edge; not the final production sensor." },
        verify: { vi: "Ưu tiên cấp 3,3 V. Đo AO/DO bằng đồng hồ; không nối GPIO nếu bất kỳ output nào vượt 3,3 V.", en: "Prefer 3.3 V supply. Meter AO/DO; do not connect any output above 3.3 V to GPIO." },
        sources: [{ kind: "local", label: "Vietnic · KY-024", url: "https://www.vietnic.vn/cam-bien-hall" }, { kind: "local", label: "Caka · raw 49E alternative", url: "https://caka.vn/cam-bien-tu-hall-sensor-49e" }]
      },
      {
        id: "bench-ir-emitter", group: "bow-output", buyNow: true, qty: 2, priceVnd: [20000, 80000], evidence: "datasheet-backed-source-choice",
        name: { vi: "LED IR Vishay TSAL6200 · 940 nm", en: "Vishay TSAL6200 IR LED · 940 nm" },
        why: { vi: "Phát gói 38 kHz vô hình; mua hai chiếc để có một linh kiện dự phòng.", en: "Emits the invisible 38 kHz packet; buy two so one is a spare." },
        verify: { vi: "Đúng mã TSAL6200, vỏ 5 mm. Chỉ dùng qua transistor và điện trở hạn dòng.", en: "Match TSAL6200 in a 5 mm package. Use only through a transistor and current resistor." },
        sources: [{ kind: "datasheet", label: "Vishay · official datasheet", url: "https://www.vishay.com/docs/81010/tsal6200.pdf" }, { kind: "distributor", label: "TME Vietnam · genuine reference", url: "https://www.tme.com/vn/vi/details/tsal6200/den-led-hong-ngoai/vishay/" }, { kind: "local", label: "Local search/reference", url: "https://linhkiendientutphcm.com/led-phat-hong-ngoai-tsal6200" }]
      },
      {
        id: "bench-ir-driver", group: "bow-output", buyNow: true, qty: 1, priceVnd: [10000, 30000], evidence: "generic-bench",
        name: { vi: "Driver 2N2222 + R base 1 kΩ + R LED 100 Ω", en: "2N2222 driver + 1 kΩ base R + 100 Ω LED R" },
        why: { vi: "GPIO chỉ điều khiển transistor; transistor cấp dòng xung cho LED IR.", en: "The GPIO controls the transistor; the transistor supplies pulsed IR LED current." },
        verify: { vi: "Đo đúng trị số điện trở và kiểm tra chân E/B/C theo đúng transistor đã mua.", en: "Meter both resistors and verify E/B/C against the exact transistor received." },
        sources: [{ kind: "market", label: "Search local 2N2222 kit", url: "https://shopee.vn/search?keyword=2N2222%20%C4%91i%E1%BB%87n%20tr%E1%BB%9F%201k%20100r" }]
      },
      {
        id: "bench-ir-receiver", group: "armour-input", buyNow: true, qty: 3, priceVnd: [60000, 240000], evidence: "datasheet-backed-source-choice",
        name: { vi: "Receiver Vishay TSOP38238 · 38 kHz", en: "Vishay TSOP38238 receiver · 38 kHz" },
        why: { vi: "Ba chiếc tạo ba vùng giáp; có thể mua một chiếc trước để bench rồi mua thêm hai.", en: "Three create the armour zones; buy one for bench before the other two." },
        verify: { vi: "Đúng hậu tố 38; pin 1 OUT, pin 2 GND, pin 3 VS theo datasheet, không đoán theo module khác.", en: "Use the 38 suffix; pin 1 OUT, pin 2 GND, pin 3 VS per datasheet—never copy another module's pinout." },
        sources: [{ kind: "datasheet", label: "Vishay · official datasheet", url: "https://www.vishay.com/docs/82491/tsop382.pdf" }, { kind: "distributor", label: "TME Vietnam · exact part", url: "https://www.tme.com/vn/vi/details/tsop38238/mo-dun-may-thu-hong-ngoai/vishay/" }, { kind: "local-proxy", label: "Local HS0038B proxy", url: "https://linhkienx.com/hs0038b-led-thu-hong-ngoai" }]
      },
      {
        id: "bench-decoupling", group: "armour-input", buyNow: true, qty: 3, priceVnd: [10000, 30000], evidence: "datasheet-required",
        name: { vi: "100 Ω + tụ 4,7 µF cho từng receiver", en: "100 Ω + 4.7 µF per receiver" },
        why: { vi: "Lọc nguồn ngay sát TSOP38238 để giảm nhiễu nguồn.", en: "Local receiver supply filtering to reduce electrical noise." },
        verify: { vi: "Đúng cực tụ điện phân; đặt sát chân VS/GND receiver.", en: "Observe electrolytic polarity and place it next to receiver VS/GND." },
        sources: [{ kind: "datasheet", label: "Vishay receiver application circuit", url: "https://www.vishay.com/docs/82491/tsop382.pdf" }]
      },
      {
        id: "bench-prototyping", group: "tools", buyNow: true, qty: 1, priceVnd: [60000, 160000], evidence: "generic-bench",
        name: { vi: "Breadboard + dây jumper + cáp USB data", en: "Breadboard + jumpers + USB data cable" },
        why: { vi: "Cho phép sửa dây và đo trước khi hàn hoặc đưa vào vỏ.", en: "Allows wiring changes and measurements before soldering or enclosure work." },
        verify: { vi: "Cáp phải truyền dữ liệu; dây jumper không lỏng; rail nguồn không bị tách giữa mà không biết.", en: "Cable must carry data; jumpers must grip; identify any split power rails." },
        sources: [{ kind: "market", label: "Search local bench set", url: "https://shopee.vn/search?keyword=breadboard%20830%20d%C3%A2y%20jumper%20c%C3%A1p%20usb%20data" }]
      },
      {
        id: "bench-multimeter", group: "tools", buyNow: true, qty: 1, priceVnd: [0, 250000], evidence: "borrow-or-buy",
        name: { vi: "Đồng hồ vạn năng · mượn hoặc mua", en: "Multimeter · borrow or buy" },
        why: { vi: "Bắt buộc để chặn output 5 V đi vào GPIO 3,3 V và kiểm tra chập nguồn.", en: "Required to stop 5 V outputs reaching 3.3 V GPIO and to catch supply shorts." },
        verify: { vi: "Đo được DC V và continuity; test que đo trước khi dùng.", en: "Must measure DC voltage and continuity; test the probes first." },
        sources: [{ kind: "local", label: "Find nearby electronics shop", url: "https://www.google.com/maps/search/c%E1%BB%ADa+h%C3%A0ng+linh+ki%E1%BB%87n+%C4%91i%E1%BB%87n+t%E1%BB%AD" }]
      },
      {
        id: "defer-production-shell", group: "defer", buyNow: false, qty: 0, priceVnd: [0, 0], evidence: "deferred",
        name: { vi: "Pin, PCB, vỏ in 3D và áo hoàn thiện", en: "Battery, PCB, 3D shell, and finished garment" },
        why: { vi: "Các món này phụ thuộc phép đo bench và fit; mua sớm dễ phải làm lại.", en: "These depend on bench and fit measurements; buying now risks rework." },
        verify: { vi: "Chỉ mở mua sau 100/100 draw và hit test đạt, rồi đo linh kiện thật.", en: "Release only after 100/100 draw and hit tests, then measure the received parts." },
        sources: []
      }
    ]
  };
  Object.freeze(window.ATLAS_PHYSICAL_KIT);
})();

(function () {
  window.ATLAS_BUILD_GRAPH = {
    revision: "0.1",
    projectId: "arc-bow-impact-armour-proof-01",
    status: "concept-unverified",
    components: [
      {
        id: "bow-hall-sensor", subsystem: "bow", label: { vi: "Cảm biến Hall", en: "Hall sensor" },
        manifest: { prop: "archer", moduleId: "hall-sensor", modelKey: "sensor", callout: 4 },
        purchase: { vi: "Linear Hall sensor, mua 1 chiếc sau khi mẫu tay cầm vừa tay.", en: "One linear Hall sensor, purchased after the grip mock-up fits." },
        placement: { vi: "Trong riser, mặt cảm biến hướng về nam châm trượt; khoảng cách phải đo trên linh kiện thật.", en: "Inside the riser, facing the sliding magnet; determine the gap from the real parts." },
        wiring: "SIGNAL → ADC candidate / VCC / GND · pin chưa khóa trên board thật",
        assemblyStep: 3,
        test: { vi: "30 lần kéo/thả tạo đường tín hiệu ổn định, không nhảy trạng thái khi đứng yên.", en: "Thirty draws produce a stable signal curve with no idle state jumps." },
        evidence: "unverified"
      },
      {
        id: "bow-draw-magnet", subsystem: "bow", label: { vi: "Nam châm con trượt", en: "Draw-slider magnet" },
        manifest: { prop: "archer", moduleId: "draw-magnet", modelKey: "control", callout: 3 },
        purchase: { vi: "Một nam châm nhỏ; chưa khóa kích thước và lực hút.", en: "One small magnet; size and pull force are not locked." },
        placement: { vi: "Trên con trượt dây kéo, thẳng hàng với Hall sensor và không thể bung ra.", en: "On the draw slider, aligned with the Hall sensor and mechanically retained." },
        wiring: "Không nối điện / no electrical connection",
        assemblyStep: 3,
        test: { vi: "Không rơi sau 100 lần kéo và không chạm trực tiếp vào board cảm biến.", en: "Remains retained after 100 draws and never strikes the sensor board." },
        evidence: "unverified"
      },
      {
        id: "bow-controller", subsystem: "bow", label: { vi: "Lõi ESP32 trên cung", en: "Bow ESP32 core" },
        manifest: { prop: "archer", moduleId: "esp32-riser", modelKey: "core", callout: 5 },
        purchase: { vi: "1 MKE-K01 ESP32-S3 N4 tham chiếu; chỉ mua một board cho proof.", en: "One reference MKE-K01 ESP32-S3 N4; buy only one board for the proof." },
        placement: { vi: "Trong khoang riser có nắp mở, cổng USB tiếp cận được và dây có chống kéo.", en: "Inside the serviceable riser, with accessible USB and strain-relieved wires." },
        wiring: "USB 5 V first · exact GPIO pending delivered-board inspection",
        assemblyStep: 4,
        test: { vi: "100 chu kỳ input không reset, chập hoặc nóng hơn mức chạm tay thoải mái.", en: "100 input cycles without reset, short, or uncomfortable touch temperature." },
        evidence: "referenced"
      },
      {
        id: "bow-ir-emitter", subsystem: "bow", label: { vi: "Bộ phát hit hồng ngoại", en: "Infrared hit emitter" },
        manifest: { prop: "archer", moduleId: "ir-hit-emitter", modelKey: null, callout: 7 },
        purchase: { vi: "IR LED điều chế + mạch driver giới hạn dòng; chưa khóa SKU.", en: "Modulated IR LED plus current-limited driver; SKU not locked." },
        placement: { vi: "Đầu trước riser, hướng theo trục ngắm; có chụp mềm bảo vệ và không dùng laser nhìn thấy.", en: "At the front of the riser on the aim axis, under a soft guard; no visible laser." },
        wiring: "GPIO candidate → current-limited driver → IR emitter",
        assemblyStep: 5,
        test: { vi: "Giáp nhận đúng mã ở khoảng cách mục tiêu; không phát hit khi chưa thả dây.", en: "Armour receives the coded shot at target range; no shot is emitted before release." },
        evidence: "missing-physical-proof"
      },
      {
        id: "armour-ir-zones", subsystem: "armour", label: { vi: "Ba mắt nhận hit", en: "Three hit receivers" },
        manifest: { armourZoneIds: ["left-shoulder", "chest", "right-shoulder"], moduleId: "three-ir-receivers", modelKey: null },
        purchase: { vi: "3 module nhận IR điều chế; chưa khóa SKU và khả năng hoạt động dưới ánh sáng sự kiện.", en: "Three modulated IR receiver modules; SKU and venue-light performance are unverified." },
        placement: { vi: "Vai trái, giữa ngực và vai phải; mỗi mắt có chụp giảm ánh sáng xiên.", en: "Left shoulder, chest, and right shoulder, each with a hood against oblique light." },
        wiring: "ZONE_L / ZONE_C / ZONE_R → three receiver GPIO inputs",
        assemblyStep: 4,
        test: { vi: "Mỗi vùng nhận độc lập 30 lần; vùng còn lại không báo hit.", en: "Each zone receives 30 independent shots while the other zones remain silent." },
        evidence: "missing-physical-proof"
      },
      {
        id: "armour-controller", subsystem: "armour", label: { vi: "Lõi nhận ESP32", en: "Armour ESP32 receiver" },
        manifest: { moduleId: "receiver-core", modelKey: "wearable", callout: 4 },
        purchase: { vi: "1 ESP32-S3 cho giáp proof; USB trước, pin để sau.", en: "One ESP32-S3 for the armour proof; USB first, battery later." },
        placement: { vi: "Trong túi sau lưng tháo rời, không tì trực tiếp vào cột sống.", en: "In a removable rear pocket, isolated from direct spinal pressure." },
        wiring: "3 IR inputs + 3 LED outputs + shared GND · USB power first",
        assemblyStep: 5,
        test: { vi: "Nhận, chống lặp shotId và gửi HIT_CONFIRM mà không reset.", en: "Receives, deduplicates shotId, and sends HIT_CONFIRM without reset." },
        evidence: "unverified"
      },
      {
        id: "armour-zone-feedback", subsystem: "armour", label: { vi: "LED phản hồi ba vùng", en: "Three-zone LED feedback" },
        manifest: { moduleId: "three-led-diffusers", modelKey: "wearable", callout: 1 },
        purchase: { vi: "Ba cụm LED tán sáng tháo rời; chưa khóa dòng và diffuser.", en: "Three removable diffused LED modules; current and diffuser are not locked." },
        placement: { vi: "Nằm cạnh từng mắt nhận, không che receiver và tháo được để giặt áo.", en: "Beside each receiver without covering it, removable before washing." },
        wiring: "LED_L / LED_C / LED_R → protected feedback outputs",
        assemblyStep: 6,
        test: { vi: "Chỉ vùng HIT_CONFIRM chớp; chạy sáng 10 phút không nóng khó chịu.", en: "Only the confirmed zone flashes; ten minutes of light remains comfortable to touch." },
        evidence: "unverified"
      },
      {
        id: "armour-adjustable-bib", subsystem: "armour", label: { vi: "Áo nền điều chỉnh", en: "Adjustable base vest" },
        manifest: { moduleId: "adjustable-bib", modelKey: "wearable", callout: 0 },
        purchase: { vi: "Áo bib mở hai bên hoặc thuê may; chưa có size chart đã đo.", en: "Open-side training bib or custom sewn vest; no measured size chart yet." },
        placement: { vi: "Dây vai và hông chỉnh độc lập, khóa tháo nhanh với một tay.", en: "Independent shoulder and side adjustment with one-hand quick release." },
        wiring: "Cable channels stay outside pressure and sweat zones",
        assemblyStep: 1,
        test: { vi: "Người nhỏ nhất và lớn nhất mặc 5 phút, tháo nhanh, không tê hoặc trượt.", en: "Smallest and largest users wear it for five minutes with quick removal, no numbness, and no slip." },
        evidence: "assumed"
      }
    ]
  };
})();

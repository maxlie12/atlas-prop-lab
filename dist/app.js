const commonPropBom = [
  ["MKE-K01 ESP32-S3 N4", "1", "Hshop / maker shop", "Bench"],
  ["MPU6050 IMU", "1", "Hshop / maker shop", "Bench"],
  ["Momentary button", "2", "Maker shop", "Bench"],
  ["WS2812B LED", "1 set", "Maker shop / marketplace", "Bench"],
  ["74AHCT125 level shifter + 330 Ω + 1000 µF", "1 set", "Maker shop", "Bench"],
  ["USB data cable", "1", "Computer shop", "Bench"],
  ["EVA foam sheets", "As cut plan", "Cosplay material shop", "Shell"]
];

const propKits = {
  guardian: {
    roleLabel: "GUARDIAN / DEFENCE", name: "Aegis Shield", kind: "shield", size: "Ø 500 mm",
    budget: "EST. 550K–1.2M VND",
    purpose: "A broad defensive controller that makes block direction, timing, acknowledgement, and team protection visible.",
    shell: "3-layer EVA, 45–55 cm, nylon arm straps", sensor: "MPU6050 + thumb trigger",
    core: "Removable rear-center module", events: "BLOCK_START · BLOCK_END · TAUNT",
    safety: "Rounded foam perimeter. No shield charge and no physical body contact.",
    callouts: ["10 mm EVA face", "ESP32 service box", "MPU6050 at centre", "Thumb trigger", "WS2812B rim", "Adjustable arm straps"],
    bom: [["10 mm EVA sheet", "2", "Cosplay material shop", "Shell"], ["Nylon strap + buckle", "2", "Sewing shop", "Shell"], ["Vibration motor", "1", "Maker shop", "Feedback"], ["Motor driver 2N2222 + 1N4148 diode", "1 set", "Maker shop", "Feedback"]],
    assembly: ["Print the 500 mm shield template and make a cardboard fit mock-up.", "Build and test ESP32, IMU, trigger, and one LED segment over USB.", "Cut and laminate the EVA layers; keep the service-box cavity open.", "Mount the IMU flat at the geometric centre with its axis arrow facing up.", "Install the thumb trigger under the dominant-hand grip.", "Route the LED rim through a protected channel and add a quick connector.", "Attach adjustable straps, close the removable rear cover, and calibrate neutral angle.", "Run 100 block raises and record false triggers before paint."]
  },
  warrior: {
    roleLabel: "WARRIOR / PRESSURE", name: "Pulse Sword", kind: "sword", size: "650 × 110 mm",
    budget: "EST. 450K–1.0M VND",
    purpose: "A short foam sword that sends deliberate swing intent only while its grip trigger is held.",
    shell: "Soft EVA blade, electronics confined to hilt", sensor: "MPU6050 + index trigger",
    core: "Hilt service cartridge", events: "STRIKE · HEAVY_STRIKE · PARRY",
    safety: "No metal or rigid full-length core. Performance gestures only; never strike another player.",
    callouts: ["Soft EVA blade", "Diffused LED spine", "IMU in guard", "Index trigger", "ESP32 hilt cartridge", "Wrist retention loop"],
    bom: [["5–10 mm EVA sheet", "2", "Cosplay material shop", "Shell"], ["Soft diffuser strip", "1", "Maker / craft shop", "Shell"], ["Wrist loop", "1", "Sewing shop", "Safety"]],
    assembly: ["Make a full-size cardboard silhouette and confirm the 650 mm length.", "Bench-test trigger-gated gesture detection over USB.", "Laminate the EVA blade without a metal or wooden core.", "Cut a protected LED channel along the spine.", "Mount the IMU in the guard, aligned with the blade direction.", "Build the removable hilt cartridge with ESP32 and connectors.", "Fit a wrist retention loop and close all hard edges under foam.", "Run 100 deliberate and 100 accidental motions; tune the gesture threshold."]
  },
  archer: {
    roleLabel: "ARCHER / RANGED", name: "Arc Bow", kind: "bow", size: "900 × 430 mm",
    budget: "EST. 650K–1.4M VND",
    purpose: "A no-projectile bow that measures draw and release, while Unity creates the virtual arrow and hit.",
    shell: "Light PVC/EVA limbs with low-tension elastic string", sensor: "Linear Hall sensor + magnet + IMU",
    core: "Central grip compartment", events: "DRAW_START · DRAW_READY · FIRE",
    safety: "No arrow, no launcher, and low string tension. The bow must never store projectile energy.",
    callouts: ["Foam-wrapped limb", "Low-tension draw cord", "Draw magnet", "Hall sensor slot", "ESP32 grip", "Limb status LEDs"],
    bom: [["Light PVC/EVA frame", "1", "Hardware + cosplay shop", "Shell"], ["Linear Hall sensor", "1", "Maker shop", "Input"], ["Small magnet", "1", "Maker shop", "Input"], ["Elastic draw cord", "1", "Craft shop", "Safety"]],
    assembly: ["Build a powerless foam/PVC bow mock-up and confirm comfortable reach.", "Bench-test the Hall sensor and magnet travel over USB.", "Set the draw cord to low tension; confirm it cannot launch any object.", "Install the Hall sensor inside the grip and the magnet on the draw slider.", "Mount the ESP32 in the central grip with a removable cover.", "Add diffused LEDs to the limbs without weakening the frame.", "Calibrate rest, ready, and release thresholds for three different users.", "Run 100 draws, including partial releases, and record missed or duplicate FIRE events."]
  },
  assassin: {
    roleLabel: "ASSASSIN / CONTROL", name: "Shade Daggers", kind: "dagger", size: "320 × 75 mm",
    budget: "EST. 450K–950K VND",
    purpose: "A paired visual set with electronics in the dominant dagger; trap placement remains virtual in the MVP.",
    shell: "Two short EVA daggers; one active and one passive", sensor: "MPU6050 + grip trigger",
    core: "Dominant-hand hilt", events: "QUICK_STRIKE · HEAVY_STRIKE · PLACE_TRAP",
    safety: "Short rounded foam blades. No thrust toward the head, torso, or another player.",
    callouts: ["Active EVA dagger", "Passive off-hand dagger", "IMU in active guard", "Grip trigger", "ESP32 active hilt", "Trap button / wrist pad"],
    bom: [["5–10 mm EVA sheet", "2", "Cosplay material shop", "Shell"], ["Wrist button pad", "1", "Maker + sewing shop", "Input"], ["Wrist retention loops", "2", "Sewing shop", "Safety"]],
    assembly: ["Make two 320 mm cardboard templates with fully rounded tips.", "Bench-test the active dagger and separate trap button over USB.", "Laminate both EVA bodies; keep only the dominant hilt serviceable.", "Align the IMU with the active blade direction.", "Install grip trigger, ESP32 cartridge, and wrist retention loop.", "Build the off-hand dagger as a passive lightweight prop.", "Map trap placement to an arena zone; do not place electronics on the floor yet.", "Test rapid combinations and verify one physical motion creates at most one event."]
  },
  mage: {
    roleLabel: "MAGE / SUPPORT", name: "Lumen Staff", kind: "staff", size: "1,100 × 140 mm",
    budget: "EST. 600K–1.3M VND",
    purpose: "A support staff with a luminous orb for healing, shielding, channeling, and revive intent.",
    shell: "Light PVC shaft fully wrapped in EVA; padded ends", sensor: "MPU6050 + CAST/SPECIAL buttons",
    core: "Lower grip for balance", events: "CAST_HEAL · CHANNEL · TEAM_SHIELD",
    safety: "Both ends padded. No spinning near other players and no ground impact.",
    callouts: ["Diffused LED orb", "Padded upper head", "CAST thumb button", "IMU below grip", "ESP32 lower grip", "Padded lower end"],
    bom: [["Light PVC tube", "1", "Hardware shop", "Shell"], ["EVA wrap + padding", "1 set", "Cosplay material shop", "Shell"], ["Diffused orb shell", "1", "Prop maker / 3D print", "Shell"], ["Vibration motor", "1", "Maker shop", "Feedback"], ["Motor driver 2N2222 + 1N4148 diode", "1 set", "Maker shop", "Feedback"]],
    assembly: ["Confirm 1.0–1.2 m length with the shortest expected player.", "Bench-test CAST, SPECIAL, IMU, orb LED, and haptic over USB.", "Wrap the shaft completely and pad both ends.", "Mount the orb with a removable diffuser and no exposed hard point.", "Place the IMU below the upper grip and align its forward axis.", "Install ESP32 and connectors in the lower grip to balance the orb.", "Calibrate pointing and channel posture for three users.", "Run heal, shield, and cancelled-channel scenarios before paint."]
  },
  boss: {
    roleLabel: "BOSS / RAID CONTROL", name: "Dark Knight Greatsword", kind: "greatsword", size: "1,150 × 360 mm",
    budget: "EST. 1.3M–3.0M VND",
    purpose: "The game Boss's phase-2 dark knight blade: a two-handed controller paired with the shared three-zone Atlas Impact Armour using the Boss gameplay profile.",
    shell: "Hollow EVA greatsword blade over a light spine, padded guard and pommel, shared adjustable impact armour", sensor: "MPU6050 + two grip triggers",
    core: "Two-handed grip + shared armour receiver", events: "SWEEP · SLAM · MARK · PHASE_SKILL",
    safety: "A hollow lightweight blade with a rounded tip, padded guard and pommel, and zero-contact attacks. AoE exists only in Unity and arena cues.",
    callouts: ["Hollow EVA greatsword blade", "Blade fuller LEDs", "Primary trigger", "IMU at balance point", "ESP32 in grip", "Shared 3-zone impact armour"],
    bom: [["10 mm EVA sheets", "3–4", "Cosplay material shop", "Shell"], ["Light PVC blade spine", "1", "Hardware shop", "Shell"], ["Armour training bib", "1", "Sports shop", "Wearable"], ["LED armour panels", "3", "Maker + sewing shop", "Feedback"], ["Second receiver core", "1", "Maker shop", "Field"]],
    assembly: ["Build the hollow greatsword blade at full size around its light spine and weigh it before electronics.", "Bench-test two triggers, IMU, and blade LEDs over USB.", "Pad the guard and pommel and round the blade tip.", "Install the IMU at the balance point and the ESP32 in the grip.", "Create an open-side adjustable armour bib with removable LED panels.", "Pair greatsword input and armour feedback under one boss session identity.", "Calibrate SWEEP, SLAM, and MARK without physical contact.", "Run a five-minute phase test and reject the build if heat, discomfort, or false attacks appear."]
  }
};

const propKitVi = {
  guardian: {
    roleLabel: "HỘ VỆ / PHÒNG THỦ", name: "Khiên Aegis",
    purpose: "Bộ điều khiển phòng thủ bản rộng, thể hiện rõ hướng đỡ, thời điểm đỡ, phản hồi và khả năng bảo vệ đồng đội.",
    shell: "EVA 3 lớp, 45–55 cm, quai đeo tay nylon", sensor: "MPU6050 + cò ngón cái",
    core: "Module tháo rời ở tâm mặt sau", events: "BẮT ĐẦU ĐỠ · KẾT THÚC ĐỠ · KHIÊU KHÍCH",
    safety: "Viền foam được bo tròn. Không lao khiên và không tiếp xúc cơ thể.",
    callouts: ["Mặt khiên EVA 10 mm", "Hộp bảo trì ESP32", "MPU6050 tại tâm", "Cò ngón cái", "LED WS2812B quanh viền", "Quai đeo tay điều chỉnh"],
    assembly: ["In mẫu khiên 500 mm và làm bản thử bằng bìa để kiểm tra độ vừa tay.", "Lắp thử ESP32, IMU, cò và một đoạn LED qua USB.", "Cắt rồi ép các lớp EVA; để mở khoang hộp bảo trì.", "Gắn IMU nằm phẳng tại tâm hình học, mũi tên trục hướng lên.", "Lắp cò ngón cái dưới tay cầm thuận.", "Đi dây LED trong rãnh bảo vệ và thêm đầu nối tháo nhanh.", "Gắn quai điều chỉnh, đóng nắp sau tháo rời và cân chỉnh góc trung tính.", "Thử 100 lần nâng khiên và ghi lại kích hoạt sai trước khi sơn."]
  },
  warrior: {
    roleLabel: "CHIẾN BINH / ÁP LỰC", name: "Kiếm Pulse",
    purpose: "Kiếm foam ngắn chỉ gửi ý định vung khi người chơi chủ động giữ cò ở tay cầm.",
    shell: "Lưỡi EVA mềm, điện tử chỉ nằm trong chuôi", sensor: "MPU6050 + cò ngón trỏ",
    core: "Hộp lõi tháo rời trong chuôi", events: "CHÉM · CHÉM MẠNH · ĐỠ ĐÒN",
    safety: "Không dùng kim loại hoặc lõi cứng chạy hết lưỡi. Chỉ biểu diễn động tác, không đánh người chơi khác.",
    callouts: ["Lưỡi EVA mềm", "Dải LED tán sáng", "IMU trong chắn tay", "Cò ngón trỏ", "Hộp ESP32 trong chuôi", "Dây giữ cổ tay"],
    assembly: ["Làm mẫu bìa đúng kích thước và xác nhận chiều dài 650 mm.", "Thử nhận động tác có giữ cò qua USB.", "Ép các lớp lưỡi EVA, không dùng lõi kim loại hoặc gỗ.", "Cắt rãnh LED có bảo vệ dọc sống kiếm.", "Gắn IMU trong chắn tay, thẳng theo hướng lưỡi kiếm.", "Lắp hộp ESP32 và đầu nối tháo rời trong chuôi.", "Thêm dây giữ cổ tay và phủ foam lên mọi cạnh cứng.", "Thử 100 động tác chủ ý và 100 chuyển động ngẫu nhiên để chỉnh ngưỡng."]
  },
  archer: {
    roleLabel: "CUNG THỦ / TẦM XA", name: "Cung Arc",
    purpose: "Cung không có tên, đo trạng thái kéo và thả; Unity tạo mũi tên ảo và quyết định trúng đích.",
    shell: "Cánh PVC/EVA nhẹ, dây đàn hồi lực thấp", sensor: "Hall tuyến tính + nam châm + IMU",
    core: "Khoang giữa tay cầm", events: "BẮT ĐẦU KÉO · SẴN SÀNG · BẮN",
    safety: "Không tên, không cơ chế phóng và dây có lực thấp. Cung không được tích năng lượng để phóng vật thể.",
    callouts: ["Cánh cung bọc foam", "Dây kéo lực thấp", "Nam châm theo dây kéo", "Khe cảm biến Hall", "ESP32 trong tay cầm", "LED trạng thái trên cánh"],
    assembly: ["Làm khung cung foam/PVC không điện và kiểm tra tầm với thoải mái.", "Thử hành trình Hall sensor và nam châm qua USB.", "Đặt dây kéo lực thấp; xác nhận không thể phóng bất kỳ vật thể nào.", "Gắn Hall sensor trong tay cầm và nam châm trên con trượt dây.", "Gắn ESP32 trong tay cầm giữa với nắp tháo rời.", "Thêm LED tán sáng vào cánh cung mà không làm yếu khung.", "Cân chỉnh vị trí nghỉ, sẵn sàng và thả cho ba người dùng.", "Thử 100 lần kéo, gồm cả thả nửa chừng, rồi ghi nhận sự kiện FIRE thiếu hoặc lặp."]
  },
  assassin: {
    roleLabel: "SÁT THỦ / KIỂM SOÁT", name: "Dao Shade",
    purpose: "Cặp dao hiển thị đồng bộ nhưng chỉ dao thuận có điện tử; bẫy vẫn là đối tượng ảo trong MVP.",
    shell: "Hai dao EVA ngắn; một chủ động, một thụ động", sensor: "MPU6050 + cò tay cầm",
    core: "Chuôi tay thuận", events: "ĐÁNH NHANH · ĐÁNH MẠNH · ĐẶT BẪY",
    safety: "Lưỡi foam ngắn, đầu bo tròn. Không đâm về phía đầu, thân hoặc người chơi khác.",
    callouts: ["Dao EVA chủ động", "Dao tay phụ thụ động", "IMU trong chắn dao", "Cò tay cầm", "ESP32 trong chuôi", "Nút bẫy đeo cổ tay"],
    assembly: ["Làm hai mẫu bìa dài 320 mm với đầu được bo tròn hoàn toàn.", "Thử dao chủ động và nút bẫy riêng qua USB.", "Ép hai thân EVA; chỉ để chuôi tay thuận có thể bảo trì.", "Căn IMU thẳng theo hướng lưỡi dao chủ động.", "Lắp cò tay cầm, hộp ESP32 và dây giữ cổ tay.", "Làm dao tay phụ thành prop thụ động nhẹ.", "Ánh xạ đặt bẫy vào ô đấu; chưa đặt điện tử xuống sàn.", "Thử combo nhanh và xác nhận một chuyển động chỉ tạo tối đa một sự kiện."]
  },
  mage: {
    roleLabel: "PHÁP SƯ / HỖ TRỢ", name: "Gậy Lumen",
    purpose: "Gậy hỗ trợ có quả cầu phát sáng cho hồi máu, tạo khiên, niệm phép và hồi sinh.",
    shell: "Ống PVC nhẹ bọc EVA toàn bộ; hai đầu có đệm", sensor: "MPU6050 + nút CAST/SPECIAL",
    core: "Tay cầm dưới để cân bằng", events: "HỒI MÁU · NIỆM PHÉP · KHIÊN ĐỘI",
    safety: "Hai đầu được đệm mềm. Không xoay gậy gần người khác và không đập xuống đất.",
    callouts: ["Quả cầu LED tán sáng", "Đầu trên bọc đệm", "Nút CAST ngón cái", "IMU dưới tay cầm", "ESP32 trong tay cầm dưới", "Đầu dưới bọc đệm"],
    assembly: ["Xác nhận chiều dài 1,0–1,2 m với người chơi thấp nhất dự kiến.", "Thử CAST, SPECIAL, IMU, LED quả cầu và rung qua USB.", "Bọc toàn bộ thân gậy và đệm mềm hai đầu.", "Gắn quả cầu bằng vỏ tán sáng tháo rời, không để điểm cứng lộ ra.", "Đặt IMU dưới tay cầm trên và căn trục trước.", "Lắp ESP32 cùng đầu nối ở tay cầm dưới để cân bằng quả cầu.", "Cân chỉnh hướng chỉ và tư thế niệm phép cho ba người.", "Chạy các tình huống hồi máu, tạo khiên và hủy niệm trước khi sơn."]
  },
  boss: {
    roleLabel: "BOSS / KIỂM SOÁT TRẬN", name: "Đại kiếm Hiệp sĩ Hắc giáp",
    purpose: "Thanh kiếm của Boss ở phase 2 (hiệp sĩ giáp đen trong game): bộ điều khiển hai tay, kết hợp Giáp nhận sát thương Atlas ba vùng dùng chung ở profile Boss.",
    shell: "Lưỡi đại kiếm EVA rỗng quanh lõi nhẹ, chắn tay và chuôi bọc đệm, giáp nhận hit dùng chung có thể điều chỉnh", sensor: "MPU6050 + hai cò tay cầm",
    core: "Tay cầm hai tay + bộ nhận giáp dùng chung", events: "QUÉT · ĐẬP VÙNG · ĐÁNH DẤU · KỸ NĂNG PHASE",
    safety: "Lưỡi rỗng nhẹ, mũi bo tròn, chắn tay và chuôi bọc đệm; mọi đòn đánh đều không tiếp xúc. AoE chỉ tồn tại trong Unity và tín hiệu sân.",
    callouts: ["Lưỡi đại kiếm EVA rỗng", "LED rãnh lưỡi kiếm", "Cò chính", "IMU tại điểm cân bằng", "ESP32 trong tay cầm", "Giáp nhận sát thương ba vùng dùng chung"],
    assembly: ["Làm lưỡi đại kiếm rỗng đúng kích thước quanh lõi nhẹ và cân khối lượng trước khi gắn điện tử.", "Thử hai cò, IMU và LED lưỡi kiếm qua USB.", "Bọc đệm chắn tay, chuôi và bo tròn mũi kiếm.", "Gắn IMU tại điểm cân bằng và ESP32 trong tay cầm.", "Tạo áo bib mở hai bên với các tấm LED tháo rời.", "Ghép input kiếm và phản hồi áo vào cùng một định danh phiên Boss.", "Cân chỉnh SWEEP, SLAM và MARK mà không có tiếp xúc cơ thể.", "Chạy thử phase trong năm phút; loại bản dựng nếu nóng, khó chịu hoặc kích hoạt sai."]
  }
};

const staticTranslations = {
  ".brand-copy span": ["ESP32 prototype workspace", "Không gian thử nghiệm ESP32"],
  "#headerStatusText": ["V0.12 HARDWARE GATE", "V0.12 CỔNG PHẦN CỨNG"],
  ".mode-tabs [data-view='event-kit']": ["01 Event kit", "01 Bộ thiết bị"],
  ".mode-tabs [data-view='prototype']": ["02 ESP32 lab", "02 Xưởng ESP32"],
  ".mode-tabs [data-view='field']": ["03 Field simulator", "03 Mô phỏng trận"],
  "#event-kit .section-heading .eyebrow": ["ATLAS EVENT KIT V1 / 1 BOSS VS 4 HEROES", "ATLAS EVENT KIT V1 / 1 BOSS ĐẤU 4 HERO"],
  "#event-kit-title": ["Prop build planner", "Trình lập kế hoạch đạo cụ"],
  "#event-kit .section-note": ["The roster contains five hero kits. Load any four heroes plus the Dark Knight Boss for a match.", "Danh sách có năm bộ Hero. Mỗi trận chọn bốn Hero cùng Boss Hiệp sĩ Hắc giáp."],
  ".kit-status-grid div:nth-child(1) span": ["role build packs", "bộ thiết kế theo role"],
  ".kit-status-grid div:nth-child(2) span": ["minimum play zone", "khu chơi tối thiểu"],
  ".kit-status-grid div:nth-child(3) span": ["match target", "thời lượng trận"],
  ".kit-status-grid div:nth-child(4) span": ["MVP: five players + hub", "MVP: năm người + hub"],
  "#mvpFeedbackLabel": ["AFFORDABLE MVP / NO CAMERA", "MVP TIẾT KIỆM / KHÔNG CAMERA"],
  "#mvp-feedback-title": ["Prove the feeling before buying stage equipment", "Chứng minh cảm giác chơi trước khi mua thiết bị sân khấu"],
  "#mvpCostPill": ["LOW-COST FIRST PROOF", "THỬ RẺ TRƯỚC"],
  "#mvpDemoEyebrow": ["ONE ACTION → ONE VISIBLE CONSEQUENCE", "MỘT HÀNH ĐỘNG → MỘT KẾT QUẢ NHÌN THẤY"],
  "#mvpDemoTitle": ["Arc Bow feedback loop", "Vòng phản hồi Cung Arc"],
  "#mvpBowTitle": ["Bow LEDs", "LED trên cung"],
  "#mvpBowHint": ["Hall sensor detects draw and release", "Cảm biến Hall nhận kéo và thả dây"],
  "#mvpUnityTitle": ["Unity authority", "Unity quyết định"],
  "#mvpUnityHint": ["Accepts armour-confirmed hits, then checks cooldown and damage", "Chỉ nhận hit do giáp xác nhận, rồi kiểm tra hồi chiêu và sát thương"],
  "#mvpArmourTitle": ["Shared impact armour", "Giáp nhận sát thương dùng chung"],
  "#mvpArmourHint": ["Hero or Boss profile; only the confirmed zone flashes", "Profile Hero hoặc Boss; chỉ vùng được xác nhận mới phát sáng"],
  "#mvpTargetLabel": ["Simulated receiver zone", "Vùng receiver mô phỏng"],
  "[data-mvp-zone='left']": ["Left", "Trái"],
  "[data-mvp-zone='chest']": ["Chest", "Ngực"],
  "[data-mvp-zone='right']": ["Right", "Phải"],
  "#mvpInitialLog": ["System ready · no projector or camera required", "Hệ thống sẵn sàng · không cần máy chiếu hoặc camera"],
  "#mvpBoundaryEyebrow": ["SPEND ONLY AFTER THE LOOP FEELS GOOD", "CHỈ CHI TIỀN SAU KHI VÒNG PHẢN HỒI ĐỦ ĐÃ"],
  "#mvpBoundaryTitle": ["Three investment levels", "Ba mức đầu tư"],
  "#mvpTierOneTitle": ["Build now", "Làm ngay"],
  "#mvpTierOneText": ["Bow LED + Hall sensor, Unity screen, one three-zone armour receiver and sound.", "LED cung + cảm biến Hall, màn hình Unity, một bộ nhận giáp ba vùng và âm thanh."],
  "#mvpTierOneBadge": ["NO CAMERA", "KHÔNG CAMERA"],
  "#mvpTierTwoTitle": ["Upgrade after playtest", "Nâng cấp sau playtest"],
  "#mvpTierTwoText": ["Add fixed floor zones or rent one overhead projector for a special event.", "Thêm vùng sàn cố định hoặc thuê một máy chiếu trên cao cho sự kiện đặc biệt."],
  "#mvpTierTwoBadge": ["OPTIONAL", "TÙY CHỌN"],
  "#mvpTierThreeTitle": ["Stage edition", "Bản sân khấu"],
  "#mvpTierThreeText": ["Camera tracking, projection mapping and haze only after the event model is proven.", "Camera tracking, projection mapping và haze chỉ dùng sau khi mô hình sự kiện đã được chứng minh."],
  "#mvpTierThreeBadge": ["DEFER", "ĐỂ SAU"],
  "#mvpProofGateTitle": ["MVP purchase gate", "Cổng mua đồ MVP"],
  "#mvpProofGateText": ["Do not buy a projector. First prove that release, screen VFX, armour flash and sound feel like one event.", "Chưa mua máy chiếu. Trước hết phải chứng minh thả dây, VFX trên màn hình, giáp chớp sáng và âm thanh tạo cảm giác như một sự kiện duy nhất."],
  ".twin-panel .panel-label": ["Interactive digital twin", "Bản sao số tương tác"],
  "#twinStatus": ["DETAIL PASS V0.9", "BẢN CHI TIẾT V0.9"],
  ".twin-controls .eyebrow": ["EXPLORE BEFORE BUILDING", "KHẢO SÁT TRƯỚC KHI CHẾ TÁC"],
  "#twinIntro": ["Rotate the model, separate its layers, and select a component to inspect where it belongs.", "Xoay mô hình, tách các lớp và chọn linh kiện để xem vị trí lắp."],
  "#explodeLabel": ["Exploded view", "Mức tách lớp"],
  "#electronicsLayerLabel": ["Show electronics layer", "Hiện lớp điện tử"],
  "#twinPartsLabel": ["Selectable modules", "Các mô-đun có thể chọn"],
  "#twinBoundary": ["Detailed web twin, not final manufacturing geometry. Verify real dimensions with a cardboard or EVA mock-up before cutting final material.", "Bản sao web đã có silhouette và vật liệu chi tiết, chưa phải hình học sản xuất cuối. Phải xác minh kích thước thật bằng mẫu carton hoặc EVA trước khi cắt vật liệu."],
  "#syncTwinLabel": ["Follow the current assembly step", "Theo bước lắp ráp hiện tại"],
  ".production-heading .eyebrow": ["GUARDIAN / PRODUCTION READINESS", "GUARDIAN / SẴN SÀNG CHẾ TÁC"],
  "#guardian-production-title": ["From design to first physical shield", "Từ thiết kế tới chiếc khiên vật lý đầu tiên"],
  ".production-heading .section-note": ["These values create a full-size cardboard starting point. The mock-up must pass before final EVA or electronics purchases.", "Các giá trị này tạo điểm bắt đầu cho mẫu carton đúng kích thước. Mẫu thử phải PASS trước khi mua EVA cuối hoặc linh kiện điện tử."],
  ".fit-panel .panel-label": ["Fit calculator", "Tính kích thước thử"],
  ".fit-panel .mono-pill": ["MOCK-UP VALUES", "GIÁ TRỊ MẪU THỬ"],
  "label[for='playerHeight'] span": ["Player height", "Chiều cao người chơi"],
  "label[for='forearmLength'] span": ["Forearm length", "Chiều dài cẳng tay"],
  ".fit-results div:nth-child(1) span": ["Starting diameter", "Đường kính khởi điểm"],
  ".fit-results div:nth-child(1) small": ["Clamp: 45–55 cm", "Giới hạn: 45–55 cm"],
  ".fit-results div:nth-child(2) span": ["Strap centres", "Khoảng tâm hai quai"],
  ".fit-results div:nth-child(2) small": ["Keep both adjustable", "Cả hai quai phải chỉnh được"],
  ".fit-results div:nth-child(3) span": ["Electronics cavity", "Khoang điện tử"],
  ".fit-results div:nth-child(3) small": ["Rear removable cover", "Nắp sau tháo rời"],
  ".fit-results div:nth-child(4) span": ["Target mass", "Khối lượng mục tiêu"],
  ".fit-results div:nth-child(4) small": ["Reject if wrist-heavy", "Loại nếu nặng cổ tay"],
  ".production-warning strong": ["Not a final cutting specification", "Chưa phải thông số cắt cuối"],
  "#fitWarningText": ["Print or draw this diameter on cardboard. Test three users and adjust it before transferring the outline to EVA.", "In hoặc vẽ đường kính này lên carton. Thử với ba người rồi điều chỉnh trước khi chuyển biên dạng sang EVA."],
  ".layer-panel .panel-label": ["Physical layer stack", "Cấu trúc lớp vật lý"],
  ".buy-gate-panel .panel-label": ["Purchase gates", "Cổng mua đồ"],
  ".buy-gate-panel > .fine-print": ["“Buy later” protects the budget: do not order electronics until the cardboard fit gate passes.", "“Mua sau” là khóa bảo vệ ngân sách: chưa đặt điện tử cho tới khi mẫu carton đạt FIT PASS."],
  ".readiness-panel .panel-label": ["Release gates", "Cổng cho phép chế tác"],
  "#clearGuardianGates": ["Clear checks", "Xóa đánh dấu"],
  "#downloadGuardianProductionPack": ["Download Guardian production pack", "Tải bộ chế tác Guardian"],
  ".production-assets a:nth-child(1)": ["500 mm face template", "Mẫu mặt khiên 500 mm"],
  ".production-assets a:nth-child(2)": ["Rear layout + section", "Mặt sau + mặt cắt"],
  ".blueprint-panel .panel-label": ["Numbered assembly drawing", "Bản vẽ lắp ráp đánh số"],
  ".blueprint-scale small": ["Concept dimensions — verify on the first foam mock-up", "Kích thước ý tưởng — cần xác minh bằng mẫu foam đầu tiên"],
  ".spec-stack div:nth-child(1) span": ["Shell", "Vỏ đạo cụ"],
  ".spec-stack div:nth-child(2) span": ["Sensor", "Cảm biến"],
  ".spec-stack div:nth-child(3) span": ["Core location", "Vị trí lõi"],
  ".spec-stack div:nth-child(4) span": ["Game events", "Sự kiện game"],
  ".safety-note strong": ["Physical rule", "Quy tắc vật lý"],
  "#downloadBuildPack": ["Download role build pack", "Tải bộ hướng dẫn role"],
  ".procurement-panel .panel-label": ["What to buy", "Cần mua gì"],
  ".procurement-panel thead th:nth-child(1)": ["Part", "Linh kiện"],
  ".procurement-panel thead th:nth-child(2)": ["Qty", "SL"],
  ".procurement-panel thead th:nth-child(3)": ["Source", "Nguồn mua"],
  ".procurement-panel thead th:nth-child(4)": ["Stage", "Giai đoạn"],
  ".role-assembly-panel .panel-label": ["Assembly path", "Lộ trình lắp ráp"],
  "#guidedBuildEyebrow": ["PARTS READY / GUIDED ASSEMBLY", "ĐỦ LINH KIỆN / HƯỚNG DẪN LẮP"],
  "#guided-build-title": ["Build it one verified step at a time", "Lắp từng bước và kiểm tra trước khi tiếp tục"],
  "#guidedBuildIntro": ["The final drawing stays visible above. The numbered callout for the current operation is highlighted.", "Bản vẽ hoàn chỉnh luôn hiển thị phía trên; vị trí của bước hiện tại sẽ được làm nổi bật."],
  "#partsReadyLabel": ["I have checked all required parts", "Tôi đã kiểm tra đủ linh kiện"],
  "#guidedPartsHeading": ["Parts for this step", "Linh kiện dùng ở bước này"],
  "#guidedActionHeading": ["Do this", "Thao tác cần làm"],
  "#guidedResultHeading": ["Expected result", "Kết quả mong đợi"],
  "#guidedPassHeading": ["PASS before continuing", "Điều kiện PASS để tiếp tục"],
  "#guidedPrev": ["Previous step", "Bước trước"],
  "#guidedComplete": ["Mark step complete", "Đánh dấu hoàn thành"],
  "#guidedNext": ["Next step", "Bước tiếp"],
  ".supplier-links a:nth-child(1)": ["ESP32-S3 source", "Nguồn mua ESP32-S3"],
  ".supplier-links a:nth-child(2)": ["MPU6050 source", "Nguồn mua MPU6050"],
  ".supplier-links a:nth-child(3)": ["EVA material source", "Nguồn mua EVA"],
  ".supplier-links a:nth-child(4)": ["Hanoi prop shop", "Cửa hàng đạo cụ Hà Nội"],
  ".supplier-links a:nth-child(5)": ["Cosplay marketplace", "Chợ đồ cosplay"],
  ".procurement-panel .fine-print": ["Supplier links are references, not locked SKUs. Recheck stock, dimensions, shipping, and seller reliability before purchase.", "Các link chỉ là nguồn tham khảo, chưa khóa SKU. Hãy kiểm tra lại tồn kho, kích thước, phí giao và độ uy tín trước khi mua."],
  ".kit-boundary div:nth-child(1) strong": ["What this planner proves", "Tool hiện chứng minh được"],
  ".kit-boundary div:nth-child(1) p": ["Role geometry, component placement, purchase categories, event names, and ordered assembly.", "Hình dạng role, vị trí linh kiện, nhóm đồ cần mua, tên sự kiện và thứ tự lắp ráp."],
  ".kit-boundary div:nth-child(2) strong": ["What still needs human proof", "Phần vẫn cần người thật xác minh"],
  ".kit-boundary div:nth-child(2) p": ["Real measurements, comfort, impact safety, battery heat, radio range, false gestures, and Unity integration.", "Kích thước thật, độ thoải mái, an toàn va chạm, nhiệt pin, sóng, nhận nhầm động tác và tích hợp Unity."],
  "#prototype-title": ["ESP32 Electronics Lab", "Xưởng mạch ESP32"],
  "#prototype > .section-heading .eyebrow": ["ROLE ELECTRONICS / USB FIRST", "MẠCH THEO ROLE / USB TRƯỚC"],
  "#prototype > .section-heading .section-note": ["Your Page 1 prop follows you here with its own parts, GPIO map, event tests, and downloadable bench circuit.", "Đạo cụ đã chọn ở Trang 1 tự đi theo sang đây, kèm linh kiện, sơ đồ GPIO, nút thử sự kiện và mạch bàn có thể tải."],
  "#coreContractLabel": ["Atlas Core v1 · reusable cartridge", "Atlas Core v1 · lõi tháo lắp dùng chung"],
  "#coreImageCaption": ["Concept appearance only — use the circuit map and inspected board labels for wiring.", "Chỉ minh họa hình thái — khi đi dây phải dùng sơ đồ mạch và nhãn đã kiểm tra trên board thực."],
  "#coreContractEyebrow": ["ONE CONTROLLER / SIX ROLE HARNESSES", "MỘT BỘ ĐIỀU KHIỂN / SÁU BỘ DÂY ROLE"],
  "#coreContractTitle": ["Prove one removable core before duplicating it", "Chứng minh một lõi tháo rời trước khi nhân bản"],
  "#coreContractText": ["The controller, USB power and event envelope stay common. Only the sensor, controls and feedback harness change with the selected prop.", "Bộ điều khiển, nguồn USB và khuôn event được dùng chung. Chỉ cảm biến, nút điều khiển và bộ dây phản hồi thay đổi theo đạo cụ."],
  "#coreControllerLabel": ["Physical reference", "Board vật lý tham chiếu"],
  "#coreControllerNote": ["Confirm the delivered USB connector and printed pin labels before wiring.", "Xác nhận cổng USB và nhãn chân in trên board nhận được trước khi đi dây."],
  "#coreHarnessLabel": ["Selected role harness", "Bộ dây role đang chọn"],
  "#corePowerLabel": ["First power path", "Nguồn cho lần thử đầu"],
  "#corePowerValue": ["USB data + 5 V only", "Chỉ USB data + 5 V"],
  "#corePowerNote": ["Battery charging and radio stay outside the first proof.", "Pin sạc và sóng chưa tham gia lần chứng minh đầu."],
  "#coreProxyLabel": ["Simulation boundary", "Ranh giới mô phỏng"],
  "#coreProxyValue": ["Wokwi ESP32-S3 DevKitC-1 proxy", "Wokwi ESP32-S3 DevKitC-1 làm proxy"],
  "#coreProxyNote": ["It proves event logic, not the exact physical S3 pinout.", "Nó chứng minh logic event, không chứng minh pinout S3 vật lý chính xác."],
  "#coreProofLabel": ["Core proof ladder", "Thang chứng minh Core"],
  "#clearCoreProof": ["Clear physical checks", "Xóa các kiểm tra vật lý"],
  "#downloadCoreProofPack": ["Download Core proof pack", "Tải bộ chứng minh Core"],
  "#coreBuyLink": ["Open controller source", "Mở nguồn mua board"],
  "#prototype .controls-panel > .panel-label": ["Device configuration", "Cấu hình thiết bị"],
  "label[for='roleSelect']": ["Selected prop", "Đạo cụ đã chọn"],
  "label[for='transportSelect']": ["Event transport", "Kênh truyền sự kiện"],
  ".controls-panel .switch-row:nth-child(6) strong": ["LED feedback", "Phản hồi LED"],
  ".controls-panel .switch-row:nth-child(6) small": ["Role colour and acknowledgement", "Màu role và xác nhận"],
  ".controls-panel .switch-row:nth-child(7) strong": ["Secondary feedback", "Phản hồi phụ"],
  ".controls-panel .switch-row:nth-child(7) small": ["Vibration or short local tone", "Rung hoặc âm báo ngắn"],
  ".circuit-panel .panel-label": ["Circuit map", "Sơ đồ mạch"],
  ".map-panel > .panel-label": ["Pin contract", "Quy ước chân"],
  "#downloadDiagram": ["Download diagram.json", "Tải diagram.json"],
  "#downloadConfig": ["Download device config", "Tải cấu hình thiết bị"],
  ".download-stack a": ["Open Wokwi", "Mở Wokwi"],
  "#field-title": ["Field simulator", "Mô phỏng trận đấu"],
  "#field .section-heading .eyebrow": ["EVENT PATH / FAILURE TEST", "LUỒNG SỰ KIỆN / THỬ LỖI"],
  "#field .section-note": ["Test how an input feels when delivery is delayed or lost.", "Kiểm tra cảm giác khi tín hiệu bị trễ hoặc mất gói."],
  "#arenaViewLabel": ["Arena view", "Góc nhìn sân đấu"],
  "[data-arena-view='logic']": ["Logic map", "Bản đồ logic"],
  ".arena-stats span": ["Boss HP", "Máu Boss"],
  "#resetSim": ["Reset", "Đặt lại"],
  "footer span:nth-child(2)": ["Planner revision 0.12 · Hardware proof workflow, not field certification", "Bản kế hoạch 0.12 · Quy trình chứng minh phần cứng, chưa phải chứng nhận thực địa"],
  ".telemetry-panel > .panel-label": ["Network conditions", "Điều kiện mạng"],
  "label[for='latencyRange'] span": ["Latency", "Độ trễ"],
  "label[for='lossRange'] span": ["Packet loss", "Mất gói"],
  ".metric-grid div:nth-child(1) span": ["Sent", "Đã gửi"],
  ".metric-grid div:nth-child(2) span": ["Delivered", "Đã nhận"],
  ".metric-grid div:nth-child(3) span": ["Lost", "Bị mất"],
  ".metric-grid div:nth-child(4) span": ["Avg latency", "Trễ TB"],
  ".log-label": ["Event stream", "Luồng sự kiện"],
  "#core-build-title": ["32-step bench build", "Lắp mạch bàn trong 32 bước"],
  ".core-build-heading .eyebrow": ["COMMON ESP32 CORE / ONE UNIT", "LÕI ESP32 CHUNG / MỘT BỘ"],
  ".core-build-heading .section-note": ["Complete the reusable electronics core here, then mount it into the selected prop using Page 1.", "Hoàn thành lõi điện tử dùng lại tại đây, rồi gắn vào đạo cụ đã chọn theo Trang 1."],
  ".bom-panel .panel-label": ["Bill of materials", "Bảng vật tư"],
  ".bom-panel thead th:nth-child(1)": ["Part", "Linh kiện"],
  ".bom-panel thead th:nth-child(2)": ["Qty", "SL"],
  ".bom-panel thead th:nth-child(3)": ["Stage", "Giai đoạn"],
  ".bom-panel .fine-print": ["Ranges are planning values. Recheck listings before purchase. The first proof uses USB power.", "Khoảng giá chỉ để lập kế hoạch. Kiểm tra lại tin bán trước khi mua. Bản thử đầu dùng nguồn USB."],
  ".guide-panel .panel-label": ["32 step assembly", "Lắp ráp 32 bước"],
  "#clearChecklist": ["Clear checks", "Xóa đánh dấu"],
  ".download-row > div:first-child strong": ["Repository build pack", "Bộ lắp ráp trong repository"],
  ".download-row > div:first-child p": ["Firmware, Wokwi files, event contract, BOM, and full guide.", "Firmware, file Wokwi, quy ước sự kiện, BOM và hướng dẫn đầy đủ."],
  ".download-row a:nth-child(1)": ["Wokwi circuit", "Mạch Wokwi"],
  ".download-row a:nth-child(2)": ["ESP32 firmware", "Firmware ESP32"],
  ".download-row a:nth-child(3)": ["Assembly guide", "Hướng dẫn lắp"],
  "footer span:nth-child(2)": ["Planner revision 0.12 · Hardware proof workflow, not field certification", "Bản kế hoạch 0.12 · Quy trình chứng minh phần cứng, chưa phải chứng nhận thực địa"]
};

const roleCardTranslations = {
  guardian: ["Guardian", "Shield", "Hộ vệ", "Khiên"],
  warrior: ["Warrior", "Sword", "Chiến binh", "Kiếm"],
  archer: ["Archer", "Bow", "Cung thủ", "Cung"],
  assassin: ["Assassin", "Daggers", "Sát thủ", "Dao găm"],
  mage: ["Mage", "Staff", "Pháp sư", "Gậy phép"],
  boss: ["Dark Knight", "Boss greatsword", "Hiệp sĩ Hắc giáp", "Đại kiếm Boss"]
};

let activeProp = "guardian";
let activeAssemblyStep = 0;
let activeVisualView = "overview";
let currentLanguage = ["vi", "en"].includes(localStorage.getItem("atlas-language")) ? localStorage.getItem("atlas-language") : "vi";

const roles = {
  guardian: { label: "GUARDIAN", color: "#f0b44d", cast: { damage: 8 }, special: { shield: 25 } },
  archer: { label: "ARCHER", color: "#16a6c9", cast: { damage: 18 }, special: { damage: 34 } },
  assassin: { label: "ASSASSIN", color: "#7057d9", cast: { damage: 14 }, special: { damage: 42 } },
  support: { label: "SUPPORT", color: "#39cc93", cast: { heal: 8 }, special: { heal: 22 } }
};

const electronicsProfiles = {
  guardian: { label: "GUARDIAN", name: "Aegis Shield", color: "#f0b44d", deviceId: "guardian-shield-01", parts: ["ESP32-S3", "MPU6050", "Thumb trigger", "WS2812B rim", "Vibration motor"], pins: [["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "Thumb trigger", "Cò ngón cái"], ["GPIO12", "LED rim data", "Dữ liệu LED viền"], ["GPIO13", "Vibration driver", "Driver motor rung"], ["5V / GND", "Shared power / ground", "Nguồn / GND chung"]], events: ["BLOCK_START", "BLOCK_END", "TAUNT"] },
  warrior: { label: "WARRIOR", name: "Pulse Sword", color: "#16a6c9", deviceId: "warrior-sword-01", parts: ["ESP32-S3", "MPU6050", "Index trigger", "WS2812B spine", "Vibration motor"], pins: [["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "Index trigger", "Cò ngón trỏ"], ["GPIO12", "LED spine data", "Dữ liệu LED sống kiếm"], ["GPIO13", "Vibration driver", "Driver motor rung"], ["5V / GND", "Shared power / ground", "Nguồn / GND chung"]], events: ["STRIKE", "HEAVY_STRIKE", "PARRY"] },
  archer: { label: "ARCHER", name: "Arc Bow", color: "#16a6c9", deviceId: "archer-bow-01", parts: ["ESP32-S3", "Linear Hall sensor", "Draw magnet", "Release trigger", "Status LEDs"], pins: [["GPIO4", "Hall sensor analog (ADC1)", "Hall analog (ADC1)"], ["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "Release trigger", "Cò nhả dây"], ["GPIO12", "Limb LED data", "Dữ liệu LED cánh cung"], ["5V / GND", "Shared power / ground", "Nguồn / GND chung"]], events: ["DRAW_START", "DRAW_READY", "FIRE"] },
  assassin: { label: "ASSASSIN", name: "Shade Daggers", color: "#7057d9", deviceId: "assassin-daggers-01", parts: ["ESP32-S3", "MPU6050", "Grip trigger", "Trap button", "Status LED"], pins: [["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "Grip trigger", "Cò tay cầm"], ["GPIO11", "Trap button", "Nút đặt bẫy"], ["GPIO12", "Status LED data", "Dữ liệu LED trạng thái"], ["5V / GND", "Shared power / ground", "Nguồn / GND chung"]], events: ["QUICK_STRIKE", "HEAVY_STRIKE", "PLACE_TRAP"] },
  mage: { label: "MAGE", name: "Lumen Staff", color: "#39cc93", deviceId: "mage-staff-01", parts: ["ESP32-S3", "MPU6050", "CAST button", "SPECIAL button", "Orb LEDs"], pins: [["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "CAST button", "Nút CAST"], ["GPIO11", "SPECIAL button", "Nút SPECIAL"], ["GPIO12", "Orb LED data", "Dữ liệu LED quả cầu"], ["GPIO13", "Vibration driver", "Driver motor rung"]], events: ["CAST_HEAL", "CHANNEL", "TEAM_SHIELD"] },
  boss: { label: "BOSS", name: "Dark Knight", color: "#ef6b68", deviceId: "boss-greatsword-01", parts: ["ESP32-S3", "MPU6050", "Primary trigger", "Secondary trigger", "Blade + armour LEDs"], pins: [["GPIO1/2", "MPU6050 SDA / SCL", "MPU6050 SDA / SCL"], ["GPIO10", "Primary trigger", "Cò chính"], ["GPIO11", "Secondary trigger", "Cò phụ"], ["GPIO12", "Blade LED data", "Dữ liệu LED lưỡi kiếm"], ["GPIO16/17", "Armour receiver UART2", "Bộ nhận áo giáp UART2"]], events: ["SWEEP", "SLAM", "MARK", "PHASE_SKILL"] }
};

const coreProofSteps = {
  en: [
    ["Controller reference locked", "MKE-K01 ESP32-S3 N4 is the physical reference; Wokwi ESP32-S3 DevKitC-1 runs the same GPIO contract as a logic proxy."],
    ["Board received and inspected", "Photograph both sides; confirm USB connector, printed labels, dimensions, and the exact module variant."],
    ["USB boot and serial ready", "Upload a minimal build and capture a stable 115200-baud ready message with no reset loop."],
    ["Role input passes 100 cycles", "The selected role emits each intended event once, with misses and duplicates recorded."],
    ["Feedback, current and heat pass", "Run LEDs and secondary feedback for 10 minutes; record peak current and touch temperature."],
    ["Unity serial bridge receives events", "Unity accepts the versioned event envelope and remains authoritative for hits, cooldowns, and damage."],
    ["Core passes enclosure fit gate", "Connectors remain accessible, cables have strain relief, and no rigid edge reaches the player."]
  ],
  vi: [
    ["Đã khóa board tham chiếu", "MKE-K01 ESP32-S3 N4 là board vật lý tham chiếu; Wokwi ESP32-S3 DevKitC-1 chạy cùng hợp đồng GPIO, chỉ là proxy logic."],
    ["Đã nhận và kiểm tra board", "Chụp hai mặt; xác nhận cổng USB, nhãn chân, kích thước và đúng biến thể module."],
    ["USB boot và serial ổn định", "Nạp bản tối thiểu và lưu log sẵn sàng ở 115200 baud, không lặp reset."],
    ["Input role đạt 100 chu kỳ", "Role đang chọn phát mỗi event đúng một lần; ghi lại mọi lần hụt hoặc lặp."],
    ["Phản hồi, dòng và nhiệt đạt", "Chạy LED cùng phản hồi phụ 10 phút; ghi dòng đỉnh và nhiệt độ khi chạm."],
    ["Unity serial bridge nhận event", "Unity nhận event có version và vẫn quyết định trúng đòn, hồi chiêu và sát thương."],
    ["Core đạt cổng lắp vỏ", "Đầu nối vẫn tiếp cận được, dây có chống kéo và không cạnh cứng nào chạm người chơi."]
  ]
};

const coreProofStorageKey = "atlas-core-proof-v1";

const guardianProduction = {
  en: {
    layers: [
      ["5 mm cosmetic face", "Logo, diffuser openings and a soft replaceable front skin.", "5 mm EVA"],
      ["10 mm structural ring", "Main shape; rounded perimeter with no rigid full-width core.", "10 mm EVA"],
      ["Protected cable channel", "LED and trigger wiring with quick connectors and strain relief.", "5 mm route"],
      ["Rear service plate", "Removable ESP32/IMU compartment; isolated from the forearm.", "5 mm EVA"],
      ["Adjustable wearable layer", "Two padded nylon straps plus a reachable thumb trigger.", "25 mm webbing"]
    ],
    groups: [
      { title: "BUY NOW · FIT MOCK-UP", items: [["Double-wall cardboard", "2 sheets · full-size fit proof"], ["Paper tape + marker", "1 set · outline and iteration"], ["25 mm nylon webbing", "1.5 m · strap position proof"], ["Adjustable buckles", "2 · verify quick release"], ["EVA offcut", "Small piece · edge and adhesive test"]] },
      { title: "BUY AFTER FIT PASS", items: [["MKE-K01 ESP32-S3 N4", "1 · USB-first controller"], ["MPU6050 module", "1 · centre-mounted IMU"], ["Momentary thumb trigger", "1 · deliberate input"], ["WS2812B strip", "1 m · protected rim feedback"], ["Wire + connectors", "1 set · removable service core"]] }
    ],
    gates: [
      ["G0 · Gameplay contract frozen", "BLOCK_START, BLOCK_END and TAUNT names are accepted by the game."],
      ["G1 · Cardboard fit PASS", "Three intended users wear it for five minutes; vision, wrist and quick removal all pass."],
      ["G2 · USB electronics PASS", "100 trigger/motion cycles with no duplicate event, reset, short or unsafe heat."],
      ["G3 · Integrated shell PASS", "30 cm mat drop and cable pull checks reveal no hard edge, loose layer or pinched wire."],
      ["G4 · Field rehearsal PASS", "Five-minute match with no body contact, false block, discomfort or recovery failure."]
    ]
  },
  vi: {
    layers: [
      ["Mặt trang trí 5 mm", "Logo, khe tán sáng và lớp mặt mềm có thể thay thế.", "EVA 5 mm"],
      ["Vòng kết cấu 10 mm", "Tạo hình chính; viền bo tròn, không dùng lõi cứng chạy toàn chiều rộng.", "EVA 10 mm"],
      ["Rãnh dây có bảo vệ", "Dây LED và cò dùng đầu nối nhanh cùng chống kéo.", "Rãnh 5 mm"],
      ["Tấm bảo trì mặt sau", "Khoang ESP32/IMU tháo rời, cách ly khỏi cẳng tay.", "EVA 5 mm"],
      ["Lớp đeo điều chỉnh", "Hai quai nylon có đệm cùng cò ngón cái dễ với tới.", "Quai 25 mm"]
    ],
    groups: [
      { title: "MUA NGAY · MẪU THỬ ĐỘ VỪA", items: [["Carton hai lớp", "2 tấm · thử kích thước thật"], ["Băng dính giấy + bút", "1 bộ · vẽ biên và chỉnh sửa"], ["Quai nylon 25 mm", "1,5 m · thử vị trí quai"], ["Khóa điều chỉnh", "2 · kiểm tra tháo nhanh"], ["Miếng EVA thừa", "Mảnh nhỏ · thử cạnh và keo"]] },
      { title: "MUA SAU KHI FIT PASS", items: [["MKE-K01 ESP32-S3 N4", "1 · bộ điều khiển ưu tiên USB"], ["Module MPU6050", "1 · IMU đặt tại tâm"], ["Cò ngón cái nhấn nhả", "1 · input chủ động"], ["Dải WS2812B", "1 m · LED viền có bảo vệ"], ["Dây + đầu nối", "1 bộ · lõi bảo trì tháo rời"]] }
    ],
    gates: [
      ["G0 · Khóa gameplay contract", "Game đã chấp nhận tên BLOCK_START, BLOCK_END và TAUNT."],
      ["G1 · Mẫu carton FIT PASS", "Ba người dự kiến đeo 5 phút; tầm nhìn, cổ tay và tháo nhanh đều đạt."],
      ["G2 · Mạch USB PASS", "100 chu kỳ cò/chuyển động không lặp event, reset, chập hoặc nóng nguy hiểm."],
      ["G3 · Vỏ tích hợp PASS", "Thả 30 cm xuống thảm và kéo dây không lộ cạnh cứng, bong lớp hoặc kẹp dây."],
      ["G4 · Diễn tập trận PASS", "Trận 5 phút không tiếp xúc cơ thể, block giả, khó chịu hoặc lỗi khôi phục."]
    ]
  }
};

const pinMap = [
  { pin: "GPIO10", name: "CAST button", color: "#16a6c9", optional: false },
  { pin: "GPIO11", name: "SPECIAL button", color: "#7057d9", optional: false },
  { pin: "GPIO12", name: "LED data", color: "#f0b44d", optional: "led" },
  { pin: "GPIO13", name: "Buzzer signal", color: "#f29f4b", optional: "buzzer" },
  { pin: "5V", name: "5V feedback power", color: "#e05858", optional: "feedback" },
  { pin: "GND", name: "Shared ground", color: "#718088", optional: false }
];

const pinNamesVi = {
  "CAST button": "Nút CAST", "SPECIAL button": "Nút SPECIAL", "LED data": "Dữ liệu LED",
  "Buzzer signal": "Tín hiệu buzzer", "5V feedback power": "Nguồn phản hồi 5V", "Shared ground": "GND chung"
};

const bom = [
  ["MKE-K01 ESP32-S3 N4 reference", "1", "Bench"], ["WS2812B 16 LED ring", "1", "Bench"],
  ["12 mm momentary button", "2", "Bench"], ["Passive piezo buzzer", "1", "Bench"],
  ["74AHCT125 level shifter", "1", "Bench"], ["330 Ω resistor", "1", "Bench"],
  ["1000 µF capacitor", "1", "Bench"], ["Half size breadboard", "1", "Bench"],
  ["Dupont jumper set", "1", "Bench"], ["USB data cable", "1", "Bench"],
  ["5V USB power bank", "1", "Field"], ["Prototype enclosure", "1", "Field"],
  ["USB power meter", "1", "Recommended"]
];

const guideSteps = [
  "Check every item against the bill of materials.", "Photograph both sides of the delivered MKE-K01 and record its module, USB connector, printed pin labels, and dimensions.",
  "Use USB power only for the first build.", "Keep the ESP32 disconnected while wiring.",
  "Place the delivered board across the breadboard center gap only if its spacing fits without force.", "Using the board labels and vendor documentation, identify power, GND, and the candidate GPIO contract before attaching any wire.",
  "Mark the CAST and SPECIAL buttons.", "Place both buttons across the breadboard center gap.",
  "Connect one CAST contact to GPIO10.", "Connect the opposite CAST contact to GND.",
  "Connect one SPECIAL contact to GPIO11.", "Connect the opposite SPECIAL contact to GND.",
  "Check that neither button connects 5V to GND.", "Confirm the firmware uses INPUT_PULLUP for both buttons.",
  "Place the passive buzzer on the breadboard.", "Connect buzzer positive to GPIO13.",
  "Connect buzzer negative to GND.", "Place the 74AHCT125 level shifter across the center gap.",
  "Connect level shifter VCC to 5V and GND to GND.", "Tie the selected channel enable pin low.",
  "Connect GPIO12 to the selected level shifter input.", "Connect its matching output through 330 Ω to LED ring DIN.",
  "Connect LED ring VCC to 5V.", "Connect LED ring GND to GND.",
  "Place the 1000 µF capacitor across ring VCC and GND, matching polarity.", "Compare every wire with the candidate pin table and the delivered board labels before connecting USB.",
  "Check for loose strands and accidental shorts.", "Connect the ESP32 with a data capable USB cable.",
  "Build and upload firmware/spell-orb with PlatformIO.", "Open serial monitor at 115200 baud and wait for ATLAS_PROP_READY.",
  "Press CAST, then SPECIAL; verify JSON, light, sound, and cooldown.", "Disconnect USB, label the revision, and record any difference before enclosure work."
];

const guideStepsVi = [
  "Đối chiếu từng món với bảng vật tư.", "Chụp hai mặt MKE-K01 nhận được; ghi module, cổng USB, nhãn chân in trên board và kích thước.",
  "Chỉ dùng nguồn USB cho bản lắp đầu tiên.", "Ngắt ESP32 khỏi nguồn trong lúc đi dây.",
  "Chỉ đặt board thực nhận qua rãnh giữa breadboard nếu khoảng chân vừa mà không phải ép.", "Dùng nhãn trên board và tài liệu nhà bán để xác định nguồn, GND và hợp đồng GPIO ứng viên trước khi nối dây.",
  "Đánh dấu nút CAST và SPECIAL.", "Đặt hai nút bắc qua rãnh giữa breadboard.",
  "Nối một chân CAST vào GPIO10.", "Nối chân CAST đối diện vào GND.",
  "Nối một chân SPECIAL vào GPIO11.", "Nối chân SPECIAL đối diện vào GND.",
  "Kiểm tra không nút nào nối tắt 5V với GND.", "Xác nhận firmware dùng INPUT_PULLUP cho cả hai nút.",
  "Đặt buzzer thụ động lên breadboard.", "Nối cực dương buzzer vào GPIO13.",
  "Nối cực âm buzzer vào GND.", "Đặt IC chuyển mức 74AHCT125 bắc qua rãnh giữa.",
  "Nối VCC của IC chuyển mức vào 5V và GND vào GND.", "Kéo chân enable của kênh được chọn xuống mức thấp.",
  "Nối GPIO12 vào đầu vào kênh đã chọn.", "Nối đầu ra tương ứng qua điện trở 330 Ω tới DIN của vòng LED.",
  "Nối VCC vòng LED vào 5V.", "Nối GND vòng LED vào GND.",
  "Đặt tụ 1000 µF giữa VCC và GND của vòng LED, đúng cực.", "So từng dây với bảng chân ứng viên và nhãn trên board thực nhận trước khi cắm USB.",
  "Kiểm tra sợi dây lỏng và nguy cơ chập mạch.", "Kết nối ESP32 bằng cáp USB có truyền dữ liệu.",
  "Build và nạp firmware/spell-orb bằng PlatformIO.", "Mở Serial Monitor 115200 baud và đợi ATLAS_PROP_READY.",
  "Nhấn CAST rồi SPECIAL; kiểm tra JSON, ánh sáng, âm thanh và cooldown.", "Rút USB, dán nhãn phiên bản và ghi lại sai khác trước khi làm vỏ."
];

const propManifests = window.ATLAS_PROP_MANIFESTS;
const guidedCallouts = Object.fromEntries(Object.entries(propManifests).map(([role, manifest]) => [role, manifest.assemblyCallouts]));

const guidedCopy = {
  en: {
    titles: ["Make a full-size fit mock-up", "Prove the electronics over USB", "Build the safe outer shell", "Install and align the motion sensor", "Install controls and removable wiring", "Install protected light feedback", "Close the serviceable wearable structure", "Calibrate and complete the abuse test"],
    results: ["A powerless mock-up that shows size, reach, grip and clearance before any expensive work.", "Each input appears once in Serial Monitor and the LEDs respond without resets or hot parts.", "A light, rounded body with no exposed rigid point and an open service cavity.", "The sensor cannot shift; its axes match the direction shown on the drawing.", "Every control is reachable, strain-relieved and disconnects without cutting a wire.", "Light is visible through a diffuser; wires cannot be pinched during normal use.", "The prop fits the intended users, stays adjustable and opens again for repair.", "A labelled revision with recorded test results and no unresolved safety failure."],
    passes: ["Three intended users can hold or wear it comfortably; no edge reaches the face during the planned motion.", "100 input presses/motions produce no duplicate event, brownout, short, or component above hand-warm temperature.", "Drop from 30 cm onto a mat: no exposed hard edge, loose laminate, or cracked load point.", "At rest the reading is stable; three repeated motions point in the same signed axis direction.", "Pull each wire gently and operate every control 30 times with no intermittent event.", "Run full brightness for 10 minutes: diffuser remains secure and the service area stays safe to touch.", "Fit the shortest and largest expected player for five minutes without numbness, slipping, or blocked quick removal.", "Complete the role's final motion count with no physical contact, no false event above the recorded threshold, and no heat or discomfort."],
    parts: [
      ["Full-size paper template", "Cardboard", "Ruler / tape measure", "Marker and low-tack tape"],
      ["ESP32-S3", "Role sensor", "Buttons / triggers", "Breadboard, jumpers and USB data cable"],
      ["Specified shell material", "EVA-safe adhesive", "Cutting tools", "Eye and hand protection"],
      ["Motion / draw sensor", "Foam mounting pad", "Axis label", "Ruler or alignment guide"],
      ["Buttons / trigger", "Flexible wire", "Quick connectors", "Heat-shrink and strain relief"],
      ["WS2812B LEDs", "330 Ω resistor", "Diffuser", "Protected connector"],
      ["Service cover", "Straps / hook-and-loop", "Comfort padding", "Cable ties or fabric channels"],
      ["Laptop + Serial Monitor", "USB power meter", "Test log", "Second person as safety observer"]
    ]
  },
  vi: {
    titles: ["Làm mẫu thử đúng kích thước", "Chứng minh mạch điện qua USB", "Tạo lớp vỏ ngoài an toàn", "Gắn và căn cảm biến chuyển động", "Gắn nút điều khiển và dây tháo rời", "Gắn phản hồi ánh sáng có bảo vệ", "Đóng kết cấu đeo được nhưng vẫn bảo trì", "Cân chỉnh và hoàn tất thử độ bền"],
    results: ["Có mẫu không điện để kiểm tra kích thước, tầm với, tay cầm và khoảng trống trước khi tốn tiền.", "Mỗi input xuất hiện đúng một lần trên Serial Monitor; LED phản hồi, board không reset và không nóng bất thường.", "Có thân nhẹ, bo tròn, không lộ điểm cứng và vẫn chừa khoang bảo trì.", "Cảm biến không xê dịch; các trục đúng với hướng thể hiện trên bản vẽ.", "Mọi nút đều dễ bấm, dây có chống kéo và tháo được mà không phải cắt.", "Ánh sáng nhìn rõ qua lớp tán; dây không bị kẹp trong quá trình sử dụng.", "Đạo cụ vừa với nhóm người dùng dự kiến, điều chỉnh được và mở lại để sửa chữa.", "Có một phiên bản được dán nhãn, kèm kết quả thử và không còn lỗi an toàn chưa xử lý."],
    passes: ["Ba người dùng dự kiến cầm hoặc mặc thoải mái; không cạnh nào chạm mặt trong động tác đã định.", "100 lần bấm/chuyển động không tạo sự kiện lặp, sụt nguồn, chập mạch hoặc linh kiện nóng quá mức cầm tay.", "Thả từ 30 cm xuống thảm: không lộ cạnh cứng, không bong lớp và không nứt điểm chịu lực.", "Khi đứng yên số đo ổn định; ba lần lặp cùng động tác đều đi đúng một chiều trục.", "Kéo nhẹ từng dây và thao tác mỗi nút 30 lần, không có tín hiệu chập chờn.", "Chạy sáng tối đa 10 phút: lớp tán không rơi và khu vực bảo trì vẫn an toàn khi chạm.", "Cho người thấp nhất và lớn nhất dự kiến dùng 5 phút: không tê, không tuột và vẫn tháo nhanh được.", "Hoàn tất số lần thử cuối của role, không tiếp xúc cơ thể, không vượt ngưỡng nhận nhầm đã ghi và không nóng/khó chịu."],
    parts: [
      ["Mẫu giấy đúng kích thước", "Bìa carton", "Thước / thước dây", "Bút và băng dính giấy"],
      ["ESP32-S3", "Cảm biến của role", "Nút / cò", "Breadboard, dây cắm và cáp USB data"],
      ["Vật liệu vỏ theo thiết kế", "Keo an toàn cho EVA", "Dụng cụ cắt", "Bảo hộ mắt và tay"],
      ["Cảm biến chuyển động / kéo", "Đệm foam gắn cảm biến", "Nhãn trục", "Thước hoặc dưỡng căn"],
      ["Nút / cò", "Dây mềm", "Đầu nối tháo nhanh", "Ống co nhiệt và chống kéo"],
      ["LED WS2812B", "Điện trở 330 Ω", "Lớp tán sáng", "Đầu nối có bảo vệ"],
      ["Nắp bảo trì", "Quai / khóa dán", "Đệm êm", "Dây rút hoặc rãnh vải"],
      ["Laptop + Serial Monitor", "Đồng hồ đo nguồn USB", "Phiếu ghi thử nghiệm", "Một người giám sát an toàn"]
    ]
  }
};

const bomViTerms = {
  "MPU6050 IMU": "Cảm biến MPU6050", "Momentary button": "Nút nhấn nhả", "WS2812B LED": "LED WS2812B",
  "USB data cable": "Cáp USB data", "EVA foam sheets": "Tấm foam EVA", "Maker shop": "Cửa hàng linh kiện",
  "Hshop / maker shop": "Hshop / cửa hàng linh kiện", "Computer shop": "Cửa hàng máy tính", "Cosplay material shop": "Cửa hàng vật liệu cosplay",
  "Maker shop / marketplace": "Cửa hàng linh kiện / sàn TMĐT", "Bench": "Mạch thử", "Shell": "Vỏ", "Field": "Thực địa",
  "Feedback": "Phản hồi", "Safety": "An toàn", "Input": "Đầu vào", "Wearable": "Đồ mặc", "Recommended": "Khuyến nghị",
  "As cut plan": "Theo bản cắt", "1 set": "1 bộ", "10 mm EVA sheet": "Tấm EVA 10 mm", "10 mm EVA sheets": "Tấm EVA 10 mm",
  "5–10 mm EVA sheet": "Tấm EVA 5–10 mm", "Nylon strap + buckle": "Quai nylon + khóa", "Vibration motor": "Motor rung",
  "Soft diffuser strip": "Dải tán sáng mềm", "Wrist loop": "Dây giữ cổ tay", "Wrist retention loops": "Dây giữ cổ tay",
  "Light PVC/EVA frame": "Khung PVC/EVA nhẹ", "Linear Hall sensor": "Cảm biến Hall tuyến tính", "Small magnet": "Nam châm nhỏ",
  "Elastic draw cord": "Dây kéo đàn hồi", "Wrist button pad": "Đệm nút đeo cổ tay", "Light PVC tube": "Ống PVC nhẹ",
  "Light PVC shaft": "Cán PVC nhẹ", "Light PVC blade spine": "Lõi PVC nhẹ cho lưỡi kiếm", "EVA wrap + padding": "EVA bọc + đệm", "Diffused orb shell": "Vỏ cầu tán sáng",
  "Armour training bib": "Áo bib làm nền giáp", "LED armour panels": "Tấm LED giáp", "Second receiver core": "Lõi nhận tín hiệu thứ hai",
  "Sewing shop": "Cửa hàng may", "Maker / craft shop": "Cửa hàng linh kiện / thủ công", "Hardware + cosplay shop": "Cửa hàng vật tư + cosplay",
  "Craft shop": "Cửa hàng thủ công", "Maker + sewing shop": "Cửa hàng linh kiện + may", "Hardware shop": "Cửa hàng vật tư",
  "Prop maker / 3D print": "Xưởng đạo cụ / in 3D", "Sports shop": "Cửa hàng thể thao",
  "74AHCT125 level shifter + 330 Ω + 1000 µF": "IC chuyển mức 74AHCT125 + 330 Ω + tụ 1000 µF", "Motor driver 2N2222 + 1N4148 diode": "Transistor 2N2222 + diode 1N4148 cho motor", "WS2812B 16 LED ring": "Vòng 16 LED WS2812B",
  "12 mm momentary button": "Nút nhấn nhả 12 mm", "Passive piezo buzzer": "Buzzer piezo thụ động", "74AHCT125 level shifter": "IC chuyển mức 74AHCT125",
  "330 Ω resistor": "Điện trở 330 Ω", "1000 µF capacitor": "Tụ 1000 µF", "Half size breadboard": "Breadboard nửa cỡ",
  "Dupont jumper set": "Bộ dây Dupont", "5V USB power bank": "Pin dự phòng USB 5V", "Prototype enclosure": "Hộp mẫu thử", "USB power meter": "Đồng hồ đo nguồn USB"
};

const state = {
  role: "archer", transport: "usb", led: true, buzzer: true,
  latency: 60, loss: 5, bossHp: 520, sent: 0, delivered: 0, lost: 0,
  latencyTotal: 0, sequence: 0, cooldown: { CAST: false, SPECIAL: false }
};

const mvpFeedbackCopy = {
  en: {
    zone: { left: "left shoulder", chest: "chest", right: "right shoulder" },
    badge: { idle: "READY", charge: "CHARGING", fire: "IN FLIGHT", hit: "HIT" },
    bow: { idle: "Waiting for draw", charge: "Draw detected · LEDs filling", fire: "Release detected · FIRE sent", hit: "Shot acknowledged" },
    unity: { idle: "Ready to validate", charge: "Awaiting release", fire: "Validating target and cooldown", hit: "HIT_CONFIRMED emitted" },
    armour: { idle: "Armour linked", charge: "Listening for confirmed hit", fire: "Packet incoming", hit: zone => `${zone} flashing red-white` },
    button: { idle: ["Hold to charge", "Release to fire"], charge: ["Charging…", "Release now"], busy: ["Resolving shot", "Unity remains authoritative"] },
    log: { charge: "DRAW_READY · limb LEDs charged", fire: zone => `FIRE · requested zone: ${zone}`, hit: zone => `HIT_CONFIRMED · ${zone} armour feedback`, ready: "READY · next shot available" }
  },
  vi: {
    zone: { left: "vai trái", chest: "ngực", right: "vai phải" },
    badge: { idle: "SẴN SÀNG", charge: "ĐANG NẠP", fire: "ĐANG BAY", hit: "TRÚNG" },
    bow: { idle: "Chờ kéo dây", charge: "Đã nhận lực kéo · LED đang nạp", fire: "Đã nhận thả dây · gửi FIRE", hit: "Cung đã nhận xác nhận" },
    unity: { idle: "Sẵn sàng kiểm tra", charge: "Chờ thả dây", fire: "Đang kiểm tra mục tiêu và hồi chiêu", hit: "Đã phát HIT_CONFIRMED" },
    armour: { idle: "Giáp đã kết nối", charge: "Đang chờ hit được xác nhận", fire: "Đang nhận gói tin", hit: zone => `${zone} chớp đỏ-trắng` },
    button: { idle: ["Giữ để nạp", "Thả để bắn"], charge: ["Đang nạp…", "Thả tay để bắn"], busy: ["Đang xử lý đòn", "Unity giữ quyền quyết định"] },
    log: { charge: "DRAW_READY · LED cánh cung đã nạp", fire: zone => `FIRE · yêu cầu vùng: ${zone}`, hit: zone => `HIT_CONFIRMED · giáp ${zone} phản hồi`, ready: "READY · có thể bắn tiếp" }
  }
};

const mvpFeedbackState = { phase: "idle", zone: "chest", startedAt: performance.now(), timers: [], ignoreClick: false };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function mvpCopy() { return mvpFeedbackCopy[currentLanguage]; }

function setMvpButtonCopy(mode) {
  const copy = mvpCopy().button[mode];
  $("#mvpFireMain").textContent = copy[0];
  $("#mvpFireSub").textContent = copy[1];
}

function setMvpPhase(phase) {
  const copy = mvpCopy();
  const zone = copy.zone[mvpFeedbackState.zone];
  mvpFeedbackState.phase = phase;
  $("#mvpSignalStage").dataset.state = phase;
  $("#mvpSignalStage").dataset.zone = mvpFeedbackState.zone;
  $("#mvpStateBadge").dataset.state = phase;
  $("#mvpStateBadge").textContent = copy.badge[phase];
  $("#mvpBowStatus").textContent = copy.bow[phase];
  $("#mvpUnityStatus").textContent = copy.unity[phase];
  $("#mvpArmourStatus").textContent = typeof copy.armour[phase] === "function" ? copy.armour[phase](zone) : copy.armour[phase];
  const button = $("#mvpFireButton");
  button.classList.toggle("is-charging", phase === "charge");
  button.disabled = phase === "fire" || phase === "hit";
  setMvpButtonCopy(phase === "idle" ? "idle" : phase === "charge" ? "charge" : "busy");
}

function addMvpLog(message) {
  const elapsed = Math.max(0, performance.now() - mvpFeedbackState.startedAt);
  const seconds = (elapsed / 1000).toFixed(3).padStart(6, "0");
  const item = document.createElement("li");
  item.innerHTML = `<time>${seconds}</time><span>${message}</span>`;
  $("#mvpEventLog").prepend(item);
  while ($$("#mvpEventLog li").length > 4) $("#mvpEventLog li:last-child").remove();
}

function clearMvpTimers() {
  mvpFeedbackState.timers.forEach(timer => clearTimeout(timer));
  mvpFeedbackState.timers = [];
}

function beginMvpCharge() {
  if (mvpFeedbackState.phase !== "idle") return;
  clearMvpTimers();
  mvpFeedbackState.startedAt = performance.now();
  setMvpPhase("charge");
  addMvpLog(mvpCopy().log.charge);
}

function releaseMvpShot() {
  if (mvpFeedbackState.phase !== "charge") return;
  const copy = mvpCopy();
  const zone = copy.zone[mvpFeedbackState.zone];
  setMvpPhase("fire");
  addMvpLog(copy.log.fire(zone));
  mvpFeedbackState.timers.push(setTimeout(() => {
    const hitCopy = mvpCopy();
    const hitZone = hitCopy.zone[mvpFeedbackState.zone];
    setMvpPhase("hit");
    addMvpLog(hitCopy.log.hit(hitZone));
  }, 520));
  mvpFeedbackState.timers.push(setTimeout(() => {
    setMvpPhase("idle");
    addMvpLog(mvpCopy().log.ready);
  }, 1450));
}

function selectMvpZone(zone) {
  if (!["left", "chest", "right"].includes(zone) || mvpFeedbackState.phase !== "idle") return;
  mvpFeedbackState.zone = zone;
  $("#mvpSignalStage").dataset.zone = zone;
  $$("[data-mvp-zone]").forEach(button => button.classList.toggle("is-active", button.dataset.mvpZone === zone));
  setMvpPhase("idle");
}

function renderMvpFeedbackCopy() {
  if (!$("#mvpSignalStage")) return;
  setMvpPhase(mvpFeedbackState.phase);
}

const blueprintFocus = {
  guardian: { 1: [190, 82], 2: [310, 220], 3: [310, 174], 4: [390, 198], 5: [434, 174], 6: [245, 226] },
  warrior: { 1: [284, 75], 2: [310, 135], 3: [342, 250], 4: [312, 289], 5: [310, 314], 6: [310, 340] },
  archer: { 1: [205, 86], 2: [420, 86], 3: [410, 178], 4: [286, 161], 5: [286, 207], 6: [238, 112] },
  assassin: { 1: [177, 92], 2: [433, 92], 3: [202, 239], 4: [177, 278], 5: [177, 306], 6: [433, 306] },
  mage: { 1: [310, 64], 2: [310, 108], 3: [330, 154], 4: [306, 205], 5: [307, 246], 6: [310, 316] },
  boss: { 1: [220, 52], 2: [382, 91], 3: [330, 181], 4: [310, 148], 5: [308, 257], 6: [505, 220] }
};

const guidedVisualCopy = {
  en: {
    heading: "Step images",
    note: "Technical diagram — use the printed template for final dimensions.",
    tabs: { overview: "Whole prop", detail: "Close-up", result: "After this step" },
    overview: (kit, callouts) => `${kit.name} overview. Drawing positions ${callouts.join(" + ")} are highlighted for this operation.`,
    detail: (names) => `Close-up of ${names.join("; ")}. Match the numbered positions before fastening anything.`,
    result: (step) => `Expected visual state after step ${step}. Green markers show areas already handled in the build sequence.`,
    location: "Install here",
    completed: "Expected after step"
  },
  vi: {
    heading: "Hình ảnh của bước này",
    note: "Sơ đồ kỹ thuật — dùng mẫu in để chốt kích thước cuối.",
    tabs: { overview: "Toàn bộ", detail: "Cận cảnh", result: "Sau bước này" },
    overview: (kit, callouts) => `Toàn bộ ${kit.name}. Các vị trí ${callouts.join(" + ")} đang được làm sáng cho thao tác này.`,
    detail: (names) => `Cận cảnh ${names.join("; ")}. Đối chiếu đúng vị trí đánh số trước khi cố định.`,
    result: (step) => `Trạng thái dự kiến sau bước ${step}. Dấu màu xanh thể hiện những vùng đã được xử lý trong quy trình.`,
    location: "Lắp tại đây",
    completed: "Kết quả sau bước"
  }
};

const fabricationAssetLabels = {
  "face-template": ["Guardian 500 mm face template", "Mẫu mặt khiên Guardian 500 mm"],
  "rear-layout": ["Guardian rear layout + section", "Mặt sau + mặt cắt Guardian"],
  "bow-template": ["Arc Bow 900 mm full-size template", "Mẫu Cung Arc 900 mm đúng kích thước"],
  "riser-layout": ["Arc Bow riser + Hall sensor layout", "Tay cầm + vị trí Hall của Cung Arc"]
};

let blueprintRenderId = 0;

function blueprintSvg(kind, options = {}) {
  const viewBox = options.viewBox || "0 0 620 360";
  const patternId = `bp-grid-${++blueprintRenderId}`;
  const frame = (content, label) => `<svg viewBox="${viewBox}" role="img" aria-label="${label} numbered concept assembly drawing">
    <defs><pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#183541" stroke-width="1"/></pattern></defs>
    <rect width="620" height="360" fill="url(#${patternId})"/>
    <g class="blueprint-object">${content}</g>
    <path class="dimension-line" d="M70 330H550 M70 322V338 M550 322V338"/>
  </svg>`;
  const dot = (n, x, y, tx, ty) => `<g class="bp-callout" data-callout="${n}"><path d="M${x} ${y}L${tx} ${ty}"/><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 4}" text-anchor="middle">${n}</text></g>`;
  if (kind === "shield") return frame(`
    <ellipse cx="310" cy="174" rx="174" ry="150"/><ellipse cx="310" cy="174" rx="148" ry="126"/>
    <ellipse cx="310" cy="174" rx="126" ry="106"/><circle cx="310" cy="174" r="45"/>
    <ellipse cx="310" cy="174" rx="137" ry="116" class="bp-led-ring"/>
    <path d="M244 112Q220 174 245 238M376 112Q400 174 375 238" stroke-dasharray="8 7"/>
    <rect x="273" y="199" width="74" height="42" rx="7" stroke-dasharray="7 6"/><rect x="286" y="161" width="48" height="26" rx="5" stroke-dasharray="7 6"/>
    ${dot(1,190,82,96,42)}${dot(2,310,220,518,272)}${dot(3,310,174,98,146)}${dot(4,390,198,526,221)}${dot(5,434,174,538,150)}${dot(6,245,226,102,286)}`, "Aegis Shield");
  if (kind === "sword") return frame(`
    <path d="M282 34L338 34L353 239L326 274H294L267 239Z"/><path d="M310 62V238"/>
    <path d="M225 250H395L378 279H242Z"/><rect x="291" y="273" width="38" height="64" rx="13"/><circle cx="310" cy="337" r="18"/>
    ${dot(1,284,75,118,48)}${dot(2,310,135,500,62)}${dot(3,342,250,520,190)}${dot(4,312,289,102,242)}${dot(5,310,314,496,302)}${dot(6,310,340,116,333)}`, "Pulse Sword");
  if (kind === "bow") return frame(`
    <path d="M420 38Q356 42 252 104Q181 149 270 158M270 202Q181 211 252 256Q356 318 420 322"/>
    <path d="M420 38Q426 180 420 322" class="bp-string"/><path d="M238 112Q300 70 396 48M238 248Q300 290 396 312" class="bp-led-ring"/>
    <path d="M270 139L310 128L326 157L316 224L276 232L260 204Z"/><rect x="271" y="157" width="30" height="48" rx="9"/>
    <rect x="275" y="148" width="24" height="20" rx="4" stroke-dasharray="6 5"/><circle cx="410" cy="178" r="9"/>
    ${dot(1,205,86,82,45)}${dot(2,420,86,534,52)}${dot(3,410,178,534,151)}${dot(4,286,161,94,151)}${dot(5,286,207,94,245)}${dot(6,238,112,117,94)}`, "Arc Bow");
  if (kind === "dagger") return frame(`
    <path d="M158 56L196 56L209 216L177 248L145 216Z"/><path d="M118 239H236L221 263H133Z"/><rect x="158" y="260" width="38" height="64" rx="12"/>
    <path d="M414 56L452 56L465 216L433 248L401 216Z"/><path d="M374 239H492L477 263H389Z"/><rect x="414" y="260" width="38" height="64" rx="12"/>
    ${dot(1,177,92,74,52)}${dot(2,433,92,548,46)}${dot(3,202,239,91,195)}${dot(4,177,278,80,288)}${dot(5,177,306,278,329)}${dot(6,433,306,545,302)}`, "Shade Daggers");
  if (kind === "staff") return frame(`
    <circle cx="310" cy="64" r="45"/><path d="M281 42L310 16L339 42M282 86L310 112L338 86"/>
    <path d="M294 108H326L320 318H300Z"/><rect x="287" y="138" width="46" height="92" rx="18"/>
    ${dot(1,310,64,494,42)}${dot(2,310,108,112,86)}${dot(3,330,154,504,135)}${dot(4,306,205,104,195)}${dot(5,307,246,508,255)}${dot(6,310,316,108,324)}`, "Lumen Staff");
  return frame(`
    <path d="M300 18Q318 30 322 50V214H278V50Q282 30 300 18Z"/><path d="M300 56V204" class="bp-led-ring"/>
    <rect x="226" y="214" width="148" height="18" rx="7"/><rect x="290" y="232" width="20" height="78" rx="9"/><circle cx="300" cy="322" r="13"/>
    <rect x="291" y="262" width="18" height="34" rx="5" stroke-dasharray="6 5"/><path d="M450 185l55-28 55 28v72l-55 35-55-35z"/><path d="M470 205h70v42h-70z"/>
    ${dot(1,300,96,86,42)}${dot(2,300,160,538,67)}${dot(3,310,246,99,148)}${dot(4,300,223,505,132)}${dot(5,300,279,102,290)}${dot(6,505,220,554,300)}`, "Dark Knight Greatsword and armour");
}

function guardianStepSvg(step, view = "overview") {
  const patternId = `guardian-step-grid-${++blueprintRenderId}`;
  const dot = (n, x, y, tx, ty) => `<g class="bp-callout is-highlighted" data-callout="${n}"><path d="M${x} ${y}L${tx} ${ty}"/><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 4}" text-anchor="middle">${n}</text></g>`;
  const label = (x, y, value, anchor = "start") => `<text class="technical-label" x="${x}" y="${y}" text-anchor="${anchor}">${value}</text>`;
  const dimension = (path, value, x, y) => `<path class="dimension-line" d="${path}"/>${label(x, y, value, "middle")}`;
  const face = (extra = "") => `<circle class="technical-shell" cx="310" cy="178" r="138"/><circle class="technical-guide" cx="310" cy="178" r="118"/>${extra}`;
  const views = {
    overview: { transform: "", title: "whole assembly" },
    detail: { transform: "translate(-115 -42) scale(1.38)", title: "installation close-up" },
    result: { transform: "", title: "expected completed state" }
  };
  const stage = [
    `${face(`<path class="technical-centre" d="M310 25V331M157 178H463"/>`)}${dimension("M172 330H448M172 323V337M448 323V337", "Ø 500 mm", 310, 350)}${label(458, 58, "CARDBOARD FIT")}${dot(1,190,82,92,48)}`,
    `<rect class="technical-bench" x="72" y="63" width="476" height="230" rx="14"/>` +
      `<rect class="technical-module" x="242" y="103" width="136" height="92" rx="8"/>${label(310,135,"ESP32-S3","middle")}${label(310,158,"USB ONLY","middle")}` +
      `<rect class="technical-module" x="108" y="112" width="88" height="62" rx="7"/>${label(152,147,"IMU","middle")}` +
      `<circle class="technical-module" cx="455" cy="140" r="24"/>${label(455,145,"BTN","middle")}` +
      `<path class="technical-wire" d="M196 140H242M378 140H431M310 195V245H455"/>` +
      `<path class="technical-led" d="M112 244H508"/>${label(310,275,"SERIAL: BLOCK_START / BLOCK_END","middle")}` +
      `${dot(2,310,118,486,44)}${dot(3,152,126,72,42)}${dot(4,455,116,548,92)}${dot(5,435,244,548,280)}`,
    `${face(`<circle class="technical-cut" cx="310" cy="178" r="47"/><path class="technical-cut" d="M222 105Q202 178 224 250M398 105Q418 178 396 250"/>`)}${label(90,55,"5 mm FACE")}${label(430,307,"10 mm RING")}${dimension("M495 94V262M488 94H502M488 262H502","55 mm MAX",548,181)}${dot(1,190,82,82,82)}`,
    `${face(`<rect class="technical-module" x="278" y="146" width="64" height="64" rx="8"/><path class="technical-axis axis-x-line" d="M310 178H394"/><path class="technical-axis axis-y-line" d="M310 178V94"/><path class="technical-axis axis-z-line" d="M310 178L260 228"/>`)}${label(402,182,"+X")}${label(310,84,"+Y","middle")}${label(246,240,"+Z","end")}${label(310,232,"FOAM CRADLE","middle")}${dot(3,310,178,500,80)}`,
    `${face(`<rect class="technical-module" x="273" y="205" width="74" height="46" rx="7"/><circle class="technical-control" cx="385" cy="190" r="13"/><path class="technical-wire" d="M385 203Q380 232 347 232M347 220H273M273 232H228"/><rect class="technical-connector" x="210" y="221" width="18" height="22" rx="3"/>`)}${label(385,164,"THUMB")}${label(310,271,"REMOVABLE LOOM","middle")}${dot(2,310,224,520,286)}${dot(4,385,190,535,148)}`,
    `${face(`<circle class="technical-led" cx="310" cy="178" r="126"/><path class="technical-wire" d="M184 178Q184 282 282 292H344Q436 282 436 178"/><rect class="technical-connector" x="301" y="281" width="20" height="22" rx="3"/>`)}${label(310,40,"SOFT DIFFUSER","middle")}${label(310,324,"330 Ω + QUICK CONNECTOR","middle")}${dot(5,434,174,528,94)}`,
    `${face(`<path class="technical-strap" d="M236 115Q210 178 236 242M384 115Q410 178 384 242"/><rect class="technical-hatch" x="269" y="198" width="82" height="54" rx="8"/><path class="technical-pad" d="M252 126Q224 178 252 230M368 126Q396 178 368 230"/>`)}${label(310,276,"SERVICE HATCH","middle")}${label(130,302,"ADJUSTABLE 25 mm STRAPS")}${dot(2,310,220,510,294)}${dot(6,245,226,87,246)}`,
    `${face(`<circle class="technical-led" cx="310" cy="178" r="126"/><path class="technical-strap" d="M236 115Q210 178 236 242M384 115Q410 178 384 242"/><rect class="technical-hatch" x="269" y="198" width="82" height="54" rx="8"/><circle class="technical-pass" cx="310" cy="178" r="34"/><path class="technical-check" d="M291 178l13 13 27-31"/>`)}${label(310,59,"30 cm DROP · 100 INPUTS · 10 min LIGHT","middle")}${label(310,322,"REVISION LABEL + TEST LOG","middle")}${dot(1,190,82,92,48)}${dot(2,310,220,520,286)}${dot(3,310,174,95,148)}${dot(4,390,198,520,191)}${dot(5,434,174,530,116)}${dot(6,245,226,96,286)}`
  ];
  const title = `${currentLanguage === "vi" ? "Guardian bước" : "Guardian step"} ${step + 1}: ${views[view].title}`;
  return `<svg viewBox="0 0 620 360" role="img" aria-label="${title}">
    <defs><pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#183541" stroke-width="1"/></pattern></defs>
    <rect width="620" height="360" fill="url(#${patternId})"/>
    <g class="guardian-step-drawing ${view === "result" ? "is-complete" : ""}" transform="${views[view].transform}">${stage[step]}</g>
    <text class="technical-step-number" x="24" y="34">0${step + 1}</text>
  </svg>`;
}

function focusedViewBox(role, callouts) {
  const points = callouts.map(number => blueprintFocus[role][number]);
  const minX = Math.min(...points.map(point => point[0]));
  const maxX = Math.max(...points.map(point => point[0]));
  const minY = Math.min(...points.map(point => point[1]));
  const maxY = Math.max(...points.map(point => point[1]));
  let width = Math.max(300, maxX - minX + 170);
  let height = Math.max(175, maxY - minY + 110);
  const targetRatio = 620 / 360;
  if (width / height < targetRatio) width = height * targetRatio;
  else height = width / targetRatio;
  width = Math.min(620, width); height = Math.min(360, height);
  const centerX = (minX + maxX) / 2; const centerY = (minY + maxY) / 2;
  const x = Math.max(0, Math.min(620 - width, centerX - width / 2));
  const y = Math.max(0, Math.min(360 - height, centerY - height / 2));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`;
}

function renderGuidedVisual() {
  const kit = localizedKit();
  const copy = guidedVisualCopy[currentLanguage];
  const callouts = guidedCallouts[activeProp][activeAssemblyStep];
  const names = callouts.map(number => `#${number} ${kit.callouts[number - 1]}`);
  const frame = $("#guidedVisualFrame");
  $("#guidedVisualHeading").textContent = copy.heading;
  $("#guidedVisualNote").textContent = copy.note;
  $("#guidedVisualTabs").innerHTML = Object.entries(copy.tabs).map(([view, label]) => `<button type="button" data-visual-view="${view}" class="${activeVisualView === view ? "is-active" : ""}" aria-pressed="${activeVisualView === view}">${label}</button>`).join("");
  frame.dataset.view = activeVisualView;
  frame.className = `guided-visual-frame is-${activeVisualView}`;
  const visual = () => activeProp === "guardian" ? guardianStepSvg(activeAssemblyStep, activeVisualView) : blueprintSvg(kit.kind);

  if (activeVisualView === "detail") {
    frame.innerHTML = `${activeProp === "guardian" ? visual() : blueprintSvg(kit.kind, { viewBox: focusedViewBox(activeProp, callouts) })}<div class="visual-location-card"><strong>${copy.location}</strong>${names.map(name => `<span>${name}</span>`).join("")}</div>`;
    $("#guidedVisualCaption").textContent = copy.detail(names);
  } else if (activeVisualView === "result") {
    frame.innerHTML = `${visual()}<div class="visual-result-stamp"><b>✓</b><span>${copy.completed} ${String(activeAssemblyStep + 1).padStart(2, "0")}</span></div>`;
    const assembled = new Set(guidedCallouts[activeProp].slice(0, activeAssemblyStep + 1).flat());
    $$(".bp-callout", frame).forEach(node => node.classList.toggle("is-assembled", assembled.has(Number(node.dataset.callout))));
    $("#guidedVisualCaption").textContent = copy.result(activeAssemblyStep + 1);
  } else {
    frame.innerHTML = `${visual()}<div class="visual-location-card compact"><strong>${copy.location}</strong><span>${callouts.map(number => `#${number}`).join(" · ")}</span></div>`;
    $("#guidedVisualCaption").textContent = copy.overview(kit, callouts);
  }
  $$(".bp-callout", frame).forEach(node => node.classList.toggle("is-highlighted", callouts.includes(Number(node.dataset.callout))));
}

function localizedKit() {
  return currentLanguage === "vi"
    ? { ...propKits[activeProp], ...propKitVi[activeProp] }
    : propKits[activeProp];
}

function localizeBomCell(value) {
  return currentLanguage === "vi" ? (bomViTerms[value] || value) : value;
}

function applyStaticTranslations() {
  const index = currentLanguage === "vi" ? 1 : 0;
  document.documentElement.lang = currentLanguage;
  for (const [selector, values] of Object.entries(staticTranslations)) {
    const element = $(selector);
    if (element) element.textContent = values[index];
  }
  for (const [role, values] of Object.entries(roleCardTranslations)) {
    const card = $(`.role-card[data-prop="${role}"]`);
    if (!card) continue;
    card.querySelector("strong").textContent = values[index ? 2 : 0];
    card.querySelector("small").textContent = values[index ? 3 : 1];
  }
  $$(".language-switch button").forEach(button => button.classList.toggle("is-active", button.dataset.language === currentLanguage));
  const roleOptions = {
    guardian: ["Guardian shield", "Khiên Hộ vệ"], warrior: ["Warrior sword", "Kiếm Chiến binh"], archer: ["Archer bow", "Cung Cung thủ"],
    assassin: ["Assassin daggers", "Dao găm Sát thủ"], mage: ["Mage staff", "Gậy Pháp sư"], boss: ["Dark Knight", "Hiệp sĩ Hắc giáp"]
  };
  for (const option of $$("#roleSelect option")) option.textContent = roleOptions[option.value][index];
  const transportOptions = {
    usb: ["USB serial · bench proof", "USB serial · thử trên bàn"],
    websocket: ["WiFi WebSocket · next proof", "WiFi WebSocket · thử tiếp theo"],
    espnow: ["ESP-NOW · field candidate", "ESP-NOW · ứng viên thực địa"]
  };
  for (const option of $$("#transportSelect option")) option.textContent = transportOptions[option.value][index];
  localStorage.setItem("atlas-language", currentLanguage);
  renderMvpFeedbackCopy();
}

function guidedStorageKey() { return `atlas-guided-${activeProp}`; }
function partsReadyStorageKey() { return `atlas-parts-ready-${activeProp}`; }

function getCompletedGuidedSteps() {
  try {
    const saved = JSON.parse(localStorage.getItem(guidedStorageKey()) || "[]");
    return Array.isArray(saved) ? saved.filter(value => Number.isInteger(value) && value >= 0 && value < 8) : [];
  } catch { return []; }
}

function renderGuidedAssembly() {
  const kit = localizedKit();
  const copy = guidedCopy[currentLanguage];
  const completed = getCompletedGuidedSteps();
  const callouts = guidedCallouts[activeProp][activeAssemblyStep];
  const ready = localStorage.getItem(partsReadyStorageKey()) === "true";

  $("#partsReadyCheck").checked = ready;
  $("#guidedStepNav").innerHTML = kit.assembly.map((_, index) => {
    const classes = [index === activeAssemblyStep ? "is-current" : "", completed.includes(index) ? "is-complete" : ""].filter(Boolean).join(" ");
    const label = currentLanguage === "vi" ? `Bước ${index + 1}` : `Step ${index + 1}`;
    return `<button type="button" data-guided-step="${index}" class="${classes}" aria-label="${label}"><span>${String(index + 1).padStart(2, "0")}</span><small>${copy.titles[index]}</small></button>`;
  }).join("");
  $("#guidedStepIndex").textContent = currentLanguage === "vi" ? `BƯỚC ${String(activeAssemblyStep + 1).padStart(2, "0")} / 08` : `STEP ${String(activeAssemblyStep + 1).padStart(2, "0")} / 08`;
  $("#guidedStepLocation").textContent = `${currentLanguage === "vi" ? "VỊ TRÍ BẢN VẼ" : "DRAWING"} ${callouts.map(value => String(value).padStart(2, "0")).join(" + ")}`;
  $("#guidedStepTitle").textContent = copy.titles[activeAssemblyStep];
  $("#guidedStepParts").innerHTML = copy.parts[activeAssemblyStep].map(item => `<li>${item}</li>`).join("");
  $("#guidedStepAction").textContent = kit.assembly[activeAssemblyStep];
  $("#guidedStepResult").textContent = copy.results[activeAssemblyStep];
  $("#guidedStepPass").textContent = copy.passes[activeAssemblyStep];
  $("#guidedProgress").style.width = `${completed.length / 8 * 100}%`;
  $("#guidedProgressText").textContent = currentLanguage === "vi" ? `${completed.length} / 8 hoàn thành` : `${completed.length} / 8 complete`;
  $("#guidedPrev").disabled = activeAssemblyStep === 0;
  $("#guidedNext").disabled = activeAssemblyStep === 7;
  $("#guidedComplete").disabled = !ready;
  $("#guidedComplete").classList.toggle("is-complete", completed.includes(activeAssemblyStep));
  $("#guidedComplete").textContent = completed.includes(activeAssemblyStep)
    ? (currentLanguage === "vi" ? "Bỏ đánh dấu hoàn thành" : "Undo completion")
    : (currentLanguage === "vi" ? "Đánh dấu hoàn thành" : "Mark step complete");
  renderGuidedVisual();
  $$(".bp-callout").forEach(node => node.classList.toggle("is-highlighted", callouts.includes(Number(node.dataset.callout))));
  $$("#propCallouts > div").forEach((node, index) => node.classList.toggle("is-highlighted", callouts.includes(index + 1)));
  window.dispatchEvent(new CustomEvent("atlas-guided-step-change", { detail: { prop: activeProp, step: activeAssemblyStep } }));
}

function renderPropKit() {
  const kit = localizedKit();
  window.AtlasCad.render(activeProp, currentLanguage, kit);
  document.documentElement.style.setProperty("--kit-accent", activeProp === "boss" ? "#ef6b68" : activeProp === "mage" ? "#39cc93" : activeProp === "guardian" ? "#f0b44d" : "#16a6c9");
  $("#propBlueprint").innerHTML = blueprintSvg(kit.kind);
  $("#propSize").textContent = kit.size;
  $("#propRoleLabel").textContent = kit.roleLabel;
  $("#propName").textContent = kit.name;
  $("#propPurpose").textContent = kit.purpose;
  $("#propShell").textContent = kit.shell;
  $("#propSensor").textContent = kit.sensor;
  $("#propCore").textContent = kit.core;
  $("#propEvents").textContent = kit.events;
  $("#propSafety").textContent = kit.safety;
  $("#propBudget").textContent = currentLanguage === "vi" ? kit.budget.replace("EST.", "DỰ KIẾN") : kit.budget;
  $("#propStatus").textContent = currentLanguage === "vi" ? (activeProp === "boss" ? "BỘ THIẾT KẾ BOSS" : "BỘ THIẾT KẾ HERO") : (activeProp === "boss" ? "BOSS DESIGN PACK" : "HERO DESIGN PACK");
  $("#propCallouts").innerHTML = kit.callouts.map((item, index) => `<div><b>${index + 1}</b><span>${item}</span></div>`).join("");
  const rows = [...commonPropBom, ...kit.bom];
  $("#propBomBody").innerHTML = rows.map(([part, qty, source, stage]) => `<tr><td>${localizeBomCell(part)}</td><td>${localizeBomCell(qty)}</td><td>${localizeBomCell(source)}</td><td><span class="stage-tag ${stage === "Bench" ? "" : "later"}">${localizeBomCell(stage)}</span></td></tr>`).join("");
  $("#propAssembly").innerHTML = kit.assembly.map(step => `<li><span></span><p>${step}</p></li>`).join("");
  const assetIndex = currentLanguage === "vi" ? 1 : 0;
  $("#roleProductionAssets").innerHTML = (propManifests[activeProp].assets || []).map(asset => `<a href="${asset.href}" download>${fabricationAssetLabels[asset.id][assetIndex]}</a>`).join("");
  $$(".role-card").forEach(card => card.classList.toggle("is-active", card.dataset.prop === activeProp));
  $("#guardianProductionPack").hidden = activeProp !== "guardian";
  renderGuidedAssembly();
  window.dispatchEvent(new CustomEvent("atlas-prop-change", { detail: { prop: activeProp } }));
}

function downloadRoleBuildPack() {
  const kit = localizedKit();
  const rows = [...commonPropBom, ...kit.bom];
  const vi = currentLanguage === "vi";
  const markdown = [
    `# ${kit.name} — ${vi ? "Bộ hướng dẫn lắp Atlas" : "Atlas role build pack"}`, "", `${vi ? "Role" : "Role"}: ${kit.roleLabel}`, `${vi ? "Kích thước ý tưởng" : "Concept size"}: ${kit.size}`, `${vi ? "Ngân sách dự kiến" : "Planning budget"}: ${kit.budget}`, "",
    `## ${vi ? "Mục đích" : "Purpose"}`, "", kit.purpose, "", `## ${vi ? "Cấu trúc" : "Construction contract"}`, "", `- ${vi ? "Vỏ" : "Shell"}: ${kit.shell}`, `- ${vi ? "Cảm biến" : "Sensor"}: ${kit.sensor}`, `- ${vi ? "Vị trí lõi" : "Core"}: ${kit.core}`, `- ${vi ? "Sự kiện" : "Events"}: ${kit.events}`, `- ${vi ? "An toàn" : "Safety"}: ${kit.safety}`, "",
    `## ${vi ? "Các vị trí đánh số" : "Numbered modules"}`, "", ...kit.callouts.map((item, index) => `${index + 1}. ${item}`), "",
    `## ${vi ? "Bảng vật tư" : "Bill of materials"}`, "", vi ? "| Linh kiện | SL | Nguồn mua | Giai đoạn |" : "| Part | Qty | Source | Stage |", "| --- | ---: | --- | --- |", ...rows.map(row => `| ${row.map(localizeBomCell).join(" | ")} |`), "",
    `## ${vi ? "Lắp ráp từng bước" : "Assembly path"}`, "", ...kit.assembly.map((step, index) => `${index + 1}. ${step}`), "",
    `## ${vi ? "Giới hạn bằng chứng" : "Evidence boundary"}`, "", vi ? "Đây là bộ thiết kế. Phải hoàn tất kiểm tra an toàn vật lý, nguồn, độ thoải mái, sóng, nhận nhầm động tác và tích hợp Unity trước khi dùng thực địa." : "This is a design pack. Complete physical safety, power, comfort, radio, false-trigger, and Unity integration tests before field use.", ""
  ].join("\n");
  const blob = new Blob([markdown], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `atlas-${activeProp}-build-pack.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
  toast(vi ? `Đã tạo hướng dẫn ${kit.name}` : `${kit.name} build pack generated`);
}

function buildRingDots() {
  const root = $("#ringDots");
  if (!root) return;
  root.innerHTML = Array.from({ length: 16 }, (_, index) => {
    const angle = (index / 16) * Math.PI * 2 - Math.PI / 2;
    const x = 500 + Math.cos(angle) * 50;
    const y = 276 + Math.sin(angle) * 50;
    return `<circle class="ring-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/>`;
  }).join("");
}

function currentDiagram() {
  const profile = electronicsProfiles[activeProp];
  const parts = [
    { type: "board-esp32-s3-devkitc-1", id: "esp", top: 38.4, left: 8.2, attrs: {} },
    { type: "wokwi-pushbutton", id: "primaryButton", top: 28.6, left: 258.1, attrs: { color: profile.color, label: profile.events[0], key: "C" } },
    { type: "wokwi-pushbutton", id: "secondaryButton", top: 106.8, left: 258.1, attrs: { color: "#7057d9", label: profile.events[1], key: "S" } }
  ];
  const connections = [
    ["esp:10", "primaryButton:1.l", profile.color, []], ["primaryButton:2.l", "esp:GND.1", "#5d6672", []],
    ["esp:11", "secondaryButton:1.l", "#7057d9", []], ["secondaryButton:2.l", "esp:GND.1", "#5d6672", []]
  ];
  if (state.led) {
    parts.push({ type: "wokwi-led-ring", id: "ring", top: 190.1, left: 234.4, attrs: { pixels: "16" } });
    connections.push(["esp:12", "ring:DIN", "#f2c94c", []], ["esp:5V", "ring:VCC", "#e05858", []], ["esp:GND.1", "ring:GND", "#5d6672", []]);
  }
  if (state.buzzer) {
    parts.push({ type: "wokwi-buzzer", id: "buzzer", top: 221.4, left: 34.7, attrs: { volume: "0.2" } });
    connections.push(["esp:13", "buzzer:2", "#f29f4b", []], ["esp:GND.1", "buzzer:1", "#5d6672", []]);
  }
  return { version: 1, author: "Atlas Prop Lab", editor: "wokwi", parts, connections, dependencies: {}, atlasProfile: { prop: activeProp, deviceId: profile.deviceId, exactParts: profile.parts, pinContract: profile.pins, events: profile.events, note: "Buttons proxy motion/special sensors in browser. Validate thresholds on real hardware." } };
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

function electronicsDiagramSvg(profile) {
  const rows = profile.pins.map((pin, index) => {
    const y = 58 + index * 67;
    const name = currentLanguage === "vi" ? pin[2] : pin[1];
    return `<path d="M235 ${y + 22} C315 ${y + 22} 300 ${y + 22} 375 ${y + 22}" class="role-wire"/><circle cx="235" cy="${y + 22}" r="4"/><rect x="375" y="${y}" width="240" height="45" rx="8"/><text x="392" y="${y + 18}">${escapeXml(pin[0])}</text><text x="392" y="${y + 34}" class="role-subtext">${escapeXml(name)}</text>`;
  }).join("");
  return `<svg viewBox="0 0 660 410" role="img" aria-label="${escapeXml(profile.name)} ESP32 pin diagram"><defs><pattern id="roleGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#17303a"/></pattern></defs><rect width="660" height="410" fill="url(#roleGrid)" opacity=".7"/><g class="role-board"><rect x="55" y="63" width="180" height="275" rx="18"/><rect x="90" y="88" width="110" height="50" rx="7"/><text x="145" y="112" text-anchor="middle">ESP32-S3</text><text x="145" y="128" text-anchor="middle" class="role-subtext">USB BENCH CORE</text><rect x="85" y="166" width="120" height="120" rx="8"/><text x="145" y="221" text-anchor="middle">${escapeXml(profile.label)}</text><text x="145" y="241" text-anchor="middle" class="role-subtext">${escapeXml(profile.name)}</text></g><g class="role-modules">${rows}</g><text x="375" y="389" class="role-footnote">${currentLanguage === "vi" ? "Đường màu = tín hiệu · luôn dùng GND chung" : "Colour line = signal · always share GND"}</text></svg>`;
}

function testElectronicsEvent(action) {
  const profile = electronicsProfiles[activeProp];
  const item = document.createElement("li");
  const stamp = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
  item.innerHTML = `<span>${stamp}</span><b>PASS · ${escapeXml(action)}</b>`;
  $("#electronicsTestLog").prepend(item);
  while ($("#electronicsTestLog").children.length > 5) $("#electronicsTestLog").lastElementChild.remove();
  const button = $(`[data-electronics-event="${action}"]`);
  button?.classList.add("is-firing"); setTimeout(() => button?.classList.remove("is-firing"), 350);
  toast(currentLanguage === "vi" ? `Đã mô phỏng ${action} từ ${profile.name}` : `${action} simulated from ${profile.name}`);
}

function getCoreProofChecks() {
  return readStoredIndexes(coreProofStorageKey, coreProofSteps.en.length).filter(index => index > 0);
}

function updateCoreProofProgress() {
  const checks = [0, ...$$('#coreProofList input:not(:disabled):checked').map(input => Number(input.dataset.coreProof))];
  localStorage.setItem(coreProofStorageKey, JSON.stringify(checks.filter(index => index > 0)));
  const count = checks.length;
  $("#coreProofCount").textContent = `${count} / ${coreProofSteps.en.length}`;
  $("#coreProofProgress").style.width = `${(count / coreProofSteps.en.length) * 100}%`;
}

function renderCoreOverview() {
  const profile = electronicsProfiles[activeProp];
  const checks = getCoreProofChecks();
  $("#coreRoleName").textContent = `${profile.label} · ${profile.name}`;
  $("#coreRoleParts").textContent = profile.parts.slice(1).join(" · ");
  $("#coreProofList").innerHTML = coreProofSteps[currentLanguage].map(([title, note], index) => `
    <li class="${index === 0 ? "is-locked" : ""}">
      <label><input type="checkbox" data-core-proof="${index}" ${index === 0 || checks.includes(index) ? "checked" : ""} ${index === 0 ? "disabled" : ""}/><span><strong>${title}</strong><small>${note}</small></span></label>
    </li>`).join("");
  $("#coreProxyWarning").innerHTML = currentLanguage === "vi"
    ? "<strong>Cùng hợp đồng GPIO ESP32-S3:</strong> hướng dẫn 32 bước bên dưới dùng đúng số GPIO của MKE-K01 (GPIO10/11/12/13). Vẫn đối chiếu nhãn in trên board thực nhận trước khi cắm dây."
    : "<strong>Same ESP32-S3 GPIO contract:</strong> the 32-step guide below uses the MKE-K01 GPIO numbers (GPIO10/11/12/13). Still match the printed labels on the delivered board before wiring.";
  updateCoreProofProgress();
}

function downloadCoreProofPack() {
  const profile = electronicsProfiles[activeProp];
  const checked = new Set([0, ...getCoreProofChecks()]);
  const vi = currentLanguage === "vi";
  const steps = coreProofSteps[currentLanguage];
  const markdown = `# Atlas Core v1 · ${profile.name}\n\n` +
    `- ${vi ? "Board vật lý tham chiếu" : "Physical controller reference"}: MKE-K01 ESP32-S3 N4\n` +
    `- ${vi ? "Proxy mô phỏng" : "Simulation proxy"}: Wokwi ESP32-S3 DevKitC-1 (${vi ? "cùng số GPIO, chỉ kiểm logic" : "same GPIO numbers, logic only"})\n` +
    `- ${vi ? "Nguồn thử đầu" : "First proof power"}: USB data + 5 V\n` +
    `- ${vi ? "Thiết bị" : "Device"}: ${profile.deviceId}\n` +
    `- ${vi ? "Bộ dây role" : "Role harness"}: ${profile.parts.slice(1).join(", ")}\n` +
    `- ${vi ? "Event" : "Events"}: ${profile.events.join(", ")}\n\n` +
    `## ${vi ? "Ứng viên GPIO — phải xác nhận trên board thực" : "GPIO candidates — verify on delivered hardware"}\n\n` +
    profile.pins.map(pin => `- ${pin[0]} — ${vi ? pin[2] : pin[1]}`).join("\n") +
    `\n\n## ${vi ? "Thang chứng minh" : "Proof ladder"}\n\n` +
    steps.map(([title, note], index) => `- [${checked.has(index) ? "x" : " "}] ${title} — ${note}`).join("\n") +
    `\n\n> ${vi ? "Chưa PASS các bước vật lý thì chưa được xem là thiết bị đã sẵn sàng mang ra sự kiện." : "The device is not event-ready until the physical gates pass."}\n`;
  const blob = new Blob([markdown], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = `atlas-core-v1-${activeProp}.md`; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
  toast(vi ? "Đã tạo bộ chứng minh Core" : "Core proof pack generated");
}

function renderConfig() {
  const profile = electronicsProfiles[activeProp];
  document.documentElement.style.setProperty("--role", profile.color);
  $("#roleSelect").value = activeProp;
  $("#roleBadge").textContent = profile.label;
  $("#deviceId").textContent = profile.deviceId;
  $("#transportBadge").textContent = { usb: "USB SERIAL", websocket: "WIFI / WEBSOCKET", espnow: "ESP-NOW" }[state.transport];
  const diagram = currentDiagram();
  $("#partCount").textContent = currentLanguage === "vi" ? `${diagram.parts.length} LINH KIỆN · ${diagram.connections.length} DÂY` : `${diagram.parts.length} PARTS · ${diagram.connections.length} WIRES`;
  $("#roleCircuitGraphic").innerHTML = electronicsDiagramSvg(profile);
  $("#pinList").innerHTML = profile.pins.map(item => `<div class="pin-row"><code>${item[0]}</code><span>${currentLanguage === "vi" ? item[2] : item[1]}</span><i style="color:${profile.color}"></i></div>`).join("");
  $("#electronicsProfileSummary").innerHTML = `<strong>${currentLanguage === "vi" ? "Linh kiện riêng của role" : "Role-specific parts"}</strong><p>${profile.parts.join(" · ")}</p>`;
  $("#electronicsEventButtons").innerHTML = profile.events.map(event => `<button type="button" data-electronics-event="${event}">${event}</button>`).join("");
  const bench = state.transport === "usb";
  const vi = currentLanguage === "vi";
  $("#validationBox").innerHTML = bench
    ? `<span class="validation-icon">✓</span><div><strong>${vi ? "Điểm khởi đầu an toàn trên bàn" : "Bench safe starting point"}</strong><p>${vi ? "Nguồn USB loại bỏ biến số pin và sóng trong lần chứng minh đầu." : "USB power keeps battery and radio variables out of the first proof."}</p></div>`
    : `<span class="validation-icon" style="background:var(--amber)">!</span><div><strong>${vi ? "Ứng viên thử thực địa" : "Field candidate"}</strong><p>${vi ? "Dùng mô phỏng trước; sau đó mới xác minh kết nối lại, tầm sóng và nhiễu trên phần cứng thật." : "Use the simulator now; validate reconnect, range, and interference on real hardware later."}</p></div>`;
  $("#electronicsLimitTitle").textContent = vi ? "Trình duyệt chứng minh được" : "Browser proof boundary";
  $("#electronicsLimitText").textContent = vi ? "Luồng chân GPIO, cấu trúc payload, trạng thái nút và phản hồi LED/âm/rung ở mức logic." : "GPIO flow, payload shape, button states, and LED/sound/vibration feedback logic.";
  $("#electronicsNextTitle").textContent = vi ? "Bắt buộc thử ngoài đời" : "Required real-world proof";
  $("#electronicsNextText").textContent = vi ? "Ngưỡng IMU/Hall, nhiễu, nhiệt, dòng LED, độ bền dây, tầm sóng và cảm giác khi mặc/cầm. Wokwi ở đây dùng nút làm proxy cho cảm biến chưa được mô phỏng chính xác." : "IMU/Hall thresholds, noise, heat, LED current, cable durability, radio range, and human fit. Wokwi uses buttons as proxies for sensors it cannot reproduce exactly here.";
  renderCoreOverview();
  $$(".hero-token").forEach(token => token.classList.toggle("is-selected", token.dataset.role === state.role));
}

function downloadJson(name, value) {
  const blob = new Blob([JSON.stringify(value, null, 2) + "\n"], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
  toast(`${name} generated`);
}

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("is-visible");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("is-visible"), 1800);
}

function showView(id) {
  $$(".view").forEach(view => view.classList.toggle("is-active", view.id === id));
  $$(".tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.view === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eventPayload(action) {
  return { v: 1, deviceId: `${state.role}-orb-01`, role: roles[state.role].label, seq: ++state.sequence, type: "PLAYER_INTENT", action, atMs: Math.round(performance.now()) };
}

function addLog(status, payload, detail) {
  const item = document.createElement("li");
  const stamp = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
  item.innerHTML = `<span>${stamp}</span><b class="${status}">${payload.action} · ${detail}</b>`;
  $("#eventLog").prepend(item);
  while ($("#eventLog").children.length > 12) $("#eventLog").lastElementChild.remove();
}

function updateMetrics() {
  $("#sentMetric").textContent = state.sent;
  $("#deliveredMetric").textContent = state.delivered;
  $("#lostMetric").textContent = state.lost;
  $("#avgMetric").textContent = state.delivered ? `${Math.round(state.latencyTotal / state.delivered)} ms` : "—";
  $("#bossHpText").textContent = `${state.bossHp} / 520`;
  $("#bossHpBar").style.width = `${(state.bossHp / 520) * 100}%`;
  window.dispatchEvent(new CustomEvent("atlas-field-state", { detail: { bossHp: state.bossHp, role: state.role } }));
}

function animatePacket(isLost, duration) {
  const arena = $("#arena"); const packet = $("#packet");
  const hero = $(`.hero-token[data-role="${state.role}"]`); const boss = $(".boss-token");
  const area = arena.getBoundingClientRect(); const start = hero.getBoundingClientRect(); const end = boss.getBoundingClientRect();
  const x1 = start.left + start.width / 2 - area.left - 6; const y1 = start.top + start.height / 2 - area.top - 6;
  const x2 = end.left + end.width / 2 - area.left - 6; const y2 = end.top + end.height / 2 - area.top - 6;
  packet.classList.toggle("is-lost", isLost); packet.style.opacity = "1"; packet.style.left = `${x1}px`; packet.style.top = `${y1}px`;
  const targetX = isLost ? x1 + (x2 - x1) * .55 : x2; const targetY = isLost ? y1 + (y2 - y1) * .55 : y2;
  const animation = packet.animate([{ transform: "scale(.8)" }, { left: `${targetX}px`, top: `${targetY}px`, transform: isLost ? "scale(.25)" : "scale(1.3)" }], { duration: Math.max(180, duration), easing: "cubic-bezier(.2,.7,.2,1)" });
  animation.onfinish = () => { packet.style.opacity = "0"; packet.style.left = `${targetX}px`; packet.style.top = `${targetY}px`; };
}

function applyAction(action) {
  const profile = roles[state.role]; const effect = action === "CAST" ? profile.cast : profile.special;
  if (effect.damage) {
    state.bossHp = Math.max(0, state.bossHp - effect.damage);
    return `accepted · ${effect.damage} damage`;
  }
  if (effect.heal) return `accepted · team +${effect.heal} HP`;
  return `accepted · team shield +${effect.shield}`;
}

function triggerAction(action) {
  if (!roles[state.role] || !["CAST", "SPECIAL"].includes(action)) throw new Error("Unsupported action");
  if (state.cooldown[action]) { toast(`${action} is cooling down`); return { status: "cooldown" }; }
  state.cooldown[action] = true;
  const button = $(`.action-button[data-action="${action}"]`); button.disabled = true;
  setTimeout(() => { state.cooldown[action] = false; button.disabled = false; }, action === "CAST" ? 700 : 4000);

  const payload = eventPayload(action); const jitter = Math.round((Math.random() - .5) * state.latency * .25);
  const travel = Math.max(0, state.latency + jitter); const lost = Math.random() * 100 < state.loss;
  window.dispatchEvent(new CustomEvent("atlas-field-action", { detail: { role: state.role, action, lost, duration: Math.max(180, travel) } }));
  state.sent++; updateMetrics(); addLog("", payload, "sent"); animatePacket(lost, travel);
  setTimeout(() => {
    if (lost) { state.lost++; addLog("lost", payload, "lost"); }
    else { state.delivered++; state.latencyTotal += travel; addLog("good", payload, `${applyAction(action)} · ${travel} ms`); }
    updateMetrics();
  }, Math.max(180, travel));
  return { status: lost ? "scheduled_loss" : "scheduled_delivery", payload, latencyMs: travel };
}

function resetSimulation() {
  Object.assign(state, { bossHp: 520, sent: 0, delivered: 0, lost: 0, latencyTotal: 0, sequence: 0 });
  $("#eventLog").innerHTML = ""; updateMetrics(); window.dispatchEvent(new CustomEvent("atlas-field-reset")); toast(currentLanguage === "vi" ? "Đã đặt lại mô phỏng" : "Simulation reset");
}

function renderBuildPack() {
  $("#bomBody").innerHTML = bom.map(([part, qty, stage]) => `<tr><td>${localizeBomCell(part)}</td><td>${localizeBomCell(qty)}</td><td><span class="stage-tag ${stage === "Bench" ? "" : "later"}">${localizeBomCell(stage)}</span></td></tr>`).join("");
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem("atlas-guide-checks") || "[]"); } catch { saved = []; }
  const steps = currentLanguage === "vi" ? guideStepsVi : guideSteps;
  $("#guideList").innerHTML = steps.map((step, index) => `<li><label><input type="checkbox" data-step="${index}" ${saved.includes(index) ? "checked" : ""}/><span>${step}</span></label></li>`).join("");
  updateGuideProgress();
}

function guardianPurchaseKey() { return "atlas-guardian-purchases"; }
function guardianGateKey() { return "atlas-guardian-gates"; }
function guardianFitKey() { return "atlas-guardian-fit"; }
function readStoredIndexes(key, max) {
  try {
    const values = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(values) ? values.filter(value => Number.isInteger(value) && value >= 0 && value < max) : [];
  } catch { return []; }
}

function formatPlanningPrice([low, high]) {
  const format = value => `${Math.round(value / 1000)}K`;
  return low === high ? format(low) : `${format(low)}–${format(high)}`;
}

function renderGuardianPurchaseSummary(purchases, gates) {
  const vi = currentLanguage === "vi";
  const fitPass = gates.includes(1);
  const buyNowSelected = purchases.filter(index => index < 5).length;
  const electronicsSelected = purchases.filter(index => index >= 5).length;
  $("#guardianPurchaseSummary").innerHTML = `
    <div><span>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</span><strong>${fitPass ? (vi ? "FIT PASS · CHỐT ĐIỆN TỬ" : "FIT PASS · SELECT ELECTRONICS") : (vi ? "MUA 5 MÓN LÀM MẪU" : "BUY 5 MOCK-UP ITEMS")}</strong><small>${fitPass ? (vi ? "G1 đã đạt; mua mỗi linh kiện điện tử 1 chiếc để thử bàn." : "G1 passed; buy one of each electronic part for the bench proof.") : (vi ? "Chưa mua ESP32/LED. Làm khiên carton và thử 3 người trước." : "Do not buy ESP32/LED yet. Fit the cardboard shield on three users first.")}</small></div>
    <div><span>${vi ? "MẪU THỬ" : "MOCK-UP"}</span><strong>80K–280K</strong><small>${buyNowSelected}/5 ${vi ? "món đã chốt" : "items selected"}</small></div>
    <div><span>${vi ? "ĐIỆN TỬ SAU FIT" : "ELECTRONICS AFTER FIT"}</span><strong>435K–655K</strong><small>${electronicsSelected}/5 ${vi ? "món đã chốt" : "items selected"}</small></div>`;
  $$(".purchase-group[data-gate='after-fit']").forEach(section => {
    section.classList.toggle("is-locked", !fitPass);
    const badge = section.querySelector(".purchase-stage-badge");
    if (badge) badge.textContent = fitPass ? (vi ? "ĐƯỢC MUA" : "RELEASED") : (vi ? "XEM TRƯỚC · CHƯA MUA" : "RESEARCH · DO NOT BUY");
  });
}

function renderGuardianProduction() {
  const content = guardianProduction[currentLanguage];
  const procurement = propManifests.guardian.procurement;
  const purchases = readStoredIndexes(guardianPurchaseKey(), 10);
  const gates = readStoredIndexes(guardianGateKey(), 5);
  $("#guardianLayerStack").innerHTML = content.layers.map(([title, detail, material], index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><div><strong>${title}</strong><p>${detail}</p></div><span>${material}</span></li>`).join("");
  let itemIndex = 0;
  const vi = currentLanguage === "vi";
  $("#guardianPurchaseList").innerHTML = content.groups.map((group, groupIndex) => {
    const gate = groupIndex === 0 ? "fit" : "after-fit";
    const groupItems = procurement.slice(groupIndex * 5, groupIndex * 5 + 5);
    const subtotalLow = groupItems.reduce((sum, item) => sum + item.priceVnd[0], 0);
    const subtotalHigh = groupItems.reduce((sum, item) => sum + item.priceVnd[1], 0);
    return `<section class="purchase-group" data-gate="${gate}">
      <div class="purchase-group-heading"><div><h3>${group.title}</h3><small>${vi ? "Tạm tính" : "Planning subtotal"} · ${formatPlanningPrice([subtotalLow, subtotalHigh])}</small></div><b class="purchase-stage-badge">${gate === "fit" ? (vi ? "MUA NGAY" : "BUY NOW") : (vi ? "XEM TRƯỚC · CHƯA MUA" : "RESEARCH · DO NOT BUY")}</b></div>
      ${group.items.map(([title, detail]) => {
        const index = itemIndex++; const item = procurement[index];
        const price = formatPlanningPrice(item.priceVnd);
        const spec = vi ? item.specVi : item.specEn;
        const check = vi ? item.checkVi : item.checkEn;
        const sources = (item.sources || []).map((source, sourceIndex) => `<a class="purchase-source ${source.kind || ""}" href="${source.url}" target="_blank" rel="noreferrer"><span>${source.kind === "exact" ? "✓" : source.kind === "local" ? "⌖" : "↗"}</span>${vi ? source.labelVi : source.labelEn}${sourceIndex === 0 && source.kind === "exact" ? ` · ${price}` : ""}</a>`).join("");
        return `<article class="purchase-item ${purchases.includes(index) ? "is-selected" : ""}">
          <div class="purchase-item-title"><label><input type="checkbox" data-purchase-index="${index}" ${purchases.includes(index) ? "checked" : ""}/><span><strong>${title}</strong><small>${detail}</small></span></label><em>${price}</em></div>
          <p class="purchase-spec"><b>${vi ? "CHỌN ĐÚNG" : "SELECT"}</b>${spec}</p>
          <div class="purchase-actions">${sources}</div>
          <p class="purchase-check"><b>${vi ? "KIỂM TRA" : "CHECK"}</b>${check}</p>
          <small class="purchase-checked">${item.checkedAt ? `${vi ? "Link kiểm tra" : "Link checked"}: ${item.checkedAt}` : (vi ? "Giá kế hoạch · kiểm lại tại nơi bán" : "Planning price · recheck with seller")}</small>
        </article>`;
      }).join("")}</section>`;
  }).join("");
  $("#guardianGateList").innerHTML = content.gates.map(([title, detail], index) => `<li><label><input type="checkbox" data-guardian-gate="${index}" ${gates.includes(index) ? "checked" : ""}/><span><strong>${title}</strong><small>${detail}</small></span></label></li>`).join("");
  try {
    const fit = JSON.parse(localStorage.getItem(guardianFitKey()) || "{}");
    if (Number.isFinite(fit.height)) $("#playerHeight").value = String(fit.height);
    if (Number.isFinite(fit.forearm)) $("#forearmLength").value = String(fit.forearm);
  } catch {}
  renderGuardianPurchaseSummary(purchases, gates);
  updateGuardianProductionProgress(false);
  updateGuardianFit();
}

function updateGuardianFit() {
  const height = Number($("#playerHeight").value);
  const forearm = Number($("#forearmLength").value);
  const diameter = Math.round(Math.max(45, Math.min(55, height * .3)));
  const strapSpacing = Math.round(forearm * .55);
  $("#playerHeightValue").textContent = height;
  $("#forearmLengthValue").textContent = forearm;
  $("#shieldDiameterResult").textContent = `${diameter} cm`;
  $("#strapSpacingResult").textContent = `${strapSpacing} cm`;
  localStorage.setItem(guardianFitKey(), JSON.stringify({ height, forearm }));
  window.dispatchEvent(new CustomEvent("atlas-guardian-fit-change", { detail: { heightCm: height, forearmCm: forearm, diameterCm: diameter, strapSpacingCm: strapSpacing } }));
}

function updateGuardianProductionProgress(save = true) {
  const purchases = $$("#guardianPurchaseList input:checked").map(input => Number(input.dataset.purchaseIndex));
  const gates = $$("#guardianGateList input:checked").map(input => Number(input.dataset.guardianGate));
  if (save) { localStorage.setItem(guardianPurchaseKey(), JSON.stringify(purchases)); localStorage.setItem(guardianGateKey(), JSON.stringify(gates)); }
  $("#purchaseGateCount").textContent = currentLanguage === "vi" ? `${purchases.length} / 10 ĐÃ CHỐT` : `${purchases.length} / 10 SELECTED`;
  $("#guardianGateCount").textContent = `${gates.length} / 5 PASS`;
  $("#guardianGateProgress").style.width = `${gates.length / 5 * 100}%`;
  $$("#guardianPurchaseList .purchase-item").forEach(item => item.classList.toggle("is-selected", item.querySelector("input").checked));
  renderGuardianPurchaseSummary(purchases, gates);
}

function downloadGuardianProductionPack() {
  const vi = currentLanguage === "vi";
  const content = guardianProduction[currentLanguage];
  const height = Number($("#playerHeight").value); const forearm = Number($("#forearmLength").value);
  const diameter = Math.round(Math.max(45, Math.min(55, height * .3))); const straps = Math.round(forearm * .55);
  const markdown = [
    `# Guardian Aegis Shield — ${vi ? "Bộ chuẩn bị chế tác" : "Production readiness pack"}`, "",
    `> ${vi ? "Chưa phải thông số cắt cuối. Phải thử mẫu carton với ba người trước khi chuyển sang EVA." : "Not a final cutting specification. Fit-test a cardboard mock-up with three users before transferring to EVA."}`, "",
    `## ${vi ? "Kích thước mẫu thử" : "Mock-up dimensions"}`, "", `- ${vi ? "Chiều cao người chơi" : "Player height"}: ${height} cm`, `- ${vi ? "Chiều dài cẳng tay" : "Forearm length"}: ${forearm} cm`, `- ${vi ? "Đường kính khởi điểm" : "Starting diameter"}: ${diameter} cm`, `- ${vi ? "Khoảng tâm quai" : "Strap centres"}: ${straps} cm`, `- ${vi ? "Khoang điện tử" : "Electronics cavity"}: 110 × 85 × 28 mm`, `- ${vi ? "Khối lượng mục tiêu" : "Target mass"}: < 1.2 kg`, "",
    `## ${vi ? "Cấu trúc lớp" : "Layer stack"}`, "", ...content.layers.map((row, index) => `${index + 1}. **${row[0]} — ${row[2]}**: ${row[1]}`), "",
    `## ${vi ? "Cổng mua đồ" : "Purchase gates"}`, "", ...content.groups.flatMap((group, groupIndex) => [`### ${group.title}`, ...group.items.map((item, itemIndex) => {
      const procurementIndex = groupIndex * 5 + itemIndex; const source = propManifests.guardian.procurement[procurementIndex]; const [low, high] = source.priceVnd;
      const price = low === high ? `${Math.round(low / 1000)}k VND` : `${Math.round(low / 1000)}–${Math.round(high / 1000)}k VND`;
      const primarySource = source.sources?.[0];
      return `- [ ] **${item[0]}** — ${item[1]} · ${price}\n  - ${vi ? "Chọn đúng" : "Select"}: ${vi ? source.specVi : source.specEn}\n  - ${vi ? "Kiểm tra" : "Check"}: ${vi ? source.checkVi : source.checkEn}${primarySource ? `\n  - ${vi ? "Mua tại" : "Buy at"}: ${vi ? primarySource.labelVi : primarySource.labelEn} — ${primarySource.url}` : ""}`;
    }), ""]),
    `## ${vi ? "Cổng cho phép chế tác" : "Release gates"}`, "", ...content.gates.map((gate, index) => `${index + 1}. [ ] **${gate[0]}** — ${gate[1]}`), "",
    `## ${vi ? "Giới hạn" : "Boundary"}`, "", vi ? "Phải xác minh độ vừa, cạnh mềm, nhiệt, nguồn, ngưỡng IMU, độ bền dây và không tiếp xúc cơ thể trên thiết bị thật trước khi dùng tại sự kiện." : "Verify fit, soft edges, heat, power, IMU thresholds, cable durability, and no-contact play on real hardware before event use.", ""
  ].join("\n");
  const blob = new Blob([markdown], { type: "text/markdown" }); const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = `atlas-guardian-production-${diameter}cm.md`; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
  toast(vi ? "Đã tạo bộ chế tác Guardian" : "Guardian production pack generated");
}

function updateGuideProgress() {
  const checked = $$("#guideList input:checked").map(input => Number(input.dataset.step));
  localStorage.setItem("atlas-guide-checks", JSON.stringify(checked));
  $("#guideCount").textContent = `${checked.length} / 32`;
  $("#guideProgress").style.width = `${checked.length / 32 * 100}%`;
}

function registerWebMcp() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const tools = [
    {
      name: "configure_atlas_prop", title: "Configure Atlas prop",
      description: "Set the active prop electronics profile, transport, LED feedback, and secondary feedback in the visible ESP32 lab.",
      inputSchema: { type: "object", properties: { role: { enum: Object.keys(electronicsProfiles) }, transport: { enum: ["usb", "websocket", "espnow"] }, led: { type: "boolean" }, buzzer: { type: "boolean" } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (input.role !== undefined && !electronicsProfiles[input.role]) throw new Error("Invalid role");
        if (input.transport !== undefined && !["usb", "websocket", "espnow"].includes(input.transport)) throw new Error("Invalid transport");
        if (input.role !== undefined) activeProp = input.role;
        if (input.transport !== undefined) state.transport = input.transport;
        if (input.led !== undefined) state.led = Boolean(input.led);
        if (input.buzzer !== undefined) state.buzzer = Boolean(input.buzzer);
        $("#roleSelect").value = activeProp; $("#transportSelect").value = state.transport; $("#ledToggle").checked = state.led; $("#buzzerToggle").checked = state.buzzer;
        renderPropKit(); renderConfig(); showView("prototype");
        return { role: activeProp, transport: state.transport, led: state.led, buzzer: state.buzzer };
      }
    },
    {
      name: "select_atlas_build_pack", title: "Select Atlas build pack",
      description: "Open one role-specific prop plan with its drawing, bill of materials, sensor placement, and assembly path.",
      inputSchema: { type: "object", properties: { prop: { enum: Object.keys(propKits) } }, required: ["prop"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!propKits[input.prop]) throw new Error("Unknown prop build");
        activeProp = input.prop;
        renderPropKit(); renderConfig();
        showView("event-kit");
        return { prop: activeProp, name: propKits[activeProp].name, status: "design_pack" };
      }
    },
    {
      name: "trigger_atlas_prop_action", title: "Trigger prop action",
      description: "Send CAST or SPECIAL through the visible Atlas field simulator with the current latency and packet loss.",
      inputSchema: { type: "object", properties: { action: { enum: ["CAST", "SPECIAL"] } }, required: ["action"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { showView("field"); return triggerAction(input.action); }
    },
    {
      name: "read_atlas_lab_state", title: "Read Atlas lab state",
      description: "Read the active prop configuration and field simulation metrics.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() { return { activeBuildPack: activeProp, role: state.role, transport: state.transport, led: state.led, buzzer: state.buzzer, simulation: { bossHp: state.bossHp, sent: state.sent, delivered: state.delivered, lost: state.lost } }; }
    }
  ];
  tools.forEach(tool => { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {} });
}

function init() {
  buildRingDots(); applyStaticTranslations(); renderGuardianProduction(); renderPropKit(); renderConfig(); renderBuildPack(); updateMetrics();
  $$(".tab").forEach(tab => tab.addEventListener("click", () => showView(tab.dataset.view)));
  $("#mvpTargetButtons").addEventListener("click", event => {
    const button = event.target.closest("[data-mvp-zone]");
    if (button) selectMvpZone(button.dataset.mvpZone);
  });
  const mvpFireButton = $("#mvpFireButton");
  let mvpPointerActive = false;
  mvpFireButton.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    mvpPointerActive = true;
    mvpFireButton.setPointerCapture?.(event.pointerId);
    beginMvpCharge();
  });
  mvpFireButton.addEventListener("pointerup", event => {
    if (!mvpPointerActive) return;
    event.preventDefault();
    mvpPointerActive = false;
    mvpFeedbackState.ignoreClick = true;
    releaseMvpShot();
    setTimeout(() => { mvpFeedbackState.ignoreClick = false; }, 0);
  });
  mvpFireButton.addEventListener("pointercancel", () => {
    mvpPointerActive = false;
    if (mvpFeedbackState.phase === "charge") setMvpPhase("idle");
  });
  mvpFireButton.addEventListener("keydown", event => {
    if (![" ", "Enter"].includes(event.key) || event.repeat) return;
    event.preventDefault();
    beginMvpCharge();
  });
  mvpFireButton.addEventListener("keyup", event => {
    if (![" ", "Enter"].includes(event.key)) return;
    event.preventDefault();
    mvpFeedbackState.ignoreClick = true;
    releaseMvpShot();
    setTimeout(() => { mvpFeedbackState.ignoreClick = false; }, 0);
  });
  mvpFireButton.addEventListener("click", () => {
    if (mvpFeedbackState.ignoreClick || mvpFeedbackState.phase !== "idle") return;
    beginMvpCharge();
    mvpFeedbackState.timers.push(setTimeout(releaseMvpShot, 560));
  });
  $$(".language-switch button").forEach(button => button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    applyStaticTranslations(); renderGuardianProduction(); renderPropKit(); renderConfig(); renderBuildPack();
    window.dispatchEvent(new CustomEvent("atlas-language-change", { detail: { language: currentLanguage } }));
  }));
  $$(".role-card").forEach(card => card.addEventListener("click", () => { activeProp = card.dataset.prop; activeAssemblyStep = 0; activeVisualView = "overview"; renderPropKit(); renderConfig(); }));
  $("#downloadBuildPack").addEventListener("click", downloadRoleBuildPack);
  $("#playerHeight").addEventListener("input", updateGuardianFit);
  $("#forearmLength").addEventListener("input", updateGuardianFit);
  $("#guardianPurchaseList").addEventListener("change", () => updateGuardianProductionProgress());
  $("#guardianGateList").addEventListener("change", () => updateGuardianProductionProgress());
  $("#clearGuardianGates").addEventListener("click", () => { $$("#guardianGateList input").forEach(input => input.checked = false); updateGuardianProductionProgress(); });
  $("#downloadGuardianProductionPack").addEventListener("click", downloadGuardianProductionPack);
  $("#guidedVisualTabs").addEventListener("click", event => {
    const button = event.target.closest("[data-visual-view]");
    if (!button) return;
    activeVisualView = button.dataset.visualView; renderGuidedVisual();
  });
  $("#guidedStepNav").addEventListener("click", event => {
    const button = event.target.closest("[data-guided-step]");
    if (!button) return;
    activeAssemblyStep = Number(button.dataset.guidedStep); activeVisualView = "overview"; renderGuidedAssembly();
  });
  $("#guidedPrev").addEventListener("click", () => { activeAssemblyStep = Math.max(0, activeAssemblyStep - 1); activeVisualView = "overview"; renderGuidedAssembly(); });
  $("#guidedNext").addEventListener("click", () => { activeAssemblyStep = Math.min(7, activeAssemblyStep + 1); activeVisualView = "overview"; renderGuidedAssembly(); });
  $("#partsReadyCheck").addEventListener("change", event => {
    localStorage.setItem(partsReadyStorageKey(), String(event.target.checked)); renderGuidedAssembly();
  });
  $("#guidedComplete").addEventListener("click", () => {
    if (!$("#partsReadyCheck").checked) {
      toast(currentLanguage === "vi" ? "Hãy xác nhận đã đủ linh kiện trước" : "Confirm all parts are ready first"); return;
    }
    const completed = getCompletedGuidedSteps();
    const existing = completed.indexOf(activeAssemblyStep);
    if (existing >= 0) completed.splice(existing, 1); else completed.push(activeAssemblyStep);
    localStorage.setItem(guidedStorageKey(), JSON.stringify(completed));
    if (existing < 0 && activeAssemblyStep < 7) { activeAssemblyStep += 1; activeVisualView = "overview"; }
    renderGuidedAssembly();
  });
  $("#roleSelect").addEventListener("change", event => { activeProp = event.target.value; activeAssemblyStep = 0; activeVisualView = "overview"; renderPropKit(); renderConfig(); });
  $("#transportSelect").addEventListener("change", event => { state.transport = event.target.value; renderConfig(); });
  $("#ledToggle").addEventListener("change", event => { state.led = event.target.checked; renderConfig(); });
  $("#buzzerToggle").addEventListener("change", event => { state.buzzer = event.target.checked; renderConfig(); });
  $("#downloadDiagram").addEventListener("click", () => downloadJson("diagram.json", currentDiagram()));
  $("#downloadConfig").addEventListener("click", () => { const profile = electronicsProfiles[activeProp]; downloadJson("atlas-prop-config.json", { version: 1, deviceId: profile.deviceId, role: profile.label, prop: activeProp, transport: state.transport, features: { ledFeedback: state.led, secondaryFeedback: state.buzzer }, parts: profile.parts, pins: profile.pins, events: profile.events }); });
  $("#coreProofList").addEventListener("change", updateCoreProofProgress);
  $("#clearCoreProof").addEventListener("click", () => { localStorage.removeItem(coreProofStorageKey); renderCoreOverview(); });
  $("#downloadCoreProofPack").addEventListener("click", downloadCoreProofPack);
  $("#electronicsEventButtons").addEventListener("click", event => { const button = event.target.closest("[data-electronics-event]"); if (button) testElectronicsEvent(button.dataset.electronicsEvent); });
  $$(".hero-token").forEach(token => token.addEventListener("click", () => { state.role = token.dataset.role; renderConfig(); }));
  window.addEventListener("atlas-select-field-role", event => { if (roles[event.detail?.role]) { state.role = event.detail.role; renderConfig(); } });
  $$(".action-button").forEach(button => button.addEventListener("click", () => triggerAction(button.dataset.action)));
  $("#resetSim").addEventListener("click", resetSimulation);
  $("#latencyRange").addEventListener("input", event => { state.latency = Number(event.target.value); $("#latencyValue").textContent = `${state.latency} ms`; });
  $("#lossRange").addEventListener("input", event => { state.loss = Number(event.target.value); $("#lossValue").textContent = `${state.loss}%`; });
  $("#guideList").addEventListener("change", updateGuideProgress);
  $("#clearChecklist").addEventListener("click", () => { $$("#guideList input").forEach(input => input.checked = false); updateGuideProgress(); });
  registerWebMcp();
}

init();

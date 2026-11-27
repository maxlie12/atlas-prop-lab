(function () {
  // Teardown: every prop taken apart in real service order (what comes off first went on last).
  // Each step detaches meshes of the 3D twin by id (mesh.userData.td, or its partKey) and lists
  // the real components that come out, with a unit price range in VND. Prices are estimates
  // from Vietnamese shops and Shopee searches (Nov 2026), not quotes.
  const shopee = keyword => `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;
  const part = (gate, priceVnd, q, vi, en) => ({ gate, priceVnd, url: shopee(q), name: { vi: vi[0], en: en[0] }, role: { vi: vi[1], en: en[1] }, verify: { vi: vi[2], en: en[2] } });

  const catalog = {
    esp32s3: part("gate01", [110000, 165000], "ESP32-S3-DevKitC-1 N16R8",
      ["Bo ESP32-S3-DevKitC-1 (N8R2/N16R8)", "Bộ não của prop: đọc cảm biến, gửi dòng sự kiện qua USB.", "Module in ESP32-S3-WROOM-1, hàn sẵn chân; cắm cổng COM/UART."],
      ["ESP32-S3-DevKitC-1 board (N8R2/N16R8)", "The prop's brain: reads sensors, sends event lines over USB.", "Module reads ESP32-S3-WROOM-1, headers soldered; use the COM/UART port."]),
    usbc: part("gate01", [25000, 40000], "cáp USB C truyền dữ liệu",
      ["Cáp USB-C truyền dữ liệu", "Nạp code, cấp nguồn và truyền tín hiệu trên bàn test.", "Phải nạp được code — cáp chỉ sạc không dùng được."],
      ["USB-C data cable", "Flashing, power and signal on the bench.", "Must carry data — a charge-only cable will not flash."]),
    wires: part("later", [30000, 80000], "dây 22AWG giắc JST SM 3P",
      ["Dây mềm 22–24 AWG + giắc JST-SM", "Nối lõi với LED, nút, motor; tháo ra để bảo trì.", "Kéo thử từng đầu bấm; giắc không được cắm ngược."],
      ["22–24 AWG wire + JST-SM plugs", "Joins the core to LEDs, buttons and motor; unplugs for service.", "Pull-test every crimp; plugs must not reverse."]),
    screws: part("shell", [10000, 25000], "vít M3 velcro",
      ["Vít M3 + velcro nắp bảo trì", "Giữ nắp để mở ra sửa mà không phá vỏ.", "Đầu vít không được chạm vào tay người chơi."],
      ["M3 screws + service-cover velcro", "Holds the cover so it opens without breaking the shell.", "No screw head may touch the player's hand."]),
    ky024: part("gate01", [15000, 15000], "KY-024 cảm biến từ trường",
      ["Cảm biến Hall KY-024", "Đo độ kéo dây qua khoảng cách tới nam châm.", "Cấp nguồn 3V3; đo AO ≤ 3,3 V trước khi nối GPIO."],
      ["KY-024 Hall sensor", "Measures the draw through its distance to the magnet.", "Power from 3V3; meter AO ≤ 3.3 V before wiring a GPIO."]),
    magnet: part("gate01", [2000, 5000], "nam châm đất hiếm 10x3mm",
      ["Nam châm đất hiếm 10×3 mm", "Gắn trên con trượt theo dây; lại gần cảm biến khi kéo.", "Dùng thanh Hall trực tiếp để chỉnh khoảng cách."],
      ["10×3 mm rare-earth magnet", "Rides the string slider; approaches the sensor on a draw.", "Use the live Hall bar to set the gap."]),
    tsal6200: part("gate01", [2500, 5000], "TSAL6200",
      ["LED hồng ngoại TSAL6200 (Vishay)", "Phát mã bắn 38 kHz tới giáp.", "Vỏ xanh xám, chân dài là cực dương."],
      ["TSAL6200 IR LED (Vishay)", "Sends the 38 kHz shot code to the armour.", "Blue-grey body, long lead is the anode."]),
    npn: part("gate01", [500, 1000], "2N2222A TO-92",
      ["Transistor 2N2222A", "Đóng cắt dòng LED để GPIO không phải gánh.", "Tra chân E-B-C theo đúng mã in trên linh kiện."],
      ["2N2222A transistor", "Switches the LED current so the GPIO does not carry it.", "Look up E-B-C for the exact marking."]),
    resistorsIr: part("gate01", [300, 600], "điện trở 1/4W 1k 100 ohm",
      ["Điện trở 1 kΩ + 100 Ω", "1 kΩ vào chân B; 100 Ω giới hạn dòng LED.", "Đúng giá trị như sơ đồ dây."],
      ["1 kΩ + 100 Ω resistors", "1 kΩ to the base; 100 Ω limits LED current.", "Values as on the wiring map."]),
    lensTube: part("gate01", [15000, 40000], "thấu kính hội tụ 20mm",
      ["Thấu kính lồi ~20 mm + ống nhựa 21 mm", "Thu hẹp tia để phải nhắm mới trúng (chống aimbot).", "Ở 3 m vệt tia nên còn cỡ 30 cm; kiểm bằng phép thử bắn lệch."],
      ["~20 mm convex lens + 21 mm tube", "Narrows the beam so a hit needs aim (no aimbot).", "Aim for a ~30 cm spot at 3 m; prove it with the near-miss test."]),
    haptic: part("later", [15000, 40000], "motor rung đồng xu 3V",
      ["Motor rung 1027 + transistor + diode", "Rung báo trúng ngay trong tay người chơi.", "Motor ăn ~50 mA: chạy qua transistor, diode ngược song song."],
      ["1027 coin motor + transistor + diode", "Buzzes a confirmed hit into the player's hand.", "~50 mA motor: drive through a transistor, flyback diode across it."]),
    tsop: part("gate01", [45000, 50000], "TSOP38238",
      ["Mắt thu TSOP38238 (Vishay)", "Nhận mã bắn ở một vùng của giáp.", "Chân OUT–GND–VS; không phải VS1838B hay HS0038."],
      ["TSOP38238 receiver (Vishay)", "Receives the shot code on one armour zone.", "OUT–GND–VS pins; not a VS1838B or HS0038."]),
    rcFilter: part("gate01", [1000, 2000], "tụ hóa 4.7uF 50V",
      ["Lọc nguồn 100 Ω + tụ 4,7 µF", "Chống nhiễu nguồn cho từng mắt thu.", "Tụ đặt sát chân, chân dài phía VS."],
      ["100 Ω + 4.7 µF supply filter", "Keeps supply noise out of each receiver.", "Capacitor at the pins, long lead to VS."]),
    mpu6050: part("later", [43000, 85000], "GY-521 MPU6050",
      ["Cảm biến chuyển động GY-521 (MPU6050)", "Nhận cú vung, đỡ, đâm theo gia tốc.", "Đo board trước khi khoét hốc; cố định chắc và ghi chiều trục."],
      ["GY-521 motion sensor (MPU6050)", "Detects swings, blocks and stabs from acceleration.", "Measure before cutting the cavity; mount rigidly, mark the axes."]),
    button: part("later", [10000, 10000], "nút nhấn nhả PBS-11B 12mm",
      ["Nút nhấn nhả PBS-11B 12 mm", "Cò/nút xác nhận ý định của người chơi.", "Phải là loại nhấn nhả, không phải giữ trạng thái."],
      ["PBS-11B 12 mm momentary button", "Trigger that confirms the player's intent.", "Must be momentary, not latching."]),
    ws2812Strip: part("later", [60000, 180000], "WS2812B 5V 60LED 1m IP30",
      ["Dải LED WS2812B 5 V 60 bóng/m (1 m)", "Ánh sáng phản hồi cho người chơi và khán giả.", "Đúng loại 5 V; giới hạn độ sáng khi chạy bằng USB."],
      ["WS2812B 5 V 60 LED/m strip (1 m)", "Feedback light for player and audience.", "5 V only; cap brightness on USB power."]),
    ws2812Seg: part("later", [10000, 30000], "WS2812B 5V 60LED",
      ["Đoạn LED WS2812B (cắt từ dải)", "Một đoạn ngắn cho rãnh, vùng hoặc quả cầu.", "Cắt đúng vạch đồng; hàn và chống kéo dây."],
      ["WS2812B segment (cut from a strip)", "A short run for a channel, zone or orb.", "Cut on the copper marks; solder and strain-relieve."]),
    levelShift: part("later", [25000, 60000], "74AHCT125",
      ["Chuyển mức 74AHCT125 + 330 Ω + tụ 1000 µF", "Đưa tín hiệu 3,3 V của ESP32 lên 5 V cho LED.", "Đúng mã AHCT (không phải HC); lắp tụ đúng cực."],
      ["74AHCT125 level shifter + 330 Ω + 1000 µF", "Lifts the ESP32's 3.3 V data to 5 V for the LEDs.", "AHCT part, not HC; mind capacitor polarity."]),
    eva: part("shell", [30000, 120000], "xốp EVA cosplay 5mm 10mm",
      ["Xốp EVA 5/10 mm", "Vỏ mềm an toàn của đạo cụ.", "Thử bằng carton trước; bo tròn mọi cạnh."],
      ["5/10 mm EVA foam", "The prop's soft, safe shell.", "Mock up in cardboard first; round every edge."]),
    cardboard: part("shell", [20000, 60000], "tấm carton 2 lớp 60x60",
      ["Carton 2 lớp (mẫu thử)", "Mẫu thử kích thước trước khi cắt EVA.", "Tấm phẳng, không ẩm, không gãy nếp."],
      ["Double-wall cardboard (mock-up)", "Size mock-up before cutting EVA.", "Flat, dry, no deep creases."]),
    strap: part("shell", [30000, 90000], "dây đai balo 25mm khóa bấm",
      ["Dây đai 25 mm + khóa bấm", "Đeo chắc, tháo nhanh bằng một tay.", "Bấm/mở 20 lần không kẹt; không có mép sắc."],
      ["25 mm webbing + side-release buckles", "Secure wear, one-hand quick release.", "20 open/close cycles without jamming; no sharp edges."]),
    cord: part("shell", [5000, 15000], "dây dù trang trí",
      ["Dây trang trí mảnh", "Chỉ để trang trí, không chịu lực.", "Để chùng; không bao giờ căng như dây cung thật."],
      ["Thin cosmetic cord", "Decoration only, carries no load.", "Keep it slack; never tension it like a real string."]),
    pvcPipe: part("shell", [10000, 30000], "ống nhựa 21mm",
      ["Ống nhựa 21 mm", "Xương nhẹ bên trong thân gậy/kiếm.", "Bọc foam kín hai đầu."],
      ["21 mm plastic pipe", "Light spine inside a staff or sword.", "Cap both ends in foam."]),
    orb: part("shell", [30000, 80000], "quả cầu mica mờ 14cm",
      ["Quả cầu tán sáng mờ ~140 mm", "Làm ánh LED mềm và đều.", "Giữ chắc quả cầu; kiểm tra độ chói và nhiệt."],
      ["~140 mm frosted diffuser orb", "Softens and spreads the LED light.", "Retain it firmly; check glare and heat."]),
    diffuser: part("shell", [20000, 50000], "tấm mica mờ tán sáng",
      ["Tấm tán sáng mica mờ", "Che LED vùng giáp, sáng đều khi trúng.", "Không che mắt thu."],
      ["Frosted acrylic diffuser", "Covers the zone LEDs for an even hit flash.", "Must not cover the receivers."]),
    foamCap: part("shell", [5000, 20000], "đầu bọc xốp tròn",
      ["Đầu bọc xốp bo tròn", "Đầu dưới mềm, không nhọn.", "Ấn thử: phải lún và hồi lại."],
      ["Rounded foam end cap", "Soft lower end, never pointed.", "Press test: it must give and recover."])
  };

  const T = (vi, en) => ({ vi, en });
  const overview = (vi, en) => ({ id: "overview", detach: [], title: T(vi, en), how: T("Bấm Tiếp để tháo từng lớp theo thứ tự bảo trì thật: phần tháo ra trước là phần lắp vào sau cùng.", "Press Next to take it apart in real service order: what comes off first went on last."), parts: [] });
  const unplug = T("Rút cáp USB trước khi chạm vào mạch.", "Unplug USB before touching the circuit.");

  const props = {
    archer: { steps: [
      overview("Cung Arc lắp hoàn chỉnh", "Arc Bow, fully assembled"),
      { id: "cord", detach: ["wearable"], title: T("Tháo dây trang trí", "Remove the cosmetic cord"), how: T("Gỡ hai đầu dây khỏi đầu cánh cung.", "Unhook both ends from the limb tips."), caution: T("Không bao giờ lắp tên hay căng dây như cung thật.", "Never fit an arrow or tension it like a real bow."), parts: [["cord", 1]] },
      { id: "cover", detach: ["cover"], title: T("Mở nắp tay cầm", "Open the riser cover"), how: T("Tháo 2 vít M3 (hoặc bóc velcro), nhấc nắp bảo trì phía trước tay cầm.", "Remove two M3 screws (or peel the velcro) and lift the front service cover."), parts: [["screws", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc lõi ESP32", "Lift out the ESP32 core"), how: T("Rút cáp USB, gỡ các giắc JST rồi nhấc bo khỏi hốc.", "Unplug USB, release the JST plugs, lift the board from its cavity."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["wires", 1]] },
      { id: "draw", detach: ["sensor", "control"], title: T("Gỡ cảm biến Hall và nam châm", "Remove the Hall sensor and magnet"), how: T("Cảm biến cố định trong tay cầm, nam châm đi trên con trượt theo dây. Đánh dấu khoảng cách trước khi gỡ.", "The sensor is fixed in the riser; the magnet rides the string slider. Mark the gap before removing."), parts: [["ky024", 1], ["magnet", 1]] },
      { id: "emitter", detach: ["emitter"], title: T("Tháo cụm phát hồng ngoại", "Remove the IR emitter"), how: T("Rút ống thấu kính ra phía trước, rồi gỡ LED TSAL6200, transistor và hai điện trở.", "Slide the lens tube forward, then free the TSAL6200, transistor and two resistors."), caution: T("Tia hồng ngoại không nhìn thấy: không nhìn thẳng vào LED khi đang cấp điện.", "IR is invisible: never look into the LED while powered."), parts: [["tsal6200", 1], ["npn", 1], ["resistorsIr", 1], ["lensTube", 1]] },
      { id: "haptic", detach: ["haptic"], title: T("Gỡ motor rung báo trúng", "Remove the hit-feedback motor"), how: T("Motor đồng xu dán sau tay cầm; trang bàn test gửi lệnh rung khi phát bắn được tính trúng.", "The coin motor sits behind the grip; the bench page tells it to buzz on a confirmed hit."), parts: [["haptic", 1]] },
      { id: "light", detach: ["light"], title: T("Rút hai dải LED cánh cung", "Pull the two limb LED strips"), how: T("Bóc dải LED khỏi rãnh và gỡ mạch chuyển mức 3,3 V → 5 V.", "Peel the strips from their channels and remove the 3.3 V → 5 V shifter."), parts: [["ws2812Seg", 2], ["levelShift", 1]] },
      { id: "frame", detach: ["shell"], title: T("Còn lại khung foam — xếp ra bàn", "Foam frame left — everything laid out"), how: T("Cánh cung và tay cầm là xốp EVA cắt theo bản vẽ 900 mm. Đây là toàn bộ linh kiện của cung.", "Limbs and riser are EVA cut from the 900 mm template. This is every part of the bow."), parts: [["eva", 1]] }
    ] },
    guardian: { steps: [
      overview("Khiên Aegis lắp hoàn chỉnh", "Aegis Shield, fully assembled"),
      { id: "straps", detach: ["wearable"], title: T("Tháo quai đeo tay", "Remove the arm straps"), how: T("Mở hai khóa bấm, rút dây đai 25 mm khỏi khiên.", "Release both buckles and pull the 25 mm webbing out."), parts: [["strap", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc hộp lõi ESP32 phía sau", "Lift the rear ESP32 service box"), how: T("Rút USB, gỡ giắc LED, nút và motor rung rồi nhấc hộp lõi.", "Unplug USB, the LED, button and motor plugs, then lift the box."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["haptic", 1], ["wires", 1]] },
      { id: "imu", detach: ["sensor"], title: T("Gỡ cảm biến chuyển động", "Remove the motion sensor"), how: T("IMU nằm giữa khiên để nhận cú đỡ và đẩy; ghi chiều trục trước khi gỡ.", "The IMU sits at the centre to sense blocks and shoves; mark its axes first."), parts: [["mpu6050", 1]] },
      { id: "button", detach: ["control"], title: T("Tháo nút ngón cái", "Remove the thumb button"), how: T("Vặn đai ốc nút ra khỏi lỗ 12 mm.", "Unscrew the button nut from its 12 mm hole."), parts: [["button", 1]] },
      { id: "rim", detach: ["light"], title: T("Rút viền LED", "Pull the LED rim"), how: T("Bóc dải LED khỏi viền bảo vệ, gỡ mạch chuyển mức.", "Peel the strip from the protected rim and remove the shifter."), parts: [["ws2812Strip", 1], ["levelShift", 1]] },
      { id: "face", detach: ["shell"], title: T("Còn lại mặt khiên — xếp ra bàn", "Shield face left — everything laid out"), how: T("Mặt khiên 500 mm bằng EVA trên khung carton thử.", "The 500 mm EVA face over its cardboard mock-up."), parts: [["eva", 1], ["cardboard", 1]] }
    ] },
    warrior: { steps: [
      overview("Kiếm Pulse lắp hoàn chỉnh", "Pulse Sword, fully assembled"),
      { id: "loop", detach: ["wearable"], title: T("Tháo dây cổ tay", "Remove the wrist loop"), how: T("Tháo vòng dây khỏi đầu chuôi.", "Slip the loop off the pommel."), parts: [["cord", 1]] },
      { id: "cover", detach: ["cover"], title: T("Mở nắp chuôi", "Open the grip cover"), how: T("Tháo vít M3 hoặc bóc velcro của nắp chuôi.", "Remove the M3 screws or peel the grip cover's velcro."), parts: [["screws", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc lõi ESP32 trong chuôi", "Lift the ESP32 from the hilt"), how: T("Rút USB, gỡ giắc rồi trượt bo ra.", "Unplug USB, release the plugs, slide the board out."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["haptic", 1], ["wires", 1]] },
      { id: "imu", detach: ["sensor"], title: T("Gỡ IMU ở chắn tay", "Remove the guard IMU"), how: T("IMU gắn chắc trong chắn tay để đọc cú vung.", "The IMU is fixed in the guard to read swings."), parts: [["mpu6050", 1]] },
      { id: "trigger", detach: ["control"], title: T("Tháo cò ngón trỏ", "Remove the index trigger"), how: T("Gỡ nút khỏi tay cầm.", "Free the button from the grip."), parts: [["button", 1]] },
      { id: "spine", detach: ["light"], title: T("Rút LED sống kiếm", "Pull the spine LEDs"), how: T("Rút dải LED khỏi rãnh giữa lưỡi.", "Draw the strip out of the blade's centre channel."), parts: [["ws2812Seg", 1], ["levelShift", 1]] },
      { id: "blade", detach: ["shell"], title: T("Còn lại lưỡi foam và chuôi", "Foam blade and grip left"), how: T("Lưỡi EVA mềm trên xương ống nhựa.", "Soft EVA blade on a plastic-pipe spine."), parts: [["eva", 1], ["pvcPipe", 1]] }
    ] },
    assassin: { steps: [
      overview("Dao găm Shade lắp hoàn chỉnh", "Shade Daggers, fully assembled"),
      { id: "passive", detach: ["passive"], title: T("Tách dao phụ", "Set the off-hand dagger aside"), how: T("Dao phụ là foam thụ động, không có điện tử.", "The off-hand dagger is passive foam, no electronics."), parts: [["eva", 1]] },
      { id: "trap", detach: ["wearable"], title: T("Tháo nút bẫy cổ tay", "Remove the wrist trap pad"), how: T("Mở dây cổ tay, rút giắc nút bẫy.", "Open the wrist strap and unplug the trap button."), parts: [["button", 1], ["strap", 1]] },
      { id: "cover", detach: ["cover"], title: T("Mở nắp chuôi dao chủ động", "Open the active hilt cover"), how: T("Tháo vít hoặc velcro nắp chuôi.", "Remove the hilt cover screws or velcro."), parts: [["screws", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc lõi ESP32", "Lift the ESP32 core"), how: T("Rút USB và giắc LED trạng thái rồi nhấc bo.", "Unplug USB and the status LED, then lift the board."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["ws2812Seg", 1], ["wires", 1]] },
      { id: "imu", detach: ["sensor"], title: T("Gỡ IMU", "Remove the IMU"), how: T("IMU đọc cú đâm và cú lao.", "The IMU reads stabs and lunges."), parts: [["mpu6050", 1]] },
      { id: "trigger", detach: ["control"], title: T("Tháo cò tay cầm", "Remove the grip trigger"), how: T("Gỡ nút khỏi tay cầm.", "Free the button from the grip."), parts: [["button", 1]] },
      { id: "blade", detach: ["shell"], title: T("Còn lại vỏ dao chủ động", "Active dagger shell left"), how: T("Vỏ EVA của dao chủ động.", "The active dagger's EVA shell."), parts: [["eva", 1]] }
    ] },
    mage: { steps: [
      overview("Gậy Lumen lắp hoàn chỉnh", "Lumen Staff, fully assembled"),
      { id: "cap", detach: ["wearable"], title: T("Tháo đầu đệm dưới", "Remove the padded end"), how: T("Xoay và kéo đầu xốp khỏi thân gậy.", "Twist and pull the foam cap off the shaft."), parts: [["foamCap", 1]] },
      { id: "cover", detach: ["cover"], title: T("Mở nắp tay cầm dưới", "Open the lower-grip cover"), how: T("Tháo vít hoặc velcro nắp tay cầm.", "Remove the grip cover screws or velcro."), parts: [["screws", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc lõi ESP32", "Lift the ESP32 core"), how: T("Rút USB, giắc LED quả cầu và motor rung rồi nhấc bo.", "Unplug USB, the orb LED and the motor, then lift the board."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["haptic", 1], ["wires", 1]] },
      { id: "imu", detach: ["sensor"], title: T("Gỡ IMU tay cầm", "Remove the grip IMU"), how: T("IMU dưới vùng cầm trên.", "The IMU sits below the upper grip."), parts: [["mpu6050", 1]] },
      { id: "buttons", detach: ["control"], title: T("Tháo nút CAST và SPECIAL", "Remove CAST and SPECIAL"), how: T("Hai nút nhấn nhả trên thân gậy.", "Two momentary buttons on the shaft."), parts: [["button", 2]] },
      { id: "orb", detach: ["light"], title: T("Tháo quả cầu và LED", "Remove the orb and its LEDs"), how: T("Xoay mở quả cầu tán sáng, rút đoạn LED và mạch chuyển mức.", "Twist the diffuser open, pull the LED run and shifter."), parts: [["orb", 1], ["ws2812Seg", 1], ["levelShift", 1]] },
      { id: "shaft", detach: ["shell"], title: T("Còn lại thân gậy", "Shaft left"), how: T("Ống nhựa bọc foam và các vòng trang trí.", "Foam-wrapped pipe and its decorative rings."), parts: [["pvcPipe", 1], ["eva", 1]] }
    ] },
    boss: { steps: [
      overview("Đại kiếm và giáp Hiệp sĩ Hắc giáp", "Dark Knight greatsword and armour"),
      { id: "receiver", detach: ["armour-receiver"], title: T("Tháo hộp nhận của giáp", "Remove the armour receiver box"), how: T("Giáp là thiết bị riêng: bo ESP32 thứ hai cùng 3 mắt thu ở vai trái, ngực, vai phải.", "The armour is its own device: a second ESP32 with receivers at left shoulder, chest and right shoulder."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["tsop", 3], ["rcFilter", 3], ["wires", 1]] },
      { id: "zones", detach: ["armour-led"], title: T("Gỡ ba vùng LED báo trúng", "Remove the three hit-zone LEDs"), how: T("Bóc tấm tán sáng, rút ba đoạn LED vùng.", "Peel the diffusers and pull the three zone LED runs."), parts: [["ws2812Seg", 3], ["diffuser", 1]] },
      { id: "bib", detach: ["armour-bib"], title: T("Còn lại áo bib", "Bib left"), how: T("Áo bib EVA với dây đai tháo nhanh.", "EVA bib with quick-release straps."), parts: [["eva", 1], ["strap", 1]] },
      { id: "core", detach: ["core"], title: T("Nhấc lõi ESP32 trong chuôi kiếm", "Lift the greatsword's ESP32"), how: T("Rút USB, gỡ giắc rồi nhấc bo khỏi chuôi.", "Unplug USB, release the plugs, lift the board from the grip."), caution: unplug, parts: [["esp32s3", 1], ["usbc", 1], ["wires", 1]] },
      { id: "imu", detach: ["sensor"], title: T("Gỡ IMU vùng cân bằng", "Remove the balance IMU"), how: T("IMU trong cán gần điểm cân bằng.", "The IMU sits in the shaft near the balance point."), parts: [["mpu6050", 1]] },
      { id: "triggers", detach: ["control"], title: T("Tháo hai cò tay cầm", "Remove both grip triggers"), how: T("Cò chính và cò phụ trên tay cầm.", "Primary and secondary triggers on the grip."), parts: [["button", 2]] },
      { id: "fuller", detach: ["light"], title: T("Rút LED rãnh lưỡi kiếm", "Pull the fuller LEDs"), how: T("Hai đoạn LED hai mặt lưỡi và mạch chuyển mức.", "Two LED runs on the blade faces and the shifter."), parts: [["ws2812Seg", 2], ["levelShift", 1]] },
      { id: "blade", detach: ["shell"], title: T("Còn lại sáu tấm foam lưỡi kiếm", "Six foam blade panels left"), how: T("Lưỡi rỗng gồm sáu tấm EVA trên xương nhẹ.", "A hollow blade of six EVA panels on a light spine."), parts: [["eva", 1], ["pvcPipe", 1]] }
    ] }
  };

  const gates = {
    gate01: T("Gate 01 · mua ngay", "Gate 01 · buy now"),
    later: T("Sau Gate 01", "After Gate 01"),
    shell: T("Vỏ và đeo", "Shell and wear")
  };

  function totals(prop, uptoStep = Infinity) {
    const steps = props[prop]?.steps || [];
    let low = 0, high = 0, count = 0;
    steps.slice(0, uptoStep + 1).forEach(step => step.parts.forEach(([id, qty]) => { const item = catalog[id]; low += item.priceVnd[0] * qty; high += item.priceVnd[1] * qty; count += qty; }));
    return { low, high, count };
  }

  window.ATLAS_TEARDOWN = Object.freeze({ catalog, props, gates, totals, revision: "teardown-01", pricesCheckedAt: "2026-11-25" });
})();

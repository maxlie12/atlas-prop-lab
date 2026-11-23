const THREE_VERSION = "0.180.0";
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const CONTROLS_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/controls/OrbitControls.js`;

Promise.all([import(THREE_URL), import(CONTROLS_URL)])
  .then(([THREE, controls]) => startThreeLab(THREE, controls.OrbitControls))
  .catch(() => {
    document.querySelectorAll(".three-loading").forEach(node => {
      node.classList.add("is-error");
      node.textContent = document.documentElement.lang === "vi"
        ? "Không tải được không gian 3D. Bản vẽ 2D và hướng dẫn lắp vẫn hoạt động bên dưới."
        : "The 3D workspace could not load. The 2D drawing and assembly guide remain available below.";
    });
  });

function startThreeLab(THREE, OrbitControls) {
  const $ = selector => document.querySelector(selector);
  const isVi = () => document.documentElement.lang === "vi";
  const propManifests = window.ATLAS_PROP_MANIFESTS || {};
  const palette = { guardian: 0xf0b44d, warrior: 0x16a6c9, archer: 0x16a6c9, assassin: 0x7057d9, mage: 0x39cc93, boss: 0xef6b68 };
  const names = {
    guardian: ["Aegis Shield", "Khiên Aegis"], warrior: ["Pulse Sword", "Kiếm Pulse"], archer: ["Arc Bow", "Cung Arc"],
    assassin: ["Shade Daggers", "Dao găm Shade"], mage: ["Lumen Staff", "Gậy Lumen"], boss: ["Dark Knight Greatsword", "Đại kiếm Hiệp sĩ Hắc giáp"]
  };
  const copy = {
    shell: ["Safe outer shell", "Lớp vỏ an toàn", "Main EVA structure and protected contact surface.", "Kết cấu EVA chính và bề mặt tiếp xúc được bảo vệ.", "Verify size and all rounded edges on a full-scale foam mock-up.", "Kiểm tra kích thước và bo tròn mọi cạnh trên mẫu foam đúng tỉ lệ."],
    light: ["LED feedback", "Phản hồi LED", "Protected visual feedback visible to the player and audience.", "Phản hồi ánh sáng được bảo vệ để người chơi và khán giả cùng nhìn thấy.", "Diffuse the LEDs and strain-relieve every cable before closing the shell.", "Tán sáng LED và chống kéo mọi dây trước khi đóng vỏ."],
    sensor: ["Role sensor", "Cảm biến role", "Motion or draw input aligned to the prop's local axes.", "Input chuyển động hoặc lực kéo được căn theo trục cục bộ của đạo cụ.", "Fix the sensor rigidly, label its axes, then calibrate on real hardware.", "Cố định cảm biến, dán nhãn trục rồi cân chỉnh trên phần cứng thật."],
    core: ["ESP32 service core", "Lõi bảo trì ESP32", "Removable controller, connectors, and USB-first power path.", "Bộ điều khiển tháo rời, đầu nối và đường nguồn ưu tiên USB.", "Keep the service cover accessible and prevent hard parts from touching the wearer.", "Giữ nắp bảo trì dễ mở và không để phần cứng chạm trực tiếp người mặc."],
    control: ["Player control", "Điều khiển người chơi", "Deliberate trigger or button that gates the gameplay intent.", "Cò hoặc nút chủ động dùng để xác nhận ý định gameplay.", "Place it within reach but protect it from accidental activation.", "Đặt trong tầm tay nhưng tránh vị trí dễ bấm nhầm."],
    wearable: ["Wearable mounting", "Kết cấu đeo", "Adjustable straps or armour mounting shared across player sizes.", "Quai hoặc kết cấu áo giáp điều chỉnh theo nhiều cỡ người.", "Fit-test the smallest and largest intended player before field use.", "Thử với người nhỏ nhất và lớn nhất dự kiến trước khi dùng thực địa."],
    passive: ["Passive off-hand dagger", "Dao phụ thụ động", "A separate foam dagger with no electronics, sensor or illuminated blade.", "Dao foam riêng, không có điện tử, cảm biến hoặc lưỡi phát sáng.", "Rounded foam only. Inspect flexibility and fit; never use it for physical strikes.", "Chỉ dùng foam bo mềm. Kiểm tra độ mềm và vừa tay; không đánh thật."]
  };

  function material(color, metalnessOrOptions = .1, opacity = 1) {
    const options = typeof metalnessOrOptions === "object" ? metalnessOrOptions : { metalness: metalnessOrOptions, opacity };
    const alpha = options.opacity ?? 1;
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: options.metalness ?? .08,
      roughness: options.roughness ?? .56,
      clearcoat: options.clearcoat ?? .08,
      clearcoatRoughness: .34,
      transparent: alpha < 1,
      opacity: alpha,
      transmission: options.transmission ?? 0,
      thickness: options.thickness ?? 0,
      emissive: options.emissive ? color : 0x000000,
      emissiveIntensity: options.emissive ? (options.emissiveIntensity ?? 1.4) : 0,
      side: THREE.DoubleSide
    });
  }
  function addPart(group, geometry, color, key, position, rotation = [0, 0, 0], scale = [1, 1, 1], options = {}) {
    const mesh = new THREE.Mesh(geometry, material(color, options));
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { partKey: key, electronic: Boolean(options.electronic), explode: options.explode || [0, 0, 0] };
    group.add(mesh); return mesh;
  }
  function linePart(group, points, color, key, options = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), false, "catmullrom", .42);
    return addPart(group, new THREE.TubeGeometry(curve, options.segments || 48, options.radius || .08, options.radialSegments || 10, false), color, key, [0, 0, 0], [0, 0, 0], [1, 1, 1], options);
  }
  function plateGeometry(points, depth = .16, bevel = .045) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel });
    geometry.translate(0, 0, -depth / 2);
    geometry.computeVertexNormals();
    return geometry;
  }
  function addRivet(group, position, key = "shell", color = 0x8ea4aa, options = {}) {
    return addPart(group, new THREE.CylinderGeometry(.055, .055, .045, 16), color, key, position, [Math.PI / 2, 0, 0], [1, 1, 1], { metalness: .72, roughness: .27, ...options });
  }
  function finishModel(group, role) {
    group.traverse(object => {
      if (!object.isMesh) return;
      const module = role && propManifests[role]?.modules.find(part => part.modelKey === object.userData.partKey);
      if (module) { object.userData.moduleId = module.id; object.userData.callout = module.callout; }
      object.userData.basePosition = object.position.clone();
      object.userData.baseEmissive = object.material.emissive?.getHex() || 0;
      object.userData.baseEmissiveIntensity = object.material.emissiveIntensity || 0;
      object.userData.baseOpacity = object.material.opacity;
      object.userData.baseTransparent = object.material.transparent;
      object.userData.baseDepthWrite = object.material.depthWrite;
    });
    return group;
  }

  function buildGuardian(accent) {
    const group = new THREE.Group();
    addPart(group, new THREE.CylinderGeometry(2.18, 2.18, .30, 64), 0x13282f, "shell", [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1.08, 1], { roughness: .78, explode: [0, 0, -.72] });
    addPart(group, new THREE.CylinderGeometry(1.86, 1.86, .16, 64), 0x203e46, "shell", [0, 0, .20], [Math.PI / 2, 0, 0], [1, 1.08, 1], { metalness: .2, roughness: .42, explode: [0, 0, .38] });
    addPart(group, new THREE.TorusGeometry(2.16, .13, 14, 72), 0x788e93, "shell", [0, 0, .17], [0, 0, 0], [1, 1.08, 1], { metalness: .62, roughness: .3, explode: [0, 0, .6] });
    addPart(group, new THREE.TorusGeometry(1.72, .055, 10, 72), accent, "light", [0, 0, .32], [0, 0, 0], [1, 1.08, 1], { electronic: true, emissive: true, explode: [0, 0, 1.05] });
    addPart(group, new THREE.SphereGeometry(.56, 32, 18), 0x34555d, "shell", [0, 0, .28], [0, 0, 0], [1, 1, .32], { metalness: .48, roughness: .32, explode: [0, 0, .72] });
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      addRivet(group, [Math.cos(angle) * 1.96, Math.sin(angle) * 2.10, .34]);
    }
    addPart(group, new THREE.BoxGeometry(.68, .3, .38), 0x24393f, "sensor", [0, .2, -.37], [0, 0, 0], [1, 1, 1], { electronic: true, explode: [-1.3, .55, -.75] });
    addPart(group, new THREE.BoxGeometry(.92, .7, .28), 0x146258, "core", [0, -.65, -.4], [0, 0, 0], [1, 1, 1], { electronic: true, roughness: .4, explode: [1.35, -.45, -.75] });
    addPart(group, new THREE.CylinderGeometry(.15, .15, .3, 20), accent, "control", [.74, -.2, -.38], [Math.PI / 2, 0, 0], [1, 1, 1], { electronic: true, emissive: true, explode: [1.25, .35, -.65] });
    linePart(group, [[-.68, .92, -.46], [-.98, .15, -.54], [-.7, -.82, -.46]], 0x53666a, "wearable", { radius: .105, explode: [-1.05, 0, -.75] });
    linePart(group, [[.7, .76, -.46], [.98, .05, -.54], [.72, -.72, -.46]], 0x53666a, "wearable", { radius: .105, explode: [1.05, 0, -.75] });
    return finishModel(group);
  }
  function softBladeGeometry(widthMm, lengthMm, depthMm = 18) {
    // 100 mm/display unit; an 8 mm rounded visual tip, not a safety certification.
    const half = widthMm * .28 / 100, neck = widthMm * .20 / 100;
    const shape = new THREE.Shape();
    shape.moveTo(-.08,-.08);
    shape.quadraticCurveTo(-.08,0,0,0);
    shape.quadraticCurveTo(.08,0,.08,-.08);
    shape.lineTo(neck,-.25); shape.lineTo(half,-lengthMm/100);
    shape.lineTo(-half,-lengthMm/100); shape.lineTo(-neck,-.25); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:depthMm/100,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:16});
    geometry.translate(0,0,-depthMm/200); geometry.computeVertexNormals(); return geometry;
  }
  function buildSword(accent) {
    const group = new THREE.Group();
    addPart(group,softBladeGeometry(110,450),0x758b96,"shell",[0,3.25,0],[0,0,0],[1,1,1],{roughness:.8,metalness:.08,explode:[0,.55,-.3]});
    // Painted foam face, softly chamfered guard and a non-electronic grip.
    addPart(group,plateGeometry([[-.55,-.13],[-.48,.13],[.48,.13],[.55,-.13],[.22,-.18],[-.22,-.18]],.30,.025),0x2b4856,"shell",[0,-1.41,0],[0,0,0],[1,1,1],{roughness:.72,explode:[0,0,-.5]});
    addPart(group,new THREE.CylinderGeometry(.20,.22,1.53,24),0x182e37,"shell",[0,-2.335,0],[0,0,0],[1,1,1],{roughness:.94,explode:[0,0,-.55]});
    addPart(group,new THREE.SphereGeometry(.22,20,12),0x3c5865,"shell",[0,-3.10,0],[0,0,0],[1,.65,.85],{roughness:.8,explode:[0,-.30,-.55]});
    for(let y=-2.95;y< -1.65;y+=.18) addPart(group,new THREE.TorusGeometry(.205,.014,6,20),0x5e7882,"shell",[0,y,0],[Math.PI/2,0,0],[1,1,1],{roughness:.95,explode:[0,0,-.55]});
    addPart(group,new THREE.BoxGeometry(.22,.74,.035),0x3d5b66,"shell",[0,-2.33,.22],[0,0,0],[1,1,1],{roughness:.7,explode:[0,0,.7]});
    linePart(group,[[0,-1.04,.115],[0,.5,.115],[0,2.87,.115]],accent,"light",{radius:.026,segments:28,radialSegments:8,electronic:true,emissive:true,emissiveIntensity:1.15,explode:[.65,.20,.60]});
    addPart(group,new THREE.BoxGeometry(.18,.14,.035),0x2c917b,"sensor",[0,-1.41,.045],[0,0,0],[1,1,1],{electronic:true,explode:[-.75,.15,.60]});
    addPart(group,new THREE.BoxGeometry(.08,.07,.035),0x273d48,"sensor",[0,-1.41,.08],[0,0,0],[1,1,1],{electronic:true,explode:[-.75,.15,.60]});
    addPart(group,new THREE.BoxGeometry(.22,.62,.035),0x146258,"core",[0,-2.335,.025],[0,0,0],[1,1,1],{electronic:true,explode:[.70,-.2,.60]});
    addPart(group,new THREE.BoxGeometry(.14,.20,.04),0x97a9b0,"core",[0,-2.20,.067],[0,0,0],[1,1,1],{electronic:true,metalness:.45,explode:[.70,-.2,.60]});
    addPart(group,new THREE.BoxGeometry(.09,.055,.07),0xb1bec2,"core",[0,-2.64,.05],[0,0,0],[1,1,1],{electronic:true,metalness:.45,explode:[.70,-.2,.60]});
    addPart(group,new THREE.CylinderGeometry(.065,.065,.08,16),accent,"control",[.18,-1.78,.13],[Math.PI/2,0,0],[1,1,1],{electronic:true,explode:[.65,.15,.70]});
    addPart(group,new THREE.TorusGeometry(.19,.025,8,28),0x617480,"wearable",[0,-3.27,0],[0,0,0],[1,1.4,1],{roughness:.95,explode:[0,-.65,0]});
    group.userData.designEnvelopeMm={width:110,height:650,depth:45};
    group.userData.modelRevision="pulse-sword-cad-02";
    return finishModel(group,"warrior");
  }
  function buildBow(accent) {
    const group = new THREE.Group();
    // Same millimetre contour as cad-lab.js: 900 mm high, 430 mm envelope.
    // Display scale is 150 mm/unit. This is a foam controller, not a working bow.
    const point = (x, y) => [(x - 215) / 150, (450 - y) / 150];
    const shape = new THREE.Shape();
    shape.moveTo(...point(390, 0));
    shape.bezierCurveTo(...point(340,25), ...point(145,60), ...point(100,210));
    shape.bezierCurveTo(...point(50,330), ...point(205,365), ...point(205,410));
    shape.lineTo(...point(205,490));
    shape.bezierCurveTo(...point(205,535), ...point(50,570), ...point(100,690));
    shape.bezierCurveTo(...point(145,840), ...point(340,875), ...point(390,900));
    shape.lineTo(...point(405,880));
    shape.bezierCurveTo(...point(345,855), ...point(185,790), ...point(135,680));
    shape.bezierCurveTo(...point(95,575), ...point(240,535), ...point(240,490));
    shape.lineTo(...point(240,410));
    shape.bezierCurveTo(...point(240,365), ...point(95,325), ...point(135,220));
    shape.bezierCurveTo(...point(185,110), ...point(345,45), ...point(405,20));
    shape.closePath();
    const limbs = new THREE.ExtrudeGeometry(shape, {depth:.24, bevelEnabled:true, bevelSegments:3, steps:1, bevelSize:.018, bevelThickness:.018, curveSegments:20});
    limbs.translate(0,0,-.12); limbs.computeVertexNormals();
    addPart(group, limbs, 0x263e48, "shell", [0,0,0], [0,0,0], [1,1,1], {roughness:.82, metalness:.04, explode:[-.65,0,0]});
    // The grip/cover remain visible with electronics hidden; they are shell parts.
    addPart(group, plateGeometry([[-.16,-.40],[-.22,-.30],[-.22,.30],[-.14,.40],[.20,.40],[.25,.30],[.25,-.30],[.17,-.40]], .34,.025), 0x132b34, "shell", [.05,0,0], [0,0,0], [1,1,1], {roughness:.88,explode:[0,0,-.55]});
    addPart(group, new THREE.BoxGeometry(.30,.65,.045),0x45616a,"shell",[.07,0,.205],[0,0,0],[1,1,1],{roughness:.65,explode:[0,0,.65]});
    for (const y of [-.25,-.15,-.05,.05,.15,.25]) linePart(group,[[-.12,y,.232],[.20,y,.232]],0x607b82,"shell",{radius:.012,segments:2,radialSegments:6,roughness:.95,explode:[0,0,.65]});
    const ledUpper=[[392,18],[330,55],[230,108],[150,185],[116,250],[130,310],[188,370]];
    for (const side of [1,-1]) linePart(group,ledUpper.map(([x,y])=>[...point(x,side===1?y:900-y),.16]),accent,"light",{radius:.022,segments:40,radialSegments:8,electronic:true,emissive:true,emissiveIntensity:1.2,explode:[0,side*.15,.72]});
    // One straight cosmetic cord only: no projectile or draw/release animation.
    linePart(group,[[...point(390,0),0],[...point(390,900),0]],0xc8d5d9,"wearable",{radius:.009,segments:2,radialSegments:6,roughness:.9,explode:[.72,0,0]});
    // Distinct Hall board, separate magnet/slider, and serviceable controller.
    addPart(group,new THREE.BoxGeometry(.15,.17,.05),0x38917b,"sensor",[.015,.18,.06],[0,0,0],[1,1,1],{electronic:true,roughness:.55,explode:[-.72,.40,.70]});
    addPart(group,new THREE.BoxGeometry(.06,.08,.055),0x24313b,"sensor",[.015,.18,.11],[0,0,0],[1,1,1],{electronic:true,explode:[-.72,.40,.70]});
    addPart(group,new THREE.BoxGeometry(.07,.11,.08),0xc79855,"control",[.19,.18,.06],[0,0,0],[1,1,1],{electronic:true,metalness:.22,explode:[.78,.40,.70]});
    addPart(group,new THREE.BoxGeometry(.23,.28,.035),0x126652,"core",[.055,-.14,-.035],[0,0,0],[1,1,1],{electronic:true,explode:[.80,-.45,-.60]});
    addPart(group,new THREE.BoxGeometry(.15,.14,.055),0x8c9ca4,"core",[.055,-.10,.015],[0,0,0],[1,1,1],{electronic:true,metalness:.5,explode:[.80,-.45,-.60]});
    addPart(group,new THREE.BoxGeometry(.10,.06,.07),0x9cb0b7,"core",[.055,-.28,0],[0,0,0],[1,1,1],{electronic:true,metalness:.5,explode:[.80,-.45,-.60]});
    for (const y of [-.32,.32]) addRivet(group,[.055,y,.245],"shell",0x8ea4aa,{explode:[0,0,.65]});
    group.userData.designEnvelopeMm = {width:430,height:900,depth:60};
    group.userData.modelRevision = "arc-bow-cad-02";
    group.children.forEach(mesh => {
      const module = propManifests.archer?.modules.find(part => part.modelKey === mesh.userData.partKey);
      if (module) { mesh.userData.moduleId = module.id; mesh.userData.callout = module.callout; }
    });
    return finishModel(group);
  }
  function buildDaggers(accent) {
    const group = new THREE.Group();
    [-1, 1].forEach(side => {
      const x=side*1.12, key=side<0?"shell":"passive", explode=[side*.55,0,-.45];
      // Each dagger is 320 mm; 50 mm/display unit (2 × the shared blade scale).
      addPart(group,softBladeGeometry(75,210,12),side<0?0x8294a2:0x556579,key,[x,3.2,0],[0,0,0],[2,2,2],{roughness:.85,metalness:.06,explode});
      addPart(group,plateGeometry([[-.75,-.12],[-.66,.15],[.66,.15],[.75,-.12],[.3,-.18],[-.3,-.18]],.32,.025),0x324052,key,[x,-1.32,0],[0,0,0],[1,1,1],{roughness:.8,explode});
      addPart(group,new THREE.CylinderGeometry(.28,.30,1.26,20),0x1d2738,key,[x,-2.27,0],[0,0,0],[1,1,1],{roughness:.95,explode});
      addPart(group,new THREE.SphereGeometry(.28,18,10),0x445369,key,[x,-2.91,0],[0,0,0],[1,.85,1],{roughness:.8,explode});
      for(let y=-2.76;y< -1.74;y+=.20)addPart(group,new THREE.TorusGeometry(.28,.018,6,18),side<0?0x806ca3:0x58647d,key,[x,y,0],[Math.PI/2,0,0],[1,1,1],{roughness:.95,explode});
      // Painted identification stripe, deliberately not an emissive LED.
      linePart(group,[[x,.10,.14],[x,2.70,.14]],side<0?accent:0x7c8698,key,{radius:.022,segments:12,radialSegments:6,roughness:.9,explode});
    });
    addPart(group,new THREE.BoxGeometry(.27,.70,.045),0x146258,"core",[-1.12,-2.26,.02],[0,0,0],[1,1,1],{electronic:true,explode:[-.85,-.30,.65]});
    addPart(group,new THREE.BoxGeometry(.17,.22,.05),0x93a4af,"core",[-1.12,-2.13,.07],[0,0,0],[1,1,1],{electronic:true,metalness:.4,explode:[-.85,-.30,.65]});
    addPart(group,new THREE.BoxGeometry(.12,.065,.07),0xa5b2bd,"core",[-1.12,-2.63,.035],[0,0,0],[1,1,1],{electronic:true,explode:[-.85,-.30,.65]});
    addPart(group,new THREE.BoxGeometry(.29,.17,.04),0x368e7d,"sensor",[-1.12,-1.28,.04],[0,0,0],[1,1,1],{electronic:true,explode:[-.85,.20,.65]});
    addPart(group,new THREE.CylinderGeometry(.085,.085,.10,16),accent,"control",[-.85,-1.85,.19],[Math.PI/2,0,0],[1,1,1],{electronic:true,explode:[-.25,.20,.85]});
    addPart(group,new THREE.BoxGeometry(.29,.72,.04),0x43516b,"shell",[-1.12,-2.27,.30],[0,0,0],[1,1,1],{roughness:.8,explode:[-.25,0,1.0]});
    // Separate wrist trap pad; its strap remains visible when electronics are off.
    addPart(group,new THREE.TorusGeometry(.40,.055,8,28),0x4b566c,"wearable",[2.45,-.7,0],[0,Math.PI/2,0],[1,1,1],{roughness:.95,explode:[.65,0,0]});
    addPart(group,new THREE.BoxGeometry(.50,.42,.16),0x29364c,"wearable",[2.45,-.7,.32],[0,0,0],[1,1,1],{roughness:.85,explode:[.65,0,0]});
    addPart(group,new THREE.CylinderGeometry(.13,.13,.07,18),accent,"wearable",[2.45,-.7,.44],[Math.PI/2,0,0],[1,1,1],{electronic:true,explode:[.65,0,.40]});
    group.userData.designEnvelopeMm={width:75,height:320,depth:40};
    group.userData.modelRevision="shade-daggers-cad-02";
    return finishModel(group,"assassin");
  }
  function buildStaff(accent) {
    const group = new THREE.Group();
    const scale=175, y=mm=>(550-mm)/scale;
    addPart(group,new THREE.CylinderGeometry(20/scale,20/scale,970/scale,24),0x28413d,"shell",[0,y(615),0],[0,0,0],[1,1,1],{roughness:.88,metalness:.03,explode:[0,0,-.45]});
    // Diffuser stays present with electronics off; only the inner LED is electrical.
    addPart(group,new THREE.SphereGeometry(70/scale,32,20),0xd6eee4,"light",[0,y(70),0],[0,0,0],[1,1,1],{roughness:.55,opacity:.68,transmission:.15,explode:[0,.75,.15]});
    addPart(group,new THREE.SphereGeometry(.20,20,12),accent,"light",[0,y(70),0],[0,0,0],[1,1,1],{electronic:true,emissive:true,emissiveIntensity:1.4,explode:[0,.75,.15]});
    addPart(group,new THREE.TorusGeometry(.29,.04,8,32),0x56776b,"shell",[0,y(122),0],[Math.PI/2,0,0],[1,1,1],{roughness:.82,explode:[0,.25,-.3]});
    for(const side of [-1,1])linePart(group,[[side*.10,y(160),0],[side*.31,y(118),0],[side*.34,y(75),0]],0x385c50,"shell",{radius:.04,segments:20,radialSegments:8,roughness:.9,explode:[side*.5,.2,0]});
    for(const mm of [610,630,650,800,820,840,860,880])addPart(group,new THREE.TorusGeometry(.119,.012,6,20),0x6d8c7b,"shell",[0,y(mm),0],[Math.PI/2,0,0],[1,1,1],{roughness:.95,explode:[0,0,-.45]});
    addPart(group,new THREE.BoxGeometry(.18,.55,.035),0x406359,"shell",[0,y(850),.137],[0,0,0],[1,1,1],{roughness:.8,explode:[0,0,.60]});
    addPart(group,new THREE.BoxGeometry(.17,.45,.025),0x136b54,"core",[0,y(850),0],[0,0,0],[1,1,1],{electronic:true,explode:[.7,-.1,.50]});
    addPart(group,new THREE.BoxGeometry(.105,.16,.035),0x97aaa4,"core",[0,y(833),.03],[0,0,0],[1,1,1],{electronic:true,metalness:.4,explode:[.7,-.1,.50]});
    addPart(group,new THREE.BoxGeometry(.075,.04,.05),0xa9bbb4,"core",[0,y(890),.025],[0,0,0],[1,1,1],{electronic:true,explode:[.7,-.1,.50]});
    addPart(group,new THREE.BoxGeometry(.13,.12,.025),0x36937d,"sensor",[0,y(680),.025],[0,0,0],[1,1,1],{electronic:true,explode:[-.65,.20,.55]});
    addPart(group,new THREE.CylinderGeometry(.045,.045,.06,14),accent,"control",[.09,y(630),.06],[Math.PI/2,0,0],[1,1,1],{electronic:true,explode:[.6,.15,.6]});
    addPart(group,new THREE.SphereGeometry(22/scale,20,12),0x6b8b7c,"wearable",[0,y(1078),0],[0,0,0],[1,1,1],{roughness:.95,explode:[0,-.45,0]});
    group.userData.designEnvelopeMm={width:140,height:1100,depth:140};
    group.userData.modelRevision="lumen-staff-cad-02";
    return finishModel(group,"mage");
  }
  function roundedPanelGeometry(width,height,depth,radius=.08) {
    const w=width/2,h=height/2,r=Math.min(radius,w,h),shape=new THREE.Shape();
    shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);
    shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);
    shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:12});
    geometry.translate(0,0,-depth/2);geometry.computeVertexNormals();return geometry;
  }
  function buildBoss(accent) {
    const group = new THREE.Group();
    const scale=175,x=-.90,y=mm=>(575-mm)/scale;
    // Dark Knight greatsword (game Boss phase 2): 1150 mm overall, 820 mm blade, 360 mm guard.
    // Six hollow foam panels — two blade faces, two blade edges, two guard faces — over a light
    // spine; no solid blade block.
    const bladeW=90/scale,bladeL=760/scale,bladeT=40/scale,bladeY=y(450),guardW=360/scale,guardH=40/scale,guardY=y(840);
    for(const side of [-1,1])addPart(group,roundedPanelGeometry(bladeW,bladeL,.045,.05),0x2b2f3a,"shell",[x,bladeY,side*(bladeT/2)],[0,0,0],[1,1,1],{roughness:.85,metalness:.08,explode:[0,.2,side*.65]});
    for(const side of [-1,1])addPart(group,roundedPanelGeometry(bladeT,bladeL,.045,.02),0x3a3f4c,"shell",[x+side*(bladeW/2),bladeY,0],[0,Math.PI/2,0],[1,1,1],{roughness:.85,explode:[side*.6,.2,0]});
    for(const side of [-1,1])addPart(group,roundedPanelGeometry(guardW,guardH,.045,.08),0xa07a3a,"shell",[x,guardY,side*(bladeT/2+.01)],[0,0,0],[1,1,1],{roughness:.6,metalness:.35,explode:[0,-.1,side*.7]});
    addPart(group,new THREE.CylinderGeometry(bladeW*.32,.01,70/scale,4),0x2b2f3a,"shell",[x,y(35),0],[0,0,Math.PI],[1,1,1],{roughness:.85,explode:[0,.45,0]});
    addPart(group,new THREE.CylinderGeometry(20/scale,20/scale,250/scale,24),0x24262c,"shell",[x,y(985),0],[0,0,0],[1,1,1],{roughness:.95,explode:[0,-.3,-.5]});
    addPart(group,new THREE.SphereGeometry(30/scale,18,10),0xa07a3a,"shell",[x,y(1120),0],[0,0,0],[1,1,1],{roughness:.6,metalness:.35,explode:[0,-.5,-.5]});
    for(const mm of [890,930,970,1010,1050,1090])addPart(group,new THREE.TorusGeometry(21/scale,.012,6,20),0x5b4a3a,"shell",[x,y(mm),0],[Math.PI/2,0,0],[1,1,1],{roughness:.95,explode:[0,-.3,-.5]});
    for(const side of [-1,1])addPart(group,new THREE.BoxGeometry(bladeW*.28,680/scale,.02),accent,"light",[x,y(460),side*(bladeT/2+.035)],[0,0,0],[1,1,1],{electronic:true,emissive:true,emissiveIntensity:1.2,explode:[0,.2,side*.9]});
    addPart(group,new THREE.BoxGeometry(.11,.12,.025),0x368c7d,"sensor",[x,y(880),.05],[0,0,0],[1,1,1],{electronic:true,explode:[-.6,.10,.6]});
    addPart(group,new THREE.BoxGeometry(.13,.38,.025),0x13634f,"core",[x,y(1000),0],[0,0,0],[1,1,1],{electronic:true,explode:[-.65,-.2,.6]});
    addPart(group,new THREE.BoxGeometry(.10,.14,.03),0x99a6ab,"core",[x,y(1030),.035],[0,0,0],[1,1,1],{electronic:true,metalness:.4,explode:[-.65,-.2,.6]});
    for(const mm of [905,1065])addPart(group,new THREE.CylinderGeometry(.04,.04,.06,14),accent,"control",[x+.08,y(mm),.06],[Math.PI/2,0,0],[1,1,1],{electronic:true,explode:[.60,0,.60]});
    // Armour is an independent adjustable bib illustration, not greatsword geometry.
    const armourX=1.55;
    addPart(group,plateGeometry([[-.80,.65],[-.25,.80],[-.18,.46],[.18,.46],[.25,.80],[.80,.65],[.65,-.90],[-.65,-.90]],.06,.025),0x283441,"wearable",[armourX,.05,0],[0,0,0],[1,1,1],{roughness:.98,explode:[.6,0,-.3]});
    for(const side of [-1,1])linePart(group,[[armourX+side*.72,.48,0],[armourX+side*.88,.0,-.08],[armourX+side*.68,-.55,0]],0x7a6c76,"wearable",{radius:.035,segments:16,radialSegments:6,roughness:.95,explode:[.6,0,-.3]});
    const zones=[{id:"left-shoulder",dx:-.47,dy:.53,w:.36,h:.23},{id:"chest",dx:0,dy:-.14,w:1.0,h:.58},{id:"right-shoulder",dx:.47,dy:.53,w:.36,h:.23}];
    for(const zone of zones){
      const led=addPart(group,roundedPanelGeometry(zone.w,zone.h,.018,.05),accent,"wearable",[armourX+zone.dx,zone.dy,.095],[0,0,0],[1,1,1],{electronic:true,emissive:true,emissiveIntensity:1.1,explode:[.6,0,.55]});
      led.userData.feedbackZone=zone.id;
      addPart(group,roundedPanelGeometry(zone.w+.04,zone.h+.04,.022,.06),0xe8dfe3,"wearable",[armourX+zone.dx,zone.dy,.14],[0,0,0],[1,1,1],{roughness:.65,opacity:.45,explode:[.6,0,.70]});
    }
    const receiver=addPart(group,new THREE.BoxGeometry(.26,.34,.05),0x146258,"wearable",[armourX,-.48,-.08],[0,0,0],[1,1,1],{electronic:true,explode:[.6,-.15,-.6]});
    receiver.userData.deviceRole="armour-receiver";
    group.userData.designEnvelopeMm={width:360,height:1150,depth:60};
    group.userData.armourSizing="illustrative / fit not verified";
    group.userData.modelRevision="dark-knight-greatsword-cad-03";
    return finishModel(group,"boss");
  }
  const builders = { guardian: buildGuardian, warrior: buildSword, archer: buildBow, assassin: buildDaggers, mage: buildStaff, boss: buildBoss };

  function setupRenderer(root, cameraPosition, target) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061219, .027);
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(...cameraPosition);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    root.prepend(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 6; controls.maxDistance = 16; controls.target.set(...target);
    scene.add(new THREE.HemisphereLight(0xc9f3ff, 0x071015, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(5, 8, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const rim = new THREE.PointLight(0x16a6c9, 32, 18); rim.position.set(-5, 2, 4); scene.add(rim);
    const fill = new THREE.PointLight(0x7057d9, 18, 15); fill.position.set(4, -1, -3); scene.add(fill);
    const resize = () => { const rect = root.getBoundingClientRect(); if (!rect.width || !rect.height) return; camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); };
    new ResizeObserver(resize).observe(root); resize();
    return { scene, camera, renderer, controls, resize };
  }

  const propRoot = $("#threePropStage");
  const propWorld = setupRenderer(propRoot, [0, .7, 10.8], [0, 0, 0]);
  const propPlatform = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.9, .25, 64), material(0x0c2027, .2));
  propPlatform.position.y = -3.35; propPlatform.receiveShadow = true; propWorld.scene.add(propPlatform);
  const propGrid = new THREE.GridHelper(8, 16, 0x16a6c9, 0x17303a); propGrid.position.y = -3.21; propWorld.scene.add(propGrid);
  const initialHeight = Number($("#playerHeight")?.value || 168);
  let currentProp = "guardian", propModel, selectedKey = null, currentAssemblyStep = 0, guardianDiameter = Math.round(Math.max(45, Math.min(55, initialHeight * .3)));
  let twinStateByProp = {};
  try { twinStateByProp = JSON.parse(localStorage.getItem("atlas-twin-state-v1") || "{}"); } catch { twinStateByProp = {}; }
  const selectedByProp = Object.fromEntries(Object.entries(twinStateByProp).map(([prop, value]) => [prop, value?.selectedKey]).filter(([, key]) => key));

  function persistTwinState() {
    twinStateByProp[currentProp] = {
      selectedKey,
      explode: Number($("#explodeRange")?.value || 0),
      electronics: Boolean($("#electronicsLayerToggle")?.checked),
      sync: Boolean($("#syncTwinToggle")?.checked)
    };
    localStorage.setItem("atlas-twin-state-v1", JSON.stringify(twinStateByProp));
  }

  function partLabel(key) {
    const module = propManifests[currentProp]?.modules.find(part => part.modelKey === key);
    const bowLabels = {shell:["Recurve foam frame","Khung foam recurve"],wearable:["Cosmetic cord","Dây trang trí"],control:["Magnet / slider","Nam châm / con trượt"],sensor:["Hall sensor","Cảm biến Hall"],core:["ESP32 riser core","Lõi ESP32 tay cầm"],light:["Limb LED channels","Rãnh LED cánh cung"]};
    const bladeLabels={warrior:{shell:["Foam blade / grip","Lưỡi foam / chuôi"],light:["LED spine","LED sống kiếm"],sensor:["Guard IMU","IMU chắn tay"],control:["Grip trigger","Cò tay cầm"],core:["ESP32 hilt","ESP32 trong chuôi"],wearable:["Wrist loop","Dây giữ cổ tay"]},assassin:{shell:["Active dagger shell","Vỏ dao chủ động"],passive:["Passive dagger","Dao phụ thụ động"],sensor:["Active IMU","IMU dao chủ động"],control:["Grip trigger","Cò tay cầm"],core:["Active ESP32 hilt","ESP32 chuôi chủ động"],wearable:["Wrist trap pad","Nút bẫy cổ tay"]}};
    const longLabels={mage:{light:["Diffused orb / LED","Quả cầu / LED tán sáng"],shell:["Padded head / shaft","Đầu đệm / thân gậy"],control:["Cast button","Nút niệm phép"],sensor:["Grip IMU","IMU tay cầm"],core:["Lower-grip ESP32","ESP32 tay cầm dưới"],wearable:["Padded end","Đầu dưới bọc đệm"]},boss:{shell:["Hollow blade / guard / grip","Lưỡi rỗng / chắn tay / chuôi"],light:["Blade fuller LEDs","LED rãnh lưỡi kiếm"],control:["Two grip triggers","Hai cò tay cầm"],sensor:["Balance IMU","IMU vùng cân bằng"],core:["Grip ESP32","ESP32 trong tay cầm"],wearable:["Shared impact armour","Giáp nhận hit dùng chung"]}};
    const label = currentProp === "archer" ? bowLabels[key]?.[isVi()?1:0] : (bladeLabels[currentProp]?.[key] || longLabels[currentProp]?.[key] || copy[key])?.[isVi()?1:0];
    return `${module ? module.callout + '. ' : ''}${label || key}`;
  }
  function modelKeys() {
    const geometryKeys = new Set((propModel?.children || []).map(child => child.userData.partKey).filter(Boolean));
    const manifestKeys = (propManifests[currentProp]?.modules || []).map(module => module.modelKey);
    return [...new Set(manifestKeys)].filter(key => geometryKeys.has(key));
  }
  function refreshPropLabels() {
    if (!propModel) return;
    const keys = modelKeys();
    $("#twinPartButtons").innerHTML = keys.map(key => `<button type="button" data-twin-part="${key}">${partLabel(key)}</button>`).join("");
    $("#twin-title").textContent = `${names[currentProp][isVi() ? 1 : 0]} · ${isVi() ? "mô hình lắp 3D" : "3D assembly model"}`;
    $("#twinPropName").textContent = names[currentProp][isVi() ? 1 : 0];
    selectPart(keys.includes(selectedKey) ? selectedKey : keys[0], { autoReveal: false });
  }
  function selectPart(key, { autoReveal = true } = {}) {
    if (!copy[key]) return;
    selectedKey = key;
    selectedByProp[currentProp] = key;
    if (!propModel) return;
    const selectingElectronics = propModel.children.some(object => object.userData.partKey === key && object.userData.electronic);
    if (autoReveal && selectingElectronics) {
      $("#electronicsLayerToggle").checked = true;
      if (Number($("#explodeRange").value) < 28) $("#explodeRange").value = "28";
    }
    propModel.traverse(object => {
      if (!object.isMesh || !object.material.emissive) return;
      const selected = object.userData.partKey === key;
      object.material.emissive.setHex(selected ? palette[currentProp] : object.userData.baseEmissive || 0);
      object.material.emissiveIntensity = selected ? Math.max(2.6, object.userData.baseEmissiveIntensity || 0) : object.userData.baseEmissiveIntensity || 0;
      object.renderOrder = selected ? 10 : 0;
    });
    updateExplode();
    updateElectronicLayer();
    document.querySelectorAll("#twinPartButtons button").forEach(button => {
      const active = button.dataset.twinPart === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const bowCopy = {
      shell:["Recurve foam frame","Khung foam recurve","Flat curved limbs, grip and removable cover match the CAD contour.","Cánh dẹt cong, tay cầm và nắp tháo rời bám theo biên dạng CAD.","Cardboard fit first; soft edges. No arrow rest or projectile.","Thử carton và bo cạnh mềm trước. Không có bệ tên hay vật thể phóng."],
      wearable:["Cosmetic cord","Dây trang trí","One thin cord joins the limb tips; not a launch mechanism.","Một dây mảnh nối hai đầu cánh; không phải cơ cấu phóng.","Keep it slack/low tension. Never load an arrow.","Giữ dây chùng hoặc lực thấp. Không lắp mũi tên."],
      control:["Magnet / slider","Nam châm / con trượt","Separate magnet beside the Hall board represents a deliberate input proxy.","Nam châm riêng cạnh board Hall biểu diễn input chủ động.","Slider travel and retention are unverified. Do not infer a working mechanism from this model.","Hành trình và cách giữ con trượt chưa xác minh. Mô hình chưa chứng minh cơ cấu hoạt động."],
      sensor:["Hall sensor","Cảm biến Hall","A small sensor board inside the riser, independent of the magnet module.","Board cảm biến nhỏ trong tay cầm, tách khỏi module nam châm.","Measure the exact board, magnet gap and thresholds over USB.","Đo board thật, khe nam châm và thử ngưỡng qua USB."],
      core:["ESP32 service core","Lõi bảo trì ESP32","Controller and USB connector under the removable riser cover; symbolic components.","Bộ điều khiển và cổng USB dưới nắp tay cầm; linh kiện mang tính biểu tượng.","Board dimensions, connectors and cable clearance require physical measurement. Battery not included.","Cần đo board, đầu nối và khoảng trống dây thật. Chưa có pin."],
      light:["Limb LED channels","Rãnh LED cánh cung","Two protected LED strips follow the upper and lower recurve.","Hai dải LED được bảo vệ chạy theo cánh recurve trên và dưới.","Verify diffusion, strain relief, current and heat before closing the channels.","Kiểm tra tán sáng, chống kéo dây, dòng điện và nhiệt trước khi đóng rãnh."]
    };
    const longChecks={mage:{light:["The diffuser is a shell; its LED sits inside. Orb diameter follows the 140 mm reference.","Vỏ cầu tán sáng bao LED bên trong. Đường kính theo mẫu 140 mm.","Verify diffuser retention, glare, current and heat; not a tested light assembly.","Cần kiểm tra giữ vỏ, độ chói, dòng và nhiệt; chưa thử cụm đèn thật."],sensor:["IMU below the upper grip, independent of decorative head parts.","IMU dưới vùng cầm trên, tách khỏi phần trang trí đầu gậy.","Measure and calibrate the real IMU axes before fixing it.","Đo và cân chỉnh trục IMU thật trước khi cố định."],wearable:["Rounded padded lower end; no pointed cap.","Đầu dưới bọc đệm bo tròn, không có chóp nhọn.","Check foam softness and cap retention on a physical mockup.","Thử độ mềm foam và cách giữ đầu đệm trên mẫu thật."]},boss:{shell:["Six separate foam panels form the hollow blade and guard; grip and pommel remain visible with electronics off.","Sáu tấm foam tạo lưỡi kiếm rỗng và chắn tay; chuôi và tay cầm vẫn hiện khi tắt điện tử.","Verify weight, panel bonds, softness and balance. This is not a load-bearing proof.","Kiểm tra khối lượng, mối dán, độ mềm và cân bằng; mô hình chưa chứng minh chịu lực."],wearable:["Separate adjustable bib with left shoulder, chest and right shoulder LED zones, plus a receiver.","Áo bib riêng có LED vai trái, ngực, vai phải và bộ nhận.","Bib sizing and connectors are illustrative. Fit users, remove panels for washing and test heat; hit detection stays game-authoritative.","Cỡ áo và đầu nối là minh họa. Thử vừa người, tháo panel để giặt và kiểm tra nhiệt; game quyết định trúng đòn."],sensor:["IMU in the shaft near a provisional balance region, not a decoration on the blade face.","IMU trong cán gần vùng cân bằng dự kiến, không phải trang trí mặt lưỡi kiếm.","The actual balance point must be weighed and measured after assembly.","Phải cân và đo điểm cân bằng thật sau khi lắp." ]}};
    const entry = [...(currentProp === "archer" ? bowCopy[key] : copy[key])];
    const detail=longChecks[currentProp]?.[key];
    if(detail){entry[2]=detail[0];entry[3]=detail[1];entry[4]=detail[2];entry[5]=detail[3];}
    $("#twinPartInfo").innerHTML = `<strong>${entry[isVi() ? 1 : 0]}</strong><p>${entry[isVi() ? 3 : 2]}</p><p><b>${isVi() ? "Cần kiểm tra:" : "Build check:"}</b> ${entry[isVi() ? 5 : 4]}</p>`;
    persistTwinState();
  }
  function updateExplode() {
    if (!propModel) return;
    const amount = Number($("#explodeRange").value) / 100;
    $("#explodeValue").textContent = `${Math.round(amount * 100)}%`;
    propModel.traverse(object => {
      if (!object.isMesh || !object.userData.basePosition) return;
      const vector = object.userData.explode || [0, 0, 0];
      object.position.copy(object.userData.basePosition).add(new THREE.Vector3(...vector).multiplyScalar(amount));
    });
    if (propModel) persistTwinState();
  }
  function updateElectronicLayer() {
    const show = $("#electronicsLayerToggle").checked;
    propModel?.traverse(object => {
      if (!object.isMesh) return;
      if (object.userData.electronic) object.visible = show;
      const ghostShell = selectedKey !== "shell" && object.userData.partKey === "shell";
      const ghostOther = selectedKey && selectedKey !== "shell" && object.userData.partKey !== selectedKey && object.userData.partKey !== "shell";
      const baseOpacity = object.userData.baseOpacity ?? 1;
      object.material.opacity = ghostShell ? Math.min(.18, baseOpacity) : ghostOther ? Math.min(.34, baseOpacity) : baseOpacity;
      object.material.transparent = ghostShell || ghostOther || object.userData.baseTransparent;
      object.material.depthWrite = ghostShell || ghostOther ? false : object.userData.baseDepthWrite;
    });
    if (propModel) persistTwinState();
  }
  function rebuildProp(prop = currentProp) {
    if (!builders[prop]) return;
    if (prop === currentProp && propModel) {
      refreshPropLabels();
      applyGuidedStep(prop, currentAssemblyStep);
      return;
    }
    currentProp = prop;
    if (propModel) propWorld.scene.remove(propModel);
    propModel = builders[prop](palette[prop]);
    if (prop === "guardian") propModel.scale.setScalar(guardianDiameter / 50);
    propWorld.scene.add(propModel);
    const keys = modelKeys();
    const savedState = twinStateByProp[prop] || {};
    selectedKey = keys.includes(selectedByProp[prop]) ? selectedByProp[prop] : keys[0];
    $("#explodeRange").value = String(Number.isFinite(savedState.explode) ? savedState.explode : 0);
    $("#electronicsLayerToggle").checked = savedState.electronics !== false;
    if (typeof savedState.sync === "boolean") $("#syncTwinToggle").checked = savedState.sync;
    refreshPropLabels();
    if ($("#syncTwinToggle")?.checked) applyGuidedStep(prop, currentAssemblyStep);
    else selectPart(selectedKey, { autoReveal: false });
  }
  function applyGuidedStep(prop, step) {
    currentAssemblyStep = Number(step || 0);
    if (prop !== currentProp || !$("#syncTwinToggle")?.checked) return;
    const roleSteps={archer:["shell", "core", "wearable", "sensor", "core", "light", "control", "shell"],warrior:["shell","core","shell","light","sensor","core","wearable","shell"],assassin:["shell","core","shell","sensor","control","passive","wearable","shell"]};
    roleSteps.mage=["shell","core","shell","light","sensor","core","control","shell"];
    roleSteps.boss=["shell","core","shell","sensor","wearable","wearable","control","shell"];
    const mapping = roleSteps[currentProp] || ["wearable", "core", "shell", "sensor", "control", "light", "wearable", "shell"];
    const key = mapping[Math.max(0, Math.min(7, currentAssemblyStep))];
    $("#explodeRange").value = currentAssemblyStep === 0 ? "22" : currentAssemblyStep === 7 ? "0" : "48";
    updateExplode(); selectPart(key);
  }
  $("#explodeRange").addEventListener("input", updateExplode);
  $("#electronicsLayerToggle").addEventListener("change", updateElectronicLayer);
  $("#syncTwinToggle").addEventListener("change", () => { persistTwinState(); applyGuidedStep(currentProp, currentAssemblyStep); });
  function selectPartManually(key) {
    $("#syncTwinToggle").checked = false;
    selectPart(key);
  }
  $("#twinPartButtons").addEventListener("click", event => { const button = event.target.closest("[data-twin-part]"); if (button) selectPartManually(button.dataset.twinPart); });
  const propRaycaster = new THREE.Raycaster(); const propPointer = new THREE.Vector2();
  let pointerStart = null;
  propWorld.renderer.domElement.addEventListener("pointerdown", event => { pointerStart = [event.clientX, event.clientY]; });
  propWorld.renderer.domElement.addEventListener("pointerup", event => {
    const moved = pointerStart ? Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) : 0;
    pointerStart = null;
    if (moved > 6) return;
    const rect = propWorld.renderer.domElement.getBoundingClientRect();
    propPointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    propRaycaster.setFromCamera(propPointer, propWorld.camera);
    const hit = propRaycaster.intersectObject(propModel, true).find(item => item.object.userData.partKey);
    if (hit) selectPartManually(hit.object.userData.partKey);
  });
  $("#threePropLoading")?.remove(); rebuildProp($("#roleSelect")?.value || "guardian");

  const arenaRoot = $("#threeArenaStage");
  const arenaWorld = setupRenderer(arenaRoot, [0, 9.5, 10.5], [0, 0, 0]);
  arenaWorld.controls.minPolarAngle = .45; arenaWorld.controls.maxPolarAngle = 1.2; arenaWorld.controls.minDistance = 9; arenaWorld.controls.maxDistance = 18;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.2, 64), material(0x081920, .1)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; arenaWorld.scene.add(floor);
  const grid = new THREE.GridHelper(12, 12, 0x16a6c9, 0x17303a); grid.position.y = .015; arenaWorld.scene.add(grid);
  [2.2, 4.2, 5.8].forEach((radius, index) => { const ring = new THREE.Mesh(new THREE.RingGeometry(radius - .025, radius + .025, 64), material(index === 0 ? 0xef6b68 : 0xf0b44d, 0, .38)); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; arenaWorld.scene.add(ring); });
  const boss = new THREE.Group();
  addPart(boss, new THREE.CylinderGeometry(.65, .85, 1.8, 16), 0x4a2227, "boss", [0, .9, 0]);
  addPart(boss, new THREE.BoxGeometry(1.5, .45, .65), 0xef6b68, "boss", [0, 1.75, 0]); boss.position.set(0, 0, 0); arenaWorld.scene.add(boss);
  const rolePositions = { guardian: [-3.4, 0, -2.2], archer: [3.5, 0, -2.4], assassin: [3.2, 0, 3], support: [-3.3, 0, 2.9] };
  const roleColors = { guardian: 0xf0b44d, archer: 0x16a6c9, assassin: 0x7057d9, support: 0x39cc93 };
  const heroes = {};
  Object.entries(rolePositions).forEach(([role, position]) => {
    const hero = new THREE.Group();
    addPart(hero, new THREE.CylinderGeometry(.38, .5, 1.15, 16), roleColors[role], role, [0, .58, 0]);
    addPart(hero, new THREE.SphereGeometry(.34, 16, 12), 0xc5d7db, role, [0, 1.42, 0]);
    hero.position.set(...position); hero.userData.role = role; heroes[role] = hero; arenaWorld.scene.add(hero);
  });
  let fieldRole = "archer", bossHp = 520, attackTweens = [], arenaClock = new THREE.Clock();
  function selectFieldRole(role) {
    fieldRole = role;
    Object.entries(heroes).forEach(([key, hero]) => hero.scale.setScalar(key === role ? 1.18 : 1));
    document.querySelectorAll("[data-field-role]").forEach(button => button.classList.toggle("is-active", button.dataset.fieldRole === role));
  }
  function launchEvent(detail) {
    const role = detail.role || fieldRole; const origin = heroes[role]?.position.clone() || heroes[fieldRole].position.clone();
    origin.y = 1.1; const destination = new THREE.Vector3(0, 1.1, 0); const lost = Boolean(detail.lost);
    if (lost) destination.lerpVectors(origin, destination, .55);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), material(lost ? 0xef6b68 : roleColors[role] || 0x16a6c9, .2));
    orb.position.copy(origin); arenaWorld.scene.add(orb);
    attackTweens.push({ orb, start: origin, end: destination, elapsed: 0, duration: Math.max(.35, Number(detail.duration || 500) / 1000), lost });
  }
  function setBossHp(value) {
    bossHp = value; const ratio = Math.max(.25, bossHp / 520);
    boss.scale.y = .8 + ratio * .2;
    boss.children.forEach(child => { if (child.material?.emissive) { child.material.emissive.setHex(bossHp < 175 ? 0xef6b68 : 0); child.material.emissiveIntensity = bossHp < 175 ? .4 : 0; } });
  }
  $("#arenaRoleChips").addEventListener("click", event => { const button = event.target.closest("[data-field-role]"); if (button) { selectFieldRole(button.dataset.fieldRole); window.dispatchEvent(new CustomEvent("atlas-select-field-role", { detail: { role: button.dataset.fieldRole } })); } });
  document.querySelectorAll("[data-arena-view]").forEach(button => button.addEventListener("click", () => {
    const mode = button.dataset.arenaView;
    document.querySelectorAll("[data-arena-view]").forEach(item => item.classList.toggle("is-active", item === button));
    arenaRoot.classList.toggle("is-hidden", mode !== "three"); $("#arena").classList.toggle("is-hidden", mode !== "logic");
    $("#arenaViewStatus").textContent = mode === "three" ? "3D EVENT REPLAY" : "LOGIC / PACKET MAP";
  }));
  $("#threeArenaLoading")?.remove(); selectFieldRole("archer");

  window.addEventListener("atlas-prop-change", event => rebuildProp(event.detail?.prop));
  window.addEventListener("atlas-select-prop-part", event => {
    const detail = event.detail || {};
    if (detail.prop && detail.prop !== currentProp) rebuildProp(detail.prop);
    if (detail.modelKey && modelKeys().includes(detail.modelKey)) selectPartManually(detail.modelKey);
  });
  window.addEventListener("atlas-language-change", refreshPropLabels);
  window.addEventListener("atlas-guided-step-change", event => applyGuidedStep(event.detail?.prop, event.detail?.step));
  window.addEventListener("atlas-guardian-fit-change", event => {
    guardianDiameter = Number(event.detail?.diameterCm || 50);
    if (currentProp === "guardian" && propModel) propModel.scale.setScalar(guardianDiameter / 50);
  });
  window.addEventListener("atlas-field-action", event => launchEvent(event.detail || {}));
  window.addEventListener("atlas-field-state", event => setBossHp(Number(event.detail?.bossHp ?? 520)));
  window.addEventListener("atlas-field-reset", () => { attackTweens.forEach(item => arenaWorld.scene.remove(item.orb)); attackTweens = []; setBossHp(520); });
  if (window.ATLAS_PENDING_PART) {
    const pending = window.ATLAS_PENDING_PART;
    if (pending.prop && pending.prop !== currentProp) rebuildProp(pending.prop);
    if (pending.modelKey && modelKeys().includes(pending.modelKey)) selectPartManually(pending.modelKey);
    window.ATLAS_PENDING_PART = null;
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(arenaClock.getDelta(), .05);
    propModel?.rotateY(.0012);
    attackTweens = attackTweens.filter(tween => {
      tween.elapsed += delta; const progress = Math.min(1, tween.elapsed / tween.duration); const eased = 1 - Math.pow(1 - progress, 3);
      tween.orb.position.lerpVectors(tween.start, tween.end, eased); tween.orb.position.y += Math.sin(progress * Math.PI) * 1.4;
      if (progress < 1) return true;
      arenaWorld.scene.remove(tween.orb); return false;
    });
    propWorld.controls.update(); arenaWorld.controls.update();
    propWorld.renderer.render(propWorld.scene, propWorld.camera); arenaWorld.renderer.render(arenaWorld.scene, arenaWorld.camera);
  }
  animate();
}

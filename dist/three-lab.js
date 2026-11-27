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
    if (options.td) mesh.userData.td = options.td; // teardown group when it differs from the module key
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
    addPart(group,new THREE.BoxGeometry(.22,.74,.035),0x3d5b66,"shell",[0,-2.33,.22],[0,0,0],[1,1,1],{roughness:.7,explode:[0,0,.7],td:"cover"});
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
    addPart(group, new THREE.BoxGeometry(.30,.65,.045),0x45616a,"shell",[.07,0,.205],[0,0,0],[1,1,1],{roughness:.65,explode:[0,0,.65],td:"cover"});
    for (const y of [-.25,-.15,-.05,.05,.15,.25]) linePart(group,[[-.12,y,.232],[.20,y,.232]],0x607b82,"shell",{radius:.012,segments:2,radialSegments:6,roughness:.95,explode:[0,0,.65],td:"cover"});
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
    for (const y of [-.32,.32]) addRivet(group,[.055,y,.245],"shell",0x8ea4aa,{explode:[0,0,.65],td:"cover"});
    // Gate 01 IR emitter on the arrow-side face of the riser (the cord is at +x, so shots leave
    // toward -x): TSAL6200 + 2N2222A driver behind a ~20 mm lens in a 21 mm tube that narrows the
    // beam. The tube and lens are passive shell parts; the LED and driver are core electronics.
    const emitterY=.34, emitterOut=[-.85,.35,.30];
    addPart(group,new THREE.CylinderGeometry(.06,.06,.30,20,1,true),0x2a3d45,"shell",[-.31,emitterY,0],[0,0,Math.PI/2],[1,1,1],{roughness:.7,metalness:.15,explode:emitterOut,td:"emitter"});
    addPart(group,new THREE.CylinderGeometry(.064,.064,.018,24),0xbfe6f2,"shell",[-.46,emitterY,0],[0,0,Math.PI/2],[1,1,1],{roughness:.12,opacity:.55,transmission:.2,explode:emitterOut,td:"emitter"});
    addPart(group,new THREE.CylinderGeometry(.026,.026,.07,14),0x5c6fa8,"core",[-.2,emitterY,0],[0,0,Math.PI/2],[1,1,1],{electronic:true,roughness:.3,explode:emitterOut,td:"emitter"});
    addPart(group,new THREE.BoxGeometry(.10,.07,.025),0x1f6b5a,"core",[-.07,emitterY,.06],[0,0,0],[1,1,1],{electronic:true,explode:emitterOut,td:"emitter"});
    // Coin vibration motor behind the grip: buzzes a confirmed hit through a transistor.
    addPart(group,new THREE.CylinderGeometry(.05,.05,.027,20),0xa7b4ba,"core",[.1,.05,-.12],[Math.PI/2,0,0],[1,1,1],{electronic:true,metalness:.55,roughness:.3,explode:[.55,.15,-.75],td:"haptic"});
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
    addPart(group,new THREE.BoxGeometry(.29,.72,.04),0x43516b,"shell",[-1.12,-2.27,.30],[0,0,0],[1,1,1],{roughness:.8,explode:[-.25,0,1.0],td:"cover"});
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
    addPart(group,new THREE.BoxGeometry(.18,.55,.035),0x406359,"shell",[0,y(850),.137],[0,0,0],[1,1,1],{roughness:.8,explode:[0,0,.60],td:"cover"});
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
    addPart(group,plateGeometry([[-.80,.65],[-.25,.80],[-.18,.46],[.18,.46],[.25,.80],[.80,.65],[.65,-.90],[-.65,-.90]],.06,.025),0x283441,"wearable",[armourX,.05,0],[0,0,0],[1,1,1],{roughness:.98,explode:[.6,0,-.3],td:"armour-bib"});
    for(const side of [-1,1])linePart(group,[[armourX+side*.72,.48,0],[armourX+side*.88,.0,-.08],[armourX+side*.68,-.55,0]],0x7a6c76,"wearable",{radius:.035,segments:16,radialSegments:6,roughness:.95,explode:[.6,0,-.3],td:"armour-bib"});
    const zones=[{id:"left-shoulder",dx:-.47,dy:.53,w:.36,h:.23},{id:"chest",dx:0,dy:-.14,w:1.0,h:.58},{id:"right-shoulder",dx:.47,dy:.53,w:.36,h:.23}];
    for(const zone of zones){
      const led=addPart(group,roundedPanelGeometry(zone.w,zone.h,.018,.05),accent,"wearable",[armourX+zone.dx,zone.dy,.095],[0,0,0],[1,1,1],{electronic:true,emissive:true,emissiveIntensity:1.1,explode:[.6,0,.55],td:"armour-led"});
      led.userData.feedbackZone=zone.id;
      addPart(group,roundedPanelGeometry(zone.w+.04,zone.h+.04,.022,.06),0xe8dfe3,"wearable",[armourX+zone.dx,zone.dy,.14],[0,0,0],[1,1,1],{roughness:.65,opacity:.45,explode:[.6,0,.70],td:"armour-led"});
    }
    const receiver=addPart(group,new THREE.BoxGeometry(.26,.34,.05),0x146258,"wearable",[armourX,-.48,-.08],[0,0,0],[1,1,1],{electronic:true,explode:[.6,-.15,-.6],td:"armour-receiver"});
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
  // Teardown mode (dist/teardown-ui.js owns the step state; this only draws it).
  const teardown = { active: false, step: 0, tweens: [], focus: [], label: null, flight: null };
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
    if (!teardown.active) propModel.traverse(object => {
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
    if (teardown.active) return;
    propModel.traverse(object => {
      if (!object.isMesh || !object.userData.basePosition) return;
      const vector = object.userData.explode || [0, 0, 0];
      object.position.copy(object.userData.basePosition).add(new THREE.Vector3(...vector).multiplyScalar(amount));
    });
    if (propModel) persistTwinState();
  }
  function updateElectronicLayer() {
    const show = $("#electronicsLayerToggle").checked;
    if (teardown.active) return;
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
    teardown.active = false; teardown.tweens = []; teardown.focus = [];
    applyTeardown({ animate: false });
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
    if (hit && teardown.active) window.dispatchEvent(new CustomEvent("atlas-teardown-pick", { detail: { prop: currentProp, id: teardownId(hit.object) } }));
    else if (hit) selectPartManually(hit.object.userData.partKey);
  });

  // ---------------------------------------------------------------------------
  // Teardown: take the prop apart in service order. Each step names the mesh groups it removes
  // (userData.td, else partKey). Removed groups slide out along their exploded-view vector and dim;
  // the current group glows; the last step (the bare shell) stays put with everything laid out.
  // ---------------------------------------------------------------------------
  const teardownId = mesh => mesh.userData.td || mesh.userData.partKey;
  const teardownSteps = () => window.ATLAS_TEARDOWN?.props?.[currentProp]?.steps || [];
  const TEARDOWN_PULL = 1.45, TEARDOWN_MS = 650;
  function teardownLook(mesh, look) {
    const data = mesh.userData, mat = mesh.material;
    if (mat.emissive) { mat.emissive.setHex(look === "focus" ? palette[currentProp] : data.baseEmissive || 0); mat.emissiveIntensity = look === "focus" ? Math.max(.35, data.baseEmissiveIntensity || 0) : data.baseEmissiveIntensity || 0; }
    const dim = look === "dim";
    mat.opacity = dim ? Math.min(.42, data.baseOpacity ?? 1) : data.baseOpacity ?? 1;
    mat.transparent = dim || data.baseTransparent;
    mat.depthWrite = dim ? false : data.baseDepthWrite;
    mesh.renderOrder = look === "focus" ? 10 : dim ? -1 : 0;
  }
  function teardownLabel() {
    if (!teardown.label) { teardown.label = document.createElement("div"); teardown.label.className = "td-float"; teardown.label.setAttribute("aria-hidden", "true"); propRoot.append(teardown.label); }
    return teardown.label;
  }
  // Close-up camera: each step flies the orbit target to the parts coming out (where they will end
  // up), like a teardown video; the overview and the bare shell fly back to the home framing. Only
  // target and distance move, so the viewer can still orbit and zoom during and after a flight.
  const TEARDOWN_HOME = { target: new THREE.Vector3(0, 0, 0), distance: new THREE.Vector3(0, .7, 10.8).length() };
  const flightBox = new THREE.Box3(), flightSize = new THREE.Vector3();
  function flyTeardownCamera(home) {
    const controls = propWorld.controls, camera = propWorld.camera;
    let target = TEARDOWN_HOME.target.clone(), distance = TEARDOWN_HOME.distance;
    if (!home && teardown.focus.length) {
      flightBox.makeEmpty();
      for (const mesh of teardown.focus) {
        const tween = teardown.tweens.find(item => item.mesh === mesh), saved = mesh.position.clone();
        if (tween) mesh.position.copy(tween.to);
        mesh.updateWorldMatrix(true, false); flightBox.expandByObject(mesh);
        mesh.position.copy(saved); mesh.updateWorldMatrix(true, false);
      }
      // Lean a fifth of the way back to the model so the close-up keeps the prop in frame.
      target = flightBox.getCenter(new THREE.Vector3()).lerp(TEARDOWN_HOME.target, .2);
      distance = Math.max(4.6, Math.min(TEARDOWN_HOME.distance, flightBox.getSize(flightSize).length() * 2.6 + 3.6));
    }
    controls.minDistance = Math.min(controls.minDistance, 3);
    teardown.flight = { start: performance.now(), fromTarget: controls.target.clone(), toTarget: target,
      fromDistance: camera.position.distanceTo(controls.target), toDistance: distance, home };
  }
  function animateTeardownCamera(now) {
    const flight = teardown.flight; if (!flight) return;
    const controls = propWorld.controls, camera = propWorld.camera;
    const k = Math.min(1, (now - flight.start) / 900), eased = 1 - Math.pow(1 - k, 3);
    const direction = camera.position.clone().sub(controls.target).normalize();
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
    camera.position.copy(controls.target).addScaledVector(direction, flight.fromDistance + (flight.toDistance - flight.fromDistance) * eased);
    if (k < 1) return;
    teardown.flight = null;
    if (flight.home && !teardown.active) controls.minDistance = 6;
  }
  function applyTeardown({ animate = true } = {}) {
    const state = window.AtlasTeardown?.state?.();
    const steps = teardownSteps();
    const wasActive = teardown.active;
    teardown.active = Boolean(propModel && state?.active && state.prop === currentProp && steps.length);
    propRoot.classList.toggle("is-teardown", teardown.active);
    $("#explodeRange").disabled = teardown.active;
    if (!teardown.active) {
      teardown.tweens = []; teardown.focus = [];
      if (teardown.label) teardown.label.hidden = true;
      if (wasActive && propModel) { selectPart(selectedKey, { autoReveal: false }); flyTeardownCamera(true); }
      return;
    }
    if (!wasActive) propModel.rotation.y = -.42;
    const last = steps.length - 1, step = Math.max(0, Math.min(last, Number(state.step) || 0));
    const stepOf = new Map(); steps.forEach((item, index) => item.detach.forEach(id => stepOf.set(id, index)));
    const now = performance.now(); teardown.step = step; teardown.tweens = []; teardown.focus = [];
    propModel.traverse(mesh => {
      if (!mesh.isMesh || !mesh.userData.basePosition) return;
      const at = stepOf.get(teardownId(mesh)) ?? last;
      const target = mesh.userData.basePosition.clone();
      if (at <= step && at !== last) {
        const out = new THREE.Vector3(...(mesh.userData.explode || [0, 0, 0]));
        if (out.lengthSq() < 1e-6) out.set(0, -.35, -.8);
        target.add(out.multiplyScalar(TEARDOWN_PULL));
      }
      const look = step > 0 && at === step ? "focus" : at < step ? "dim" : "normal";
      mesh.visible = true; teardownLook(mesh, look);
      if (look === "focus") teardown.focus.push(mesh);
      if (animate && !mesh.position.equals(target)) teardown.tweens.push({ mesh, from: mesh.position.clone(), to: target, start: now });
      else mesh.position.copy(target);
    });
    const label = teardownLabel(), item = steps[step], lang = isVi() ? "vi" : "en";
    const count = item.parts.reduce((sum, [, qty]) => sum + qty, 0);
    label.innerHTML = `<b>${step}/${last}</b> ${item.title[lang]}${count ? `<small>${count} ${lang === "vi" ? "linh kiện" : count === 1 ? "part" : "parts"}</small>` : ""}`;
    label.hidden = step === 0;
    if (animate || wasActive || teardown.prop !== currentProp) flyTeardownCamera(step === 0 || step === last);
    teardown.prop = currentProp;
  }
  const teardownBox = new THREE.Box3(), teardownCentre = new THREE.Vector3();
  function animateTeardown(now) {
    animateTeardownCamera(now);
    if (!teardown.active) return;
    if (teardown.tweens.length) teardown.tweens = teardown.tweens.filter(tween => {
      const k = Math.min(1, (now - tween.start) / TEARDOWN_MS);
      const eased = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      tween.mesh.position.lerpVectors(tween.from, tween.to, eased);
      return k < 1;
    });
    const pulse = .22 + .3 * (.5 + .5 * Math.sin(now / 260));
    teardown.focus.forEach(mesh => { if (mesh.material.emissive) mesh.material.emissiveIntensity = Math.max(pulse, mesh.userData.baseEmissiveIntensity || 0); });
    const label = teardown.label;
    if (!label || label.hidden || !teardown.focus.length) return;
    teardownBox.makeEmpty(); teardown.focus.forEach(mesh => teardownBox.expandByObject(mesh));
    teardownBox.getCenter(teardownCentre); teardownCentre.y = teardownBox.max.y;
    teardownCentre.project(propWorld.camera);
    const rect = propRoot.getBoundingClientRect();
    const x = Math.max(90, Math.min(rect.width - 90, (teardownCentre.x + 1) / 2 * rect.width));
    const y = Math.max(46, Math.min(rect.height - 96, (1 - teardownCentre.y) / 2 * rect.height - 14));
    label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
  }
  window.addEventListener("atlas-teardown-change", () => applyTeardown());
  window.AtlasTeardown3D = Object.freeze({
    snapshot: () => ({ active: teardown.active, step: teardown.step, prop: currentProp, moving: teardown.tweens.length,
      focus: [...new Set(teardown.focus.map(teardownId))],
      ids: [...new Set((propModel?.children || []).map(teardownId))],
      out: [...new Set((propModel?.children || []).filter(mesh => mesh.userData.basePosition && !mesh.position.equals(mesh.userData.basePosition)).map(teardownId))] }),
    pick: id => window.dispatchEvent(new CustomEvent("atlas-teardown-pick", { detail: { prop: currentProp, id } }))
  });
  $("#threePropLoading")?.remove(); rebuildProp($("#roleSelect")?.value || "guardian");

  // ---------------------------------------------------------------------------
  // Gameplay arena: the six roster characters as rigged figures holding the same procedural prop
  // twins as the assembly lab above. It replays dist/field-ui.js events; it never decides outcomes.
  // ---------------------------------------------------------------------------
  const gameplay = window.ATLAS_GAMEPLAY_ROSTER;
  const roster = gameplay?.roster || {};
  const arenaRoot = $("#threeArenaStage");
  const arenaWorld = setupRenderer(arenaRoot, [0, 8.4, 11.2], [0, .9, .4]);
  arenaWorld.controls.minPolarAngle = .45; arenaWorld.controls.maxPolarAngle = 1.25; arenaWorld.controls.minDistance = 8; arenaWorld.controls.maxDistance = 28;
  // Portrait phones: pull the camera back so the whole ring stays in frame.
  const arenaHome = arenaWorld.camera.position.clone().sub(arenaWorld.controls.target);
  const fitArena = () => {
    const rect = arenaRoot.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const factor = Math.min(2, Math.max(1, 1.45 / (rect.width / rect.height)));
    arenaWorld.camera.position.copy(arenaWorld.controls.target).add(arenaHome.clone().multiplyScalar(factor));
  };
  new ResizeObserver(fitArena).observe(arenaRoot); fitArena();
  const arenaKey = arenaWorld.scene.children.find(object => object.isDirectionalLight);
  if (arenaKey) { Object.assign(arenaKey.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, far: 40 }); arenaKey.shadow.camera.updateProjectionMatrix(); arenaKey.shadow.mapSize.set(2048, 2048); }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.6, 64), material(0x081920, .1)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; arenaWorld.scene.add(floor);
  const grid = new THREE.GridHelper(13, 13, 0x16a6c9, 0x17303a); grid.position.y = .015; arenaWorld.scene.add(grid);
  [2.2, 4.2, 5.8].forEach((radius, index) => { const ring = new THREE.Mesh(new THREE.RingGeometry(radius - .025, radius + .025, 64), material(index === 0 ? 0xef6b68 : 0xf0b44d, 0, .38)); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; arenaWorld.scene.add(ring); });

  const hex = value => new THREE.Color(value).getHex();
  const flat = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, side: THREE.DoubleSide });
  const glow = (color, opacity = .3) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  // Grip point (prop-local units), scale on the rig, and hand pose for each CAD-02/03 prop twin.
  const propMounts = {
    guardian: { hand: "left", scale: .2, grip: [0, 0, -.5], rotation: [1.15, 0, -.1], offset: [0, .05, .14] },
    warrior: { hand: "right", scale: .16, grip: [0, -2.3, 0], rotation: [.55, 0, -.1], offset: [0, 0, .04] },
    archer: { hand: "left", scale: .18, grip: [.05, 0, 0], rotation: [0, -Math.PI / 2, 0], offset: [0, 0, .06] },
    assassin: { hand: "both", scale: .11, grip: [1.12, -2.27, 0], rotation: [.4, 0, 0], offset: [0, 0, .04] },
    mage: { hand: "right", scale: .2, grip: [0, -.46, 0], rotation: [.06, 0, 0], offset: [0, .1, .06] },
    boss: { hand: "right", scale: .19, grip: [-.9, -2.34, 0], rotation: [.25, 0, -.18], offset: [0, 0, .05] }
  };
  const armPose = {
    guardian: { left: [-1.2, .35, .15], right: [-.35, 0, -.1] }, warrior: { left: [-.25, 0, .12], right: [-.95, 0, -.08] },
    archer: { left: [-1.45, 0, 0], right: [-1.25, -.3, 0] }, assassin: { left: [-.85, 0, .22], right: [-.85, 0, -.22] },
    mage: { left: [-.25, 0, .15], right: [-.55, 0, -.12] }, boss: { left: [-.75, 0, .45], right: [-.95, 0, -.2] }
  };

  function textSprite(accent, width = 512, height = 176) {
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
    sprite.renderOrder = 20;
    sprite.userData.draw = ({ title, sub, hp, charge, badge }) => {
      const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, width, height);
      const boxH = charge === undefined ? (hp === undefined ? 96 : 136) : 160;
      ctx.fillStyle = "rgba(4,13,18,.84)"; ctx.strokeStyle = accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(8, 8, width - 16, boxH, 22); ctx.fill(); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillStyle = "#f2fbfd"; ctx.font = "800 44px system-ui, sans-serif"; ctx.fillText(title, width / 2, 56);
      ctx.fillStyle = accent; ctx.font = "700 25px ui-monospace, monospace"; ctx.fillText(sub, width / 2, 88);
      if (hp !== undefined) {
        ctx.fillStyle = "#18272d"; ctx.fillRect(40, 106, width - 80, 16);
        ctx.fillStyle = hp < .34 ? "#ff8c86" : accent; ctx.fillRect(40, 106, (width - 80) * Math.max(0, hp), 16);
      }
      if (charge !== undefined) {
        ctx.fillStyle = "#18272d"; ctx.fillRect(40, 132, width - 80, 10);
        ctx.fillStyle = charge >= 1 ? "#ffd1d0" : "#8a5cf0"; ctx.fillRect(40, 132, (width - 80) * Math.min(1, charge), 10);
      }
      if (badge) {
        ctx.font = "800 24px ui-monospace, monospace"; const w = ctx.measureText(badge).width + 22;
        ctx.fillStyle = "#f0b44d"; ctx.beginPath(); ctx.roundRect(width - 28 - w, 14, w, 34, 10); ctx.fill();
        ctx.fillStyle = "#041318"; ctx.textAlign = "center"; ctx.fillText(badge, width - 28 - w / 2, 39);
      }
      texture.needsUpdate = true;
    };
    return sprite;
  }

  function attachProp(rig, key, accent) {
    const mount = propMounts[key]; const prop = builders[key](accent);
    // Wearables that are not held (Boss bib, Assassin wrist pad) are drawn on the body instead.
    if (key === "boss" || key === "assassin") [...prop.children].filter(mesh => mesh.userData.partKey === "wearable").forEach(mesh => prop.remove(mesh));
    prop.traverse(object => { if (object.isMesh) { object.castShadow = true; object.material.side = THREE.FrontSide; } });
    const place = (target, model, grip) => {
      const holder = new THREE.Group(); holder.rotation.set(...mount.rotation); holder.position.set(...mount.offset);
      model.scale.setScalar(mount.scale); model.position.set(...grip.map(value => -value * mount.scale));
      holder.add(model); target.add(holder); return holder;
    };
    if (mount.hand === "both") {
      const left = new THREE.Group(); const right = new THREE.Group();
      [...prop.children].forEach(mesh => {
        mesh.geometry.computeBoundingBox();
        const x = mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).x * mesh.scale.x + mesh.position.x;
        (x < 0 ? right : left).add(mesh);
      });
      place(rig.userData.hands.right, right, [-mount.grip[0], mount.grip[1], mount.grip[2]]);
      place(rig.userData.hands.left, left, mount.grip);
    } else place(rig.userData.hands[mount.hand], prop, mount.grip);
    const leds = []; rig.traverse(object => { if (object.isMesh && object.userData.partKey === "light") leds.push(object); });
    rig.userData.leds = leds;
  }

  function buildCharacter(key, character) {
    const accent = hex(character.color); const isBoss = character.team === "boss";
    const rig = new THREE.Group(); const body = new THREE.Group(); rig.add(body);
    const suit = isBoss ? 0x1d1f27 : 0x1a313a; const trim = isBoss ? 0x8a7a5a : 0x7d979d;
    const armour = new THREE.Color(isBoss ? 0x2b2f3a : 0x28434b).lerp(new THREE.Color(accent), isBoss ? .08 : .32).getHex();
    [-1, 1].forEach(side => {
      addPart(body, new THREE.CapsuleGeometry(.12, .46, 4, 12), suit, "body", [side * .15, .44, 0], [0, 0, 0], [1, 1, 1], { roughness: .8 });
      addPart(body, new THREE.BoxGeometry(.21, .13, .34), armour, "body", [side * .15, .07, .05], [0, 0, 0], [1, 1, 1], { metalness: .35, roughness: .5 });
      addPart(body, new THREE.SphereGeometry(.09, 12, 10), trim, "body", [side * .15, .5, .1], [0, 0, 0], [1, 1, .7], { metalness: .55 });
    });
    addPart(body, new THREE.CylinderGeometry(.27, .24, .22, 16), armour, "body", [0, .8, 0], [0, 0, 0], [1, 1, 1], { metalness: .4 });
    addPart(body, new THREE.CapsuleGeometry(.27, .4, 6, 16), suit, "body", [0, 1.18, 0], [0, 0, 0], [1, 1, .82], { roughness: .7 });
    addPart(body, new THREE.BoxGeometry(.46, .42, .12, 2, 2, 1), armour, "body", [0, 1.27, .19], [0, 0, 0], [1, 1, 1], { metalness: .55, roughness: .34, clearcoat: .3 });
    const chestLed = addPart(body, new THREE.BoxGeometry(isBoss ? .36 : .3, isBoss ? .2 : .05, .03), accent, "led", [0, isBoss ? 1.25 : 1.36, .26], [0, 0, 0], [1, 1, 1], { emissive: true, emissiveIntensity: isBoss ? 1.1 : 1.8 });
    const shoulders = [-1, 1].map(side => addPart(body, new THREE.SphereGeometry(.16, 18, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), isBoss ? 0x3a3f4c : accent, "body", [side * .37, 1.5, 0], [0, 0, side * -.35], [1.1, .9, 1.1], { metalness: .5, roughness: .32 }));
    addPart(body, new THREE.CylinderGeometry(.09, .1, .12, 12), suit, "body", [0, 1.67, 0]);
    addPart(body, new THREE.SphereGeometry(.2, 22, 16), armour, "body", [0, 1.85, 0], [0, 0, 0], [1, 1.08, 1], { metalness: .5, roughness: .3, clearcoat: .4 });
    const visor = addPart(body, new THREE.BoxGeometry(.3, .07, .09), accent, "led", [0, 1.86, .15], [0, 0, 0], [1, 1, 1], { emissive: true, emissiveIntensity: 2.2 });
    const zones = {};
    if (isBoss) {
      // Dark Knight: horned helm, cape, and the three-zone LED bib (left shoulder, chest, right shoulder).
      [-1, 1].forEach(side => addPart(body, new THREE.ConeGeometry(.06, .34, 10), trim, "body", [side * .17, 2.05, -.02], [0, 0, side * -.55], [1, 1, 1], { metalness: .6 }));
      addPart(body, new THREE.BoxGeometry(.7, 1.0, .05), 0x2a1218, "body", [0, 1.0, -.25], [.12, 0, 0], [1, 1, 1], { roughness: .95 });
      zones.chest = chestLed;
      [["left", 1], ["right", -1]].forEach(([zone, side]) => {
        zones[zone] = addPart(body, new THREE.BoxGeometry(.2, .05, .2), accent, "led", [side * .4, 1.63, 0], [0, 0, side * -.35], [1, 1, 1], { emissive: true, emissiveIntensity: 1.1 });
      });
    }
    const hands = {}; const arms = {};
    [["left", -1], ["right", 1]].forEach(([name, side]) => {
      const arm = new THREE.Group(); arm.position.set(side * .4, 1.48, 0); body.add(arm);
      addPart(arm, new THREE.CapsuleGeometry(.08, .48, 4, 10), suit, "body", [0, -.3, 0], [0, 0, 0], [1, 1, 1], { roughness: .8 });
      addPart(arm, new THREE.CylinderGeometry(.1, .09, .2, 12), armour, "body", [0, -.46, 0], [0, 0, 0], [1, 1, 1], { metalness: .45 });
      addPart(arm, new THREE.SphereGeometry(.075, 12, 10), trim, "body", [0, -.64, 0]);
      const hand = new THREE.Group(); hand.position.set(0, -.64, 0); arm.add(hand);
      const pose = armPose[key]?.[name] || [0, 0, 0]; arm.rotation.set(...pose); arm.userData.basePose = pose;
      hands[name] = hand; arms[name] = arm;
    });
    if (key === "assassin") addPart(arms.left, new THREE.BoxGeometry(.16, .07, .14), accent, "led", [0, -.5, .1], [0, 0, 0], [1, 1, 1], { emissive: true, emissiveIntensity: 1.2 });
    rig.userData = { key, character, body, hands, arms, chestLed, visor, shoulders, zones };
    attachProp(rig, key, accent);
    const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(.48, 32), flat(0x000000, .35)); shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.position.y = .035; rig.add(shadowDisc);
    const selectRing = new THREE.Mesh(new THREE.RingGeometry(.56, .66, 48), flat(accent, .95)); selectRing.rotation.x = -Math.PI / 2; selectRing.position.y = .045; selectRing.visible = false; rig.add(selectRing);
    const focusRing = new THREE.Mesh(new THREE.RingGeometry(.74, .8, 48, 1, 0, Math.PI * 1.7), flat(0xef6b68, .9)); focusRing.rotation.x = -Math.PI / 2; focusRing.position.y = .05; focusRing.visible = false; rig.add(focusRing);
    const blockDome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glow(accent, .26)); blockDome.scale.set(.95, 1.35, .95); blockDome.visible = false; rig.add(blockDome);
    const shieldDome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glow(0x39cc93, .22)); shieldDome.scale.set(.82, 1.2, .82); shieldDome.visible = false; rig.add(shieldDome);
    const tag = textSprite(character.color); tag.position.set(0, isBoss ? 2.5 : 2.55, 0); if (isBoss) tag.scale.set(1.5, .52, 1); else tag.scale.set(1.9, .65, 1); rig.add(tag);
    Object.assign(rig.userData, { selectRing, focusRing, tag, blockDome, shieldDome });
    if (isBoss) rig.scale.setScalar(1.55);
    rig.traverse(object => { if (object.isMesh && !object.material.blending) object.material.side = THREE.FrontSide; });
    finishModel(rig);
    return rig;
  }

  const characters = {};
  Object.entries(roster).forEach(([key, character]) => {
    const rig = buildCharacter(key, character);
    rig.userData.phase = Math.random() * Math.PI * 2; rig.userData.home = new THREE.Vector3();
    characters[key] = rig; arenaWorld.scene.add(rig);
  });
  const boss = characters.boss;
  const defaultLineup = { hero1: "guardian", hero2: "archer", hero3: "assassin", hero4: "mage", reserve: "warrior" };
  let snapshot = { lineup: defaultLineup, heroes: {}, boss: { hp: gameplay?.limits.bossHp || 520, charge: 0, focus: "archer" }, traps: [], selected: "guardian" };
  let effects = [], traps = new Map();
  // Frame time comes from requestAnimationFrame timestamps so effects stay in step with the event timers.
  let arenaTime = 0, lastFrameAt;
  const tmp = new THREE.Vector3();
  const vi = () => isVi() ? 1 : 0;

  function placeRigs() {
    Object.entries(characters).forEach(([key, rig]) => {
      const seat = Object.entries(snapshot.lineup).find(([, value]) => value === key)?.[0];
      if (key === "boss") { rig.userData.home.set(0, 0, 0); rig.position.set(0, 0, 0); return; }
      const info = gameplay.seats[seat]; const radius = info.bench ? 5.75 : gameplay.arenaRadiusM; const angle = THREE.MathUtils.degToRad(info.angle);
      rig.userData.home.set(Math.sin(angle) * radius, 0, -Math.cos(angle) * radius);
      rig.position.copy(rig.userData.home); rig.lookAt(0, 0, 0);
      rig.scale.setScalar(info.bench ? .82 : 1); rig.userData.bench = Boolean(info.bench);
    });
  }
  function drawTags() {
    const limits = gameplay.limits;
    Object.entries(characters).forEach(([key, rig]) => {
      const character = roster[key]; const h = snapshot.heroes?.[key];
      if (key === "boss") {
        rig.userData.tag.userData.draw({ title: character.name[vi()], sub: `${snapshot.boss.hp} HP · ${Math.round(snapshot.boss.charge)}%`, hp: snapshot.boss.hp / limits.bossHp, charge: snapshot.boss.charge / limits.bossCharge });
        return;
      }
      const badge = rig.userData.bench ? (vi() ? "DỰ BỊ" : "RESERVE") : h && !h.connected ? "AI" : h && h.hp <= 0 ? (vi() ? "GỤC" : "DOWN") : "";
      rig.userData.tag.userData.draw({ title: character.name[vi()], sub: character.propName[vi()], hp: h ? h.hp / limits.heroHp : 1, badge });
    });
  }
  function applySnapshot(next) {
    const lineupChanged = JSON.stringify(next.lineup || {}) !== JSON.stringify(snapshot.lineup);
    snapshot = { ...snapshot, ...next };
    if (lineupChanged) placeRigs();
    Object.entries(characters).forEach(([key, rig]) => {
      const h = snapshot.heroes?.[key];
      rig.userData.selectRing.visible = key === snapshot.selected;
      rig.userData.focusRing.visible = key !== "boss" && key === snapshot.boss.focus;
      rig.userData.blockDome.visible = Boolean(h && (h.blocking || h.parrying));
      rig.userData.shieldDome.visible = Boolean(h?.shielded);
      const down = key === "boss" ? snapshot.boss.hp <= 0 : h?.hp <= 0;
      rig.userData.body.rotation.z = down ? 1.35 : 0; rig.userData.body.position.y = down ? .3 : rig.userData.body.position.y;
      rig.userData.down = down;
      if (key === "archer" && h) rig.userData.drawing = h.draw !== "rest" && h.connected;
    });
    if (boss) boss.userData.visor.material.emissiveIntensity = snapshot.boss.taunted ? 4.5 : snapshot.boss.hp < (gameplay.limits.bossHp / 3) ? 3.5 : 2.2;
    const ids = new Set((snapshot.traps || []).map(trap => trap.id));
    for (const [id, mesh] of traps) if (!ids.has(id)) { arenaWorld.scene.remove(mesh); traps.delete(id); }
    for (const trap of snapshot.traps || []) if (!traps.has(trap.id)) {
      const mesh = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(.34, .4, .06, 6), material(0x2b2140, { metalness: .4 })); disc.position.y = .04;
      const rune = new THREE.Mesh(new THREE.RingGeometry(.2, .3, 6), glow(hex(roster.assassin.color), .9)); rune.rotation.x = -Math.PI / 2; rune.position.y = .08;
      mesh.add(disc, rune); mesh.position.set(.9, 0, 1.25); arenaWorld.scene.add(mesh); traps.set(trap.id, mesh);
    }
    drawTags();
  }
  const chestOf = rig => rig.localToWorld(tmp.set(0, 1.25, 0)).clone();
  const aboveTag = rig => rig.position.clone().add(new THREE.Vector3(0, rig === boss ? 3.55 : 3.15, 0));
  function pulseLeds(rig, seconds = .5, strength = 4) {
    [...(rig.userData.leds || []), rig.userData.chestLed, rig.userData.visor].forEach(mesh => { mesh.userData.flashUntil = arenaTime + seconds; mesh.userData.flashStrength = strength; });
  }
  function addEffect(effect) { effect.age = 0; effects.push(effect); return effect; }
  function orb(color, size = .13) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 12), material(color, { emissive: true, emissiveIntensity: 3, metalness: 0 }));
    arenaWorld.scene.add(mesh); return mesh;
  }
  function projectile({ from, to, color, duration, lost, arc = 1.1, arrow = false, size = .13, done }) {
    let mesh;
    if (arrow) {
      mesh = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .9, 8), material(0xe7f3f5, { metalness: .2 }));
      const head = new THREE.Mesh(new THREE.ConeGeometry(.07, .2, 10), material(color, { emissive: true, emissiveIntensity: 3 })); head.position.y = .52;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 10), glow(color, .45)); halo.position.y = .42;
      const trail = new THREE.Mesh(new THREE.CylinderGeometry(size * .55, 0, 1.6, 12, 1, true), glow(color, .55)); trail.position.y = -.45;
      mesh.add(shaft, head, halo, trail); mesh.scale.setScalar(1.35); arenaWorld.scene.add(mesh);
    } else mesh = orb(lost ? 0xef6b68 : color, size);
    const end = lost ? from.clone().lerp(to, .55) : to.clone(); const prev = from.clone();
    return addEffect({ duration, update(t) {
      const eased = 1 - Math.pow(1 - t, 3);
      mesh.position.lerpVectors(from, end, eased); mesh.position.y += Math.sin(t * Math.PI) * arc;
      if (arrow) { const dir = mesh.position.clone().sub(prev); if (dir.lengthSq() > 1e-6) mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); }
      prev.copy(mesh.position);
      if (lost) mesh.scale.setScalar(Math.max(.15, 1 - t * .9));
    }, dispose() { arenaWorld.scene.remove(mesh); done?.(); } });
  }
  function ringPulse({ position, color, from = .3, to = 2, duration = .7, y = .08, width = .09, opacity = .9 }) {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(1 - width, 1, 64), flat(color, opacity)); mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(position.x, y, position.z); arenaWorld.scene.add(mesh);
    return addEffect({ duration, update(t) { mesh.scale.setScalar(from + (to - from) * (1 - Math.pow(1 - t, 2))); mesh.material.opacity = opacity * (1 - t); }, dispose() { arenaWorld.scene.remove(mesh); } });
  }
  function cone({ toward, color, halfAngle, duration = .55, radius = 4.9 }) {
    const angle = Math.atan2(toward.x, toward.z);
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 48, -halfAngle, halfAngle * 2), glow(color, .45));
    mesh.rotation.x = -Math.PI / 2; mesh.rotation.z = angle - Math.PI / 2; mesh.position.y = .06; arenaWorld.scene.add(mesh);
    return addEffect({ duration, update(t) { mesh.scale.setScalar(.25 + .75 * Math.min(1, t * 2.5)); mesh.material.opacity = .45 * (1 - t); }, dispose() { arenaWorld.scene.remove(mesh); } });
  }
  function sparkles({ rig, color, duration = 1.1, count = 14 }) {
    const group = new THREE.Group(); const items = [];
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(.05, 0), flat(color, .95));
      const angle = i / count * Math.PI * 2; mesh.userData.seed = [Math.cos(angle) * .45, Math.sin(angle) * .45, Math.random() * .5];
      group.add(mesh); items.push(mesh);
    }
    arenaWorld.scene.add(group);
    return addEffect({ duration, update(t) { group.position.copy(rig.position); items.forEach(mesh => { const [x, z, d] = mesh.userData.seed; mesh.position.set(x, .2 + (t + d) * 1.9, z); mesh.material.opacity = 1 - t; mesh.rotation.y += .2; }); }, dispose() { arenaWorld.scene.remove(group); } });
  }
  function floatText({ position, text, color, duration = 1.2, size = 92 }) {
    const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 160;
    const ctx = canvas.getContext("2d"); ctx.textAlign = "center"; ctx.font = `900 ${size}px system-ui, sans-serif`; ctx.lineWidth = 10; ctx.strokeStyle = "rgba(4,13,18,.9)";
    ctx.strokeText(text, 192, 112); ctx.fillStyle = color; ctx.fillText(text, 192, 112);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
    sprite.scale.set(1.5, .62, 1); sprite.renderOrder = 30; sprite.position.copy(position); arenaWorld.scene.add(sprite);
    return addEffect({ duration, update(t) { sprite.position.y = position.y + t * .8; sprite.material.opacity = 1 - Math.max(0, t - .55) / .45; }, dispose() { arenaWorld.scene.remove(sprite); } });
  }
  function lunge(rig, target, duration = .42, reach = .45, armAmount = 1.1) {
    const home = rig.userData.home.clone(); const goal = home.clone().lerp(target, reach); goal.y = 0;
    const arm = rig.userData.arms.right; const base = arm.userData.basePose[0];
    return addEffect({ duration, update(t) { const k = Math.sin(t * Math.PI); rig.position.lerpVectors(home, goal, k); arm.rotation.x = base - k * armAmount; }, dispose() { rig.position.copy(rig.userData.home); arm.rotation.x = base; } });
  }
  function swing(rig, duration = .5, amount = 1.6, side = "right") {
    const arm = rig.userData.arms[side]; const base = arm.userData.basePose[0];
    return addEffect({ duration, update(t) { arm.rotation.x = base - Math.sin(t * Math.PI) * amount; }, dispose() { arm.rotation.x = base; } });
  }
  function knockback(rig, duration = .7) {
    const home = rig.userData.home.clone(); const away = home.clone().setY(0).normalize().multiplyScalar(.9).add(home);
    return addEffect({ duration, update(t) { const k = t < .3 ? t / .3 : 1 - (t - .3) / .7; rig.position.lerpVectors(home, away, Math.max(0, k)); rig.userData.body.rotation.x = -.35 * Math.max(0, k); }, dispose() { rig.position.copy(rig.userData.home); rig.userData.body.rotation.x = 0; } });
  }
  function flinch(rig, duration = .4) {
    return addEffect({ duration, update(t) { rig.userData.body.position.x = Math.sin(t * 40) * .06 * (1 - t); }, dispose() { rig.userData.body.position.x = 0; } });
  }
  function flashZone(zone) {
    const mesh = boss?.userData.zones[zone]; if (!mesh) return;
    mesh.userData.flashUntil = arenaTime + .6; mesh.userData.flashStrength = 7; mesh.userData.flashColor = 0xffffff;
  }
  function turnBossTo(key) {
    const target = characters[key]; if (!boss || !target) return;
    boss.userData.turnTo = Math.atan2(target.position.x, target.position.z);
  }
  function bossHitFx(amount, color) {
    if (!boss || !amount) return;
    flinch(boss, .35); ringPulse({ position: boss.position, color: hex(color), from: .5, to: 1.6, duration: .45, y: .1 });
    floatText({ position: aboveTag(boss), text: `-${amount}`, color });
  }
  function heroHitFx(map = {}) {
    Object.entries(map).forEach(([key, amount]) => {
      const rig = characters[key]; if (!rig) return;
      flinch(rig, .5); ringPulse({ position: rig.position, color: 0xef6b68, from: .2, to: 1.4, duration: .5, width: .2 });
      floatText({ position: aboveTag(rig), text: `-${amount}`, color: "#ff8c86", size: 80 });
    });
  }

  // Packet in flight: one line from a prop (or the armour) on its way to the game.
  function launchEvent(detail) {
    const rig = characters[detail.role]; if (!rig) return;
    const color = hex(roster[detail.role].color); const duration = Math.max(.2, Number(detail.duration || 400) / 1000);
    const target = characters[detail.target] || boss;
    if (detail.type === "SHOT_SEEN") { projectile({ from: chestOf(boss), to: chestOf(characters.archer), color: 0xf2fbfd, duration, lost: detail.lost, arc: .5, size: .08 }); return; }
    pulseLeds(rig, duration + .2);
    if (detail.action === "DRAW_START") rig.userData.drawing = true;
    if (detail.action === "FIRE") {
      rig.userData.drawing = false;
      // The coded IR shot itself is not a network packet: it reaches the armour almost at once.
      projectile({ from: chestOf(rig), to: chestOf(boss), color, duration: .5, arc: .3, arrow: true });
    }
    projectile({ from: chestOf(rig).add(new THREE.Vector3(0, .6, 0)), to: chestOf(target).add(new THREE.Vector3(0, .6, 0)), color, duration, lost: detail.lost, arc: .7, size: .07 });
  }
  // Accepted / refused / expired results from the game side.
  function impactEvent(detail) {
    const key = detail.key; const rig = characters[key]; const o = detail.outcome || {};
    if (detail.kind === "trap") { bossHitFx(detail.bossDamage, roster.assassin.color); ringPulse({ position: new THREE.Vector3(.9, 0, 1.25), color: hex(roster.assassin.color), from: .2, to: 1.8, duration: .6, width: .25 }); return; }
    if (detail.kind === "expired") { floatText({ position: aboveTag(boss).add(new THREE.Vector3(1.1, -.6, 0)), text: "MISS", color: "#9fb4ba", size: 70 }); return; }
    if (detail.kind !== "accepted" || !rig) return;
    const color = hex(roster[key].color); const target = characters[snapshot.boss.focus] || characters.archer;
    switch (detail.fx) {
      case "block": ringPulse({ position: rig.position, color, from: .4, to: 1.2, duration: .4 }); break;
      case "taunt": turnBossTo(key); swing(rig, .5, -.8, "left"); ringPulse({ position: rig.position, color: 0xef6b68, from: .4, to: 2.4, duration: .9 }); ringPulse({ position: boss.position, color, from: 1.8, to: .6, duration: .7 }); break;
      case "hit": flashZone(o.zone); bossHitFx(o.bossDamage, roster.archer.color); break;
      case "melee": lunge(rig, boss.position, .42, .5); setTimeout(() => bossHitFx(o.bossDamage, roster[key].color), 200); break;
      case "dash": lunge(rig, boss.position, .55, .72, 1.4); ringPulse({ position: rig.position, color, from: .3, to: 1.3, duration: .5 }); setTimeout(() => bossHitFx(o.bossDamage, roster[key].color), 260); break;
      case "heavy": lunge(rig, boss.position, .55, .62, 1.8); ringPulse({ position: rig.position, color, from: .3, to: 1.3, duration: .5 }); setTimeout(() => bossHitFx(o.bossDamage, roster[key].color), 260); break;
      case "trap": swing(rig, .4, .7, "left"); break;
      case "heal": {
        swing(rig, .5, .9); const healed = characters[o.healed?.target];
        if (healed) { sparkles({ rig: healed, color }); ringPulse({ position: healed.position, color, from: .2, to: .9, duration: .8 }); floatText({ position: aboveTag(healed), text: `+${o.healed.amount}`, color: roster[key].color, size: 80 }); }
        break;
      }
      case "bolt": swing(rig, .4, 1.1); projectile({ from: chestOf(rig).add(new THREE.Vector3(0, .8, 0)), to: chestOf(boss), color, duration: .35, arc: .3, size: .18, done: () => bossHitFx(o.bossDamage, roster[key].color) }); break;
      case "team-shield": swing(rig, .6, 1.3); Object.values(characters).filter(item => item !== boss && !item.userData.bench).forEach(item => ringPulse({ position: item.position, color, from: .2, to: 1.1, duration: .7 })); break;
      case "sweep": turnBossTo(snapshot.boss.focus); swing(boss, .55, 1.9); cone({ toward: target.position, color: 0xef6b68, halfAngle: THREE.MathUtils.degToRad(75) }); setTimeout(() => heroHitFx(o.heroDamage), 180); break;
      case "slam": swing(boss, .6, 2.4); ringPulse({ position: boss.position, color: 0xef6b68, from: .6, to: 5.2, duration: .7, width: .14 }); (o.knockback || []).forEach(hero => characters[hero] && knockback(characters[hero])); break;
      case "mark": turnBossTo(snapshot.boss.focus); swing(boss, .4, 1.0); projectile({ from: chestOf(boss).add(new THREE.Vector3(0, .5, 0)), to: chestOf(target), color: 0xef6b68, duration: .4, arc: .6, size: .16, done: () => heroHitFx(o.heroDamage) }); break;
      case "phase": swing(boss, .8, 2.6); pulseLeds(boss, 1.2, 8); ringPulse({ position: boss.position, color: 0x8a5cf0, from: .5, to: 5.6, duration: 1.0, width: .3 }); ringPulse({ position: boss.position, color: 0xef6b68, from: .3, to: 4.6, duration: .8, width: .1 }); setTimeout(() => heroHitFx(o.heroDamage), 300); break;
      default: if (o.bossDamage) bossHitFx(o.bossDamage, roster[key].color);
    }
    if (detail.fx === "block" || detail.fx === "taunt") pulseLeds(rig, .6, 5);
  }

  const arenaRaycaster = new THREE.Raycaster(); const arenaPointer = new THREE.Vector2(); let arenaPointerStart = null;
  arenaWorld.renderer.domElement.addEventListener("pointerdown", event => { arenaPointerStart = [event.clientX, event.clientY]; });
  arenaWorld.renderer.domElement.addEventListener("pointerup", event => {
    const moved = arenaPointerStart ? Math.hypot(event.clientX - arenaPointerStart[0], event.clientY - arenaPointerStart[1]) : 0; arenaPointerStart = null;
    if (moved > 6) return;
    const rect = arenaWorld.renderer.domElement.getBoundingClientRect();
    arenaPointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    arenaRaycaster.setFromCamera(arenaPointer, arenaWorld.camera);
    const hit = arenaRaycaster.intersectObjects(Object.values(characters), true).find(item => item.object.isMesh);
    let node = hit?.object; while (node && !node.userData?.character) node = node.parent;
    if (node) window.dispatchEvent(new CustomEvent("atlas-select-field-role", { detail: { role: node.userData.key } }));
  });
  document.querySelectorAll("[data-arena-view]").forEach(button => button.addEventListener("click", () => {
    const mode = button.dataset.arenaView;
    document.querySelectorAll("[data-arena-view]").forEach(item => item.classList.toggle("is-active", item === button));
    arenaRoot.classList.toggle("is-hidden", mode !== "three"); $("#arena").classList.toggle("is-hidden", mode !== "logic");
    $("#arenaViewStatus").textContent = mode === "three" ? "3D EVENT REPLAY" : "LOGIC / PACKET MAP";
  }));
  $("#threeArenaLoading")?.remove();
  placeRigs(); applySnapshot(window.AtlasFieldUI?.snapshot() || snapshot);

  window.addEventListener("atlas-prop-change", event => rebuildProp(event.detail?.prop));
  window.addEventListener("atlas-select-prop-part", event => {
    const detail = event.detail || {};
    if (detail.prop && detail.prop !== currentProp) rebuildProp(detail.prop);
    if (detail.modelKey && modelKeys().includes(detail.modelKey)) selectPartManually(detail.modelKey);
  });
  window.addEventListener("atlas-language-change", () => { refreshPropLabels(); drawTags(); });
  window.addEventListener("atlas-guided-step-change", event => applyGuidedStep(event.detail?.prop, event.detail?.step));
  window.addEventListener("atlas-guardian-fit-change", event => {
    guardianDiameter = Number(event.detail?.diameterCm || 50);
    if (currentProp === "guardian" && propModel) propModel.scale.setScalar(guardianDiameter / 50);
  });
  window.addEventListener("atlas-field-action", event => launchEvent(event.detail || {}));
  window.addEventListener("atlas-field-impact", event => impactEvent(event.detail || {}));
  window.addEventListener("atlas-field-state", event => applySnapshot(event.detail || {}));
  window.addEventListener("atlas-field-reset", () => { effects.forEach(effect => effect.dispose?.()); effects = []; if (boss) boss.userData.turnTo = 0; });
  if (window.ATLAS_PENDING_PART) {
    const pending = window.ATLAS_PENDING_PART;
    if (pending.prop && pending.prop !== currentProp) rebuildProp(pending.prop);
    if (pending.modelKey && modelKeys().includes(pending.modelKey)) selectPartManually(pending.modelKey);
    window.ATLAS_PENDING_PART = null;
  }

  function animateCharacters(delta) {
    const time = arenaTime;
    Object.values(characters).forEach(rig => {
      const { body, phase } = rig.userData;
      if (!rig.userData.down) body.position.y = Math.sin(time * 2.2 + phase) * .025;
      if (rig.userData.selectRing.visible) rig.userData.selectRing.rotation.z += delta * .8;
      rig.userData.focusRing.rotation.z -= delta * 1.6;
      if (rig.userData.key === "archer") {
        // Drawing the bow pulls the string hand back; release snaps it forward.
        const arm = rig.userData.arms.right; const target = arm.userData.basePose[1] + (rig.userData.drawing ? -.75 : 0);
        arm.rotation.y += (target - arm.rotation.y) * Math.min(1, delta * 12);
      }
    });
    if (boss && boss.userData.turnTo !== undefined) {
      const turn = Math.atan2(Math.sin(boss.userData.turnTo - boss.rotation.y), Math.cos(boss.userData.turnTo - boss.rotation.y));
      boss.rotation.y += turn * Math.min(1, Math.max(0, delta * 6));
    }
    for (const mesh of traps.values()) mesh.children[1].rotation.z += delta * 2;
    arenaWorld.scene.traverse(object => {
      if (!object.isMesh || object.userData.flashUntil === undefined) return;
      const active = time < object.userData.flashUntil;
      const base = object.userData.baseEmissiveIntensity || 0;
      object.material.emissiveIntensity = active ? base + object.userData.flashStrength * (.6 + .4 * Math.sin(time * 30)) : base;
      if (object.userData.flashColor !== undefined && object.material.emissive) object.material.emissive.setHex(active ? object.userData.flashColor : object.userData.baseEmissive || 0);
      if (!active) delete object.userData.flashUntil;
    });
  }

  function animate(now = performance.now()) {
    requestAnimationFrame(animate);
    const rawDelta = lastFrameAt === undefined ? 0 : Math.max(0, (now - lastFrameAt) / 1000); lastFrameAt = now; arenaTime += Math.min(rawDelta, .25);
    const delta = Math.min(rawDelta, .05); const effectDelta = Math.min(rawDelta, .25);
    if (!teardown.active) propModel?.rotateY(.0012);
    animateTeardown(now);
    effects = effects.filter(effect => {
      effect.age += effectDelta; const t = Math.min(1, Math.max(0, effect.age / effect.duration)); effect.update(t);
      if (t < 1) return true; effect.dispose?.(); return false;
    });
    animateCharacters(delta);
    propWorld.controls.update(); arenaWorld.controls.update();
    propWorld.renderer.render(propWorld.scene, propWorld.camera); arenaWorld.renderer.render(arenaWorld.scene, arenaWorld.camera);
  }
  animate();
}

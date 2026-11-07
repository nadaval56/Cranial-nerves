// מפת העצבים בתלת-ממד: מודל מוח אמיתי (גזע המוח, המוחון וקליפת המוח כמעטפת שקופה),
// ועליו 12 זוגות העצבים כצינורות. סיבוב, זום, בחירת עצב בלחיצה.
//
// המודל: public/models/brain-cn.glb — נגזר מ-"Brain for Blender" של Anderson M. Winkler (brainder.org),
// CC BY-SA 3.0, דרך אתר המוח (nadaval56/brain). ראו scripts/make-model.py.
// העצבים: מצוירים כאן, לפי המבנה של גזע המוח במודל. מקומות היציאה מגזע המוח והכיוון אל הפתחים
// בגולגולת נאמנים לאנטומיה; המסלולים עצמם מפושטים, והם נעצרים בערך בפתח היציאה מהגולגולת.
//
// קואורדינטות המודל (מ"מ): x — ימין האדם חיובי, y — למעלה, z — אחורה (z שלילי = לכיוון הפנים).
// גבהים בגזע המוח במודל: המוח המוארך y≈-62…-47, גשר המוח y≈-46…-24 (בולט קדימה, z≈4), המוח התיכון מעל -24.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { byId } from '../../content/nerves.js';

const X0 = -1.5; // קו האמצע של המודל

// לכל עצב: מסלול לצד שמאל של האדם, כ-[d, y, z] כש-d הוא המרחק מקו האמצע. הצד הימני הוא שיקוף.
// r — רדיוס הצינור במ"מ. extra — צורות נוספות (פקעת, גנגליון, מצטלבת). label — נקודת התווית.
const NERVES_3D = {
  olfactory: {
    paths: [{ r: 1.1, dir: 'in', pts: [[8.5, -44.6, -58], [9.5, -43.5, -44], [11, -40.5, -30], [13, -35.5, -17], [15, -31.5, -9]] }],
    extra: [{ type: 'ellipsoid', at: [8.5, -45.2, -60], s: [2.6, 2, 8] }],
    label: [8.5, -48, -70],
  },
  optic: {
    paths: [
      { r: 2, dir: 'in', pts: [[26, -40, -62], [18, -37, -42], [10, -33, -22], [4, -31, -11], [0, -30.5, -7]] },
      { r: 1.7, dir: 'in', pts: [[0, -30.5, -7], [6, -29, -3], [13, -26, 3], [18, -22, 11], [20, -19, 17]] },
    ],
    extra: [{ type: 'ellipsoid', at: [0, -30.5, -7], s: [6, 1.6, 3.6], center: true }],
    label: [28, -42, -66],
  },
  oculomotor: {
    paths: [{ r: 1.3, pts: [[4, -24, 8], [8, -28, 0], [12, -32, -10], [16, -35, -22], [20, -37, -36]] }],
    label: [22, -39, -40],
  },
  trochlear: {
    paths: [{ r: 0.6, pts: [[4, -19, 25], [11, -19, 23], [18, -21, 16], [21, -25, 6], [20, -30, -8], [19, -34, -22], [21, -36, -36]] }],
    label: [24, -24, 22],
  },
  trigeminal: {
    paths: [
      { r: 2.5, pts: [[15, -37, 11], [20, -37, 6], [25, -38, 0]] },
      { r: 1.1, flow: 'sensory', pts: [[27, -38, -3], [25, -37, -16], [22, -37, -32]] },
      { r: 1.2, flow: 'sensory', pts: [[29, -40, -4], [30, -43, -16], [29, -46, -28]] },
      { r: 1.5, pts: [[31, -41, -1], [34, -48, -6], [36, -56, -10]] },
    ],
    extra: [{ type: 'ellipsoid', at: [28.5, -39.5, -2], s: [5, 3, 4] }],
    label: [40, -36, 2],
  },
  abducens: {
    paths: [{ r: 0.8, pts: [[4, -47, 13], [5.5, -42, 2], [7, -36, -5], [11, -33, -14], [16, -34, -26], [20, -36, -38]] }],
    label: [9, -46, -2],
  },
  facial: {
    paths: [{ r: 1.2, pts: [[14, -45.5, 15], [20, -45, 14], [27, -44.5, 13], [33, -44, 12]] }],
    label: [36, -41, 10],
  },
  vestibulocochlear: {
    paths: [{ r: 1.6, pts: [[15.5, -47.5, 18], [21, -47.5, 17.5], [28, -47, 16.5], [34, -46.5, 15.5]] }],
    label: [38, -50, 16],
  },
  glossopharyngeal: {
    paths: [{ r: 0.8, pts: [[10.5, -50.5, 22], [16, -51.5, 22.5], [22, -53, 23], [28, -55, 23.5]] }],
    label: [32, -54, 24],
  },
  vagus: {
    paths: [
      { r: 1.2, pts: [[10, -53.5, 24], [16, -54.5, 24.5], [22, -56, 25], [28, -58, 25.5]] },
      { r: 0.5, pts: [[9.5, -55.5, 25.5], [15, -55.8, 25], [21, -56.5, 25]] },
    ],
    label: [32, -59, 27],
  },
  accessory: {
    paths: [{ r: 0.9, pts: [[6, -78, 34], [7, -70, 33], [8.5, -63, 31], [11, -59, 28], [18, -59.5, 27], [27, -61, 27]] }],
    label: [10, -78, 36],
  },
  hypoglossal: {
    paths: [
      { r: 1, pts: [[5, -54, 24.5], [9, -58, 22.5], [14, -62, 22], [19, -66, 23]] },
      { r: 0.45, pts: [[5, -57, 26], [8, -59, 23.5]] },
      { r: 0.45, pts: [[5.5, -51.5, 23], [8.5, -56, 23]] },
    ],
    label: [21, -70, 23],
  },
};

// עצב 0 (העצב הטרמינלי): רשת דקיקה מתחת לאונה המצחית, פנימה מעצב הריח, מהלוחית המנוקבת אחורה
// אל אזור ה-lamina terminalis. מוצג באפשרות extra: בעמוד הבית ובעמוד שלו.
NERVES_3D.terminal = {
  paths: [{ r: 0.45, flow: null, pts: [[3.5, -45, -62], [4, -44.6, -48], [4.5, -42.5, -34], [5, -38, -22], [4, -33, -12]] }],
  label: [3, -49, -66],
};
const ORDER = ['olfactory', 'optic', 'oculomotor', 'trochlear', 'trigeminal', 'abducens', 'facial', 'vestibulocochlear', 'glossopharyngeal', 'vagus', 'accessory', 'hypoglossal'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const TARGET = new THREE.Vector3(X0, -42, -14);
const VIEWS = {
  ventral: [0, -250, -40],   // מלמטה: הצד הקדמי של גזע המוח, כמו באטלסים
  oblique: [-160, -150, -130], // מלפנים-מלמטה ומהצד
  lateral: [-260, -15, 15],  // מצד שמאל
  front: [0, -40, -260],     // מלפנים
  back: [-150, -60, 230],    // מאחור ומהצד: לעצבים שיוצאים מאחור (IV, XI)
  close: [0, -175, -95],     // מלמטה ומלפנים: לעצב 0
};

const P = ([d, y, z], side) => new THREE.Vector3(X0 + (side === 'L' ? -d : d), y, z);

// הזווית שמראה הכי טוב כל עצב (בעמוד של העצב)
export const BEST_VIEW = {
  olfactory: 'ventral', optic: 'ventral', oculomotor: 'oblique', trochlear: 'lateral', trigeminal: 'oblique', abducens: 'ventral',
  facial: 'oblique', vestibulocochlear: 'oblique', glossopharyngeal: 'oblique', vagus: 'oblique', accessory: 'oblique', hypoglossal: 'ventral',
};
// עצבים שהמוחון מסתיר — בעמוד שלהם המוחון שקוף
export const GHOST_CEREBELLUM = new Set(['trochlear', 'accessory', 'glossopharyngeal', 'vagus', 'vestibulocochlear', 'facial']);

/**
 * labels: 'all' — תווית לכל עצב (עמוד הבית); 'active' — רק לעצב הנבחר (עמוד עצב).
 * view: זווית ההתחלה. active: עצב מודגש מההתחלה.
 */
export async function createBrain3D(container, { onSelect, glbUrl, reducedMotion = false, labels: labelMode = 'all', view = 'ventral', active: initialActive = null, ghostCerebellum = false, extra = false, ariaLabel = 'מודל תלת-ממדי של גזע המוח והמוחון, ועליו 12 זוגות העצבים הקרניאליים. אפשר לבחור עצב גם מרשימת הכפתורים.' }) {
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'b3d-canvas';
  const labelLayer = document.createElement('div');
  labelLayer.className = 'b3d-labels';
  labelLayer.setAttribute('aria-hidden', 'true');
  const legend = document.createElement('p');
  legend.className = 'b3d-legend';
  legend.hidden = true;
  // עצירה והפעלה של תנועת נקודות האור (WCAG 2.2.2: תנועה שנמשכת יותר מ-5 שניות צריכה דרך לעצור אותה)
  const pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'b3d-pause';
  pauseBtn.hidden = true;
  container.append(canvasWrap, labelLayer, legend, pauseBtn);
  let paused = false;
  const setPaused = (v) => {
    paused = v;
    pauseBtn.setAttribute('aria-pressed', String(v));
    pauseBtn.innerHTML = v
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>הפעלת התנועה'
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>עצירת התנועה';
  };
  setPaused(false);
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  // "עצירת אנימציות" בתפריט הנגישות — עוצרת גם כאן, גם אם הופעלה אחרי שהדף נטען
  const html = document.documentElement;
  const mo = new MutationObserver(() => { if (html.classList.contains('a11y-still')) setPaused(true); });
  mo.observe(html, { attributes: true, attributeFilter: ['class'] });
  const legendHtml = (type) => [
    type !== 'motor' && '<span><i class="lg-in"></i>תחושה: אל המוח</span>',
    type !== 'sensory' && '<span><i class="lg-out"></i>פקודה: מהמוח</span>',
  ].filter(Boolean).join('');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasWrap.append(renderer.domElement);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', ariaLabel);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
  camera.position.copy(TARGET).add(new THREE.Vector3(...VIEWS[view]));
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x20242c, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  camera.add(key); key.position.set(0.4, 0.6, 1);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.09;
  controls.minDistance = 70;
  controls.maxDistance = 380;
  controls.enablePan = false;
  // OrbitControls קובע touch-action: none, ואז החלקה אנכית על המודל לא גוללת את העמוד בטלפון.
  // pan-y: החלקה אנכית גוללת, החלקה אופקית מסובבת את המודל
  renderer.domElement.style.touchAction = 'pan-y';

  // ---------- המוח ----------
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xc9b6ae, roughness: 0.8, transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x9b817a, roughness: 0.65, metalness: 0.02 });
  const cblMat = new THREE.MeshStandardMaterial({ color: 0x77707f, roughness: 0.75, transparent: true, opacity: ghostCerebellum ? 0.22 : 0.92, depthWrite: !ghostCerebellum });
  const shell = [];
  const gltf = await new GLTFLoader().loadAsync(glbUrl);
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.computeVertexNormals();
    if (o.name === 'brainstem') o.material = stemMat;
    else if (o.name.startsWith('cerebellum')) o.material = cblMat;
    else { o.material = shellMat; o.renderOrder = 2; shell.push(o); }
  });
  scene.add(gltf.scene);

  // ---------- העצבים ----------
  const nerveMat = () => new THREE.MeshStandardMaterial({ color: 0xf0c46b, emissive: 0x6a4a10, emissiveIntensity: 0.35, roughness: 0.45, transparent: true, opacity: 1 });
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const groups = {};
  const hitMeshes = [];
  const order = extra ? [...ORDER, 'terminal'] : ORDER;
  for (const id of order) {
    const def = NERVES_3D[id];
    const g = new THREE.Group();
    const mat = nerveMat();
    const curves = [];
    for (const side of ['L', 'R']) {
      for (const p of def.paths) {
        const curve = new THREE.CatmullRomCurve3(p.pts.map((pt) => P(pt, side)));
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, p.r, 10, false), mat));
        // קצה מעוגל במקום החיתוך
        const cap = new THREE.Mesh(new THREE.SphereGeometry(p.r, 12, 8), mat);
        cap.position.copy(curve.getPoint(1)); g.add(cap);
        const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, Math.max(3.2, p.r * 2), 6, false), hitMat);
        hit.userData.id = id; g.add(hit); hitMeshes.push(hit);
        curves.push({ curve, dir: p.dir ?? 'out', flow: p.flow === undefined ? byId[id].type : p.flow, r: p.r });
      }
      for (const e of def.extra ?? []) {
        if (e.center && side === 'R') continue;
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat);
        m.position.copy(P(e.at, side)); m.scale.set(...e.s);
        g.add(m);
      }
    }
    g.userData = { id, mat, curves };
    scene.add(g);
    groups[id] = g;
  }

  // ---------- תוויות (HTML מעל הקנבס) ----------
  const labels = order.map((id, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.tabIndex = -1;
    el.className = 'b3d-label';
    el.textContent = ROMAN[i] ?? '0';
    el.dataset.id = id;
    labelLayer.append(el);
    return { id, el, pos: P(NERVES_3D[id].label, 'L') };
  });
  labelLayer.addEventListener('click', (e) => {
    const b = e.target.closest('.b3d-label');
    if (b) onSelect?.(b.dataset.id);
  });

  // ---------- בחירה ----------
  let active = null;
  function highlight(id) {
    active = id;
    for (const [gid, g] of Object.entries(groups)) {
      const m = g.userData.mat;
      const on = gid === id;
      m.color.set(on ? 0xffe2a3 : 0xf0c46b);
      m.emissive.set(on ? 0xffb43a : 0x6a4a10);
      m.emissiveIntensity = on ? 0.55 : 0.35;
      m.opacity = !id || on ? 1 : 0.28;
      m.depthWrite = !id || on;
    }
    for (const l of labels) {
      l.el.classList.toggle('is-active', l.id === id);
      l.el.classList.toggle('is-dim', !!id && l.id !== id);
      l.show = labelMode === 'all' || l.id === id;
    }
    buildPulses(id);
    legend.hidden = !id || reducedMotion;
    pauseBtn.hidden = !id || reducedMotion;
    if (id && byId[id]) legend.innerHTML = legendHtml(byId[id].type);
    if (id && !byId[id]) legend.hidden = pauseBtn.hidden = true;
    needsRender = true;
  }

  // ---------- זרימת המידע: נקודות אור שרצות לאורך העצב הנבחר ----------
  // כחול — מידע תחושתי שנכנס אל המוח; אדום — פקודה שיוצאת מהמוח אל שריר או בלוטה. בעצב מעורב — שניהם.
  // כל מסלול מוגדר עם dir: 'out' (מתחיל בגזע המוח) או 'in' (מתחיל בפריפריה). flow לפי סוג העצב, או לפי המסלול.
  const PULSE = { sensory: 0x38c8ff, motor: 0xff5544 };
  const pulseGroup = new THREE.Group();
  scene.add(pulseGroup);
  let pulses = [];
  const pulseGeo = new THREE.SphereGeometry(1, 12, 8);
  const pulseMats = Object.fromEntries(Object.entries(PULSE).map(([k, c]) => [k, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.95, depthWrite: false })]));
  function buildPulses(id) {
    pulseGroup.clear();
    pulses = [];
    if (!id || reducedMotion) return;
    queueMicrotask(() => stepPulses(0)); // מיקום ראשון — גם כשהתנועה עצורה
    for (const c of groups[id].userData.curves) {
      if (!c.flow) continue; // עצב 0 — התפקיד לא ידוע, אין כיוון זרימה להראות
      const kinds = c.flow === 'mixed' ? ['sensory', 'motor'] : [c.flow];
      const len = c.curve.getLength();
      const n = Math.max(2, Math.round(len / 18));
      kinds.forEach((kind, ki) => {
        for (let i = 0; i < n; i++) {
          const m = new THREE.Mesh(pulseGeo, pulseMats[kind]);
          m.userData.base = Math.max(1.5, c.r * 1.7);
          m.scale.setScalar(m.userData.base);
          pulseGroup.add(m);
          // תחושה זורמת אל המוח, תנועה החוצה ממנו — בהתאם לכיוון שבו המסלול צויר
          const inward = kind === 'sensory';
          const reverse = (c.dir === 'out') === inward;
          pulses.push({ m, curve: c.curve, t: (i + ki * 0.5) / n, speed: 22 / len, reverse });
          m.renderOrder = 5;
        }
      });
    }
  }
  function stepPulses(dt) {
    for (const p of pulses) {
      p.t = (p.t + p.speed * dt) % 1;
      const u = p.reverse ? 1 - p.t : p.t;
      p.m.position.copy(p.curve.getPointAt(u));
      // נדלקות בתחילת הדרך ודועכות בסופה
      const f = Math.min(1, p.t * 6, (1 - p.t) * 6);
      p.m.scale.setScalar(Math.max(0.4, f) * p.m.userData.base);
    }
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; // גרירה — לא לחיצה
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hitMeshes, false)[0];
    onSelect?.(hit ? hit.object.userData.id : null);
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    renderer.domElement.style.cursor = ray.intersectObjects(hitMeshes, false).length ? 'pointer' : 'grab';
  });

  // ---------- תצוגות ----------
  let anim = null;
  function setView(name) {
    const to = TARGET.clone().add(new THREE.Vector3(...VIEWS[name]));
    if (reducedMotion) { camera.position.copy(to); controls.update(); needsRender = true; return; }
    const from = camera.position.clone();
    const t0 = performance.now();
    anim = (now) => {
      const k = Math.min(1, (now - t0) / 700), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      // מעבר על פני כדור סביב המטרה, כדי שהמצלמה לא תעבור דרך המודל
      const a = from.clone().sub(TARGET), b = to.clone().sub(TARGET);
      const len = a.length() + (b.length() - a.length()) * e;
      camera.position.copy(TARGET).add(a.normalize().lerp(b.clone().normalize(), e).normalize().multiplyScalar(len));
      if (k >= 1) anim = null;
    };
  }
  function setShell(mode) {
    for (const m of shell) m.visible = mode !== 'hidden';
    shellMat.opacity = mode === 'solid' ? 1 : 0.09;
    shellMat.transparent = mode !== 'solid';
    shellMat.depthWrite = mode === 'solid';
    shellMat.needsUpdate = true;
    needsRender = true;
  }

  // ---------- לולאת ציור ----------
  let needsRender = true, running = true, raf = 0;
  controls.addEventListener('change', () => { needsRender = true; });
  const v = new THREE.Vector3();
  function resize() {
    const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // במסך צר מתרחקים, כדי שכל העצבים ייכנסו
    camera.fov = w / h < 0.9 ? 40 : 32;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvasWrap);
  resize();
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (frame.last ?? now)) / 1000); frame.last = now;
    if (anim) { anim(now); needsRender = true; }
    if (pulses.length && !paused) { stepPulses(dt); needsRender = true; }
    if (controls.update()) needsRender = true;
    if (!needsRender) return;
    needsRender = false;
    renderer.render(scene, camera);
    const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
    for (const l of labels) {
      v.copy(l.pos).project(camera);
      const behind = v.z > 1;
      l.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
      l.el.hidden = behind || !l.show;
    }
  }
  raf = requestAnimationFrame(frame);
  // עוצרים כשהמפה לא נראית במסך
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !running) { running = true; needsRender = true; raf = requestAnimationFrame(frame); }
    else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(container);

  highlight(initialActive);
  return {
    highlight, setView, setShell,
    dispose() { mo.disconnect(); running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); canvasWrap.remove(); labelLayer.remove(); },
  };
}

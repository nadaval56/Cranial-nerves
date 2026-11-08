// מפות אינטראקטיביות לעמודי העצבים: אזורי העצב החמישי בפנים, מפת הלשון, וענפי עצב הפנים.
// כל מפה: html(opts) — מחרוזת (רצה גם ב-build, כך שהמפה נראית גם בלי JS), ו-init(el) — אינטראקציה בדפדפן.
// עצב מוצג בעמוד לפי השדה diagrams ב-content/nerves.js. מקורות: content/sources.md.

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// כל מפה בנויה כך: איור SVG עם אזורים (data-k), כפתורים לכל אזור, ופאנל הסבר.
function shell({ id, svg, buttons, intro, legend = '' }) {
  return `<div class="dgm" data-dgm="${id}">`
    + `<div class="dgm-fig">${svg}</div>`
    + `<div class="dgm-side">${buttons}${legend}<div class="dgm-info" aria-live="polite">${intro}</div></div></div>`;
}
const btns = (items, label) => `<div class="dgm-btns" role="group" aria-label="${esc(label)}">${items.map((it) =>
  `<button type="button" class="chip dgm-btn" data-k="${it.k}" aria-pressed="false" style="--dc:${it.c}">${it.label}</button>`).join('')}</div>`;

// חיבור משותף: לחיצה על כפתור או על אזור באיור בוחרת אותו; ריחוף בעכבר — תצוגה מקדימה.
// מחזיר api שאפשר לעדכן (intro, render) ולחבר מחדש אחרי החלפת האיור (bindSvg).
function wire(el, intro, render) {
  const box = el.querySelector('.dgm-info');
  let cur = null;
  const api = {
    intro, render,
    show(k) {
      el.querySelectorAll('[data-k]').forEach((x) => {
        const isBtn = x.classList.contains('dgm-btn');
        x.classList.toggle('is-on', x.dataset.k === k);
        x.classList.toggle('is-off', !!k && x.dataset.k !== k && !isBtn);
        if (isBtn) x.setAttribute('aria-pressed', String(x.dataset.k === k));
      });
      box.innerHTML = k ? api.render(k) : api.intro;
    },
    reset() { cur = null; api.show(null); },
    bindSvg() {
      const svg = el.querySelector('.dgm-fig svg');
      svg.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'mouse') return;
        const t = e.target.closest('[data-k]');
        api.show(t ? t.dataset.k : cur);
      });
      svg.addEventListener('pointerleave', () => api.show(cur));
    },
  };
  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-k]');
    if (!t) return;
    cur = cur === t.dataset.k ? null : t.dataset.k;
    api.show(cur);
  });
  api.bindSvg();
  return api;
}

// ---------- כלי ציור משותפים (סגנון מעבדת הפנים) ----------
// מזהים ייחודיים לכל איור, כי בעמוד אחד יכולות להיות שתי מפות (למשל עצב הפנים: ענפים + לשון)
let uidN = 0;
const uid = (p) => `${p}${++uidN}`;
const grad = (id, kind, attrs, stops) => `<${kind} id="${id}"${Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}>`
  + stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join('') + `</${kind}>`;
const SKIN = [['0', '#e2b597'], ['0.55', '#cf9c7e'], ['1', '#a8705a']];
const IRIS = [['0', '#2f5865'], ['0.55', '#4f8696'], ['1', '#2e5562']];
const SCLERA = [['0', '#fbf8f4'], ['1', '#d9cfc6']];
const LIPS = [['0', '#b8615a'], ['0.5', '#a4524b'], ['1', '#c4736a']];
const HAIR = [['0', '#3e2a1f'], ['0.6', '#2a1c14'], ['1', '#20150f']];
// עין מלפנים: לובן, קשתית, אישון, ברק, קו עפעף, ריסים וקמט מעל
function frontEye(u, n, cx, cy, w, mirror) {
  const x0 = cx - w / 2, x1 = cx + w / 2, h = w * 0.24;
  const almond = `M${x0} ${cy} C${x0 + w * 0.28} ${cy - h * 1.35} ${x1 - w * 0.28} ${cy - h * 1.35} ${x1} ${cy} C${x1 - w * 0.28} ${cy + h * 1.05} ${x0 + w * 0.28} ${cy + h * 1.05} ${x0} ${cy} Z`;
  const lid = `M${x0} ${cy} C${x0 + w * 0.28} ${cy - h * 1.35} ${x1 - w * 0.28} ${cy - h * 1.35} ${x1} ${cy}`;
  const lashes = [0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
    const x = x0 + w * t, y = cy - h * 1.35 * (1 - (2 * t - 1) ** 2) * 0.75 - 0.3;
    const dx = (t - 0.5) * 3 * (mirror ? -1 : 1) + (mirror ? -0.8 : 0.8);
    return `M${x.toFixed(1)} ${y.toFixed(1)} l${dx.toFixed(1)} -2.6`;
  }).join(' ');
  return `<clipPath id="${u}-eye${n}"><path d="${almond}"/></clipPath>`
    + `<path d="${almond}" fill="url(#${u}-sclera)" stroke="#a87a64" stroke-width="0.6"/>`
    + `<g clip-path="url(#${u}-eye${n})"><circle cx="${cx}" cy="${cy}" r="${w * 0.19}" fill="url(#${u}-iris)" stroke="#2c4a55" stroke-width="0.9"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${w * 0.085}" fill="#0b0d10"/><circle cx="${cx + w * 0.06}" cy="${cy - w * 0.06}" r="${w * 0.035}" fill="#fff" opacity="0.85"/>`
    + `<path d="${lid}" fill="none" stroke="#7a4a38" stroke-width="2.4" opacity="0.35"/></g>`
    + `<path d="${lid}" fill="none" stroke="#2a1a14" stroke-width="1.7" stroke-linecap="round"/>`
    + `<path d="${lashes}" stroke="#2a1a14" stroke-width="0.9" stroke-linecap="round"/>`
    + `<path d="M${x0 + 2} ${cy - h * 1.15} C${x0 + w * 0.3} ${cy - h * 2.3} ${x1 - w * 0.3} ${cy - h * 2.3} ${x1 - 2} ${cy - h * 1.15}" fill="none" stroke="#8a5843" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>`
    + `<path d="M${x0 + 4} ${cy + h * 0.75} C${x0 + w * 0.35} ${cy + h * 1.25} ${x1 - w * 0.35} ${cy + h * 1.25} ${x1 - 4} ${cy + h * 0.75}" fill="none" stroke="#a06c56" stroke-width="0.9" opacity="0.6"/>`;
}
// סגנון לאזורים צבועים מעל איור "אמיתי": צבע שקוף-למחצה עם קו מתאר, כדי שהעור או הלשון ייראו מתחת
const zoneStyle = (id, base, on) => `<style>
.dgm[data-dgm="${id}"] .dgm-zone { fill: var(--dc); fill-opacity: ${base}; stroke: var(--dc); stroke-opacity: 0.9; stroke-width: 1.4; transition: fill-opacity 0.2s, opacity 0.2s; }
.dgm[data-dgm="${id}"] .dgm-zone:hover, .dgm[data-dgm="${id}"] .dgm-zone.is-on { fill-opacity: ${on}; stroke-width: 2.2; }
.dgm[data-dgm="${id}"] .dgm-zone.is-off { opacity: 0.25; }
.dgm[data-dgm="${id}"] .dgm-tags text { fill: #24140e; paint-order: stroke; stroke: rgba(255, 244, 236, 0.85); stroke-width: 3.5px; stroke-linejoin: round; }
@media (prefers-reduced-motion: reduce) { .dgm[data-dgm="${id}"] .dgm-zone { transition: none; } }
html.a11y-still .dgm[data-dgm="${id}"] .dgm-zone { transition: none; }
</style>`;

// ---------- 1. אזורי העצב החמישי בפנים ----------

const FACE_ZONES = {
  v1: { label: 'V1 · העיני', c: '#6f9ef5', title: 'הענף העיני (V1)',
    area: 'המצח והקרקפת עד קודקוד הראש, העפעף העליון, הקרנית, וגב האף עד הקצה.',
    exit: 'יוצא מהגולגולת דרך הסדק העליון של ארובת העין.', note: 'תחושה בלבד. זה גם הענף שמרגיש את הקרנית ברפלקס הקרנית.' },
  v2: { label: 'V2 · הלסת העליונה', c: '#74d39a', title: 'ענף הלסת העליונה (V2)',
    area: 'העפעף התחתון, הלחי, צד האף, השפה העליונה, השיניים העליונות והחך.',
    exit: 'יוצא דרך החור העגול, ומגיע לפנים דרך פתח מתחת לארובת העין.', note: 'תחושה בלבד.' },
  v3: { label: 'V3 · הלסת התחתונה', c: '#f29b4b', title: 'ענף הלסת התחתונה (V3)',
    area: 'השפה התחתונה, הסנטר, עור הלסת התחתונה, השיניים התחתונות, העור שלפני האוזן ועד הרקה, וגם תחושת מגע בשני השלישים הקדמיים של הלשון.',
    exit: 'יוצא דרך החור הסגלגל.', note: 'הענף היחיד שנושא גם סיבים תנועתיים, לשרירי הלעיסה.' },
  c2: { label: 'זווית הלסת', c: '#8a95a3', title: 'זווית הלסת: לא העצב החמישי',
    area: 'העור שמעל זווית הלסת ומתחת לאוזן.',
    exit: 'מקבל תחושה מעצב צווארי (great auricular nerve, ממקטעי חוט השדרה C2–C3).', note: 'לכן כשבודקים את העצב החמישי, בודקים במצח, בלחי ובסנטר, ולא בזווית הלסת.' },
};

function faceZonesSvg() {
  const u = uid('fz');
  const face = 'M150 28 C214 28 252 74 254 140 C256 176 250 206 242 232 C232 268 214 306 186 328 C172 338 160 342 150 342 C140 342 128 338 114 328 C86 306 68 268 58 232 C50 206 44 176 46 140 C48 74 86 28 150 28 Z';
  const brow = (m) => { const X = (x) => (m ? 300 - x : x); return `M${X(90)} 136 C${X(100)} 125 ${X(118)} 121 ${X(136)} 127 C${X(135)} 131 ${X(133)} 133 ${X(130)} 133 C${X(116)} 128 ${X(102)} 130 ${X(92)} 138 Z`; };
  const ear = (m) => { const X = (x) => (m ? 300 - x : x); return `<path d="M${X(48)} 150 C${X(30)} 146 ${X(24)} 168 ${X(28)} 186 C${X(31)} 202 ${X(38)} 214 ${X(46)} 216 Z" fill="url(#${u}-ear)" stroke="#8e5d48" stroke-width="1.2"/>`
    + `<path d="M${X(44)} 160 C${X(34)} 160 ${X(32)} 176 ${X(35)} 188 C${X(37)} 198 ${X(41)} 204 ${X(45)} 206" fill="none" stroke="#9a634d" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>`; };
  return `<svg class="dgm-svg" viewBox="0 0 300 370" role="img" aria-label="פנים מלפנים, מחולקות לשלושת אזורי התחושה של העצב החמישי" direction="ltr">
  ${zoneStyle('face-zones', 0.32, 0.58)}
  <defs>
    ${grad(`${u}-skin`, 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, SKIN)}
    ${grad(`${u}-ear`, 'radialGradient', { cx: '50%', cy: '45%', r: '60%' }, [['0', '#d29f81'], ['1', '#a06a53']])}
    ${grad(`${u}-neck`, 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#8e5d48'], ['0.4', '#b8846a'], ['1', '#b8846a', 0]])}
    ${grad(`${u}-hair`, 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, HAIR)}
    ${grad(`${u}-shade`, 'radialGradient', { cx: '50%', cy: '40%', r: '55%' }, [['0.6', '#5a3426', 0], ['1', '#5a3426', 0.45]])}
    ${grad(`${u}-blush`, 'radialGradient', {}, [['0', '#d77f6e', 0.32], ['1', '#d77f6e', 0]])}
    ${grad(`${u}-sclera`, 'radialGradient', { cx: '50%', cy: '45%', r: '60%' }, SCLERA)}
    ${grad(`${u}-iris`, 'radialGradient', {}, IRIS)}
    ${grad(`${u}-lips`, 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, LIPS)}
    <clipPath id="${u}-clip"><path d="${face}"/></clipPath>
  </defs>
  <g pointer-events="none">
    <path d="M114 300 L186 300 L192 370 L108 370 Z" fill="url(#${u}-neck)"/>
    ${ear(false)}${ear(true)}
    <path d="${face}" fill="url(#${u}-skin)"/>
    <g clip-path="url(#${u}-clip)">
      <path d="M30 10 H270 V128 C262 104 244 86 216 80 C196 76 176 82 150 82 C124 82 104 76 84 80 C56 86 38 104 30 128 Z" fill="url(#${u}-hair)"/>
      <path d="M84 80 C104 76 124 82 150 82 C176 82 196 76 216 80" fill="none" stroke="#1a110c" stroke-width="2" opacity="0.6"/>
      <path d="M110 40 C130 52 140 64 146 80 M170 38 C178 52 182 66 184 80 M80 60 C96 64 108 72 118 82" fill="none" stroke="#5a3d2c" stroke-width="1.4" opacity="0.6"/>
      <circle cx="96" cy="216" r="30" fill="url(#${u}-blush)"/><circle cx="204" cy="216" r="30" fill="url(#${u}-blush)"/>
      <path d="${face}" fill="url(#${u}-shade)"/>
    </g>
  </g>
  <g clip-path="url(#${u}-clip)">
    <path data-k="v1" class="dgm-zone" style="--dc:${FACE_ZONES.v1.c}" d="M0 0 H300 V146 L184 146 C176 158 172 176 170 196 L164 236 H136 L130 196 C128 176 124 158 116 146 L0 146 Z"/>
    <path data-k="v2" class="dgm-zone" style="--dc:${FACE_ZONES.v2.c}" d="M58 146 H116 C124 158 128 176 130 196 L136 236 H164 L170 196 C172 176 176 158 184 146 H242 C242 190 232 232 222 262 C198 272 174 274 150 274 C126 274 102 272 78 262 C68 232 58 190 58 146 Z"/>
    <path data-k="v3" class="dgm-zone" style="--dc:${FACE_ZONES.v3.c}" d="M0 120 H58 C58 190 68 232 78 262 C102 272 126 274 150 274 C174 274 198 272 222 262 C232 232 242 190 242 120 H300 V370 H0 Z"/>
    <path data-k="c2" class="dgm-zone" style="--dc:${FACE_ZONES.c2.c}" d="M0 232 L52 236 C60 270 74 302 96 334 L60 370 L0 370 Z M300 232 L248 236 C240 270 226 302 204 334 L240 370 L300 370 Z"/>
  </g>
  <g pointer-events="none">
    <path d="${face}" fill="none" stroke="#8e5d48" stroke-width="1.6"/>
    <path d="${brow(false)}" fill="#4a3022" stroke="#3a251a" stroke-width="0.8"/><path d="${brow(true)}" fill="#4a3022" stroke="#3a251a" stroke-width="0.8"/>
    ${frontEye(u, 1, 114, 158, 38, false)}${frontEye(u, 2, 186, 158, 38, true)}
    <path d="M143 166 C141 194 137 212 133 226 M157 166 C159 194 163 212 167 226" fill="none" stroke="#9a634d" stroke-width="1.2" opacity="0.45"/>
    <path d="M150 170 C151 196 152 212 151 222" fill="none" stroke="#f3d2bc" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
    <path d="M131 226 C128 234 136 240 143 236 C146 240 154 240 157 236 C164 240 172 234 169 226" fill="none" stroke="#8a5843" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="141" cy="233" rx="3.6" ry="2" fill="#6e3f30" opacity="0.7"/><ellipse cx="159" cy="233" rx="3.6" ry="2" fill="#6e3f30" opacity="0.7"/>
    <path d="M118 270 C128 265 140 262 146 265 C148 263 152 263 154 265 C160 262 172 265 182 270 C168 273 160 274 150 274 C140 274 132 273 118 270 Z" fill="url(#${u}-lips)" stroke="#7e3c35" stroke-width="0.9"/>
    <path d="M120 271 C132 286 168 286 180 271 C166 275 134 275 120 271 Z" fill="url(#${u}-lips)" stroke="#7e3c35" stroke-width="0.9"/>
    <path d="M119 270.5 C134 274 166 274 181 270.5" fill="none" stroke="#4a1f1b" stroke-width="1.4"/>
  </g>
  <g class="dgm-tags" text-anchor="middle">
    <text x="150" y="104">V1</text><text x="96" y="214">V2</text><text x="204" y="214">V2</text><text x="150" y="316">V3</text>
  </g>
</svg>`;
}

const FACE_INTRO = '<p>לחצו על אזור בפנים או על אחד הכפתורים. כל ענף של העצב החמישי מרגיש שליש אחר של הפנים, והגבולות ביניהם חדים יחסית.</p>';
const faceInfo = (k) => { const z = FACE_ZONES[k]; return `<p class="dgm-title" style="--dc:${z.c}">${z.title}</p><p>${z.area}</p><p class="muted">${z.exit}</p><p>${z.note}</p>`; };

// ---------- 2. מפת הלשון ----------

const TONGUE_NERVES = {
  V: { roman: 'V3', name: 'העצב הלשוני (ענף של V3)', c: '#f29b4b' },
  VII: { roman: 'VII', name: 'עצב הפנים (דרך עצב מיתר התוף)', c: '#ee7fc0' },
  IX: { roman: 'IX', name: 'העצב הלשוני-לועי', c: '#74d39a' },
  X: { roman: 'X', name: 'העצב התועה', c: '#6f9ef5' },
  XII: { roman: 'XII', name: 'העצב התת-לשוני', c: '#c8dc6a' },
};
// מי אחראי על כל אזור בכל מצב: front — שני השלישים הקדמיים, back — השליש האחורי, root — בסיס הלשון והמכסה של הגרון
const TONGUE_MODES = {
  taste: { label: 'טעם', front: 'VII', back: 'IX', root: 'X',
    text: 'הטעם מגיע למוח בשלושה עצבים שונים: מהחלק הקדמי בעצב הפנים, מהחלק האחורי (כולל פטמות הטעם הגדולות שבצורת V) בעצב הלשוני-לועי, ומבסיס הלשון וממכסה הגרון בעצב התועה.' },
  touch: { label: 'מגע וכאב', front: 'V', back: 'IX', root: 'X',
    text: 'מגע, כאב וחום בחלק הקדמי מגיעים דרך ענף של העצב החמישי, כך שבאותו חלק של הלשון הטעם והמגע עוברים בעצבים שונים. מהחלק האחורי הם מגיעים בעצב הלשוני-לועי.' },
  move: { label: 'תנועה', front: 'XII', back: 'XII', root: 'XII',
    text: 'כל שרירי הלשון מקבלים פקודות מהעצב התת-לשוני (XII), חוץ משריר אחד, palatoglossus, שמחבר את הלשון לחך ומקבל פקודות מהעצב התועה.' },
};
const TONGUE_PART = { front: 'שני השלישים הקדמיים', back: 'השליש האחורי', root: 'בסיס הלשון ומכסה הגרון' };

function tongueSvg(mode) {
  const m = TONGUE_MODES[mode];
  const u = uid('tg');
  const fill = (part) => `style="--dc:${TONGUE_NERVES[m[part]].c}"`;
  const body = 'M64 92 C70 72 96 64 150 64 C204 64 230 72 236 92 C248 170 240 262 216 312 C198 350 176 364 150 364 C124 364 102 350 84 312 C60 262 52 170 64 92 Z';
  const root = 'M112 30 C120 14 180 14 188 30 C196 46 176 62 150 62 C124 62 104 46 112 30 Z';
  // מרקם של פטמות קטנות (fungiform): נקודות קבועות, לא אקראיות, כדי שה-build והדפדפן יציירו אותו דבר
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const dots = Array.from({ length: 320 }, () => {
    const x = 56 + rnd() * 188, y = 68 + rnd() * 296;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + rnd() * 1.1).toFixed(2)}"/>`;
  }).join('');
  const papillae = [[104, 132], [122, 142], [140, 150], [160, 150], [178, 142], [196, 132], [150, 122]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="6.2" fill="#e8a39d" stroke="#8e3f3f" stroke-width="1.1"/><circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="#a65450" stroke-width="0.8" opacity="0.8"/><circle cx="${x - 1.6}" cy="${y - 1.8}" r="1.3" fill="#fff" opacity="0.45"/>`).join('');
  return `<svg class="dgm-svg" viewBox="0 0 300 380" role="img" aria-label="הלשון מלמעלה, מחולקת לחלק קדמי, אחורי ובסיס" direction="ltr">
  ${zoneStyle('tongue', 0.5, 0.78)}
  <defs>
    ${grad(`${u}-body`, 'radialGradient', { cx: '50%', cy: '58%', r: '62%' }, [['0', '#eba39c'], ['0.6', '#d98a84'], ['1', '#b25a57']])}
    ${grad(`${u}-root`, 'radialGradient', { cx: '50%', cy: '45%', r: '65%' }, [['0', '#d07a75'], ['1', '#97464a']])}
    ${grad(`${u}-edge`, 'radialGradient', { cx: '50%', cy: '55%', r: '58%' }, [['0.7', '#5a1f22', 0], ['1', '#5a1f22', 0.55]])}
    ${grad(`${u}-gloss`, 'radialGradient', { cx: '42%', cy: '62%', r: '30%' }, [['0', '#fff', 0.28], ['1', '#fff', 0]])}
    ${grad(`${u}-shadow`, 'radialGradient', {}, [['0', '#000', 0.55], ['1', '#000', 0]])}
    <clipPath id="${u}-clip"><path d="${body}"/></clipPath>
  </defs>
  <g pointer-events="none">
    <ellipse cx="150" cy="220" rx="118" ry="160" fill="url(#${u}-shadow)"/>
    <path d="${root}" fill="url(#${u}-root)"/>
    <path d="${body}" fill="url(#${u}-body)"/>
  </g>
  <path data-k="root" class="dgm-zone" ${fill('root')} d="${root}"/>
  <path data-k="back" class="dgm-zone" ${fill('back')} d="M64 92 C70 72 96 64 150 64 C204 64 230 72 236 92 L242 128 L150 168 L58 128 Z"/>
  <path data-k="front" class="dgm-zone" ${fill('front')} d="M58 128 L150 168 L242 128 C248 190 238 262 216 312 C198 350 176 364 150 364 C124 364 102 350 84 312 C62 262 52 190 58 128 Z"/>
  <g pointer-events="none">
    <g clip-path="url(#${u}-clip)">
      <g fill="#7a2c2e" opacity="0.28">${dots}</g>
      <path d="${body}" fill="url(#${u}-edge)"/>
      <ellipse cx="128" cy="250" rx="52" ry="70" fill="url(#${u}-gloss)"/>
    </g>
    <path d="${root}" fill="none" stroke="#6e2a2c" stroke-width="1.6"/>
    <path d="M128 40 C140 46 160 46 172 40" fill="none" stroke="#6e2a2c" stroke-width="1.2" opacity="0.6"/>
    <path d="${body}" fill="none" stroke="#6e2a2c" stroke-width="1.8"/>
    <path d="M58 128 L150 168 L242 128" fill="none" stroke="#5a1f22" stroke-width="2" stroke-dasharray="5 4" opacity="0.8"/>
    <path d="M150 176 C149 230 151 290 150 340" fill="none" stroke="#7a2c2e" stroke-width="3.2" stroke-linecap="round" opacity="0.4"/>
    <path d="M152.5 178 C151.5 230 153.5 290 152.5 336" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.25"/>
    ${papillae}
  </g>
  <g class="dgm-tags" text-anchor="middle">
    <text x="150" y="42">${TONGUE_NERVES[m.root].roman}</text>
    <text x="150" y="104">${TONGUE_NERVES[m.back].roman}</text>
    <text x="150" y="262">${TONGUE_NERVES[m.front].roman}</text>
  </g>
  <g class="dgm-small" text-anchor="middle"><text x="150" y="378">קצה הלשון</text><text x="150" y="10">↑ לכיוון הגרון</text></g>
</svg>`;
}
const tongueLegend = (mode) => {
  const m = TONGUE_MODES[mode];
  const used = [...new Set([m.front, m.back, m.root])];
  return `<ul class="dgm-legend">${used.map((n) => `<li><i style="--dc:${TONGUE_NERVES[n].c}"></i><b>${TONGUE_NERVES[n].roman}</b> ${TONGUE_NERVES[n].name}</li>`).join('')}</ul>`;
};
const tongueInfo = (mode, k) => {
  const m = TONGUE_MODES[mode]; const n = TONGUE_NERVES[m[k]];
  return `<p class="dgm-title" style="--dc:${n.c}">${TONGUE_PART[k]} · ${m.label}</p><p><b>${n.roman}</b> · ${n.name}.</p><p class="muted">${m.text}</p>`;
};

// ---------- 3. ענפי עצב הפנים ----------

const BRANCHES = {
  temporal: { title: 'הענף הרקתי', label: 'רקתי', en: 'Temporal', c: '#6f9ef5', d: 'M326 572 C314 528 300 486 284 452 C266 412 242 372 214 336 C204 322 194 312 182 302', muscles: 'שריר המצח והחלק העליון של השריר הטבעתי של העין.', action: 'הרמת גבות וקימוט המצח.' },
  zygomatic: { title: 'הענף הזיגומטי', label: 'זיגומטי', en: 'Zygomatic', c: '#74d39a', d: 'M326 576 C300 546 274 506 248 474 C232 456 214 440 196 428', muscles: 'השריר הטבעתי של העין.', action: 'עצימת עיניים חזקה.' },
  buccal: { title: 'הענף הבוקלי', label: 'בוקלי', en: 'Buccal', c: '#ee7fc0', d: 'M326 581 C292 576 254 566 218 560 C190 556 162 552 136 548', muscles: 'שרירי הלחי (buccinator) והשרירים שמרימים את השפה העליונה וזוויות הפה.', action: 'חיוך, ניפוח לחיים, שריקה.' },
  mandibular: { title: 'ענף שפת הלסת', label: 'שפת הלסת', en: 'Marginal mandibular', c: '#f29b4b', d: 'M326 586 C320 626 302 662 270 686 C238 708 196 708 166 690 C152 680 144 668 140 656', muscles: 'השרירים של השפה התחתונה והסנטר.', action: 'הורדת השפה התחתונה, "פרצוף עצוב".' },
  cervical: { title: 'הענף הצווארי', label: 'צווארי', en: 'Cervical', c: '#c8dc6a', d: 'M328 590 C340 636 342 690 334 740 C328 778 318 812 306 846', muscles: 'שריר הצוואר הדק (platysma).', action: 'מתיחת עור הצוואר כלפי מטה.' },
};

function branchesSvg() {
  // בסיס: תצלום של ראש פסל (אוגוסטוס, Getty Museum, CC0) בפרופיל שמאלי; הרקע הוסר.
  // הקואורדינטות במערכת של התמונה (720×998). העצב יוצא מהגולגולת (החור הסטילומסטואידי) מתחת ולפני האוזן,
  // חודר לבלוטת הפרוטיד ומתפצל בה לחמישה ענפים.
  const paths = Object.entries(BRANCHES).map(([k, b]) => `<g data-k="${k}" class="dgm-branch" style="--dc:${b.c}"><path class="dgm-hit" d="${b.d}"/><path class="dgx-case" d="${b.d}"/><path d="${b.d}"/></g>`).join('');
  return `<svg class="dgm-svg dgm-photo" viewBox="20 150 690 740" role="img" aria-label="ראש של פסל בפרופיל, ועליו חמשת הענפים של עצב הפנים שיוצאים מבלוטת הפרוטיד: רקתי, זיגומטי, בוקלי, שפת הלסת וצווארי" direction="ltr" style="max-width:420px">
  <style>
  .dgm[data-dgm="facial-branches"] .dgm-branch path:not(.dgm-hit) { stroke-width: 9; }
  .dgm[data-dgm="facial-branches"] .dgm-branch:hover path:not(.dgm-hit), .dgm[data-dgm="facial-branches"] .dgm-branch.is-on path:not(.dgm-hit) { stroke-width: 13; }
  .dgm[data-dgm="facial-branches"] .dgm-branch .dgx-case { stroke: #1c120c; stroke-width: 15; opacity: 0.75; filter: none; }
  .dgm[data-dgm="facial-branches"] .dgm-branch:hover .dgx-case, .dgm[data-dgm="facial-branches"] .dgm-branch.is-on .dgx-case { stroke-width: 19; }
  .dgm[data-dgm="facial-branches"] .dgm-branch .dgm-hit { stroke-width: 44; }
  .dgm[data-dgm="facial-branches"] .dgm-origin { stroke-width: 3; }
  .dgm[data-dgm="facial-branches"] .dgm-small text { fill: #1c120c; font-size: 26px; font-weight: 700; paint-order: stroke; stroke: rgba(255, 246, 232, 0.92); stroke-width: 7px; stroke-linejoin: round; }
  </style>
  <image href="./images/augustus-profile.webp" x="0" y="0" width="720" height="998" preserveAspectRatio="xMidYMid meet"/>
  <path d="M296 470 C326 462 356 472 366 500 C374 526 372 560 366 590 C360 620 352 644 336 654 C318 664 300 652 292 630 C284 604 282 572 282 540 C282 508 284 482 296 470 Z" fill="rgba(240, 196, 107, 0.38)" stroke="rgba(120, 80, 25, 0.9)" stroke-width="3" stroke-dasharray="8 5" pointer-events="none"/>
  <path d="M350 566 C342 572 334 576 326 579" fill="none" stroke="#1c120c" stroke-width="15" stroke-linecap="round" opacity="0.75" pointer-events="none"/>
  <path d="M350 566 C342 572 334 576 326 579" fill="none" stroke="var(--nerve)" stroke-width="9" stroke-linecap="round" pointer-events="none"/>
  ${paths}
  <circle class="dgm-origin" cx="350" cy="566" r="11"/>
  <g class="dgm-small"><text x="372" y="700" text-anchor="start">בלוטת הפרוטיד</text></g>
</svg>`;
}
const branchesInfo = (k) => { const b = BRANCHES[k]; return `<p class="dgm-title" style="--dc:${b.c}">${b.title} <span class="muted" dir="ltr" lang="en">(${b.en})</span></p><p><b>שרירים:</b> ${b.muscles}</p><p><b>תנועה:</b> ${b.action}</p>`; };
const BRANCHES_INTRO = '<p>עצב הפנים יוצא מהגולגולת מתחת לאוזן, חודר לבלוטת הפרוטיד ומתפצל בתוכה לחמישה ענפים. לחצו על ענף כדי לראות אילו שרירים הוא מפעיל.</p><p class="muted">משפט זיכרון לחמשת הענפים, לפי הסדר מלמעלה למטה: <span dir="ltr" lang="en">To Zanzibar By Motor Car</span> (Temporal, Zygomatic, Buccal, Marginal mandibular, Cervical).</p>';

// ---------- רישום ----------

export const DIAGRAMS = {
  'face-zones': {
    title: 'מפת התחושה של הפנים',
    html: () => shell({ id: 'face-zones', svg: faceZonesSvg(), intro: FACE_INTRO,
      buttons: btns(Object.entries(FACE_ZONES).map(([k, z]) => ({ k, label: z.label, c: z.c })), 'אזורי העצב החמישי') }),
    init: (el) => { wire(el, FACE_INTRO, faceInfo); },
  },
  'facial-branches': {
    title: 'חמשת הענפים בפנים',
    html: () => shell({ id: 'facial-branches', svg: branchesSvg(), intro: BRANCHES_INTRO,
      buttons: btns(Object.entries(BRANCHES).map(([k, b]) => ({ k, label: b.label, c: b.c })), 'ענפי עצב הפנים') }),
    init: (el) => { wire(el, BRANCHES_INTRO, branchesInfo); },
  },
  tongue: {
    title: 'מפת הלשון: מי מרגיש, מי טועם, מי מזיז',
    html: ({ mode = 'taste' } = {}) => {
      const modes = `<div class="dgm-modes" role="group" aria-label="מה מציגים">${Object.entries(TONGUE_MODES).map(([k, m]) =>
        `<button type="button" class="chip" data-mode="${k}" aria-pressed="${k === mode}">${m.label}</button>`).join('')}</div>`;
      return shell({ id: 'tongue', svg: tongueSvg(mode), intro: `<p>${TONGUE_MODES[mode].text}</p>`, buttons: modes, legend: tongueLegend(mode) })
        .replace('data-dgm="tongue"', `data-dgm="tongue" data-mode="${mode}"`);
    },
    init: (el) => {
      let mode = el.dataset.mode;
      const api = wire(el, `<p>${TONGUE_MODES[mode].text}</p>`, (k) => tongueInfo(mode, k));
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-mode]');
        if (!b || b.dataset.mode === mode) return;
        mode = b.dataset.mode;
        el.querySelector('.dgm-fig').innerHTML = tongueSvg(mode);
        el.querySelector('.dgm-legend').outerHTML = tongueLegend(mode);
        el.querySelectorAll('button[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === mode)));
        api.intro = `<p>${TONGUE_MODES[mode].text}</p>`;
        api.render = (k) => tongueInfo(mode, k);
        api.bindSvg();
        api.reset();
      });
    },
  },
};

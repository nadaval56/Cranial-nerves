// "קליניקה": רשימת מקרים, ומקרה אחד בכל פעם לפי הכתובת (#case-<id>), כדי שאפשר יהיה לקשר למקרה מסוים.
// מקרה = ביקור בארבע לשוניות, בכל סדר: שיחה (שאלות, כמו צ'אט) · מדדים (מוניטור עם מכשירים נפרדים ואק"ג)
// · בדיקה (איור של המטופל: לוחצים על אזור ומקבלים רק את הבדיקות שלו) · התיק (כל מה שנאסף).
// אחר כך "אני מוכן לאבחנה": שאלה 1 (אילו עצבים) → שאלה 2 (איפה) → סיכום הבדיקה והסבר. שום דבר לא נשמר.
// על הכפתורים לא כתוב איזה עצב נבדק, כדי לא לרמוז. העצבים מופיעים רק בסיכום.
// בכל מקרה מוגרל אחד משלושה מטופלים (שם, מין, גיל וסיפור משלו; a בלי מסיחים, b ו-c עם מסיחים מ-content/distractors.js).
// #case-<id>/b = מטופל קבוע, לשיתוף. הטקסטים מותאמים למין המטופל דרך tpl (src/lib/persona.js).
import { CASES, LEVELS } from '../../content/cases.js';
import { distractorById } from '../../content/distractors.js';
import { ACTIONS, REGIONS, DEVICES, actionById, groupById } from '../../content/clinic-actions.js';
import { NERVES, byId } from '../../content/nerves.js';
import { esc } from '../lib/render.js';
import { caseCards, caseSummary } from '../lib/clinic.js';
import { brainstemSvg } from '../lib/brainstem.js';
import { ecgSvg } from '../lib/ecg.js';
import { SITE } from '../config.js';
import { tpl, firstName, initials } from '../lib/persona.js';

const root = document.getElementById('clinic-root');
const list = document.getElementById('case-list');
const head = document.getElementById('clinic-head');
const how = document.querySelector('.clinic-how');
if (!list.firstElementChild) list.innerHTML = caseCards(CASES);

const view = document.createElement('div');
view.className = 'case-view';
view.hidden = true;
root.append(view);

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
const behavior = () => (reduced() ? 'auto' : 'smooth');
const focusEl = (el, scroll = true) => { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); if (scroll) el.scrollIntoView({ behavior: behavior(), block: 'start' }); };
const baseTitle = document.title;
const wide = () => matchMedia('(min-width: 860px)').matches;

const HISTORY = ACTIONS.filter((a) => a.group === 'history');
const regionActs = (r) => ACTIONS.filter((a) => a.region === r);
const kindOf = (id) => (actionById[id].group === 'history' ? 'talk' : actionById[id].group === 'vitals' ? 'vitals' : 'exam');
const CNS_LABEL = 'פגיעה במוח או בגזע המוח (מערכת העצבים המרכזית)';
const nervesTag = (id) => (actionById[id].nerves ? ` <span class="debrief-nerves" dir="ltr">(${esc(actionById[id].nerves)})</span>` : '');

// מה שרץ ברקע במקרה הפתוח (המוניטור): עוצרים כשעוזבים את המקרה
let teardown = null;
const stopCase = () => { if (teardown) { teardown(); teardown = null; } };

// מטופלים: שלושה לכל מקרה. a בלי מסיחים, b ו-c עם המסיחים שלהם
const randomPatient = (c, not) => { const ps = c.patients.filter((p) => p.id !== not); return ps[Math.floor(Math.random() * ps.length)].id; };

function showList(focusId) {
  stopCase();
  view.hidden = true; view.innerHTML = '';
  list.hidden = false; head.hidden = false; how.hidden = false;
  document.title = baseTitle;
  const link = focusId && list.querySelector(`[data-case="${focusId}"]`);
  if (link) link.focus();
}

// ---------- איור המטופל בלשונית "בדיקה" ----------
// מבט מלפנים: ראש, צוואר, כתפיים וזרועות. כל אזור הוא כפתור, ולכל אזור תווית בצד עם קו מוביל.
const SPOTS = {
  face: { shape: '<ellipse cx="220" cy="128" rx="58" ry="84"/>', label: [70, 76], to: [168, 84] },
  eyes: { shape: '<rect x="176" y="100" width="88" height="30" rx="14"/>', label: [370, 112], to: [264, 115] },
  nose: { shape: '<ellipse cx="220" cy="150" rx="15" ry="19"/>', label: [370, 150], to: [235, 150] },
  mouth: { shape: '<ellipse cx="220" cy="183" rx="28" ry="15"/>', label: [370, 188], to: [248, 184] },
  ears: { shape: '<ellipse cx="148" cy="130" rx="13" ry="24"/><ellipse cx="292" cy="130" rx="13" ry="24"/>', label: [70, 130], to: [135, 130] },
  neck: { shape: '<path d="M194 206 L246 206 L250 252 L318 268 L320 286 L120 286 L122 268 L190 252 Z"/>', label: [370, 240], to: [262, 256] },
  skin: { shape: '<circle cx="220" cy="324" r="22"/>', label: [370, 320], to: [242, 324] },
  limbs: { shape: '<path d="M96 276 L124 270 L130 398 L98 398 Z"/><path d="M316 270 L344 276 L342 398 L310 398 Z"/>', label: [70, 330], to: [104, 330] },
};
function bodySvg() {
  // הפנים קודם, כדי שהאזורים הקטנים שבתוכם (עיניים, אף, פה) ייצאו מעליהם ויקבלו את הלחיצה
  const spots = [...REGIONS].sort((a, b) => (b.id === 'face') - (a.id === 'face')).map((r) => {
    const s = SPOTS[r.id];
    const [lx, ly] = s.label; const [tx, ty] = s.to;
    const w = r.label.length * 7.4 + 26;
    const lineX = lx > 220 ? lx - w / 2 : lx + w / 2;
    return `<g class="spot" data-region="${r.id}" role="button" tabindex="0" aria-label="בדיקה: ${esc(r.label)}">`
      + `<g class="spot-area">${s.shape}</g><line class="spot-lead" x1="${lineX}" y1="${ly}" x2="${tx}" y2="${ty}"/>`
      + `<rect class="spot-pill" x="${lx - w / 2}" y="${ly - 14}" width="${w}" height="28" rx="14"/><text class="spot-text" x="${lx}" y="${ly + 5}" text-anchor="middle">${esc(r.label)}</text></g>`;
  }).join('');
  return `<svg class="body-svg" viewBox="0 0 440 400" role="group" aria-label="המטופל, מלפנים. בחרו אזור לבדיקה">
    <defs>
      <radialGradient id="bd-skin" cx="50%" cy="40%" r="62%"><stop offset="0" stop-color="#e2b597"/><stop offset="0.6" stop-color="#cf9c7e"/><stop offset="1" stop-color="#a8705a"/></radialGradient>
      <linearGradient id="bd-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99579"/><stop offset="1" stop-color="#8e5d48" stop-opacity="0.15"/></linearGradient>
      <linearGradient id="bd-shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b5266"/><stop offset="1" stop-color="#1c2731" stop-opacity="0.2"/></linearGradient>
      <linearGradient id="bd-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e2a1f"/><stop offset="1" stop-color="#20150f"/></linearGradient>
    </defs>
    <g class="body-art" aria-hidden="true">
      <path d="M120 270 Q220 236 320 270 L344 280 L350 400 L90 400 L96 280 Z" fill="url(#bd-shirt)"/>
      <path d="M190 200 L250 200 L254 250 Q220 268 186 250 Z" fill="url(#bd-body)"/>
      <path d="M186 250 Q220 274 254 250 L262 262 Q220 290 178 262 Z" fill="#c99579" opacity="0.55"/>
      <ellipse cx="148" cy="130" rx="12" ry="22" fill="#c48d70"/><ellipse cx="292" cy="130" rx="12" ry="22" fill="#c48d70"/>
      <path d="M150 140 Q144 130 150 120" fill="none" stroke="#8e5d48" stroke-width="2"/><path d="M290 140 Q296 130 290 120" fill="none" stroke="#8e5d48" stroke-width="2"/>
      <ellipse cx="220" cy="128" rx="68" ry="86" fill="url(#bd-skin)"/>
      <path d="M152 112 Q148 48 220 40 Q292 48 288 112 Q282 72 252 66 Q220 58 188 66 Q158 72 152 112 Z" fill="url(#bd-hair)"/>
      <path d="M180 100 Q194 92 208 98" fill="none" stroke="#4a3022" stroke-width="4" stroke-linecap="round"/><path d="M232 98 Q246 92 260 100" fill="none" stroke="#4a3022" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="194" cy="116" rx="13" ry="7" fill="#f6efe8"/><ellipse cx="246" cy="116" rx="13" ry="7" fill="#f6efe8"/>
      <circle cx="194" cy="116" r="5.5" fill="#4f8696"/><circle cx="246" cy="116" r="5.5" fill="#4f8696"/>
      <circle cx="194" cy="116" r="2.4" fill="#111"/><circle cx="246" cy="116" r="2.4" fill="#111"/>
      <path d="M181 113 Q194 106 207 113" fill="none" stroke="#5a3426" stroke-width="1.6"/><path d="M233 113 Q246 106 259 113" fill="none" stroke="#5a3426" stroke-width="1.6"/>
      <path d="M214 120 Q212 146 206 156 Q220 164 234 156 Q228 146 226 120" fill="none" stroke="#a8705a" stroke-width="2" stroke-linecap="round"/>
      <path d="M200 182 Q220 176 240 182 Q220 194 200 182 Z" fill="#b8615a"/>
      <ellipse cx="184" cy="160" rx="16" ry="9" fill="#d77f6e" opacity="0.18"/><ellipse cx="256" cy="160" rx="16" ry="9" fill="#d77f6e" opacity="0.18"/>
      <path d="M96 280 Q104 268 124 270 L130 398 L98 398 Z" fill="url(#bd-body)"/><path d="M316 270 Q336 268 344 280 L342 398 L310 398 Z" fill="url(#bd-body)"/>
    </g>
    ${spots}
  </svg>`;
}

function openCase(c, variant) {
  stopCase();
  const idx = CASES.indexOf(c);
  const next = CASES[(idx + 1) % CASES.length];
  const P = c.patients.find((p) => p.id === variant) ?? c.patients[0];
  variant = P.id;
  const ds = P.distractors.map((id) => distractorById[id]);
  const T = (str) => tpl(str, P);
  // התשובה: של המקרה, ואחריה של המסיח, ואחריה התשובה הרגילה. תוספות (add) נכתבות אחרי התשובה של המקרה
  // התשובה: של המטופל, ואחריה של המקרה, ואחריה של המסיח, ואחריה התשובה הרגילה. הכול מותאם למין המטופל
  const answer = (id) => T(rawAnswer(id));
  const rawAnswer = (id) => {
    const adds = ds.map((d) => d.add?.[id]).filter(Boolean);
    const own = P.exam?.[id] ?? c.exam[id];
    if (own) return adds.length ? `${own} בנוסף: ${adds.join(' ')}` : own;
    const dx = ds.find((d) => d.exam?.[id]);
    if (dx) return dx.exam[id];
    if (adds.length) return adds.join(' ');
    return actionById[id].normal;
  };
  list.hidden = true; head.hidden = true; how.hidden = true;
  view.hidden = false;
  document.title = `${c.title} · קליניקה · ${SITE.name}`;

  const TABS = [
    { id: 'talk', label: 'שיחה' },
    { id: 'vitals', label: 'מדדים' },
    { id: 'exam', label: 'בדיקה' },
    { id: 'chart', label: 'התיק' },
  ];

  view.innerHTML = `<nav class="breadcrumb case-crumb" aria-label="נתיב"><a href="#" data-back>קליניקה</a> / מקרה ${idx + 1}</nav>`
    + `<article class="case" aria-labelledby="case-h">`
    + `<p class="case-meta"><span class="case-num">מקרה ${idx + 1} מתוך ${CASES.length}</span><span class="case-level case-level-${c.level}">${LEVELS[c.level]}</span><button type="button" class="btn btn-ghost case-reroll" data-reroll>למטופל אחר</button><button type="button" class="btn btn-primary case-ready-mini" data-ready>אני מוכן לאבחנה</button></p>`
    + `<h1 id="case-h">${esc(c.title)}</h1>`
    + `<div class="case-patient"><span class="pt-avatar pt-${P.sex}" aria-hidden="true">${esc(initials(P))}</span><p class="pt-id"><strong>${esc(P.name)}</strong><span class="muted">${T('{בן|בת}')} ${P.age}</span></p></div>`
    + `<p class="lead case-story">${esc(T(P.story))}</p>`
    + `<div class="case-bar"><div class="case-tabs" role="tablist" aria-label="שלבי הביקור">`
    + TABS.map((t, i) => `<button type="button" role="tab" id="tab-${t.id}" class="case-tab" aria-controls="panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${t.id}">${t.label}<span class="case-tab-n" data-n="${t.id}" aria-hidden="true"></span></button>`).join('')
    + `</div></div>`

    // שיחה
    + `<section class="case-panel" role="tabpanel" id="panel-talk" aria-labelledby="tab-talk">`
    + `<div class="chat" data-chat aria-live="polite"><p class="chat-hint">${esc(T(`{first} {יושב|יושבת} מולכם. מה תשאלו {אותו|אותה}?`))}</p></div>`
    + `<div class="chat-qs" role="group" aria-label="שאלות">${HISTORY.map((a) => `<button type="button" class="chip chat-q" data-act="${a.id}">${esc(a.label)}</button>`).join('')}</div>`
    + `</section>`

    // מדדים
    + `<section class="case-panel" role="tabpanel" id="panel-vitals" aria-labelledby="tab-vitals" hidden>`
    + `<div class="monitor">`
    + `<div class="mon-top"><button type="button" class="mon-pause" data-mon-pause aria-pressed="false" hidden>עצירת המוניטור</button></div>`
    + `<div class="mon-grid">`
    + `<div class="mon-cell mon-hr"><span class="mon-k">דופק <span class="mon-beat" aria-hidden="true" hidden></span></span><span class="mon-v" data-mon="hr">--</span><span class="mon-u">לדקה <span data-mon="hrx"></span></span></div>`
    + `<div class="mon-cell mon-bp"><span class="mon-k">לחץ דם</span><span class="mon-v" data-mon="bp">--/--</span><span class="mon-u">מ"מ כספית</span></div>`
    + `<div class="mon-cell mon-sat"><span class="mon-k">ריווי חמצן</span><span class="mon-v" data-mon="sat">--</span><span class="mon-u">%</span></div>`
    + `<div class="mon-cell mon-temp"><span class="mon-k">חום</span><span class="mon-v" data-mon="temp">--</span><span class="mon-u">מעלות</span></div>`
    + `<div class="mon-cell mon-glu"><span class="mon-k">סוכר</span><span class="mon-v" data-mon="glu">--</span><span class="mon-u">מ"ג/ד"ל</span></div>`
    + `</div><div class="mon-ecg" data-ecg hidden></div>`
    + `<p class="mon-note" data-mon-note aria-live="polite">בחרו מכשיר כדי למדוד.</p></div>`
    + `<div class="mon-devices" role="group" aria-label="מכשירי מדידה">${DEVICES.map((d) => `<button type="button" class="chip mon-dev" data-dev="${d.id}">${esc(d.label)}</button>`).join('')}</div>`
    + `</section>`

    // בדיקה
    + `<section class="case-panel" role="tabpanel" id="panel-exam" aria-labelledby="tab-exam" hidden>`
    + `<div class="exam-layout"><div class="body-wrap">${bodySvg()}</div>`
    + `<div class="exam-panel" data-exam-panel><p class="exam-hint">לחצו על אזור בגוף כדי לראות אילו בדיקות אפשר לעשות בו.</p></div></div>`
    + `</section>`

    // התיק
    + `<section class="case-panel" role="tabpanel" id="panel-chart" aria-labelledby="tab-chart" hidden>`
    + `<p class="case-log-count" data-count>עוד לא שאלתם ולא בדקתם.</p>`
    + `<div class="chart" data-chart></div>`
    + `<button type="button" class="btn btn-primary case-ready" data-ready>אני מוכן לאבחנה</button>`
    + `</section>`

    + `<section class="lesson case-step" aria-labelledby="q1-h" hidden data-q1><h2 id="q1-h">שאלה 1: מה נפגע?</h2>`
    + `<p class="muted">אפשר לבחור יותר מתשובה אחת: עצבים, ולפעמים גם פגיעה במוח או בגזע המוח עצמם. לחיצה נוספת מבטלת בחירה. אפשר גם לחזור ולבדוק עוד לפני שעונים.</p>`
    + `<div class="case-nerves" role="group" aria-label="מה נפגע">${NERVES.map((n) => `<button type="button" class="chip case-nerve t-${n.type}" data-id="${n.id}" aria-pressed="false"><span class="case-nerve-roman">${n.roman}</span><span class="visually-hidden">, </span><span class="case-nerve-name">${esc(n.name)}</span></button>`).join('')}`
    + `<button type="button" class="chip case-nerve case-cns" data-id="cns" aria-pressed="false"><span class="case-nerve-roman" aria-hidden="true">✦</span><span class="case-nerve-name">${CNS_LABEL}</span></button></div>`
    + `<div class="btn-row"><button type="button" class="btn btn-primary" data-check1>בדיקה</button><button type="button" class="btn btn-ghost" data-reveal1 hidden>הצגת התשובה</button></div>`
    + `<p class="try-feedback" role="status" data-fb1></p></section>`
    + `<section class="lesson case-step" aria-labelledby="q2-h" hidden data-q2><h2 id="q2-h">שאלה 2: איפה הבעיה?</h2>`
    + `<ul class="quiz-options case-where">${c.where.options.map((o) => `<li><button type="button" class="quiz-option" data-where="${o.id}">${esc(o.text)}</button></li>`).join('')}</ul>`
    + `<p class="try-feedback" role="status" data-fb2></p></section>`
    + `<section class="lesson case-step case-explain" aria-labelledby="ex-h" hidden data-ex><h2 id="ex-h">סיכום הבדיקה</h2>`
    + `<div data-debrief></div>`
    + `<h3 class="case-sub">ההסבר</h3>`
    + `<div class="case-explain-grid"><div>${caseSummary(c, T)}</div>`
    + `<figure class="case-fig">${brainstemSvg({ active: c.nerves.length === 1 ? c.nerves[0] : null, title: c.nerves.length === 1 ? `גזע המוח מלמטה, ועליו מודגש ${byId[c.nerves[0]].name}` : 'גזע המוח מלמטה' })}`
    + `<figcaption class="muted">${!c.nerves.length ? 'העצבים הקרניאליים תקינים. הבעיה מעליהם, במוח.' : c.nerves.length === 1 ? `${esc(byId[c.nerves[0]].name)} מודגש` : `העצבים במקרה: ${c.nerves.map((id) => byId[id].roman).join(' · ')}`}</figcaption></figure></div>`
    + `<div class="btn-row case-end"><a class="btn btn-primary" href="#case-${next.id}">למקרה הבא ←</a><a class="btn" href="#" data-back>לכל המקרים</a></div></section>`
    + `</article>`;

  const $ = (sel) => view.querySelector(sel);
  const done = [];

  // ---------- לשוניות ----------
  const tabs = [...view.querySelectorAll('.case-tab')];
  const selectTab = (id, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#panel-${t.dataset.tab}`).hidden = !on;
      if (on && focus) t.focus();
    });
    if (id === 'chart') renderChart();
    // אם הלוח התחיל מעל המסך (הגלילה הייתה למטה), מחזירים את תחילתו לתצוגה
    const bar = $('.case-bar').getBoundingClientRect();
    const panelEl = $(`#panel-${id}`);
    if (panelEl.getBoundingClientRect().top < bar.bottom - 1) {
      scrollBy({ top: panelEl.getBoundingClientRect().top - bar.bottom - 8, behavior: behavior() });
    }
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      // בעברית הלשונית הבאה נמצאת משמאל
      const k = { ArrowLeft: 1, ArrowRight: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      selectTab(tabs[(i + k + tabs.length) % tabs.length].dataset.tab, true);
    });
  });
  const updateCounts = () => {
    for (const k of ['talk', 'vitals', 'exam']) {
      const n = done.filter((id) => kindOf(id) === k).length;
      $(`[data-n="${k}"]`).textContent = n ? String(n) : '';
    }
    $('[data-n="chart"]').textContent = done.length ? String(done.length) : '';
  };
  const record = (id) => {
    if (done.includes(id)) return false;
    done.push(id); updateCounts(); return true;
  };

  // ---------- שיחה ----------
  const chat = $('[data-chat]');
  view.querySelectorAll('.chat-q').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.act;
    const existing = chat.querySelector(`[data-bubble="${id}"]`);
    if (existing) {
      chat.scrollTo({ top: existing.offsetTop - chat.offsetTop - 8, behavior: behavior() });
      existing.classList.remove('is-flash'); void existing.offsetWidth; existing.classList.add('is-flash');
      return;
    }
    chat.querySelector('.chat-hint')?.remove();
    const pair = document.createElement('div');
    pair.className = 'chat-pair';
    pair.dataset.bubble = id;
    pair.innerHTML = `<p class="bubble bubble-doc"><span class="visually-hidden">אתם: </span>${esc(actionById[id].label)}</p>`
      + `<p class="bubble bubble-pt is-typing" aria-hidden="true"><span class="typing"><i></i><i></i><i></i></span></p>`;
    chat.append(pair);
    chat.scrollTo({ top: chat.scrollHeight, behavior: behavior() });
    // המטופל "מקליד" רגע לפני שהוא עונה, כמו בצ'אט. בלי תנועה: התשובה מיד
    const pt = pair.querySelector('.bubble-pt');
    const reply = () => {
      pt.classList.remove('is-typing'); pt.removeAttribute('aria-hidden');
      pt.innerHTML = `<span class="bubble-who">${esc(firstName(P))}</span><span class="visually-hidden">: </span>${esc(answer(id))}`;
      chat.scrollTo({ top: chat.scrollHeight, behavior: behavior() });
    };
    if (reduced()) reply(); else setTimeout(reply, 650 + Math.min(900, answer(id).length * 12));
    b.classList.add('is-done');
    b.setAttribute('aria-label', `${actionById[id].label} (נשאל)`);
    record(id);
  }));

  // ---------- מדדים ----------
  const num = (t) => (t.match(/\d+(?:\.\d+)?/) ?? [''])[0];
  const mon = (k, v) => { const el = $(`[data-mon="${k}"]`); el.textContent = v; el.closest('.mon-cell').classList.add('is-on'); };
  const note = $('[data-mon-note]');

  // ---------- מוניטור חי ----------
  // אחרי מדידת דופק: נקודה שמהבהבת בקצב הדופק (בפרפור פרוזדורים: במרווחים לא סדירים), והערכים זזים מעט (דופק ±4, ריווי ±1).
  // האק"ג רץ. הכול נעצר בכפתור "עצירת המוניטור" (WCAG 2.2.2), ב"עצירת אנימציות" ובהעדפת "פחות תנועה".
  // הערכים שזזים לא מוקראים (התא לא אזור חי). בתיק ובסיכום נשאר הערך שנמדד.
  const monitorEl = $('.monitor'), pauseBtn = $('[data-mon-pause]'), dot = $('.mon-beat');
  const hrEl = $('[data-mon="hr"]'), satEl = $('[data-mon="sat"]');
  const irregular = c.ecg?.rhythm === 'af' || /לא סדיר/.test(answer('v_pulse'));
  let liveOn = false, userPaused = false, hrBase = null, hrCur = null, satBase = null, satCur = null, beatT = 0, driftT = 0, flashT = 0;
  const running = () => liveOn && !userPaused && !reduced();
  const beat = () => {
    if (!running()) { beatT = 0; return; }
    dot.classList.add('is-beat'); clearTimeout(flashT); flashT = setTimeout(() => dot.classList.remove('is-beat'), 140);
    const mean = 60000 / (hrCur || 76);
    beatT = setTimeout(beat, irregular ? mean * (0.55 + Math.random() * 0.95) : mean);
  };
  const drift = () => {
    if (!running()) { driftT = 0; return; }
    if (hrBase != null) {
      hrCur = Math.max(hrBase - 4, Math.min(hrBase + 4, hrCur + Math.round(Math.random() * 4) - 2));
      hrEl.textContent = String(hrCur);
    }
    if (satBase != null && Math.random() < 0.35) {
      satCur = Math.max(satBase - 1, Math.min(Math.min(100, satBase + 1), satCur + (Math.random() < 0.5 ? -1 : 1)));
      satEl.textContent = String(satCur);
    }
    driftT = setTimeout(drift, 2000);
  };
  const stopTimers = () => { clearTimeout(beatT); clearTimeout(driftT); clearTimeout(flashT); beatT = driftT = 0; dot.classList.remove('is-beat'); };
  const syncLive = () => {
    const still = reduced();
    pauseBtn.hidden = !liveOn || still;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.textContent = userPaused ? 'הפעלת המוניטור' : 'עצירת המוניטור';
    const run = running();
    monitorEl.classList.toggle('is-live', run);
    $('[data-ecg]').classList.toggle('is-running', run);
    if (run) {
      if (!beatT && hrBase != null) beat();
      if (!driftT) driftT = setTimeout(drift, 2000);
    } else {
      stopTimers();
      if (still) { if (hrBase != null) { hrCur = hrBase; hrEl.textContent = String(hrBase); } if (satBase != null) { satCur = satBase; satEl.textContent = String(satBase); } }
    }
  };
  const startPulse = () => {
    if (hrBase == null) { hrBase = hrCur = Number(num(answer('v_pulse'))) || null; dot.hidden = hrBase == null; }
    liveOn = true; syncLive();
  };
  pauseBtn.addEventListener('click', () => { userPaused = !userPaused; syncLive(); });
  const obs = new MutationObserver(syncLive);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  teardown = () => { obs.disconnect(); stopTimers(); };
  view.querySelectorAll('.mon-dev').forEach((b) => b.addEventListener('click', () => {
    const d = DEVICES.find((x) => x.id === b.dataset.dev);
    let line = '';
    if (d.id === 'cuff') {
      const p = answer('v_pulse'), bp = answer('v_bp');
      mon('hr', num(p)); $('[data-mon="hrx"]').textContent = /לא סדיר/.test(p) ? '· לא סדיר' : '';
      startPulse();
      mon('bp', (bp.match(/\d{2,3}\/\d{2,3}/) ?? ['?'])[0]);
      line = `דופק: ${p} לחץ דם: ${bp}`;
    } else if (d.id === 'oxi') {
      const s = answer('v_sat');
      mon('sat', num(s)); mon('hr', num(answer('v_pulse')));
      satBase = satCur = Number(num(s)) || null;
      startPulse();
      line = `ריווי חמצן: ${s}`;
    } else if (d.id === 'gluco') {
      const g = answer('v_glucose'); mon('glu', num(g)); line = `סוכר: ${g}`;
    } else if (d.id === 'thermo') {
      const t = answer('v_temp'); mon('temp', num(t)); line = `חום: ${t}`;
    } else if (d.id === 'ecg') {
      const box = $('[data-ecg]');
      const rate = c.ecg?.rate ?? (Number(num(answer('v_pulse'))) || 76);
      box.innerHTML = `<div class="mon-ecg-head"><p class="mon-k">אק"ג, 3 לידים</p></div>`
        + ecgSvg({ rhythm: c.ecg?.rhythm ?? 'sinus', rate, seed: c.id, title: `אק"ג, 3 לידים. ${answer('v_ecg')}` });
      box.hidden = false;
      // מוניטור אק"ג מראה גם את קצב הלב (אבל לא לחץ דם)
      const p = answer('v_pulse');
      mon('hr', num(p)); $('[data-mon="hrx"]').textContent = /לא סדיר/.test(p) ? '· לא סדיר' : '';
      startPulse();
      record('v_pulse');
      line = `אק"ג: ${answer('v_ecg')} דופק: ${p}`;
    }
    note.textContent = line;
    b.classList.add('is-done');
    d.acts.forEach(record);
  }));

  // ---------- בדיקה ----------
  const panel = $('[data-exam-panel]');
  const spots = [...view.querySelectorAll('.spot')];
  const openRegion = (rid) => {
    const r = REGIONS.find((x) => x.id === rid);
    spots.forEach((s) => s.classList.toggle('is-current', s.dataset.region === rid));
    panel.innerHTML = `<h3 class="exam-region" tabindex="-1">${esc(r.label)}</h3>`
      + `<ul class="exam-tests">${regionActs(rid).map((a) => `<li><button type="button" class="exam-test${done.includes(a.id) ? ' is-done' : ''}" data-act="${a.id}">${esc(a.label)}</button></li>`).join('')}</ul>`
      + `<p class="exam-back muted">אפשר לבחור אזור אחר באיור.</p>`;
    panel.querySelector('.exam-region').focus({ preventScroll: true });
    if (!wide()) panel.scrollIntoView({ behavior: behavior(), block: 'start' });
    panel.querySelectorAll('.exam-test').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.act;
      panel.querySelector('.exam-out')?.remove();
      panel.querySelectorAll('.exam-test.is-current').forEach((x) => x.classList.remove('is-current'));
      b.classList.add('is-current', 'is-done');
      const out = document.createElement('p');
      out.className = 'act-out exam-out';
      out.setAttribute('aria-live', 'polite');
      out.textContent = answer(id);
      b.after(out);
      const rr = out.getBoundingClientRect();
      if (rr.bottom > innerHeight - 16) out.scrollIntoView({ behavior: behavior(), block: 'nearest' });
      if (record(id) && regionActs(rid).every((a) => done.includes(a.id))) spots.find((s) => s.dataset.region === rid).classList.add('is-done');
    }));
  };
  spots.forEach((s) => {
    s.addEventListener('click', () => openRegion(s.dataset.region));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRegion(s.dataset.region); } });
  });

  // ---------- התיק ----------
  function renderChart() {
    const sec = (k, title) => {
      const ids = done.filter((id) => kindOf(id) === k);
      return `<section class="chart-sec"><h3>${title}</h3>${ids.length
        ? `<ul>${ids.map((id) => `<li><strong>${esc(actionById[id].label)}</strong> <span>${esc(answer(id))}</span></li>`).join('')}</ul>`
        : '<p class="muted">עוד אין.</p>'}</section>`;
    };
    $('[data-chart]').innerHTML = sec('talk', 'שיחה') + sec('vitals', 'מדדים') + sec('exam', 'בדיקה');
    $('[data-count]').textContent = done.length ? `אספתם ${done.length} ${done.length === 1 ? 'ממצא' : 'ממצאים'}.` : 'עוד לא שאלתם ולא בדקתם.';
  }

  view.querySelectorAll('[data-ready]').forEach((b) => b.addEventListener('click', () => {
    $('[data-q1]').hidden = false; focusEl($('#q1-h'));
  }));

  // ---------- שאלה 1: בחירה מרובה ----------
  const chips = [...view.querySelectorAll('.case-nerve')];
  const fb1 = $('[data-fb1]');
  let q1Done = false, tries = 0;
  chips.forEach((b) => b.addEventListener('click', () => { if (!q1Done) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); }));
  const target = [...c.nerves, ...(c.cns ? ['cns'] : [])];
  const nameOf = (id) => (id === 'cns' ? 'פגיעה במוח או בגזע המוח' : `${byId[id].roman} (${byId[id].name})`);
  const finishQ1 = () => {
    q1Done = true;
    chips.forEach((b) => {
      const id = b.dataset.id;
      b.setAttribute('aria-disabled', 'true');
      b.classList.toggle('is-answer', target.includes(id));
      b.setAttribute('aria-pressed', String(target.includes(id)));
    });
    $('[data-check1]').hidden = true; $('[data-reveal1]').hidden = true;
    $('[data-q2]').hidden = false; focusEl($('#q2-h'));
  };
  $('[data-check1]').addEventListener('click', () => {
    const picked = chips.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.id);
    if (!picked.length) { fb1.className = 'try-feedback is-wrong'; fb1.textContent = 'בחרו לפחות תשובה אחת.'; return; }
    tries++;
    const missing = target.filter((id) => !picked.includes(id));
    const extra = picked.filter((id) => !target.includes(id) && !(c.alsoOk ?? []).includes(id));
    if (!missing.length && !extra.length) {
      fb1.className = 'try-feedback is-correct';
      fb1.textContent = target.length > 1 ? `נכון! כל ${target.length} התשובות.` : 'נכון!';
      finishQ1();
      return;
    }
    const mNerves = missing.filter((id) => id !== 'cns'), xNerves = extra.filter((id) => id !== 'cns');
    const parts = [];
    if (mNerves.length) parts.push(mNerves.length === 1 ? 'חסר עצב אחד' : `חסרים ${mNerves.length} עצבים`);
    if (missing.includes('cns')) parts.push('חסר עוד משהו שנפגע, מעבר לעצבים');
    if (xNerves.length) parts.push(xNerves.length === 1 ? 'בחרתם עצב אחד שלא נפגע' : `בחרתם ${xNerves.length} עצבים שלא נפגעו`);
    const notes = [];
    if (extra.includes('cns')) notes.push('המוח וגזע המוח תקינים כאן: הממצאים מתאימים לפגיעה מחוץ להם, בעצב עצמו או בדרכו.');
    extra.forEach((id) => { if (c.q1Notes?.[id]) notes.push(T(c.q1Notes[id])); });
    fb1.className = 'try-feedback is-wrong';
    fb1.textContent = `עוד לא.${parts.length ? ` ${parts.join(', ו')}.` : ''}${notes.length ? ` ${notes.join(' ')}` : ''} אפשר לחזור ולבדוק עוד, ולנסות שוב.`;
    if (tries >= 2) $('[data-reveal1]').hidden = false;
  });
  $('[data-reveal1]').addEventListener('click', () => {
    fb1.className = 'try-feedback'; fb1.textContent = `התשובה: ${target.map(nameOf).join(', ')}.`;
    finishQ1();
  });

  // ---------- שאלה 2: איפה ----------
  const opts = [...view.querySelectorAll('[data-where]')];
  const fb2 = $('[data-fb2]');
  let q2Done = false;
  opts.forEach((b) => b.addEventListener('click', () => {
    if (q2Done || b.getAttribute('aria-disabled') === 'true') return;
    if (b.dataset.where === c.where.answer) {
      q2Done = true;
      b.classList.add('is-correct');
      opts.forEach((x) => x.setAttribute('aria-disabled', 'true'));
      fb2.className = 'try-feedback is-correct'; fb2.textContent = 'נכון!';
      $('[data-debrief]').innerHTML = debrief();
      $('[data-ex]').hidden = false; focusEl($('#ex-h'));
    } else {
      b.classList.add('is-wrong'); b.setAttribute('aria-disabled', 'true');
      fb2.className = 'try-feedback is-wrong'; fb2.textContent = 'לא בדיוק. חשבו מה האפשרות הזו לא מסבירה, ונסו שוב.';
    }
  }));

  // ---------- סיכום: מה מצאתם, מה פספסתם, ומה לא היה הכרחי. כאן כן מופיעים העצבים של כל בדיקה ----------
  const findingItem = (id, mark = '') => `<li>${mark}<strong>${esc(actionById[id].label)}${nervesTag(id)}</strong> <span>${esc(answer(id))}</span></li>`;
  function debrief() {
    const found = c.key.filter((id) => done.includes(id));
    const missed = c.key.filter((id) => !done.includes(id));
    const flags = (c.redFlags ?? []).filter((id) => !done.includes(id) && !c.key.includes(id));
    const extra = done.filter((id) => !c.key.includes(id) && !(c.redFlags ?? []).includes(id) && !groupById[actionById[id].group].basic);
    let html = `<p class="case-debrief-lead">אספתם ${done.length} ${done.length === 1 ? 'ממצא' : 'ממצאים'}. במקרה הזה יש ${c.key.length} ממצאים חשובים לאבחנה, ובדקתם ${found.length} מהם.</p>`;
    if (found.length) html += `<h3 class="case-sub">ממצאים חשובים שבדקתם</h3><ul class="debrief debrief-found">${found.map((id) => findingItem(id, '<span class="debrief-mark" aria-hidden="true">✓</span><span class="visually-hidden">נמצא: </span>')).join('')}</ul>`;
    if (missed.length) html += `<h3 class="case-sub">ממצאים חשובים שלא בדקתם</h3><ul class="debrief debrief-missed">${missed.map((id) => findingItem(id, '<span class="debrief-mark" aria-hidden="true">✗</span><span class="visually-hidden">לא נבדק: </span>')).join('')}</ul>`;
    if (flags.length) html += `<h3 class="case-sub">סימני אזהרה שכדאי לבדוק תמיד במצב כזה</h3><ul class="debrief debrief-flags">${flags.map((id) => findingItem(id, '<span class="debrief-mark" aria-hidden="true">!</span>')).join('')}</ul>`;
    if (extra.length) html += `<h3 class="case-sub">בדיקות שלא היו הכרחיות במקרה הזה</h3><p class="muted">אין בהן נזק, והן חלק מבדיקה יסודית. הן פשוט לא שינו את האבחנה: ${extra.map((id) => esc(actionById[id].label)).join(' · ')}.</p>`;
    html += `<h3 class="case-sub">מסיחים בתרחיש הזה</h3>`;
    if (!ds.length) html += `<p class="muted">אצל ${esc(P.name)} לא היו מסיחים: כל מה שמצאתם קשור לאבחנה או תקין. אפשר לנסות "למטופל אחר".</p>`;
    else {
      html += `<p class="muted">ל${esc(P.name)} יש פרטים אמיתיים מהחיים שלא קשורים לאבחנה. ככה זה גם במרפאה: לא כל ממצא חריג הוא התשובה.</p>`
        + `<ul class="debrief debrief-distractors">${ds.map((d) => {
          const ids = [...Object.keys(d.exam ?? {}), ...Object.keys(d.add ?? {})];
          const met = ids.some((id) => done.includes(id));
          const where = ids.map((id) => esc(actionById[id].label)).join(' · ');
          return `<li><span class="debrief-mark" aria-hidden="true">${met ? '◆' : '◇'}</span><strong>${esc(d.label)}</strong> <span class="muted">(${met ? 'נתקלתם בזה' : 'לא נתקלתם בזה'}: ${where})</span><span>${esc(d.explain)}</span></li>`;
        }).join('')}</ul>`;
    }
    return html;
  }

  $('[data-reroll]').addEventListener('click', () => {
    const v = randomPatient(c, variant);
    history.replaceState(null, '', `#case-${c.id}/${v}`);
    openCase(c, v);
  });

  view.querySelectorAll('[data-back]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', location.pathname + location.search);
    showList(c.id);
  }));
  focusEl($('#case-h'));
}

function route() {
  const m = location.hash.match(/^#case-([\w-]+?)(?:\/([abc]))?$/);
  const c = m && CASES.find((x) => x.id === m[1]);
  if (c) openCase(c, m[2] ?? randomPatient(c)); else showList();
}
addEventListener('hashchange', route);
addEventListener('popstate', route);
route();

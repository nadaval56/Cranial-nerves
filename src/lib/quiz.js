// מבחן עצמי (בתחתית עמוד הבית, #quiz): 10 שאלות שנוצרות מנתוני העצבים, מסוגים שונים. כלום לא נשמר — הכול בזיכרון הדף.
import { NERVES, TYPES, BRAIN, nerveUrl } from '../../content/nerves.js';
import { FORAMINA } from '../../content/foramina.js';
import { esc } from './render.js';

let root;
const ROUND = 10;

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const others = (n, k = 3) => shuffle(NERVES.filter((m) => m.id !== n.id)).slice(0, k);

// כל מחולל מחזיר { q, options, answer, explain, nerve }
const GEN = [
  // שאלת "נסו קודם" מעמוד העצב — הכי מעניינות, ולכן בעדיפות
  (n) => ({ q: n.try.q, options: n.try.options, answer: n.try.answer, explain: n.try.explain, nerve: n }),
  (n) => {
    const opts = shuffle([n, ...others(n)]);
    return { q: `מה המספר של ${n.name}?`, options: opts.map((m) => m.roman), answer: opts.indexOf(n), explain: `${n.name} הוא העצב ה-${n.num} (${n.roman}).`, nerve: n };
  },
  (n) => {
    const opts = shuffle([n, ...others(n)]);
    return { q: `איזה עצב מתואר כאן? "${n.tagline}"`, options: opts.map((m) => `${m.roman} · ${m.name}`), answer: opts.indexOf(n), explain: `זה ${n.name} (${n.roman}).`, nerve: n };
  },
  (n) => {
    const keys = Object.keys(TYPES);
    return { q: `${n.name} (${n.roman}) הוא עצב…`, options: keys.map((k) => TYPES[k].label), answer: keys.indexOf(n.type), explain: `${n.name} הוא ${TYPES[n.type].long}.`, nerve: n };
  },
  (n) => {
    const keys = Object.keys(BRAIN);
    // אזורים סמוכים לא מוצעים כמסיח, כי ספרים שונים מחלקים אותם אחרת (גשר / גבול הגשר, מוח מוארך / חוט השדרה העליון)
    const NEAR = { pons: ['pmj'], pmj: ['pons', 'medulla'], medulla: ['pmj', 'cord'], cord: ['medulla'] };
    const wrong = shuffle(keys.filter((k) => k !== n.brain && !(NEAR[n.brain] ?? []).includes(k))).slice(0, 3);
    const opts = shuffle([n.brain, ...wrong]);
    return { q: `היכן ${n.name} (${n.roman}) מתחבר למוח?`, options: opts.map((k) => BRAIN[k]), answer: opts.indexOf(n.brain), explain: `${n.attach}.`, nerve: n };
  },
  (n) => {
    // באיזה פתח: מוודאים שהמסיחים הם פתחים שהעצב לא עובר בהם
    const right = FORAMINA.find((f) => f.id === n.foramen);
    const wrong = shuffle(FORAMINA.filter((f) => !f.nerves.includes(n.id))).slice(0, 3);
    const opts = shuffle([right, ...wrong]);
    return { q: `דרך איזה פתח עובר ${n.name} (${n.roman})?`, options: opts.map((f) => f.name), answer: opts.indexOf(right), explain: `${n.exit}.`, nerve: n };
  },
  (n) => {
    const step = pick(n.test.steps);
    const opts = shuffle([n, ...others(n)]);
    return { q: `איזה עצב בודקים כך? "${step}"`, options: opts.map((m) => `${m.roman} · ${m.name}`), answer: opts.indexOf(n), explain: `זה חלק מהבדיקה של ${n.name} (${n.roman}).`, nerve: n };
  },
];

function makeRound() {
  // כל עצב לכל היותר פעם אחת בסבב; סוגי שאלות מגוונים
  const nerves = shuffle(NERVES).slice(0, ROUND);
  const kinds = shuffle([0, 0, 0, 1, 2, 3, 4, 5, 5, 6]);
  return nerves.map((n, i) => GEN[kinds[i]](n));
}

let qs, idx, score, missed;

// בטעינת העמוד לא מזיזים את הפוקוס (כדי שקורא מסך יתחיל מראש העמוד); אחר כך כן
function start(focus = true) {
  qs = makeRound(); idx = 0; score = 0; missed = [];
  show(focus);
}

function show(focus = true) {
  const q = qs[idx];
  root.innerHTML = `<div class="quiz quiz-lab">
    <div class="quiz-progress"><span>שאלה ${idx + 1} מתוך ${ROUND}</span><span>תשובות נכונות: ${score}</span></div>
    <div class="progress-bar" aria-hidden="true"><i style="width:${(idx / ROUND) * 100}%"></i></div>
    <p class="quiz-question" id="qq">${esc(q.q)}</p>
    <ol class="quiz-options" type="א" aria-labelledby="qq">${q.options.map((o, i) => `<li><button type="button" class="quiz-option" data-i="${i}">${esc(o)}</button></li>`).join('')}</ol>
    <div class="quiz-feedback" role="status" aria-live="polite"></div>
  </div>`;
  root.querySelector('.quiz-options').addEventListener('click', onAnswer);
  if (focus) root.querySelector('.quiz-option').focus();
}

function onAnswer(e) {
  const b = e.target.closest('.quiz-option');
  if (!b) return;
  const q = qs[idx];
  const i = Number(b.dataset.i);
  const ok = i === q.answer;
  if (ok) score++; else missed.push(q.nerve);
  root.querySelectorAll('.quiz-option').forEach((x) => {
    x.disabled = true;
    if (Number(x.dataset.i) === q.answer) x.classList.add('is-correct');
  });
  if (!ok) b.classList.add('is-wrong');
  const fb = root.querySelector('.quiz-feedback');
  fb.innerHTML = `<p class="${ok ? 'fb-ok' : 'fb-bad'}"><strong>${ok ? 'נכון!' : 'לא הפעם.'}</strong> ${esc(q.explain)}</p>`
    + `<div class="btn-row"><button type="button" class="btn btn-primary" id="next">${idx + 1 < ROUND ? 'לשאלה הבאה' : 'לתוצאות'}</button>`
    + `<a class="btn btn-ghost" href="${nerveUrl(q.nerve.id)}" target="_blank" rel="noopener">לעמוד של ${esc(q.nerve.name)}<span class="visually-hidden"> (נפתח בכרטיסייה חדשה)</span></a></div>`;
  const next = document.getElementById('next');
  next.focus();
  next.addEventListener('click', () => { idx++; if (idx < ROUND) show(); else end(); });
}

function end() {
  const msg = score === ROUND ? 'מושלם! כל השאלות נכונות.' : score >= 8 ? 'מצוין, כמעט הכול.' : score >= 5 ? 'יפה. כדאי לחזור על כמה עצבים.' : 'התחלה טובה. עמודי העצבים יעזרו.';
  const uniq = [...new Map(missed.map((n) => [n.id, n])).values()];
  root.innerHTML = `<div class="quiz quiz-lab quiz-end">
    <p class="score-big" tabindex="-1" aria-label="התוצאה: ${score} מתוך ${ROUND}">${score}<span>/${ROUND}</span></p>
    <p class="lead">${msg}</p>
    ${uniq.length ? `<p class="muscle-h">כדאי לחזור על</p><div class="pill-row">${uniq.map((n) => `<a class="nerve-pill t-${n.type}" href="${nerveUrl(n.id)}"><b>${n.roman}</b> ${esc(n.name)}</a>`).join('')}</div>` : ''}
    <div class="btn-row"><button type="button" class="btn btn-primary" id="again">סבב חדש</button></div>
  </div>`;
  document.getElementById('again').addEventListener('click', () => start());
  root.querySelector('.score-big').focus();
}

export function mountQuiz(el) {
  root = el;
  start(false);
}

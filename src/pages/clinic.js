// "קליניקה": רשימת מקרים, ומקרה אחד בכל פעם לפי הכתובת (#case-<id>), כדי שאפשר יהיה לקשר למקרה מסוים.
// רצף במקרה: סיפור → ממצאים אחד אחרי השני → שאלה 1 (אילו עצבים) → שאלה 2 (איפה) → הסבר. שום דבר לא נשמר.
import { CASES, LEVELS } from '../../content/cases.js';
import { NERVES, byId } from '../../content/nerves.js';
import { esc } from '../lib/render.js';
import { caseCards, caseSummary } from '../lib/clinic.js';
import { brainstemSvg } from '../lib/brainstem.js';
import { SITE } from '../config.js';

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
const focusEl = (el) => { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); };
const baseTitle = document.title;

function showList(focusId) {
  view.hidden = true; view.innerHTML = '';
  list.hidden = false; head.hidden = false; how.hidden = false;
  document.title = baseTitle;
  const link = focusId && list.querySelector(`[data-case="${focusId}"]`);
  if (link) link.focus();
}

function openCase(c) {
  const idx = CASES.indexOf(c);
  const next = CASES[(idx + 1) % CASES.length];
  list.hidden = true; head.hidden = true; how.hidden = true;
  view.hidden = false;
  document.title = `${c.title} · קליניקה · ${SITE.name}`;
  view.innerHTML = `<nav class="breadcrumb case-crumb" aria-label="נתיב"><a href="#" data-back>קליניקה</a> / מקרה ${idx + 1}</nav>`
    + `<article class="case" aria-labelledby="case-h">`
    + `<p class="case-meta"><span class="case-num">מקרה ${idx + 1} מתוך ${CASES.length}</span><span class="case-level case-level-${c.level}">${LEVELS[c.level]}</span></p>`
    + `<h1 id="case-h">${esc(c.title)}</h1>`
    + `<p class="lead case-story">${esc(c.story)}</p>`
    + `<section class="lesson case-step" aria-labelledby="find-h"><h2 id="find-h">הממצאים</h2>`
    + `<ol class="case-findings" aria-live="polite"></ol>`
    + `<div class="btn-row"><button type="button" class="btn btn-primary" data-next-finding></button>`
    + `<button type="button" class="btn btn-ghost" data-skip>דלגו לשאלות</button></div></section>`
    + `<section class="lesson case-step" aria-labelledby="q1-h" hidden data-q1><h2 id="q1-h">שאלה 1: אילו עצבים מעורבים?</h2>`
    + `<p class="muted">אפשר לבחור יותר מעצב אחד. לחיצה נוספת מבטלת בחירה.</p>`
    + `<div class="case-nerves" role="group" aria-label="בחירת עצבים">${NERVES.map((n) => `<button type="button" class="chip case-nerve t-${n.type}" data-id="${n.id}" aria-pressed="false"><span class="case-nerve-roman">${n.roman}</span><span class="visually-hidden">, </span><span class="case-nerve-name">${esc(n.name)}</span></button>`).join('')}</div>`
    + `<div class="btn-row"><button type="button" class="btn btn-primary" data-check1>בדיקה</button><button type="button" class="btn btn-ghost" data-reveal1 hidden>הצגת התשובה</button></div>`
    + `<p class="try-feedback" role="status" data-fb1></p></section>`
    + `<section class="lesson case-step" aria-labelledby="q2-h" hidden data-q2><h2 id="q2-h">שאלה 2: איפה הבעיה?</h2>`
    + `<ul class="quiz-options case-where">${c.where.options.map((o) => `<li><button type="button" class="quiz-option" data-where="${o.id}">${esc(o.text)}</button></li>`).join('')}</ul>`
    + `<p class="try-feedback" role="status" data-fb2></p></section>`
    + `<section class="lesson case-step case-explain" aria-labelledby="ex-h" hidden data-ex><h2 id="ex-h">ההסבר</h2>`
    + `<div class="case-explain-grid"><div>${caseSummary(c)}</div>`
    + `<figure class="case-fig">${brainstemSvg({ active: c.nerves.length === 1 ? c.nerves[0] : null, title: c.nerves.length === 1 ? `גזע המוח מלמטה, ועליו מודגש ${byId[c.nerves[0]].name}` : 'גזע המוח מלמטה' })}`
    + `<figcaption class="muted">${c.nerves.length === 1 ? `${esc(byId[c.nerves[0]].name)} מודגש` : `העצבים במקרה: ${c.nerves.map((id) => byId[id].roman).join(' · ')}`}</figcaption></figure></div>`
    + `<div class="btn-row case-end"><a class="btn btn-primary" href="#case-${next.id}">למקרה הבא ←</a><a class="btn" href="#" data-back>לכל המקרים</a></div></section>`
    + `</article>`;

  const $ = (sel) => view.querySelector(sel);
  const findings = $('.case-findings');
  const nextBtn = $('[data-next-finding]');
  let shown = 0;
  const label = () => { nextBtn.textContent = `בדיקה הבאה (${shown + 1} מתוך ${c.findings.length})`; };
  const openQ1 = (focus = true) => {
    nextBtn.hidden = true; $('[data-skip]').hidden = true;
    const q1 = $('[data-q1]');
    if (q1.hidden) { q1.hidden = false; if (focus) focusEl($('#q1-h')); }
  };
  const reveal = () => {
    const li = document.createElement('li');
    li.textContent = c.findings[shown++];
    findings.append(li);
    if (shown >= c.findings.length) openQ1(true); else label();
  };
  label();
  nextBtn.addEventListener('click', reveal);
  $('[data-skip]').addEventListener('click', () => { while (shown < c.findings.length) { const li = document.createElement('li'); li.textContent = c.findings[shown++]; findings.append(li); } openQ1(true); });

  // שאלה 1: בחירה מרובה
  const chips = [...view.querySelectorAll('.case-nerve')];
  const fb1 = $('[data-fb1]');
  let q1Done = false, tries = 0;
  chips.forEach((b) => b.addEventListener('click', () => { if (!q1Done) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); }));
  const finishQ1 = () => {
    q1Done = true;
    chips.forEach((b) => {
      const id = b.dataset.id;
      b.setAttribute('aria-disabled', 'true');
      b.classList.toggle('is-answer', c.nerves.includes(id));
      b.setAttribute('aria-pressed', String(c.nerves.includes(id)));
    });
    $('[data-check1]').hidden = true; $('[data-reveal1]').hidden = true;
    const q2 = $('[data-q2]'); q2.hidden = false; focusEl($('#q2-h'));
  };
  $('[data-check1]').addEventListener('click', () => {
    const picked = chips.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.id);
    if (!picked.length) { fb1.className = 'try-feedback is-wrong'; fb1.textContent = 'בחרו לפחות עצב אחד.'; return; }
    tries++;
    const missing = c.nerves.filter((id) => !picked.includes(id));
    const extra = picked.filter((id) => !c.nerves.includes(id) && !(c.alsoOk ?? []).includes(id));
    if (!missing.length && !extra.length) {
      fb1.className = 'try-feedback is-correct';
      fb1.textContent = c.nerves.length > 1 ? `נכון! כל ${c.nerves.length} העצבים.` : 'נכון!';
      finishQ1();
      return;
    }
    const parts = [];
    if (missing.length) parts.push(missing.length === 1 ? 'חסר עצב אחד' : `חסרים ${missing.length} עצבים`);
    if (extra.length) parts.push(extra.length === 1 ? 'בחרתם עצב אחד שלא מעורב' : `בחרתם ${extra.length} עצבים שלא מעורבים`);
    fb1.className = 'try-feedback is-wrong';
    fb1.textContent = `עוד לא. ${parts.join(', ו')}. חזרו לממצאים ונסו שוב.`;
    if (tries >= 2) $('[data-reveal1]').hidden = false;
  });
  $('[data-reveal1]').addEventListener('click', () => {
    fb1.className = 'try-feedback'; fb1.textContent = `התשובה: ${c.nerves.map((id) => `${byId[id].roman} (${byId[id].name})`).join(', ')}.`;
    finishQ1();
  });

  // שאלה 2: איפה
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
      $('[data-ex]').hidden = false; focusEl($('#ex-h'));
    } else {
      b.classList.add('is-wrong'); b.setAttribute('aria-disabled', 'true');
      fb2.className = 'try-feedback is-wrong'; fb2.textContent = 'לא בדיוק. חשבו מה האפשרות הזו לא מסבירה, ונסו שוב.';
    }
  }));

  view.querySelectorAll('[data-back]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', location.pathname + location.search);
    showList(c.id);
  }));
  focusEl($('#case-h'));
}

function route() {
  const m = location.hash.match(/^#case-([\w-]+)$/);
  const c = m && CASES.find((x) => x.id === m[1]);
  if (c) openCase(c); else showList();
}
addEventListener('hashchange', route);
addEventListener('popstate', route);
route();

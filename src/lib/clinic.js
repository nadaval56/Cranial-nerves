// "קליניקה": רשימת המקרים (נבנית גם ב-build) ותצוגת מקרה. התוכן ב-content/cases.js.
import { esc } from './render.js';
import { byId } from '../../content/nerves.js';
import { LEVELS } from '../../content/cases.js';

const romans = (ids) => ids.map((id) => byId[id].roman).join(' · ');

// כרטיסי המקרים. לא מגלים מראש אילו עצבים מעורבים: רק כותרת, תיאור קצר ורמה.
export function caseCards(cases) {
  return `<ol class="case-cards">${cases.map((c, i) => `<li class="card case-card"><div class="card-body">`
    + `<p class="case-meta"><span class="case-num">מקרה ${i + 1}</span><span class="case-level case-level-${c.level}">${LEVELS[c.level]}</span></p>`
    + `<h2><a class="card-link" href="#case-${esc(c.id)}" data-case="${esc(c.id)}">${esc(c.title)}</a></h2>`
    + `<p>${esc(c.teaser)}</p></div></li>`).join('')}</ol>`;
}

// הסיכום שמופיע בסוף מקרה: התשובות, ההסבר, הקישורים והמקורות
export function caseSummary(c, T = (x) => x) {
  const nervesLine = c.nerves.length
    ? `${romans(c.nerves)} <span class="muted">(${c.nerves.map((id) => esc(byId[id].name)).join(', ')})</span>`
    : 'אף עצב קרניאלי לא נפגע בעצמו';
  return `<p class="case-answer"><strong>מה נפגע:</strong> ${nervesLine}${c.cns ? `${c.nerves.length ? ', ו' : '. '}פגיעה ${c.nerves.length ? 'בגזע המוח' : 'במוח'} (מערכת העצבים המרכזית)` : ''}</p>`
    + `<p class="case-answer"><strong>המקום:</strong> ${esc(c.where.options.find((o) => o.id === c.where.answer).text)}</p>`
    + `<div class="prose">${c.explain.map((p) => `<p>${esc(T(p))}</p>`).join('')}</div>`
    + `<p class="case-links">${c.links.map((l) => `<a class="lab-link" href="./${esc(l.href)}">${esc(l.label)} ←</a>`).join(' ')}</p>`
    + `<p class="case-sources muted">מקורות: ${c.sources.map((s) => `<a href="${esc(s.url)}" rel="noopener" target="_blank" lang="en" dir="ltr">${esc(s.label)}</a>`).join(' · ')}</p>`;
}

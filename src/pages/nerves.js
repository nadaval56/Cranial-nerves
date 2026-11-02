// רשימת העצבים: סינון לפי סוג. התוכן עצמו נבנה מראש ב-build (או כאן, בשרת הפיתוח).
import { NERVES } from '../../content/nerves.js';
import { nervesList } from '../lib/render.js';

const root = document.getElementById('nerves-root');
if (!root.querySelector('.nerve-grid')) root.innerHTML = nervesList(NERVES);

const filters = document.getElementById('filters');
filters.hidden = false;
const LABELS = { all: 'עצבים', sensory: 'עצבים תחושתיים', motor: 'עצבים תנועתיים', mixed: 'עצבים מעורבים' };

function apply(type) {
  filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.type === type)));
  let count = 0;
  root.querySelectorAll('.nerve-card, .nerve-table tbody tr').forEach((el) => {
    const show = type === 'all' || el.dataset.type === type;
    el.hidden = !show;
    if (show && el.classList.contains('nerve-card')) count++;
  });
  root.querySelector('.result-count').textContent = `${count} ${LABELS[type]}`;
  const url = new URL(location.href);
  if (type === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', type);
  history.replaceState(null, '', url);
}

filters.addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (c) apply(c.dataset.type);
});
const initial = new URL(location.href).searchParams.get('type');
if (LABELS[initial]) apply(initial);

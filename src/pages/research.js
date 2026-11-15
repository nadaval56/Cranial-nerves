// "מהמחקר החדש": כל המאמרים. הרשימה נבנית מראש ב-build (בשרת הפיתוח היא נבנית כאן); כאן רק הסינון לפי עצב.
// #<id של עצב> בכתובת פותח את הדף מסונן לעצב הזה (הקישור מעמוד העצב).
import { NERVES } from '../../content/nerves.js';
import { researchPage } from '../lib/render.js';

const root = document.getElementById('research-root');
if (!root.firstElementChild) root.innerHTML = researchPage(NERVES);

const chips = [...root.querySelectorAll('[data-filter]')];
const items = [...root.querySelectorAll('.research-list > li')];
const count = root.querySelector('.research-count');

function apply(id, fromHash = false) {
  const valid = id === 'all' || chips.some((c) => c.dataset.filter === id);
  if (!valid) id = 'all';
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === id)));
  let n = 0;
  items.forEach((li) => { const show = id === 'all' || li.dataset.nerve === id; li.hidden = !show; if (show) n++; });
  count.textContent = id === 'all' ? '' : (n === 1 ? 'מאמר אחד' : `${n} מאמרים`);
  if (!fromHash) history.replaceState(null, '', id === 'all' ? location.pathname : `#${id}`);
}

root.addEventListener('click', (e) => {
  const c = e.target.closest('[data-filter]');
  if (c) apply(c.dataset.filter);
});
apply(location.hash.slice(1) || 'all', true);

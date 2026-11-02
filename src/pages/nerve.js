// עמוד עצב. ב-build התוכן כבר בתוך העמוד (nerve-<id>.html); בשרת הפיתוח הוא נבנה כאן לפי ?id=.
// בשני המקרים — כאן הופכים את שאלת "נסו קודם" לאינטראקטיבית.
import { byId, NERVES } from '../../content/nerves.js';
import { nerveBody } from '../lib/render.js';
import { SITE } from '../config.js';

const root = document.getElementById('nerve-root');
const id = document.documentElement.dataset.nerveId || new URL(location.href).searchParams.get('id');
const n = byId[id];

if (!root.querySelector('.nerve-head')) {
  if (n) {
    root.innerHTML = nerveBody(n);
    document.title = `${n.name} (${n.roman}) · ${SITE.name}`;
  } else {
    root.innerHTML = `<header class="page-head"><h1>העצב לא נמצא</h1><p class="lead">אולי הקישור שגוי. <a href="./nerves.html">לכל ${NERVES.length} העצבים</a></p></header>`;
  }
}

const tryEl = root.querySelector('.try');
if (tryEl) {
  const answer = Number(tryEl.dataset.answer);
  const feedback = tryEl.querySelector('.try-feedback');
  const details = tryEl.querySelector('.try-answer');
  const buttons = [...tryEl.querySelectorAll('.quiz-option')];
  details.hidden = true;
  buttons.forEach((b) => {
    b.disabled = false;
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (i === answer) {
        buttons.forEach((x) => { x.disabled = true; });
        b.classList.add('is-correct');
        feedback.textContent = 'נכון!';
        feedback.className = 'try-feedback is-correct';
        details.hidden = false;
        details.open = true;
      } else {
        b.classList.add('is-wrong');
        b.disabled = true;
        feedback.textContent = 'לא בדיוק. נסו שוב — או פתחו את התשובה.';
        feedback.className = 'try-feedback is-wrong';
        details.hidden = false;
      }
    });
  });
}

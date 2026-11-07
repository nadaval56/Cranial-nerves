// עמוד עצב. ב-build התוכן כבר בתוך העמוד (nerve-<id>.html); בשרת הפיתוח הוא נבנה כאן לפי ?id=.
// בשני המקרים — כאן הופכים את שאלת "נסו קודם" לאינטראקטיבית.
import { byId, NERVES } from '../../content/nerves.js';
import { nerveBody } from '../lib/render.js';
import { DIAGRAMS } from '../lib/diagrams.js';
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

// מפות אינטראקטיביות (אזורי הפנים, הלשון, ענפי עצב הפנים)
root.querySelectorAll('.dgm').forEach((el) => DIAGRAMS[el.dataset.dgm]?.init(el));

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
        feedback.textContent = 'לא נכון. נסו שוב, או פתחו את התשובה.';
        feedback.className = 'try-feedback is-wrong';
        details.hidden = false;
      }
    });
  });
}

// ---------- מודל תלת-ממדי במקום האיור הקטן ----------
// האיור הדו-ממדי (SVG) מוצג קודם ונשאר כגיבוי; המודל נטען אחריו, רק אם הדפדפן תומך ב-WebGL.
const locator = root.querySelector('.nerve-locator');
function webglOk() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}
if (n && locator && webglOk()) {
  const svgEl = locator.querySelector('svg');
  const stage = document.createElement('div');
  stage.className = 'b3d-stage b3d-stage-sm';
  stage.hidden = true;
  locator.insertBefore(stage, locator.querySelector('figcaption'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
  (async () => {
    try {
      const { createBrain3D, BEST_VIEW, GHOST_CEREBELLUM } = await import('../lib/brain3d.js');
      stage.hidden = false; svgEl.style.display = 'none';
      const view3d = await createBrain3D(stage, {
        glbUrl: `${import.meta.env.BASE_URL}models/brain-cn.glb`,
        reducedMotion, labels: 'active', active: n.id, view: BEST_VIEW[n.id], ghostCerebellum: GHOST_CEREBELLUM.has(n.id),
        onSelect: () => view3d?.highlight(n.id), // העצב של העמוד נשאר מודגש
      });
      const bar = document.createElement('div');
      bar.className = 'b3d-mini-bar';
      // כפתור אחד שמתחלף בין המודל לאיור; ושלושה מצבים למוח הגדול
      bar.innerHTML = `<button type="button" class="chip b3d-switch" data-2d>איור דו-ממדי</button>`
        + `<div class="b3d-seg" role="group" aria-label="המוח הגדול">`
        + `<button type="button" class="chip" data-shell="ghost" aria-pressed="true">מוח שקוף</button>`
        + `<button type="button" class="chip" data-shell="solid" aria-pressed="false">מוח מלא</button>`
        + `<button type="button" class="chip" data-shell="hidden" aria-pressed="false">בלי מוח</button></div>`
        + `<button type="button" class="chip" data-reset>זווית התחלה</button>`;
      locator.insertBefore(bar, locator.querySelector('figcaption'));
      let is2d = false;
      bar.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.shell) {
          view3d.setShell(b.dataset.shell);
          bar.querySelectorAll('[data-shell]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        } else if (b.hasAttribute('data-reset')) view3d.setView(BEST_VIEW[n.id]);
        else if (b.hasAttribute('data-2d')) {
          is2d = !is2d;
          b.textContent = is2d ? 'מודל תלת-ממדי' : 'איור דו-ממדי';
          svgEl.style.display = is2d ? '' : 'none'; stage.hidden = is2d;
          bar.querySelectorAll('.b3d-seg, [data-reset]').forEach((x) => { x.hidden = is2d; });
          const hint = locator.querySelector('.b3d-cap'); if (hint) hint.hidden = is2d;
        }
      });
      const cap = locator.querySelector('figcaption');
      cap.insertAdjacentHTML('beforeend', ' <span class="muted b3d-cap">גררו כדי לסובב.</span>');
    } catch (err) {
      console.warn('3D view unavailable, keeping the 2D illustration', err);
      stage.remove(); svgEl.style.display = '';
    }
  })();
}

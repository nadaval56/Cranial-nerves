// עמוד עצב 0 (העצב הטרמינלי): שאלת "נסו קודם", כרטיס לעצב הריח, ומודל תלת-ממדי שבו עצב 0 מודגש.
import { byId } from '../../content/nerves.js';
import { nerveCard } from '../lib/render.js';

document.getElementById('zero-related').innerHTML = nerveCard(byId.olfactory);

// "נסו קודם" — אותה התנהגות כמו בעמודי העצבים
const tryEl = document.querySelector('.try');
const answer = Number(tryEl.dataset.answer);
const feedback = tryEl.querySelector('.try-feedback');
const details = tryEl.querySelector('.try-answer');
const buttons = [...tryEl.querySelectorAll('.quiz-option')];
details.hidden = true;
buttons.forEach((b) => {
  b.disabled = false;
  b.addEventListener('click', () => {
    if (Number(b.dataset.i) === answer) {
      buttons.forEach((x) => { x.disabled = true; });
      b.classList.add('is-correct');
      feedback.textContent = 'נכון!'; feedback.className = 'try-feedback is-correct';
      details.hidden = false; details.open = true;
    } else {
      b.classList.add('is-wrong'); b.disabled = true;
      feedback.textContent = 'לא נכון. נסו שוב, או פתחו את התשובה.'; feedback.className = 'try-feedback is-wrong';
      details.hidden = false;
    }
  });
});

// מודל תלת-ממדי
const locator = document.getElementById('zero-locator');
function webglOk() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}
if (webglOk()) {
  const fallback = locator.querySelector('.zero-fallback');
  const stage = document.createElement('div');
  stage.className = 'b3d-stage b3d-stage-sm';
  locator.insertBefore(stage, locator.querySelector('figcaption'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
  (async () => {
    try {
      const { createBrain3D } = await import('../lib/brain3d.js');
      fallback.hidden = true;
      const view3d = await createBrain3D(stage, {
        glbUrl: `${import.meta.env.BASE_URL}models/brain-cn.glb`,
        reducedMotion, labels: 'active', active: 'terminal', view: 'close', extra: true,
        onSelect: () => view3d?.highlight('terminal'),
      });
      const bar = document.createElement('div');
      bar.className = 'b3d-mini-bar';
      bar.innerHTML = `<div class="b3d-seg" role="group" aria-label="המוח הגדול">`
        + `<button type="button" class="chip" data-shell="ghost" aria-pressed="true">מוח שקוף</button>`
        + `<button type="button" class="chip" data-shell="solid" aria-pressed="false">מוח מלא</button>`
        + `<button type="button" class="chip" data-shell="hidden" aria-pressed="false">בלי מוח</button></div>`
        + `<button type="button" class="chip" data-reset>זווית התחלה</button>`;
      locator.insertBefore(bar, locator.querySelector('figcaption'));
      bar.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.shell) {
          view3d.setShell(b.dataset.shell);
          bar.querySelectorAll('[data-shell]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        } else if (b.hasAttribute('data-reset')) view3d.setView('close');
      });
    } catch (err) {
      console.warn('3D view unavailable', err);
      stage.remove(); fallback.hidden = false;
    }
  })();
}

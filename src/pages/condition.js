// עמוד מצב. ב-build התוכן כבר בעמוד (condition-<id>.html); בשרת הפיתוח הוא נבנה כאן לפי ?id=.
import { CONDITIONS } from '../../content/conditions.js';
import { conditionPage } from '../lib/render.js';
import { SITE } from '../config.js';

const root = document.getElementById('condition-root');
if (!root.firstElementChild) {
  const id = document.documentElement.dataset.conditionId || new URL(location.href).searchParams.get('id');
  const c = CONDITIONS.find((x) => x.id === id);
  root.innerHTML = c ? conditionPage(c) : '<header class="page-head"><h1>העמוד לא נמצא</h1><p class="lead"><a href="./conditions.html">לכל המצבים</a></p></header>';
  if (c) document.title = `${c.title} · מצבים ומחלות · ${SITE.name}`;
}

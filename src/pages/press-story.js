// עמוד סיפור ב"בתקשורת". ב-build התוכן כבר בעמוד (press-<id>.html); בשרת הפיתוח הוא נבנה כאן לפי ?id=.
import { PRESS } from '../../content/press.js';
import { pressStory } from '../lib/render.js';
import { SITE } from '../config.js';

const root = document.getElementById('story-root');
if (!root.firstElementChild) {
  const id = document.documentElement.dataset.storyId || new URL(location.href).searchParams.get('id');
  const x = PRESS.find((s) => s.id === id);
  root.innerHTML = x ? pressStory(x) : '<header class="page-head"><h1>הסיפור לא נמצא</h1><p class="lead"><a href="./press.html">לכל הסיפורים</a></p></header>';
  if (x) document.title = `${x.title} · בתקשורת · ${SITE.name}`;
}

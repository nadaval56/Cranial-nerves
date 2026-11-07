// "בתקשורת": התוכן נבנה מראש ב-build; בשרת הפיתוח הוא נבנה כאן.
import { PRESS } from '../../content/press.js';
import { pressList } from '../lib/render.js';

const root = document.getElementById('press-root');
if (!root.firstElementChild) root.innerHTML = pressList(PRESS);

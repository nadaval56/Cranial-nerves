// "בתקשורת": רשימת הסיפורים נבנית מראש ב-build; בשרת הפיתוח היא נבנית כאן.
import { PRESS } from '../../content/press.js';
import { pressCards } from '../lib/render.js';

const root = document.getElementById('press-root');
if (!root.firstElementChild) root.innerHTML = pressCards(PRESS);

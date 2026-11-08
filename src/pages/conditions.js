// "מצבים ומחלות": הרשימה נבנית מראש ב-build; בשרת הפיתוח היא נבנית כאן.
import { CONDITIONS } from '../../content/conditions.js';
import { conditionCards } from '../lib/render.js';

const root = document.getElementById('conditions-root');
if (!root.firstElementChild) root.innerHTML = conditionCards(CONDITIONS);

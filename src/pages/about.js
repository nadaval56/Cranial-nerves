import { creditsList } from '../lib/render.js';
import { CREDITS } from '../../content/images.js';
import { initLessonNav } from '../lib/lesson-nav.js';

initLessonNav(document.querySelector('.lesson-nav'));

const credits = document.getElementById('credits-root');
if (credits && !credits.firstChild) credits.innerHTML = creditsList(CREDITS);

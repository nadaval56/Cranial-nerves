import { initLessonNav } from '../lib/lesson-nav.js';
import { brainstemSvg } from '../lib/brainstem.js';
import { figure } from '../lib/render.js';
import { IMAGES } from '../../content/images.js';

initLessonNav(document.querySelector('.lesson-nav'));
const fig = document.getElementById('basics-brainstem');
fig.innerHTML = brainstemSvg({ labels: true })
  + '<figcaption class="muted">גזע המוח מלמטה. <a href="./#map-title">למפה האינטראקטיבית</a></figcaption>';

const atlas = document.getElementById('basics-atlas');
if (atlas && !atlas.firstChild) atlas.innerHTML = figure(IMAGES.base, 'pic-atlas');

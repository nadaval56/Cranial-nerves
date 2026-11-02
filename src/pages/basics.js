import { initLessonNav } from '../lib/lesson-nav.js';
import { brainstemSvg } from '../lib/brainstem.js';

initLessonNav(document.querySelector('.lesson-nav'));
const fig = document.getElementById('basics-brainstem');
fig.innerHTML = brainstemSvg({ labels: true })
  + '<figcaption class="muted">גזע המוח מלמטה. <a href="./#map-title">למפה האינטראקטיבית</a></figcaption>';

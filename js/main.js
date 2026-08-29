import { injectIcons } from './icons.js';
import { Balatro } from './ink-atmosphere.js';
import { initInteractions } from './interactions.js';

document.addEventListener('DOMContentLoaded', () => {
  injectIcons();

  const canvas = document.getElementById('ink-atmosphere');
  if (canvas) {
    new Balatro(canvas, {
      color1: '#faf6ef',
      color2: '#d8cfc2',
      color3: '#faf6ef',
      spinRotation: -9,
      spinSpeed: 1.5,
      contrast: 5,
      lighting: 0.3,
      spinAmount: 0.1,
      pixelFilter: 2000,
      isRotate: false,
    });
  }

  initInteractions();
});

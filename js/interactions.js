export function initInteractions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
    document.querySelectorAll('[data-animate-child]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  entranceChoreography();
  setupHoverTracking();
  setupClickFeedback();
  setupDockLabels();
}

function entranceChoreography() {
  const elements = document.querySelectorAll('[data-animate]');
  let delay = 100;

  elements.forEach(el => {
    const type = el.dataset.animate;

    if (type === 'stagger') {
      const children = el.querySelectorAll('[data-animate-child]');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('is-visible'), delay + i * 70);
      });
      delay += children.length * 70 + 100;
    } else {
      setTimeout(() => el.classList.add('is-visible'), delay);
      delay += 140;
    }
  });
}

function setupHoverTracking() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.link').forEach(link => {
    link.addEventListener('mousemove', e => {
      const rect = link.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      link.style.setProperty('--mouse-x', x + '%');
      link.style.setProperty('--mouse-y', y + '%');
    });

    link.addEventListener('mouseenter', () => link.classList.add('is-hovered'));
    link.addEventListener('mouseleave', () => link.classList.remove('is-hovered'));
  });
}

function setupClickFeedback() {
  document.querySelectorAll('.link, .dock__icon').forEach(el => {
    el.addEventListener('pointerdown', () => {
      el.classList.add('is-pressed');
      setTimeout(() => el.classList.remove('is-pressed'), 150);
    });
  });
}

function setupDockLabels() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.dock__icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      const label = icon.querySelector('.dock__label');
      if (label) label.classList.add('is-shown');
    });
    icon.addEventListener('mouseleave', () => {
      const label = icon.querySelector('.dock__label');
      if (label) label.classList.remove('is-shown');
    });
  });
}

const state = { manifest: null };

function symbolMarkup() {
  const scales = [1, .88, .76, .64, .52, .40, .28];
  return `<svg viewBox="0 0 100 120" aria-hidden="true">${scales.map((s, i) => {
    const x = 50 - 43 * s;
    const w = 86 * s;
    return `<path d="M ${x} 7 Q 50 -2 ${x + w} 7 L ${x + w} 113 Q 50 122 ${x} 113 Z" style="opacity:${.18 + i * .12}"/>`;
  }).join('')}</svg>`;
}

async function hydrateImages() {
  try {
    const root = document.documentElement.dataset.root || '';
    const response = await fetch(`${root}assets/media/manifest.json`);
    state.manifest = await response.json();
    document.querySelectorAll('img[data-image]').forEach(img => {
      const item = state.manifest[img.dataset.image];
      if (!item) return;
      const variants = item.variants;
      img.src = `${root}${variants[variants.length - 1].src}`;
      img.srcset = variants.map(v => `${root}${v.src} ${v.width}w`).join(', ');
      img.sizes = img.dataset.sizes || '100vw';
      img.width = item.width;
      img.height = item.height;
      if (!img.hasAttribute('loading') && !img.closest('.project-hero, .home-intro')) img.loading = 'lazy';
      img.decoding = 'async';
    });
  } catch (error) {
    console.error('Media manifest could not be loaded', error);
  }
  document.querySelectorAll('.kiam-cmf-story .sticky-media img').forEach((img, index) => {
    const root = document.documentElement.dataset.root || '';
    img.removeAttribute('srcset');
    img.src = `${root}assets/media/kiam-cmf-hq-${String(index + 1).padStart(2, '0')}.webp`;
  });
  document.querySelectorAll('.kiam-case .trend-section .principle-card').forEach((card, index) => {
    if (index > 2 || card.querySelector('.trend-reference')) return;
    const root = document.documentElement.dataset.root || '';
    const image = document.createElement('img');
    image.className = 'trend-reference';
    image.src = `${root}assets/media/kiam-trend-hq-${String(index + 1).padStart(2, '0')}.webp`;
    image.alt = ['Adaptable gathering and entertainment reference', 'Lighting and human interaction reference', 'Shared warmth reference'][index];
    card.prepend(image);
  });
}

function setupLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  const count = loader.querySelector('.loader-count');
  const start = performance.now();
  const tick = now => {
    const value = Math.min(99, Math.floor((now - start) / 7));
    if (count) count.textContent = `${String(value).padStart(2, '0')} / 100`;
    if (value < 99) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.addEventListener('load', () => {
    if (count) count.textContent = '100 / 100';
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, 320);
  }, { once: true });
  setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  }, 2600);
}

function setupNav() {
  const toggle = document.querySelector('.menu-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  }));
}

function setupReveals() {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach(n => n.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  nodes.forEach(n => observer.observe(n));
}

function setupProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  let raf = 0;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max ? scrollY / max : 0})`;
    raf = 0;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

function setupStickyStories() {
  document.querySelectorAll('.sticky-story').forEach(story => {
    const images = [...story.querySelectorAll('.sticky-media img')];
    const steps = [...story.querySelectorAll('.story-step')];
    if (!images.length || images.length !== steps.length) return;
    const activate = index => images.forEach((image, i) => image.classList.toggle('is-active', i === index));
    activate(0);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activate(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
    steps.forEach(step => observer.observe(step));
  });
}

function setupParallax() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const images = document.querySelectorAll('[data-parallax]');
  let raf = 0;
  const update = () => {
    images.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const progress = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      img.style.transform = `scale(1.04) translateY(${progress * -2.2}%)`;
    });
    raf = 0;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.site-footer .socials').forEach(socials => {
    if (socials.querySelector('a[href^="mailto:"]')) return;
    const email = document.createElement('a');
    email.href = 'mailto:shahtabsajid@gmail.com';
    email.textContent = 'shahtabsajid@gmail.com';
    socials.prepend(email);
  });
  const symbol = document.querySelector('.corner-symbol');
  if (symbol) {
    symbol.innerHTML = symbolMarkup();
    const footer = document.querySelector('.site-footer');
    if (footer) footer.appendChild(symbol);
  }
  setupLoader();
  setupNav();
  await hydrateImages();
  setupReveals();
  setupProgress();
  setupStickyStories();
  setupParallax();
});

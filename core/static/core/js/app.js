/**
 * Nandhana TK — Portfolio App JS
 * Modules: Preloader · Three.js BG · Cursor · Navbar · Scroll ·
 *          Hero 3D Profile · Typewriter · Orbit · Counters · Reveal ·
 *          Timeline · Project Filters · Spotlight · Testimonials ·
 *          GitHub Grid · Contact Form · Back-to-Top · Command Palette ·
 *          Konami Code Easter Egg
 */

'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILITIES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.matchMedia('(hover:none) and (pointer:coarse)').matches;
const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. PRELOADER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initPreloader() {
  const preloader = $('#preloader');
  const bar       = $('#preloader-bar');
  const pct       = $('#preloader-pct');
  if (!preloader) return;

  let progress = 0;
  const target  = 100;
  const step    = isReducedMotion() ? 100 : 2;
  const delay   = isReducedMotion() ? 0   : 20;

  const tick = () => {
    progress = Math.min(progress + step + Math.random() * 3, target);
    const p = Math.round(progress);
    if (bar) bar.style.width = p + '%';
    if (pct) pct.textContent  = p + '%';
    if (progress < target) {
      setTimeout(tick, delay + Math.random() * 20);
    } else {
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        // Trigger hero animations now that preloader is gone
        initHeroAnimations();
      }, 350);
    }
  };

  document.body.style.overflow = 'hidden';
  setTimeout(tick, 200);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. THREE.JS BACKGROUND — floating particle mesh
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initThreeBackground() {
  const canvas = $('#three-canvas');
  if (!canvas || typeof THREE === 'undefined' || isMobile() || isReducedMotion()) {
    // Fallback: simple CSS background
    document.body.style.backgroundColor = '#060a12';
    return;
  }

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  camera.position.z = 5;

  // Particle geometry
  const PARTICLE_COUNT = 1200;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const colors     = new Float32Array(PARTICLE_COUNT * 3);

  const colorPalette = [
    new THREE.Color('#00f0ff'),
    new THREE.Color('#7c3aed'),
    new THREE.Color('#e040fb'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
    velocities.push({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.003,
      z: 0,
    });
    const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Mouse tracking
  const mouse = { x: 0, y: 0 };
  let scrollY = 0;

  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // Pause when tab hidden (performance)
  let paused = false;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  // Animation loop
  let animId;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    if (paused) return;

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      // Wrap around
      if (pos[i3]     >  10) pos[i3]     = -10;
      if (pos[i3]     < -10) pos[i3]     =  10;
      if (pos[i3 + 1] >  10) pos[i3 + 1] = -10;
      if (pos[i3 + 1] < -10) pos[i3 + 1] =  10;
    }
    geometry.attributes.position.needsUpdate = true;

    // Camera parallax from mouse
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.03;

    // Rotate entire particle field slowly
    points.rotation.y += 0.0003;
    points.rotation.x = scrollY * 0.0002;

    renderer.render(scene, camera);
  };

  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. CUSTOM CURSOR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initCursor() {
  if (isMobile()) return;
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let dX = 0, dY = 0, rX = 0, rY = 0;

  document.addEventListener('mousemove', e => { dX = e.clientX; dY = e.clientY; });

  const animCursor = () => {
    rX = lerp(rX, dX, 0.12);
    rY = lerp(rY, dY, 0.12);
    dot.style.left  = dX + 'px';
    dot.style.top   = dY + 'px';
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    requestAnimationFrame(animCursor);
  };
  animCursor();

  // Morph on hoverable elements
  const hoverSel = 'a, button, .btn-mag, .btn-sm, .project-card, .service-card, .filter-btn, .t-dot, .cmd-item, .contact-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) ring.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) ring.classList.remove('hovering');
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. SCROLL PROGRESS BAR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. NAVBAR — hide/show on scroll + active link
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (!navbar) return;

  let lastY = 0;
  let menuOpen = false;

  const updateNav = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);

    // Hide/show logic
    if (y > 150) {
      if (y > lastY) {
        navbar.classList.add('hide');
        navbar.classList.remove('show');
      } else {
        navbar.classList.remove('hide');
        navbar.classList.add('show');
      }
    } else {
      navbar.classList.remove('hide', 'show');
    }
    lastY = y;

    // Back to top
    const backTop = $('#back-top');
    if (backTop) backTop.classList.toggle('visible', y > 500);
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Hamburger / mobile menu toggle
  const toggleMenu = () => {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('is-open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  };

  hamburger?.addEventListener('click', toggleMenu);

  // Close on mobile link click
  $$('.mobile-link').forEach(a => {
    a.addEventListener('click', () => {
      if (menuOpen) toggleMenu();
    });
  });

  // Active link on scroll
  const sections = $$('section[id], header[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll for nav links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#!') return;
      const target = $(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Back to top
  const backTop = $('#back-top');
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. HERO 3D PROFILE TILT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initProfileTilt() {
  const wrap = $('#profileWrap');
  const tilt = $('#profileTilt');
  if (!wrap || !tilt || isMobile() || isReducedMotion()) {
    // Auto-float on mobile
    if (wrap) wrap.style.animation = 'blobFloat 6s ease-in-out infinite';
    return;
  }

  const MAX_TILT = 18;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rotX = clamp(-dy / (rect.height / 2) * MAX_TILT, -MAX_TILT, MAX_TILT);
    const rotY = clamp( dx / (rect.width  / 2) * MAX_TILT, -MAX_TILT, MAX_TILT);
    tilt.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  wrap.addEventListener('mouseleave', () => {
    tilt.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    tilt.style.transform  = 'rotateX(0deg) rotateY(0deg)';
    setTimeout(() => { tilt.style.transition = 'transform 0.1s linear'; }, 600);
  });

  wrap.addEventListener('mouseenter', () => {
    tilt.style.transition = 'transform 0.1s linear';
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   7. ORBITING TECH ICONS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initOrbit() {
  const icons = $$('.orbit-icon');
  if (!icons.length || isReducedMotion()) return;

  const count  = icons.length;
  const radius = 140;
  let angle    = 0;

  // Position each icon
  const updatePositions = (offsetAngle) => {
    icons.forEach((icon, i) => {
      const a = (offsetAngle + (i / count) * 360) * (Math.PI / 180);
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      icon.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    });
  };

  const animate = () => {
    angle += 0.25;
    updatePositions(angle);
    requestAnimationFrame(animate);
  };

  animate();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   8. TYPEWRITER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const phrases = [
    'Python Full-Stack Developer',
    'Django & React Specialist',
    'REST API Architect',
    'Full-Cycle Problem Solver',
  ];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function run() {
    let idx = 0;
    await sleep(1800);
    while (true) {
      const phrase = phrases[idx % phrases.length];
      for (let i = 0; i <= phrase.length; i++) {
        el.textContent = phrase.slice(0, i);
        await sleep(60 + Math.random() * 30);
      }
      await sleep(2000);
      for (let i = phrase.length; i >= 0; i--) {
        el.textContent = phrase.slice(0, i);
        await sleep(30);
      }
      await sleep(400);
      idx++;
    }
  }
  run();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   9. TEXT SCRAMBLE REVEAL FOR HERO NAME
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initNameScramble() {
  const el = $('#heroName');
  if (!el || isReducedMotion()) return;

  const original = el.textContent;
  const chars    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
  let frame      = 0;
  let rafId;

  const scramble = () => {
    let output = '';
    const maxFrames = 20;
    for (let i = 0; i < original.length; i++) {
      if (original[i] === ' ') { output += ' '; continue; }
      if (frame > i * (maxFrames / original.length)) {
        output += original[i];
      } else {
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = output;
    frame++;
    if (frame <= maxFrames) {
      rafId = requestAnimationFrame(scramble);
    } else {
      el.textContent = original;
      el.classList.add('shimmer-active');
    }
  };

  // Start after preloader-ish delay
  setTimeout(() => { frame = 0; scramble(); }, 800);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   10. HERO ANIMATIONS (called after preloader hides)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initHeroAnimations() {
  initNameScramble();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   11. CTA RIPPLE EFFECT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initRipple() {
  $$('.btn-mag').forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.width  = ripple.style.height = size + 'px';
      ripple.style.left   = (e.clientX - rect.left  - size / 2) + 'px';
      ripple.style.top    = (e.clientY - rect.top   - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   12. SCROLL REVEAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  // Stagger siblings
  $$('.skills-layout .reveal, .projects-grid .reveal, .services-grid .reveal').forEach((el, i) => {
    if (!el.style.transitionDelay) el.style.transitionDelay = (i * 0.08) + 's';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);

        // Trigger counter if stat-num inside
        entry.target.querySelectorAll('.stat-num[data-count]').forEach(animateCounter);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   13. ANIMATED COUNTERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function animateCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix || '+';
  const duration = 1200;
  const start    = performance.now();

  const update = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(update);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   14. TIMELINE DRAW
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initTimeline() {
  const timeline = $('#timeline');
  if (!timeline || isReducedMotion()) {
    timeline?.classList.add('draw');
    return;
  }
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      timeline.classList.add('draw');
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(timeline);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   15. PROJECT FILTER TABS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initProjectFilters() {
  const btns  = $$('.filter-btn');
  const cards = $$('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        const match = filter === 'all' || tags.split(' ').includes(filter);
        if (match) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   16. PROJECT CARD CURSOR SPOTLIGHT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initCardSpotlight() {
  $$('.project-card').forEach(card => {
    const spot = card.querySelector('.card-spotlight');
    if (!spot) return;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      spot.style.left = (e.clientX - rect.left) + 'px';
      spot.style.top  = (e.clientY - rect.top)  + 'px';
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   17. VANILLA TILT — project cards
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initCardTilt() {
  if (typeof VanillaTilt === 'undefined' || isMobile() || isReducedMotion()) return;
  VanillaTilt.init($$('.project-card'), {
    max: 8,
    speed: 400,
    glare: true,
    'max-glare': 0.15,
    perspective: 1000,
    scale: 1.02,
    easing: 'cubic-bezier(.03,.98,.52,.99)',
  });
  VanillaTilt.init($$('.service-card,.about-card'), {
    max: 6,
    speed: 400,
    glare: false,
    perspective: 1000,
    scale: 1.01,
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   18. TESTIMONIALS CAROUSEL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initTestimonials() {
  const slides = $$('.testimonial-slide');
  const dots   = $$('.t-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const goTo = idx => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected','false');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected','true');
  };

  const autoPlay = () => { timer = setInterval(() => goTo(current + 1), 5000); };
  const stop     = ()  => clearInterval(timer);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stop();
      goTo(parseInt(dot.dataset.idx, 10));
      autoPlay();
    });
  });

  autoPlay();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   19. GITHUB CONTRIBUTION GRID (decorative)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initGithubGrid() {
  const grid = $('#contribGrid');
  if (!grid) return;
  const weeks = 26, days = 7;
  const levels = ['', 'l1', 'l2', 'l3', 'l4'];
  // Simulate activity pattern — denser toward recent weeks
  for (let d = 0; d < days; d++) {
    const row = document.createElement('div');
    row.className = 'contrib-row';
    for (let w = 0; w < weeks; w++) {
      const cell = document.createElement('div');
      cell.className = 'contrib-cell';
      const activity = Math.random();
      const bias     = w / weeks; // more activity in recent weeks
      if (activity < 0.25 - bias * 0.1) cell.classList.add('');
      else if (activity < 0.5)           cell.classList.add('l1');
      else if (activity < 0.7)           cell.classList.add('l2');
      else if (activity < 0.88)          cell.classList.add('l3');
      else                               cell.classList.add('l4');
      cell.title = `${Math.round(activity * 5)} contributions`;
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   20. CONTACT FORM (AJAX + CSRF)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initContactForm() {
  const form   = $('#contactForm');
  const submit = $('#formSubmit');
  const msg    = $('#formMsg');
  if (!form) return;

  const csrfToken = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('csrftoken='))
    ?.split('=')[1]
    || document.querySelector('[name=csrfmiddlewaretoken]')?.value
    || '';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    // Basic client-side validation
    const name    = $('#contactName')?.value.trim();
    const email   = $('#contactEmail')?.value.trim();
    const message = $('#contactMsg')?.value.trim();

    if (!name || !email || !message) {
      msg.textContent = '⚠️ Please fill in all fields.';
      msg.classList.add('error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      msg.textContent = '⚠️ Please enter a valid email address.';
      msg.classList.add('error');
      return;
    }

    submit.disabled = true;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending…</span>';

    try {
      const res = await fetch('/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (data.success) {
        msg.textContent = '✅ Message sent! I\'ll get back to you soon.';
        msg.classList.add('success');
        form.reset();
      } else {
        msg.textContent = '❌ ' + (data.error || 'Something went wrong. Please try again.');
        msg.classList.add('error');
      }
    } catch {
      msg.textContent = '❌ Network error. Please try again or email me directly.';
      msg.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Message</span>';
    }
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   21. COMMAND PALETTE (Ctrl+K)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initCommandPalette() {
  const palette = $('#cmd-palette');
  if (!palette) return;

  const items = $$('.cmd-item');
  let selectedIdx = 0;

  const open  = () => { palette.classList.add('open'); highlightItem(0); };
  const close = () => { palette.classList.remove('open'); };

  const highlightItem = idx => {
    items.forEach((it, i) => it.classList.toggle('active', i === idx));
    selectedIdx = idx;
  };

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      palette.classList.contains('open') ? close() : open();
      return;
    }
    if (!palette.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); highlightItem((selectedIdx + 1) % items.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); highlightItem((selectedIdx - 1 + items.length) % items.length); }
    if (e.key === 'Enter') {
      const target = items[selectedIdx]?.dataset.target;
      if (target) {
        close();
        const el = $(target);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }
  });

  // Click on item
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      close();
      const el = $(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
    item.addEventListener('mouseenter', () => highlightItem(i));
  });

  // Click outside closes
  palette.addEventListener('click', e => { if (e.target === palette) close(); });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   22. KONAMI CODE EASTER EGG
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initKonami() {
  const code    = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress  = 0;

  document.addEventListener('keydown', e => {
    if (e.key === code[progress]) {
      progress++;
      if (progress === code.length) {
        progress = 0;
        triggerKonami();
      }
    } else {
      progress = 0;
    }
  });

  function triggerKonami() {
    const el = document.createElement('div');
    el.innerHTML = '🎉 You found the easter egg! <br><small style="font-family:monospace;font-size:0.8em">Nandhana TK — Full-Stack Developer 🚀</small>';
    Object.assign(el.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      background: 'linear-gradient(135deg,#00f0ff,#7c3aed)',
      color: '#000', padding: '2rem 3rem',
      borderRadius: '20px', zIndex: '999999',
      fontSize: '1.3rem', fontWeight: '700',
      textAlign: 'center', boxShadow: '0 0 80px rgba(0,240,255,0.6)',
      animation: 'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INIT — wire everything up on DOMContentLoaded
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();           // 1 — Must be first
  initThreeBackground();     // 2 — Three.js canvas
  initCursor();              // 3 — Custom cursor
  initScrollProgress();      // 4 — Progress bar
  initNavbar();              // 5 — Nav + smooth scroll
  initProfileTilt();         // 6 — 3D profile tilt
  initOrbit();               // 7 — Tech icon orbit
  initTypewriter();          // 8 — Typewriter effect
  initRipple();              // 11 — CTA ripple
  initScrollReveal();        // 12 — Scroll-triggered reveals
  initTimeline();            // 14 — Animated timeline
  initProjectFilters();      // 15 — Project filter tabs
  initCardSpotlight();       // 16 — Cursor spotlight on cards
  initCardTilt();            // 17 — VanillaTilt 3D tilt
  initTestimonials();        // 18 — Testimonials carousel
  initGithubGrid();          // 19 — GitHub contribution grid
  initContactForm();         // 20 — Contact form AJAX
  initCommandPalette();      // 21 — Ctrl+K palette
  initKonami();              // 22 — Konami code easter egg
});

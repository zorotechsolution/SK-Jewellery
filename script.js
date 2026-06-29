/* ============================================================
   SK JEWELLERY & GOLD — script.js
   ============================================================ */


// ── NAVBAR ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

const whatsappForm = document.getElementById('whatsappForm');
if (whatsappForm) {
  whatsappForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(whatsappForm);
    const name = formData.get('name').trim();
    const phone = formData.get('phone').trim();
    const message = formData.get('message').trim();
    if (!name || !phone || !message) return;

    const whatsappText = `Hello SK jewellery & gold,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    const whatsappUrl = `https://wa.me/917812839506?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  });
}

// ── SPARKLE CANVAS PARTICLES ────────────────────────────────
const canvas = document.getElementById('sparkleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = -(Math.random() * 0.5 + 0.2);
    this.life = 0;
    this.maxLife = Math.random() * 180 + 60;
    this.color = Math.random() > 0.5 ? '#D4AF37' : '#E8C547';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life > this.maxLife) this.reset();
    this.currentOpacity = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.currentOpacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    // Draw a 4-point star
    const s = this.size;
    ctx.translate(this.x, this.y);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.lineTo(s, s * 0.3);
      ctx.lineTo(s * 2, 0);
      ctx.lineTo(s, -s * 0.3);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 60; i++) {
  const p = new Particle();
  p.life = Math.floor(Math.random() * p.maxLife);
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger cards within grids
      const siblings = entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      let delay = 0;
      siblings.forEach((sib, idx) => {
        if (sib === entry.target) delay = idx * 80;
      });
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ── ANIMATED COUNTERS ────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

// ── TESTIMONIAL SLIDER ───────────────────────────────────────
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const cards = Array.from(document.querySelectorAll('.testimonial-card'));
let current = 0;
let autoSlideInterval;

// Determine cards visible
function getVisibleCount() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function getMaxIndex() {
  return Math.max(0, cards.length - getVisibleCount());
}

function createDots() {
  dotsContainer.innerHTML = '';
  const count = getMaxIndex() + 1;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

function goTo(idx) {
  const max = getMaxIndex();
  current = Math.max(0, Math.min(idx, max));
  const cardWidth = cards[0].offsetWidth + 28; // gap
  track.style.transform = `translateX(-${current * cardWidth}px)`;
  updateDots();
}

prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

function startAuto() {
  autoSlideInterval = setInterval(() => {
    const max = getMaxIndex();
    goTo(current >= max ? 0 : current + 1);
  }, 4000);
}

function resetAuto() {
  clearInterval(autoSlideInterval);
  startAuto();
}

// Touch swipe
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? goTo(current + 1) : goTo(current - 1);
    resetAuto();
  }
});

function initSlider() {
  createDots();
  goTo(0);
  startAuto();
}

initSlider();
window.addEventListener('resize', () => { createDots(); goTo(Math.min(current, getMaxIndex())); });

// ── BACK TO TOP ──────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── ABOUT BACKGROUND CAROUSEL ────────────────────────────────
(function () {
  const slides = document.querySelectorAll('.about-slide');
  if (!slides.length) return;

  let current = 0;
  const INTERVAL = 6000; // ms between transitions

  function goToSlide(next) {
    const prev = current;
    current = next % slides.length;

    // Remove active from old slide
    slides[prev].classList.remove('active');
    slides[prev].classList.add('prev');

    // Reset Ken Burns on next slide by forcing reflow
    slides[current].classList.remove('active');
    void slides[current].offsetWidth; // trigger reflow
    slides[current].classList.add('active');
    slides[current].classList.remove('prev');

    // Clean up 'prev' after transition completes
    setTimeout(() => slides[prev].classList.remove('prev'), 1500);
  }

  setInterval(() => goToSlide(current + 1), INTERVAL);
})();

// ── ACTIVE NAV LINK ON SCROLL ────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let found = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) found = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === '#' + found) {
      a.style.color = 'var(--gold)';
    }
  });
});

// ── HERO IMAGE CAROUSEL ─────────────────────────────────────
(function () {
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!slides.length) return;

  let current = 0;
  let autoTimer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Touch swipe support
  let touchStartX = 0;
  const carouselEl = document.getElementById('heroCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });
  }

  startAuto();
})();

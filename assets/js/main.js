/* =========================================================
   Astelsia — animations
   GSAP + ScrollTrigger + SplitText + Lenis.
   Plus on descend, plus ça s'anime. Rien ne bouge si
   l'appareil demande à réduire les animations.
   Scroll libre : rien n'est épinglé, les textes s'allument et
   s'effacent au fil du scroll, le ciel change jusqu'au paysage.
   ========================================================= */
(function () {
  'use strict';
  window.__astelsiaReady = true;
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Coordonnées (assets/js/config.js) ---------- */
  var C = window.ASTELSIA_CONTACT || {};
  function setText(a, t) { var el = a.querySelector('[data-contact-text]') || a; el.textContent = t; }
  document.querySelectorAll('[data-contact="phone"]').forEach(function (a) {
    if (!C.phone) return;
    setText(a, C.phone);
    a.href = 'tel:+33' + C.phone.replace(/\D/g, '').replace(/^0/, '');
  });
  document.querySelectorAll('[data-contact="email"]').forEach(function (a) { if (C.email) setText(a, C.email); });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Halo sur les formules (SpotlightCard) ---------- */
  if (finePointer) {
    document.querySelectorAll('.plan').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Lucioles ---------- */
  (function () {
    var box = document.querySelector('.fireflies');
    if (!box) return;
    var n = window.innerWidth < 700 ? 9 : 18;
    for (var i = 0; i < n; i++) {
      var f = document.createElement('i');
      f.style.left = (4 + Math.random() * 92) + '%';
      f.style.bottom = (3 + Math.random() * 38) + '%';
      f.style.setProperty('--d', (6 + Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--b', (2 + Math.random() * 3).toFixed(1) + 's');
      f.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--dx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
      f.style.setProperty('--dy', (-10 - Math.random() * 50).toFixed(0) + 'px');
      box.appendChild(f);
    }
  })();

  /* ---------- Le logo recharge la page ---------- */
  var logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', function (e) {
    e.preventDefault();
    try { history.scrollRestoration = 'manual'; } catch (err) {}
    window.scrollTo(0, 0);
    location.reload();
  });

  /* ---------- Menu plein écran ---------- */
  var menuBtn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-btn__label').textContent = open ? 'Fermer' : 'Menu';
    menu.setAttribute('aria-hidden', String(!open));
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    var mail = menu.querySelector('[data-contact-mail]'); if (mail && C.email) mail.textContent = C.email;
  }

  /* ---------- Poussière d'étoile derrière la souris (ordinateur) ---------- */
  if (finePointer && !reduced) (function () {
    var cv = document.createElement('canvas'); cv.className = 'sparkles'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), parts = [], runningS = false, dprS = Math.min(devicePixelRatio || 1, 2), lx = null, ly = null;
    function size() { cv.width = innerWidth * dprS; cv.height = innerHeight * dprS; ctx.setTransform(dprS, 0, 0, dprS, 0, 0); }
    size(); addEventListener('resize', size);
    addEventListener('pointermove', function (e) {
      var d = lx === null ? 0 : Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
      var n = Math.min(4, 1 + Math.floor(d / 14));
      for (var i = 0; i < n; i++) parts.push({ x: e.clientX + (Math.random() - 0.5) * 6, y: e.clientY + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 0.4, vy: 0.2 + Math.random() * 0.5, r: 0.6 + Math.random() * 1.8, life: 1, gold: Math.random() < 0.7 });
      if (parts.length > 160) parts.splice(0, parts.length - 160);
      if (!runningS) { runningS = true; requestAnimationFrame(tick); }
    }, { passive: true });
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.022;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * p.life;
        ctx.fillStyle = p.gold ? '#ffd98a' : '#ffffff';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(tick); else runningS = false;
    }
  })();

  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Scroll fluide Lenis (ordinateur) synchronisé avec GSAP ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  /* ---------- Clic sur un lien du menu : une longue descente, douce ---------- */
  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var glide = null;
  function stopGlide() { if (glide) { glide.kill(); glide = null; } }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopGlide, { passive: true }); });
  function scrollToTarget(target) {
    var y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
    y = Math.max(0, Math.min(y, ScrollTrigger.maxScroll(window)));
    var dist = Math.abs(y - window.scrollY);
    var dur = Math.min(3.6, 1.4 + dist / 2600); // plus c'est loin, plus la descente dure
    if (lenis) { lenis.scrollTo(y, { duration: dur, easing: easeIO, force: true }); return; }
    stopGlide();
    var o = { y: window.scrollY };
    glide = gsap.to(o, { y: y, duration: reduced ? Math.min(dur, 1.6) : dur, ease: 'power2.inOut', onUpdate: function () { window.scrollTo(0, o.y); }, onComplete: function () { glide = null; } });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });
  /* ---------- En-tête qui se cache en descendant ---------- */
  var header = document.querySelector('.header');
  ScrollTrigger.create({
    start: 0, end: function () { return ScrollTrigger.maxScroll(window); },
    onUpdate: function (self) {
      var y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 300 && self.direction === 1);
    }
  });

  /* ---------- Boutons aimantés (souris uniquement) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.btn--magnet').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  var scene = window.AstelsiaScene;

  /* =========================================================
     Les scènes
     ========================================================= */
  var mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 899px)', desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
    var c = ctx.conditions, g = c.reduce; // mode doux : fondus uniquement

    /* 1. Les phrases : chacune s'allume en arrivant au centre, puis s'efface en remontant */
    gsap.utils.toArray('.tl-line').forEach(function (l) {
      gsap.timeline({ scrollTrigger: { trigger: l, start: 'top 95%', end: 'bottom 5%', scrub: true } })
        .fromTo(l, { opacity: 0, y: g ? 0 : 60, scale: g ? 1 : 0.96 }, { opacity: 1, y: 0, scale: 1, ease: 'power2.out', duration: 0.4 })
        .to(l, { opacity: 1, duration: 0.2 })
        .to(l, { opacity: 0, y: g ? 0 : -60, scale: g ? 1 : 1.03, ease: 'power2.in', duration: 0.4 });
    });

    /* 2. Formules (ordinateur) : les cartes se lèvent une fois */
    if (c.desktop) {
      gsap.from(['.plan-preview', '.plan[data-plan="solo"]', '.plan[data-plan="business"]', '.plan[data-plan="signature"]'], {
        y: g ? 0 : 80, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true }
      });
    }

    /* 3. Le ciel : nuit → heure bleue → paysage */
    var sc = g ? true : 0.6;
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.trailer', start: 'top 70%', endTrigger: '#formules', end: 'top 30%', scrub: sc } })
      .to('.sky--night', { opacity: 0 }, 0)
      .to('.stars', g ? { opacity: 0.55 } : { opacity: 0.55, yPercent: -15 }, 0);

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#formules', start: 'top 30%', endTrigger: '#serenite', end: 'center center', scrub: sc,
        onUpdate: function (self) { if (scene) scene.setStarsActive(self.progress < 0.95); }
      }
    })
      .to('.sky--twilight', { opacity: 0, duration: 1 }, 0)
      .fromTo('.clouds', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.1)
      .to('.stars', g ? { opacity: 0, duration: 1 } : { opacity: 0, yPercent: -35, duration: 1 }, 0)
      .fromTo('.moon', { opacity: 0, y: g ? 0 : '20vh' }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .to('.glow', { opacity: 1, duration: 0.6 }, 0.4);

    var land = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#contact', start: 'top 95%', endTrigger: '.footer', end: 'bottom bottom', scrub: sc } });
    if (g) {
      land.fromTo('.land', { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
    } else {
      [['.layer--far', 100], ['.layer--mid', 110], ['.layer--tree', 125], ['.layer--front', 150]].forEach(function (l, i) {
        land.fromTo(l[0], { yPercent: l[1] }, { yPercent: 0, duration: 1 - i * 0.08, ease: 'power1.out' }, i * 0.04);
      });
    }
    land.to('.fireflies', { opacity: 1, duration: 0.3 }, 0.7);
  });

  /* ---------- Apparitions au scroll ---------- */
  gsap.set('[data-reveal]', { y: reduced ? 0 : 30 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }); }
  });

  /* ---------- Textes qui se révèlent (SplitText) ; l'accueil attend la fin du chargement ---------- */
  function splitReveal() {
    if (!window.SplitText) { root.classList.remove('anim'); return; }
    var hero = document.querySelector('[data-hero-title]');
    SplitText.create(hero, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: function (s) {
        gsap.set(hero, { visibility: 'visible' });
        var intro = gsap.timeline({ delay: 0.35, paused: true });
        intro.from(s.words, reduced ? { opacity: 0, duration: 0.8, stagger: 0.05 } : { yPercent: 115, rotate: 4, duration: 1, ease: 'power4.out', stagger: 0.06 })
             .fromTo('.hero__in', { opacity: 0, y: reduced ? 0 : 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }, '-=0.6');
        (window.__loaderDone || Promise.resolve()).then(function () { intro.play(); });
        return intro;
      }
    });
    document.querySelectorAll('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (s) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(s.lines, { yPercent: reduced ? 0 : 110, opacity: reduced ? 0 : 1, duration: 1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        }
      });
    });
    ScrollTrigger.refresh();
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitReveal);
})();

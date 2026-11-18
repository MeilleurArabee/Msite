/* =========================================================
   Aube — les animations de l'accueil (GSAP + ScrollTrigger)
   • AUBE : les lettres montent en rebondissant, sautent quand on les survole ;
   • les mots défilent à l'horizontale, chaque lettre arrive en sautillant ;
   • les cartes produits suivent la souris et s'envolent quand on la retire ;
   • les cartes « Ce qu'on vous prépare » s'écartent en éventail ;
   • un clic sur le logo : un grand gribouillis safran et retour en haut.
   Mode doux : de simples fondus, rien ne bouge en grand.
   ========================================================= */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var soft = root.classList.contains('soft');
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var g = window.gsap, ST = window.ScrollTrigger;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  if (!g) return;
  if (ST) g.registerPlugin(ST);
  var lenis = window.__lenis;
  if (lenis && ST) lenis.on('scroll', ST.update);
  var R = function (a, b) { return a + Math.random() * (b - a); };

  // découpe un texte en lettres (en gardant l'italique)
  function split(el) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split('').forEach(function (ch) {
            if (ch === ' ') { frag.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'letter'; s.textContent = ch; frag.appendChild(s); out.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return out;
  }

  /* ---------- 1. Le héros ---------- */
  var word = $('[data-word]');
  if (word) {
    var chs = split(word);
    chs.forEach(function (c) { c.classList.add('ch'); });
    var ring = $('.ring path');
    if (soft) {
      g.from([word, '.hero__top'], { opacity: 0, duration: 1.1, stagger: .15 });
    } else {
      g.from(chs, { yPercent: 115, rotation: function () { return R(-16, 16); }, duration: 1.5, ease: 'elastic.out(1, .55)', stagger: .09, delay: .1 });
      g.from('.hero__top > *', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: .12, delay: .5 });
      g.from('.hero .sticker--star', { scale: 0, rotation: -90, duration: 1.2, ease: 'elastic.out(1, .5)', delay: 1 });
      // survoler (ou toucher) une lettre la fait sauter
      chs.forEach(function (c) {
        function jump() { g.fromTo(c, { y: 0 }, { y: -R(28, 48), rotation: R(-12, 12), duration: .28, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' }); }
        c.addEventListener(fine ? 'pointerenter' : 'pointerdown', jump);
      });
      // en descendant, les lettres s'envolent l'une après l'autre
      if (ST) g.fromTo(chs, { yPercent: 0, rotation: 0 }, { yPercent: function (i) { return -18 - i * 14; }, rotation: function (i) { return (i % 2 ? 1 : -1) * (3 + i * 2); }, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    if (ring) g.fromTo(ring, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: soft ? .01 : 1.2, ease: 'power2.inOut', delay: soft ? 0 : 1.1 });
  }

  /* ---------- 2. Les mots qui défilent à l'horizontale ---------- */
  var words = $('[data-words]'), track = words && $('[data-track]', words);
  if (words && track && ST && !soft) {
    var letters = []; $$('.w', track).forEach(function (w) { letters = letters.concat(split(w)); });
    words.classList.add('is-h');
    var distance = function () { return track.scrollWidth + innerWidth * 0.1; };
    var tl = g.timeline({ scrollTrigger: { trigger: words, start: 'top top', end: function () { return '+=' + distance(); }, pin: true, scrub: 1, invalidateOnRefresh: true } });
    tl.fromTo(track, { x: function () { return innerWidth * 0.6; } }, { x: function () { return -(track.scrollWidth - innerWidth * 0.75); }, ease: 'none' });
    letters.forEach(function (l) {
      g.from(l, { yPercent: R(-250, 250), rotation: R(-35, 35), ease: 'elastic.out(1.2, 1)', scrollTrigger: { trigger: l, containerAnimation: tl, start: 'left 98%', end: 'left 58%', scrub: .5 } });
    });
    $$('[data-pop]', track).forEach(function (p) {
      g.from(p, { scale: 0, yPercent: R(-120, 120), rotation: R(-40, 40), ease: 'elastic.out(1.2, 1)', scrollTrigger: { trigger: p, containerAnimation: tl, start: 'left 98%', end: 'left 55%', scrub: .5 } });
    });
    $$('.words__arrow path', track).forEach(function (p) {
      g.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.parentNode, containerAnimation: tl, start: 'left 90%', end: 'left 50%', scrub: .5 } });
    });
    var fontsReady = d.fonts && d.fonts.ready;
    if (fontsReady) fontsReady.then(function () { ST.refresh(); });
    addEventListener('load', function () { ST.refresh(); });
  } else if (words) {
    g.from($$('.w, [data-pop]', track), { opacity: 0, duration: 1, stagger: .08, scrollTrigger: ST ? { trigger: words, start: 'top 75%' } : undefined });
  }

  /* ---------- 3. Les cartes produits : elles suivent la souris, puis s'envolent ---------- */
  var cards = $$('[data-mcard]');
  if (cards.length) {
    if (ST) g.from(cards, { y: soft ? 0 : 90, rotation: soft ? 0 : function () { return R(-7, 7); }, opacity: 0, duration: soft ? .8 : 1.3, ease: soft ? 'power1.out' : 'elastic.out(1, .7)', stagger: .1, scrollTrigger: { trigger: '.cards', start: 'top 85%' } });
    if (!soft) cards.forEach(function (card) {
      var lx = 0, ly = 0, lt = 0, vx = 0, vy = 0;
      var qx = g.quickTo(card, 'x', { duration: .6, ease: 'power3' }), qy = g.quickTo(card, 'y', { duration: .6, ease: 'power3' }), qr = g.quickTo(card, 'rotation', { duration: .6, ease: 'power3' });
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var t = performance.now(), dt = Math.max(8, t - lt);
        vx = (e.clientX - lx) / dt; vy = (e.clientY - ly) / dt; lx = e.clientX; ly = e.clientY; lt = t;
        var r = card.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        qx(dx * .1); qy(dy * .1); qr(g.utils.clamp(-8, 8, vx * 6 + dx * .02));
      });
      card.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        g.killTweensOf(card);
        var fx = g.utils.clamp(-90, 90, vx * 140), fy = g.utils.clamp(-90, 90, vy * 140);
        g.timeline()
          .to(card, { x: fx, y: fy, rotation: g.utils.clamp(-14, 14, vx * 22), duration: .3, ease: 'power2.out' })
          .to(card, { x: 0, y: 0, rotation: 0, duration: 1.6, ease: 'elastic.out(1, .32)' });
        vx = vy = 0;
      });
      // au doigt : la carte fait un petit bond
      card.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' || e.target.closest('button')) return;
        g.fromTo(card, { rotation: 0, y: 0 }, { rotation: R(-5, 5), y: -14, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* ---------- 4. La nuit : la photo glisse doucement ---------- */
  if (ST && !soft) {
    g.fromTo('.night__img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.night', start: 'top bottom', end: 'bottom top', scrub: true } });
    g.from('.night .display', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.night', start: 'top 60%' } });
  }

  /* ---------- 5. Les cartes en éventail ---------- */
  var fan = $('[data-fan]'), fc = fan ? $$('[data-fan-card]', fan) : [];
  if (fc.length) {
    var mm = g.matchMedia();
    mm.add('(min-width: 900px)', function () {
      var n = fc.length, mid = (n - 1) / 2;
      function base(i) { var w = fc[0].offsetWidth; return { x: (i - mid) * w * 0.62, y: Math.abs(i - mid) * 22, rotation: (i - mid) * 6, scale: 1 }; }
      g.set(fc, { left: '50%', xPercent: -50, zIndex: function (i) { return i + 1; } });
      if (soft) { g.set(fc, { x: function (i) { return base(i).x; }, y: function (i) { return base(i).y; }, rotation: function (i) { return base(i).rotation; } }); }
      else {
        g.set(fc, { x: 0, y: 160, rotation: 0, opacity: 0 });
        ST && ST.create({ trigger: fan, start: 'top 75%', once: true, onEnter: function () {
          fc.forEach(function (c, i) { var b = base(i); g.to(c, { x: b.x, y: b.y, rotation: b.rotation, opacity: 1, duration: 1.4, ease: 'elastic.out(1, .6)', delay: i * .1 }); });
        } });
      }
      function spread(k) {
        fc.forEach(function (c, i) {
          var b = base(i), w = c.offsetWidth, shift = k < 0 ? 0 : (i - k) * w * .3 + (i < k ? -w * .2 : i > k ? w * .2 : 0);
          g.to(c, { x: b.x + shift, y: i === k ? -24 : b.y, rotation: i === k ? 0 : b.rotation * (k < 0 ? 1 : 1.4), scale: i === k ? 1.06 : 1, zIndex: i === k ? 10 : i + 1, duration: soft ? .4 : 1, ease: soft ? 'power1.out' : 'elastic.out(1, .55)', overwrite: 'auto' });
        });
      }
      var handlers = fc.map(function (c, i) { var h = function () { spread(i); }; c.addEventListener('pointerenter', h); return h; });
      var out = function () { spread(-1); }; fan.addEventListener('pointerleave', out);
      return function () { fc.forEach(function (c, i) { c.removeEventListener('pointerenter', handlers[i]); }); fan.removeEventListener('pointerleave', out); };
    });
    mm.add('(max-width: 899px)', function () {
      fc.forEach(function (c, i) {
        g.fromTo(c, { y: soft ? 0 : 90, rotation: soft ? 0 : (i % 2 ? 5 : -5), opacity: 0 }, { y: 0, rotation: soft ? 0 : (i % 2 ? 1.2 : -1.2), opacity: 1, duration: soft ? .8 : 1.2, ease: soft ? 'power1.out' : 'elastic.out(1, .65)', scrollTrigger: ST ? { trigger: c, start: 'top 88%' } : undefined });
      });
    });
  }

  /* ---------- 6. Les titres de section ---------- */
  if (ST) $$('.sec__head').forEach(function (h) {
    g.from(h.children, { y: soft ? 0 : 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  /* ---------- 7. Le logo : un gribouillis safran et retour en haut ---------- */
  var logo = $('[data-logo]'), scr = $('.scribble'), sp = scr && $('path', scr);
  if (logo && scr && sp) logo.addEventListener('click', function (e) {
    e.preventDefault();
    if (soft || scrollY < 40) { if (lenis) lenis.scrollTo(0); else scrollTo({ top: 0, behavior: soft ? 'auto' : 'smooth' }); return; }
    var colors = ['#d49653', '#2c2c2c', '#bfb4a3'];
    sp.style.stroke = colors[Math.floor(Math.random() * colors.length)];
    g.timeline()
      .set(scr, { visibility: 'visible' })
      .fromTo(sp, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .85, ease: 'power2.inOut' })
      .add(function () { if (lenis) lenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0); ST && ST.update(); })
      .to(sp, { strokeDashoffset: -1, duration: .85, ease: 'power2.inOut', delay: .1 })
      .set(scr, { visibility: 'hidden' });
  });
})();

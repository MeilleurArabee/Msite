/* =========================================================
   Astelsia — décor
   • Étoiles scintillantes et étoiles filantes (canvas léger).
   • Paysage peint à l'avance (assets/scene/*.webp), chargé
     juste après l'affichage de la page pour ne pas la ralentir.
   • La balançoire (SVG) se cale sur la grande branche du chêne,
     quel que soit le format d'écran.
   ========================================================= */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tallMQ = matchMedia('(max-aspect-ratio: 5/8)');

  /* Position de la balançoire dans les images (en pixels de l'image) */
  var SWING = {
    wide: { w: 2400, h: 1000, x1: 903.2, x2: 960.1, y1: 611.8, seatY: 788.2, posX: 0.22 },
    tall: { w: 1100, h: 1500, x1: 513.2, x2: 570.1, y1: 931.8, seatY: 1108.2, posX: 0.3 }
  };

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- Chargement différé du paysage ---------- */
  function loadLandscape() {
    document.querySelectorAll('.scene source[data-srcset]').forEach(function (s) { s.srcset = s.getAttribute('data-srcset'); });
    document.querySelectorAll('.scene img[data-src]').forEach(function (i) { i.src = i.getAttribute('data-src'); });
  }
  if (document.readyState === 'complete') setTimeout(loadLandscape, 300);
  else window.addEventListener('load', function () { setTimeout(loadLandscape, 300); });

  /* ---------- Balançoire calée sur l'arbre (object-fit: cover) ---------- */
  function placeSwing() {
    var layer = document.querySelector('.layer--tree'), sw = document.querySelector('.swing');
    if (!layer || !sw) return;
    var m = tallMQ.matches ? SWING.tall : SWING.wide;
    var W = layer.clientWidth, H = layer.clientHeight;
    var sc = Math.max(W / m.w, H / m.h);
    var dx = (W - m.w * sc) * m.posX, dy = H - m.h * sc;
    sw.style.left = (dx + m.x1 * sc) + 'px';
    sw.style.top = (dy + m.y1 * sc) + 'px';
    sw.style.width = ((m.x2 - m.x1) * sc) + 'px';
    sw.style.height = ((m.seatY - m.y1) * sc) + 'px';
  }

  /* ---------- Étoiles ---------- */
  var cv, ctx, stars = [], sw = 0, sh = 0, running = false, active = true, shoot = null, nextShoot = 2500;
  function setup() {
    cv = document.querySelector('.stars');
    sw = window.innerWidth; sh = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, sw < 700 ? 1.5 : 2);
    cv.width = Math.round(sw * dpr); cv.height = Math.round(sh * dpr);
    ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = rng(9), count = Math.min(sw < 700 ? 150 : 320, Math.round(sw * sh / 3000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({ x: r() * sw, y: r() * sh, s: r() < 0.08 ? 1.5 + r() : 0.4 + r() * 1.05, p: r() * 6.28, v: 0.5 + r() * 1.5, warm: r() < 0.15 });
    }
    draw(0);
  }
  function draw(t) {
    ctx.clearRect(0, 0, sw, sh);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.globalAlpha = reduced ? 0.8 : 0.4 + 0.6 * Math.abs(Math.sin(st.p + t * 0.001 * st.v));
      ctx.fillStyle = st.warm ? '#ffe9d0' : '#ffffff';
      ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, 7); ctx.fill();
      if (st.s > 1.4) { // un halo très doux autour des plus brillantes, sans forme d'étoile
        ctx.globalAlpha *= 0.18; ctx.beginPath(); ctx.arc(st.x, st.y, st.s * 3.2, 0, 7); ctx.fill();
      }
    }
    if (!reduced) {
      if (!shoot && t > nextShoot) {
        shoot = { x: Math.random() * sw * 0.7 + sw * 0.25, y: Math.random() * sh * 0.35, life: 0 };
        nextShoot = t + 6000 + Math.random() * 7000;
      }
      if (shoot) {
        shoot.life += 16;
        var k = shoot.life / 950, len = Math.min(160, sw * 0.3);
        var hx = shoot.x - k * sw * 0.35, hy = shoot.y + k * sh * 0.2;
        var g = ctx.createLinearGradient(hx, hy, hx + len, hy - len * 0.57);
        g.addColorStop(0, 'rgba(255,255,255,' + (1 - k) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + len, hy - len * 0.57); ctx.stroke();
        if (k >= 1) shoot = null;
      }
    }
    ctx.globalAlpha = 1;
  }
  var lastDraw = 0;
  function loop(t) {
    if (!active || document.hidden) { running = false; return; }
    if (t - lastDraw > 33) { draw(t); lastDraw = t; } // ~30 images/s : invisible à l'œil, deux fois moins de travail
    requestAnimationFrame(loop);
  }
  function setStarsActive(on) {
    active = on;
    if (on && !running && !reduced) { running = true; requestAnimationFrame(loop); }
  }

  var lastW = 0, tid;
  function onResize() {
    placeSwing();
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; setup(); }
  }
  window.addEventListener('resize', function () { clearTimeout(tid); tid = setTimeout(onResize, 150); });
  if (tallMQ.addEventListener) tallMQ.addEventListener('change', placeSwing);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setStarsActive(active); });

  /* ---------- Ce qu'on peut toucher dans le décor (assets/js/fx.js s'en sert) ---------- */
  var contact = document.querySelector('#contact'), landVisible = false;
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { landVisible = e[0].isIntersecting; if (landVisible) wakeSwing(); }, { rootMargin: '0px 0px -25% 0px' }).observe(contact);
  }
  function opaque(el) { return el && parseFloat(getComputedStyle(el).opacity) > 0.35; }
  function inside(r, x, y, pad) { return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad; }

  // La balançoire : un vrai pendule, bercé par le vent, qu'on peut pousser
  var swingEl = document.querySelector('.swing'), swingG = document.querySelector('.swing__g');
  var swg = { th: 0, om: 0, on: false, last: 0, t: 0 };
  function swingStep(now) {
    var dt = Math.min(0.05, swg.last ? (now - swg.last) / 1000 : 0.016); swg.last = now;
    for (var n = Math.ceil(dt / 0.008), h = dt / n; n > 0; n--) {
      swg.t += h;
      var wind = Math.sin(swg.t * 1.26) * 3; // la brise : ±3°, comme avant
      swg.om += (-9 * (swg.th - wind) - 0.36 * swg.om) * h;
      swg.th += swg.om * h;
    }
    swingG.style.transform = 'rotate(' + swg.th.toFixed(2) + 'deg)';
    if (!landVisible && Math.abs(swg.om) < 2) { swg.on = false; return; } // hors de vue : on se repose
    requestAnimationFrame(swingStep);
  }
  function wakeSwing() {
    if (reduced || !swingEl || swg.on) return;
    swg.on = true; swg.last = 0;
    swingEl.classList.add('is-physics');
    requestAnimationFrame(swingStep);
  }
  function pushSwing(dir) {
    if (reduced || !swingEl) return;
    swg.om = Math.max(-140, Math.min(140, swg.om + dir * 70));
    wakeSwing();
  }
  function hitSwing(x, y) { // 0 : pas touchée ; sinon le sens de la poussée
    if (!swingEl || !landVisible) return 0;
    var r = swingEl.getBoundingClientRect();
    if (!r.width || !inside(r, x, y, 26)) return 0;
    return x < r.left + r.width / 2 ? 1 : -1;
  }

  // La lune : elle vacille et s'illumine
  var moonEl = document.querySelector('.moon'), moonT = 0;
  function hitMoon(x, y) { return !!moonEl && opaque(moonEl) && inside(moonEl.getBoundingClientRect(), x, y, 24); }
  function pokeMoon() {
    moonEl.classList.remove('is-poked'); void moonEl.offsetWidth; moonEl.classList.add('is-poked');
    clearTimeout(moonT); moonT = setTimeout(function () { moonEl.classList.remove('is-poked'); }, 1500);
  }

  // L'herbe du premier plan : des lucioles s'en envolent
  var front = document.querySelector('.layer--front');
  function hitMeadow(x, y) {
    if (!front || !landVisible) return false;
    var r = front.getBoundingClientRect();
    return r.height > 0 && y > r.top + r.height * 0.6 && y < innerHeight;
  }

  onResize();
  setStarsActive(true);
  window.AstelsiaScene = { setStarsActive: setStarsActive, placeSwing: placeSwing, hitSwing: hitSwing, pushSwing: pushSwing, hitMoon: hitMoon, pokeMoon: pokeMoon, hitMeadow: hitMeadow };
})();

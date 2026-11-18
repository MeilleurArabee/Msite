/* =========================================================
   Astelsia — les petits secrets à toucher
   Un seul calque de dessin (canvas) pour toutes les étincelles :
   • toucher une étoile dorée : elle tourne, rebondit, et jette des étincelles ;
   • toucher le ciel : une étoile filante part de votre doigt ;
   • toucher la lune : elle vacille ; la balançoire : elle part ;
     l'herbe : des lucioles s'envolent ;
   • cinq étoiles touchées : une pluie d'étoiles filantes ;
   • à la souris : une poussière d'étoile suit le pointeur.
   Mode doux (moins d'animations) : tout devient fondu, rien ne file.
   Le calcul ne tourne que lorsqu'il y a quelque chose à dessiner.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var cv = document.createElement('canvas');
  cv.className = 'fx'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  if (!ctx) return;
  var W = 0, H = 0, dpr = 1, parts = [], comets = [], running = false, last = 0;

  function size() {
    W = innerWidth; H = innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  addEventListener('resize', size);

  /* ---------- petites images de lumière, dessinées une seule fois ---------- */
  function sprite(inner, outer) {
    var c = document.createElement('canvas'), s = 64, g = c.getContext('2d');
    c.width = c.height = s;
    var grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.16, inner); grd.addColorStop(0.45, outer); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    return c;
  }
  var GLOW = {
    gold: sprite('rgba(255,222,140,.95)', 'rgba(255,190,80,.25)'),
    pink: sprite('rgba(250,200,225,.95)', 'rgba(244,170,210,.22)'),
    white: sprite('rgba(255,250,235,.95)', 'rgba(220,230,255,.2)'),
    fly: sprite('rgba(255,236,150,1)', 'rgba(255,214,110,.35)')
  };
  var GOLD = ['#fff6d6', '#ffe3a1', '#ffd27a', '#f6c35a', '#f4b9d6'];
  var SILVER = ['#ffffff', '#fff6dd', '#e9eeff', '#f6d7a4'];

  function star4(x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    var k = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(k, -k, r, 0);
    ctx.quadraticCurveTo(k, k, 0, r);
    ctx.quadraticCurveTo(-k, k, -r, 0);
    ctx.quadraticCurveTo(-k, -k, 0, -r);
    ctx.fill(); ctx.restore();
  }

  /* ---------- la boucle : elle s'arrête d'elle-même quand tout s'est éteint ---------- */
  function kick() { if (!running) { running = true; last = 0; requestAnimationFrame(tick); } }
  function tick(t) {
    var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var i, p, a;
    for (i = parts.length - 1; i >= 0; i--) {
      p = parts[i];
      p.life -= p.dec * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      if (p.delay > 0) { p.delay -= dt; p.life += p.dec * dt; continue; }
      p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt;
      if (p.k === 'fly') p.vx += Math.sin(t / 300 + p.tw) * 18 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      a = p.k === 'fly' ? Math.min(1, p.life * 2.2) * (0.45 + 0.55 * Math.abs(Math.sin(t / 260 + p.tw))) : p.fadeIn ? Math.sin(Math.min(1, p.life) * Math.PI) : p.life * p.life;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      if (p.k === 'spark') {
        ctx.drawImage(p.glow, p.x - p.r * 2.6, p.y - p.r * 2.6, p.r * 5.2, p.r * 5.2);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.32 * (0.6 + 0.4 * p.life), 0, 7); ctx.fill(); // un point rond, doux
      } else if (p.k === 'fly') {
        ctx.drawImage(GLOW.fly, p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      } else {
        ctx.drawImage(p.glow, p.x - p.r * 3, p.y - p.r * 3, p.r * 6, p.r * 6);
      }
    }
    for (i = comets.length - 1; i >= 0; i--) {
      var c = comets[i];
      c.life -= dt / c.dur;
      if (c.life <= 0) { comets.splice(i, 1); continue; }
      c.x += c.vx * dt; c.y += c.vy * dt;
      var sp = Math.hypot(c.vx, c.vy), ux = c.vx / sp, uy = c.vy / sp;
      var len = c.len * Math.min(1, (1 - c.life) * 6) * (0.4 + 0.6 * c.life);
      var tx = c.x - ux * len, ty = c.y - uy * len;
      var g = ctx.createLinearGradient(c.x, c.y, tx, ty);
      g.addColorStop(0, 'rgba(255,250,235,' + (0.95 * c.life) + ')');
      g.addColorStop(0.35, 'rgba(255,214,150,' + (0.45 * c.life) + ')');
      g.addColorStop(1, 'rgba(244,185,214,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = c.w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = Math.min(1, c.life * 1.6);
      ctx.drawImage(GLOW.white, c.x - 14, c.y - 14, 28, 28);
      // la traîne laisse tomber quelques poussières
      if (Math.random() < 0.55) parts.push(mk('dot', c.x - ux * 6, c.y - uy * 6, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30 + 10, 0.5 + Math.random() * 1.1, Math.random() < 0.6 ? GLOW.gold : GLOW.white, 1.6));
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (parts.length > 320) parts.splice(0, parts.length - 320);
    if (parts.length || comets.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  function mk(kind, x, y, vx, vy, r, glow, dec) {
    return { k: kind, x: x, y: y, vx: vx, vy: vy, r: r, glow: glow, dec: dec || 1, life: 1, g: 0, drag: 1, rot: 0, vr: 0, tw: Math.random() * 6.28, c: '#fff', delay: 0, fadeIn: false };
  }

  /* ---------- les effets ---------- */
  // une gerbe d'étincelles dorées (une étoile touchée)
  function burst(x, y, o) {
    o = o || {};
    var n = o.n || 24, colors = o.colors || GOLD, spread = o.r ? Math.max(30, o.r) : 40;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2, sp = reduced ? 0 : (120 + Math.random() * 380) * (o.power || 1);
      var spark = Math.random() < 0.55;
      var p = mk(spark ? 'spark' : 'dot',
        x + Math.cos(ang) * (reduced ? Math.random() * spread : spread * 0.3), y + Math.sin(ang) * (reduced ? Math.random() * spread : spread * 0.3),
        Math.cos(ang) * sp, Math.sin(ang) * sp - (reduced ? 0 : 60),
        spark ? 3 + Math.random() * 5 : 1 + Math.random() * 2, Math.random() < 0.7 ? GLOW.gold : GLOW.pink, 0.9 + Math.random() * 0.8);
      p.c = colors[(Math.random() * colors.length) | 0];
      p.g = reduced ? 0 : 260; p.drag = 0.94; p.rot = Math.random() * 3; p.vr = (Math.random() - 0.5) * 8;
      if (reduced) { p.fadeIn = true; p.dec = 0.8 + Math.random() * 0.5; p.delay = Math.random() * 0.25; }
      parts.push(p);
    }
    kick();
  }
  // une étoile filante qui part du doigt
  function comet(x, y, o) {
    o = o || {};
    if (reduced) { // mode doux : une étoile s'allume et s'éteint, sans filer
      burst(x, y, { n: 10, colors: SILVER, r: 26 });
      return;
    }
    var ang = o.ang !== undefined ? o.ang : Math.PI * (0.72 + Math.random() * 0.1), sp = o.speed || 780 + Math.random() * 380;
    comets.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, dur: o.dur || 1.05, len: o.len || 150 + Math.random() * 90, w: o.w || 2 });
    for (var i = 0; i < 6; i++) { // petit éclat au départ
      var a = Math.random() * 6.28, p = mk('spark', x, y, Math.cos(a) * 90, Math.sin(a) * 90, 2.5 + Math.random() * 2.5, GLOW.white, 2.2);
      p.c = SILVER[(Math.random() * SILVER.length) | 0]; p.drag = 0.9; p.rot = Math.random() * 3; parts.push(p);
    }
    kick();
  }
  // des lucioles qui s'envolent de l'herbe
  function fireflies(x, y) {
    for (var i = 0; i < 14; i++) {
      var p = mk('fly', x + (Math.random() - 0.5) * 90, y + (Math.random() - 0.3) * 30,
        reduced ? 0 : (Math.random() - 0.5) * 40, reduced ? 0 : -(25 + Math.random() * 60), 1.6 + Math.random() * 1.6, GLOW.fly, 0.26 + Math.random() * 0.18);
      p.drag = 0.995; p.delay = Math.random() * 0.4;
      parts.push(p);
    }
    kick();
  }
  // la pluie d'étoiles (le secret des cinq étoiles)
  function shower() {
    for (var k = 0; k < 9; k++) (function (k) {
      setTimeout(function () {
        comet(W * (0.35 + Math.random() * 0.75), H * (Math.random() * 0.4), { speed: 900 + Math.random() * 500, len: 180 + Math.random() * 120 });
      }, k * 170 + Math.random() * 120);
    })(k);
  }

  /* ---------- un petit mot, une seule fois ---------- */
  var said = {};
  function whisper(text, key, y) {
    if (said[key]) return;
    said[key] = true;
    var w = document.createElement('p');
    w.className = 'whisper'; w.setAttribute('aria-hidden', 'true'); w.textContent = text;
    // juste au-dessus du doigt (le doigt cache ce qui est en dessous), sans sortir de l'écran
    w.style.top = Math.round(Math.max(86, Math.min(H - 150, (y === undefined ? H * 0.3 : y) - 70))) + 'px';
    document.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('is-on'); }); });
    setTimeout(function () { w.classList.remove('is-on'); }, 2400);
    setTimeout(function () { w.remove(); }, 3600);
  }

  /* ---------- à la souris : une poussière d'étoile suit le pointeur ---------- */
  var lx = null, ly = null;
  if (fine && !reduced) addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var d = lx === null ? 0 : Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
    var n = Math.min(3, Math.floor(d / 16));
    for (var i = 0; i < n; i++) {
      var p = mk('dot', e.clientX + (Math.random() - 0.5) * 6, e.clientY + (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 24, 12 + Math.random() * 30, 0.6 + Math.random() * 1.2, Math.random() < 0.7 ? GLOW.gold : GLOW.white, 1.3);
      parts.push(p);
    }
    if (n) kick();
  }, { passive: true });

  /* =========================================================
     Qu'a-t-on touché ? (un vrai « tap » : doigt posé puis levé sans glisser)
     ========================================================= */
  var BLOCK = 'a, button, input, label, select, textarea, iframe, .device, .phone, .plan, .sere__card, .way, .rappel, .tabs, .builder, .header, .menu, .loader, .skip, .trust, .chips';
  function blocked(target) {
    if (root.classList.contains('menu-open')) return true;
    return !!(target && target.closest && target.closest(BLOCK));
  }
  var starTaps = 0;
  function route(x, y) {
    var S = window.AstelsiaStars, SC = window.AstelsiaScene;
    var i = S && S.hit ? S.hit(x, y) : -1;
    if (i >= 0) {
      var s = S.poke(i, x, y);
      burst(s.x, s.y, { n: 26, r: s.r * 0.6 });
      starTaps++;
      hideHint(true);
      if (starTaps === 5) { setTimeout(shower, 300); whisper('Une pluie d’étoiles, rien que pour vous ✦', 'shower', s.y - s.r * 0.6); }
      return;
    }
    if (SC && SC.hitMoon && SC.hitMoon(x, y)) { SC.pokeMoon(); burst(x, y, { n: 14, colors: SILVER, r: 20, power: 0.6 }); return; }
    var dir = SC && SC.hitSwing ? SC.hitSwing(x, y) : 0;
    if (dir) { SC.pushSwing(dir); burst(x, y, { n: 8, r: 10, power: 0.4 }); return; }
    if (SC && SC.hitMeadow && SC.hitMeadow(x, y)) { fireflies(x, y); whisper('Chut… les lucioles dormaient ✦', 'flies', y); return; }
    comet(x, y);
  }
  var down = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.isPrimary === false || (e.pointerType === 'mouse' && e.button !== 0)) { down = null; return; }
    down = { x: e.clientX, y: e.clientY, t: performance.now(), target: e.target, id: e.pointerId };
  }, { passive: true });
  document.addEventListener('pointerup', function (e) {
    var d = down; down = null;
    if (!d || e.pointerId !== d.id) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12 || performance.now() - d.t > 600) return;
    if (blocked(d.target)) return;
    if (window.getSelection && String(window.getSelection()).length) return; // on sélectionnait du texte
    route(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('pointercancel', function () { down = null; }, { passive: true });

  // à la souris, la main apparaît au-dessus d'une étoile qu'on peut toucher
  if (fine) {
    var hx = 0, hy = 0, hTarget = null, hPending = false;
    addEventListener('pointermove', function (e) {
      hx = e.clientX; hy = e.clientY; hTarget = e.target;
      if (hPending) return;
      hPending = true;
      requestAnimationFrame(function () {
        hPending = false;
        var S = window.AstelsiaStars, on = !!(S && S.hover) && !blocked(hTarget) && S.hover(hx, hy);
        document.body.style.cursor = on ? 'pointer' : '';
      });
    }, { passive: true });
  }

  /* ---------- l'invitation discrète : « touchez les étoiles » ---------- */
  var hint = document.querySelector('.hero__hint'), hero = document.querySelector('.hero'), hintTimer = 0, hintDone = false;
  function hideHint(forever) {
    if (forever) hintDone = true;
    clearTimeout(hintTimer);
    if (hint) hint.classList.remove('is-on');
  }
  if (hint) {
    (window.__loaderDone || Promise.resolve()).then(function () {
      hintTimer = setTimeout(function () {
        if (hintDone || window.scrollY > 80 || (hero && hero.classList.contains('is-building'))) return;
        hint.classList.add('is-on');
        hintTimer = setTimeout(function () { hideHint(false); }, 5200);
      }, 4200);
    });
    ['input', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { hideHint(true); }, { passive: true }); });
    addEventListener('scroll', function () { if (window.scrollY > innerHeight * 0.4) hideHint(false); }, { passive: true });
  }

  window.AstelsiaFX = { burst: burst, comet: comet, fireflies: fireflies, shower: shower };
})();

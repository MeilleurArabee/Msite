/* =========================================================
   Astelsia — décor procédural : étoiles + paysage à l'heure bleue.
   Tout est dessiné une seule fois dans des <canvas>, puis seulement
   déplacé (transform) au scroll : léger et fluide sur mobile.
   ========================================================= */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rng(seed) { // générateur pseudo-aléatoire reproductible
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function setup(canvas, w, h) {
    var dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }

  function ridge(ctx, w, h, base, amp, seed, waves) {
    var r = rng(seed), ph = [], i;
    for (i = 0; i < waves; i++) ph.push([r() * 6.28, 1 + i * 1.7 + r(), amp / (1 + i * 0.9)]);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var x = 0; x <= w + 8; x += 8) {
      var y = base;
      for (i = 0; i < waves; i++) y -= Math.sin(x / w * ph[i][1] * Math.PI + ph[i][0]) * ph[i][2];
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
  }

  /* ---------- Plans lointains : montagnes bleutées ---------- */
  function drawFar(c, w, h) {
    var ctx = setup(c, w, h), g;
    ridge(ctx, w, h, h * 0.40, h * 0.06, 3, 4);
    g = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.6);
    g.addColorStop(0, '#4b6fd0'); g.addColorStop(1, '#7f9be0');
    ctx.fillStyle = g; ctx.fill();
    ridge(ctx, w, h, h * 0.47, h * 0.05, 11, 5);
    g = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.62);
    g.addColorStop(0, '#2f50b4'); g.addColorStop(1, '#5d7ccc');
    ctx.fillStyle = g; ctx.fill();
  }

  /* ---------- Collines intermédiaires ---------- */
  function drawMid(c, w, h) {
    var ctx = setup(c, w, h), g;
    ridge(ctx, w, h, h * 0.56, h * 0.04, 21, 3);
    g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#1d3580'); g.addColorStop(0.65, '#27478f'); g.addColorStop(1, '#5b7a9a');
    ctx.fillStyle = g; ctx.fill();
    // petit arbre lointain
    var r = rng(5), tx = w * 0.06, ty = h * 0.585, s = Math.max(10, w * 0.018);
    ctx.fillStyle = '#16285e';
    for (var i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc(tx + (r() - 0.5) * s * 2.4, ty - s * 0.9 + (r() - 0.5) * s, s * (0.25 + r() * 0.3), 0, 7);
      ctx.fill();
    }
    ctx.fillRect(tx - 1.5, ty - s * 0.6, 3, s * 0.7);
  }

  /* ---------- Prairie + grand arbre + balançoire ---------- */
  function drawTree(c, w, h, swing) {
    var ctx = setup(c, w, h), g, r = rng(42);
    var ground = h * 0.66;
    // prairie
    ridge(ctx, w, h, ground, h * 0.015, 8, 2);
    g = ctx.createLinearGradient(0, ground - 20, 0, h);
    g.addColorStop(0, '#7f86bf'); g.addColorStop(0.15, '#5b7b72'); g.addColorStop(1, '#2c4a3c');
    ctx.fillStyle = g; ctx.fill();

    var mobile = w < 700;
    var tx = w * (mobile ? 0.26 : 0.22);
    var size = Math.min(h * 0.5, w * (mobile ? 0.62 : 0.4));
    var trunkW = size * 0.12;
    var tips = [];

    ctx.lineCap = 'round';
    function branch(x, y, ang, len, wid, depth, noTip) {
      var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      var mx = (x + x2) / 2 + Math.cos(ang + 1.57) * len * 0.15 * (r() - 0.5);
      var my = (y + y2) / 2 + Math.sin(ang + 1.57) * len * 0.15 * (r() - 0.5);
      ctx.strokeStyle = '#1a2340';
      ctx.lineWidth = Math.max(wid, 0.8);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
      if (depth <= 2 && !noTip) tips.push([x2, y2, depth]);
      if (depth === 0) return;
      var n = r() > 0.4 ? 3 : 2;
      for (var i = 0; i < n; i++) {
        var spread = (i - (n - 1) / 2) * (0.5 + r() * 0.3) + (r() - 0.5) * 0.25;
        // les branches s'étalent à l'horizontale, comme un vieux chêne
        var a = ang + spread; a += (-1.57 - a) * -0.12;
        branch(x2, y2, a, len * (0.72 + r() * 0.1), wid * 0.64, depth - 1);
      }
    }
    // tronc
    var top = ground - size * 0.36;
    ctx.fillStyle = '#1a2340';
    ctx.beginPath();
    ctx.moveTo(tx - trunkW * 1.1, ground + 6);
    ctx.quadraticCurveTo(tx - trunkW * 0.45, ground - size * 0.12, tx - trunkW * 0.5, top);
    ctx.lineTo(tx + trunkW * 0.5, top);
    ctx.quadraticCurveTo(tx + trunkW * 0.45, ground - size * 0.12, tx + trunkW * 1.1, ground + 6);
    ctx.closePath(); ctx.fill();
    // charpentières
    branch(tx, top, -1.57 - 1.05, size * 0.24, trunkW * 0.6, 5);
    branch(tx, top, -1.57 - 0.45, size * 0.24, trunkW * 0.62, 5);
    branch(tx, top, -1.57 + 0.15, size * 0.22, trunkW * 0.58, 5);
    branch(tx, top, -1.57 + 0.8, size * 0.24, trunkW * 0.55, 5);
    // la grande branche de la balançoire, presque horizontale
    var limbLen = size * (mobile ? 0.95 : 1.05);
    var lx0 = tx, ly0 = top + size * 0.03;
    var lx1 = lx0 + Math.cos(-0.1) * limbLen * 0.6, ly1 = ly0 + Math.sin(-0.1) * limbLen * 0.6;
    branch(lx0, ly0, -0.1, limbLen * 0.6, trunkW * 0.45, 0, true);
    branch(lx1, ly1, -0.15, limbLen * 0.32, trunkW * 0.3, 2);

    // feuillage : des touffes denses en bout de branches
    var leaf = ['#121d38', '#162444', '#1b2d4f', '#203658', '#172a3e'];
    var R = size * 0.085;
    for (var t = 0; t < tips.length; t++) {
      var p = tips[t], cnt = p[2] === 0 ? 34 : 18, rr = p[2] === 0 ? R : R * 1.3;
      for (var k = 0; k < cnt; k++) {
        var a = r() * 6.28, d = Math.sqrt(r()) * rr;
        ctx.fillStyle = leaf[(r() * leaf.length) | 0];
        ctx.globalAlpha = 0.7 + r() * 0.3;
        ctx.beginPath();
        ctx.arc(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d * 0.75, 1.2 + r() * size * 0.02, 0, 7);
        ctx.fill();
      }
      if (r() > 0.55) { // reflets de lune sur le dessus des feuilles
        ctx.fillStyle = '#4a6c98'; ctx.globalAlpha = 0.28;
        for (var q = 0; q < 4; q++) {
          ctx.beginPath(); ctx.arc(p[0] + (r() - 0.3) * rr, p[1] - r() * rr * 0.8, 1 + r() * 2.2, 0, 7); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;

    // position de la balançoire sous la grande branche
    var sx1 = lx0 + limbLen * 0.36, sx2 = lx0 + limbLen * 0.5;
    var sy = ly0 + Math.sin(-0.1) * limbLen * 0.43;
    var seatY = ground + h * 0.02;
    swing.style.left = sx1 + 'px';
    swing.style.top = sy + 'px';
    swing.style.width = (sx2 - sx1) + 'px';
    swing.style.height = (seatY - sy) + 'px';
  }

  /* ---------- Premier plan : herbes roses et fleurs ---------- */
  function drawFront(c, w, h) {
    var ctx = setup(c, w, h), r = rng(77), i;
    // halo rose : l'aspect « nuage » des herbes
    for (i = 0; i < 26; i++) {
      var bx = r() < 0.5 ? r() * w * 0.4 : w * (0.6 + r() * 0.4);
      var by = h - r() * h * 0.22, br = h * (0.08 + r() * 0.12);
      var hg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      hg.addColorStop(0, 'rgba(242,168,208,0.38)'); hg.addColorStop(1, 'rgba(242,168,208,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(bx, by, br * 1.6, br, 0, 0, 7); ctx.fill();
    }
    var n = Math.min(12000, Math.round(w * 9));
    ctx.lineCap = 'round';
    for (i = 0; i < n; i++) {
      var x = r() * w;
      var side = Math.abs(x / w - 0.5) * 2; // plus dense sur les côtés
      if (r() > 0.3 + side * 0.7) continue;
      var baseY = h + 10;
      var len = h * (0.1 + r() * 0.24) * (0.55 + side * 0.65);
      var lean = (r() - 0.5) * len * 0.8;
      var pink = r() > 0.12;
      ctx.strokeStyle = pink
        ? 'rgba(' + (238 + (r() * 16 | 0)) + ',' + (150 + (r() * 45 | 0)) + ',' + (195 + (r() * 30 | 0)) + ',' + (0.1 + r() * 0.2) + ')'
        : 'rgba(' + (85 + (r() * 40 | 0)) + ',' + (135 + (r() * 40 | 0)) + ',95,' + (0.3 + r() * 0.3) + ')';
      ctx.lineWidth = pink ? 0.7 + r() * 1.6 : 1 + r();
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + lean * 0.2, baseY - len * 0.6, x + lean, baseY - len);
      ctx.stroke();
    }
    // petites fleurs blanches et jaunes
    for (var f = 0; f < w / 18; f++) {
      var fx = w * (0.35 + r() * 0.5), fy = h - r() * h * 0.22;
      ctx.fillStyle = r() > 0.7 ? '#f6c56a' : '#f7f3ea';
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(fx, fy, 1.4 + r() * 1.8, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Étoiles qui scintillent ---------- */
  var starsCanvas, sctx, stars = [], sw = 0, sh = 0, running = false, active = true, shoot = null, nextShoot = 0;
  function initStars() {
    starsCanvas = document.querySelector('.stars');
    sw = window.innerWidth; sh = window.innerHeight;
    sctx = setup(starsCanvas, sw, sh);
    var r = rng(9), count = Math.min(380, Math.round(sw * sh / 2600));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({ x: r() * sw, y: r() * sh, s: r() < 0.08 ? 1.6 + r() : 0.4 + r() * 1.1, p: r() * 6.28, v: 0.5 + r() * 1.5 });
    }
    drawStars(0);
  }
  function drawStars(t) {
    sctx.clearRect(0, 0, sw, sh);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      sctx.globalAlpha = reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(st.p + t * 0.001 * st.v));
      sctx.fillStyle = st.s > 1.5 ? '#fff4dd' : '#ffffff';
      sctx.beginPath(); sctx.arc(st.x, st.y, st.s, 0, 7); sctx.fill();
    }
    // étoile filante
    if (!reduced) {
      if (!shoot && t > nextShoot) {
        shoot = { x: Math.random() * sw * 0.7 + sw * 0.2, y: Math.random() * sh * 0.3, life: 0 };
        nextShoot = t + 5000 + Math.random() * 6000;
      }
      if (shoot) {
        shoot.life += 16;
        var k = shoot.life / 900, len = 120;
        var hx = shoot.x - k * sw * 0.35, hy = shoot.y + k * sh * 0.2;
        var grad = sctx.createLinearGradient(hx, hy, hx + len, hy - len * 0.57);
        grad.addColorStop(0, 'rgba(255,255,255,' + (1 - k) + ')'); grad.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.globalAlpha = 1; sctx.strokeStyle = grad; sctx.lineWidth = 1.5;
        sctx.beginPath(); sctx.moveTo(hx, hy); sctx.lineTo(hx + len, hy - len * 0.57); sctx.stroke();
        if (k >= 1) shoot = null;
      }
    }
    sctx.globalAlpha = 1;
  }
  function loop(t) {
    if (!active || document.hidden) { running = false; return; }
    drawStars(t);
    requestAnimationFrame(loop);
  }
  function setStarsActive(on) {
    active = on;
    if (on && !running && !reduced) { running = true; requestAnimationFrame(loop); }
  }

  /* ---------- Dessin / redimensionnement ---------- */
  var lastW = 0;
  function drawAll() {
    var land = document.querySelector('.land');
    var w = land.clientWidth, h = land.clientHeight;
    if (w === lastW) return;
    lastW = w;
    drawFar(document.querySelector('.layer--far'), w, h);
    drawMid(document.querySelector('.layer--mid'), w, h);
    drawTree(document.querySelector('.layer--tree canvas'), w, h, document.querySelector('.swing'));
    drawFront(document.querySelector('.layer--front'), w, h);
    initStars();
  }

  var tid;
  window.addEventListener('resize', function () { clearTimeout(tid); tid = setTimeout(drawAll, 200); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setStarsActive(active); });

  drawAll();
  setStarsActive(true);

  window.AstelsiaScene = { setStarsActive: setStarsActive };
})();

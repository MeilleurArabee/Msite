/* =========================================================
   Astelsia — les bulles du champ de lavande
   • Des bulles irisées montent doucement devant le ciel ; certaines portent
     le nom d'un commerce : chaque bulle, c'est un site qui prend forme.
   • Petit secret : on les éclate du doigt (ou d'un clic), elles reviennent ensuite.
   • Elles restent sur les côtés, pour ne jamais gêner la lecture.
   • Mode doux : elles ne bougent presque pas, et s'effacent au lieu d'éclater.
   ========================================================= */
(function () {
  'use strict';
  var cv = document.querySelector('.bubbles');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var NAMES = ['Le Fournil', 'Chez Léa', 'L’Atelier', 'Bistrot 56', 'Fleurs & Co', 'Le Comptoir', 'Salon Rose', 'La Cave'];
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), list = [], drops = [], run = false, last = 0, pops = 0, nameIdx = 0, visible = true;

  function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function small() { return W < 700; }
  // les bulles vivent dans deux couloirs, à gauche et à droite du texte
  function laneX() {
    var lane = small() ? 0.13 : 0.2, left = Math.random() < 0.5;
    var x = Math.random() * lane * W;
    return left ? x + (small() ? 4 : 18) : W - x - (small() ? 4 : 18);
  }
  function make(named, y) {
    var s = named ? (small() ? 26 + Math.random() * 6 : 44 + Math.random() * 18) : (small() ? 7 + Math.random() * 10 : 10 + Math.random() * 18);
    var b = { x: laneX(), y: y == null ? Math.random() * H : y, s: s, name: named ? NAMES[nameIdx++ % NAMES.length] : '', v: 10 + Math.random() * 14, ph: Math.random() * 6.28, rot: Math.random() * 6.28, life: 1, born: 0 };
    if (named) b.x = Math.max(s + 4, Math.min(W - s - 4, b.x));
    return b;
  }
  function seed() {
    list = []; nameIdx = 0;
    var named = small() ? 3 : 6, plain = small() ? 6 : 10;
    for (var i = 0; i < named; i++) list.push(make(true, (i + 0.5) / named * H));
    for (i = 0; i < plain; i++) list.push(make(false));
  }

  function bubble(b, alpha) {
    var x = b.x, y = b.y, s = b.s;
    ctx.globalAlpha = alpha;
    var g = ctx.createRadialGradient(x - s * 0.3, y - s * 0.35, s * 0.1, x, y, s);
    g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(0.75, 'rgba(255,255,255,.03)'); g.addColorStop(0.93, 'rgba(255,236,246,.26)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
    var rim = ctx.createConicGradient ? ctx.createConicGradient(b.rot, x, y) : null;
    if (rim) { rim.addColorStop(0, 'rgba(255,170,130,.75)'); rim.addColorStop(0.2, 'rgba(255,236,150,.6)'); rim.addColorStop(0.4, 'rgba(150,240,200,.55)'); rim.addColorStop(0.6, 'rgba(150,190,255,.65)'); rim.addColorStop(0.8, 'rgba(230,160,255,.65)'); rim.addColorStop(1, 'rgba(255,170,130,.75)'); }
    ctx.strokeStyle = rim || 'rgba(255,240,250,.6)'; ctx.lineWidth = Math.max(1, s * 0.045); ctx.beginPath(); ctx.arc(x, y, s * 0.97, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(x - s * 0.42, y - s * 0.42, s * 0.16, s * 0.07, -0.8, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(x + s * 0.45, y + s * 0.4, s * 0.06, 0, 7); ctx.fill();
    if (b.name) {
      ctx.fillStyle = 'rgba(255,250,246,.96)'; ctx.font = 'italic 400 ' + Math.round(s * 0.31) + 'px Fraunces, Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(70,25,90,.55)'; ctx.shadowBlur = 6;
      ctx.fillText(b.name, x, y); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function tick(t) {
    var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!reduced) { b.y -= b.v * dt; b.x += Math.sin(t / 1600 + b.ph) * 6 * dt; b.rot += dt * 0.4; }
      if (b.y < -b.s - 10) { list[i] = make(!!b.name, H + 60); b = list[i]; }
      if (b.born < 1) b.born = Math.min(1, b.born + dt * 1.2);
      bubble(b, b.born);
    }
    for (i = drops.length - 1; i >= 0; i--) { // les gouttelettes d'une bulle éclatée
      var d = drops[i]; d.life -= dt * 1.6;
      if (d.life <= 0) { drops.splice(i, 1); continue; }
      d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 140 * dt;
      ctx.globalAlpha = d.life; ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (visible) requestAnimationFrame(tick); else run = false;
  }
  function go() { if (!run) { run = true; last = 0; requestAnimationFrame(tick); } }

  // un petit mot, une seule fois par sujet
  var said = {};
  function whisper(text, key, y) {
    if (said[key]) return; said[key] = true;
    document.querySelectorAll('.whisper--pill').forEach(function (o) { o.remove(); });
    var w = document.createElement('p'); w.className = 'whisper'; w.setAttribute('aria-hidden', 'true'); w.textContent = text;
    w.classList.add('whisper--pill'); // en bas de l'écran, dans une pastille : jamais sur un texte
    var h = document.querySelector('.hero__hint'); if (h) h.classList.remove('is-on');
    document.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('is-on'); }); });
    setTimeout(function () { w.classList.remove('is-on'); }, 2600); setTimeout(function () { w.remove(); }, 3800);
  }
  function hit(x, y) {
    for (var i = list.length - 1; i >= 0; i--) { var b = list[i]; if (Math.hypot(b.x - x, b.y - y) < b.s + 10) return i; }
    return -1;
  }
  function pop(i) {
    var b = list[i], n = reduced ? 0 : 16, cols = ['#ffd9ec', '#ffe9b8', '#d9c8ff', '#ffffff'];
    for (var k = 0; k < n; k++) { var a = Math.random() * 6.28, sp = 80 + Math.random() * 160; drops.push({ x: b.x + Math.cos(a) * b.s * 0.8, y: b.y + Math.sin(a) * b.s * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: 1 + Math.random() * 2.2, c: cols[k % 4], life: 1 }); }
    pops++;
    if (b.name) whisper('Pop ! « ' + b.name + ' » aura bientôt son site ✦', 'name', b.y);
    else whisper('Pop ! ✦', 'pop', b.y);
    if (pops === 7) whisper('Sept bulles éclatées… l’été vous va bien ✦', 'seven', b.y);
    list[i] = make(!!b.name, H + 60);
    go();
  }
  // ce qu'on touche dans la page reste prioritaire (boutons, liens, champs, aperçus…)
  function blocked(el) { return !!(el && el.closest && el.closest('a, button, input, textarea, select, label, iframe, .device, .plan, .compare, .rappel, .way, .menu, .header, .tabs, .sere__card')); }
  // doigt : un toucher bref éclate la bulle ; un appui long la fait gonfler puis s'envoler en étoiles
  var hold = null;
  function stars(i) {
    var b = list[i];
    for (var k = 0; k < 26; k++) { var a = Math.random() * 6.28, sp = 60 + Math.random() * 220; drops.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, r: 1.6 + Math.random() * 2.6, c: k % 3 ? '#ffe3a6' : '#fff6dc', life: 1 }); }
    pops++;
    whisper(b.name ? '✦ « ' + b.name + ' » brille déjà ✦' : '✦ Une étoile de plus ✦', 'star', b.y);
    list[i] = make(!!b.name, H + 60); go();
  }
  document.addEventListener('pointerdown', function (e) {
    if (blocked(e.target)) return;
    var i = hit(e.clientX, e.clientY); if (i < 0) return;
    if (fine || reduced) { pop(i); return; }
    var b = list[i], s0 = b.s;
    hold = { b: b, t: setTimeout(function () {
      if (!hold) return; var h = hold; hold = null;
      var t0 = performance.now();
      (function grow(now) { var k = Math.min(1, (now - t0) / 260); h.b.s = s0 * (1 + 0.45 * k); go(); if (k < 1) requestAnimationFrame(grow); else { var j = list.indexOf(h.b); if (j >= 0) stars(j); } })(t0);
    }, 420) };
  }, { passive: true });
  function release() { if (!hold) return; clearTimeout(hold.t); var j = list.indexOf(hold.b); hold = null; if (j >= 0) pop(j); }
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', function () { if (hold) { clearTimeout(hold.t); hold = null; } }, { passive: true });
  if (fine) document.addEventListener('pointermove', function (e) {
    var on = !blocked(e.target) && hit(e.clientX, e.clientY) >= 0;
    document.documentElement.classList.toggle('on-bubble', on);
  }, { passive: true });

  size(); seed(); go();
  var lastW = innerWidth;
  addEventListener('resize', function () { size(); if (Math.abs(innerWidth - lastW) > 120) { lastW = innerWidth; seed(); } });
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; if (visible) go(); });

  /* ---------- l'invitation discrète : « touchez une bulle » ---------- */
  var hint = document.querySelector('.hero__hint'), hero = document.querySelector('.hero');
  if (hint) (window.__loaderDone || Promise.resolve()).then(function () {
    setTimeout(function () {
      if (window.scrollY > 80 || (hero && hero.classList.contains('is-building')) || pops) return;
      hint.classList.add('is-on');
      setTimeout(function () { hint.classList.remove('is-on'); }, 5200);
    }, 4200);
  });
  window.AstelsiaBubbles = { pop: pop };
})();

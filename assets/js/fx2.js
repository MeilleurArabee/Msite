/* =========================================================
   Petites animations du 21/11 (choisies par le gérant) :
   PC : exemple qui s'écrit dans la barre, formules en 3D,
        étoiles au fil de la descente, secret « astelsia ».
   Téléphone : vague de couleur sur le titre, barre au premier plan.
   Rien ne tourne en mode doux (prefers-reduced-motion / .soft).
   ========================================================= */
(function () {
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('soft');
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced) return;

  /* 1. L'exemple s'écrit tout seul dans la barre */
  var input = document.getElementById('b-name');
  if (input) {
    var ex = ['Le Fournil', 'Chez Léa', 'Bistrot 56', 'Fleurs & Co', 'Salon Rose', 'La Cave'], i = 0, n = 0, del = false, t;
    var base = input.getAttribute('placeholder') || '';
    function tick() {
      if (document.activeElement === input || input.value) { input.setAttribute('placeholder', base); t = setTimeout(tick, 1200); return; }
      var w = ex[i];
      n += del ? -1 : 1;
      input.setAttribute('placeholder', 'Ex. : ' + w.slice(0, n));
      var wait = del ? 45 : 95;
      if (!del && n === w.length) { del = true; wait = 1600; }
      else if (del && n === 0) { del = false; i = (i + 1) % ex.length; wait = 350; }
      t = setTimeout(tick, wait);
    }
    (window.__loaderDone || Promise.resolve()).then(function () { t = setTimeout(tick, 1800); });
  }

  /* 2. PC : les cartes des formules s'inclinent vers la souris, avec un reflet */
  if (fine) document.querySelectorAll('.plan').forEach(function (card) {
    var raf = 0, rx = 0, ry = 0, tx = 0, ty = 0, gx = 50, gy = 50;
    function draw() {
      rx += (tx - rx) * 0.14; ry += (ty - ry) * 0.14;
      card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      card.style.setProperty('--gx', gx + '%'); card.style.setProperty('--gy', gy + '%');
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.02) raf = requestAnimationFrame(draw);
      else { raf = 0; if (!tx && !ty) card.style.transform = ''; }
    }
    card.addEventListener('pointermove', function (e) {
      var b = card.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      tx = (0.5 - py) * 7; ty = (px - 0.5) * 9; gx = Math.round(px * 100); gy = Math.round(py * 100);
      card.classList.add('is-tilt'); if (!raf) raf = requestAnimationFrame(draw);
    });
    card.addEventListener('pointerleave', function () { tx = 0; ty = 0; card.classList.remove('is-tilt'); if (!raf) raf = requestAnimationFrame(draw); });
  });

  /* 3. Les étoiles s'allument au fil de la descente */
  var scene = document.querySelector('.scene');
  if (scene) {
    var sky = document.createElement('div'); sky.className = 'night'; sky.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 70; k++) {
      var s = document.createElement('i');
      s.style.left = (Math.random() * 100).toFixed(1) + '%';
      s.style.top = (Math.random() * 55).toFixed(1) + '%';
      var z = (Math.random() * 2 + 1).toFixed(1); s.style.width = s.style.height = z + 'px';
      s.style.setProperty('--at', (Math.random() * 0.6).toFixed(2));
      sky.appendChild(s);
    }
    var veil = scene.querySelector('.lav__veil'); scene.insertBefore(sky, veil ? veil.nextSibling : null);
    var stars = sky.children, pending = false;
    function nightFor() {
      pending = false;
      var max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
      for (var j = 0; j < stars.length; j++) {
        var a = +stars[j].style.getPropertyValue('--at'), o = Math.max(0, Math.min(1, (p - 0.3 - a * 0.5) / 0.2));
        stars[j].style.opacity = (o * 0.9).toFixed(2);
      }
    }
    addEventListener('scroll', function () { if (!pending) { pending = true; requestAnimationFrame(nightFor); } }, { passive: true });
    nightFor();
  }

  /* 4. Secret : taper « astelsia » n'importe où = pluie d'étoiles */
  var typed = '';
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-8);
    if (typed === 'astelsia') { typed = ''; starRain(); }
  });
  function starRain() {
    for (var q = 0; q < 46; q++) {
      var st = document.createElement('span'); st.className = 'rain-star'; st.textContent = '✦';
      st.style.left = (Math.random() * 100) + 'vw';
      st.style.fontSize = (10 + Math.random() * 18) + 'px';
      st.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      st.style.animationDelay = (Math.random() * 0.9) + 's';
      st.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      document.body.appendChild(st);
      st.addEventListener('animationend', function () { this.remove(); });
    }
  }

  /* 5. Téléphone : toucher le titre fait partir une vague de couleur du doigt */
  var title = document.querySelector('[data-hero-title]');
  if (title && !fine) {
    title.classList.add('is-lit');
    var wave = 0;
    title.addEventListener('pointerdown', function (e) {
      var cx = e.clientX, cy = e.clientY, t0 = performance.now(), my = ++wave;
      function f(now) {
        if (my !== wave) return;
        var k = Math.min(1, (now - t0) / 1500), r = k < 0.45 ? (k / 0.45) * 520 : 520 * (1 - (k - 0.45) / 0.55);
        title.querySelectorAll('.hw').forEach(function (w) {
          var b = w.getBoundingClientRect();
          w.style.setProperty('--mx', (cx - b.left) + 'px'); w.style.setProperty('--my', (cy - b.top) + 'px');
        });
        title.style.setProperty('--glow', Math.max(0, r).toFixed(1) + 'px');
        if (k < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    });
  }

  /* 6. Téléphone : la barre passe au premier plan quand on écrit dedans */
  if (input && !fine) {
    input.addEventListener('focus', function () { root.classList.add('is-typing'); });
    input.addEventListener('blur', function () { root.classList.remove('is-typing'); });
  }
})();

/* Peintre du paysage Astelsia : rendu hors ligne, exporté en calques WebP.
   Heure bleue, grand chêne et balançoire, herbes roses vaporeuses. */
(function () {
  'use strict';

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function noise1(seed) {
    var r = rng(seed), g = [];
    for (var i = 0; i < 2048; i++) g.push(r());
    return function (x) {
      var i = Math.floor(x), f = x - i, a = g[i & 2047], b = g[(i + 1) & 2047], t = f * f * (3 - 2 * f);
      return a + (b - a) * t;
    };
  }
  function fbm(n, x, oct) {
    var s = 0, a = 0.5, f = 1, norm = 0;
    for (var o = 0; o < oct; o++) { s += n(x * f) * a; norm += a; a *= 0.5; f *= 2.03; }
    return s / norm;
  }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pick(r, arr) { return arr[(r() * arr.length) | 0]; }
  function blurInto(dst, src, px) {
    var x = dst.getContext('2d'); x.save(); x.filter = 'blur(' + px + 'px)'; x.drawImage(src, 0, 0); x.restore();
  }

  /* ---------------- Ciel : nuages roses ---------------- */
  function clouds(W, H, seed) {
    var c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
    var s = Math.min(W, H) / 1000;
    var band = H * 0.56;
    // longues traînées lumineuses près de l'horizon
    for (var i = 0; i < 70; i++) {
      var cx = r() * W * 1.2 - W * 0.1, cy = band + (r() - 0.6) * H * 0.16;
      var rx = (120 + r() * 420) * s, ry = (6 + r() * 22) * s;
      var warm = cx / W;
      var g = x.createRadialGradient(cx, cy, 0, cx, cy, rx);
      var col = warm > 0.55 ? [250, 214, 190] : warm > 0.3 ? [238, 182, 206] : [176, 168, 226];
      g.addColorStop(0, 'rgba(' + col + ',' + (0.22 + r() * 0.3) + ')');
      g.addColorStop(1, 'rgba(' + col + ',0)');
      x.save(); x.translate(cx, cy); x.scale(1, ry / rx); x.translate(-cx, -cy);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rx, 0, 7); x.fill(); x.restore();
    }
    // masses sombres en haut à droite, éclairées par en dessous
    for (var j = 0; j < 30; j++) {
      var mx = W * (0.45 + r() * 0.65), my = H * (0.18 + r() * 0.26) + (mx / W) * H * 0.06;
      var mr = (90 + r() * 260) * s, mry = mr * (0.1 + r() * 0.12);
      var gg = x.createRadialGradient(mx, my, 0, mx, my, mr);
      gg.addColorStop(0, 'rgba(40, 58, 150,' + (0.08 + r() * 0.14) + ')');
      gg.addColorStop(1, 'rgba(32, 52, 140,0)');
      x.save(); x.translate(mx, my); x.scale(1, mry / mr); x.translate(-mx, -my);
      x.fillStyle = gg; x.beginPath(); x.arc(mx, my, mr, 0, 7); x.fill(); x.restore();
      // liseré rose dessous
      var lg = x.createRadialGradient(mx, my + mry * 0.7, 0, mx, my + mry * 0.7, mr * 0.7);
      lg.addColorStop(0, 'rgba(240, 170, 200,' + (0.10 + r() * 0.16) + ')');
      lg.addColorStop(1, 'rgba(240, 170, 200,0)');
      x.save(); x.translate(mx, my + mry * 0.7); x.scale(1, 0.18); x.translate(-mx, -(my + mry * 0.7));
      x.fillStyle = lg; x.beginPath(); x.arc(mx, my + mry * 0.7, mr * 0.7, 0, 7); x.fill(); x.restore();
    }
    var out = canvas(W, H); blurInto(out, c, 8 * s + 2);
    return out;
  }

  /* ---------------- Montagnes lointaines ---------------- */
  function ridgePath(x, W, H, base, amp, n, freq, slope) {
    x.beginPath(); x.moveTo(0, H);
    for (var px = 0; px <= W + 4; px += 3) {
      var y = base - (fbm(n, px / W * freq, 5) - 0.5) * 2 * amp + (px / W) * slope;
      x.lineTo(px, y);
    }
    x.lineTo(W, H); x.closePath();
  }
  function ridgedPath(x, W, H, base, amp, n, freq, slope) {
    x.beginPath(); x.moveTo(0, H);
    for (var px = 0; px <= W + 4; px += 3) {
      var v = fbm(n, px / W * freq, 6), rv = 1 - Math.abs(2 * v - 1);
      var y = base - Math.pow(rv, 1.6) * amp + (px / W) * slope;
      x.lineTo(px, y);
    }
    x.lineTo(W, H); x.closePath();
  }
  function far(W, H, seed, hy) {
    var c = canvas(W, H), x = c.getContext('2d'), fq = Math.max(0.62, W / 2400);
    var n1 = noise1(seed), n2 = noise1(seed + 7), n3 = noise1(seed + 13);
    function layer(n, base, amp, freq, slope, top, bottom, fogA) {
      ridgedPath(x, W, H, base, amp, n, freq, slope);
      var g = x.createLinearGradient(0, base - amp, 0, hy);
      g.addColorStop(0, top); g.addColorStop(0.55, bottom); g.addColorStop(1, 'rgba(200, 196, 238,' + fogA + ')');
      x.fillStyle = g; x.fill();
    }
    layer(n1, H * 0.40, H * 0.15, 2.2 * fq, H * 0.05, 'rgba(98, 122, 206, 0.92)', 'rgba(140, 158, 224, 0.95)', 1);
    layer(n2, H * 0.46, H * 0.16, 2.9 * fq, H * 0.03, '#5470c2', '#7f95d8', 0.95);
    // lumière chaude à droite, seulement sur les montagnes
    x.save(); x.globalCompositeOperation = 'source-atop';
    var wg = x.createRadialGradient(W * 0.9, hy, 0, W * 0.9, hy, W * 0.45);
    wg.addColorStop(0, 'rgba(255, 214, 186, 0.5)'); wg.addColorStop(1, 'rgba(255, 214, 186, 0)');
    x.fillStyle = wg; x.fillRect(0, 0, W, H); x.restore();
    layer(n3, H * 0.52, H * 0.1, 1.9 * fq, -H * 0.03, '#3a56a4', '#6178bf', 0.85);
    var out = canvas(W, H); blurInto(out, c, 2);
    return out;
  }

  /* ---------------- Collines intermédiaires ---------------- */
  function mid(W, H, seed, hy) {
    var c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
    var n1 = noise1(seed), n2 = noise1(seed + 5);
    // grande colline douce
    ridgePath(x, W, H, H * 0.50, H * 0.045, n1, 1.7, -H * 0.02);
    var g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#22397a'); g.addColorStop(0.55, '#2c4888'); g.addColorStop(1, '#6a80b0');
    x.fillStyle = g; x.fill();
    // lisière d'arbres sur la crête (petites touffes)
    var ridgeY = function (px) { return H * 0.50 - (fbm(n1, px / W * 1.7, 5) - 0.5) * 2 * H * 0.045 + (px / W) * -H * 0.02; };
    for (var grp = 0; grp < 26; grp++) {
      var gx0 = r() * W; if (r() < gx0 / W * 0.7) continue; // plus dense à gauche
      var count = 3 + (r() * 14 | 0), gw = (20 + r() * 90) * (W / 2400);
      for (var i = 0; i < count; i++) {
        var px = gx0 + (r() - 0.5) * gw, py = ridgeY(px) + H * 0.004 + r() * H * 0.01, rr = (3 + r() * 6) * (W / 2400);
        x.fillStyle = 'rgba(26, 40, 92,' + (0.35 + r() * 0.35) + ')';
        x.beginPath(); x.ellipse(px, py - rr * 0.6, rr, rr * 1.15, 0, 0, 7); x.fill();
      }
    }
    // colline plus proche, à gauche
    ridgePath(x, W, H, H * 0.555, H * 0.03, n2, 1.3, H * 0.03);
    g = x.createLinearGradient(0, H * 0.5, 0, hy + H * 0.04);
    g.addColorStop(0, '#1f3570'); g.addColorStop(1, '#3a5290'); x.fillStyle = g; x.fill();
    // brume au pied
    x.save(); x.globalCompositeOperation = 'source-atop';
    var fg = x.createLinearGradient(0, hy - H * 0.06, 0, hy + H * 0.03);
    fg.addColorStop(0, 'rgba(170, 170, 225, 0)'); fg.addColorStop(1, 'rgba(178, 176, 228, 0.55)');
    x.fillStyle = fg; x.fillRect(0, 0, W, H);
    var wg = x.createRadialGradient(W * 0.95, hy, 0, W * 0.95, hy, W * 0.35);
    wg.addColorStop(0, 'rgba(255, 210, 190, 0.35)'); wg.addColorStop(1, 'rgba(255, 210, 190, 0)');
    x.fillStyle = wg; x.fillRect(0, 0, W, H);
    x.restore();
    var out = canvas(W, H); blurInto(out, c, 1.4);
    return out;
  }

  /* ---------------- Prairie + grand chêne + balançoire ---------------- */
  function meadowAndTree(W, H, seed, hy, opt) {
    var c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
    var k = W / 2400;
    var n = noise1(seed + 2);
    var my = function (px) { return hy + (fbm(n, px / W * 2, 4) - 0.5) * H * 0.02; };
    // sol
    x.beginPath(); x.moveTo(0, H);
    for (var px = 0; px <= W + 4; px += 4) x.lineTo(px, my(px));
    x.lineTo(W, H); x.closePath();
    var g = x.createLinearGradient(0, hy, 0, H);
    g.addColorStop(0, '#8088b8'); g.addColorStop(0.08, '#6f8a94'); g.addColorStop(0.3, '#5d8270');
    g.addColorStop(0.7, '#4a6f52'); g.addColorStop(1, '#3a5a40');
    x.fillStyle = g; x.fill();
    // texture d'herbe (perspective : plus fin au loin)
    x.save(); x.clip();
    var greens = ['93,138,96', '122,160,108', '74,112,72', '147,176,122', '104,140,120'];
    for (var i = 0; i < 26000 * k * (H / 1000); i++) {
      var t = Math.pow(r(), 0.7), gy = lerp(hy, H, t), gx = r() * W;
      var len = (2 + t * 14) * k * 2.4, a = 0.12 + t * 0.3;
      x.strokeStyle = 'rgba(' + pick(r, greens) + ',' + a + ')';
      x.lineWidth = (0.6 + t * 1.6) * k * 2;
      x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + (r() - 0.5) * len * 0.5, gy - len); x.stroke();
    }
    // reflets lavande et taches roses au loin
    for (var p = 0; p < 40; p++) {
      var hx = r() * W, hyy = hy + r() * H * 0.08, hr = (40 + r() * 160) * k * 2;
      var pg = x.createRadialGradient(hx, hyy, 0, hx, hyy, hr);
      pg.addColorStop(0, r() > 0.5 ? 'rgba(236, 170, 210, 0.22)' : 'rgba(170, 170, 230, 0.2)');
      pg.addColorStop(1, 'rgba(236, 170, 210, 0)');
      x.save(); x.translate(hx, hyy); x.scale(1, 0.2); x.translate(-hx, -hyy);
      x.fillStyle = pg; x.beginPath(); x.arc(hx, hyy, hr, 0, 7); x.fill(); x.restore();
    }
    x.restore();

    // petit arbre lointain à gauche
    var dt = canvas(W, H), dx = dt.getContext('2d');
    var dtx = W * (opt.tall ? 0.9 : 0.04), dty = my(dtx) + H * 0.01, ds = 34 * k * 2.2;
    dx.fillStyle = '#26365e'; dx.fillRect(dtx - ds * 0.05, dty - ds * 0.7, ds * 0.1, ds * 0.72);
    for (var q = 0; q < 70; q++) {
      dx.fillStyle = pick(r, ['#22325a', '#2a3c66', '#33497a']);
      dx.beginPath(); dx.arc(dtx + (r() - 0.5) * ds * 1.6, dty - ds * 0.9 + (r() - 0.5) * ds * 0.8, ds * (0.12 + r() * 0.16), 0, 7); dx.fill();
    }
    blurInto(c, dt, 1.2);

    // ombre au pied du chêne
    var S = opt.S, tx = opt.tx, by = opt.by;
    var sh = x.createRadialGradient(tx + S * 0.2, by + S * 0.02, 0, tx + S * 0.2, by + S * 0.02, S * 0.9);
    sh.addColorStop(0, 'rgba(15, 28, 40, 0.45)'); sh.addColorStop(1, 'rgba(15, 28, 40, 0)');
    x.save(); x.translate(tx, by); x.scale(1, 0.16); x.translate(-tx, -by);
    x.fillStyle = sh; x.beginPath(); x.arc(tx + S * 0.2, by + S * 0.02, S * 0.9, 0, 7); x.fill(); x.restore();

    var tree = oak(W, H, seed + 11, tx, by, S);
    x.drawImage(tree.canvas, 0, 0);
    var out = canvas(W, H); blurInto(out, c, 0.45);
    return { canvas: out, swing: tree.swing };
  }

  function oak(W, H, seed, tx, by, S) {
    var c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
    var tips = [], leafSpots = [];
    var bark = '#141b2b';
    x.lineCap = 'round'; x.lineJoin = 'round';

    function limb(pts, w0, w1) {
      for (var i = 0; i < pts.length - 1; i++) {
        var t = i / (pts.length - 1);
        x.strokeStyle = bark; x.lineWidth = lerp(w0, w1, t);
        x.beginPath(); x.moveTo(pts[i][0], pts[i][1]); x.lineTo(pts[i + 1][0], pts[i + 1][1]); x.stroke();
      }
      // liseré clair côté ciel
      for (var j = 0; j < pts.length - 1; j++) {
        var tt = j / (pts.length - 1), ww = lerp(w0, w1, tt);
        if (ww < 3) continue;
        x.strokeStyle = 'rgba(70, 92, 140, 0.35)'; x.lineWidth = ww * 0.22;
        x.beginPath(); x.moveTo(pts[j][0] + ww * 0.25, pts[j][1] - ww * 0.3); x.lineTo(pts[j + 1][0] + ww * 0.25, pts[j + 1][1] - ww * 0.3); x.stroke();
      }
    }
    function path(x0, y0, ang, len, wob) {
      var pts = [[x0, y0]], a = ang, px = x0, py = y0, seg = 7;
      for (var s = 0; s < seg; s++) {
        a += (r() - 0.5) * wob;
        px += Math.cos(a) * len / seg; py += Math.sin(a) * len / seg;
        pts.push([px, py]);
      }
      return { pts: pts, end: [px, py], ang: a };
    }
    function grow(x0, y0, ang, len, w, depth) {
      var p = path(x0, y0, ang, len, 0.32);
      limb(p.pts, w, w * 0.7);
      if (depth <= 3) for (var i = 2; i < p.pts.length; i += 2) leafSpots.push([p.pts[i][0], p.pts[i][1] + (r() < 0.3 ? S * 0.04 : 0), depth + 1]);
      if (depth === 0 || w < 1.4) { tips.push([p.end[0], p.end[1], 0]); return; }
      var kids = depth > 3 ? (r() < 0.55 ? 2 : 3) : 2;
      for (var k = 0; k < kids; k++) {
        var spread = (k - (kids - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.3;
        var a = p.ang + spread;
        var target = a < -Math.PI / 2 ? -2.55 : -0.6; // un chêne s'étale à l'horizontale
        a = lerp(a, target, 0.24);
        grow(p.end[0], p.end[1], a, len * (0.6 + r() * 0.12), w * 0.66, depth - 1);
      }
    }

    // tronc évasé avec racines
    var tw = S * 0.1, top = by - S * 0.34;
    x.fillStyle = bark;
    x.beginPath();
    x.moveTo(tx - tw * 1.9, by + S * 0.01);
    x.quadraticCurveTo(tx - tw * 0.7, by - S * 0.03, tx - tw * 0.62, by - S * 0.12);
    x.bezierCurveTo(tx - tw * 0.48, by - S * 0.22, tx - tw * 0.7, top + S * 0.05, tx - tw * 0.55, top);
    x.lineTo(tx + tw * 0.55, top);
    x.bezierCurveTo(tx + tw * 0.62, top + S * 0.06, tx + tw * 0.42, by - S * 0.22, tx + tw * 0.6, by - S * 0.1);
    x.quadraticCurveTo(tx + tw * 0.75, by - S * 0.03, tx + tw * 2.1, by + S * 0.012);
    x.closePath(); x.fill();
    // écorce : stries verticales
    x.save(); x.clip();
    for (var b = 0; b < 140; b++) {
      var bx = tx + (r() - 0.5) * tw * 1.4, byy = top + r() * (by - top);
      x.strokeStyle = r() > 0.6 ? 'rgba(60, 76, 110, 0.35)' : 'rgba(5, 8, 16, 0.4)';
      x.lineWidth = 1 + r() * 2.5;
      x.beginPath(); x.moveTo(bx, byy); x.lineTo(bx + (r() - 0.5) * 6, byy + S * (0.03 + r() * 0.06)); x.stroke();
    }
    var tg = x.createLinearGradient(tx - tw, 0, tx + tw, 0);
    tg.addColorStop(0, 'rgba(0,0,0,0.35)'); tg.addColorStop(0.7, 'rgba(0,0,0,0)'); tg.addColorStop(1, 'rgba(90,110,160,0.25)');
    x.fillStyle = tg; x.fillRect(tx - tw * 2, top, tw * 4, by - top);
    x.restore();

    // charpentières
    grow(tx - tw * 0.2, top + S * 0.03, -2.85, S * 0.4, tw * 0.62, 5);
    grow(tx - tw * 0.1, top, -2.25, S * 0.34, tw * 0.6, 5);
    grow(tx, top - S * 0.01, -1.7, S * 0.3, tw * 0.58, 5);
    grow(tx + tw * 0.1, top, -1.2, S * 0.32, tw * 0.58, 5);
    grow(tx + tw * 0.2, top + S * 0.03, -0.55, S * 0.36, tw * 0.56, 5);

    // la grande branche de la balançoire
    var sw = [[tx + tw * 0.3, top + S * 0.07]], sa = -0.3, sx = sw[0][0], sy = sw[0][1], L = S * 0.85;
    for (var s = 0; s < 14; s++) {
      sa = lerp(sa, s < 8 ? -0.06 : -0.22, 0.25) + (r() - 0.5) * 0.06;
      sx += Math.cos(sa) * L / 14; sy += Math.sin(sa) * L / 14; sw.push([sx, sy]);
    }
    limb(sw, tw * 0.5, tw * 0.2);
    for (var lt = 10; lt < sw.length; lt += 2) leafSpots.push([sw[lt][0], sw[lt][1] - S * 0.04, 2]);
    grow(sx, sy, -0.7, S * 0.16, tw * 0.18, 2);
    grow(sw[10][0], sw[10][1], -1.3, S * 0.2, tw * 0.18, 3);
    var aI = 6, bI = 8;
    var swing = {
      x1: sw[aI][0], x2: sw[bI][0],
      y1: (sw[aI][1] + sw[bI][1]) / 2 + tw * 0.12,
      seatY: by + S * 0.06
    };

    // remplissage de la couronne : un dôme irrégulier au-dessus des branches
    var minX = 1e9, maxX = -1e9, minY = 1e9;
    tips.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); });
    var ccx = (minX + maxX) / 2, crx = (maxX - minX) / 2 * 0.86, cry = (top - minY) * 0.62, ccy = minY + cry * 0.9;
    var fill = [];
    for (var fi = 0; fi < 70; fi++) {
      var fa = r() * 6.283, fd = Math.sqrt(r());
      var fxp = ccx + Math.cos(fa) * fd * crx, fyp = ccy + Math.sin(fa) * fd * cry * (Math.sin(fa) > 0 ? 0.55 : 1);
      fill.push([fxp, fyp, 1]);
    }
    // feuillage en 3 passes : masse d'ombre, ton moyen, lumière du ciel
    var spots = fill.concat(tips, leafSpots);
    var shadow = ['#0a1120', '#0c1526', '#0f192c', '#0b1622'];
    var midc = ['#142235', '#17283c', '#1b2e44', '#16293a', '#1c3043'];
    var high = ['#2b4563', '#324e6d', '#3a5674', '#41607c', '#365069'];
    function leaves(cx, cy, R, count, colors, alpha, biasY, biasX) {
      for (var i = 0; i < count; i++) {
        var a = r() * 6.283, d = Math.sqrt(r()) * R;
        var lx = cx + Math.cos(a) * d + biasX * R, ly = cy + Math.sin(a) * d * 0.78 + biasY * R;
        var lr = S * (0.005 + r() * 0.007);
        x.fillStyle = pick(r, colors); x.globalAlpha = alpha * (0.7 + r() * 0.3);
        x.beginPath(); x.ellipse(lx, ly, lr, lr * (0.55 + r() * 0.3), r() * 3.14, 0, 7); x.fill();
      }
      x.globalAlpha = 1;
    }
    spots.forEach(function (p) { var R = S * (p[2] === 0 ? 0.09 : 0.08); leaves(p[0], p[1] + R * 0.15, R * 1.15, 120, shadow, 0.95, 0, 0); });
    spots.forEach(function (p) { var R = S * (p[2] === 0 ? 0.08 : 0.068); leaves(p[0], p[1], R, 95, midc, 0.92, -0.2, 0.05); });
    spots.forEach(function (p) { if (r() < 0.7) { var R = S * 0.045; leaves(p[0], p[1], R, 26, high, 0.55, -0.6, 0.35); } });
    // fines feuilles isolées sur les bords pour casser la silhouette
    spots.forEach(function (p) {
      for (var i = 0; i < 6; i++) {
        var a = r() * 6.283, d = S * (0.09 + r() * 0.05);
        x.fillStyle = pick(r, midc); x.globalAlpha = 0.8;
        x.beginPath(); x.ellipse(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d * 0.7, S * 0.006, S * 0.004, r() * 3, 0, 7); x.fill();
      }
      x.globalAlpha = 1;
    });
    // volume : le bas du feuillage plus sombre, liseré rosé côté couchant
    x.save(); x.globalCompositeOperation = 'source-atop';
    var vg = x.createLinearGradient(0, by - S * 1.35, 0, by - S * 0.2);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4, 8, 20, 0.35)');
    x.fillStyle = vg; x.fillRect(0, 0, W, by);
    var rg = x.createRadialGradient(tx + S * 1.3, by - S * 0.8, 0, tx + S * 1.3, by - S * 0.8, S * 1.1);
    rg.addColorStop(0, 'rgba(236, 170, 200, 0.22)'); rg.addColorStop(1, 'rgba(236, 170, 200, 0)');
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.restore();
    var soft = canvas(W, H); blurInto(soft, c, 0.7);
    return { canvas: soft, swing: swing };
  }

  /* ---------------- Premier plan : herbes roses, fleurs ---------------- */
  function muhly(x, r, cx, by, rad, h, k, alpha) {
    // halo vaporeux, centré sur le haut de la touffe
    var hy0 = by - h * 0.62;
    var hg = x.createRadialGradient(cx, hy0, 0, cx, hy0, rad * 1.2);
    hg.addColorStop(0, 'rgba(240, 176, 214,' + 0.08 * alpha + ')'); hg.addColorStop(1, 'rgba(240, 176, 214, 0)');
    x.save(); x.translate(cx, hy0); x.scale(1, 0.55); x.translate(-cx, -hy0);
    x.fillStyle = hg; x.beginPath(); x.arc(cx, hy0, rad * 1.2, 0, 7); x.fill(); x.restore();
    var stems = Math.round(rad * 2.6);
    for (var i = 0; i < stems; i++) {
      var sx = cx + (r() - 0.5) * rad * 0.18, sy = by + r() * h * 0.05;
      var ang = (r() - 0.5) * 2.1, len = h * (0.5 + r() * 0.55);
      var ex = sx + Math.sin(ang) * len, ey = sy - Math.cos(ang) * len * 0.92;
      var mx = sx + Math.sin(ang) * len * 0.25, myy = sy - len * 0.68;
      var rgb = (236 + (r() * 18 | 0)) + ',' + (146 + (r() * 46 | 0)) + ',' + (192 + (r() * 30 | 0));
      var a = (0.07 + r() * 0.13) * alpha;
      // la tige s'efface vers le pied : pas de base « en bloc »
      var gr = x.createLinearGradient(sx, sy, ex, ey);
      gr.addColorStop(0, 'rgba(' + rgb + ',0)'); gr.addColorStop(0.45, 'rgba(' + rgb + ',' + a * 0.6 + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',' + a + ')');
      x.strokeStyle = gr; x.lineWidth = (0.4 + r() * 0.7) * k;
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(mx, myy, ex, ey); x.stroke();
      // grains de la panicule : l'aspect « nuage »
      for (var g = 0; g < 5; g++) {
        var t = 0.55 + r() * 0.45;
        var gx = lerp(lerp(sx, mx, t), lerp(mx, ex, t), t) + (r() - 0.5) * 7 * k;
        var gy = lerp(lerp(sy, myy, t), lerp(myy, ey, t), t) + (r() - 0.5) * 7 * k;
        x.fillStyle = 'rgba(' + rgb + ',' + (0.07 + r() * 0.13) * alpha + ')';
        x.beginPath(); x.arc(gx, gy, (0.5 + r() * 0.9) * k, 0, 7); x.fill();
      }
    }
  }
  function blades(x, r, cx, by, spread, h, k, n, alpha) {
    for (var i = 0; i < n; i++) {
      var bx = cx + (r() - 0.5) * spread, bby = by + r() * h * 0.15, len = h * (0.3 + r() * 0.7), lean = (r() - 0.5) * len * 0.6;
      var gr = x.createLinearGradient(bx, bby, bx + lean, bby - len);
      gr.addColorStop(0, 'rgba(46, 74, 48, 0)'); gr.addColorStop(0.25, 'rgba(52, 82, 54,' + 0.85 * alpha + ')'); gr.addColorStop(1, 'rgba(126, 160, 108,' + 0.7 * alpha + ')');
      x.strokeStyle = gr; x.lineWidth = (0.8 + r() * 1.6) * k;
      x.beginPath(); x.moveTo(bx, bby); x.quadraticCurveTo(bx + lean * 0.2, bby - len * 0.6, bx + lean, bby - len); x.stroke();
    }
  }
  function flower(x, r, fx, fy, size, kind) {
    if (kind === 'daisy') {
      x.strokeStyle = 'rgba(70, 110, 70, 0.8)'; x.lineWidth = size * 0.12;
      x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + (r() - 0.5) * size, fy + size * 4); x.stroke();
      var petals = 8 + (r() * 4 | 0);
      for (var p = 0; p < petals; p++) {
        var a = p / petals * 6.283 + r() * 0.2;
        x.fillStyle = r() > 0.3 ? 'rgba(250, 248, 242, 0.95)' : 'rgba(246, 226, 236, 0.95)';
        x.beginPath(); x.ellipse(fx + Math.cos(a) * size * 0.55, fy + Math.sin(a) * size * 0.32, size * 0.45, size * 0.16, a, 0, 7); x.fill();
      }
      x.fillStyle = '#f2c84b'; x.beginPath(); x.ellipse(fx, fy, size * 0.22, size * 0.15, 0, 0, 7); x.fill();
    } else {
      x.fillStyle = kind === 'orange' ? 'rgba(245, 160, 80, 0.95)' : 'rgba(246, 206, 90, 0.95)';
      for (var q = 0; q < 5; q++) { var aa = q / 5 * 6.283; x.beginPath(); x.arc(fx + Math.cos(aa) * size * 0.25, fy + Math.sin(aa) * size * 0.18, size * 0.24, 0, 7); x.fill(); }
    }
  }
  function front(W, H, seed, hy, opt) {
    var r = rng(seed), k = Math.max(W / 1200, H / 900);
    var back = canvas(W, H), mid = canvas(W, H), near = canvas(W, H);
    var xb = back.getContext('2d'), xm = mid.getContext('2d'), xn = near.getContext('2d');
    [xb, xm, xn].forEach(function (c) { c.lineCap = 'round'; });
    function density(px) { var d = Math.abs(px / W - opt.path) * 2; return 0.25 + Math.min(1, d) * 0.75; }
    // rang du fond : petites touffes vaporeuses
    for (var i = 0; i < 55; i++) {
      var cx = r() * W; if (r() > density(cx)) continue;
      var by = hy + H * (0.08 + r() * 0.1);
      muhly(xb, r, cx, by, (30 + r() * 30) * k, (30 + r() * 30) * k, k * 0.7, 0.75);
      blades(xb, r, cx, by, 50 * k, 22 * k, k * 0.7, 14, 0.7);
    }
    // rang du milieu : net, avec les fleurs
    for (var j = 0; j < 30; j++) {
      var cx2 = r() * W; if (r() > density(cx2)) continue;
      var by2 = hy + H * (0.22 + r() * 0.16);
      muhly(xm, r, cx2, by2, (60 + r() * 60) * k, (70 + r() * 80) * k, k, 1);
      blades(xm, r, cx2, by2, 110 * k, 50 * k, k, 34, 0.9);
    }
    for (var f = 0; f < 90 * (W / 1200); f++) {
      var fx = W * (0.25 + r() * 0.7), fy = hy + H * (0.2 + r() * 0.24), sz = (3 + r() * 5) * k * (0.6 + (fy - hy) / H);
      var kind = r() < 0.62 ? 'daisy' : r() < 0.7 ? 'orange' : 'yellow';
      flower(xm, r, fx, fy, sz, kind);
    }
    // premier plan : grandes touffes, flou de profondeur
    for (var q = 0; q < 14; q++) {
      var cx3 = r() * W * 1.1 - W * 0.05; if (r() > density(cx3) * 1.1) continue;
      var by3 = H * (1.0 + r() * 0.08);
      muhly(xn, r, cx3, by3, (110 + r() * 100) * k, (150 + r() * 160) * k, k * 1.8, 1);
      blades(xn, r, cx3, by3, 200 * k, 120 * k, k * 1.6, 40, 1);
    }
    var out = canvas(W, H), xo = out.getContext('2d');
    blurInto(out, back, 1.1);
    xo.drawImage(mid, 0, 0);
    blurInto(out, near, 3.2 * k);
    return out;
  }

  /* ---------------- Composition complète ---------------- */
  window.paintScene = function (mode) {
    var tall = mode === 'tall';
    var W = tall ? 1100 : 2400, H = tall ? 1500 : 1000;
    var hy = H * (tall ? 0.62 : 0.6);
    var opt = tall
      ? { tall: true, S: 470, tx: W * 0.3, by: H * 0.72, path: 0.55 }
      : { tall: false, S: 470, tx: W * 0.3, by: H * 0.76, path: 0.48 }; // chêne un peu à droite : jamais coupé sur grand écran
    var cw = tall ? 1000 : 2400, ch = tall ? 2000 : 1350;
    var t0 = performance.now();
    var res = {
      clouds: clouds(cw, ch, 101),
      far: far(W, H, 202, hy),
      mid: mid(W, H, 303, hy)
    };
    var mt = meadowAndTree(W, H, 404, hy, opt);
    res.tree = mt.canvas;
    res.front = front(W, H, 505, hy, opt);
    var out = {};
    Object.keys(res).forEach(function (key) { out[key] = res[key].toDataURL('image/webp', key === 'front' ? 0.8 : 0.84); });
    // aperçu composé comme sur le site : le paysage occupe le bas de l'écran
    var VH = Math.round(H / (tall ? 0.64 : 0.72)), prev = canvas(W, VH), xp = prev.getContext('2d');
    var sky = xp.createLinearGradient(0, 0, 0, VH);
    [[0, '#0b2687'], [0.28, '#1d4ccc'], [0.44, '#3b74e4'], [0.54, '#8ea6ea'], [0.62, '#e8b9cd'], [0.7, '#f8d9ab'], [1, '#f8d9ab']].forEach(function (st) { sky.addColorStop(st[0], st[1]); });
    xp.fillStyle = sky; xp.fillRect(0, 0, W, VH);
    var glow = xp.createRadialGradient(W * 0.75, VH * 0.62, 0, W * 0.75, VH * 0.62, W * 0.5);
    glow.addColorStop(0, 'rgba(255, 214, 170, 0.45)'); glow.addColorStop(1, 'rgba(255, 214, 170, 0)');
    xp.fillStyle = glow; xp.fillRect(0, 0, W, VH);
    var cs = Math.max(W / cw, VH / ch); xp.drawImage(res.clouds, (W - cw * cs) / 2, (VH - ch * cs) / 2, cw * cs, ch * cs);
    ['far', 'mid', 'tree', 'front'].forEach(function (kk) { xp.drawImage(res[kk], 0, VH - H); });
    out.preview = prev.toDataURL('image/jpeg', 0.85);
    out.meta = { w: W, h: H, swing: mt.swing, ms: Math.round(performance.now() - t0) };
    return out;
  };
})();

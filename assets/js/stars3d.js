/* =========================================================
   Astelsia — les trois étoiles dorées en 3D (WebGL, sans bibliothèque)
   • Forme « gonflée » calculée par le code : aucun fichier 3D à charger.
   • Placement en coordonnées d'écran, selon l'état de la page :
     accueil, création du site en cours, descente vers le paysage.
   • S'allège tout seul si le téléphone peine, s'arrête hors de l'écran.
   API : window.AstelsiaStars = { ready, startIntro(), setBuilding(bool), pulse() }
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.querySelector('.stars3d');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var noop = function () {};
  var api = { ready: Promise.resolve(false), startIntro: noop, setBuilding: noop, pulse: noop };
  window.AstelsiaStars = api;

  var gl = null;
  try { gl = canvas && canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: !!window.__starsSnapshot }); } catch (e) { gl = null; }
  if (!gl) { document.documentElement.classList.add('no-3d'); return; }

  var small = Math.min(innerWidth, innerHeight) < 700;

  /* ---------------------------------------------------------
     1. La forme : une étoile arrondie, bombée, lisse
     --------------------------------------------------------- */
  function outline() { // contour arrondi, échantillonné finement
    var R = 1, r = 0.55, tOut = 0.36, tIn = 0.42, P = [], out = [], i;
    for (i = 0; i < 10; i++) {
      var a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      P.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    var lerp2 = function (p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
    var prevEnd = null, first = null;
    for (i = 0; i < 10; i++) {
      var p = P[i], pr = P[(i + 9) % 10], nx = P[(i + 1) % 10], t = i % 2 ? tIn : tOut;
      var A = lerp2(p, pr, t), B = lerp2(p, nx, t), k;
      if (prevEnd) for (k = 1; k <= 16; k++) out.push(lerp2(prevEnd, A, k / 16)); else first = A;
      for (k = 0; k <= 40; k++) { // courbe de Bézier quadratique
        var u = k / 40, a1 = lerp2(A, p, u), b1 = lerp2(p, B, u);
        out.push(lerp2(a1, b1, u));
      }
      prevEnd = B;
    }
    for (k = 1; k <= 16; k++) out.push(lerp2(prevEnd, first, k / 16));
    return out;
  }

  function buildStar() {
    var N = small ? 160 : 220, M = small ? 26 : 36, i, j, k;
    var pts = outline();
    var polar = pts.map(function (v) { return [Math.atan2(v[1], v[0]), Math.hypot(v[0], v[1])]; });
    var Rj = [];
    for (j = 0; j < N; j++) {
      var th = -Math.PI + (j / N) * Math.PI * 2, best = 1, bd = 9;
      for (k = 0; k < polar.length; k++) {
        var d = Math.abs(polar[k][0] - th); if (d > Math.PI) d = 2 * Math.PI - d;
        if (d < bd) { bd = d; best = polar[k][1]; }
      }
      Rj.push(best);
    }
    // « gonflage » façon ballon : on résout une équation de pression sur une grille,
    // la surface obtenue est parfaitement lisse (aucun pli), épaisse là où l'étoile est large
    function radiusAt(th) {
      var f = ((th + Math.PI) / (Math.PI * 2)) * N, j0 = Math.floor(f) % N, j1 = (j0 + 1) % N, w = f - Math.floor(f);
      return Rj[j0] * (1 - w) + Rj[j1] * w;
    }
    var G = small ? 96 : 128, ext = 1.06, hstep = (2 * ext) / (G - 1), phi = new Float32Array(G * G), inside = new Uint8Array(G * G), gx, gy;
    for (gy = 0; gy < G; gy++) for (gx = 0; gx < G; gx++) {
      var px = -ext + gx * hstep, py = -ext + gy * hstep;
      inside[gy * G + gx] = Math.hypot(px, py) < radiusAt(Math.atan2(py, px)) - 0.004 ? 1 : 0;
    }
    var h2 = hstep * hstep;
    for (var it = 0; it < (small ? 260 : 340); it++) {
      for (gy = 1; gy < G - 1; gy++) for (gx = 1; gx < G - 1; gx++) {
        var q = gy * G + gx; if (!inside[q]) continue;
        var nv = (phi[q - 1] + phi[q + 1] + phi[q - G] + phi[q + G] + h2) * 0.25;
        phi[q] += 1.9 * (nv - phi[q]);
      }
    }
    var pmax = 0; for (k = 0; k < phi.length; k++) if (phi[k] > pmax) pmax = phi[k];
    function sample(x, y) {
      var fx = (x + ext) / hstep, fy = (y + ext) / hstep, x0 = Math.max(0, Math.min(G - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(G - 2, Math.floor(fy)));
      var tx = Math.min(1, Math.max(0, fx - x0)), ty = Math.min(1, Math.max(0, fy - y0));
      var v = phi[y0 * G + x0] * (1 - tx) * (1 - ty) + phi[y0 * G + x0 + 1] * tx * (1 - ty) + phi[(y0 + 1) * G + x0] * (1 - tx) * ty + phi[(y0 + 1) * G + x0 + 1] * tx * ty;
      return Math.max(0, v / pmax);
    }
    function height(x, y, t) {
      var v = sample(x, y);
      // bord parfaitement rond : on rapproche le profil d'un quart de cercle près du contour
      var edgeRound = Math.sqrt(Math.max(0, 1 - t * t));
      return 0.64 * Math.pow(v, 0.5) * 0.75 + 0.64 * 0.25 * edgeRound * Math.pow(v, 0.25);
    }
    var xy = [], zf = [];
    for (i = 1; i <= M; i++) {
      var t = Math.sin((i / M) * Math.PI / 2);
      for (j = 0; j < N; j++) {
        var a = -Math.PI + (j / N) * Math.PI * 2, rr = t * Rj[j], x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        xy.push([x, y]); zf.push(i === M ? 0 : height(x, y, t));
      }
    }
    var at = function (i, j) { return (i - 1) * N + ((j + N) % N); };
    var zc = height(0, 0, 0);
    var pos = [], idx = [], front = [], back = [];
    pos.push(0, 0, zc);
    for (i = 1; i <= M; i++) { front.push(pos.length / 3); for (j = 0; j < N; j++) { k = at(i, j); pos.push(xy[k][0], xy[k][1], zf[k]); } }
    for (j = 0; j < N; j++) idx.push(0, front[0] + j, front[0] + (j + 1) % N);
    for (i = 0; i < M - 1; i++) for (j = 0; j < N; j++) {
      var A = front[i] + j, B = front[i] + (j + 1) % N, Cc = front[i + 1] + j, D = front[i + 1] + (j + 1) % N;
      idx.push(A, Cc, B, B, Cc, D);
    }
    var cB = pos.length / 3; pos.push(0, 0, -zc);
    for (i = 1; i < M; i++) { back.push(pos.length / 3); for (j = 0; j < N; j++) { k = at(i, j); pos.push(xy[k][0], xy[k][1], -zf[k]); } }
    back.push(front[M - 1]);
    for (j = 0; j < N; j++) idx.push(cB, back[0] + (j + 1) % N, back[0] + j);
    for (i = 0; i < M - 1; i++) for (j = 0; j < N; j++) {
      var A2 = back[i] + j, B2 = back[i] + (j + 1) % N, C2 = back[i + 1] + j, D2 = back[i + 1] + (j + 1) % N;
      idx.push(A2, B2, C2, B2, D2, C2);
    }
    // normales lisses
    var nor = new Float32Array(pos.length);
    for (i = 0; i < idx.length; i += 3) {
      var ia = idx[i] * 3, ib = idx[i + 1] * 3, ic = idx[i + 2] * 3;
      var ux = pos[ib] - pos[ia], uy = pos[ib + 1] - pos[ia + 1], uz = pos[ib + 2] - pos[ia + 2];
      var vx = pos[ic] - pos[ia], vy = pos[ic + 1] - pos[ia + 1], vz = pos[ic + 2] - pos[ia + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nzz = ux * vy - uy * vx;
      [ia, ib, ic].forEach(function (q) { nor[q] += nx; nor[q + 1] += ny; nor[q + 2] += nzz; });
    }
    for (i = 0; i < nor.length; i += 3) {
      var l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1;
      nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l;
      var r0 = Math.hypot(pos[i], pos[i + 1]), w = Math.max(0, 1 - r0 / 0.32); // sommet du dôme : reflet net
      if (w > 0) {
        w = w * w * (3 - 2 * w);
        var sz = pos[i + 2] >= 0 ? 1 : -1;
        nor[i] *= 1 - w; nor[i + 1] *= 1 - w; nor[i + 2] = nor[i + 2] * (1 - w) + sz * w;
        l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1;
        nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l;
      }
    }
    return { pos: new Float32Array(pos), nor: nor, idx: new Uint16Array(idx) };
  }

  /* ---------------------------------------------------------
     2. Les shaders : or brillant, reflet de studio, liseré rose
     --------------------------------------------------------- */
  var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  var prec = hp && hp.precision > 0 ? 'highp' : 'mediump';
  function shader(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  var starProg, glowProg;
  try {
    starProg = program(
      'attribute vec3 aPos; attribute vec3 aNor;' +
      'uniform mat4 uModel; uniform mat3 uNorm; uniform mat4 uVP;' +
      'varying vec3 vN; varying vec3 vW;' +
      'void main(){ vec4 w = uModel * vec4(aPos, 1.0); vW = w.xyz; vN = uNorm * aNor; gl_Position = uVP * w; }',
      'precision ' + prec + ' float;' +
      'varying vec3 vN; varying vec3 vW; uniform vec3 uCam; uniform float uAlpha;' +
      'vec3 env(vec3 r){' +
      '  float up = r.y * 0.5 + 0.5;' +
      '  vec3 c = mix(vec3(0.78, 0.5, 0.03), vec3(1.0, 0.95, 0.7), smoothstep(0.15, 0.9, up));' +
      '  float sb = pow(max(dot(r, normalize(vec3(-0.45, 0.7, 0.55))), 0.0), 10.0);' +
      '  float sb2 = pow(max(dot(r, normalize(vec3(0.6, 0.25, 0.75))), 0.0), 9.0);' +
      '  return c + vec3(1.0, 1.0, 0.95) * sb * 2.0 + vec3(1.0, 0.95, 0.8) * sb2 * 0.45;' +
      '}' +
      'void main(){' +
      '  vec3 N = normalize(vN); vec3 V = normalize(uCam - vW);' +
      '  if (dot(N, V) < 0.0) N = -N;' +
      '  vec3 base = vec3(1.0, 0.82, 0.04);' +
      '  vec3 L = normalize(vec3(-0.45, 0.6, 0.66)); vec3 H = normalize(L + V);' +
      '  float diff = max(dot(N, L), 0.0) * 0.45 + 0.6;' +
      '  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);' +
      '  vec3 col = base * env(reflect(-V, N)) * diff;' +
      '  col = mix(col, col * vec3(0.85, 0.55, 0.1), fres * 0.55);' +
      '  col += vec3(1.0, 0.99, 0.94) * (pow(max(dot(N, H), 0.0), 40.0) * 0.9 + pow(max(dot(N, H), 0.0), 8.0) * 0.18);' +
      '  col = col / (col + vec3(0.5)) * 1.42;' +
      '  gl_FragColor = vec4(col * uAlpha, uAlpha);' +
      '}');
    glowProg = program(
      'attribute vec2 aQ; uniform mat4 uView; uniform mat4 uProj; uniform vec3 uC; uniform float uS; varying vec2 vQ;' +
      'void main(){ vQ = aQ; vec4 v = uView * vec4(uC, 1.0); v.xy += aQ * uS; gl_Position = uProj * v; }',
      'precision mediump float; varying vec2 vQ; uniform float uA;' +
      'void main(){ float d = length(vQ); float a = exp(-d * d * 3.2) * (1.0 - smoothstep(0.85, 1.0, d));' +
      '  vec3 c = mix(vec3(1.0, 0.78, 0.36), vec3(0.96, 0.62, 0.82), smoothstep(0.1, 0.9, d));' +
      '  gl_FragColor = vec4(c * a * uA, 0.0); }');
  } catch (e) {
    document.documentElement.classList.add('no-3d');
    if (window.console) console.warn('Astelsia 3D :', e.message);
    return;
  }

  var geo = buildStar();
  function buf(target, data) { var b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; }
  var bPos = buf(gl.ARRAY_BUFFER, geo.pos), bNor = buf(gl.ARRAY_BUFFER, geo.nor), bIdx = buf(gl.ELEMENT_ARRAY_BUFFER, geo.idx);
  var bQuad = buf(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
  var S = {
    aPos: gl.getAttribLocation(starProg, 'aPos'), aNor: gl.getAttribLocation(starProg, 'aNor'),
    uModel: gl.getUniformLocation(starProg, 'uModel'), uNorm: gl.getUniformLocation(starProg, 'uNorm'),
    uVP: gl.getUniformLocation(starProg, 'uVP'), uCam: gl.getUniformLocation(starProg, 'uCam'), uAlpha: gl.getUniformLocation(starProg, 'uAlpha')
  };
  var G = {
    aQ: gl.getAttribLocation(glowProg, 'aQ'), uView: gl.getUniformLocation(glowProg, 'uView'), uProj: gl.getUniformLocation(glowProg, 'uProj'),
    uC: gl.getUniformLocation(glowProg, 'uC'), uS: gl.getUniformLocation(glowProg, 'uS'), uA: gl.getUniformLocation(glowProg, 'uA')
  };

  /* ---------------------------------------------------------
     3. Petites matrices
     --------------------------------------------------------- */
  function perspective(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function lookAt(e, c) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xz) || 1; xx /= l; xz /= l; // up = (0,1,0)
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function model(x, y, z, rx, ry, rz, s) { // T * Ry * Rx * Rz * S
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    var m00 = cy * cz + sy * sx * sz, m01 = -cy * sz + sy * sx * cz, m02 = sy * cx;
    var m10 = cx * sz, m11 = cx * cz, m12 = -sx;
    var m20 = -sy * cz + cy * sx * sz, m21 = sy * sz + cy * sx * cz, m22 = cy * cx;
    return {
      m: [m00 * s, m10 * s, m20 * s, 0, m01 * s, m11 * s, m21 * s, 0, m02 * s, m12 * s, m22 * s, 0, x, y, z, 1],
      n: [m00, m10, m20, m01, m11, m21, m02, m12, m22]
    };
  }

  /* ---------------------------------------------------------
     4. Mise en scène : où sont les étoiles selon l'état de la page
        (nx, ny entre -1 et 1 sur l'écran ; size = diamètre en part de la hauteur)
     --------------------------------------------------------- */
  var LAYOUT = window.__starsLayout || {
    tall: {
      idle: [[0, 0.1, 0.22], [0.62, 0.26, 0.07], [-0.62, -0.02, 0.055]],
      build: [[-0.72, 0.12, 0.1], [0.72, 0.24, 0.065], [0.7, -0.02, 0.045]],
      sky: [[-0.8, 0.86, 0.05], [-0.2, 1.4, 0.03], [-0.75, 1.5, 0.025]]
    },
    wide: {
      idle: [[0.5, 0.04, 0.42], [0.86, 0.48, 0.12], [0.26, -0.5, 0.085]],
      build: [[0.22, 0.6, 0.2], [0.88, 0.46, 0.1], [0.84, -0.62, 0.08]],
      sky: [[-0.56, 0.74, 0.07], [-0.3, 1.4, 0.03], [-0.8, 1.5, 0.025]]
    }
  };
  var PHASE = [0, 1.7, 3.4], SKY_ALPHA = [1, 0, 0];
  var stars = [0, 1, 2].map(function (i) {
    return {
      x: 0, y: 0, s: 0.0001, a: 0, init: false, i: i,
      // quand on la touche : elle tourne (spin), rebondit (hop), se gonfle (sq), brille (flash)
      spin: 0, spinV: 0, hop: 0, hopV: 0, sq: 0, sqV: 0, flash: 0, hoverOn: false, hover: 0,
      px: -1e4, py: -1e4, pr: 0 // position et rayon à l'écran, pour savoir si on l'a touchée
    };
  });
  var state = { building: false, introStart: null, pulse: 0 };
  var fovy = 30 * Math.PI / 180, camZ = 10, W = 1, H = 1, aspect = 1, layout = 'tall', dpr = 1;

  function resize() {
    W = innerWidth; H = innerHeight; aspect = W / H;
    layout = aspect < 0.8 ? 'tall' : 'wide';
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2) * quality;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  var quality = 1;
  addEventListener('resize', resize);

  var heroEl = document.querySelector('.hero');
  function descent() { // 0 en haut de la page → 1 quand l'accueil est passé
    var h = heroEl ? heroEl.offsetHeight : H;
    var t = Math.max(0, Math.min(1, scrollY / (h * 0.85)));
    return t * t * (3 - 2 * t);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var look = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer) addEventListener('pointermove', function (e) { look.tx = e.clientX / W - 0.5; look.ty = e.clientY / H - 0.5; }, { passive: true });

  /* ---------------------------------------------------------
     5. Boucle d'animation
     --------------------------------------------------------- */
  var last = performance.now(), running = true, visible = true, frames = 0, slow = 0, readyResolve;
  api.ready = new Promise(function (r) { readyResolve = r; });

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = now / 1000;

    // si le téléphone peine pendant les premières secondes, on allège l'image
    if (frames < 90) { frames++; if (dt > 0.032) slow++; if (frames === 90 && slow > 35 && quality === 1) { quality = 0.7; resize(); } }

    var intro = state.introStart === null ? 0 : reduced ? 1 : Math.min(1, (now - state.introStart) / 2600);
    var e = 1 - Math.pow(1 - intro, 3);
    var d = descent();
    var L = LAYOUT[layout], hero = state.building ? L.build : L.idle;
    var halfH = camZ * Math.tan(fovy / 2), halfW = halfH * aspect;
    var k = 1 - Math.exp(-dt * (reduced ? 30 : 4.5));

    look.x = lerp(look.x, look.tx, Math.min(1, dt * 3)); look.y = lerp(look.y, look.ty, Math.min(1, dt * 3));
    var eye = [look.x * 0.6 + (1 - e) * 3.5, -look.y * 0.4 + (1 - e) * 1.2, camZ];
    var view = lookAt(eye, [look.x * 0.3, -look.y * 0.2, 0]);
    var proj = perspective(fovy, aspect, 0.1, 100);
    var vp = mul(proj, view);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (state.pulse > 0) state.pulse = Math.max(0, state.pulse - dt * 2.2);

    var draw = [];
    stars.forEach(function (st, i) {
      var h = hero[i], s = L.sky[i];
      var tx = lerp(h[0], s[0], d) * halfW, ty = lerp(h[1], s[1], d) * halfH, ts = lerp(h[2], s[2], d) * halfH;
      var ta = lerp(1, SKY_ALPHA[i], d);
      if (!st.init) { st.x = tx; st.y = ty; st.s = ts; st.init = true; }
      st.x = lerp(st.x, tx, k); st.y = lerp(st.y, ty, k); st.s = lerp(st.s, ts, k); st.a = lerp(st.a, ta * e, Math.min(1, k * 2));

      // l'étoile qu'on a touchée : elle tourne sur elle-même, rebondit, puis revient de face
      // (petits pas de calcul : le mouvement reste juste même si le téléphone rame)
      var ns = Math.max(1, Math.ceil(dt / 0.008)), hh = dt / ns;
      for (var q = 0; q < ns; q++) {
        var fast = Math.min(1, Math.max(0, (Math.abs(st.spinV) - 1.2) / 3)); // 1 = encore lancée, 0 = presque arrêtée
        var tgt = Math.round(st.spin / (Math.PI * 2)) * Math.PI * 2;
        st.spinV += (-(1.1 + 3.2 * (1 - fast)) * st.spinV - 16 * (1 - fast) * (st.spin - tgt)) * hh;
        st.spin += st.spinV * hh;
        st.hopV += (-75 * st.hop - 6.5 * st.hopV) * hh; st.hop += st.hopV * hh;
        st.sqV += (-240 * st.sq - 12 * st.sqV) * hh; st.sq += st.sqV * hh;
      }
      if (Math.abs(st.spinV) < 0.01) { var back = Math.round(st.spin / (Math.PI * 2)) * Math.PI * 2; if (Math.abs(st.spin - back) < 0.01) st.spin -= back; }
      st.flash = Math.max(0, st.flash - dt * 1.5);
      st.hover += ((st.hoverOn ? 1 : 0) - st.hover) * Math.min(1, dt * 8);

      var bob = reduced ? 0 : Math.sin(t * 1.2 + PHASE[i]) * 0.035 * st.s;
      var yy = st.y + bob + st.hop * st.s;
      var z = -(1 - e) * (24 + i * 6);
      var pulse = (i === 0 ? 1 + Math.sin(state.pulse * Math.PI) * 0.08 : 1) * (1 + st.sq + st.hover * 0.07);
      // sur ordinateur, les étoiles se tournent vers la souris
      var ry = (reduced ? 0 : Math.sin(t * 0.55 + PHASE[i]) * 0.5) + (1 - e) * (5 + i) + look.x * 1.1 + st.spin;
      var rx = (reduced ? 0 : Math.sin(t * 0.4 + PHASE[i]) * 0.12) + look.y * 0.7;
      var rz = (reduced ? 0 : Math.sin(t * 0.33 + PHASE[i]) * 0.07) + (i === 1 ? 0.25 : i === 2 ? -0.2 : 0);
      draw.push({ m: model(st.x, yy, z, rx, ry, rz, st.s * pulse), a: st.a, c: [st.x, yy, z - st.s * 0.5], s: st.s * (1 + st.flash * 0.45), f: st.flash });

      // où est-elle sur l'écran ? (pour savoir si un doigt l'a touchée)
      var cx = vp[0] * st.x + vp[4] * yy + vp[8] * z + vp[12], cy = vp[1] * st.x + vp[5] * yy + vp[9] * z + vp[13], cw = vp[3] * st.x + vp[7] * yy + vp[11] * z + vp[15];
      if (cw > 0.01 && st.a > 0.35) {
        st.px = (cx / cw * 0.5 + 0.5) * W; st.py = (0.5 - cy / cw * 0.5) * H;
        st.pr = st.s * pulse * (H / 2) / (Math.tan(fovy / 2) * cw);
      } else st.pr = 0;
    });

    // halos (derrière, additifs)
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(glowProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, bQuad); gl.enableVertexAttribArray(G.aQ); gl.vertexAttribPointer(G.aQ, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(G.uView, false, view); gl.uniformMatrix4fv(G.uProj, false, proj);
    draw.forEach(function (o) {
      if (o.a < 0.01) return;
      gl.uniform3fv(G.uC, o.c); gl.uniform1f(G.uS, o.s * 3.2);
      gl.uniform1f(G.uA, o.a * (window.__starsGlow !== undefined ? window.__starsGlow : 0.55 + Math.sin(t * 2 + o.s) * 0.08 + o.f * 0.7));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    gl.disableVertexAttribArray(G.aQ);

    // étoiles
    gl.enable(gl.DEPTH_TEST); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(starProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.enableVertexAttribArray(S.aPos); gl.vertexAttribPointer(S.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.enableVertexAttribArray(S.aNor); gl.vertexAttribPointer(S.aNor, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
    gl.uniformMatrix4fv(S.uVP, false, vp); gl.uniform3fv(S.uCam, eye);
    draw.forEach(function (o) {
      if (o.a < 0.01) return;
      gl.uniformMatrix4fv(S.uModel, false, o.m.m); gl.uniformMatrix3fv(S.uNorm, false, o.m.n); gl.uniform1f(S.uAlpha, o.a);
      gl.drawElements(gl.TRIANGLES, geo.idx.length, gl.UNSIGNED_SHORT, 0);
    });

    if (readyResolve) { readyResolve(true); readyResolve = null; }
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); running = false; document.documentElement.classList.add('no-3d'); });

  resize();
  requestAnimationFrame(frame);

  api.startIntro = function () { if (state.introStart === null) state.introStart = performance.now(); };
  api.setBuilding = function (b) { state.building = !!b; };
  api.pulse = function () { state.pulse = 1; };

  /* ---------------------------------------------------------
     6. On peut toucher les étoiles (assets/js/fx.js s'en sert)
     --------------------------------------------------------- */
  function near(st, x, y) { return st.pr > 0 && Math.hypot(x - st.px, y - st.py) < Math.max(28, st.pr * 0.92); }
  api.hit = function (x, y) { // quelle étoile est sous le doigt ? (-1 : aucune)
    var best = -1, bd = 1e9;
    stars.forEach(function (st, i) {
      if (!near(st, x, y)) return;
      var d = Math.hypot(x - st.px, y - st.py);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  api.poke = function (i, x) { // la toucher : elle part en tournant du côté opposé au doigt
    var st = stars[i]; if (!st) return null;
    var dir = x < st.px ? -1 : 1;
    if (!reduced) { st.spinV += dir * (13 + Math.random() * 5); st.hopV += 4; st.sqV += 2.4; }
    st.flash = 1; // mode doux : elle brille, sans bouger
    return { x: st.px, y: st.py, r: st.pr };
  };
  api.where = function () { // position des étoiles à l'écran (tests automatiques)
    return stars.map(function (st) { return { x: Math.round(st.px), y: Math.round(st.py), r: Math.round(st.pr) }; });
  };
  api.hover = function (x, y) { // à la souris : elle grossit un peu quand on la survole
    var any = false;
    stars.forEach(function (st) { st.hoverOn = near(st, x, y); any = any || st.hoverOn; });
    return any;
  };
})();

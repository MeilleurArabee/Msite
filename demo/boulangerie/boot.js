/* Avant l'affichage : active les animations (mode doux si l'appareil demande moins de mouvement). */
(function (d) { var c = d.documentElement.classList; c.add('anim'); if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('soft'); })(document);
// Les fondus entre pages : si le navigateur en annule un (par exemple dans un aperçu), on l'ignore sans erreur.
['pageswap', 'pagereveal'].forEach(function (t) { addEventListener(t, function (e) { var v = e.viewTransition; if (!v) return; [v.ready, v.finished, v.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); }); }); });

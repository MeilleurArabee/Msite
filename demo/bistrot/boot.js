/* Avant l'affichage : active les animations.
   Si l'appareil demande moins de mouvement, le site passe en « mode doux » (fondus uniquement). */
(function (d) {
  var c = d.documentElement.classList;
  c.add('js');
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('soft');
})(document);

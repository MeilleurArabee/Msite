# Astelsia — site vitrine

Sites web pour les commerces de proximité. En ligne sur https://astelsia.fr (Netlify, branche `main`).

Le concept : on part des étoiles et, en descendant, on arrive dans un paysage à l'heure bleue
(grand chêne, balançoire, herbes roses, lucioles). Chaque étape du scroll s'anime un peu plus.

## Le créateur de site (page d'accueil)
Le visiteur tape le nom de son commerce, choisit son activité et son ambiance :
le site se construit en direct dans l'iPhone, puis il arrive sur les formules.

**Lien personnalisé pour le démarchage** : envoyez par SMS ou par mail un lien comme
`https://astelsia.fr/?nom=Le%20Fournil&type=boulangerie`
Le commerçant ouvre le site et voit son propre site déjà créé, avec son nom.
- `type` : restaurant, coiffeur, boulangerie, boutique, artisan, garage
- `ambiance` (facultatif) : dore, rose, sauge, nuit

## Modifier les coordonnées
Un seul fichier : `assets/js/config.js` (téléphone et mail).
Les mentions légales sont à compléter dans `mentions-legales.html` (champs surlignés).

## Voir le site en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Organisation
- `index.html` — la page
- `assets/css/style.css` — styles (mobile d'abord)
- `assets/js/main.js` — animations (GSAP, ScrollTrigger, SplitText, Lenis)
- `assets/js/builder.js` — le créateur de site, les formules à onglets, le mail pré-rempli
- `assets/js/scene.js` — étoiles, chargement du paysage, balançoire
- `assets/scene/` — paysage peint en calques WebP (cadrage large + cadrage téléphone)
- `assets/fonts/` — Fraunces et Manrope, hébergées sur le site (licence SIL OFL)
- `assets/vendor/` — GSAP 3.15 et Lenis 1.3
- `tools/landscape/` — le « peintre » qui génère le paysage
  (`node tools/landscape/render.js tools/landscape assets/scene`, nécessite Playwright)

Aucun cookie, aucune requête vers un service tiers. Respecte `prefers-reduced-motion`.

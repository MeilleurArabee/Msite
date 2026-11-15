# Astelsia — site vitrine

Sites web pour les commerces de proximité. En ligne sur https://astelsia.fr (Netlify, branche `main`).

Le concept : on part des étoiles et, en descendant, on arrive dans un paysage à l'heure bleue
(grand chêne, balançoire, herbes roses, lucioles). Chaque étape du scroll s'anime un peu plus.

## Le créateur de site (page d'accueil)
1. Le visiteur tape le **nom** de son commerce.
2. Il tape son **métier**, en toutes lettres (une centaine reconnus : fleuriste, ostéopathe, tatoueur…).
   Un métier inconnu fonctionne aussi : le site reprend son mot.
3. Il choisit **n'importe quelle couleur**, un **style** (élégant, moderne, chaleureux),
   et **touche les textes de l'iPhone pour les réécrire**.

Ensuite, la bande-annonce s'adresse à lui par son nom, les formules lui donnent un conseil
selon son métier, et son iPhone montre son site en version Solo, Business ou Signature.
Le mail de contact est déjà rédigé.

**Lien personnalisé pour le démarchage** : envoyez par SMS ou par mail un lien comme
`https://astelsia.fr/?nom=Le%20Fournil&type=boulangerie`
Le commerçant ouvre le site et voit son propre site déjà créé, avec son nom.
- `nom` : le nom du commerce (`%20` = espace)
- `type` : le métier, en toutes lettres (ex. `fleuriste`, `garage`, `osteopathe`)
- `couleur` (facultatif) : une teinte de 0 à 359 (0 rouge, 30 orange, 130 vert, 210 bleu, 330 rose)
- `style` (facultatif) : `elegant`, `moderne` ou `chaleureux`

Les métiers reconnus et leurs textes sont dans `assets/js/builder.js` (liste `JOBS`).

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

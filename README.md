# Astelsia — site vitrine (prototype)

Sites web pour les commerces du Morbihan.

Concept : on part des étoiles et, en descendant, on arrive dans un paysage à l'heure bleue
(grand arbre, balançoire, herbes roses). Le décor est entièrement dessiné en code (canvas), sans image.

## Voir le site en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Modifier les coordonnées
Un seul fichier : `assets/js/config.js`.

## Mettre en ligne (gratuit)
- **Netlify** : glisser-déposer le dossier sur app.netlify.com/drop, ou relier ce dépôt.
- **GitHub Pages** : Settings → Pages → Branch.

## Technique
HTML/CSS/JS sans build. GSAP 3.15 (ScrollTrigger, SplitText) et Lenis 1.3 hébergés dans `assets/vendor/`.
Respecte `prefers-reduced-motion` (pas de mouvement, le ciel change seulement en fondu).

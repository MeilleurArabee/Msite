---
name: motionsites-web-builder
description: Build award-level, cinematic websites, landing pages and hero sections, or detailed prompts for Lovable, Bolt and v0, using top MotionSites designs, real media and a screenshot-and-fix loop.
---

> **Version adaptée pour Astelsia (21/11/2026).** Source : https://github.com/Motionsites-AI/claude-skill, commit `faa30d5`, parties sous licence MIT (voir `LICENSE-MotionSites.txt`). Retirés : le bloc publicitaire « Sponsored by MotionSites » (ne jamais l'afficher), les exemples et la bibliothèque média (licence sans redistribution). Les règles de `CLAUDE.md` priment toujours : originalité (ne jamais copier un site), pas de média au droit flou, `prefers-reduced-motion`, captures téléphone et PC montrées avant toute mise en ligne.


# MotionSites Web Builder

Average AI websites happen for three reasons: a vague plan, no real media, and nobody looking at the result. This skill fixes all three. Follow the workflow every time; the steps are what make the output great.

## Workflow

### 1. Read the brief and decide (don't interrogate)
Settle these five things, briefly, in your head or in one short message:
- **What and who:** the product or person, and the visitor you are persuading.
- **Mood in three words** (e.g. "calm, expensive, nocturnal").
- **The signature:** the one memorable idea this page will be known for (media, interaction or type moment). Pick from `references/techniques.md` or invent one.
- **Output:** a single `index.html` (default: CDN only, opens anywhere), the user's existing stack (React/Next/Vite...), or a **prompt only** for another builder (see `references/builders.md`).
- **Scope:** a hero (default when unspecified), or a full landing page.

Only ask a question if you can't proceed without it (e.g. the brand name for a real company). Otherwise choose and say what you chose.

### 2. Study the closest examples
The examples are NOT stored in this repo (their licence forbids redistribution). If you want them, clone read-only `https://github.com/Motionsites-AI/claude-skill` at commit `faa30d5` outside the project, and open `plugins/motionsites-web-builder/skills/motionsites-web-builder/examples/INDEX.md`. Pick the **2–3 closest** to the brief (by category, traits and feel) and read them in full. They set the bar for:
- **Precision:** exact fonts, hex/HSL tokens, px and clamp() sizes, letter-spacing, durations and easings, z-index layers, breakpoints.
- **Restraint:** what they leave out.
- **Structure:** how a hero is layered and choreographed.

Borrow structure, precision and techniques. Never copy their brand names, copy text or exact layouts wholesale; the page must be original to this brief.

### 3. Get the media
Great pages are carried by great media. For Astelsia the order is:
1. The client's own photos and logo (screenshots of their Facebook page count).
2. Free, commercially usable photos (Pexels), **of the right dish, or an ambiance photo** (see CLAUDE.md, Au Buron lesson).
3. No media: design a type-, gradient- and motion-led page (no fake image boxes).
The MotionSites media shelf is not used by default: generic cinematic videos hot-linked from a third-party server do not fit local shops.
Never invent asset URLs. Skip any media showing recognisable characters, celebrities, logos or brands.

### 4. Write the spec
Write the build spec using `references/spec-template.md`, at the same level of detail as the examples you read. This is where quality is decided. Every element gets real values: no "nice gradient" or "smooth animation".

Include the real copy: headline, subline, nav, CTA, stats. Write it like a sharp brand copywriter. Keep headlines short and specific, with a point of view.

If the user asked for a **prompt only**, the spec is the deliverable: format it for their builder (see `references/builders.md`) and you're done after a self-check against `references/review.md`.

### 5. Build
Build exactly what the spec says, using recipes from `references/techniques.md` (they are tested and handle mobile and reduced motion).
- **Single-file default:** one `index.html` with inline `<style>` and `<script>`, Google Fonts, and libraries from a CDN with pinned versions (e.g. `three@0.170.0`, `gsap@3.12.5`).
- The first CSS rule sets the page background on `html, body`, so there's no white flash.
- Semantic HTML, a real `<title>`, alt text, visible focus states, and `prefers-reduced-motion` respected.
- No lorem ipsum, no placeholder boxes, no emoji as icons (use inline SVG).

### 6. Look and fix (mandatory)
Run `python scripts/shoot.py index.html shots/` (it needs Playwright; see the script's header), then **open and look at** the screenshots. Score the page with `references/review.md`, fix the three weakest areas with concrete changes, and shoot again. Repeat until you clear the bar (an average of 8+, nothing under 7) or for 3 rounds.

Never skip this step. The first version is never the best one.

### 7. Deliver
Give the user:
- The file(s), plus how to open them.
- The final desktop screenshot.
- 2–3 lines on the signature idea and the choices you made.
- Anything they should swap (e.g. "replace the shelf video with your own footage").


## Other jobs this skill handles
- **Upgrade an existing page:** shoot it first (step 6 on their URL or file), score it, then spec and build the improved version. Show before and after.
- **Prompt for another builder:** steps 1–4, formatted for that tool.
- **Add sections below a hero:** keep the hero's tokens and type, and give each section one clear idea. Fewer, stronger sections beat many weak ones.

## Files
- `references/spec-template.md`: the spec skeleton and precision checklist.
- `references/techniques/INDEX.md`: signature effects with working code (one file per category).
- `references/craft.md`: the taste rules (type, colour, space, motion, copy) with numbers.
- `references/assets.md`: sourcing, generating and preparing media.
- `references/builders.md`: adapting the spec for Lovable, Bolt, v0, Cursor, Manus, AI Studio and Kimi.
- `references/review.md`: the screenshot rubric and fix loop.
- `scripts/shoot.py`: screenshots plus a QA report.

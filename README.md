# AO Brand Playbook on Adobe Edge Delivery Services

Edge Delivery Services rebuild of [aobrandplaybook.com.au](https://aobrandplaybook.com.au/), the Australian Open brand playbook (originally a Framer site).

- Preview: https://main--poc-ao-exchange--sumantsapra.aem.page/
- Live: https://main--poc-ao-exchange--sumantsapra.aem.live/
- Content: Document Authoring, `sumantsapra/poc-ao-exchange` (configured in the site configuration, not `fstab.yaml`)

## Pages

| Template | Pages |
| --- | --- |
| Homepage | `/` |
| Guideline chapter | `/colour`, `/logos`, `/typography`, `/tone-of-voice`, `/graphic-elements`, `/brand-sound` |
| Sub-brand guide | `/ao-live`, `/ao-shop`, `/ao-reserve`, `/ao-ballpark`, `/ao-one-point-slam`, `/opening-week`, `/partner-guidelines` |

`/nav` and `/footer` are fragments loaded by the header and footer blocks.

## Code

- `styles/brand.css`: design tokens (colours, fonts, type scale, spacing). `styles/styles.css`: default content, buttons and section styles (`royal-blue`, `process-blue`, `hits-different-blue`, `navy`, `dark-navy`, `bright-blue`, `lime`, `full-width`, `centered`, `intro`, `colour-feature`).
- `styles/fonts.css` and `/fonts`: Sharp Sans No2 and Sequel 100 Wide web fonts (licensed faces: confirm the web licence), plus Poppins and DM Mono from Google Fonts.
- `blocks/`: header (chapter sidebar on content pages, logo pill and section nav on the homepage), footer and 29 content blocks (`cards-*`, `columns-*`, `hero-*`, `banner-overlay`, `carousel-stack`, `accordion-photo`, `video-autoplay`).
- `videos/`: the page videos, re-encoded for the web (H.264, hero videos up to 1920px, others up to 1280px). Pages link to `/videos/<id>.mp4`.
- `scripts/scripts.js`: besides the standard loading, it renumbers headings so levels never skip (the source picks levels for their look) and loads the first content image eagerly on chapter pages.
- `tools/importer/`: import scripts, parsers, transformers and detectors used to import the source pages.

## Editing content

Pages are edited in Document Authoring. Blocks are tables; options go in the block name, for example `Hero Banner (short, tall)`, `Video Autoplay (sound)` or `Cards Shape (half)`. A few blocks read short text lines inside an item and hide them:

- `Background: <colour>`: tile or card colour (`cards-logo`, `columns-text-image`).
- `Position: top`: photo crop (`columns-photos`).
- `Correct` / `Incorrect`: tick or cross list (`columns-terms`).

Heading levels can be authored freely; the site renumbers them in order and keeps each one's size.

## Re-importing from the source

Re-importing overwrites the local `content/*.plain.html` files, so any local edits to them are lost. Upload changed pages to Document Authoring afterwards, then preview and publish them.

```bash
S=<path to the excat-content-import scripts>
$S/aem-import-bundle.sh --importjs tools/importer/import-<template>.js
node $S/run-bulk-import.js --import-script tools/importer/import-<template>.bundle.js \
  --urls tools/importer/urls-<template>.txt --force
```

Templates: `homepage`, `guideline-chapter`, `sub-brand-guide`. The importer measures the live source in a browser (section colours, block options, video sizes and audio, tablet hero heights), so it must load the real site.

## Accessibility and performance

- Colour contrast meets WCAG AA on every page: text switches to the brand navy (#000c3d) where white would fail (Process Blue and Hits Different Blue bands, light swatches), and the header menus pick white or navy per link as the page scrolls.
- Images are requested from the source CDN at no more than 2048px (GIFs in blocks at 1024px); videos come from `/videos`.
- SEO scores on `*.aem.page` / `*.aem.live` are lower only because those hosts send `noindex`; that goes away on the production domain.

## Known differences from the source

- Fonts the project does not have fall back to the closest available face: Aro, Neue Plak, Fino Sans, Sequel 100 Wide 86 / 46 / 45.
- At tablet widths (810–1199px) the source draws the Opening Week, AO Shop and AO 1 Point Slam heroes as a fixed 720px frame; here they run full width like the other heroes.
- Homepage scroll animations are shorter than on the source; content and order match.
- Some source content quirks are kept as published (for example two AO LIVE swatch Hex values that read 1E2886 on the source).

## Open decisions

- Confirm the web licence for Sharp Sans No2 and Sequel 100 Wide; the font files are served from `/fonts`.
- Point a production domain at the site when ready (the `aem.live` host is not indexed).

## Local development

```bash
npm install
npx aem up --html-folder content
```

Lint with `npm run lint:js` and `npm run lint:css`.

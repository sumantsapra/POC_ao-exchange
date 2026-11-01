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

- `styles/brand.css`: design tokens (colours, fonts, type scale, spacing). `styles/styles.css`: default content, buttons and section styles (`royal-blue`, `process-blue`, `hits-different-blue`, `navy`, `dark-navy`, `bright-blue`, `lime`, `full-width`, `centered`).
- `styles/fonts.css` and `/fonts`: Sharp Sans No2 and Sequel 100 Wide web fonts (licensed faces: confirm the web licence), plus Poppins and DM Mono from Google Fonts.
- `blocks/`: header (chapter sidebar, homepage section nav), footer and the content blocks (`cards-*`, `columns-*`, `hero-*`, `carousel-stack`, `accordion-photo`, `video-autoplay`).
- `tools/importer/`: import scripts, parsers, transformers and detectors used to import the source pages.

## Local development

```bash
npm install
npx aem up
```

Lint with `npm run lint:js` and `npm run lint:css`.

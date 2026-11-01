/* eslint-disable */
/* global WebImporter */

import heroBannerParser from "./parsers/hero-banner.js";
import videoAutoplayParser from "./parsers/video-autoplay.js";
import cardsLogoParser from "./parsers/cards-logo.js";
import cardsToneParser from "./parsers/cards-tone.js";
import columnsTypefaceParser from "./parsers/columns-typeface.js";
import cardsSwatchParser from "./parsers/cards-swatch.js";
import cardsContrastParser from "./parsers/cards-contrast.js";
import cardsShapeParser from "./parsers/cards-shape.js";
import columnsPanelParser from "./parsers/columns-panel.js";
import columnsPhotosParser from "./parsers/columns-photos.js";
import cardsFramedParser from "./parsers/cards-framed.js";
import columnsTextImageParser from "./parsers/columns-text-image.js";
import cardsMisuseParser from "./parsers/cards-misuse.js";
import aobrandplaybookCleanupTransformer from "./transformers/aobrandplaybook-cleanup.js";
import aobrandplaybookSectionsTransformer from "./transformers/aobrandplaybook-sections.js";
import { detectors } from "./detectors/sub-brand-guide.js";
import { detect, sortByDocumentOrder } from "./detectors/common.js";

const PAGE_TEMPLATE = {
  "name": "sub-brand-guide",
  "urls": [
    "https://aobrandplaybook.com.au/ao-live",
    "https://aobrandplaybook.com.au/ao-ballpark",
    "https://aobrandplaybook.com.au/ao-one-point-slam",
    "https://aobrandplaybook.com.au/ao-reserve",
    "https://aobrandplaybook.com.au/ao-shop",
    "https://aobrandplaybook.com.au/opening-week",
    "https://aobrandplaybook.com.au/partner-guidelines"
  ],
  "coverageGaps": [],
  "description": "Long-form sub-brand guide opening with a full-width photo banner, then title and intro followed by stacked primary logo, logo versions, tone of voice, typography, colour palette and photography sections (light or dark background)",
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "#main section.framer-1a75kpf .framer-sd595j-container"
      ]
    },
    {
      "name": "video-autoplay",
      "instances": [
        "#lookup .framer-df41zr",
        "#safe-zones-2 .framer-1uyj8zm-container"
      ]
    },
    {
      "name": "cards-logo",
      "instances": [
        "#safe-zones-1 .framer-1a4gwti"
      ]
    },
    {
      "name": "cards-tone",
      "instances": [
        "#color .framer-pwqk2e"
      ]
    },
    {
      "name": "columns-typeface",
      "instances": [
        "#safe-zones-2 .framer-1kg7mil"
      ]
    },
    {
      "name": "cards-swatch",
      "instances": [
        "#color-1 .framer-u3pgik",
        "#color-1 .framer-ubccr7"
      ]
    },
    {
      "name": "cards-contrast",
      "instances": [
        "#safe-zones-3 .framer-1r2xhsk"
      ]
    },
    {
      "name": "cards-shape",
      "instances": [
        "#color-2 .framer-cqjpu3"
      ]
    },
    {
      "name": "columns-panel",
      "instances": [
        "#color-2 .framer-1nqe3ua",
        "#color-2 .framer-1l9oco5"
      ]
    },
    {
      "name": "columns-photos",
      "instances": [
        "#lookup-4 .framer-68998n"
      ]
    },
    {
      "name": "cards-framed",
      "instances": [
        "#safe-zones-1 .framer-1auaux7",
        "#safe-zones-2 .framer-1h8oj3a",
        "#safe-zones-3 .framer-aldbd2",
        "#color-2 .framer-56ls52"
      ]
    },
    {
      "name": "columns-text-image",
      "instances": [
        "#lookup-2 .framer-1lenh07"
      ]
    },
    {
      "name": "cards-misuse",
      "instances": [
        "#color .framer-5e88u2"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "banner",
      "selector": [
        "#main section.framer-1a75kpf"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "title-intro",
      "selector": [
        "#main section.framer-zghjvr"
      ],
      "style": "royal-blue",
      "blocks": [],
      "defaultContent": [
        "#main section.framer-zghjvr .framer-o3nc87 h2",
        "#main section.framer-zghjvr p",
        "#main section.framer-zghjvr img"
      ]
    },
    {
      "id": "section-3",
      "name": "primary-logo",
      "selector": [
        "#main div.framer-y4dw6j"
      ],
      "style": "royal-blue",
      "blocks": [
        "video-autoplay",
        "cards-logo"
      ],
      "defaultContent": [
        "#safe-zones .framer-1friibd h6",
        "#safe-zones .framer-12d6146 p"
      ]
    },
    {
      "id": "section-4",
      "name": "photo-1",
      "selector": [
        "#lookup-1"
      ],
      "style": "full-width",
      "blocks": [],
      "defaultContent": [
        "#lookup-1 img"
      ]
    },
    {
      "id": "section-5",
      "name": "tone-of-voice",
      "selector": [
        "#color"
      ],
      "style": "bright-blue",
      "blocks": [
        "cards-tone"
      ],
      "defaultContent": [
        "#color .framer-dipzqq h6",
        "#color .framer-18fkybu p",
        "#color .framer-117z2n0 img",
        "#color .framer-qlrh08 p"
      ]
    },
    {
      "id": "section-6",
      "name": "photo-2",
      "selector": [
        "#lookup-2"
      ],
      "style": "full-width",
      "blocks": [],
      "defaultContent": [
        "#lookup-2 img"
      ]
    },
    {
      "id": "section-7",
      "name": "typography",
      "selector": [
        "#safe-zones-2"
      ],
      "style": null,
      "blocks": [
        "columns-typeface",
        "video-autoplay"
      ],
      "defaultContent": [
        "#safe-zones-2 .framer-1lqcozg h6",
        "#safe-zones-2 .framer-zhyf4w p",
        "#safe-zones-2 .framer-1p3jffl p"
      ]
    },
    {
      "id": "section-8",
      "name": "colour-palettes",
      "selector": [
        "#color-1"
      ],
      "style": null,
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": [
        "#color-1 .framer-1915gbc h6",
        "#color-1 .framer-anvjqr p",
        "#color-1 .framer-1xroz0u h6",
        "#color-1 .framer-1mlb4ha p"
      ]
    },
    {
      "id": "section-9",
      "name": "colour-pairings",
      "selector": [
        "#safe-zones-3"
      ],
      "style": null,
      "blocks": [
        "cards-contrast"
      ],
      "defaultContent": [
        "#safe-zones-3 .framer-1xoj0kg h6",
        "#safe-zones-3 .framer-156a11o p",
        "#safe-zones-3 .framer-pnb64u p"
      ]
    },
    {
      "id": "section-10",
      "name": "photo-3",
      "selector": [
        "#lookup-3"
      ],
      "style": "full-width",
      "blocks": [],
      "defaultContent": [
        "#lookup-3 img"
      ]
    },
    {
      "id": "section-11",
      "name": "shapes",
      "selector": [
        "#color-2"
      ],
      "style": "royal-blue",
      "blocks": [
        "cards-shape",
        "columns-panel"
      ],
      "defaultContent": [
        "#color-2 .framer-1aac7on h6",
        "#color-2 .framer-boymv1 p",
        "#color-2 .framer-df54j1 h6",
        "#color-2 .framer-t9xgly p",
        "#color-2 .framer-sacmql h6",
        "#color-2 .framer-1codb69 p",
        "#color-2 .framer-gdeh2j img"
      ]
    },
    {
      "id": "section-12",
      "name": "brand-examples",
      "selector": [
        "#safe-zones-4"
      ],
      "style": "royal-blue",
      "blocks": [],
      "defaultContent": [
        "#safe-zones-4 .framer-10qfyot h6",
        "#safe-zones-4 .framer-fa1zr0 p"
      ]
    },
    {
      "id": "section-13",
      "name": "photo-grid",
      "selector": [
        "#lookup-4"
      ],
      "style": "full-width",
      "blocks": [
        "columns-photos"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  "hero-banner": heroBannerParser,
  "video-autoplay": videoAutoplayParser,
  "cards-logo": cardsLogoParser,
  "cards-tone": cardsToneParser,
  "columns-typeface": columnsTypefaceParser,
  "cards-swatch": cardsSwatchParser,
  "cards-contrast": cardsContrastParser,
  "cards-shape": cardsShapeParser,
  "columns-panel": columnsPanelParser,
  "columns-photos": columnsPhotosParser,
  "cards-framed": cardsFramedParser,
  "columns-text-image": columnsTextImageParser,
  "cards-misuse": cardsMisuseParser,
};

const transformers = [
  aobrandplaybookCleanupTransformer,
  aobrandplaybookSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

/**
 * Block instances for this page.
 * 1. Mapped: PAGE_TEMPLATE instance selectors (captured on /ao-live, plus later
 *    analyses of other pages of the template). A match is accepted only if the block's
 *    validate() check agrees, because Framer hashes and section ids are reused on other pages
 *    for different content. The representative page is the one whose sections are mapped in
 *    PAGE_TEMPLATE.sections: when every block listed in sections[].blocks has a mapped match,
 *    use the mapped instances only (blocks added from other pages' analyses don't count).
 * 2. Fallback: otherwise run the structure-based detectors (./detectors/sub-brand-guide.js) on
 *    the cleaned document. Accepted mapped matches are kept as seeds; detectors never test
 *    an element inside (or holding) a seed or another matched block. Document order is kept.
 */
function findBlocksOnPage(document, template) {
  const byName = Object.fromEntries(detectors.map((d) => [d.name, d]));
  const mapped = [];
  template.blocks.forEach((blockDef) => {
    const det = byName[blockDef.name];
    blockDef.instances.forEach((selector) => {
      let els = [];
      try { els = [...document.querySelectorAll(selector)]; } catch (e) { els = []; }
      els.forEach((element) => {
        if (mapped.some((m) => m.element === element || m.element.contains(element) || element.contains(m.element))) return;
        if (det && det.validate && !det.validate(element)) return;
        mapped.push({ name: blockDef.name, selector, element, source: "mapped" });
      });
    });
  });

  // blocks of the representative page = the blocks its mapped sections hold
  const required = [...new Set((template.sections || []).flatMap((sec) => sec.blocks || []))];
  const complete = required.length > 0 && required.every((name) => mapped.some((m) => m.name === name));
  if (complete) return sortByDocumentOrder(mapped);

  const names = template.blocks.map((b) => b.name);
  const active = detectors.filter((d) => names.includes(d.name));
  const detected = detect(document, active, mapped);
  return sortByDocumentOrder([...mapped, ...detected]);
}

/**
 * Load the metadata of every in-page video before the transform, so the video frames have their
 * real size (Framer frames follow the video's aspect ratio; unloaded videos collapse to the 150px
 * placeholder) and video-autoplay can classify its "wide" option. Capped at 10s.
 * The intrinsic size is stored as data-excat-video-width / -height for the parser (the video
 * elements are re-created before the parsers run, so their loaded state is lost). Videos the
 * browser cannot load (e.g. H.264 in a Chromium build without proprietary codecs) get the size
 * from the MP4 header (first 256KB, track header "tkhd" box).
 */
function mp4Size(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  for (let i = 4; i + 4 <= bytes.length; i += 1) {
    if (bytes[i] === 0x74 && bytes[i + 1] === 0x6b && bytes[i + 2] === 0x68 && bytes[i + 3] === 0x64) {
      const start = i - 4;
      const size = view.getUint32(start);
      if (size > 80 && start + size <= bytes.length) {
        const w = view.getUint32(start + size - 8) / 65536;
        const h = view.getUint32(start + size - 4) / 65536;
        if (w > 0 && h > 0) return [w, h];
      }
    }
  }
  return null;
}

async function loadVideoMetadata(document) {
  const all = [...document.querySelectorAll("video")];
  const vids = all.filter((v) => v.readyState < 1);
  await Promise.all(vids.map((v) => new Promise((resolve) => {
    const done = () => resolve();
    v.addEventListener("loadedmetadata", done, { once: true });
    v.addEventListener("error", done, { once: true });
    setTimeout(done, 10000);
    try { v.preload = "metadata"; v.load(); } catch (e) { done(); }
  })));
  // record the intrinsic size as attributes: they survive later re-serialisation of the subtree
  // (the video elements the parsers see may be fresh, unloaded copies)
  all.filter((v) => v.videoWidth).forEach((v) => {
    v.setAttribute("data-excat-video-width", String(v.videoWidth));
    v.setAttribute("data-excat-video-height", String(v.videoHeight));
  });
  await Promise.all(all.filter((v) => !v.videoWidth).map(async (v) => {
    const src = v.currentSrc || v.getAttribute("src") || (v.querySelector("source[src]") && v.querySelector("source[src]").getAttribute("src"));
    if (!src) return;
    try {
      const res = await fetch(src, { headers: { Range: "bytes=0-262143" } });
      const size = mp4Size(await res.arrayBuffer());
      if (size) {
        v.setAttribute("data-excat-video-width", String(size[0]));
        v.setAttribute("data-excat-video-height", String(size[1]));
      }
    } catch (e) {
      // no size: the parser leaves the video unclassified
    }
  }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export default {
  onLoad: async ({ document }) => {
    try { await loadVideoMetadata(document); } catch (e) { console.warn("video metadata load failed", e); }
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers("beforeTransform", main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.isConnected) return; // removed by an earlier parser (e.g. merged typeface row)
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers("afterTransform", main, payload);

    main.appendChild(document.createElement("hr"));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
        detection: pageBlocks.map((b) => `${b.name}:${b.source}`),
      },
    }];
  },
};

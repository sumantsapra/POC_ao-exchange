/* eslint-disable */
/* global WebImporter */

import cardsSwatchParser from "./parsers/cards-swatch.js";
import columnsTextImageParser from "./parsers/columns-text-image.js";
import columnsPhotosParser from "./parsers/columns-photos.js";
import videoAutoplayParser from "./parsers/video-autoplay.js";
import cardsGradientParser from "./parsers/cards-gradient.js";
import cardsContrastParser from "./parsers/cards-contrast.js";
import cardsLogoParser from "./parsers/cards-logo.js";
import cardsFramedParser from "./parsers/cards-framed.js";
import cardsMisuseParser from "./parsers/cards-misuse.js";
import columnsPanelParser from "./parsers/columns-panel.js";
import columnsTypefaceParser from "./parsers/columns-typeface.js";
import cardsShapeParser from "./parsers/cards-shape.js";
import cardsPrincipleParser from "./parsers/cards-principle.js";
import columnsVoiceParser from "./parsers/columns-voice.js";
import columnsTermsParser from "./parsers/columns-terms.js";
import cardsSocialParser from "./parsers/cards-social.js";
import aobrandplaybookCleanupTransformer from "./transformers/aobrandplaybook-cleanup.js";
import aobrandplaybookSectionsTransformer from "./transformers/aobrandplaybook-sections.js";
import { detectors } from "./detectors/guideline-chapter.js";
import { detect, sortByDocumentOrder } from "./detectors/common.js";

const PAGE_TEMPLATE = {
  "name": "guideline-chapter",
  "urls": [
    "https://aobrandplaybook.com.au/colour",
    "https://aobrandplaybook.com.au/brand-sound",
    "https://aobrandplaybook.com.au/graphic-elements",
    "https://aobrandplaybook.com.au/logos",
    "https://aobrandplaybook.com.au/tone-of-voice",
    "https://aobrandplaybook.com.au/typography"
  ],
  "coverageGaps": [],
  "description": "Chapter page with a persistent left sidebar navigation, page title and intro paragraph, then stacked content sections of swatch/image grids, tiles and supporting copy",
  "blocks": [
    {
      "name": "cards-swatch",
      "instances": [
        "#safe-zones .framer-1wuo8kk",
        "#color .framer-1g9andj",
        "#color .framer-198no5b"
      ]
    },
    {
      "name": "columns-text-image",
      "instances": [
        "#lookup-1 .framer-3ffpn",
        "#lookup-2 .framer-1qkttbj",
        "#lookup-2 .framer-jt41uw",
        "#lookup-2 .framer-ndjhhs"
      ]
    },
    {
      "name": "columns-photos",
      "instances": [
        "#lookup-2 .framer-36ce78"
      ]
    },
    {
      "name": "video-autoplay",
      "instances": [
        "#safe-zones-1 .framer-ksfi4b-container"
      ]
    },
    {
      "name": "cards-gradient",
      "instances": [
        "#safe-zones-1 .framer-10cvpg2"
      ]
    },
    {
      "name": "cards-contrast",
      "instances": [
        "#safe-zones-2 .framer-1hoawxf",
        "#color-1 .framer-1gnjipl"
      ]
    },
    {
      "name": "cards-logo",
      "instances": [
        "#lookup-1 .framer-wyv0dm"
      ]
    },
    {
      "name": "cards-framed",
      "instances": [
        "#lookup-2 .framer-zdrygb",
        "#lookup-2 .framer-qzequr",
        "#safe-zones .framer-190g2jc"
      ]
    },
    {
      "name": "cards-misuse",
      "instances": [
        "#color .framer-1pautcq"
      ]
    },
    {
      "name": "columns-panel",
      "instances": [
        "#safe-zones-1 .framer-1tm17e8"
      ]
    },
    {
      "name": "columns-typeface",
      "instances": [
        "#safe-zones .framer-7kzaul",
        "#safe-zones-1 .framer-b9xw17",
        "#lookup-5 .framer-1a64gka",
        "#lookup-5 .framer-gqai87"
      ]
    },
    {
      "name": "cards-shape",
      "instances": [
        "#lookup-3 .framer-1dfbedl",
        "#lookup-3 .framer-2mxgr",
        "#lookup-3 .framer-ss7pv0",
        "#lookup-3 .framer-ds2ofi",
        "#lookup-3 .framer-1fsydwe",
        "#lookup-3 .framer-2n93lj",
        "#safe-zones-2 .framer-11s1aok",
        "#safe-zones-2 .framer-k0ajs8",
        "#safe-zones-2 .framer-6128tf",
        "#safe-zones-2 .framer-1fxhp2s"
      ]
    },
    {
      "name": "cards-principle",
      "instances": [
        "#safe-zones .framer-1czmh2h"
      ]
    },
    {
      "name": "columns-voice",
      "instances": [
        "#color-3 .framer-14ss45b"
      ]
    },
    {
      "name": "columns-terms",
      "instances": [
        "#color-4 .framer-i3505b",
        "#color-5 .framer-2l1627"
      ]
    },
    {
      "name": "cards-social",
      "instances": [
        "#color-6 .framer-1gtid9f"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "intro",
      "selector": [
        "section.framer-h13a33"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "section.framer-h13a33 h1",
        "section.framer-h13a33 h4"
      ]
    },
    {
      "id": "section-2",
      "name": "intro-animation",
      "selector": [
        "#lookup"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "#lookup img"
      ]
    },
    {
      "id": "section-3",
      "name": "core-palette",
      "selector": [
        "#safe-zones"
      ],
      "style": null,
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": [
        "#safe-zones .framer-fvytxn h6",
        "#safe-zones .framer-4u0g6g p"
      ]
    },
    {
      "id": "section-4",
      "name": "colour-distribution",
      "selector": [
        "#lookup-1"
      ],
      "style": null,
      "blocks": [
        "columns-text-image"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "application-examples",
      "selector": [
        "#lookup-2"
      ],
      "style": null,
      "blocks": [
        "columns-photos"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "brand-moment",
      "selector": [
        "#brandmoment"
      ],
      "style": "full-width",
      "blocks": [],
      "defaultContent": [
        "#brandmoment img"
      ]
    },
    {
      "id": "section-7",
      "name": "special-use-palettes",
      "selector": [
        "#color"
      ],
      "style": null,
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": [
        "#color .framer-1lf9jez h6",
        "#color .framer-fomqto p",
        "#color .framer-1wxktou h6",
        "#color .framer-ixrbpy p"
      ]
    },
    {
      "id": "section-8",
      "name": "gradients",
      "selector": [
        "#safe-zones-1"
      ],
      "style": null,
      "blocks": [
        "video-autoplay",
        "cards-gradient"
      ],
      "defaultContent": [
        "#safe-zones-1 .framer-dhg7oe h6",
        "#safe-zones-1 .framer-1lth049 p"
      ]
    },
    {
      "id": "section-9",
      "name": "accessibility",
      "selector": [
        "#safe-zones-2"
      ],
      "style": null,
      "blocks": [
        "cards-contrast"
      ],
      "defaultContent": [
        "#safe-zones-2 .framer-1xdz6gu h6",
        "#safe-zones-2 .framer-1f8vvy0 p"
      ]
    }
  ]
};

const parsers = {
  "cards-swatch": cardsSwatchParser,
  "columns-text-image": columnsTextImageParser,
  "columns-photos": columnsPhotosParser,
  "video-autoplay": videoAutoplayParser,
  "cards-gradient": cardsGradientParser,
  "cards-contrast": cardsContrastParser,
  "cards-logo": cardsLogoParser,
  "cards-framed": cardsFramedParser,
  "cards-misuse": cardsMisuseParser,
  "columns-panel": columnsPanelParser,
  "columns-typeface": columnsTypefaceParser,
  "cards-shape": cardsShapeParser,
  "cards-principle": cardsPrincipleParser,
  "columns-voice": columnsVoiceParser,
  "columns-terms": columnsTermsParser,
  "cards-social": cardsSocialParser,
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
 * 1. Mapped: PAGE_TEMPLATE instance selectors (captured on /colour, plus later
 *    analyses of other pages of the template). A match is accepted only if the block's
 *    validate() check agrees, because Framer hashes and section ids are reused on other pages
 *    for different content. The representative page is the one whose sections are mapped in
 *    PAGE_TEMPLATE.sections: when every block listed in sections[].blocks has a mapped match,
 *    use the mapped instances only (blocks added from other pages' analyses don't count).
 * 2. Fallback: otherwise run the structure-based detectors (./detectors/guideline-chapter.js) on
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

// true when the MP4's header declares a sound track (a "hdlr" box whose handler type is "soun")
function mp4HasAudio(buffer) {
  const bytes = new Uint8Array(buffer);
  for (let i = 4; i + 12 <= bytes.length; i += 1) {
    if (bytes[i] === 0x68 && bytes[i + 1] === 0x64 && bytes[i + 2] === 0x6c && bytes[i + 3] === 0x72
      && String.fromCharCode(bytes[i + 12], bytes[i + 13], bytes[i + 14], bytes[i + 15]) === "soun") return true;
  }
  return false;
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
  // record whether each video has an audio track (the video-autoplay parser's "sound" option)
  await Promise.all(all.map(async (v) => {
    const src = v.currentSrc || v.getAttribute("src") || (v.querySelector("source[src]") && v.querySelector("source[src]").getAttribute("src"));
    if (!src) return;
    try {
      const res = await fetch(src, { headers: { Range: "bytes=0-262143" } });
      v.setAttribute("data-excat-video-audio", mp4HasAudio(await res.arrayBuffer()) ? "true" : "false");
    } catch (e) {
      // unknown: the parser treats the video as silent
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

/* eslint-disable */
/* global WebImporter */

import heroSlideshowParser from "./parsers/hero-slideshow.js";
import carouselStackParser from "./parsers/carousel-stack.js";
import accordionPhotoParser from "./parsers/accordion-photo.js";
import heroScrollvideoParser from "./parsers/hero-scrollvideo.js";
import cardsMosaicParser from "./parsers/cards-mosaic.js";
import columnsTilesParser from "./parsers/columns-tiles.js";
import cardsLinklistParser from "./parsers/cards-linklist.js";
import aobrandplaybookCleanupTransformer from "./transformers/aobrandplaybook-cleanup.js";
import aobrandplaybookSectionsTransformer from "./transformers/aobrandplaybook-sections.js";

const PAGE_TEMPLATE = {
  "name": "homepage",
  "urls": [
    "https://aobrandplaybook.com.au/"
  ],
  "coverageGaps": [],
  "description": "Long scroll-animated landing page opening with a full-screen video hero and centered display heading, followed by stacked story panels and chapter links",
  "blocks": [
    {
      "name": "hero-slideshow",
      "instances": [
        "#hero .framer-z1hcay"
      ]
    },
    {
      "name": "carousel-stack",
      "instances": [
        "#intro #photo1"
      ]
    },
    {
      "name": "accordion-photo",
      "instances": [
        "#brandvoice .framer-1eyc6ig-container"
      ]
    },
    {
      "name": "hero-scrollvideo",
      "instances": [
        "#hitsdifferentsection .framer-rmcsqp"
      ]
    },
    {
      "name": "cards-mosaic",
      "instances": [
        "#test-2-nav #grid"
      ]
    },
    {
      "name": "columns-tiles",
      "instances": [
        "#howeplay .framer-1aqcy54"
      ]
    },
    {
      "name": "cards-linklist",
      "instances": [
        "#summary .framer-1kzpkww-container"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "intro-hero",
      "selector": [
        "#hero"
      ],
      "style": null,
      "blocks": [
        "hero-slideshow"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "tennis-down-under",
      "selector": [
        "#intro"
      ],
      "style": "centered",
      "blocks": [
        "carousel-stack"
      ],
      "defaultContent": [
        "#intro .framer-zogz1q h5",
        "#intro .framer-7hzwnd h1"
      ]
    },
    {
      "id": "section-3",
      "name": "who-we-are",
      "selector": [
        "#brand-positioning"
      ],
      "style": "process-blue, centered, text-reveal",
      "blocks": [],
      "defaultContent": [
        "#brand-positioning .framer-2dc9vw h5",
        "#brand-positioning .framer-151xpzu h6"
      ]
    },
    {
      "id": "section-4",
      "name": "brand-values",
      "selector": [
        "#brandvoice"
      ],
      "style": null,
      "blocks": [
        "accordion-photo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "how-it-comes-to-life",
      "selector": [
        "#gamechangercomestolife"
      ],
      "style": "centered, text-reveal",
      "blocks": [],
      "defaultContent": [
        "#gamechangercomestolife .framer-1n29ak3 h5",
        "#gamechangercomestolife .framer-3fx0p7 h6"
      ]
    },
    {
      "id": "section-6",
      "name": "hits-different",
      "selector": [
        "#hitsdifferentsection"
      ],
      "style": null,
      "blocks": [
        "hero-scrollvideo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "one-brand",
      "selector": [
        "#onebrandsection"
      ],
      "style": "centered, headline-swap",
      "blocks": [],
      "defaultContent": [
        "#onebrandsection .framer-venm6w h5",
        "#onebrandsection .framer-13dnfv0 h2",
        "#onebrandsection .framer-13b2vow h3"
      ]
    },
    {
      "id": "section-8",
      "name": "playful-premium",
      "selector": [
        "#test > div.framer-jj7874"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "#test > div.framer-jj7874 .framer-q7ufdr h4"
      ]
    },
    {
      "id": "section-9",
      "name": "photo-collage",
      "selector": [
        "#test-2-nav"
      ],
      "style": null,
      "blocks": [
        "cards-mosaic"
      ],
      "defaultContent": []
    },
    {
      "id": "section-10",
      "name": "brand-tiles",
      "selector": [
        "#howeplay"
      ],
      "style": null,
      "blocks": [
        "columns-tiles"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "toolkits",
      "selector": [
        "#summary"
      ],
      "style": null,
      "blocks": [
        "cards-linklist"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  "hero-slideshow": heroSlideshowParser,
  "carousel-stack": carouselStackParser,
  "accordion-photo": accordionPhotoParser,
  "hero-scrollvideo": heroScrollvideoParser,
  "cards-mosaic": cardsMosaicParser,
  "columns-tiles": columnsTilesParser,
  "cards-linklist": cardsLinklistParser,
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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers("beforeTransform", main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};

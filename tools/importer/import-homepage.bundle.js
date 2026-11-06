/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-slideshow.js
  function sentenceCase(text) {
    const t = (text || "").replace(/\s+/g, " ").trim().toLowerCase();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }
  function textOf(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function videoSrc(el) {
    const video = el.querySelector("video[src], video source[src]");
    if (video) return video.getAttribute("src");
    const link = [...el.querySelectorAll("a[href]")].find((a) => /\.mp4(\?|$)/i.test(a.getAttribute("href")));
    return link ? link.getAttribute("href") : "";
  }
  function parse(element, { document }) {
    const mediaCell = [];
    const photos = [];
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!src || src.startsWith("data:")) return;
      if (img.closest("a")) return;
      const pic = document.createElement("img");
      pic.src = imgSrc(img);
      pic.alt = img.getAttribute("alt") || "";
      photos.push(pic);
    });
    mediaCell.push(...photos.reverse());
    const mp4 = videoSrc(element);
    if (mp4) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = mp4;
      a.textContent = mp4;
      p.append(a);
      mediaCell.push(p);
    }
    const contentCell = [];
    const heading = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => !h.closest("a"));
    if (heading) {
      const h1 = document.createElement("h1");
      h1.textContent = textOf(heading);
      contentCell.push(h1);
    }
    const links = [...element.querySelectorAll("a[href]")].filter((a) => /#/.test(a.getAttribute("href") || "") && a.textContent.trim());
    if (links.length) {
      const p = document.createElement("p");
      links.forEach((src, i) => {
        const href = src.getAttribute("href").replace(/^\.?\/?(?=#)/, "");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = sentenceCase(src.textContent);
        if (i) p.append(" ");
        p.append(a);
      });
      contentCell.push(p);
    }
    const cells = [[mediaCell]];
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-slideshow", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-stack.js
  var CAPTURED_CAPTIONS = [
    ["It\u2019s the ", "roar of the crowd."],
    ["It\u2019s the ", "heat of the summer."],
    ["It\u2019s the ", "pulse of the city."]
  ];
  function textOf2(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function mediaSrc(card) {
    const video = card.querySelector("video[src], video source[src]");
    if (video) return { type: "video", src: video.getAttribute("src") };
    const link = card.querySelector("a[href]");
    if (link) return { type: "video", src: link.getAttribute("href") };
    const img = [...card.querySelectorAll("img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
    if (img) return { type: "image", src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
    return null;
  }
  function hasMedia(el) {
    return !!el.querySelector('video, img:not([src^="data:"])') || el.tagName === "A" && /supabase|\.mp4/.test(el.href);
  }
  function captionFromParts(document, lead, accent) {
    const p = document.createElement("p");
    p.append(lead);
    const em = document.createElement("em");
    em.textContent = accent;
    p.append(em);
    return p;
  }
  function captionFromDom(document, el) {
    const text = textOf2(el);
    const m = text.match(/^(It[’']s the )(.+)$/i);
    if (!m) return null;
    return captionFromParts(document, m[1].replace("'", "\u2019"), m[2].replace(/\s+\./, "."));
  }
  function parse2(element, { document }) {
    const cards = [element];
    let next = element.nextElementSibling;
    const spacers = [];
    while (next) {
      if (hasMedia(next)) cards.push(next);
      else if (!textOf2(next)) spacers.push(next);
      else break;
      next = next.nextElementSibling;
    }
    const scope = element.parentElement || document;
    const domCaptionEls = [...scope.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((h) => !cards.some((c) => c.contains(h)) && /^It[’']s the /i.test(textOf2(h)));
    const useDom = domCaptionEls.length === cards.length;
    const cells = [];
    cards.forEach((card, i) => {
      const media = mediaSrc(card);
      let mediaCell = "";
      if (media && media.type === "video") {
        const a = document.createElement("a");
        a.href = media.src;
        a.textContent = media.src;
        mediaCell = a;
      } else if (media) {
        const img = document.createElement("img");
        img.src = media.src;
        img.alt = media.alt;
        mediaCell = img;
      }
      let caption = useDom ? captionFromDom(document, domCaptionEls[i]) : null;
      if (!caption && CAPTURED_CAPTIONS[i]) caption = captionFromParts(document, ...CAPTURED_CAPTIONS[i]);
      cells.push([mediaCell, caption || ""]);
    });
    domCaptionEls.forEach((h) => {
      const wrapper = h.closest('[id="first-sentence"]') || h;
      wrapper.remove();
    });
    cards.slice(1).forEach((c) => c.remove());
    spacers.forEach((s) => s.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-stack", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-photo.js
  var CAPTURED = {
    openness: {
      img: "https://framerusercontent.com/images/WvGO8xUMy4lLara6y8XFtr78k.png",
      text: "We embrace innovation and opportunity, shaping the future of tennis with curiosity and bold thinking."
    },
    "breakthrough thinking": {
      img: "https://framerusercontent.com/images/vmfHf59UpPpdnmQQcQu4ODzk97k.jpg",
      text: "We challenge the status quo, pursuing game-changing ideas that elevate the sport and inspire the world."
    },
    connection: {
      img: "https://framerusercontent.com/images/vl46iR28aH0UflfUentyiAkkyTA.jpg",
      text: "We bring tennis to the people: creating moments, stories, and innovations that ignite passion and unite fans."
    },
    passion: {
      img: "https://framerusercontent.com/images/LIi3IVS9qicXLenNIDQe3RLgj3k.png",
      text: "We embody the Australian spirit: fearless, determined, and driven by an unwavering love for the game."
    }
  };
  var CAPTURED_ORDER = ["Openness", "Breakthrough thinking", "Connection", "Passion"];
  function textOf3(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc2(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var isNumeral = (t) => /^\d+\.?$/.test(t);
  function parse3(element, { document }) {
    const titleEls = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => textOf3(h) && !isNumeral(textOf3(h)));
    const seen = /* @__PURE__ */ new Set();
    const uniqueTitles = titleEls.filter((h) => {
      const k = textOf3(h).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const known = uniqueTitles.filter((h) => CAPTURED[textOf3(h).toLowerCase()]);
    const titles = known.length ? known : uniqueTitles;
    const headingEyebrow = known.length ? uniqueTitles.find((h) => !known.includes(h)) : null;
    const items = titles.map((h) => {
      let node = h;
      while (node.parentElement && node.parentElement !== element) {
        const count = [...node.parentElement.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((x) => textOf3(x) && !isNumeral(textOf3(x))).length;
        if (count > 1) break;
        node = node.parentElement;
      }
      return { title: textOf3(h), container: node };
    });
    const eyebrow = headingEyebrow || [...element.querySelectorAll("p")].find((p) => textOf3(p) && !items.some((it) => it.container.contains(p)));
    const photos = [...element.querySelectorAll("img")].filter((img) => !(img.getAttribute("src") || "").startsWith("data:")).filter((img) => !items.some((it) => it.container.contains(img)));
    const uniquePhotos = [];
    photos.forEach((img) => {
      if (!uniquePhotos.some((u) => imgSrc2(u) === imgSrc2(img))) uniquePhotos.push(img);
    });
    const list = items.length ? items : CAPTURED_ORDER.map((t) => ({ title: t, container: null }));
    const stack = uniquePhotos.slice().reverse();
    const usePhotos = stack.length === list.length;
    const cells = [];
    if (eyebrow) {
      const t = textOf3(eyebrow);
      cells.push([t.charAt(0).toUpperCase() + t.slice(1)]);
    }
    list.forEach((item, i) => {
      const captured = CAPTURED[item.title.toLowerCase()] || {};
      const content = [];
      const capturedPhoto = captured.img && uniquePhotos.find((u) => imgSrc2(u) === captured.img);
      let photo = null;
      if (capturedPhoto) photo = capturedPhoto;
      else if (usePhotos) photo = stack[i];
      const src = photo ? imgSrc2(photo) : captured.img;
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = photo && photo.getAttribute("alt") || "";
        content.push(img);
      }
      const domDesc = item.container ? [...item.container.querySelectorAll("p")].find((p) => textOf3(p) && textOf3(p) !== item.title) : null;
      const descText = domDesc ? textOf3(domDesc) : captured.text;
      if (descText) {
        const p = document.createElement("p");
        p.textContent = descText;
        content.push(p);
      }
      cells.push([item.title, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-photo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-scrollvideo.js
  function textOf4(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function videoSrc2(el) {
    const video = el.querySelector("video[src], video source[src]");
    if (video) return video.getAttribute("src");
    const link = [...el.querySelectorAll("a[href]")].find((a) => /\.mp4(\?|$)/i.test(a.getAttribute("href")));
    return link ? link.getAttribute("href") : "";
  }
  function parse4(element, { document }) {
    const cells = [];
    const mp4 = videoSrc2(element);
    const mediaCell = [];
    if (mp4) {
      const a = document.createElement("a");
      a.href = mp4;
      a.textContent = mp4;
      mediaCell.push(a);
    }
    cells.push([mediaCell]);
    const titleWords = [];
    element.querySelectorAll("h1, h2").forEach((h) => {
      const t = textOf4(h);
      if (t && !titleWords.includes(t)) titleWords.push(t);
    });
    const nodes = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6, p")];
    const content = [];
    const seenEyebrows = /* @__PURE__ */ new Set();
    let titleDone = false;
    nodes.forEach((node, i) => {
      const t = textOf4(node);
      if (!t) return;
      if (/^H[12]$/.test(node.tagName)) {
        if (titleDone || !titleWords.length) return;
        const h2 = document.createElement("h2");
        h2.textContent = titleWords.join(" ");
        content.push(h2);
        titleDone = true;
        return;
      }
      if (node.tagName === "P") return;
      const key = t.toLowerCase();
      if (seenEyebrows.has(key)) return;
      seenEyebrows.add(key);
      const eyebrow = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = t;
      eyebrow.append(strong);
      content.push(eyebrow);
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[j].tagName !== "P") break;
        const ct = textOf4(nodes[j]);
        if (ct) {
          const p = document.createElement("p");
          p.textContent = ct;
          content.push(p);
          break;
        }
      }
    });
    if (!titleDone && titleWords.length) {
      const h2 = document.createElement("h2");
      h2.textContent = titleWords.join(" ");
      content.unshift(h2);
    }
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-scrollvideo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-mosaic.js
  function imgSrc3(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function parse5(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll("img").forEach((source) => {
      const src = imgSrc3(source);
      if (!src || src.startsWith("data:") || seen.has(src)) return;
      seen.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      cells.push([img, ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-mosaic", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-tiles.js
  function textOf5(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc4(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function sentenceCase2(text) {
    const t = text.toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function parse6(element, { document }) {
    const imgs = [...element.querySelectorAll("img")].filter((img) => !(img.getAttribute("src") || "").startsWith("data:"));
    const seen = /* @__PURE__ */ new Set();
    const row = [];
    imgs.forEach((source) => {
      const src = imgSrc4(source);
      if (seen.has(src)) return;
      seen.add(src);
      let tile = source.parentElement;
      while (tile && tile !== element && !textOf5(tile)) tile = tile.parentElement;
      const cell = [];
      const img = document.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      cell.push(img);
      const labelEl = tile && tile !== element ? [...tile.querySelectorAll("p, h1, h2, h3, h4, h5, h6")].find((p) => textOf5(p)) : null;
      if (labelEl) {
        const p = document.createElement("p");
        p.textContent = sentenceCase2(textOf5(labelEl));
        cell.push(p);
      }
      row.push(cell);
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-linklist.js
  function textOf6(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function normaliseHref(href, label) {
    let h = (href || "").trim();
    try {
      const u = new URL(h, "https://aobrandplaybook.com.au/");
      if (u.hostname === "aobrandplaybook.com.au") h = u.pathname + u.search + u.hash;
    } catch (e) {
    }
    if ((h === "/" || h === "") && label.toLowerCase() === "brand sound") h = "/brand-sound";
    return h;
  }
  function parse7(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll("a[href]").forEach((source) => {
      const heading = source.querySelector("h1, h2, h3, h4, h5, h6, p");
      const label = heading ? textOf6(heading) : textOf6(source);
      if (!label) return;
      const href = normaliseHref(source.getAttribute("href"), label);
      const key = `${label}|${href}`;
      if (seen.has(key)) return;
      seen.add(key);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      cells.push([p]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-linklist", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aobrandplaybook-cleanup.js
  var KNOWN_DESKTOP_HASHES = ["1rffoj4", "1vfv6mq", "71r3xb", "6yolz5"];
  var WHO_WE_ARE_TEXT = "The AO isn't just a tournament. We redefine what a Grand Slam can be. Our brand archetype is the Game Changer: bold, inventive, and unafraid to rewrite the rules.";
  var APPEAR_STYLE_PROPS = [
    "opacity",
    "transform",
    "will-change",
    "visibility",
    "filter",
    "transform-origin",
    "translate",
    "scale",
    "rotate"
  ];
  function collapse(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function getDesktopHashes(document) {
    const hashes = /* @__PURE__ */ new Set();
    document.querySelectorAll("style").forEach((style) => {
      const css = style.textContent || "";
      if (!css.includes(".hidden-")) return;
      const re = /@media\s*\(\s*min-width:\s*[\d.]+px\s*\)\s*\{\s*\.hidden-([a-z0-9]+)\s*\{\s*display:\s*none/gi;
      let m = re.exec(css);
      while (m) {
        hashes.add(m[1]);
        m = re.exec(css);
      }
    });
    if (hashes.size) return hashes;
    const hiddenUsed = /* @__PURE__ */ new Set();
    document.querySelectorAll('[class*="hidden-"]').forEach((el) => {
      el.classList.forEach((c) => {
        const m = c.match(/^hidden-([a-z0-9]+)$/);
        if (m) hiddenUsed.add(m[1]);
      });
    });
    const roots = [...document.querySelectorAll("#main > div, #main > div > div")];
    roots.forEach((el) => {
      el.classList.forEach((c) => {
        const m = c.match(/^framer-([a-z0-9]{5,8})$/);
        if (m && hiddenUsed.has(m[1])) hashes.add(m[1]);
      });
    });
    KNOWN_DESKTOP_HASHES.forEach((h) => {
      if (hiddenUsed.has(h)) hashes.add(h);
    });
    return hashes;
  }
  function dedupeBreakpoints(document) {
    const hashes = getDesktopHashes(document);
    if (!hashes.size) return;
    const selector = [...hashes].map((h) => `.hidden-${h}`).join(",");
    document.querySelectorAll(selector).forEach((el) => {
      if (el.isConnected) el.remove();
    });
  }
  function removeEmptyWrapper(el) {
    let node = el;
    while (node && node.parentElement) {
      const parent = node.parentElement;
      if (parent.id === "main" || parent.tagName === "BODY") break;
      const isWrapper = /(^|\s)ssr-variant(\s|$)|-container(\s|$)/.test(parent.className || "");
      const siblings = [...parent.children].filter((c) => c !== node);
      if (isWrapper && siblings.length === 0) {
        node = parent;
      } else {
        break;
      }
    }
    node.remove();
  }
  function isAnchorOnlyNav(el) {
    const links = [...el.querySelectorAll("a")];
    if (links.length < 3) return false;
    if (el.querySelector("img, video, picture, svg, h1, h2, h3, h4, h5, h6")) return false;
    return links.every((a) => /^(\.\/|\/)?#/.test(a.getAttribute("href") || ""));
  }
  function removeChrome(document) {
    WebImporter.DOMUtils.remove(document.body || document, [
      "header",
      "nav",
      "footer",
      "#overlay",
      "#template-overlay",
      "#svg-templates",
      "#__framer-badge-container",
      '[class*="framer-badge"]',
      "iframe#__framer-editorbar",
      'iframe[src*="framer.com/edit"]',
      "script",
      "noscript",
      "link",
      "meta"
    ]);
    document.querySelectorAll('#main [class*="-container"], #main .ssr-variant').forEach((el) => {
      if (!el.isConnected) return;
      if (!collapse(el.textContent) && !el.querySelector("img, video, picture, source, svg, iframe")) {
        if (!el.closest("section, main, [id]:not(#main)")) removeEmptyWrapper(el);
      }
    });
    const candidates = [...document.querySelectorAll("#main div")].filter((el) => !el.closest("section, main, #hero, #summary") && isAnchorOnlyNav(el));
    candidates.filter((el) => !candidates.some((other) => other !== el && other.contains(el))).forEach((el) => {
      if (el.isConnected) removeEmptyWrapper(el);
    });
    document.querySelectorAll('[class*="framer-pointer-events-none"]').forEach((el) => {
      if (!collapse(el.textContent) && !el.querySelector("img, video, picture")) el.remove();
    });
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SVG_DATA_PREFIX = "data:image/svg+xml;base64,";
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin);
  }
  function computedStyle(document, el) {
    const view = document.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return view.getComputedStyle(el);
    } catch (e) {
      return null;
    }
  }
  function resolveVars(document, value) {
    if (!value || value.indexOf("var(") === -1) return value;
    const rootStyle = computedStyle(document, document.documentElement);
    let out = value;
    for (let guard = 0; guard < 10 && out.indexOf("var(") !== -1; guard += 1) {
      out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (m, name, fallback) => {
        const live = rootStyle ? (rootStyle.getPropertyValue(name) || "").trim() : "";
        return live || (fallback || "").trim() || "currentColor";
      });
    }
    return out;
  }
  function isDecorativeSvgHost(el) {
    return !!el.closest('a, button, header, nav, footer, [role="button"]');
  }
  function isDecorativeGlyph(el, w, h) {
    if (!(w && h && w <= 24 && h <= 24)) return false;
    for (let n = el, d = 0; n && d < 4; n = n.parentElement, d += 1) {
      const name = n.getAttribute && n.getAttribute("data-framer-name") || "";
      if (/^(line|arrow|chevron|caret)\b/i.test(name)) return true;
    }
    return false;
  }
  function sizeOf(el, fallbackW, fallbackH) {
    let w = 0;
    let h = 0;
    if (typeof el.getBoundingClientRect === "function") {
      const r = el.getBoundingClientRect();
      w = Math.round(r.width);
      h = Math.round(r.height);
    }
    return { w: w || Math.round(fallbackW || 0), h: h || Math.round(fallbackH || 0) };
  }
  function serialiseSvg(svg) {
    const xml = new XMLSerializer().serializeToString(svg);
    return xml.indexOf('xmlns="') === -1 ? xml.replace("<svg", `<svg xmlns="${SVG_NS}"`) : xml;
  }
  function artworkImg(document, markup, alt, w, h) {
    const img = document.createElement("img");
    img.setAttribute("src", `${SVG_DATA_PREFIX}${toBase64(markup)}`);
    img.setAttribute("alt", alt || "");
    if (w) img.setAttribute("width", String(w));
    if (h) img.setAttribute("height", String(h));
    img.setAttribute("data-excat-svg", "true");
    return img;
  }
  function artworkAlt(el) {
    for (let n = el; n && n.tagName !== "SECTION"; n = n.parentElement) {
      const name = n.getAttribute && n.getAttribute("data-framer-name");
      if (name && !/^(vector|logo placeholder|img|frame \d+|placeholder|container|graphic|icon|type)$/i.test(name)) return name;
    }
    return "";
  }
  function resolveSvgTree(document, root, color) {
    [root, ...root.querySelectorAll("*")].forEach((node) => {
      [...node.attributes].forEach((attr) => {
        let v = resolveVars(document, attr.value);
        if (color && /currentcolor/i.test(v)) v = v.replace(/currentcolor/gi, color);
        if (v !== attr.value) node.setAttribute(attr.name, v);
      });
    });
  }
  function convertUseSprites(document) {
    const root = document.querySelector("#main") || document.body;
    [...root.querySelectorAll("svg")].forEach((svg) => {
      if (!svg.isConnected || svg.parentElement.closest("svg") || isDecorativeSvgHost(svg)) return;
      const use = svg.querySelector("use");
      let out;
      if (use) {
        const ref = (use.getAttribute("href") || use.getAttribute("xlink:href") || "").replace(/^#/, "");
        const tmpl = ref && document.getElementById(ref);
        if (!tmpl) return;
        if (tmpl.tagName.toLowerCase() === "symbol") {
          out = document.createElementNS(SVG_NS, "svg");
          [...tmpl.childNodes].forEach((c) => out.appendChild(c.cloneNode(true)));
          const vb2 = tmpl.getAttribute("viewBox") || svg.getAttribute("viewBox");
          if (vb2) out.setAttribute("viewBox", vb2);
        } else {
          out = tmpl.cloneNode(true);
        }
      } else {
        out = svg.cloneNode(true);
      }
      out.removeAttribute("id");
      out.removeAttribute("style");
      const style = computedStyle(document, svg);
      resolveSvgTree(document, out, style && style.color ? style.color : "");
      if (!out.getAttribute("viewBox") && svg.getAttribute("viewBox")) out.setAttribute("viewBox", svg.getAttribute("viewBox"));
      const vb = (out.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const host = svg.parentElement || svg;
      const { w, h } = sizeOf(host, parseFloat(out.getAttribute("width")) || vb[2], parseFloat(out.getAttribute("height")) || vb[3]);
      if (isDecorativeGlyph(host, w, h)) return;
      if (w) out.setAttribute("width", String(w));
      if (h) out.setAttribute("height", String(h));
      svg.replaceWith(artworkImg(document, serialiseSvg(out), artworkAlt(host), w, h));
    });
  }
  function maskRules(document) {
    const rules = {};
    document.querySelectorAll("style").forEach((style) => {
      const css = style.textContent || "";
      if (css.indexOf('mask:url("data:image/svg+xml,') === -1) return;
      const re = /\.(framer-[A-Za-z0-9_-]+)\{([^{}]*?mask:url\("data:image\/svg\+xml,[^{}]*)\}/g;
      let m = re.exec(css);
      while (m) {
        const body = m[2];
        const svgMatch = body.match(/mask:url\("data:image\/svg\+xml,((?:\\.|[^"\\])*)"\)/);
        const bg = body.match(/background-color:((?:[^;()]|\((?:[^()]|\([^()]*\))*\))*)/);
        if (svgMatch) rules[m[1]] = { svg: svgMatch[1].replace(/\\(.)/g, "$1"), bg: bg ? bg[1].trim() : "" };
        m = re.exec(css);
      }
    });
    return rules;
  }
  function convertMaskVectors(document) {
    const rules = maskRules(document);
    const names = Object.keys(rules);
    if (!names.length) return;
    const root = document.querySelector("#main") || document.body;
    root.querySelectorAll(names.map((n) => `.${n}`).join(",")).forEach((el) => {
      if (!el.isConnected || isDecorativeSvgHost(el)) return;
      const rule = rules[names.find((n) => el.classList.contains(n))];
      let markup = rule.svg;
      try {
        markup = decodeURIComponent(markup);
      } catch (e) {
      }
      const style = computedStyle(document, el);
      const live = style && style.backgroundColor;
      let color = live && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(live) ? live : resolveVars(document, rule.bg);
      if (!color || /var\(|currentcolor/i.test(color)) color = "#000";
      const tmp = document.createElement("div");
      tmp.innerHTML = markup;
      const svg = tmp.querySelector("svg");
      if (!svg) return;
      let painted = false;
      [svg, ...svg.querySelectorAll("*")].forEach((n) => {
        if (n.hasAttribute("fill") && n.getAttribute("fill") !== "none") {
          n.setAttribute("fill", color);
          painted = true;
        }
        if (n.hasAttribute("stroke") && n.getAttribute("stroke") !== "none") {
          n.setAttribute("stroke", color);
          painted = true;
        }
      });
      if (!painted) svg.setAttribute("fill", color);
      svg.removeAttribute("id");
      svg.removeAttribute("display");
      const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const { w, h } = sizeOf(el, parseFloat(svg.getAttribute("width")) || vb[2], parseFloat(svg.getAttribute("height")) || vb[3]);
      if (isDecorativeGlyph(el, w, h)) return;
      if (w) svg.setAttribute("width", String(w));
      if (h) svg.setAttribute("height", String(h));
      el.setAttribute("data-excat-mask", "true");
      el.appendChild(artworkImg(document, serialiseSvg(svg), artworkAlt(el), w, h));
    });
  }
  function convertBackgroundVectors(document) {
    const root = document.querySelector("#main") || document.body;
    root.querySelectorAll('[style*="data:image/svg+xml"]').forEach((el) => {
      if (!el.isConnected || isDecorativeSvgHost(el) || el.querySelector("img")) return;
      const style = el.getAttribute("style") || "";
      const m = style.match(/background-image\s*:\s*url\((['"]?)(data:image\/svg\+xml,.*?)\1\)/);
      if (!m) return;
      let markup = m[2].replace(/^data:image\/svg\+xml,/, "");
      try {
        markup = decodeURIComponent(markup);
      } catch (e) {
      }
      const tmp = document.createElement("div");
      tmp.innerHTML = markup;
      const svg = tmp.querySelector("svg");
      if (!svg) return;
      const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const { w, h } = sizeOf(el, parseFloat(svg.getAttribute("width")) || vb[2], parseFloat(svg.getAttribute("height")) || vb[3]);
      if (isDecorativeGlyph(el, w, h)) return;
      if (w) svg.setAttribute("width", String(w));
      if (h) svg.setAttribute("height", String(h));
      el.setAttribute("style", style.replace(m[0], "").replace(/;\s*;/g, ";"));
      el.appendChild(artworkImg(document, serialiseSvg(svg), artworkAlt(el), w, h));
    });
  }
  function paintOf(document, el) {
    var _a;
    const cs = computedStyle(document, el);
    if (!cs) return null;
    const val = (prop) => resolveVars(document, (cs.getPropertyValue(prop) || "").trim());
    let fill = val("background-color");
    if (/^(transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\))$/.test(fill.replace(/\s+/g, " "))) fill = "";
    let gradient = null;
    const bgImage = val("background-image");
    const lg = bgImage.match(/linear-gradient\((.*)\)/);
    if (lg) {
      const parts = lg[1].split(/,(?![^(]*\))/).map((p) => p.trim());
      let angle = 180;
      if (/deg$/.test(parts[0])) angle = parseFloat(parts.shift());
      else if (/^to /.test(parts[0])) {
        const dir = parts.shift();
        angle = (_a = { "to top": 0, "to right": 90, "to bottom": 180, "to left": 270 }[dir]) != null ? _a : 180;
      }
      const stops = parts.map((p, i) => {
        const m = p.match(/^(.*?)(?:\s+([\d.]+)%)?$/);
        return { color: m[1], offset: m[2] !== void 0 ? parseFloat(m[2]) : i / Math.max(1, parts.length - 1) * 100 };
      });
      if (stops.length >= 2) gradient = { angle, stops };
    }
    const framerBorder = el.getAttribute("data-border") === "true";
    const borderW = framerBorder && parseFloat(val("--border-top-width")) || parseFloat(cs.borderTopWidth) || 0;
    let borderC = framerBorder && val("--border-color") || (parseFloat(cs.borderTopWidth) ? cs.borderTopColor : "");
    if (/^none$/.test(borderC)) borderC = "";
    const radius = parseFloat(cs.borderTopLeftRadius) || parseFloat(cs.borderRadius) || 0;
    if (!fill && !gradient && !(borderW && borderC)) return null;
    return { fill, gradient, borderW: borderC ? borderW : 0, borderC, radius };
  }
  function isArtworkImg(img) {
    return img.hasAttribute("data-excat-svg");
  }
  function overlap(a, b) {
    if (typeof a.getBoundingClientRect !== "function") return true;
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    if (!r1.width || !r2.width) return true;
    return r1.left < r2.right && r2.left < r1.right && r1.top < r2.bottom && r2.top < r1.bottom;
  }
  function artworkTile(document, img) {
    let best = null;
    let node = img.parentElement;
    for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
      if (node.tagName === "SECTION" || node.id === "main") break;
      if ((node.textContent || "").trim()) break;
      const imgs = [...node.querySelectorAll("img")];
      if (!imgs.length || imgs.length > 2 || !imgs.every(isArtworkImg) || node.querySelector("video")) break;
      if (imgs.length === 2 && !overlap(imgs[0], imgs[1])) break;
      let large = false;
      if (typeof node.getBoundingClientRect === "function") {
        const r = node.getBoundingClientRect();
        if (r.width > 700 || r.height > 700) break;
        large = r.width > 400 || r.height > 400;
      }
      const own = node.hasAttribute("data-excat-mask") ? null : paintOf(document, node);
      const layer = own ? null : [...node.children].find((c) => !c.querySelector("img") && paintOf(document, c));
      const paint = own || layer && paintOf(document, layer);
      const white = paint && !paint.gradient && /^(#fff(fff)?|white|rgb\(255, 255, 255\))$/i.test((paint.fill || "").trim());
      if (paint && !(large && (white || !paint.fill))) best = { tile: node, paint };
    }
    return best;
  }
  function rectIn(el, box) {
    if (!box || typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
  }
  function xmlEsc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function compositeTile(document, tile, paint) {
    const imgs = [...tile.querySelectorAll("img")].filter(isArtworkImg);
    const boxRect = typeof tile.getBoundingClientRect === "function" ? tile.getBoundingClientRect() : null;
    const box = boxRect && boxRect.width && boxRect.height ? boxRect : null;
    const sizes = imgs.map((i) => ({ w: parseFloat(i.getAttribute("width")) || 60, h: parseFloat(i.getAttribute("height")) || 60 }));
    const W = Math.round(box ? box.width : Math.max(90, ...sizes.map((s) => s.w * 1.6)));
    const H = Math.round(box ? box.height : Math.max(90, ...sizes.map((s) => s.h * 1.6)));
    const defs = [];
    let fill = paint.fill || "none";
    if (paint.gradient) {
      const a = (paint.gradient.angle - 90) * Math.PI / 180;
      const x1 = 50 - Math.cos(a) * 50;
      const y1 = 50 - Math.sin(a) * 50;
      defs.push(`<linearGradient id="g" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${(100 - x1).toFixed(1)}%" y2="${(100 - y1).toFixed(1)}%">${paint.gradient.stops.map((s) => `<stop offset="${s.offset}%" stop-color="${xmlEsc(s.color)}"/>`).join("")}</linearGradient>`);
      fill = "url(#g)";
    }
    const bw = paint.borderW || 0;
    const rect = `<rect x="${bw / 2}" y="${bw / 2}" width="${W - bw}" height="${H - bw}" rx="${paint.radius}" fill="${xmlEsc(fill)}"${bw ? ` stroke="${xmlEsc(paint.borderC)}" stroke-width="${bw}"` : ""}/>`;
    const parts = imgs.map((img, i) => {
      const r = rectIn(img, box) || { w: sizes[i].w, h: sizes[i].h, x: (W - sizes[i].w) / 2, y: (H - sizes[i].h) / 2 };
      return `<image href="${xmlEsc(img.getAttribute("src"))}" x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}"/>`;
    });
    const svg = `<svg xmlns="${SVG_NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${rect}${parts.join("")}</svg>`;
    const alt = imgs.map((i) => i.getAttribute("alt")).find(Boolean) || artworkAlt(tile);
    const out = artworkImg(document, svg, alt, W, H);
    out.setAttribute("data-excat-tile", "true");
    tile.replaceChildren(out);
  }
  function compositeArtworkTiles(document) {
    const root = document.querySelector("#main") || document.body;
    const done = /* @__PURE__ */ new Set();
    [...root.querySelectorAll("img[data-excat-svg]")].forEach((img) => {
      if (!img.isConnected || img.hasAttribute("data-excat-tile")) return;
      const found = artworkTile(document, img);
      if (!found || done.has(found.tile)) return;
      done.add(found.tile);
      compositeTile(document, found.tile, found.paint);
    });
  }
  function inlineSvgArtwork(document) {
    convertMaskVectors(document);
    convertBackgroundVectors(document);
    convertUseSprites(document);
    compositeArtworkTiles(document);
  }
  function stripAppearStyles(document) {
    document.querySelectorAll("[style]").forEach((el) => {
      const style = el.getAttribute("style") || "";
      const kept = style.split(";").map((d) => d.trim()).filter((d) => {
        if (!d) return false;
        const prop = d.split(":")[0].trim().toLowerCase();
        return !APPEAR_STYLE_PROPS.includes(prop);
      });
      if (kept.length) el.setAttribute("style", kept.join(";"));
      else el.removeAttribute("style");
    });
  }
  function isLetterSpan(el) {
    return el.tagName === "SPAN" && el.children.length === 0 && el.textContent.length > 0 && el.textContent.trim().length <= 1;
  }
  function isWordSpan(el) {
    if (el.tagName !== "SPAN" || el.children.length === 0) return false;
    if (![...el.children].every(isLetterSpan)) return false;
    return [...el.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim());
  }
  function joinedText(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return "";
    if (node.tagName === "BR") return " ";
    if (isWordSpan(node)) return [...node.children].map((c) => c.textContent).join("");
    return [...node.childNodes].map(joinedText).join("");
  }
  function normaliseSplitText(document) {
    const textEls = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li")];
    textEls.forEach((el) => {
      if (!el.isConnected) return;
      const letterSpans = [...el.querySelectorAll("span")].filter(isLetterSpan);
      const letterSplit = letterSpans.length >= 3;
      const brSplitHeading = /^H[1-6]$/.test(el.tagName) && el.querySelector("br") && !el.querySelector("em, i, a, img, picture, video");
      if (!letterSplit && !brSplitHeading) return;
      const text = collapse(joinedText(el));
      if (text) el.textContent = text;
    });
  }
  function applyContentFixes(document) {
    const statements = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((el) => /^The AO isn[’']t just a tournament/i.test(collapse(el.textContent)));
    if (statements.length) {
      const keep = statements.find((el) => /bold, inventive/i.test(el.textContent)) || statements[0];
      keep.textContent = WHO_WE_ARE_TEXT;
      statements.filter((el) => el !== keep).forEach((el) => {
        if (el.isConnected) el.remove();
      });
    }
    document.querySelectorAll("a").forEach((a) => {
      if (collapse(a.textContent).toLowerCase() !== "brand sound") return;
      const href = (a.getAttribute("href") || "").trim();
      if (/^(\.\/?|\/|https?:\/\/[^/]+\/?)?$/.test(href)) a.setAttribute("href", "/brand-sound");
    });
    const introHeading = document.querySelector("#intro h1, #intro h2");
    if (introHeading && !/feeling like no other/i.test(collapse(document.querySelector("#intro").textContent))) {
      const p = document.createElement("p");
      p.append("creates ");
      const em = document.createElement("em");
      em.textContent = "a feeling like no other.";
      p.append(em);
      introHeading.after(p);
    }
  }
  var HEADING_SEL = "h1, h2, h3, h4, h5, h6";
  function headingLevel(el) {
    return /^H([1-6])$/.test(el.tagName) ? Number(el.tagName[1]) : 0;
  }
  function retag(document, el, tag) {
    if (el.tagName.toLowerCase() === tag) return el;
    const out = document.createElement(tag);
    [...el.attributes].forEach((a) => out.setAttribute(a.name, a.value));
    while (el.firstChild) out.appendChild(el.firstChild);
    el.replaceWith(out);
    return out;
  }
  function authorableText(root) {
    return [...root.querySelectorAll(`${HEADING_SEL}, p`)].filter((el) => collapse(el.textContent) && !el.closest('a, button, [role="button"]'));
  }
  function sectionOf(el, root) {
    return el.closest("section") || el.closest("[id]:not(#main)") || root;
  }
  function normaliseHeadings(document) {
    const root = document.querySelector("#main") || document.body;
    if (!root) return;
    const texts = authorableText(root);
    const firstHeading = texts.find((el) => headingLevel(el));
    if (!firstHeading) return;
    const titleSection = sectionOf(firstHeading, root);
    const sectionTexts = texts.filter((el) => titleSection.contains(el));
    const sectionHeadings = sectionTexts.filter((el) => headingLevel(el));
    const top = Math.min(...sectionHeadings.map(headingLevel));
    const titleSrc = sectionHeadings.find((el) => headingLevel(el) === top);
    const lead = sectionTexts[sectionTexts.indexOf(titleSrc) + 1];
    root.querySelectorAll("h1").forEach((h) => {
      if (h !== titleSrc) retag(document, h, "h2");
    });
    retag(document, titleSrc, "h1");
    if (lead && headingLevel(lead)) retag(document, lead, "p");
    const wordsOf = (h) => {
      if (h.querySelector("em, i, a, img, picture, video")) return;
      const walker = document.createTreeWalker(h, 4);
      const words = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = collapse(n.textContent);
        if (t) words.push(t);
      }
      if (words.length > 1) h.textContent = words.join(" ");
    };
    const intro = document.querySelector("#intro");
    if (intro) {
      intro.querySelectorAll("h2").forEach(wordsOf);
      const introLine = [...intro.querySelectorAll("h3, h4, h5, h6")].find((h) => /^creates\b/i.test(collapse(h.textContent)));
      if (introLine) {
        const p = retag(document, introLine, "p");
        const span = p.querySelector("span");
        if (span && !p.querySelector("em")) {
          const em = document.createElement("em");
          em.textContent = collapse(span.textContent);
          span.replaceWith(em);
        }
      }
    }
    const oneBrand = document.querySelector("#onebrandsection");
    if (oneBrand) {
      const heads = [...oneBrand.querySelectorAll("h2, h3, h4")];
      const one = heads.find((h) => /^one\s*brand$/i.test(collapse(h.textContent)));
      const flex = heads.find((h) => /^infinite\s*flexibility$/i.test(collapse(h.textContent)));
      if (one && flex) {
        if (one.compareDocumentPosition(flex) & 2) one.after(flex);
        wordsOf(retag(document, one, "h2"));
        wordsOf(retag(document, flex, "h2"));
      }
    }
    document.querySelectorAll("#test h4").forEach((h) => {
      if (!/^every user of our brand/i.test(collapse(h.textContent))) return;
      const p = retag(document, h, "p");
      p.textContent = collapse(joinedText(p));
    });
  }
  function unwrapCode(document) {
    const root = document.querySelector("#main") || document.body;
    [...root.querySelectorAll("strong, b, em, i, span")].forEach((run) => {
      if (run.isConnected && !(run.textContent || "").trim() && run.querySelector("br") && !run.querySelector("img, svg, video")) {
        run.replaceWith(...run.childNodes);
      }
    });
    [...root.querySelectorAll("code")].forEach((code) => {
      if (code.closest("pre")) return;
      code.replaceWith(...code.childNodes);
    });
  }
  function scaleHeadings(document) {
    const root = document.querySelector("#main") || document.body;
    const heads = [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")];
    const done = /* @__PURE__ */ new Set();
    heads.forEach((h) => {
      if (done.has(h) || !h.isConnected) return;
      let row = h.parentElement;
      for (let i = 0; row && i < 4; i += 1, row = row.parentElement) {
        if (row.querySelectorAll("h1, h2, h3, h4, h5, h6").length >= 2) break;
      }
      if (!row || row.tagName === "SECTION") return;
      const pair = [...row.querySelectorAll("h1, h2, h3, h4, h5, h6")];
      if (pair.length !== 2 || row.querySelector("img, video, p")) return;
      const words = pair.map((x) => collapse(x.textContent));
      if (!words.every((w) => w && w.split(" ").length <= 2)) return;
      if (collapse(row.textContent).replace(/\s/g, "") !== words.join("").replace(/\s/g, "")) return;
      const kids = [...row.children];
      const a = kids.findIndex((k) => k.contains(pair[0]));
      const b = kids.findIndex((k) => k.contains(pair[1]));
      if (a === -1 || b - a < 2 || kids.slice(a + 1, b).some((k) => collapse(k.textContent))) return;
      const out = document.createElement("h2");
      const em = document.createElement("em");
      em.textContent = words[0];
      out.append(em, ` \u2194 ${words[1]}`);
      if (typeof row.getBoundingClientRect === "function" && row.parentElement) {
        const r = row.getBoundingClientRect();
        const p = row.parentElement.getBoundingClientRect();
        if (r.width && Math.abs((r.left + r.right) / 2 - (p.left + p.right) / 2) <= 24) out.style.textAlign = "center";
      }
      row.replaceWith(out);
      pair.forEach((x) => done.add(x));
    });
  }
  function pillButtons(document) {
    const root = document.querySelector("#main") || document.body;
    [...root.querySelectorAll("a[href]")].forEach((a) => {
      if (!a.isConnected || a.closest("header, nav, footer")) return;
      const label = collapse(a.textContent);
      if (!label || label.split(" ").length > 6 || typeof a.getBoundingClientRect !== "function") return;
      const cs = computedStyle(document, a);
      if (!cs) return;
      const r = a.getBoundingClientRect();
      const painted = !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor);
      if (!painted || parseFloat(cs.borderTopLeftRadius) < 15 || r.height < 40) return;
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      const link = document.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = label;
      strong.append(link);
      p.append(strong);
      a.replaceWith(p);
    });
  }
  function videosToLinks(document) {
    document.querySelectorAll("video").forEach((video) => {
      const src = video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src");
      if (!src) {
        video.remove();
        return;
      }
      const a = document.createElement("a");
      a.href = src;
      a.textContent = src;
      video.replaceWith(a);
    });
  }
  var LOCAL_VIDEOS = /* @__PURE__ */ new Set([
    "4QequgSrwRxIxv0x2ZsfEEVk",
    "4srbpIsRiWZgjXRIDLDI7dJ73s",
    "5LnEuzSwguGfyrcXwcPLY8tGYFo",
    "8bUmoGbGmZ",
    "Antwrj4fsO",
    "BAGRy8kLa8YMLhnVF0yFbKF2DaE",
    "CP4uCysfn9jVRsunEkJKG4mAtk",
    "FBGYx7bZZpHUicy8Z35JQjrfGU",
    "JZ9KbZznxjj8oMJcMuPCOMVgA4",
    "OXpgZq4kK7YREBavcJSkRgT6oA",
    "QkpZiBF48BdGmh7BMJW2FZ6MzE",
    "SVrKbxY8ugGVpoM6plnVrTTRDA",
    "UdhKApLyAO",
    "fu7jdgnxA9npvX5kNncRZ3ybUMo",
    "hbvxNXxfjscq4j4Yqs9IPhCGKY",
    "mfnuFZlPzAUS882VDLeF2YQEeZ8",
    "nqbIAM119Ro9qtWh7TYCDVimsOk",
    "phnQHIeonPJUJaPlsVPJv8pIBk",
    "ploPrlKSfuxa3A6bgpl5gbDBPCI",
    "qyckSGnnixoKJfwaHF1IT5Flr8",
    "wB01by0W41v3pxxg6a8ZKRI2o",
    "xhALKl34K2wmBQYzX4PUvZnvATo",
    "zgLKoIkVykTecHU7HxE8Nhf8uRo"
  ]);
  var VIDEO_URL = /^(?:https?:)?\/\/(?:framerusercontent\.com\/assets\/([^/?#]+)\.mp4|[^/]+\.supabase\.co\/storage\/v1\/object\/public\/files\/([^/?#]+)\/original)(?:[?#].*)?$/i;
  function localVideos(document) {
    document.querySelectorAll("a[href]").forEach((a) => {
      const m = (a.getAttribute("href") || "").match(VIDEO_URL);
      const id = m && (m[1] || m[2]);
      if (!id || !LOCAL_VIDEOS.has(id)) return;
      const local = `/videos/${id}.mp4`;
      if (a.textContent.trim() === a.getAttribute("href")) a.textContent = local;
      a.setAttribute("href", local);
    });
  }
  var FRAMER_IMAGE = /^(https?:)?\/\/framerusercontent\.com\/images\/[^?#]+\.(jpe?g|png|webp|gif)(\?[^#]*)?$/i;
  function capFramerImages(document) {
    document.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!FRAMER_IMAGE.test(src)) return;
      const base = src.split("?")[0];
      if (/\.gif$/i.test(base)) {
        if (img.closest("table")) img.setAttribute("src", `${base}?scale-down-to=1024`);
        return;
      }
      img.setAttribute("src", `${base}?scale-down-to=2048`);
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    });
    document.querySelectorAll("picture source").forEach((source) => source.remove());
  }
  function finalCleanup(document) {
    WebImporter.DOMUtils.remove(document.body || document, [
      "script",
      "style",
      "noscript",
      "link",
      "meta",
      "iframe#__framer-editorbar",
      "#svg-templates"
    ]);
    document.querySelectorAll('img[src^="data:"]').forEach((img) => {
      if ((img.getAttribute("src") || "").startsWith(SVG_DATA_PREFIX)) {
        img.removeAttribute("data-excat-svg");
        img.removeAttribute("data-excat-tile");
        return;
      }
      img.remove();
    });
    document.querySelectorAll("svg").forEach((svg) => {
      if (!svg.closest("table")) svg.remove();
    });
    document.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n === "data-excat-mask") {
          el.removeAttribute(n);
          return;
        }
        if (n.startsWith("data-excat-")) return;
        if (n.startsWith("data-framer") || n === "data-border" || n === "data-nosnippet") {
          el.removeAttribute(n);
        }
      });
    });
  }
  function transform(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      dedupeBreakpoints(document);
      inlineSvgArtwork(document);
      removeChrome(document);
      pillButtons(document);
      stripAppearStyles(document);
      unwrapCode(document);
      normaliseSplitText(document);
      applyContentFixes(document);
      normaliseHeadings(document);
      const template = payload && payload.template;
      if (!template || template.name !== "homepage") scaleHeadings(document);
    }
    if (hookName === "afterTransform") {
      videosToLinks(document);
      localVideos(document);
      capFramerImages(document);
      finalCleanup(document);
    }
  }

  // tools/importer/transformers/aobrandplaybook-sections.js
  var MARKER = "data-excat-section-id";
  var META_ATTR = "data-excat-section-meta";
  var BAND_COLOR_ATTR = "data-excat-band-color";
  var BAND_LAYER_ATTR = "data-excat-band-layer";
  var HOMEPAGE_NAV_META = {
    "#intro": { anchor: "intro", "nav-label": "Intro" },
    "#brand-positioning": { anchor: "brand-positioning", "nav-label": "Who we are" },
    "#brandvoice": { anchor: "brandvoice", "nav-label": "Brand values" },
    "#gamechangercomestolife": { anchor: "bringing-it-to-life", "nav-label": "How it comes to life" },
    "#summary": { anchor: "summary", "nav-label": "Toolkits" }
  };
  var PALETTE = [
    { style: "royal-blue", rgb: [30, 40, 134] },
    { style: "royal-blue", rgb: [33, 44, 144] },
    { style: "bright-blue", rgb: [0, 176, 255] },
    { style: "process-blue", rgb: [0, 145, 210] },
    { style: "navy", rgb: [0, 12, 61] },
    { style: "dark-navy", rgb: [15, 18, 66] },
    { style: "hits-different-blue", rgb: [0, 120, 255] },
    { style: "lime", rgb: [225, 255, 0] }
  ];
  function findBySelectors(document, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function precedes(a, b) {
    return !!(a.compareDocumentPosition(b) & 4) && !a.contains(b);
  }
  function sectionMeta(template, section) {
    const meta = {};
    if (section.style) meta.style = section.style;
    if (template && template.name === "homepage") {
      const list = Array.isArray(section.selector) ? section.selector : [section.selector];
      const key = list.find((s) => HOMEPAGE_NAV_META[s]);
      if (key) Object.assign(meta, HOMEPAGE_NAV_META[key]);
    }
    return meta;
  }
  function resolveMapped(document, sections) {
    const els = [];
    for (const section of sections) {
      const el = findBySelectors(document, section.selector);
      if (!el) return null;
      const prev = els[els.length - 1];
      if (prev && (!precedes(prev, el) || els.includes(el))) return null;
      els.push(el);
    }
    return els;
  }
  function idFamily(id) {
    return (id || "").replace(/-\d+$/, "");
  }
  function fullWidthFamilies(sections) {
    const families = /* @__PURE__ */ new Set();
    sections.forEach((s) => {
      if (!s.style || !/full-width/.test(s.style)) return;
      const list = Array.isArray(s.selector) ? s.selector : [s.selector];
      list.forEach((sel) => {
        const m = (sel || "").match(/#([A-Za-z][\w-]*)/);
        if (m) families.add(idFamily(m[1]));
      });
    });
    return families;
  }
  function isMediaOnly(el) {
    return !!el.querySelector("img, video, picture, source") && !(el.textContent || "").replace(/\s+/g, "").length;
  }
  function visibleRect(el) {
    if (typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 ? r : null;
  }
  function isMediaWithOverlay(el) {
    const media = [...el.querySelectorAll("video, img")].map(visibleRect).find((r) => r && r.width > 300);
    if (!media) return false;
    const texts = [...el.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((t) => (t.textContent || "").trim() && !t.parentElement.closest("h1, h2, h3, h4, h5, h6, p"));
    return texts.length > 0 && texts.every((t) => {
      const r = visibleRect(t);
      return r && r.left < media.right && media.left < r.right && r.top < media.bottom && media.top < r.bottom;
    });
  }
  function spansViewport(document, el, withVideo = false) {
    const view = document.defaultView;
    const vw = document.documentElement && document.documentElement.clientWidth;
    if (!view || !vw || typeof el.getBoundingClientRect !== "function") return null;
    const rects = [...el.querySelectorAll(withVideo ? "img, video" : "img")].map((img) => img.getBoundingClientRect()).filter((r) => r.width > 1 && r.height > 1);
    if (!rects.length) return null;
    const overlaps = rects.some((a, i) => rects.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2));
    if (overlaps) {
      const size = (r) => r.width * r.height;
      const base = rects.reduce((a, b) => size(b) > size(a) ? b : a);
      const inside = rects.every((r) => r === base || r.left >= base.left - 2 && r.right <= base.right + 2 && r.top >= base.top - 2 && r.bottom <= base.bottom + 2);
      return inside && base.left <= 2 && base.right >= vw - 2;
    }
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    return left <= 2 && right >= vw - 2;
  }
  function parseRgb(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m) return null;
    if (m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function gradientRgb(value) {
    if (!/linear-gradient/.test(value || "")) return null;
    const stops = (value.match(/rgba?\([^)]*\)/g) || []).map(parseRgb).filter(Boolean);
    return stops[0] || null;
  }
  function paletteStyle(rgb) {
    let best = null;
    PALETTE.forEach((p) => {
      const d = Math.hypot(rgb[0] - p.rgb[0], rgb[1] - p.rgb[1], rgb[2] - p.rgb[2]);
      if (d < 40 && (!best || d < best.d)) best = { d, style: p.style };
    });
    return best ? best.style : null;
  }
  function bandStyle(document, el, inherit = false) {
    const textured = parseRgb(el.getAttribute(BAND_COLOR_ATTR));
    if (textured) return paletteStyle(textured);
    const view = document.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    const hasText = !!(el.textContent || "").replace(/\s+/g, "").length;
    let node = el;
    for (let depth = 0; node && depth < 3; depth += 1) {
      let rgb = null;
      try {
        const cs = view.getComputedStyle(node);
        rgb = parseRgb(cs.backgroundColor) || (hasText ? gradientRgb(cs.backgroundImage) : null);
      } catch (e) {
        rgb = null;
      }
      if (rgb) return paletteStyle(rgb);
      node = node.children.length === 1 ? node.children[0] : null;
    }
    if (!inherit) return null;
    for (let n = el.parentElement; n && n.id !== "main" && n.tagName !== "BODY"; n = n.parentElement) {
      let rgb = null;
      try {
        rgb = parseRgb(view.getComputedStyle(n).backgroundColor);
      } catch (e) {
        rgb = null;
      }
      if (rgb) return paletteStyle(rgb);
    }
    return null;
  }
  var TEXT_SEL = "h1, h2, h3, h4, h5, h6, p, li";
  function isCenteredBand(document, el) {
    const view = document.defaultView;
    if (!view || typeof view.getComputedStyle !== "function" || typeof document.createRange !== "function" || typeof el.getBoundingClientRect !== "function") return false;
    const box = el.getBoundingClientRect();
    if (!box.width) return false;
    const cs = view.getComputedStyle(el);
    const left = box.left + (parseFloat(cs.paddingLeft) || 0);
    const right = box.right - (parseFloat(cs.paddingRight) || 0);
    const mid = (left + right) / 2;
    const items = [...el.querySelectorAll(TEXT_SEL)].filter((t) => (t.textContent || "").trim() && !t.parentElement.closest(TEXT_SEL)).map((t) => {
      const range = document.createRange();
      range.selectNodeContents(t);
      let align = "";
      try {
        align = view.getComputedStyle(t).textAlign;
      } catch (e) {
        align = "";
      }
      return { r: range.getBoundingClientRect(), end: /right|end/.test(align) };
    }).filter(({ r }) => r.width && r.height);
    const centred = items.filter(({ r }) => Math.abs((r.left + r.right) / 2 - mid) <= 24);
    const mirrored = (a) => items.some((b) => {
      if (b === a || a.end === b.end || a.r.top >= b.r.bottom || b.r.top >= a.r.bottom) return false;
      const [start, end] = a.end ? [b.r, a.r] : [a.r, b.r];
      return Math.abs(start.left - left - (right - end.right)) <= 24;
    });
    return centred.length > 0 && items.every((t) => centred.includes(t) || mirrored(t));
  }
  var DISPLAY_MIN = 80;
  function displayHeading(document, el) {
    const view = document.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    return [...el.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => {
      if (!(h.textContent || "").trim() || typeof h.getBoundingClientRect !== "function") return false;
      const r = h.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      try {
        return parseFloat(view.getComputedStyle(h).fontSize) >= DISPLAY_MIN;
      } catch (e) {
        return false;
      }
    }) || null;
  }
  function hasColourValues(el) {
    const t = (el.textContent || "").replace(/\s+/g, " ");
    return /HEX\s*#?[0-9a-f]{6}/i.test(t) && /RGB\s*\d/i.test(t);
  }
  function siblingBands(sectionsList) {
    const parents = new Set(sectionsList.map((s) => s.parentElement).filter(Boolean));
    const bands = [];
    parents.forEach((parent) => {
      [...parent.children].forEach((child) => {
        if (child.tagName === "SECTION" || child.querySelector("section")) return;
        if (/^(HEADER|NAV|FOOTER|SCRIPT|STYLE|HR)$/.test(child.tagName)) return;
        if (!(child.textContent || "").replace(/\s+/g, "").length) return;
        bands.push(child);
      });
    });
    return bands;
  }
  function resolveStructural(document, sections) {
    const root = document.querySelector("#main") || document.body;
    const outer = [...root.querySelectorAll("section")].filter((s) => !s.parentElement.closest("section")).filter((s) => !s.closest("header, nav, footer"));
    const all = [...outer, ...siblingBands(outer)].sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1);
    const families = fullWidthFamilies(sections);
    return all.map((el, i) => {
      const styles = [];
      const heroBand = i === 0 && (isMediaOnly(el) || isMediaWithOverlay(el));
      const band = bandStyle(document, el, !heroBand);
      if (band) styles.push(band);
      if (isMediaOnly(el)) {
        const family = !!(el.id && families.has(idFamily(el.id)));
        const hasVideo = !!el.querySelector("video");
        const spans = spansViewport(document, el, hasVideo);
        let full = false;
        if (spans === null) full = family;
        else full = hasVideo ? family && spans : spans;
        if (full) styles.push("full-width");
      }
      const centred = isCenteredBand(document, el);
      if (centred) styles.push("centered");
      if (i > 0 && displayHeading(document, el)) {
        if (centred) styles.push("intro");
        else if (hasColourValues(el)) styles.push("colour-feature");
      }
      const meta = {};
      if (styles.length) meta.style = styles.join(", ");
      return { el, meta, id: `structural-${i + 1}` };
    });
  }
  function insertBreaks(document, entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const { el, meta, id } = entries[i];
      const hasMeta = Object.keys(meta).length > 0;
      if (i === 0 && !hasMeta) continue;
      const hr = document.createElement("hr");
      if (hasMeta) {
        hr.setAttribute(MARKER, i === 0 ? `${id}:first` : id);
        hr.setAttribute(META_ATTR, JSON.stringify(meta));
      }
      el.before(hr);
    }
  }
  function transform2(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument || element;
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (hookName === "beforeTransform") {
      if (!sections.length) return;
      let entries;
      const mapped = resolveMapped(document, sections);
      if (mapped) {
        entries = mapped.map((el, i) => ({
          el,
          meta: sectionMeta(template, sections[i]),
          id: sections[i].id || `section-${i + 1}`
        }));
      } else {
        entries = resolveStructural(document, sections);
      }
      document.querySelectorAll(`[${BAND_LAYER_ATTR}]`).forEach((layer) => layer.remove());
      document.querySelectorAll(`[${BAND_COLOR_ATTR}]`).forEach((band) => band.removeAttribute(BAND_COLOR_ATTR));
      if (entries.length < 2 && !(entries[0] && Object.keys(entries[0].meta).length)) return;
      insertBreaks(document, entries);
    }
    if (hookName === "afterTransform") {
      const markers = [...document.querySelectorAll(`hr[${MARKER}]`)].reverse();
      markers.forEach((hr) => {
        const isFirst = /:first$/.test(hr.getAttribute(MARKER) || "");
        let meta = {};
        try {
          meta = JSON.parse(hr.getAttribute(META_ATTR) || "{}");
        } catch (e) {
          meta = {};
        }
        if (Object.keys(meta).length) {
          const block = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: meta
          });
          hr.after(block);
        }
        hr.removeAttribute(MARKER);
        hr.removeAttribute(META_ATTR);
        if (isFirst) hr.remove();
      });
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-slideshow": parse,
    "carousel-stack": parse2,
    "accordion-photo": parse3,
    "hero-scrollvideo": parse4,
    "cards-mosaic": parse5,
    "columns-tiles": parse6,
    "cards-linklist": parse7
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();

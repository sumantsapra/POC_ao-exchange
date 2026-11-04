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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-sub-brand-guide.js
  var import_sub_brand_guide_exports = {};
  __export(import_sub_brand_guide_exports, {
    default: () => import_sub_brand_guide_default
  });

  // tools/importer/parsers/hero-banner.js
  var SHORT_MAX = 700;
  function textOf(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function rectOf(el) {
    if (typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    return r.width && r.height ? r : null;
  }
  function overlaps(a, b) {
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  }
  function overlayTexts(element) {
    const band = element.closest("section");
    if (!band) return [];
    const media = rectOf(element) || rectOf(band);
    if (!media) return [];
    return [...band.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((t) => !element.contains(t) && !t.parentElement.closest("h1, h2, h3, h4, h5, h6, p")).filter((t) => textOf(t)).filter((t) => {
      const r = rectOf(t);
      return r && overlaps(r, media);
    });
  }
  function removeWithWrappers(node, band) {
    let n = node;
    while (n.parentElement && n.parentElement !== band && n.parentElement.children.length === 1) n = n.parentElement;
    n.remove();
  }
  function parse(element, { document: document2 }) {
    const media = [];
    const video = element.querySelector("video");
    let src = "";
    if (video) {
      src = video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src") || "";
    }
    if (!src) {
      const link = [...element.querySelectorAll("a[href]")].find((a) => /\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute("href")));
      if (link) src = link.getAttribute("href");
    }
    const posterUrl = video && video.getAttribute("poster");
    const firstImg = [...element.querySelectorAll("img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
    if (posterUrl || firstImg) {
      const img = document2.createElement("img");
      img.src = posterUrl || imgSrc(firstImg);
      img.alt = firstImg && firstImg.getAttribute("alt") || "";
      media.push(img);
    }
    if (src) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = src;
      p.append(a);
      media.push(p);
    }
    const cells = [[media]];
    const band = element.closest("section");
    const bandRect = band && rectOf(band);
    const options = [];
    if (bandRect && bandRect.height < SHORT_MAX) options.push("short");
    const text = [];
    const sources = [
      ...[...element.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((node) => !node.parentElement.closest("h1, h2, h3, h4, h5, h6, p")),
      ...overlayTexts(element)
    ];
    sources.forEach((node) => {
      const t = textOf(node);
      if (!t) return;
      const el = document2.createElement(node.tagName.toLowerCase());
      el.textContent = t;
      text.push(el);
      if (!element.contains(node) && band) removeWithWrappers(node, band);
    });
    if (text.length) cells.push([text]);
    const name = options.length ? `hero-banner (${options.join(", ")})` : "hero-banner";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-autoplay.js
  function imgSrc2(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function isWide(video) {
    if (!video || typeof video.getBoundingClientRect !== "function") return false;
    const w = video.videoWidth || parseFloat(video.getAttribute("data-excat-video-width")) || 0;
    const h = video.videoHeight || parseFloat(video.getAttribute("data-excat-video-height")) || 0;
    if (!w || !h || Math.abs(w / h - 2) > 0.12) return false;
    const r = video.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (!video.videoWidth && Math.round(r.height) <= 150) return true;
    return Math.abs(r.width / r.height - w / h) <= 0.05;
  }
  function parse2(element, { document: document2 }) {
    const video = element.querySelector("video");
    let src = "";
    if (video) {
      src = video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src") || "";
    }
    if (!src) {
      const link = [...element.querySelectorAll("a[href]")].find((a) => /\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute("href")));
      if (link) src = link.getAttribute("href");
    }
    const cell = [];
    const posterUrl = video && video.getAttribute("poster");
    const posterImg = [...element.querySelectorAll("img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
    if (posterUrl || posterImg) {
      const img = document2.createElement("img");
      img.src = posterUrl || imgSrc2(posterImg);
      img.alt = posterImg && posterImg.getAttribute("alt") || "";
      cell.push(img);
    }
    if (src) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = src;
      p.append(a);
      cell.push(p);
    }
    const cells = [[cell]];
    const options = [];
    if (isWide(video)) options.push("wide");
    if (video && !video.hasAttribute("muted") && video.getAttribute("data-excat-video-audio") === "true") {
      options.push("sound");
    }
    const name = options.length ? `video-autoplay (${options.join(", ")})` : "video-autoplay";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logo.js
  var AO_COLOURS = [
    ["White", [255, 255, 255]],
    ["Process Blue", [0, 145, 210]],
    ["Royal Blue", [30, 40, 134]],
    ["Hits Different Blue", [0, 120, 255]],
    ["Navy", [0, 12, 60]],
    ["Dark Navy", [15, 18, 66]],
    ["Bright Blue", [0, 225, 255]],
    ["Lime", [225, 255, 0]],
    ["Sky Blue", [128, 217, 255]],
    ["Stone", [235, 232, 229]]
  ];
  function parseRgb(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function paintOf(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return parseRgb(view.getComputedStyle(el).backgroundColor);
    } catch (e) {
      return null;
    }
  }
  var isWhitish = (rgb) => rgb.every((c) => c >= 245);
  function colourName(rgb) {
    let best = null;
    AO_COLOURS.forEach(([name, ref]) => {
      const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
      if (d <= 8 && (!best || d < best.d)) best = { d, name };
    });
    return best ? best.name : `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  function bandOf(el) {
    let band = el.closest("section");
    while (band && band.parentElement && band.parentElement.closest("section")) {
      band = band.parentElement.closest("section");
    }
    return band;
  }
  function sectionStyles(el) {
    const doc = el.ownerDocument;
    const before = [...doc.querySelectorAll("hr")].filter((hr2) => hr2.compareDocumentPosition(el) & 4);
    const hr = before[before.length - 1];
    if (!hr) return [];
    try {
      const meta = JSON.parse(hr.getAttribute("data-excat-section-meta") || "{}");
      return (meta.style || "").split(",").map((s) => s.trim()).filter(Boolean);
    } catch (e) {
      return [];
    }
  }
  var slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  function isArtworkPaint(n, img) {
    const view = n.ownerDocument.defaultView;
    try {
      const cs = view.getComputedStyle(n);
      const mask = cs.getPropertyValue("mask-image") || cs.getPropertyValue("-webkit-mask-image") || "none";
      if (mask && mask !== "none") return true;
    } catch (e) {
    }
    if (typeof n.getBoundingClientRect !== "function") return false;
    const a = n.getBoundingClientRect();
    const b = img.getBoundingClientRect();
    return a.width > 0 && b.width > 0 && a.width <= b.width + 2 && a.height <= b.height + 2;
  }
  function tileColour(img, tile) {
    const band = bandOf(img);
    for (let n = img.parentElement; n && n.nodeType === 1; n = n.parentElement) {
      const rgb = paintOf(n);
      if (rgb && isArtworkPaint(n, img)) continue;
      if (rgb) {
        if (isWhitish(rgb)) return "";
        const name = colourName(rgb);
        if (n === tile || tile.contains(n)) return name;
        if (band && n === band) return "";
        if (sectionStyles(img).includes(slug(name))) return "None";
        return name;
      }
    }
    return "";
  }
  function textOf2(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc3(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function tileOf(img, root) {
    let node = img;
    while (node.parentElement && node.parentElement !== root && node.parentElement.querySelectorAll('img:not([src^="data:"]), img[src^="data:image/svg+xml"]').length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function parse3(element, { document: document2 }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll("img").forEach((source) => {
      const src = imgSrc3(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return;
      seen.add(src);
      const img = document2.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      const tile = tileOf(source, element);
      const label = textOf2(tile);
      const colour = tileColour(source, tile);
      const textCell2 = [];
      if (label) {
        const p = document2.createElement("p");
        p.textContent = label;
        textCell2.push(p);
      }
      if (colour) {
        const p = document2.createElement("p");
        p.textContent = `Background: ${colour}`;
        textCell2.push(p);
      }
      cells.push([img, textCell2.length ? textCell2 : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-logo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tone.js
  function textOf3(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var TEXT = "p, h1, h2, h3, h4, h5, h6";
  var withText = (el) => [...el.children].filter((c) => textOf3(c));
  function linesOf(tile) {
    const lines = [...tile.querySelectorAll(TEXT)].filter((n) => !n.parentElement.closest(TEXT)).map(textOf3).filter(Boolean);
    return lines.length ? lines : [textOf3(tile)].filter(Boolean);
  }
  function parse4(element, { document: document2 }) {
    let grid = element;
    while (withText(grid).length === 1 && withText(withText(grid)[0]).length >= 1 && !/^(P|H[1-6])$/.test(withText(grid)[0].tagName)) {
      [grid] = withText(grid);
    }
    let tiles = withText(grid);
    if (!tiles.length) tiles = [grid];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      const lines = linesOf(tile);
      const key = lines.join(" / ").toLowerCase();
      if (!lines.length || seen.has(key)) return;
      seen.add(key);
      const cell = lines.map((line) => {
        const p = document2.createElement("p");
        p.textContent = line;
        return p;
      });
      cells.push([cell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-tone", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-typeface.js
  function textOf4(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  var WEIGHT_RE = /^(bold|black|heavy|semibold|semi-bold|extrabold|extra-bold)$/i;
  var GLYPH_RE = /\d{3,}\s*[^\sA-Za-z\d]{0,3}\s*[&%#@$!?*]|(?:[\u3400-\u9fff]\s*){4,}/;
  var GLYPH_RE_G = new RegExp(GLYPH_RE.source, "g");
  var isSpecimen = (el) => GLYPH_RE.test(el.textContent || "");
  var glyphCount = (el) => ((el.textContent || "").match(GLYPH_RE_G) || []).length;
  function rowsOf(el) {
    if (glyphCount(el) <= 1) return [el];
    const parts = [...el.children].filter((c) => textOf4(c) && isSpecimen(c));
    if (!parts.length) return [el];
    return parts.flatMap(rowsOf);
  }
  function linesOf2(p) {
    const clone = p.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    clone.querySelectorAll("strong, b").forEach((s) => {
      const next = s.nextSibling;
      if (next && next.nodeType === 3 && /^[^\s,.;:!?]/.test(next.textContent)) s.after("\n");
    });
    return clone.textContent.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  }
  function specimenParagraph(document2, line) {
    const p = document2.createElement("p");
    const words = line.split(" ");
    if (words.length > 1 && words.some((w) => WEIGHT_RE.test(w))) {
      words.forEach((w, i) => {
        if (i) p.append(" ");
        if (WEIGHT_RE.test(w)) {
          const strong = document2.createElement("strong");
          strong.textContent = w;
          p.append(strong);
        } else p.append(w);
      });
    } else p.textContent = line;
    return p;
  }
  function textGroupOf(heading, root) {
    let node = heading;
    while (node.parentElement && node.parentElement !== root && !isSpecimen(node.parentElement)) {
      node = node.parentElement;
    }
    return node;
  }
  function buildRow(document2, source) {
    const heading = [...source.querySelectorAll(HEADINGS)].find((h) => textOf4(h));
    let textGroup = heading ? textGroupOf(heading, source) : null;
    if (!textGroup) {
      const halves = [...source.children].filter((c) => textOf4(c));
      const other = halves.length === 2 ? halves.find((c) => !isSpecimen(c)) : null;
      if (other && /[a-z]{3,}/i.test(textOf4(other)) && textOf4(other).split(" ").length >= 6) textGroup = other;
    }
    const specimen = [];
    source.querySelectorAll("p").forEach((p) => {
      if (textGroup && textGroup.contains(p)) return;
      if (p.parentElement.closest("p")) return;
      linesOf2(p).forEach((line) => specimen.push(specimenParagraph(document2, line)));
    });
    const copy = [];
    if (textGroup) {
      textGroup.querySelectorAll(`${HEADINGS}, p`).forEach((node) => {
        if (node.parentElement.closest(`${HEADINGS}, p`)) return;
        const t = textOf4(node);
        if (!t) return;
        const el = document2.createElement(node.tagName.toLowerCase());
        el.textContent = t;
        copy.push(el);
      });
    }
    const glyphAt = specimen.findIndex((p) => GLYPH_RE.test(p.textContent));
    if (glyphAt >= 2) {
      const name = specimen[0];
      specimen.slice(1, glyphAt).forEach((p) => {
        name.append(document2.createElement("br"), ...p.childNodes);
      });
      specimen.splice(1, glyphAt - 1);
    }
    return [specimen.length ? specimen : "", copy.length ? copy : ""];
  }
  function parse5(element, { document: document2 }) {
    const sources = [element];
    let anchor = element;
    while (!(anchor.nextElementSibling && isSpecimen(anchor.nextElementSibling)) && anchor.parentElement && [...anchor.parentElement.children].filter((c) => textOf4(c)).length === 1) {
      anchor = anchor.parentElement;
    }
    let next = anchor.nextElementSibling;
    const siblings = [];
    while (next && isSpecimen(next)) {
      siblings.push(next);
      sources.push(...rowsOf(next));
      next = next.nextElementSibling;
    }
    const cells = sources.map((s) => buildRow(document2, s));
    siblings.forEach((s) => s.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-typeface", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-swatch.js
  function textOf5(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc4(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var HEADINGS2 = "h1, h2, h3, h4, h5, h6";
  var isLabel = (t) => /^(hex|rgb|cmyk|pms|pantone|ral)\s*:?$/i.test(t);
  var isNoise = (t) => /^copy( hex| to clipboard)?$/i.test(t);
  function tileOf2(heading, root) {
    let node = heading;
    while (node.parentElement && node.parentElement !== root && node.parentElement.querySelectorAll(HEADINGS2).length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function parse6(element, { document: document2 }) {
    const headings2 = [...element.querySelectorAll(HEADINGS2)].filter((h) => textOf5(h) && !isNoise(textOf5(h)));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const tiles = [];
    const notes = [];
    const addNote = (t) => {
      if (!notes.includes(t)) notes.push(t);
    };
    headings2.forEach((heading) => {
      const tile = tileOf2(heading, element);
      tiles.push(tile);
      const name = textOf5(heading);
      const texts3 = [...tile.querySelectorAll("p")].filter((p) => !p.closest("button")).map((p) => textOf5(p)).filter((t) => t && !isNoise(t) && t !== name);
      const values = [];
      for (let i = 0; i < texts3.length; i += 1) {
        const t = texts3[i];
        const inline = t.match(/^(hex|rgb|cmyk|pms|pantone|ral)\s*:\s*(.+)$/i);
        if (inline) {
          values.push(`${inline[1]}: ${inline[2]}`);
        } else if (isLabel(t) && texts3[i + 1] && !isLabel(texts3[i + 1])) {
          values.push(`${t.replace(/\s*:?$/, "")}: ${texts3[i + 1]}`);
          i += 1;
        } else if (t.split(" ").length > 3) {
          addNote(t);
        }
      }
      const key = `${name}|${values.join("|")}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = [];
      const img = [...tile.querySelectorAll("img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
      if (img) {
        const pic = document2.createElement("img");
        pic.src = imgSrc4(img);
        pic.alt = img.getAttribute("alt") || name;
        imageCell.push(pic);
      }
      const textCell2 = [];
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      textCell2.push(h3);
      values.forEach((v) => {
        const p = document2.createElement("p");
        p.textContent = v;
        textCell2.push(p);
      });
      cells.push([imageCell.length ? imageCell : "", textCell2]);
    });
    [...element.querySelectorAll("p")].filter((p) => textOf5(p) && !isNoise(textOf5(p)) && !p.closest("button")).filter((p) => !tiles.some((t) => t.contains(p))).forEach((p) => addNote(textOf5(p)));
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-swatch", cells });
    element.replaceWith(block);
    let anchor = block;
    notes.forEach((note) => {
      const p = document2.createElement("p");
      p.textContent = note;
      anchor.after(p);
      anchor = p;
    });
  }

  // tools/importer/parsers/cards-contrast.js
  function textOf6(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function captionPair(p) {
    const strongs = [...p.querySelectorAll("strong, b")].map(textOf6).filter(Boolean);
    if (strongs.length >= 2) return [strongs[0], strongs[1]];
    const m = textOf6(p).match(/background\s*:?\s*(.+?)\s*text\s*:?\s*(.+)$/i);
    return m ? [m[1], m[2]] : null;
  }
  function captionLine(document2, label, value) {
    const p = document2.createElement("p");
    p.append(`${label}: `);
    const strong = document2.createElement("strong");
    strong.textContent = value;
    p.append(strong);
    return p;
  }
  var isContentImg = (img) => {
    const src = img.getAttribute("src") || "";
    return !!src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
  };
  var contentImgs = (el) => [...el.querySelectorAll("img")].filter(isContentImg);
  function cssColour(value) {
    let v = (value || "").trim();
    for (let i = 0; i < 5 && /var\(/.test(v); i += 1) {
      v = v.replace(/var\(\s*--[\w-]+\s*,\s*((?:[^()]|\([^()]*\))*)\)/g, "$1").replace(/var\(\s*--[\w-]+\s*\)/g, "");
    }
    v = v.trim();
    return !v || /^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/.test(v) ? "" : v;
  }
  function tileBackground(document2, tile) {
    const view = document2.defaultView;
    for (let n = tile; n; n = n.children.length === 1 ? n.children[0] : null) {
      let bg = "";
      try {
        bg = cssColour(view.getComputedStyle(n).backgroundColor);
      } catch (e) {
        bg = "";
      }
      if (!bg) bg = cssColour(((n.getAttribute("style") || "").match(/background(?:-color)?\s*:\s*([^;]+)/) || [])[1]);
      if (bg) return bg;
    }
    return "";
  }
  function rectOf2(el) {
    if (typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    return r.width && r.height ? r : null;
  }
  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin);
  }
  function tileImage(document2, tile) {
    const imgs = contentImgs(tile);
    if (imgs.length === 1 && imgs[0].hasAttribute("data-excat-tile")) {
      const img = document2.createElement("img");
      img.src = imgs[0].getAttribute("src");
      img.alt = imgs[0].getAttribute("alt") || "";
      return img;
    }
    const box = rectOf2(tile);
    const W = Math.round(box ? box.width : 90);
    const H = Math.round(box ? box.height : 90);
    const bg = tileBackground(document2, tile);
    const parts = imgs.map((img) => {
      const r = rectOf2(img);
      const w = r ? r.width : parseFloat(img.getAttribute("width")) || W / 2;
      const h = r ? r.height : parseFloat(img.getAttribute("height")) || H / 2;
      const x = r && box ? r.left - box.left : (W - w) / 2;
      const y = r && box ? r.top - box.top : (H - h) / 2;
      return `<image href="${esc(img.getAttribute("src"))}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg ? `<rect width="${W}" height="${H}" fill="${esc(bg)}"/>` : ""}${parts.join("")}</svg>`;
    const out = document2.createElement("img");
    out.src = `data:image/svg+xml;base64,${toBase64(svg)}`;
    out.alt = imgs.map((i) => i.getAttribute("alt") || "").find(Boolean) || "";
    return out;
  }
  function imageTiles(element) {
    let grid = element;
    for (; ; ) {
      const kids = [...grid.children].filter((c) => contentImgs(c).length);
      if (kids.length !== 1 || contentImgs(kids[0]).length <= 2) break;
      [grid] = kids;
    }
    return [...grid.children].filter((c) => contentImgs(c).length);
  }
  function parse7(element, { document: document2 }) {
    const paras = [...element.querySelectorAll("p, h1, h2, h3, h4, h5, h6")].filter((p) => textOf6(p));
    const cells = [];
    if (!paras.some((p) => /^background/i.test(textOf6(p))) && contentImgs(element).length) {
      imageTiles(element).forEach((tile) => cells.push([[tileImage(document2, tile)]]));
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "cards-contrast", cells });
      element.replaceWith(block2);
      return;
    }
    paras.forEach((p, i) => {
      if (!/^background/i.test(textOf6(p))) return;
      const pair = captionPair(p);
      if (!pair) return;
      const prev = paras[i - 1];
      const sample = prev && !/^background/i.test(textOf6(prev)) && textOf6(prev).length <= 4 ? textOf6(prev) : "Aa";
      const sampleP = document2.createElement("p");
      sampleP.textContent = sample;
      cells.push([[sampleP, captionLine(document2, "Background", pair[0]), captionLine(document2, "Text", pair[1])]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contrast", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-shape.js
  function textOf7(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc5(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var CONTENT_IMG = 'img:not([src^="data:"]), img[src^="data:image/svg+xml"]';
  var HEADING = "h1, h2, h3, h4, h5, h6";
  function tileOf3(img, root) {
    let node = img;
    while (node.parentElement && node.parentElement !== root && node.parentElement.querySelectorAll(CONTENT_IMG).length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function rectOf3(el) {
    if (!el || typeof el.getBoundingClientRect !== "function") return null;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 ? r : null;
  }
  function styleOf(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return view.getComputedStyle(el);
    } catch (e) {
      return null;
    }
  }
  function rgbOf(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [m[1], m[2], m[3]].map((c) => parseInt(c, 10));
  }
  var luminance = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  function backdropOf(element, imgs) {
    const box = rectOf3(element);
    if (!box || imgs.length < 3) return null;
    return imgs.find((img) => {
      const r = rectOf3(img);
      return r && r.width * r.height >= 0.9 * box.width * box.height;
    }) || null;
  }
  function halfGroupOf(element) {
    let group = element;
    while (group.parentElement && group.parentElement.tagName !== "SECTION" && group.parentElement.querySelectorAll(HEADING).length <= element.querySelectorAll(HEADING).length + 1 && group.parentElement.querySelectorAll(CONTENT_IMG).length === element.querySelectorAll(CONTENT_IMG).length) {
      group = group.parentElement;
    }
    if (group === element) return null;
    const heads = [...group.querySelectorAll(HEADING)].filter((h) => !element.contains(h) && textOf7(h));
    if (heads.length !== 1) return null;
    const row = group.parentElement;
    const g = rectOf3(group);
    const r = rectOf3(row);
    if (!g || !r || g.width > 0.6 * r.width) return null;
    const sibling = [...row.children].some((c) => {
      if (c === group) return false;
      const cr = rectOf3(c);
      return cr && Math.abs(cr.top - g.top) < 4 && c.querySelector(HEADING) && c.querySelector(CONTENT_IMG);
    });
    if (!sibling) return null;
    const caption = [...group.querySelectorAll("p")].filter((p) => !element.contains(p) && !p.parentElement.closest("p") && textOf7(p));
    return { group, heading: heads[0], caption };
  }
  function layoutOf(imgs) {
    const rects = imgs.map(rectOf3).filter(Boolean);
    if (!rects.length) return null;
    const widths = rects.map((r) => r.width).sort((a, b) => a - b);
    const top = Math.min(...rects.map((r) => r.top));
    const firstRow = rects.filter((r) => r.top < top + Math.min(...rects.map((x) => x.height)) * 0.8);
    return {
      median: widths[Math.floor(widths.length / 2)],
      min: widths[0],
      max: widths[widths.length - 1],
      cols: firstRow.length,
      left: Math.min(...firstRow.map((r) => r.left))
    };
  }
  function isFramed(element) {
    for (let n = element, d = 0; n && d < 3 && n.tagName !== "SECTION"; n = n.parentElement, d += 1) {
      const outer = rgbOf((styleOf(n) || {}).backgroundColor);
      if (!outer || luminance(outer) < 0.9) continue;
      const inner = [...n.children].find((c) => {
        const rgb = rgbOf((styleOf(c) || {}).backgroundColor);
        return rgb && luminance(rgb) < 0.3;
      });
      if (inner) return true;
    }
    return false;
  }
  function onLightCard(element) {
    for (let n = element, d = 0; n && d < 4 && n.tagName !== "SECTION"; n = n.parentElement, d += 1) {
      const rgb = rgbOf((styleOf(n) || {}).backgroundColor);
      if (rgb && luminance(rgb) >= 0.9) return true;
    }
    return false;
  }
  function parse8(element, { document: document2 }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const sources = [...element.querySelectorAll("img")].filter((source) => {
      const src = imgSrc5(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
    const backdrop = backdropOf(element, sources);
    const half = halfGroupOf(element);
    const options = [];
    if (half) {
      const h = document2.createElement(half.heading.tagName.toLowerCase());
      h.textContent = textOf7(half.heading);
      cells.push([h]);
      options.push("half");
    }
    const tiles = [];
    const artworks = [];
    sources.forEach((source) => {
      const img = document2.createElement("img");
      img.src = imgSrc5(source);
      img.alt = source.getAttribute("alt") || "";
      if (source === backdrop) {
        const line = document2.createElement("p");
        line.textContent = "Backdrop";
        cells.push([img, line]);
        return;
      }
      const tile = tileOf3(source, element);
      tiles.push(tile);
      artworks.push(source);
      const name2 = textOf7(tile);
      let textCell2 = "";
      if (name2) {
        textCell2 = document2.createElement("p");
        textCell2.textContent = name2;
      }
      cells.push([img, textCell2]);
    });
    if (half && half.caption.length) {
      cells.push([half.caption.map((p) => {
        const out = document2.createElement("p");
        out.textContent = textOf7(p);
        return out;
      })]);
    }
    if (!half && !backdrop) {
      const layout = layoutOf(artworks);
      const box = rectOf3(element);
      const leftAligned = !!(layout && box && Math.abs(layout.left - box.left) <= 2);
      if (layout && layout.cols === 4 && layout.median >= 120 && leftAligned && !isFramed(element)) options.push("logos");
      else if (isFramed(element)) options.push("framed");
      else if (layout && layout.cols === 5 && layout.min >= 150 && layout.max - layout.min <= 2 && onLightCard(element)) options.push("stickers");
    }
    if (half) {
      half.heading.remove();
      half.caption.forEach((p) => p.remove());
    }
    const name = options.length ? `cards-shape (${options.join(", ")})` : "cards-shape";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-panel.js
  function imgSrc6(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function parseRgb2(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function panelVariant(element, imgs) {
    const view = element.ownerDocument && element.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function" || !imgs.length) return "";
    let common = imgs[0].parentElement;
    while (common && !imgs.every((i) => common.contains(i))) common = common.parentElement;
    for (let n = common; n && n.nodeType === 1; n = n.parentElement) {
      if (n.tagName === "SECTION" || n.tagName === "MAIN" || n.tagName === "BODY") return "transparent";
      let rgb = null;
      try {
        rgb = parseRgb2(view.getComputedStyle(n).backgroundColor);
      } catch (e) {
        rgb = null;
      }
      if (rgb) {
        if (Math.hypot(rgb[0], rgb[1] - 120, rgb[2] - 255) < 30) return "hits-different-blue";
        if (rgb.every((c) => c >= 250)) return "white";
        const vector = imgs.some((i) => /^data:image\/svg\+xml|\.svg(\?|$)/.test(i.getAttribute("src") || ""));
        if (!vector && rgb.every((c) => c >= 240)) return "white";
        return "";
      }
      if (n.getAttribute("data-border") === "true") return "";
    }
    return "";
  }
  function parse9(element, { document: document2 }) {
    const row = [];
    const seen = /* @__PURE__ */ new Set();
    const sources = [];
    element.querySelectorAll("img").forEach((source) => {
      const src = imgSrc6(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return;
      seen.add(src);
      sources.push(source);
      const img = document2.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      row.push(img);
    });
    const cells = [row.length ? row : [""]];
    const variant = panelVariant(element, sources);
    const name = variant ? `columns-panel (${variant})` : "columns-panel";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-photos.js
  function imgSrc7(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var KEYWORDS = { 0: { x: "left", y: "top" }, 50: { x: "center", y: "center" }, 100: { x: "right", y: "bottom" } };
  function percent(v) {
    const t = (v || "").trim().toLowerCase();
    if (t === "left" || t === "top") return 0;
    if (t === "center") return 50;
    if (t === "right" || t === "bottom") return 100;
    const m = t.match(/^(-?[\d.]+)%$/);
    return m ? parseFloat(m[1]) : null;
  }
  function positionOf(img) {
    const style = img.getAttribute("style") || "";
    const m = style.match(/object-position\s*:\s*([^;]+)/i);
    if (!m) return "";
    let parts = m[1].trim().toLowerCase().split(/\s+/);
    if (parts.length === 1) parts = /^(top|bottom)$/.test(parts[0]) ? ["center", parts[0]] : [parts[0], "center"];
    if (/^(top|bottom)$/.test(parts[0]) || /^(left|right)$/.test(parts[1])) parts = [parts[1], parts[0]];
    const [x, y] = parts.map(percent);
    if (x === null || y === null) return m[1].trim();
    if (x === 50 && y === 50) return "";
    const kx = KEYWORDS[x] && KEYWORDS[x].x;
    const ky = KEYWORDS[y] && KEYWORDS[y].y;
    if (kx && ky) return [ky === "center" ? "" : ky, kx === "center" ? "" : kx].filter(Boolean).join(" ");
    return `${x}% ${y}%`;
  }
  function videoSrc(video) {
    return video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src") || "";
  }
  function mediaColumns(element) {
    if (!element.querySelector("video")) return null;
    const hasMedia = (el) => !!el.querySelector("img, video") || /^(IMG|VIDEO)$/.test(el.tagName);
    const cols = [...element.children].filter(hasMedia);
    return cols.length >= 2 ? cols : null;
  }
  function cellOf(document2, source, seen) {
    if (source.tagName === "VIDEO") {
      const src2 = videoSrc(source);
      if (!src2 || seen.has(src2)) return null;
      seen.add(src2);
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = src2;
      a.textContent = src2;
      p.append(a);
      return p;
    }
    const src = imgSrc7(source);
    if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return null;
    seen.add(src);
    const img = document2.createElement("img");
    img.src = src;
    img.alt = source.getAttribute("alt") || "";
    const position = positionOf(source);
    if (!position) return img;
    const line = document2.createElement("p");
    line.textContent = `Position: ${position}`;
    return [img, line];
  }
  function parse10(element, { document: document2 }) {
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    const columns = mediaColumns(element);
    if (columns) {
      const stacks = columns.map((col) => [...col.querySelectorAll("img, video")].map((m) => cellOf(document2, m, seen)).filter(Boolean));
      const rows = Math.max(...stacks.map((st) => st.length));
      for (let r = 0; r < rows; r += 1) cells.push(stacks.map((st) => st[r] || ""));
    } else {
      const photos = [...element.querySelectorAll("img")].map((m) => cellOf(document2, m, seen)).filter(Boolean);
      let perRow = photos.length;
      if (photos.length === 4) perRow = 2;
      else if (photos.length > 4) perRow = 3;
      for (let i = 0; i < photos.length; i += perRow) {
        const row = photos.slice(i, i + perRow);
        while (row.length < perRow) row.push("");
        cells.push(row);
      }
    }
    if (!cells.length) cells.push([""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-photos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-framed.js
  function textOf8(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc8(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var HEADINGS3 = "h1, h2, h3, h4, h5, h6";
  var TEXT2 = `p, li, ${HEADINGS3}`;
  var isContentImg2 = (img) => {
    const src = img.getAttribute("src") || "";
    return !!src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
  };
  var contentImgs2 = (el) => [...el.querySelectorAll("img")].filter(isContentImg2);
  var area = (img) => (parseFloat(img.getAttribute("width")) || 1) * (parseFloat(img.getAttribute("height")) || 1);
  var hasContent = (el) => !!textOf8(el) || contentImgs2(el).length > 0;
  var textNodesOf = (el) => [...el.querySelectorAll(TEXT2)].filter((n) => !n.parentElement.closest(TEXT2) && textOf8(n));
  function tilesOf(element) {
    let grid = element;
    for (let kids2 = [...grid.children].filter(hasContent); kids2.length === 1 && contentImgs2(kids2[0]).length > 1; kids2 = [...grid.children].filter(hasContent)) {
      [grid] = kids2;
    }
    const kids = [...grid.children].filter(hasContent);
    const withImg = kids.filter((k) => contentImgs2(k).length);
    if (withImg.length >= 1 && withImg.every((k) => contentImgs2(k).length === 1)) {
      return { tiles: withImg, notes: kids.filter((k) => !contentImgs2(k).length) };
    }
    return { tiles: [grid], notes: [] };
  }
  function frameHeight(img, tile) {
    if (typeof tile.getBoundingClientRect === "function" && !textOf8(tile)) {
      return tile.getBoundingClientRect().height || 0;
    }
    let frame = img;
    while (frame.parentElement && frame.parentElement !== tile && !textOf8(frame.parentElement)) frame = frame.parentElement;
    if (typeof frame.getBoundingClientRect !== "function") return 0;
    return frame.getBoundingClientRect().height || 0;
  }
  var HD_BLUE = [0, 120, 255];
  function parseRgb3(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function paintOf2(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return parseRgb3(view.getComputedStyle(el).backgroundColor);
    } catch (e) {
      return null;
    }
  }
  var near = (rgb, ref, tol = 30) => !!rgb && Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]) < tol;
  function framePaint(img, tile) {
    for (let n = img.parentElement; n; n = n.parentElement) {
      const rgb = paintOf2(n);
      if (rgb) return rgb;
      if (n === tile) break;
    }
    return null;
  }
  function gridPaint(tile, element) {
    const sig = (el) => `${textOf8(el)}|${contentImgs2(el).length}`;
    const own = sig(element);
    for (let n = tile.parentElement; n && n.tagName !== "SECTION"; n = n.parentElement) {
      if (!n.contains(element) || n === element || sig(n) === own) {
        const rgb = paintOf2(n);
        if (rgb) return rgb;
      } else {
        break;
      }
    }
    return null;
  }
  function fillsTile(img, tile) {
    if (typeof img.getBoundingClientRect !== "function") return false;
    const a = img.getBoundingClientRect();
    const t = tile.getBoundingClientRect();
    return a.width > 0 && t.width > 0 && a.width >= t.width * 0.95 && a.height >= 150;
  }
  function parse11(element, { document: document2 }) {
    const { tiles, notes } = tilesOf(element);
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const heights = [];
    const frames = [];
    tiles.forEach((tile) => {
      const art = contentImgs2(tile).sort((a, b) => area(b) - area(a))[0];
      const texts3 = textNodesOf(tile);
      if (!art && !texts3.length) return;
      const src = art ? imgSrc8(art) : "";
      const key = `${src}|${texts3.map(textOf8).join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (art) {
        heights.push(frameHeight(art, tile));
        frames.push({ tile, paint: framePaint(art, tile), fills: fillsTile(art, tile) });
      }
      let imageCell = "";
      if (art) {
        imageCell = document2.createElement("img");
        imageCell.src = src;
        imageCell.alt = art.getAttribute("alt") || "";
      }
      const textCell2 = texts3.map((n, i) => {
        const t = textOf8(n);
        const isTitle = i === 0 && texts3.length > 1 && (/^H[1-6]$/.test(n.tagName) || t.split(" ").length <= 6);
        const el = document2.createElement(isTitle ? "h3" : "p");
        el.textContent = t;
        return el;
      });
      cells.push([imageCell, textCell2.length ? textCell2 : ""]);
    });
    const measured = heights.filter((h) => h > 0);
    const short = measured.length > 0 && measured.every((h) => h <= 300);
    const options = [];
    if (short) options.push("short");
    if (frames.length) {
      const unpainted = frames.every((f) => !f.paint);
      if (frames.every((f) => near(f.paint, HD_BLUE))) options.push("reverse");
      else if (unpainted && near(gridPaint(frames[0].tile, element), HD_BLUE)) options.push("panel");
      else if (unpainted && frames.every((f) => f.fills)) options.push("cover");
    }
    const name = options.length ? `cards-framed (${options.join(", ")})` : "cards-framed";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
    let anchor = block;
    notes.forEach((note) => {
      textNodesOf(note).forEach((t) => {
        const el = document2.createElement(/^H[1-6]$/.test(t.tagName) ? t.tagName.toLowerCase() : "p");
        el.textContent = textOf8(t);
        anchor.after(el);
        anchor = el;
      });
    });
  }

  // tools/importer/parsers/columns-text-image.js
  var AO_COLOURS2 = [
    ["White", [255, 255, 255]],
    ["Black", [0, 0, 0]],
    ["Process Blue", [0, 145, 210]],
    ["Royal Blue", [30, 40, 134]],
    ["Hits Different Blue", [0, 120, 255]],
    ["Navy", [0, 12, 60]],
    ["Dark Navy", [15, 18, 66]],
    ["Bright Blue", [0, 225, 255]],
    ["Lime", [225, 255, 0]],
    ["Sky Blue", [128, 217, 255]],
    ["Stone", [235, 232, 229]]
  ];
  function parseRgb4(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function paintOf3(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return parseRgb4(view.getComputedStyle(el).backgroundColor);
    } catch (e) {
      return null;
    }
  }
  function colourName2(rgb) {
    let best = null;
    AO_COLOURS2.forEach(([name, ref]) => {
      const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
      if (d <= 8 && (!best || d < best.d)) best = { d, name };
    });
    return best ? best.name : `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  function tileColour2(img, column) {
    for (let n = img.parentElement; n && n !== column.parentElement; n = n.parentElement) {
      const rgb = paintOf3(n);
      if (rgb) return rgb.every((c) => c >= 245) ? "" : colourName2(rgb);
    }
    return "";
  }
  function textOf9(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc9(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function hasContent2(el) {
    return !!textOf9(el) || !!el.querySelector('img:not([src^="data:"]), img[src^="data:image/svg+xml"], video');
  }
  function contentOf(document2, root, seenImgs) {
    const out = [];
    root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, video").forEach((node) => {
      if (node.tagName === "IMG") {
        const src = imgSrc9(node);
        if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seenImgs.has(src)) return;
        seenImgs.add(src);
        const img = document2.createElement("img");
        img.src = src;
        img.alt = node.getAttribute("alt") || "";
        out.push(img);
        return;
      }
      if (node.tagName === "VIDEO") {
        const src = node.getAttribute("src") || (node.querySelector("source[src]") || {}).src;
        if (!src) return;
        const a = document2.createElement("a");
        a.href = src;
        a.textContent = src;
        out.push(a);
        return;
      }
      if (node.parentElement.closest("ul, ol, p, h1, h2, h3, h4, h5, h6")) return;
      if (!textOf9(node)) return;
      const el = document2.createElement(node.tagName.toLowerCase());
      if (/^[UO]L$/.test(node.tagName)) {
        node.querySelectorAll("li").forEach((li) => {
          const nli = document2.createElement("li");
          nli.textContent = textOf9(li);
          el.append(nli);
        });
      } else {
        el.innerHTML = node.innerHTML;
        el.querySelectorAll("[class], [style]").forEach((c) => {
          c.removeAttribute("class");
          c.removeAttribute("style");
        });
      }
      out.push(el);
    });
    return out;
  }
  function parse12(element, { document: document2 }) {
    let columns = [...element.children].filter(hasContent2);
    while (columns.length === 1 && [...columns[0].children].filter(hasContent2).length > 1) {
      columns = [...columns[0].children].filter(hasContent2);
    }
    const seenImgs = /* @__PURE__ */ new Set();
    let row = columns.map((col) => contentOf(document2, col, seenImgs)).filter((c) => c.length);
    if (row.length === 1) {
      const textCell2 = row[0].filter((n) => n.tagName !== "IMG");
      const imgCell = row[0].filter((n) => n.tagName === "IMG");
      row = imgCell.length && textCell2.length ? [textCell2, imgCell] : [row[0], ""];
    }
    const imgCol = columns.find((c) => c.querySelector("img") && !textOf9(c));
    if (row.length === 2 && imgCol && columns[0] === imgCol && Array.isArray(row[1])) {
      const colour = tileColour2(imgCol.querySelector("img"), imgCol);
      if (colour) {
        const p = document2.createElement("p");
        p.textContent = `Background: ${colour}`;
        row[1].push(p);
      }
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-text-image", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-misuse.js
  function textOf10(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc10(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var TEXT3 = "p, h1, h2, h3, h4, h5, h6";
  var isContentImg3 = (img) => {
    const src = img.getAttribute("src") || "";
    return !!src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
  };
  var contentImgs3 = (el) => [...el.querySelectorAll("img")].filter(isContentImg3);
  var area2 = (img) => (parseFloat(img.getAttribute("width")) || 0) * (parseFloat(img.getAttribute("height")) || 0);
  var hasContent3 = (el) => !!textOf10(el) || contentImgs3(el).length > 0;
  var isTile = (el) => !!textOf10(el) && contentImgs3(el).length > 0;
  function tilesOf2(element) {
    let grid = element;
    for (; ; ) {
      const kids2 = [...grid.children].filter(hasContent3);
      if (kids2.length !== 1 || !isTile(kids2[0])) break;
      const inner = [...kids2[0].children].filter(hasContent3);
      if (inner.length >= 2 && !inner.every(isTile)) break;
      [grid] = kids2;
    }
    const kids = [...grid.children].filter(hasContent3);
    return kids.every(isTile) ? kids : [grid];
  }
  function parse13(element, { document: document2 }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    tilesOf2(element).forEach((tile) => {
      const photo = contentImgs3(tile).sort((a, b) => area2(b) - area2(a))[0];
      const captions = [...tile.querySelectorAll(TEXT3)].filter((n) => !n.parentElement.closest(TEXT3)).map(textOf10).filter(Boolean);
      if (!photo && !captions.length) return;
      const src = photo ? imgSrc10(photo) : "";
      const key = `${src}|${captions.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (photo) {
        imageCell = document2.createElement("img");
        imageCell.src = src;
        imageCell.alt = photo.getAttribute("alt") || "";
      }
      const textCell2 = captions.map((t) => {
        const p = document2.createElement("p");
        p.textContent = t;
        return p;
      });
      cells.push([imageCell, textCell2.length ? textCell2 : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-misuse", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-messaging.js
  var TEXT_SEL = "h1, h2, h3, h4, h5, h6, p, li";
  function collapse(t) {
    return (t || "").replace(/\s+/g, " ");
  }
  function imgSrc11(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function contentImages(el) {
    return [...el.querySelectorAll("img")].filter((img) => {
      const src = img.getAttribute("src") || "";
      return src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
    });
  }
  function hasContent4(el) {
    return !!collapse(el.textContent).trim() || contentImages(el).length > 0;
  }
  function isBold(el) {
    if (/^(STRONG|B)$/.test(el.tagName)) return true;
    const style = el.getAttribute("style") || "";
    return /--framer-font-family:[^;]*(Bold|Semibold)/i.test(style) && !el.querySelector("strong, b");
  }
  function copyInline(document2, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(collapse(n.textContent));
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.tagName === "BR") {
        to.append(document2.createElement("br"));
        return;
      }
      if (isBold(n) && collapse(n.textContent).trim()) {
        const strong = document2.createElement("strong");
        strong.textContent = collapse(n.textContent).trim();
        to.append(strong);
        return;
      }
      copyInline(document2, n, to);
    });
  }
  var isBlank = (n) => n.nodeType === 3 && !n.textContent.trim() || n.nodeName === "BR";
  function paragraph(document2, source) {
    const p = document2.createElement("p");
    copyInline(document2, source, p);
    while (p.firstChild && isBlank(p.firstChild)) p.firstChild.remove();
    while (p.lastChild && isBlank(p.lastChild)) p.lastChild.remove();
    if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
    if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, "");
    p.querySelectorAll("br").forEach((br) => {
      const prev = br.previousSibling;
      const next = br.nextSibling;
      if (prev && prev.nodeType === 3) prev.textContent = prev.textContent.replace(/\s+$/, "");
      if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^\s+/, "");
    });
    return collapse(p.textContent).trim() ? p : null;
  }
  function texts(el) {
    return [...el.querySelectorAll(TEXT_SEL)].filter((t) => !t.parentElement.closest(TEXT_SEL));
  }
  function parse14(element, { document: document2 }) {
    const kids = [...element.children].filter(hasContent4);
    const roles = kids[0];
    const examples = kids[1];
    const roleCells = [];
    if (roles) texts(roles).forEach((t) => {
      const p = paragraph(document2, t);
      if (p) roleCells.push([p]);
    });
    const exampleCells = [];
    if (examples) {
      [...examples.children].filter(hasContent4).forEach((line) => {
        const cell = [];
        const icon = contentImages(line)[0];
        if (icon) {
          const img = document2.createElement("img");
          img.src = imgSrc11(icon);
          img.alt = icon.getAttribute("alt") || "";
          cell.push(img);
        }
        texts(line).forEach((t) => {
          const p = paragraph(document2, t);
          if (p) cell.push(p);
        });
        if (cell.length) exampleCells.push(cell);
      });
    }
    const cols = Math.max(roleCells.length, exampleCells.length, 1);
    const pad = (row) => {
      while (row.length < cols) row.push("");
      return row;
    };
    const cells = [];
    if (roleCells.length) cells.push(pad(roleCells));
    if (exampleCells.length) cells.push(pad(exampleCells));
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-messaging", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-steps.js
  var TEXT_SEL2 = "h1, h2, h3, h4, h5, h6, p, li";
  function collapse2(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function imgSrc12(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function contentImages2(el) {
    return [...el.querySelectorAll("img")].filter((img) => {
      const src = img.getAttribute("src") || "";
      return src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
    });
  }
  function hasContent5(el) {
    return !!collapse2(el.textContent) || contentImages2(el).length > 0;
  }
  function texts2(el) {
    return [...el.querySelectorAll(TEXT_SEL2)].filter((t) => !t.parentElement.closest(TEXT_SEL2) && collapse2(t.textContent));
  }
  function isStep(el) {
    if (!el || el.tagName === "SECTION") return false;
    const kids = [...el.children].filter(hasContent5);
    if (kids.length !== 2) return false;
    const [icon, text] = kids;
    return contentImages2(icon).length === 1 && !collapse2(icon.textContent) && !contentImages2(text).length && text.querySelectorAll("h1, h2, h3, h4, h5, h6").length === 1;
  }
  function nextContentSibling(el) {
    let n = el.nextElementSibling;
    while (n && !hasContent5(n)) n = n.nextElementSibling;
    return n;
  }
  function parse15(element, { document: document2 }) {
    const steps = [element];
    for (let n = nextContentSibling(element); isStep(n); n = nextContentSibling(n)) steps.push(n);
    const cells = steps.map((step) => {
      const [icon, text] = [...step.children].filter(hasContent5);
      const source = contentImages2(icon)[0];
      const img = document2.createElement("img");
      img.src = imgSrc12(source);
      img.alt = source.getAttribute("alt") || "";
      const body = texts2(text).map((t) => {
        const out = document2.createElement(/^H[1-6]$/.test(t.tagName) ? t.tagName.toLowerCase() : "p");
        out.textContent = collapse2(t.textContent);
        return out;
      });
      return [img, body];
    });
    steps.slice(1).forEach((s) => s.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-steps", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-spectrum.js
  var CONTENT_IMG2 = 'img:not([src^="data:"]), img[src^="data:image/svg+xml"]';
  var TEXT_SEL3 = "h1, h2, h3, h4, h5, h6, p";
  function textOf11(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc13(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function hasContent6(el) {
    return !!textOf11(el) || !!el.querySelector(`${CONTENT_IMG2}, video`) || el.matches(`${CONTENT_IMG2}, video`);
  }
  function contentChildren(el) {
    return [...el.children].filter((c) => !/^(SCRIPT|STYLE|HR)$/.test(c.tagName) && hasContent6(c));
  }
  function unwrap(el) {
    let node = el;
    for (let kids = contentChildren(node); kids.length === 1 && !/^(H\d|P|IMG)$/.test(kids[0].tagName); kids = contentChildren(node)) [node] = kids;
    return node;
  }
  function videoSrc2(el) {
    const video = el.tagName === "VIDEO" ? el : el.querySelector("video");
    if (!video) return "";
    return video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src") || "";
  }
  function imageOf(img, document2) {
    const out = document2.createElement("img");
    out.src = imgSrc13(img);
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function textCell(tile, document2) {
    return [...tile.querySelectorAll(TEXT_SEL3)].filter((t) => textOf11(t) && !t.parentElement.closest(TEXT_SEL3)).map((t) => {
      const out = document2.createElement(/^H\d$/.test(t.tagName) ? t.tagName.toLowerCase() : "p");
      out.textContent = textOf11(t);
      return out;
    });
  }
  function mediaCell(tile, document2) {
    const src = videoSrc2(tile);
    if (src) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = src;
      p.append(a);
      return [p];
    }
    const img = tile.matches(CONTENT_IMG2) ? tile : tile.querySelector(CONTENT_IMG2);
    return img ? [imageOf(img, document2)] : "";
  }
  function mediaRowAfter(element) {
    const band = element.closest("section");
    if (!band) return null;
    const after = [...band.querySelectorAll("*")].filter((n) => !element.contains(n) && element.compareDocumentPosition(n) & 4);
    return after.find((n) => {
      const kids = contentChildren(n);
      if (kids.length < 2 || kids.length > 3 || textOf11(n)) return false;
      const isVideo = (k) => k.querySelectorAll("video").length === 1 && !k.querySelector(CONTENT_IMG2);
      if (!isVideo(kids[0]) || !isVideo(kids[kids.length - 1])) return false;
      return kids.length === 2 || kids[1].querySelectorAll(CONTENT_IMG2).length === 1 && !kids[1].querySelector("video");
    }) || null;
  }
  function parse16(element, { document: document2 }) {
    const cells = [];
    contentChildren(element).forEach((child) => {
      const row = unwrap(child);
      const imgs = row.matches(CONTENT_IMG2) ? [row] : [...row.querySelectorAll(CONTENT_IMG2)];
      if (!textOf11(row) && imgs.length === 1) {
        const above = cells[cells.length - 1];
        if (above) above[1] = [imageOf(imgs[0], document2)];
        else cells.push(["", [imageOf(imgs[0], document2)], ""]);
        return;
      }
      const kids = contentChildren(row);
      const start = kids.length >= 2 ? kids[0] : row;
      const end = kids.length >= 2 ? kids[kids.length - 1] : null;
      cells.push([textCell(start, document2), "", end ? textCell(end, document2) : ""]);
    });
    const media = mediaRowAfter(element);
    if (media) {
      const tiles = contentChildren(media);
      cells.push([
        mediaCell(tiles[0], document2),
        tiles.length === 3 ? mediaCell(tiles[1], document2) : "",
        mediaCell(tiles[tiles.length - 1], document2)
      ]);
      media.remove();
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-spectrum", cells });
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
  function collapse3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function getDesktopHashes(document2) {
    const hashes = /* @__PURE__ */ new Set();
    document2.querySelectorAll("style").forEach((style) => {
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
    document2.querySelectorAll('[class*="hidden-"]').forEach((el) => {
      el.classList.forEach((c) => {
        const m = c.match(/^hidden-([a-z0-9]+)$/);
        if (m) hiddenUsed.add(m[1]);
      });
    });
    const roots = [...document2.querySelectorAll("#main > div, #main > div > div")];
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
  function dedupeBreakpoints(document2) {
    const hashes = getDesktopHashes(document2);
    if (!hashes.size) return;
    const selector = [...hashes].map((h) => `.hidden-${h}`).join(",");
    document2.querySelectorAll(selector).forEach((el) => {
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
  function removeChrome(document2) {
    WebImporter.DOMUtils.remove(document2.body || document2, [
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
    document2.querySelectorAll('#main [class*="-container"], #main .ssr-variant').forEach((el) => {
      if (!el.isConnected) return;
      if (!collapse3(el.textContent) && !el.querySelector("img, video, picture, source, svg, iframe")) {
        if (!el.closest("section, main, [id]:not(#main)")) removeEmptyWrapper(el);
      }
    });
    const candidates = [...document2.querySelectorAll("#main div")].filter((el) => !el.closest("section, main, #hero, #summary") && isAnchorOnlyNav(el));
    candidates.filter((el) => !candidates.some((other) => other !== el && other.contains(el))).forEach((el) => {
      if (el.isConnected) removeEmptyWrapper(el);
    });
    document2.querySelectorAll('[class*="framer-pointer-events-none"]').forEach((el) => {
      if (!collapse3(el.textContent) && !el.querySelector("img, video, picture")) el.remove();
    });
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SVG_DATA_PREFIX = "data:image/svg+xml;base64,";
  function toBase642(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin);
  }
  function computedStyle(document2, el) {
    const view = document2.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return view.getComputedStyle(el);
    } catch (e) {
      return null;
    }
  }
  function resolveVars(document2, value) {
    if (!value || value.indexOf("var(") === -1) return value;
    const rootStyle = computedStyle(document2, document2.documentElement);
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
  function artworkImg(document2, markup, alt, w, h) {
    const img = document2.createElement("img");
    img.setAttribute("src", `${SVG_DATA_PREFIX}${toBase642(markup)}`);
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
  function resolveSvgTree(document2, root, color) {
    [root, ...root.querySelectorAll("*")].forEach((node) => {
      [...node.attributes].forEach((attr) => {
        let v = resolveVars(document2, attr.value);
        if (color && /currentcolor/i.test(v)) v = v.replace(/currentcolor/gi, color);
        if (v !== attr.value) node.setAttribute(attr.name, v);
      });
    });
  }
  function convertUseSprites(document2) {
    const root = document2.querySelector("#main") || document2.body;
    [...root.querySelectorAll("svg")].forEach((svg) => {
      if (!svg.isConnected || svg.parentElement.closest("svg") || isDecorativeSvgHost(svg)) return;
      const use = svg.querySelector("use");
      let out;
      if (use) {
        const ref = (use.getAttribute("href") || use.getAttribute("xlink:href") || "").replace(/^#/, "");
        const tmpl = ref && document2.getElementById(ref);
        if (!tmpl) return;
        if (tmpl.tagName.toLowerCase() === "symbol") {
          out = document2.createElementNS(SVG_NS, "svg");
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
      const style = computedStyle(document2, svg);
      resolveSvgTree(document2, out, style && style.color ? style.color : "");
      if (!out.getAttribute("viewBox") && svg.getAttribute("viewBox")) out.setAttribute("viewBox", svg.getAttribute("viewBox"));
      const vb = (out.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const host = svg.parentElement || svg;
      const { w, h } = sizeOf(host, parseFloat(out.getAttribute("width")) || vb[2], parseFloat(out.getAttribute("height")) || vb[3]);
      if (isDecorativeGlyph(host, w, h)) return;
      if (w) out.setAttribute("width", String(w));
      if (h) out.setAttribute("height", String(h));
      svg.replaceWith(artworkImg(document2, serialiseSvg(out), artworkAlt(host), w, h));
    });
  }
  function maskRules(document2) {
    const rules = {};
    document2.querySelectorAll("style").forEach((style) => {
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
  function convertMaskVectors(document2) {
    const rules = maskRules(document2);
    const names = Object.keys(rules);
    if (!names.length) return;
    const root = document2.querySelector("#main") || document2.body;
    root.querySelectorAll(names.map((n) => `.${n}`).join(",")).forEach((el) => {
      if (!el.isConnected || isDecorativeSvgHost(el)) return;
      const rule = rules[names.find((n) => el.classList.contains(n))];
      let markup = rule.svg;
      try {
        markup = decodeURIComponent(markup);
      } catch (e) {
      }
      const style = computedStyle(document2, el);
      const live = style && style.backgroundColor;
      let color = live && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(live) ? live : resolveVars(document2, rule.bg);
      if (!color || /var\(|currentcolor/i.test(color)) color = "#000";
      const tmp = document2.createElement("div");
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
      el.appendChild(artworkImg(document2, serialiseSvg(svg), artworkAlt(el), w, h));
    });
  }
  function convertBackgroundVectors(document2) {
    const root = document2.querySelector("#main") || document2.body;
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
      const tmp = document2.createElement("div");
      tmp.innerHTML = markup;
      const svg = tmp.querySelector("svg");
      if (!svg) return;
      const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const { w, h } = sizeOf(el, parseFloat(svg.getAttribute("width")) || vb[2], parseFloat(svg.getAttribute("height")) || vb[3]);
      if (isDecorativeGlyph(el, w, h)) return;
      if (w) svg.setAttribute("width", String(w));
      if (h) svg.setAttribute("height", String(h));
      el.setAttribute("style", style.replace(m[0], "").replace(/;\s*;/g, ";"));
      el.appendChild(artworkImg(document2, serialiseSvg(svg), artworkAlt(el), w, h));
    });
  }
  function paintOf4(document2, el) {
    var _a;
    const cs = computedStyle(document2, el);
    if (!cs) return null;
    const val = (prop) => resolveVars(document2, (cs.getPropertyValue(prop) || "").trim());
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
  function artworkTile(document2, img) {
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
      const own = node.hasAttribute("data-excat-mask") ? null : paintOf4(document2, node);
      const layer = own ? null : [...node.children].find((c) => !c.querySelector("img") && paintOf4(document2, c));
      const paint = own || layer && paintOf4(document2, layer);
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
  function compositeTile(document2, tile, paint) {
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
    const out = artworkImg(document2, svg, alt, W, H);
    out.setAttribute("data-excat-tile", "true");
    tile.replaceChildren(out);
  }
  function compositeArtworkTiles(document2) {
    const root = document2.querySelector("#main") || document2.body;
    const done = /* @__PURE__ */ new Set();
    [...root.querySelectorAll("img[data-excat-svg]")].forEach((img) => {
      if (!img.isConnected || img.hasAttribute("data-excat-tile")) return;
      const found = artworkTile(document2, img);
      if (!found || done.has(found.tile)) return;
      done.add(found.tile);
      compositeTile(document2, found.tile, found.paint);
    });
  }
  function inlineSvgArtwork(document2) {
    convertMaskVectors(document2);
    convertBackgroundVectors(document2);
    convertUseSprites(document2);
    compositeArtworkTiles(document2);
  }
  function stripAppearStyles(document2) {
    document2.querySelectorAll("[style]").forEach((el) => {
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
  function normaliseSplitText(document2) {
    const textEls = [...document2.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li")];
    textEls.forEach((el) => {
      if (!el.isConnected) return;
      const letterSpans = [...el.querySelectorAll("span")].filter(isLetterSpan);
      const letterSplit = letterSpans.length >= 3;
      const brSplitHeading = /^H[1-6]$/.test(el.tagName) && el.querySelector("br") && !el.querySelector("em, i, a, img, picture, video");
      if (!letterSplit && !brSplitHeading) return;
      const text = collapse3(joinedText(el));
      if (text) el.textContent = text;
    });
  }
  function applyContentFixes(document2) {
    const statements = [...document2.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((el) => /^The AO isn[’']t just a tournament/i.test(collapse3(el.textContent)));
    if (statements.length) {
      const keep = statements.find((el) => /bold, inventive/i.test(el.textContent)) || statements[0];
      keep.textContent = WHO_WE_ARE_TEXT;
      statements.filter((el) => el !== keep).forEach((el) => {
        if (el.isConnected) el.remove();
      });
    }
    document2.querySelectorAll("a").forEach((a) => {
      if (collapse3(a.textContent).toLowerCase() !== "brand sound") return;
      const href = (a.getAttribute("href") || "").trim();
      if (/^(\.\/?|\/|https?:\/\/[^/]+\/?)?$/.test(href)) a.setAttribute("href", "/brand-sound");
    });
    const introHeading = document2.querySelector("#intro h1, #intro h2");
    if (introHeading && !/feeling like no other/i.test(collapse3(document2.querySelector("#intro").textContent))) {
      const p = document2.createElement("p");
      p.append("creates ");
      const em = document2.createElement("em");
      em.textContent = "a feeling like no other.";
      p.append(em);
      introHeading.after(p);
    }
  }
  var HEADING_SEL = "h1, h2, h3, h4, h5, h6";
  function headingLevel(el) {
    return /^H([1-6])$/.test(el.tagName) ? Number(el.tagName[1]) : 0;
  }
  function retag(document2, el, tag) {
    if (el.tagName.toLowerCase() === tag) return el;
    const out = document2.createElement(tag);
    [...el.attributes].forEach((a) => out.setAttribute(a.name, a.value));
    while (el.firstChild) out.appendChild(el.firstChild);
    el.replaceWith(out);
    return out;
  }
  function authorableText(root) {
    return [...root.querySelectorAll(`${HEADING_SEL}, p`)].filter((el) => collapse3(el.textContent) && !el.closest('a, button, [role="button"]'));
  }
  function sectionOf(el, root) {
    return el.closest("section") || el.closest("[id]:not(#main)") || root;
  }
  function normaliseHeadings(document2) {
    const root = document2.querySelector("#main") || document2.body;
    if (!root) return;
    const texts3 = authorableText(root);
    const firstHeading = texts3.find((el) => headingLevel(el));
    if (!firstHeading) return;
    const titleSection = sectionOf(firstHeading, root);
    const sectionTexts = texts3.filter((el) => titleSection.contains(el));
    const sectionHeadings = sectionTexts.filter((el) => headingLevel(el));
    const top = Math.min(...sectionHeadings.map(headingLevel));
    const titleSrc = sectionHeadings.find((el) => headingLevel(el) === top);
    const lead = sectionTexts[sectionTexts.indexOf(titleSrc) + 1];
    root.querySelectorAll("h1").forEach((h) => {
      if (h !== titleSrc) retag(document2, h, "h2");
    });
    retag(document2, titleSrc, "h1");
    if (lead && headingLevel(lead)) retag(document2, lead, "p");
    const wordsOf = (h) => {
      if (h.querySelector("em, i, a, img, picture, video")) return;
      const walker = document2.createTreeWalker(h, 4);
      const words = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = collapse3(n.textContent);
        if (t) words.push(t);
      }
      if (words.length > 1) h.textContent = words.join(" ");
    };
    const intro = document2.querySelector("#intro");
    if (intro) {
      intro.querySelectorAll("h2").forEach(wordsOf);
      const introLine = [...intro.querySelectorAll("h3, h4, h5, h6")].find((h) => /^creates\b/i.test(collapse3(h.textContent)));
      if (introLine) {
        const p = retag(document2, introLine, "p");
        const span = p.querySelector("span");
        if (span && !p.querySelector("em")) {
          const em = document2.createElement("em");
          em.textContent = collapse3(span.textContent);
          span.replaceWith(em);
        }
      }
    }
    const oneBrand = document2.querySelector("#onebrandsection");
    if (oneBrand) {
      const heads = [...oneBrand.querySelectorAll("h2, h3, h4")];
      const one = heads.find((h) => /^one\s*brand$/i.test(collapse3(h.textContent)));
      const flex = heads.find((h) => /^infinite\s*flexibility$/i.test(collapse3(h.textContent)));
      if (one && flex) {
        if (one.compareDocumentPosition(flex) & 2) one.after(flex);
        wordsOf(retag(document2, one, "h2"));
        wordsOf(retag(document2, flex, "h2"));
      }
    }
    document2.querySelectorAll("#test h4").forEach((h) => {
      if (!/^every user of our brand/i.test(collapse3(h.textContent))) return;
      const p = retag(document2, h, "p");
      p.textContent = collapse3(joinedText(p));
    });
  }
  function unwrapCode(document2) {
    const root = document2.querySelector("#main") || document2.body;
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
  function scaleHeadings(document2) {
    const root = document2.querySelector("#main") || document2.body;
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
      const words = pair.map((x) => collapse3(x.textContent));
      if (!words.every((w) => w && w.split(" ").length <= 2)) return;
      if (collapse3(row.textContent).replace(/\s/g, "") !== words.join("").replace(/\s/g, "")) return;
      const kids = [...row.children];
      const a = kids.findIndex((k) => k.contains(pair[0]));
      const b = kids.findIndex((k) => k.contains(pair[1]));
      if (a === -1 || b - a < 2 || kids.slice(a + 1, b).some((k) => collapse3(k.textContent))) return;
      const out = document2.createElement("h2");
      const em = document2.createElement("em");
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
  function pillButtons(document2) {
    const root = document2.querySelector("#main") || document2.body;
    [...root.querySelectorAll("a[href]")].forEach((a) => {
      if (!a.isConnected || a.closest("header, nav, footer")) return;
      const label = collapse3(a.textContent);
      if (!label || label.split(" ").length > 6 || typeof a.getBoundingClientRect !== "function") return;
      const cs = computedStyle(document2, a);
      if (!cs) return;
      const r = a.getBoundingClientRect();
      const painted = !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor);
      if (!painted || parseFloat(cs.borderTopLeftRadius) < 15 || r.height < 40) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const link = document2.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = label;
      strong.append(link);
      p.append(strong);
      a.replaceWith(p);
    });
  }
  function videosToLinks(document2) {
    document2.querySelectorAll("video").forEach((video) => {
      const src = video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src");
      if (!src) {
        video.remove();
        return;
      }
      const a = document2.createElement("a");
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
  function localVideos(document2) {
    document2.querySelectorAll("a[href]").forEach((a) => {
      const m = (a.getAttribute("href") || "").match(VIDEO_URL);
      const id = m && (m[1] || m[2]);
      if (!id || !LOCAL_VIDEOS.has(id)) return;
      const local = `/videos/${id}.mp4`;
      if (a.textContent.trim() === a.getAttribute("href")) a.textContent = local;
      a.setAttribute("href", local);
    });
  }
  var FRAMER_IMAGE = /^(https?:)?\/\/framerusercontent\.com\/images\/[^?#]+\.(jpe?g|png|webp|gif)(\?[^#]*)?$/i;
  function capFramerImages(document2) {
    document2.querySelectorAll("img[src]").forEach((img) => {
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
    document2.querySelectorAll("picture source").forEach((source) => source.remove());
  }
  function finalCleanup(document2) {
    WebImporter.DOMUtils.remove(document2.body || document2, [
      "script",
      "style",
      "noscript",
      "link",
      "meta",
      "iframe#__framer-editorbar",
      "#svg-templates"
    ]);
    document2.querySelectorAll('img[src^="data:"]').forEach((img) => {
      if ((img.getAttribute("src") || "").startsWith(SVG_DATA_PREFIX)) {
        img.removeAttribute("data-excat-svg");
        img.removeAttribute("data-excat-tile");
        return;
      }
      img.remove();
    });
    document2.querySelectorAll("svg").forEach((svg) => {
      if (!svg.closest("table")) svg.remove();
    });
    document2.querySelectorAll("*").forEach((el) => {
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
    const document2 = payload && payload.document || element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      dedupeBreakpoints(document2);
      inlineSvgArtwork(document2);
      removeChrome(document2);
      pillButtons(document2);
      stripAppearStyles(document2);
      unwrapCode(document2);
      normaliseSplitText(document2);
      applyContentFixes(document2);
      normaliseHeadings(document2);
      const template = payload && payload.template;
      if (!template || template.name !== "homepage") scaleHeadings(document2);
    }
    if (hookName === "afterTransform") {
      videosToLinks(document2);
      localVideos(document2);
      capFramerImages(document2);
      finalCleanup(document2);
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
  function findBySelectors(document2, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      try {
        const el = document2.querySelector(sel);
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
  function resolveMapped(document2, sections) {
    const els = [];
    for (const section of sections) {
      const el = findBySelectors(document2, section.selector);
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
    const texts3 = [...el.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((t) => (t.textContent || "").trim() && !t.parentElement.closest("h1, h2, h3, h4, h5, h6, p"));
    return texts3.length > 0 && texts3.every((t) => {
      const r = visibleRect(t);
      return r && r.left < media.right && media.left < r.right && r.top < media.bottom && media.top < r.bottom;
    });
  }
  function spansViewport(document2, el, withVideo = false) {
    const view = document2.defaultView;
    const vw = document2.documentElement && document2.documentElement.clientWidth;
    if (!view || !vw || typeof el.getBoundingClientRect !== "function") return null;
    const rects = [...el.querySelectorAll(withVideo ? "img, video" : "img")].map((img) => img.getBoundingClientRect()).filter((r) => r.width > 1 && r.height > 1);
    if (!rects.length) return null;
    const overlaps2 = rects.some((a, i) => rects.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2));
    if (overlaps2) {
      const size = (r) => r.width * r.height;
      const base = rects.reduce((a, b) => size(b) > size(a) ? b : a);
      const inside = rects.every((r) => r === base || r.left >= base.left - 2 && r.right <= base.right + 2 && r.top >= base.top - 2 && r.bottom <= base.bottom + 2);
      return inside && base.left <= 2 && base.right >= vw - 2;
    }
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    return left <= 2 && right >= vw - 2;
  }
  function parseRgb5(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m) return null;
    if (m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function gradientRgb(value) {
    if (!/linear-gradient/.test(value || "")) return null;
    const stops = (value.match(/rgba?\([^)]*\)/g) || []).map(parseRgb5).filter(Boolean);
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
  function bandStyle(document2, el, inherit = false) {
    const textured = parseRgb5(el.getAttribute(BAND_COLOR_ATTR));
    if (textured) return paletteStyle(textured);
    const view = document2.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    const hasText = !!(el.textContent || "").replace(/\s+/g, "").length;
    let node = el;
    for (let depth = 0; node && depth < 3; depth += 1) {
      let rgb = null;
      try {
        const cs = view.getComputedStyle(node);
        rgb = parseRgb5(cs.backgroundColor) || (hasText ? gradientRgb(cs.backgroundImage) : null);
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
        rgb = parseRgb5(view.getComputedStyle(n).backgroundColor);
      } catch (e) {
        rgb = null;
      }
      if (rgb) return paletteStyle(rgb);
    }
    return null;
  }
  var TEXT_SEL4 = "h1, h2, h3, h4, h5, h6, p, li";
  function isCenteredBand(document2, el) {
    const view = document2.defaultView;
    if (!view || typeof view.getComputedStyle !== "function" || typeof document2.createRange !== "function" || typeof el.getBoundingClientRect !== "function") return false;
    const box = el.getBoundingClientRect();
    if (!box.width) return false;
    const cs = view.getComputedStyle(el);
    const left = box.left + (parseFloat(cs.paddingLeft) || 0);
    const right = box.right - (parseFloat(cs.paddingRight) || 0);
    const mid = (left + right) / 2;
    const items = [...el.querySelectorAll(TEXT_SEL4)].filter((t) => (t.textContent || "").trim() && !t.parentElement.closest(TEXT_SEL4)).map((t) => {
      const range = document2.createRange();
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
  function displayHeading(document2, el) {
    const view = document2.defaultView;
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
  function resolveStructural(document2, sections) {
    const root = document2.querySelector("#main") || document2.body;
    const outer = [...root.querySelectorAll("section")].filter((s) => !s.parentElement.closest("section")).filter((s) => !s.closest("header, nav, footer"));
    const all = [...outer, ...siblingBands(outer)].sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1);
    const families = fullWidthFamilies(sections);
    return all.map((el, i) => {
      const styles = [];
      const heroBand = i === 0 && (isMediaOnly(el) || isMediaWithOverlay(el));
      const band = bandStyle(document2, el, !heroBand);
      if (band) styles.push(band);
      if (isMediaOnly(el)) {
        const family = !!(el.id && families.has(idFamily(el.id)));
        const hasVideo = !!el.querySelector("video");
        const spans = spansViewport(document2, el, hasVideo);
        let full = false;
        if (spans === null) full = family;
        else full = hasVideo ? family && spans : spans;
        if (full) styles.push("full-width");
      }
      const centred = isCenteredBand(document2, el);
      if (centred) styles.push("centered");
      if (i > 0 && displayHeading(document2, el)) {
        if (centred) styles.push("intro");
        else if (hasColourValues(el)) styles.push("colour-feature");
      }
      const meta = {};
      if (styles.length) meta.style = styles.join(", ");
      return { el, meta, id: `structural-${i + 1}` };
    });
  }
  function insertBreaks(document2, entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const { el, meta, id } = entries[i];
      const hasMeta = Object.keys(meta).length > 0;
      if (i === 0 && !hasMeta) continue;
      const hr = document2.createElement("hr");
      if (hasMeta) {
        hr.setAttribute(MARKER, i === 0 ? `${id}:first` : id);
        hr.setAttribute(META_ATTR, JSON.stringify(meta));
      }
      el.before(hr);
    }
  }
  function transform2(hookName, element, payload) {
    const document2 = payload && payload.document || element.ownerDocument || element;
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (hookName === "beforeTransform") {
      if (!sections.length) return;
      let entries;
      const mapped = resolveMapped(document2, sections);
      if (mapped) {
        entries = mapped.map((el, i) => ({
          el,
          meta: sectionMeta(template, sections[i]),
          id: sections[i].id || `section-${i + 1}`
        }));
      } else {
        entries = resolveStructural(document2, sections);
      }
      document2.querySelectorAll(`[${BAND_LAYER_ATTR}]`).forEach((layer) => layer.remove());
      document2.querySelectorAll(`[${BAND_COLOR_ATTR}]`).forEach((band) => band.removeAttribute(BAND_COLOR_ATTR));
      if (entries.length < 2 && !(entries[0] && Object.keys(entries[0].meta).length)) return;
      insertBreaks(document2, entries);
    }
    if (hookName === "afterTransform") {
      const markers = [...document2.querySelectorAll(`hr[${MARKER}]`)].reverse();
      markers.forEach((hr) => {
        const isFirst = /:first$/.test(hr.getAttribute(MARKER) || "");
        let meta = {};
        try {
          meta = JSON.parse(hr.getAttribute(META_ATTR) || "{}");
        } catch (e) {
          meta = {};
        }
        if (Object.keys(meta).length) {
          const block = WebImporter.Blocks.createBlock(document2, {
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

  // tools/importer/detectors/common.js
  var HEADINGS4 = "h1, h2, h3, h4, h5, h6";
  var TEXT_SEL5 = "h1, h2, h3, h4, h5, h6, p, li";
  var NOISE_RE = /^copy( hex| to clipboard)?$/i;
  function textOf12(el) {
    if (!el) return "";
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function cleanText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("button").forEach((b) => b.remove());
    clone.querySelectorAll("p").forEach((p) => {
      if (NOISE_RE.test(textOf12(p))) p.remove();
    });
    return textOf12(clone);
  }
  function contentImages3(el) {
    if (!el) return [];
    const imgs = el.tagName === "IMG" ? [el] : [...el.querySelectorAll("img")];
    return imgs.filter((img) => {
      const src = img.getAttribute("src") || "";
      return src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
    });
  }
  function videos(el) {
    if (!el) return [];
    return el.tagName === "VIDEO" ? [el] : [...el.querySelectorAll("video")];
  }
  function headings(el) {
    return [...el.querySelectorAll(HEADINGS4)].filter((h) => textOf12(h) && !NOISE_RE.test(textOf12(h)));
  }
  function textElements(el) {
    return [...el.querySelectorAll(TEXT_SEL5)].filter((t) => textOf12(t) && !NOISE_RE.test(textOf12(t)) && !t.closest("button")).filter((t) => !t.parentElement.closest(TEXT_SEL5));
  }
  function hasContent7(el) {
    if (!el || el.tagName === "HR" || el.tagName === "STYLE" || el.tagName === "SCRIPT") return false;
    return !!textOf12(el) || contentImages3(el).length > 0 || videos(el).length > 0;
  }
  function contentChildren2(el) {
    return [...el.children].filter(hasContent7);
  }
  function isMediaOnly2(el) {
    return !textOf12(el) && (contentImages3(el).length > 0 || videos(el).length > 0);
  }
  function isImageTile(el) {
    return !textOf12(el) && videos(el).length === 0 && contentImages3(el).length === 1;
  }
  function isLabelledImageTile(el, maxWords = 6) {
    if (videos(el).length || contentImages3(el).length !== 1) return false;
    const texts3 = textElements(el);
    if (texts3.length > 1) return false;
    const t = cleanText(el);
    return !t || t.split(" ").length <= maxWords;
  }
  function isImageGrid(el, min = 2) {
    const kids = contentChildren2(el);
    if (kids.length < min) return false;
    if (kids.every(isImageTile)) return true;
    return kids.every((k) => {
      const row = contentChildren2(k);
      return row.length >= 2 && row.every(isImageTile);
    });
  }
  function imageInfo(img) {
    const w = parseInt(img.getAttribute("width") || "0", 10) || 0;
    const h = parseInt(img.getAttribute("height") || "0", 10) || 0;
    const style = img.getAttribute("style") || "";
    const svgArt = (img.getAttribute("src") || "").startsWith("data:image/svg+xml");
    const fit = svgArt ? "contain" : (style.match(/object-fit\s*:\s*([a-z-]+)/i) || [])[1] || "";
    const sizes = img.getAttribute("sizes") || "";
    const desktop = (sizes.match(/\(min-width:\s*1200px\)\s*([^,]+(?:\([^)]*\))*[^,]*)/) || [])[1] || sizes;
    let displayWidth = w;
    if (sizes) {
      const px = desktop.trim().match(/^([\d.]+)px$/);
      displayWidth = px ? parseFloat(px[1]) : Infinity;
    }
    return {
      w,
      h,
      fit: fit.toLowerCase(),
      fullBleed: /^max\(100vw|^100vw/.test(desktop.trim()),
      responsive: !!(sizes || img.getAttribute("srcset")),
      displayWidth
    };
  }
  function isCropped(img) {
    return imageInfo(img).fit !== "contain";
  }
  function isPhoto(img) {
    const { fit, responsive, displayWidth } = imageInfo(img);
    return fit !== "contain" && responsive && displayWidth >= 200;
  }
  function isGraphic(img, maxSide = 600) {
    const { w, h, fit, displayWidth } = imageInfo(img);
    const { responsive } = imageInfo(img);
    return fit === "contain" && Math.max(w, h) <= maxSide || displayWidth <= 200 || !responsive && Math.max(w, h) <= 400;
  }
  function uniformBleed(imgs) {
    const bleed = imgs.filter((i) => imageInfo(i).fullBleed).length;
    return bleed === 0 || bleed === imgs.length;
  }
  function bandOf2(el) {
    let band = el.closest("section");
    while (band && band.parentElement && band.parentElement.closest("section")) {
      band = band.parentElement.closest("section");
    }
    return band;
  }
  function inMediaOnlyBand(el) {
    const section = el.closest("section");
    return !!section && isMediaOnly2(section);
  }
  function layerNames(el, root) {
    const names = [];
    for (let n = el; n && n !== root; n = n.parentElement) {
      const name = n.getAttribute && n.getAttribute("data-framer-name");
      if (name) names.push(name);
      if (n.tagName === "SECTION" && !n.parentElement.closest("section")) break;
    }
    return names;
  }
  var isBefore = (a, b) => !!(a.compareDocumentPosition(b) & 4);
  function previousHeading(el, ctx) {
    let found = null;
    for (const h of ctx.headings) {
      if (el.contains(h)) break;
      if (isBefore(h, el)) found = h;
      else break;
    }
    return found;
  }
  function contextOf(el, ctx) {
    const h = previousHeading(el, ctx);
    return {
      heading: h ? textOf12(h) : "",
      layers: layerNames(el, ctx.root).join(" | ")
    };
  }
  function buildContext(document2) {
    const root = document2.querySelector("#main") || document2.body;
    const ctx = { document: document2, root, headings: headings(root) };
    return ctx;
  }
  function detect(document2, detectors2, seeds = []) {
    const ctx = buildContext(document2);
    const found = [];
    const seedEls = seeds.map((s) => s.element);
    const visit = (el) => {
      if (seedEls.includes(el)) return;
      if (/^(SCRIPT|STYLE|SVG|HR|IMG|VIDEO|BUTTON|P|H[1-6])$/i.test(el.tagName)) return;
      const holdsSeed = seedEls.some((s) => el.contains(s));
      if (!holdsSeed && hasContent7(el)) {
        for (const det of detectors2) {
          let ok = false;
          try {
            ok = det.test(el, ctx);
          } catch (e) {
            ok = false;
          }
          if (ok) {
            let target = el;
            for (; ; ) {
              const kids = contentChildren2(target);
              if (kids.length !== 1) break;
              let inner = false;
              try {
                inner = det.test(kids[0], ctx);
              } catch (e) {
                inner = false;
              }
              if (!inner) break;
              [target] = kids;
            }
            found.push({ name: det.name, element: target, selector: `structural:${det.name}`, source: "fallback" });
            return;
          }
        }
      }
      [...el.children].forEach(visit);
    };
    [...ctx.root.children].forEach(visit);
    return found;
  }
  function sortByDocumentOrder(list) {
    return list.sort((a, b) => {
      if (a.element === b.element) return 0;
      return isBefore(a.element, b.element) ? -1 : 1;
    });
  }
  var LABEL_RE = /^(hex|rgb|cmyk|pms|pantone)\s*:?/i;
  function isSwatchTile(el) {
    if (el.classList && el.classList.contains("framer-KY4CI")) return true;
    const hs = headings(el);
    if (hs.length !== 1) return false;
    const labels = [...el.querySelectorAll("p")].filter((p) => LABEL_RE.test(textOf12(p)));
    return labels.length >= 1;
  }
  function isImageNameTile(el) {
    const hs = headings(el);
    if (hs.length !== 1 || contentImages3(el).length < 1) return false;
    return !el.querySelector("p") || [...el.querySelectorAll("p")].every((p) => !LABEL_RE.test(textOf12(p)) && NOISE_RE.test(textOf12(p)));
  }
  function isNote(el) {
    return !headings(el).length && !contentImages3(el).length && textElements(el).length >= 1;
  }
  function isSwatchGrid(el) {
    if (isSwatchTile(el)) return false;
    const kids = contentChildren2(el);
    if (!kids.length) return false;
    let swatches = 0;
    const ok = kids.every((k) => {
      if (isSwatchTile(k)) {
        swatches += 1;
        return true;
      }
      if (isImageNameTile(k)) return true;
      const inner = contentChildren2(k);
      if (inner.some(isSwatchTile) && inner.every((c) => isSwatchTile(c) || isNote(c))) {
        swatches += 1;
        return true;
      }
      return false;
    });
    return ok && swatches >= 1;
  }
  var CONTRAST_RE = /^\S{0,4}\s*background\s*:?\s*\S.*\btext\s*:?\s*\S/i;
  function isContrastTile(el) {
    const t = textOf12(el).replace(/(background|text)/gi, " $1 ").replace(/\s+/g, " ").trim();
    if (!CONTRAST_RE.test(t) || contentImages3(el).length) return false;
    if (t.split(" ").length > 14) return false;
    return [...el.querySelectorAll("p")].filter((p) => /^background/i.test(textOf12(p))).length === 1;
  }
  function isContrastGrid(el) {
    const kids = contentChildren2(el);
    return kids.length >= 1 && kids.every(isContrastTile) && !isContrastTile(el);
  }
  function isVideoContainer(el) {
    if (el.tagName === "SECTION") return false;
    if (textOf12(el) || videos(el).length !== 1 || contentImages3(el).length > 0) return false;
    const parent = el.parentElement;
    if (!parent || parent.tagName === "SECTION") return true;
    return !!textOf12(parent) || videos(parent).length !== 1 || contentImages3(parent).length > 0;
  }
  function mediaWrapper(media, root) {
    let node = media;
    while (node.parentElement && node.parentElement !== root && node.parentElement.tagName !== "SECTION") {
      const p = node.parentElement;
      if (textOf12(p) || contentImages3(p).length + videos(p).length > 1) break;
      node = p;
    }
    return node;
  }
  var GLYPH_RE2 = /\d{4}\S{0,10}[&%#@]|(?:[\u3400-\u9fff]\s*){4,}/;
  function glyphLines(el) {
    return [...el.querySelectorAll("p")].filter((p) => GLYPH_RE2.test(textOf12(p)));
  }
  function isSpecimen2(el) {
    return glyphLines(el).length === 1 && !headings(el).length && textOf12(el).length <= 220 && !contentImages3(el).length;
  }
  function isTypefaceRow(el) {
    if (videos(el).length || contentImages3(el).length) return false;
    const kids = contentChildren2(el);
    if (kids.length === 2 && glyphLines(el).length === 1) {
      const spec = kids.find(isSpecimen2);
      const copy = kids.find((k) => k !== spec);
      if (spec && copy && textElements(copy).length >= 1 && !glyphLines(copy).length) return true;
    }
    if (isSpecimen2(el)) {
      const parent = el.parentElement;
      return !(parent && isTypefaceRowShape(parent));
    }
    return false;
  }
  function isTypefaceRowShape(el) {
    const kids = contentChildren2(el);
    if (kids.length !== 2 || glyphLines(el).length !== 1) return false;
    const spec = kids.find(isSpecimen2);
    const copy = kids.find((k) => k !== spec);
    return !!(spec && copy && textElements(copy).length >= 1);
  }
  function flexDirection(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return "";
    let cs = null;
    try {
      cs = view.getComputedStyle(el);
    } catch (e) {
      return "";
    }
    const flow = (cs.getPropertyValue("flex-flow") || "").trim().split(/\s+/)[0];
    if (/^(row|column)/.test(flow)) return flow.replace("-reverse", "");
    if (/^(wrap|nowrap|wrap-reverse)$/.test(flow)) return "row";
    const dir = (cs.flexDirection || "").replace("-reverse", "");
    return cs.display && /flex/.test(cs.display) ? dir || "row" : "";
  }
  var MISUSE_RE = /^(don['’]?t|do not|never|avoid)\b/i;
  function isMisuseGrid(el) {
    const kids = contentChildren2(el);
    if (kids.length < 2) return false;
    return kids.every((k) => {
      const texts3 = textElements(k);
      return contentImages3(k).length >= 1 && contentImages3(k).length <= 3 && texts3.length >= 1 && MISUSE_RE.test(textOf12(texts3[0])) && textOf12(k).split(" ").length <= 30 && !videos(k).length;
    });
  }
  function artworkTextTile(el) {
    if (videos(el).length) return null;
    const imgs = contentImages3(el);
    if (imgs.length !== 1) return null;
    const texts3 = textElements(el);
    if (!texts3.length || MISUSE_RE.test(textOf12(texts3[0]))) return null;
    if (textOf12(el).split(" ").length > 120) return null;
    return { img: imgs[0], texts: texts3 };
  }
  function isSideBySide(el) {
    const kids = contentChildren2(el);
    if (kids.length !== 2) return false;
    const img = kids.find((k) => isImageTile(k));
    const text = kids.find((k) => k !== img);
    if (!img || !text || contentImages3(text).length || !textElements(text).length) return false;
    return flexDirection(el) === "row";
  }
  function isFramedTextGrid(el) {
    const kids = contentChildren2(el);
    if (kids.length < 2 || kids.length > 6) return false;
    return kids.every((k) => {
      const tile = artworkTextTile(k);
      if (!tile || isSideBySide(k)) return false;
      return tile.texts.length >= 2 || textOf12(k).split(" ").length > 6;
    });
  }
  var EXCLUSION_RE = /exclusion|minimum size|clear ?space|safe ?zone/i;
  var LOCKUP_RE = /logo|wordmark|lock-?up|designation|marque/i;
  function isFramedGrid(el, ctx, { lockups = false } = {}) {
    if (isFramedTextGrid(el)) return true;
    if (!isImageGrid(el)) return false;
    const imgs = contentImages3(el);
    if (imgs.length < 2 || imgs.length > 3) return false;
    const { heading } = contextOf(el, ctx);
    if (EXCLUSION_RE.test(heading)) return true;
    return lockups && LOCKUP_RE.test(heading) && imgs.every((i) => !isCropped(i));
  }

  // tools/importer/detectors/sub-brand-guide.js
  var EXCLUSION_RE2 = /exclusion|minimum size|clear ?space|safe ?zone/i;
  var LOGO_RE = /logo|designation|lock-?up|wordmark|marque/i;
  function heroOf(ctx) {
    if (ctx.hero !== void 0) return ctx.hero;
    ctx.hero = null;
    const media = [...ctx.root.querySelectorAll("img, video")].find((m) => m.tagName === "VIDEO" || contentImages3(m).length);
    if (media && !previousHeading(media, ctx)) ctx.hero = mediaWrapper(media, ctx.root);
    return ctx.hero;
  }
  function isUpper(t) {
    const letters = t.replace(/[^A-Za-z]/g, "");
    return letters.length > 0 && letters.replace(/[^A-Z]/g, "").length / letters.length >= 0.8;
  }
  function isToneGrid(el) {
    const kids = contentChildren2(el);
    if (kids.length < 2) return false;
    const tiles = kids.every((k) => {
      if (contentImages3(k).length || videos(k).length) return false;
      const texts3 = textElements(k);
      return texts3.length >= 1 && texts3.length <= 3 && textOf12(k).split(" ").length <= 14;
    });
    if (!tiles) return false;
    const named = /^voice$/i.test(el.getAttribute("data-framer-name") || "");
    const upper = kids.filter((k) => isUpper(textOf12(k))).length / kids.length >= 0.6;
    return named || upper;
  }
  function isLabelledGrid(el) {
    const kids = contentChildren2(el);
    return kids.length >= 2 && kids.every((k) => isLabelledImageTile(k));
  }
  function imageGridKind(el, ctx) {
    const plain = isImageGrid(el);
    if (!plain && !isLabelledGrid(el)) return null;
    const imgs = contentImages3(el);
    const { heading } = contextOf(el, ctx);
    const band = bandOf2(el);
    const bandName = band && band.getAttribute("data-framer-name") || "";
    if (EXCLUSION_RE2.test(heading)) {
      return plain && imgs.length >= 2 && imgs.length <= 3 ? "cards-framed" : null;
    }
    if (/product logo/i.test(heading) && plain && imgs.length >= 4) return "cards-shape";
    if (LOGO_RE.test(bandName)) return "cards-logo";
    if (plain && inMediaOnlyBand(el) && imgs.every(isPhoto) && uniformBleed(imgs)) return "columns-photos";
    if (/shape/i.test(heading) && imgs.every((i) => !isCropped(i))) return plain ? "cards-shape" : null;
    if (LOGO_RE.test(heading)) return "cards-logo";
    if (!plain) return null;
    if (/photo|imagery|application|example/i.test(`${heading} ${bandName}`) && imgs.length <= 8 && imgs.every(isPhoto) && uniformBleed(imgs)) return "columns-photos";
    if (imgs.length >= 4 && imgs.filter((i) => isGraphic(i)).length >= imgs.length * 0.75) return "cards-shape";
    if (imgs.length >= 2 && imgs.length <= 6 && imgs.every(isCropped)) return "columns-panel";
    return null;
  }
  function isLonePanel(el) {
    if (el.tagName === "SECTION" || textOf12(el) || videos(el).length || contentImages3(el).length !== 1) return false;
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function" || typeof el.getBoundingClientRect !== "function") return false;
    let cs = null;
    try {
      cs = view.getComputedStyle(el);
    } catch (e) {
      return false;
    }
    const m = (cs.backgroundColor || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return false;
    const [r, g, b] = [m[1], m[2], m[3]].map((c) => parseInt(c, 10));
    const light = [r, g, b].every((c) => c >= 240);
    const hdBlue = Math.hypot(r, g - 120, b - 255) < 30;
    if (!(light || hdBlue)) return false;
    const box = el.getBoundingClientRect();
    const img = contentImages3(el)[0].getBoundingClientRect();
    return box.width > 0 && img.width > 0 && img.width * img.height < 0.6 * box.width * box.height;
  }
  function isLightPanel(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return false;
    let cs = null;
    try {
      cs = view.getComputedStyle(el);
    } catch (e) {
      return false;
    }
    const m = (cs.backgroundColor || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return false;
    return [m[1], m[2], m[3]].every((c) => parseInt(c, 10) >= 240);
  }
  function isSmallIcon(img) {
    if (typeof img.getBoundingClientRect === "function") {
      const r = img.getBoundingClientRect();
      if (r.width && r.height) return r.width <= 100 && r.height <= 100;
    }
    return isGraphic(img);
  }
  function isIconLine(el) {
    const imgs = contentImages3(el);
    return imgs.length === 1 && isSmallIcon(imgs[0]) && !videos(el).length && !headings(el).length && textElements(el).length >= 1;
  }
  function isMessagingPanel(el) {
    if (el.tagName === "SECTION" || !isLightPanel(el)) return false;
    const kids = contentChildren2(el);
    if (kids.length !== 2) return false;
    const [roles, examples] = kids;
    if (contentImages3(roles).length || videos(roles).length || headings(roles).length || !textElements(roles).length) return false;
    const lines = contentChildren2(examples);
    return lines.length >= 2 && lines.every(isIconLine);
  }
  function isStepTile(el) {
    if (!el || el.tagName === "SECTION") return false;
    const kids = contentChildren2(el);
    if (kids.length !== 2) return false;
    const [icon, text] = kids;
    const imgs = contentImages3(icon);
    if (!isImageTile(icon) || !isSmallIcon(imgs[0])) return false;
    if (contentImages3(text).length || videos(text).length || headings(text).length !== 1) return false;
    return textElements(text).length >= 2 && flexDirection(el) !== "row";
  }
  function previousContentSibling(el) {
    let n = el.previousElementSibling;
    while (n && !hasContent7(n)) n = n.previousElementSibling;
    return n;
  }
  function isStepRun(el) {
    if (!isStepTile(el) || isStepTile(previousContentSibling(el))) return false;
    let n = el.nextElementSibling;
    while (n && !hasContent7(n)) n = n.nextElementSibling;
    return isStepTile(n);
  }
  function isMediaTile(el) {
    return !textOf12(el) && contentImages3(el).length + videos(el).length === 1;
  }
  function isMediaColumns(el) {
    if (el.tagName === "SECTION" || !inMediaOnlyBand(el) || !videos(el).length) return false;
    const cols = contentChildren2(el);
    if (cols.length < 2 || flexDirection(el) !== "row") return false;
    return cols.every((c) => {
      const tiles = contentChildren2(c);
      return tiles.length >= 2 && tiles.every(isMediaTile);
    });
  }
  function unwrapRow(el) {
    let node = el;
    for (let kids = contentChildren2(node); kids.length === 1; kids = contentChildren2(node)) [node] = kids;
    return node;
  }
  function isEndsRow(el) {
    const kids = contentChildren2(unwrapRow(el));
    return kids.length === 2 && kids.every((k) => !contentImages3(k).length && !videos(k).length && textElements(k).length >= 1 && textOf12(k).split(" ").length <= 20);
  }
  function isSpectrum(el) {
    if (el.tagName === "SECTION") return false;
    const rows = contentChildren2(el);
    if (rows.length < 3) return false;
    const scales = rows.filter((r) => !textOf12(r) && !videos(r).length && contentImages3(r).length === 1);
    return scales.length === 1 && rows.filter(isEndsRow).length === rows.length - 1;
  }
  function isLogoRow(el) {
    if (!isSideBySide(el)) return false;
    const text = contentChildren2(el).find((k) => !contentImages3(k).length);
    return headings(text).length >= 1 || textElements(text).length >= 2;
  }
  var detectors = [
    { name: "hero-banner", test: (el, ctx) => el === heroOf(ctx), validate: (el) => isMediaOnly2(el) },
    {
      name: "cards-swatch",
      test: (el) => isSwatchGrid(el) || isSwatchTile(el),
      // a lone tile: its container was rejected
      validate: (el) => /hex/i.test(textOf12(el))
    },
    { name: "cards-contrast", test: (el) => isContrastGrid(el), validate: (el) => /background/i.test(textOf12(el)) },
    { name: "columns-typeface", test: (el) => isTypefaceRow(el), validate: (el) => /\d{4}/.test(textOf12(el)) },
    { name: "columns-photos", test: (el) => isMediaColumns(el), validate: (el) => contentImages3(el).length >= 2 },
    // the audience scale takes the video row after it, so it is tested before video-autoplay
    { name: "columns-spectrum", test: (el) => isSpectrum(el), validate: (el) => isSpectrum(el) },
    { name: "video-autoplay", test: (el) => isVideoContainer(el), validate: (el) => videos(el).length >= 1 },
    { name: "cards-tone", test: (el) => isToneGrid(el), validate: (el) => !!textOf12(el) },
    { name: "columns-messaging", test: (el) => isMessagingPanel(el), validate: (el) => contentImages3(el).length >= 2 && !!textOf12(el) },
    { name: "cards-steps", test: (el) => isStepRun(el), validate: (el) => isStepTile(el) },
    { name: "cards-misuse", test: (el) => isMisuseGrid(el), validate: (el) => contentImages3(el).length >= 2 && /don/i.test(textOf12(el)) },
    {
      name: "cards-framed",
      test: (el, ctx) => isFramedGrid(el, ctx) || imageGridKind(el, ctx) === "cards-framed",
      validate: (el) => contentImages3(el).length >= 1
    },
    { name: "columns-text-image", test: (el) => isLogoRow(el), validate: (el) => contentImages3(el).length >= 1 && !!textOf12(el) },
    { name: "cards-logo", test: (el, ctx) => imageGridKind(el, ctx) === "cards-logo", validate: (el) => contentImages3(el).length >= 2 },
    { name: "cards-shape", test: (el, ctx) => imageGridKind(el, ctx) === "cards-shape", validate: (el) => contentImages3(el).length >= 2 },
    { name: "columns-photos", test: (el, ctx) => imageGridKind(el, ctx) === "columns-photos", validate: (el) => contentImages3(el).length >= 2 },
    // image sets on a panel; a lone artwork on a light panel (tested last, after every other block)
    {
      name: "columns-panel",
      test: (el, ctx) => imageGridKind(el, ctx) === "columns-panel" || isLonePanel(el),
      validate: (el) => contentImages3(el).length >= 2
    }
  ];

  // tools/importer/import-sub-brand-guide.js
  var PAGE_TEMPLATE = {
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
      },
      {
        "name": "columns-messaging",
        "instances": [
          "#safe-zones-1 .framer-jr9524"
        ]
      },
      {
        "name": "cards-steps",
        "instances": [
          ".framer-1cc5wk8 .framer-17e6tnf"
        ]
      },
      {
        "name": "columns-spectrum",
        "instances": [
          "#lookup .framer-1io5j2u"
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
  var parsers = {
    "hero-banner": parse,
    "video-autoplay": parse2,
    "cards-logo": parse3,
    "cards-tone": parse4,
    "columns-typeface": parse5,
    "cards-swatch": parse6,
    "cards-contrast": parse7,
    "cards-shape": parse8,
    "columns-panel": parse9,
    "columns-photos": parse10,
    "cards-framed": parse11,
    "columns-text-image": parse12,
    "cards-misuse": parse13,
    "columns-messaging": parse14,
    "cards-steps": parse15,
    "columns-spectrum": parse16
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
  function findBlocksOnPage(document2, template) {
    const byName = Object.fromEntries(detectors.map((d) => [d.name, d]));
    const mapped = [];
    template.blocks.forEach((blockDef) => {
      const det = byName[blockDef.name];
      blockDef.instances.forEach((selector) => {
        let els = [];
        try {
          els = [...document2.querySelectorAll(selector)];
        } catch (e) {
          els = [];
        }
        els.forEach((element) => {
          if (mapped.some((m) => m.element === element || m.element.contains(element) || element.contains(m.element))) return;
          if (det && det.validate && !det.validate(element)) return;
          mapped.push({ name: blockDef.name, selector, element, source: "mapped" });
        });
      });
    });
    const required = [...new Set((template.sections || []).flatMap((sec) => sec.blocks || []))];
    const complete = required.length > 0 && required.every((name) => mapped.some((m) => m.name === name));
    if (complete) return sortByDocumentOrder(mapped);
    const names = template.blocks.map((b) => b.name);
    const active = detectors.filter((d) => names.includes(d.name));
    const detected = detect(document2, active, mapped);
    return sortByDocumentOrder([...mapped, ...detected]);
  }
  function mp4Size(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    for (let i = 4; i + 4 <= bytes.length; i += 1) {
      if (bytes[i] === 116 && bytes[i + 1] === 107 && bytes[i + 2] === 104 && bytes[i + 3] === 100) {
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
  function mp4HasAudio(buffer) {
    const bytes = new Uint8Array(buffer);
    for (let i = 4; i + 12 <= bytes.length; i += 1) {
      if (bytes[i] === 104 && bytes[i + 1] === 100 && bytes[i + 2] === 108 && bytes[i + 3] === 114 && String.fromCharCode(bytes[i + 12], bytes[i + 13], bytes[i + 14], bytes[i + 15]) === "soun") return true;
    }
    return false;
  }
  function loadVideoMetadata(document2) {
    return __async(this, null, function* () {
      const all = [...document2.querySelectorAll("video")];
      const vids = all.filter((v) => v.readyState < 1);
      yield Promise.all(vids.map((v) => new Promise((resolve) => {
        const done = () => resolve();
        v.addEventListener("loadedmetadata", done, { once: true });
        v.addEventListener("error", done, { once: true });
        setTimeout(done, 1e4);
        try {
          v.preload = "metadata";
          v.load();
        } catch (e) {
          done();
        }
      })));
      all.filter((v) => v.videoWidth).forEach((v) => {
        v.setAttribute("data-excat-video-width", String(v.videoWidth));
        v.setAttribute("data-excat-video-height", String(v.videoHeight));
      });
      yield Promise.all(all.filter((v) => !v.videoWidth).map((v) => __async(null, null, function* () {
        const src = v.currentSrc || v.getAttribute("src") || v.querySelector("source[src]") && v.querySelector("source[src]").getAttribute("src");
        if (!src) return;
        try {
          const res = yield fetch(src, { headers: { Range: "bytes=0-262143" } });
          const size = mp4Size(yield res.arrayBuffer());
          if (size) {
            v.setAttribute("data-excat-video-width", String(size[0]));
            v.setAttribute("data-excat-video-height", String(size[1]));
          }
        } catch (e) {
        }
      })));
      yield Promise.all(all.map((v) => __async(null, null, function* () {
        const src = v.currentSrc || v.getAttribute("src") || v.querySelector("source[src]") && v.querySelector("source[src]").getAttribute("src");
        if (!src) return;
        try {
          const res = yield fetch(src, { headers: { Range: "bytes=0-262143" } });
          v.setAttribute("data-excat-video-audio", mp4HasAudio(yield res.arrayBuffer()) ? "true" : "false");
        } catch (e) {
        }
      })));
      yield new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  }
  function averageColour(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const done = (v) => resolve(v);
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = 32;
          c.height = 32;
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0, 32, 32);
          const d = g.getImageData(0, 0, 32, 32).data;
          const sum = [0, 0, 0];
          let n = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            sum[0] += d[i];
            sum[1] += d[i + 1];
            sum[2] += d[i + 2];
            n += 1;
          }
          done(n ? sum.map((s) => Math.round(s / n)) : null);
        } catch (e) {
          done(null);
        }
      };
      img.onerror = () => done(null);
      setTimeout(() => done(null), 8e3);
      const url = src.split("?")[0];
      img.src = /framerusercontent\.com\/images\//.test(url) ? `${url}?width=64` : src;
    });
  }
  function measureBandTextures(document2) {
    return __async(this, null, function* () {
      const root = document2.querySelector("#main") || document2.body;
      const bands = [...root.querySelectorAll("section")].filter((s) => !s.parentElement.closest("section"));
      yield Promise.all(bands.map((band) => __async(null, null, function* () {
        if (!(band.textContent || "").replace(/\s+/g, "").length) return;
        const box = band.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const candidates = [...band.children, ...[...band.children].flatMap((c) => [...c.children])];
        const layer = candidates.find((el) => {
          if ((el.textContent || "").trim() || el.querySelectorAll("img").length !== 1) return false;
          if (getComputedStyle(el).position !== "absolute") return false;
          const r = el.getBoundingClientRect();
          return r.width * r.height >= 0.9 * box.width * box.height;
        });
        if (!layer) return;
        const rgb = yield averageColour(layer.querySelector("img").currentSrc || layer.querySelector("img").src);
        if (!rgb) return;
        band.setAttribute("data-excat-band-color", `rgb(${rgb.join(", ")})`);
        layer.setAttribute("data-excat-band-layer", "true");
      })));
    });
  }
  var import_sub_brand_guide_default = {
    onLoad: (_0) => __async(null, [_0], function* ({ document: document2 }) {
      try {
        yield loadVideoMetadata(document2);
      } catch (e) {
        console.warn("video metadata load failed", e);
      }
      try {
        yield measureBandTextures(document2);
      } catch (e) {
        console.warn("band texture measure failed", e);
      }
    }),
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.isConnected) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
          detection: pageBlocks.map((b) => `${b.name}:${b.source}`)
        }
      }];
    }
  };
  return __toCommonJS(import_sub_brand_guide_exports);
})();

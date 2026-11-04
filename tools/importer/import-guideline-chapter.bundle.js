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

  // tools/importer/import-guideline-chapter.js
  var import_guideline_chapter_exports = {};
  __export(import_guideline_chapter_exports, {
    default: () => import_guideline_chapter_default
  });

  // tools/importer/parsers/cards-swatch.js
  function textOf(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  var isLabel = (t) => /^(hex|rgb|cmyk|pms|pantone|ral)\s*:?$/i.test(t);
  var isNoise = (t) => /^copy( hex| to clipboard)?$/i.test(t);
  function tileOf(heading, root) {
    let node = heading;
    while (node.parentElement && node.parentElement !== root && node.parentElement.querySelectorAll(HEADINGS).length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function parse(element, { document }) {
    const headings2 = [...element.querySelectorAll(HEADINGS)].filter((h) => textOf(h) && !isNoise(textOf(h)));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const tiles = [];
    const notes = [];
    const addNote = (t) => {
      if (!notes.includes(t)) notes.push(t);
    };
    headings2.forEach((heading) => {
      const tile = tileOf(heading, element);
      tiles.push(tile);
      const name = textOf(heading);
      const texts = [...tile.querySelectorAll("p")].filter((p) => !p.closest("button")).map((p) => textOf(p)).filter((t) => t && !isNoise(t) && t !== name);
      const values = [];
      for (let i = 0; i < texts.length; i += 1) {
        const t = texts[i];
        const inline2 = t.match(/^(hex|rgb|cmyk|pms|pantone|ral)\s*:\s*(.+)$/i);
        if (inline2) {
          values.push(`${inline2[1]}: ${inline2[2]}`);
        } else if (isLabel(t) && texts[i + 1] && !isLabel(texts[i + 1])) {
          values.push(`${t.replace(/\s*:?$/, "")}: ${texts[i + 1]}`);
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
        const pic = document.createElement("img");
        pic.src = imgSrc(img);
        pic.alt = img.getAttribute("alt") || name;
        imageCell.push(pic);
      }
      const textCell = [];
      const h3 = document.createElement("h3");
      h3.textContent = name;
      textCell.push(h3);
      values.forEach((v) => {
        const p = document.createElement("p");
        p.textContent = v;
        textCell.push(p);
      });
      cells.push([imageCell.length ? imageCell : "", textCell]);
    });
    [...element.querySelectorAll("p")].filter((p) => textOf(p) && !isNoise(textOf(p)) && !p.closest("button")).filter((p) => !tiles.some((t) => t.contains(p))).forEach((p) => addNote(textOf(p)));
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-swatch", cells });
    element.replaceWith(block);
    let anchor = block;
    notes.forEach((note) => {
      const p = document.createElement("p");
      p.textContent = note;
      anchor.after(p);
      anchor = p;
    });
  }

  // tools/importer/parsers/columns-text-image.js
  var AO_COLOURS = [
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
  function colourName(rgb) {
    let best = null;
    AO_COLOURS.forEach(([name, ref]) => {
      const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
      if (d <= 8 && (!best || d < best.d)) best = { d, name };
    });
    return best ? best.name : `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  function tileColour(img, column) {
    for (let n = img.parentElement; n && n !== column.parentElement; n = n.parentElement) {
      const rgb = paintOf(n);
      if (rgb) return rgb.every((c) => c >= 245) ? "" : colourName(rgb);
    }
    return "";
  }
  function textOf2(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc2(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function hasContent(el) {
    return !!textOf2(el) || !!el.querySelector('img:not([src^="data:"]), img[src^="data:image/svg+xml"], video');
  }
  function contentOf(document, root, seenImgs) {
    const out = [];
    root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, video").forEach((node) => {
      if (node.tagName === "IMG") {
        const src = imgSrc2(node);
        if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seenImgs.has(src)) return;
        seenImgs.add(src);
        const img = document.createElement("img");
        img.src = src;
        img.alt = node.getAttribute("alt") || "";
        out.push(img);
        return;
      }
      if (node.tagName === "VIDEO") {
        const src = node.getAttribute("src") || (node.querySelector("source[src]") || {}).src;
        if (!src) return;
        const a = document.createElement("a");
        a.href = src;
        a.textContent = src;
        out.push(a);
        return;
      }
      if (node.parentElement.closest("ul, ol, p, h1, h2, h3, h4, h5, h6")) return;
      if (!textOf2(node)) return;
      const el = document.createElement(node.tagName.toLowerCase());
      if (/^[UO]L$/.test(node.tagName)) {
        node.querySelectorAll("li").forEach((li) => {
          const nli = document.createElement("li");
          nli.textContent = textOf2(li);
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
  function parse2(element, { document }) {
    let columns = [...element.children].filter(hasContent);
    while (columns.length === 1 && [...columns[0].children].filter(hasContent).length > 1) {
      columns = [...columns[0].children].filter(hasContent);
    }
    const seenImgs = /* @__PURE__ */ new Set();
    let row = columns.map((col) => contentOf(document, col, seenImgs)).filter((c) => c.length);
    if (row.length === 1) {
      const textCell = row[0].filter((n) => n.tagName !== "IMG");
      const imgCell = row[0].filter((n) => n.tagName === "IMG");
      row = imgCell.length && textCell.length ? [textCell, imgCell] : [row[0], ""];
    }
    const imgCol = columns.find((c) => c.querySelector("img") && !textOf2(c));
    if (row.length === 2 && imgCol && columns[0] === imgCol && Array.isArray(row[1])) {
      const colour = tileColour(imgCol.querySelector("img"), imgCol);
      if (colour) {
        const p = document.createElement("p");
        p.textContent = `Background: ${colour}`;
        row[1].push(p);
      }
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-text-image", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-photos.js
  function imgSrc3(img) {
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
  function cellOf(document, source, seen) {
    if (source.tagName === "VIDEO") {
      const src2 = videoSrc(source);
      if (!src2 || seen.has(src2)) return null;
      seen.add(src2);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = src2;
      a.textContent = src2;
      p.append(a);
      return p;
    }
    const src = imgSrc3(source);
    if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return null;
    seen.add(src);
    const img = document.createElement("img");
    img.src = src;
    img.alt = source.getAttribute("alt") || "";
    const position = positionOf(source);
    if (!position) return img;
    const line = document.createElement("p");
    line.textContent = `Position: ${position}`;
    return [img, line];
  }
  function parse3(element, { document }) {
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    const columns = mediaColumns(element);
    if (columns) {
      const stacks = columns.map((col) => [...col.querySelectorAll("img, video")].map((m) => cellOf(document, m, seen)).filter(Boolean));
      const rows = Math.max(...stacks.map((st) => st.length));
      for (let r = 0; r < rows; r += 1) cells.push(stacks.map((st) => st[r] || ""));
    } else {
      const photos = [...element.querySelectorAll("img")].map((m) => cellOf(document, m, seen)).filter(Boolean);
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
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-photos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-autoplay.js
  function imgSrc4(img) {
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
  function parse4(element, { document }) {
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
      const img = document.createElement("img");
      img.src = posterUrl || imgSrc4(posterImg);
      img.alt = posterImg && posterImg.getAttribute("alt") || "";
      cell.push(img);
    }
    if (src) {
      const p = document.createElement("p");
      const a = document.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gradient.js
  function textOf3(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var TEXT = "p, h1, h2, h3, h4, h5, h6";
  var textEls = (el) => [...el.querySelectorAll(TEXT)].filter((t) => textOf3(t) && !t.parentElement.closest(TEXT));
  var titleCase = (t) => t.replace(/\b([a-z])/g, (m) => m.toUpperCase());
  function isTile(el) {
    const kids3 = [...el.children].filter((c) => textOf3(c));
    if (kids3.length !== 2) return false;
    if (textEls(kids3[0]).length !== 1) return false;
    const stops = [...kids3[1].children].filter((c) => textOf3(c));
    return stops.length >= 2 && stops.every((s) => textEls(s).length === 1);
  }
  function parse5(element, { document }) {
    const tiles = [];
    element.querySelectorAll("*").forEach((el) => {
      if (tiles.some((t) => t.contains(el))) return;
      if (isTile(el)) tiles.push(el);
    });
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      const [nameGroup, stopGroup] = [...tile.children].filter((c) => textOf3(c));
      const name = textOf3(textEls(nameGroup)[0]);
      const stops = [...stopGroup.children].filter((c) => textOf3(c)).map((s) => titleCase(textOf3(s)));
      const key = `${name}|${stops.join("|")}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const h3 = document.createElement("h3");
      h3.textContent = name;
      const ul = document.createElement("ul");
      stops.forEach((stop) => {
        const li = document.createElement("li");
        li.textContent = stop;
        ul.append(li);
      });
      cells.push([[h3, ul]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-gradient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-contrast.js
  function textOf4(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function captionPair(p) {
    const strongs = [...p.querySelectorAll("strong, b")].map(textOf4).filter(Boolean);
    if (strongs.length >= 2) return [strongs[0], strongs[1]];
    const m = textOf4(p).match(/background\s*:?\s*(.+?)\s*text\s*:?\s*(.+)$/i);
    return m ? [m[1], m[2]] : null;
  }
  function captionLine(document, label, value) {
    const p = document.createElement("p");
    p.append(`${label}: `);
    const strong = document.createElement("strong");
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
  function tileBackground(document, tile) {
    const view = document.defaultView;
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
  function rectOf(el) {
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
  function tileImage(document, tile) {
    const imgs = contentImgs(tile);
    if (imgs.length === 1 && imgs[0].hasAttribute("data-excat-tile")) {
      const img = document.createElement("img");
      img.src = imgs[0].getAttribute("src");
      img.alt = imgs[0].getAttribute("alt") || "";
      return img;
    }
    const box = rectOf(tile);
    const W = Math.round(box ? box.width : 90);
    const H = Math.round(box ? box.height : 90);
    const bg = tileBackground(document, tile);
    const parts = imgs.map((img) => {
      const r = rectOf(img);
      const w = r ? r.width : parseFloat(img.getAttribute("width")) || W / 2;
      const h = r ? r.height : parseFloat(img.getAttribute("height")) || H / 2;
      const x = r && box ? r.left - box.left : (W - w) / 2;
      const y = r && box ? r.top - box.top : (H - h) / 2;
      return `<image href="${esc(img.getAttribute("src"))}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg ? `<rect width="${W}" height="${H}" fill="${esc(bg)}"/>` : ""}${parts.join("")}</svg>`;
    const out = document.createElement("img");
    out.src = `data:image/svg+xml;base64,${toBase64(svg)}`;
    out.alt = imgs.map((i) => i.getAttribute("alt") || "").find(Boolean) || "";
    return out;
  }
  function imageTiles(element) {
    let grid = element;
    for (; ; ) {
      const kids3 = [...grid.children].filter((c) => contentImgs(c).length);
      if (kids3.length !== 1 || contentImgs(kids3[0]).length <= 2) break;
      [grid] = kids3;
    }
    return [...grid.children].filter((c) => contentImgs(c).length);
  }
  function parse6(element, { document }) {
    const paras = [...element.querySelectorAll("p, h1, h2, h3, h4, h5, h6")].filter((p) => textOf4(p));
    const cells = [];
    if (!paras.some((p) => /^background/i.test(textOf4(p))) && contentImgs(element).length) {
      imageTiles(element).forEach((tile) => cells.push([[tileImage(document, tile)]]));
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-contrast", cells });
      element.replaceWith(block2);
      return;
    }
    paras.forEach((p, i) => {
      if (!/^background/i.test(textOf4(p))) return;
      const pair = captionPair(p);
      if (!pair) return;
      const prev = paras[i - 1];
      const sample = prev && !/^background/i.test(textOf4(prev)) && textOf4(prev).length <= 4 ? textOf4(prev) : "Aa";
      const sampleP = document.createElement("p");
      sampleP.textContent = sample;
      cells.push([[sampleP, captionLine(document, "Background", pair[0]), captionLine(document, "Text", pair[1])]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-contrast", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logo.js
  var AO_COLOURS2 = [
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
  function parseRgb2(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function paintOf2(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return null;
    try {
      return parseRgb2(view.getComputedStyle(el).backgroundColor);
    } catch (e) {
      return null;
    }
  }
  var isWhitish = (rgb) => rgb.every((c) => c >= 245);
  function colourName2(rgb) {
    let best = null;
    AO_COLOURS2.forEach(([name, ref]) => {
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
  function tileColour2(img, tile) {
    const band = bandOf(img);
    for (let n = img.parentElement; n && n.nodeType === 1; n = n.parentElement) {
      const rgb = paintOf2(n);
      if (rgb && isArtworkPaint(n, img)) continue;
      if (rgb) {
        if (isWhitish(rgb)) return "";
        const name = colourName2(rgb);
        if (n === tile || tile.contains(n)) return name;
        if (band && n === band) return "";
        if (sectionStyles(img).includes(slug(name))) return "None";
        return name;
      }
    }
    return "";
  }
  function textOf5(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc5(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function tileOf2(img, root) {
    let node = img;
    while (node.parentElement && node.parentElement !== root && node.parentElement.querySelectorAll('img:not([src^="data:"]), img[src^="data:image/svg+xml"]').length === 1) {
      node = node.parentElement;
    }
    return node;
  }
  function parse7(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll("img").forEach((source) => {
      const src = imgSrc5(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return;
      seen.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      const tile = tileOf2(source, element);
      const label = textOf5(tile);
      const colour = tileColour2(source, tile);
      const textCell = [];
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        textCell.push(p);
      }
      if (colour) {
        const p = document.createElement("p");
        p.textContent = `Background: ${colour}`;
        textCell.push(p);
      }
      cells.push([img, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-logo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-framed.js
  function textOf6(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc6(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  var HEADINGS2 = "h1, h2, h3, h4, h5, h6";
  var TEXT2 = `p, li, ${HEADINGS2}`;
  var isContentImg2 = (img) => {
    const src = img.getAttribute("src") || "";
    return !!src && (!src.startsWith("data:") || src.startsWith("data:image/svg+xml"));
  };
  var contentImgs2 = (el) => [...el.querySelectorAll("img")].filter(isContentImg2);
  var area = (img) => (parseFloat(img.getAttribute("width")) || 1) * (parseFloat(img.getAttribute("height")) || 1);
  var hasContent2 = (el) => !!textOf6(el) || contentImgs2(el).length > 0;
  var textNodesOf = (el) => [...el.querySelectorAll(TEXT2)].filter((n) => !n.parentElement.closest(TEXT2) && textOf6(n));
  function tilesOf(element) {
    let grid = element;
    for (let kids4 = [...grid.children].filter(hasContent2); kids4.length === 1 && contentImgs2(kids4[0]).length > 1; kids4 = [...grid.children].filter(hasContent2)) {
      [grid] = kids4;
    }
    const kids3 = [...grid.children].filter(hasContent2);
    const withImg = kids3.filter((k) => contentImgs2(k).length);
    if (withImg.length >= 1 && withImg.every((k) => contentImgs2(k).length === 1)) {
      return { tiles: withImg, notes: kids3.filter((k) => !contentImgs2(k).length) };
    }
    return { tiles: [grid], notes: [] };
  }
  function frameHeight(img, tile) {
    if (typeof tile.getBoundingClientRect === "function" && !textOf6(tile)) {
      return tile.getBoundingClientRect().height || 0;
    }
    let frame = img;
    while (frame.parentElement && frame.parentElement !== tile && !textOf6(frame.parentElement)) frame = frame.parentElement;
    if (typeof frame.getBoundingClientRect !== "function") return 0;
    return frame.getBoundingClientRect().height || 0;
  }
  var HD_BLUE = [0, 120, 255];
  function parseRgb3(value) {
    const m = (value || "").match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m || m[4] !== void 0 && parseFloat(m[4]) === 0) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  function paintOf3(el) {
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
      const rgb = paintOf3(n);
      if (rgb) return rgb;
      if (n === tile) break;
    }
    return null;
  }
  function gridPaint(tile, element) {
    const sig = (el) => `${textOf6(el)}|${contentImgs2(el).length}`;
    const own = sig(element);
    for (let n = tile.parentElement; n && n.tagName !== "SECTION"; n = n.parentElement) {
      if (!n.contains(element) || n === element || sig(n) === own) {
        const rgb = paintOf3(n);
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
  function parse8(element, { document }) {
    const { tiles, notes } = tilesOf(element);
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const heights = [];
    const frames = [];
    tiles.forEach((tile) => {
      const art = contentImgs2(tile).sort((a, b) => area(b) - area(a))[0];
      const texts = textNodesOf(tile);
      if (!art && !texts.length) return;
      const src = art ? imgSrc6(art) : "";
      const key = `${src}|${texts.map(textOf6).join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (art) {
        heights.push(frameHeight(art, tile));
        frames.push({ tile, paint: framePaint(art, tile), fills: fillsTile(art, tile) });
      }
      let imageCell = "";
      if (art) {
        imageCell = document.createElement("img");
        imageCell.src = src;
        imageCell.alt = art.getAttribute("alt") || "";
      }
      const textCell = texts.map((n, i) => {
        const t = textOf6(n);
        const isTitle = i === 0 && texts.length > 1 && (/^H[1-6]$/.test(n.tagName) || t.split(" ").length <= 6);
        const el = document.createElement(isTitle ? "h3" : "p");
        el.textContent = t;
        return el;
      });
      cells.push([imageCell, textCell.length ? textCell : ""]);
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
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
    let anchor = block;
    notes.forEach((note) => {
      textNodesOf(note).forEach((t) => {
        const el = document.createElement(/^H[1-6]$/.test(t.tagName) ? t.tagName.toLowerCase() : "p");
        el.textContent = textOf6(t);
        anchor.after(el);
        anchor = el;
      });
    });
  }

  // tools/importer/parsers/cards-misuse.js
  function textOf7(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc7(img) {
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
  var hasContent3 = (el) => !!textOf7(el) || contentImgs3(el).length > 0;
  var isTile2 = (el) => !!textOf7(el) && contentImgs3(el).length > 0;
  function tilesOf2(element) {
    let grid = element;
    for (; ; ) {
      const kids4 = [...grid.children].filter(hasContent3);
      if (kids4.length !== 1 || !isTile2(kids4[0])) break;
      const inner = [...kids4[0].children].filter(hasContent3);
      if (inner.length >= 2 && !inner.every(isTile2)) break;
      [grid] = kids4;
    }
    const kids3 = [...grid.children].filter(hasContent3);
    return kids3.every(isTile2) ? kids3 : [grid];
  }
  function parse9(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    tilesOf2(element).forEach((tile) => {
      const photo = contentImgs3(tile).sort((a, b) => area2(b) - area2(a))[0];
      const captions = [...tile.querySelectorAll(TEXT3)].filter((n) => !n.parentElement.closest(TEXT3)).map(textOf7).filter(Boolean);
      if (!photo && !captions.length) return;
      const src = photo ? imgSrc7(photo) : "";
      const key = `${src}|${captions.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (photo) {
        imageCell = document.createElement("img");
        imageCell.src = src;
        imageCell.alt = photo.getAttribute("alt") || "";
      }
      const textCell = captions.map((t) => {
        const p = document.createElement("p");
        p.textContent = t;
        return p;
      });
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-misuse", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-panel.js
  function imgSrc8(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function parseRgb4(value) {
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
        rgb = parseRgb4(view.getComputedStyle(n).backgroundColor);
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
  function parse10(element, { document }) {
    const row = [];
    const seen = /* @__PURE__ */ new Set();
    const sources = [];
    element.querySelectorAll("img").forEach((source) => {
      const src = imgSrc8(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return;
      seen.add(src);
      sources.push(source);
      const img = document.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || "";
      row.push(img);
    });
    const cells = [row.length ? row : [""]];
    const variant = panelVariant(element, sources);
    const name = variant ? `columns-panel (${variant})` : "columns-panel";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-typeface.js
  function textOf8(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var HEADINGS3 = "h1, h2, h3, h4, h5, h6";
  var WEIGHT_RE = /^(bold|black|heavy|semibold|semi-bold|extrabold|extra-bold)$/i;
  var GLYPH_RE = /\d{3,}\s*[^\sA-Za-z\d]{0,3}\s*[&%#@$!?*]|(?:[\u3400-\u9fff]\s*){4,}/;
  var GLYPH_RE_G = new RegExp(GLYPH_RE.source, "g");
  var isSpecimen = (el) => GLYPH_RE.test(el.textContent || "");
  var glyphCount = (el) => ((el.textContent || "").match(GLYPH_RE_G) || []).length;
  function rowsOf(el) {
    if (glyphCount(el) <= 1) return [el];
    const parts = [...el.children].filter((c) => textOf8(c) && isSpecimen(c));
    if (!parts.length) return [el];
    return parts.flatMap(rowsOf);
  }
  function linesOf(p) {
    const clone = p.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    clone.querySelectorAll("strong, b").forEach((s) => {
      const next = s.nextSibling;
      if (next && next.nodeType === 3 && /^[^\s,.;:!?]/.test(next.textContent)) s.after("\n");
    });
    return clone.textContent.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  }
  function specimenParagraph(document, line) {
    const p = document.createElement("p");
    const words2 = line.split(" ");
    if (words2.length > 1 && words2.some((w) => WEIGHT_RE.test(w))) {
      words2.forEach((w, i) => {
        if (i) p.append(" ");
        if (WEIGHT_RE.test(w)) {
          const strong = document.createElement("strong");
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
  function buildRow(document, source) {
    const heading = [...source.querySelectorAll(HEADINGS3)].find((h) => textOf8(h));
    let textGroup = heading ? textGroupOf(heading, source) : null;
    if (!textGroup) {
      const halves = [...source.children].filter((c) => textOf8(c));
      const other = halves.length === 2 ? halves.find((c) => !isSpecimen(c)) : null;
      if (other && /[a-z]{3,}/i.test(textOf8(other)) && textOf8(other).split(" ").length >= 6) textGroup = other;
    }
    const specimen = [];
    source.querySelectorAll("p").forEach((p) => {
      if (textGroup && textGroup.contains(p)) return;
      if (p.parentElement.closest("p")) return;
      linesOf(p).forEach((line) => specimen.push(specimenParagraph(document, line)));
    });
    const copy = [];
    if (textGroup) {
      textGroup.querySelectorAll(`${HEADINGS3}, p`).forEach((node) => {
        if (node.parentElement.closest(`${HEADINGS3}, p`)) return;
        const t = textOf8(node);
        if (!t) return;
        const el = document.createElement(node.tagName.toLowerCase());
        el.textContent = t;
        copy.push(el);
      });
    }
    const glyphAt = specimen.findIndex((p) => GLYPH_RE.test(p.textContent));
    if (glyphAt >= 2) {
      const name = specimen[0];
      specimen.slice(1, glyphAt).forEach((p) => {
        name.append(document.createElement("br"), ...p.childNodes);
      });
      specimen.splice(1, glyphAt - 1);
    }
    return [specimen.length ? specimen : "", copy.length ? copy : ""];
  }
  function parse11(element, { document }) {
    const sources = [element];
    let anchor = element;
    while (!(anchor.nextElementSibling && isSpecimen(anchor.nextElementSibling)) && anchor.parentElement && [...anchor.parentElement.children].filter((c) => textOf8(c)).length === 1) {
      anchor = anchor.parentElement;
    }
    let next = anchor.nextElementSibling;
    const siblings = [];
    while (next && isSpecimen(next)) {
      siblings.push(next);
      sources.push(...rowsOf(next));
      next = next.nextElementSibling;
    }
    const cells = sources.map((s) => buildRow(document, s));
    siblings.forEach((s) => s.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-typeface", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-shape.js
  function textOf9(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imgSrc9(img) {
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
  function rectOf2(el) {
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
    const box = rectOf2(element);
    if (!box || imgs.length < 3) return null;
    return imgs.find((img) => {
      const r = rectOf2(img);
      return r && r.width * r.height >= 0.9 * box.width * box.height;
    }) || null;
  }
  function halfGroupOf(element) {
    let group = element;
    while (group.parentElement && group.parentElement.tagName !== "SECTION" && group.parentElement.querySelectorAll(HEADING).length <= element.querySelectorAll(HEADING).length + 1 && group.parentElement.querySelectorAll(CONTENT_IMG).length === element.querySelectorAll(CONTENT_IMG).length) {
      group = group.parentElement;
    }
    if (group === element) return null;
    const heads = [...group.querySelectorAll(HEADING)].filter((h) => !element.contains(h) && textOf9(h));
    if (heads.length !== 1) return null;
    const row = group.parentElement;
    const g = rectOf2(group);
    const r = rectOf2(row);
    if (!g || !r || g.width > 0.6 * r.width) return null;
    const sibling = [...row.children].some((c) => {
      if (c === group) return false;
      const cr = rectOf2(c);
      return cr && Math.abs(cr.top - g.top) < 4 && c.querySelector(HEADING) && c.querySelector(CONTENT_IMG);
    });
    if (!sibling) return null;
    const caption = [...group.querySelectorAll("p")].filter((p) => !element.contains(p) && !p.parentElement.closest("p") && textOf9(p));
    return { group, heading: heads[0], caption };
  }
  function layoutOf(imgs) {
    const rects = imgs.map(rectOf2).filter(Boolean);
    if (!rects.length) return null;
    const widths = rects.map((r) => r.width).sort((a, b) => a - b);
    const top = Math.min(...rects.map((r) => r.top));
    const firstRow = rects.filter((r) => r.top < top + Math.min(...rects.map((x) => x.height)) * 0.8);
    return { median: widths[Math.floor(widths.length / 2)], cols: firstRow.length, left: Math.min(...firstRow.map((r) => r.left)) };
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
  function parse12(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const sources = [...element.querySelectorAll("img")].filter((source) => {
      const src = imgSrc9(source);
      if (!src || src.startsWith("data:") && !src.startsWith("data:image/svg+xml") || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
    const backdrop = backdropOf(element, sources);
    const half = halfGroupOf(element);
    const options = [];
    if (half) {
      const h = document.createElement(half.heading.tagName.toLowerCase());
      h.textContent = textOf9(half.heading);
      cells.push([h]);
      options.push("half");
    }
    const tiles = [];
    const artworks = [];
    sources.forEach((source) => {
      const img = document.createElement("img");
      img.src = imgSrc9(source);
      img.alt = source.getAttribute("alt") || "";
      if (source === backdrop) {
        const line = document.createElement("p");
        line.textContent = "Backdrop";
        cells.push([img, line]);
        return;
      }
      const tile = tileOf3(source, element);
      tiles.push(tile);
      artworks.push(source);
      const name2 = textOf9(tile);
      let textCell = "";
      if (name2) {
        textCell = document.createElement("p");
        textCell.textContent = name2;
      }
      cells.push([img, textCell]);
    });
    if (half && half.caption.length) {
      cells.push([half.caption.map((p) => {
        const out = document.createElement("p");
        out.textContent = textOf9(p);
        return out;
      })]);
    }
    if (!half && !backdrop) {
      const layout = layoutOf(artworks);
      const box = rectOf2(element);
      const leftAligned = !!(layout && box && Math.abs(layout.left - box.left) <= 2);
      if (layout && layout.cols === 4 && layout.median >= 120 && leftAligned && !isFramed(element)) options.push("logos");
      else if (isFramed(element)) options.push("framed");
    }
    if (half) {
      half.heading.remove();
      half.caption.forEach((p) => p.remove());
    }
    const name = options.length ? `cards-shape (${options.join(", ")})` : "cards-shape";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-principle.js
  function textOf10(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var TEXT4 = "h1, h2, h3, h4, h5, h6, p";
  function parse13(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    [...element.children].filter((c) => textOf10(c)).forEach((card) => {
      const nodes = [...card.querySelectorAll(TEXT4)].filter((n) => !n.parentElement.closest(TEXT4) && textOf10(n));
      const key = nodes.map(textOf10).join(" / ").toLowerCase();
      if (!nodes.length || seen.has(key)) return;
      seen.add(key);
      const cell = nodes.map((n, i) => {
        const isTitle = i === 0 && (/^H[1-6]$/.test(n.tagName) || nodes.length > 1);
        const el = document.createElement(isTitle ? "h3" : "p");
        el.textContent = textOf10(n);
        return el;
      });
      cells.push([cell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-principle", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-voice.js
  function textOf11(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var TEXT5 = "h1, h2, h3, h4, h5, h6, p";
  var HEADING_RE = /^H[1-6]$/;
  var kids = (el) => [...el.children].filter((c) => textOf11(c));
  var textNodes = (el) => [...el.querySelectorAll(TEXT5)].filter((n) => !n.parentElement.closest(TEXT5) && textOf11(n));
  function isPair(el) {
    const k = kids(el);
    return k.length === 2 && k.every((t) => textNodes(t).length >= 2 && t.querySelector("h1, h2, h3, h4, h5, h6"));
  }
  function pairOf(example) {
    let node = example;
    for (let i = 0; i < 4 && node; i += 1) {
      if (isPair(node)) return node;
      const k = kids(node);
      node = k.length === 1 ? k[0] : k.find(isPair) || null;
    }
    return null;
  }
  function tileCell(document, tile) {
    return textNodes(tile).map((n, i) => {
      const el = document.createElement(i === 0 ? "h3" : "p");
      el.textContent = textOf11(n);
      return el;
    });
  }
  function parse14(element, { document }) {
    const cells = [];
    const before = [];
    kids(element).forEach((child) => {
      const pair = pairOf(child);
      if (!pair) {
        if (!cells.length) before.push(child);
        return;
      }
      const labelNodes = textNodes(child).filter((n) => !pair.contains(n));
      let label = "";
      if (labelNodes.length) {
        label = document.createElement("p");
        label.textContent = labelNodes.map(textOf11).join(" ");
      }
      const [a, b] = kids(pair);
      cells.push([label, tileCell(document, a), tileCell(document, b)]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-voice", cells });
    before.forEach((child) => {
      const nodes = /^(P|H[1-6])$/.test(child.tagName) ? [child] : textNodes(child);
      nodes.forEach((n) => {
        const el = document.createElement(HEADING_RE.test(n.tagName) ? n.tagName.toLowerCase() : "p");
        el.textContent = textOf11(n);
        element.before(el);
      });
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-terms.js
  function textOf12(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var kids2 = (el) => [...el.children].filter((c) => textOf12(c) || c.querySelector("img"));
  var TEXT6 = "p, h1, h2, h3, h4, h5, h6";
  var textNodes2 = (el) => [...el.querySelectorAll(TEXT6)].filter((n) => !n.parentElement.closest(TEXT6) && textOf12(n));
  var iconOf = (el) => el.querySelector('img[src^="data:image/svg+xml"]');
  function iconKind(img) {
    const alt = (img.getAttribute("alt") || "").toLowerCase();
    if (/cross|close|wrong|incorrect|dont|don't|\bno\b/.test(alt)) return "Incorrect";
    if (/tick|check|correct|\byes\b/.test(alt)) return "Correct";
    let svg = "";
    try {
      svg = atob((img.getAttribute("src") || "").split(",")[1] || "");
    } catch (e) {
      svg = "";
    }
    const m = svg.match(/stroke="#([0-9a-f]{6})"/i) || svg.match(/fill="#([0-9a-f]{6})"/i);
    if (m) {
      const [r, g] = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16)];
      if (r > 180 && g < 140) return "Incorrect";
    }
    return "Correct";
  }
  function fontSize(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    const view = el && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return 0;
    try {
      return parseFloat(view.getComputedStyle(el).fontSize) || 0;
    } catch (e) {
      return 0;
    }
  }
  function itemsOf(document, p) {
    const runs = [];
    const walker = document.createTreeWalker(p, 1 | 4);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === 1 && n.tagName === "BR") runs.push({ br: true });
      else if (n.nodeType === 3 && n.textContent.trim()) runs.push({ text: n.textContent, size: fontSize(n) });
    }
    const base = Math.max(0, ...runs.filter((r) => r.text).map((r) => r.size));
    const items = [];
    let li = null;
    runs.forEach((r) => {
      if (r.br) {
        li = null;
        return;
      }
      if (!li) {
        li = document.createElement("li");
        items.push(li);
      }
      const text = r.text.replace(/\s+/g, " ");
      if (base && r.size && r.size < base * 0.8) {
        const em = document.createElement("em");
        em.textContent = text.trim();
        if (li.childNodes.length) li.append(" ");
        li.append(em);
      } else {
        li.append(text);
      }
    });
    items.forEach((item) => {
      const first = item.firstChild;
      const last = item.lastChild;
      if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "");
      if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, "");
      item.querySelectorAll("em").forEach((em) => {
        const prev = em.previousSibling;
        if (prev && prev.nodeType === 3) prev.textContent = `${prev.textContent.replace(/\s+$/, "")} `;
      });
    });
    return items.filter((item) => item.textContent.trim());
  }
  function listCell(document, items, marker) {
    const cell = [];
    if (marker) {
      const p = document.createElement("p");
      p.textContent = marker;
      cell.push(p);
    }
    const ul = document.createElement("ul");
    items.forEach((li) => ul.append(li));
    cell.push(ul);
    return cell;
  }
  function parse15(element, { document }) {
    const rows = kids2(element);
    const isIconGrid = rows.length >= 2 && rows.every((r) => kids2(r).length >= 2 && kids2(r).every((c) => iconOf(c)));
    const cells = [];
    if (isIconGrid) {
      const width = Math.max(...rows.map((r) => kids2(r).length));
      for (let i = 0; i < width; i += 1) {
        const colCells = rows.map((r) => kids2(r)[i]).filter(Boolean);
        const filled = colCells.filter((c) => textOf12(c));
        if (!filled.length) continue;
        const kinds = filled.map((c) => iconKind(iconOf(c)));
        const marker = kinds.filter((k) => k === "Incorrect").length > kinds.length / 2 ? "Incorrect" : "Correct";
        const items = filled.map((c) => {
          const li = document.createElement("li");
          li.textContent = textOf12(c);
          return li;
        });
        cells.push(listCell(document, items, marker));
      }
    } else {
      rows.forEach((col) => {
        const items = textNodes2(col).flatMap((p) => itemsOf(document, p));
        if (items.length) cells.push(listCell(document, items, ""));
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-terms", cells: [cells] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-social.js
  function textOf13(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  var TEXT7 = "p, h1, h2, h3, h4, h5, h6";
  function imgSrc10(img) {
    const src = img.getAttribute("src") || "";
    return /framerusercontent\.com\/images\//.test(src) ? src.split("?")[0] : src;
  }
  function inline(document, node, out) {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        out.append(n.textContent.replace(/\s+/g, " "));
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.tagName === "BR") {
        out.append(document.createElement("br"));
        return;
      }
      if (/^(STRONG|B)$/.test(n.tagName)) {
        const s = document.createElement("strong");
        inline(document, n, s);
        const tail = s.lastChild && s.lastChild.nodeName === "BR" ? s.lastChild : null;
        if (tail) tail.remove();
        if (s.textContent.trim()) out.append(s);
        if (tail) out.append(tail);
        return;
      }
      if (/^(EM|I)$/.test(n.tagName)) {
        const e = document.createElement("em");
        inline(document, n, e);
        out.append(e);
        return;
      }
      inline(document, n, out);
    });
  }
  function parse16(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    [...element.children].filter((c) => c.querySelector("img")).forEach((tile) => {
      const source = tile.querySelector("img");
      const src = imgSrc10(source);
      if (!src || seen.has(src)) return;
      seen.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = source.getAttribute("alt") || tile.getAttribute("data-framer-name") || "";
      const texts = [...tile.querySelectorAll(TEXT7)].filter((n) => !n.parentElement.closest(TEXT7) && textOf13(n));
      const textCell = texts.map((n) => {
        const p = document.createElement("p");
        inline(document, n, p);
        p.querySelectorAll("strong").forEach((s) => {
          const next = s.nextSibling;
          if (next && next.nodeType === 3 && /^\S/.test(next.textContent)) s.after(document.createElement("br"));
        });
        return p;
      });
      cells.push([img, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-social", cells });
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
  function toBase642(str) {
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
  function paintOf4(document, el) {
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
      const own = node.hasAttribute("data-excat-mask") ? null : paintOf4(document, node);
      const layer = own ? null : [...node.children].find((c) => !c.querySelector("img") && paintOf4(document, c));
      const paint = own || layer && paintOf4(document, layer);
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
    const textEls2 = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li")];
    textEls2.forEach((el) => {
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
      const words2 = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = collapse(n.textContent);
        if (t) words2.push(t);
      }
      if (words2.length > 1) h.textContent = words2.join(" ");
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
      const words2 = pair.map((x) => collapse(x.textContent));
      if (!words2.every((w) => w && w.split(" ").length <= 2)) return;
      if (collapse(row.textContent).replace(/\s/g, "") !== words2.join("").replace(/\s/g, "")) return;
      const kids3 = [...row.children];
      const a = kids3.findIndex((k) => k.contains(pair[0]));
      const b = kids3.findIndex((k) => k.contains(pair[1]));
      if (a === -1 || b - a < 2 || kids3.slice(a + 1, b).some((k) => collapse(k.textContent))) return;
      const out = document.createElement("h2");
      const em = document.createElement("em");
      em.textContent = words2[0];
      out.append(em, ` \u2194 ${words2[1]}`);
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
    if (overlaps) return false;
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
  function bandStyle(document, el, inherit = false) {
    const textured = parseRgb5(el.getAttribute(BAND_COLOR_ATTR));
    if (textured) return paletteStyle(textured);
    const view = document.defaultView;
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
  var TEXT_SEL = "h1, h2, h3, h4, h5, h6, p, li";
  function isCenteredBand(document, el) {
    const view = document.defaultView;
    if (!view || typeof view.getComputedStyle !== "function" || typeof document.createRange !== "function" || typeof el.getBoundingClientRect !== "function") return false;
    const box = el.getBoundingClientRect();
    if (!box.width) return false;
    const cs = view.getComputedStyle(el);
    const mid = (box.left + (parseFloat(cs.paddingLeft) || 0) + box.right - (parseFloat(cs.paddingRight) || 0)) / 2;
    const texts = [...el.querySelectorAll(TEXT_SEL)].filter((t) => (t.textContent || "").trim() && !t.parentElement.closest(TEXT_SEL));
    let measured = 0;
    const ok = texts.every((t) => {
      const range = document.createRange();
      range.selectNodeContents(t);
      const r = range.getBoundingClientRect();
      if (!r.width || !r.height) return true;
      measured += 1;
      return Math.abs((r.left + r.right) / 2 - mid) <= 24;
    });
    return ok && measured > 0;
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
      if (isCenteredBand(document, el)) styles.push("centered");
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

  // tools/importer/detectors/common.js
  var HEADINGS4 = "h1, h2, h3, h4, h5, h6";
  var TEXT_SEL2 = "h1, h2, h3, h4, h5, h6, p, li";
  var NOISE_RE = /^copy( hex| to clipboard)?$/i;
  function textOf14(el) {
    if (!el) return "";
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function cleanText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("button").forEach((b) => b.remove());
    clone.querySelectorAll("p").forEach((p) => {
      if (NOISE_RE.test(textOf14(p))) p.remove();
    });
    return textOf14(clone);
  }
  function contentImages(el) {
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
    return [...el.querySelectorAll(HEADINGS4)].filter((h) => textOf14(h) && !NOISE_RE.test(textOf14(h)));
  }
  function textElements(el) {
    return [...el.querySelectorAll(TEXT_SEL2)].filter((t) => textOf14(t) && !NOISE_RE.test(textOf14(t)) && !t.closest("button")).filter((t) => !t.parentElement.closest(TEXT_SEL2));
  }
  function hasContent4(el) {
    if (!el || el.tagName === "HR" || el.tagName === "STYLE" || el.tagName === "SCRIPT") return false;
    return !!textOf14(el) || contentImages(el).length > 0 || videos(el).length > 0;
  }
  function contentChildren(el) {
    return [...el.children].filter(hasContent4);
  }
  function isImageTile(el) {
    return !textOf14(el) && videos(el).length === 0 && contentImages(el).length === 1;
  }
  function isLabelledImageTile(el, maxWords = 6) {
    if (videos(el).length || contentImages(el).length !== 1) return false;
    const texts = textElements(el);
    if (texts.length > 1) return false;
    const t = cleanText(el);
    return !t || t.split(" ").length <= maxWords;
  }
  function isImageGrid(el, min = 2) {
    const kids3 = contentChildren(el);
    if (kids3.length < min) return false;
    if (kids3.every(isImageTile)) return true;
    return kids3.every((k) => {
      const row = contentChildren(k);
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
      heading: h ? textOf14(h) : "",
      layers: layerNames(el, ctx.root).join(" | ")
    };
  }
  function buildContext(document) {
    const root = document.querySelector("#main") || document.body;
    const ctx = { document, root, headings: headings(root) };
    return ctx;
  }
  function detect(document, detectors2, seeds = []) {
    const ctx = buildContext(document);
    const found = [];
    const seedEls = seeds.map((s) => s.element);
    const visit = (el) => {
      if (seedEls.includes(el)) return;
      if (/^(SCRIPT|STYLE|SVG|HR|IMG|VIDEO|BUTTON|P|H[1-6])$/i.test(el.tagName)) return;
      const holdsSeed = seedEls.some((s) => el.contains(s));
      if (!holdsSeed && hasContent4(el)) {
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
              const kids3 = contentChildren(target);
              if (kids3.length !== 1) break;
              let inner = false;
              try {
                inner = det.test(kids3[0], ctx);
              } catch (e) {
                inner = false;
              }
              if (!inner) break;
              [target] = kids3;
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
    const labels = [...el.querySelectorAll("p")].filter((p) => LABEL_RE.test(textOf14(p)));
    return labels.length >= 1;
  }
  function isImageNameTile(el) {
    const hs = headings(el);
    if (hs.length !== 1 || contentImages(el).length < 1) return false;
    return !el.querySelector("p") || [...el.querySelectorAll("p")].every((p) => !LABEL_RE.test(textOf14(p)) && NOISE_RE.test(textOf14(p)));
  }
  function isNote(el) {
    return !headings(el).length && !contentImages(el).length && textElements(el).length >= 1;
  }
  function isSwatchGrid(el) {
    if (isSwatchTile(el)) return false;
    const kids3 = contentChildren(el);
    if (!kids3.length) return false;
    let swatches = 0;
    const ok = kids3.every((k) => {
      if (isSwatchTile(k)) {
        swatches += 1;
        return true;
      }
      if (isImageNameTile(k)) return true;
      const inner = contentChildren(k);
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
    const t = textOf14(el).replace(/(background|text)/gi, " $1 ").replace(/\s+/g, " ").trim();
    if (!CONTRAST_RE.test(t) || contentImages(el).length) return false;
    if (t.split(" ").length > 14) return false;
    return [...el.querySelectorAll("p")].filter((p) => /^background/i.test(textOf14(p))).length === 1;
  }
  function isContrastGrid(el) {
    const kids3 = contentChildren(el);
    return kids3.length >= 1 && kids3.every(isContrastTile) && !isContrastTile(el);
  }
  function isVideoContainer(el) {
    if (el.tagName === "SECTION") return false;
    if (textOf14(el) || videos(el).length !== 1 || contentImages(el).length > 0) return false;
    const parent = el.parentElement;
    if (!parent || parent.tagName === "SECTION") return true;
    return !!textOf14(parent) || videos(parent).length !== 1 || contentImages(parent).length > 0;
  }
  var GLYPH_RE2 = /\d{4}\S{0,10}[&%#@]|(?:[\u3400-\u9fff]\s*){4,}/;
  function glyphLines(el) {
    return [...el.querySelectorAll("p")].filter((p) => GLYPH_RE2.test(textOf14(p)));
  }
  function isSpecimen2(el) {
    return glyphLines(el).length === 1 && !headings(el).length && textOf14(el).length <= 220 && !contentImages(el).length;
  }
  function isTypefaceRow(el) {
    if (videos(el).length || contentImages(el).length) return false;
    const kids3 = contentChildren(el);
    if (kids3.length === 2 && glyphLines(el).length === 1) {
      const spec = kids3.find(isSpecimen2);
      const copy = kids3.find((k) => k !== spec);
      if (spec && copy && textElements(copy).length >= 1 && !glyphLines(copy).length) return true;
    }
    if (isSpecimen2(el)) {
      const parent = el.parentElement;
      return !(parent && isTypefaceRowShape(parent));
    }
    return false;
  }
  function isTypefaceRowShape(el) {
    const kids3 = contentChildren(el);
    if (kids3.length !== 2 || glyphLines(el).length !== 1) return false;
    const spec = kids3.find(isSpecimen2);
    const copy = kids3.find((k) => k !== spec);
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
    const kids3 = contentChildren(el);
    if (kids3.length < 2) return false;
    return kids3.every((k) => {
      const texts = textElements(k);
      return contentImages(k).length >= 1 && contentImages(k).length <= 3 && texts.length >= 1 && MISUSE_RE.test(textOf14(texts[0])) && textOf14(k).split(" ").length <= 30 && !videos(k).length;
    });
  }
  function artworkTextTile(el) {
    if (videos(el).length) return null;
    const imgs = contentImages(el);
    if (imgs.length !== 1) return null;
    const texts = textElements(el);
    if (!texts.length || MISUSE_RE.test(textOf14(texts[0]))) return null;
    if (textOf14(el).split(" ").length > 120) return null;
    return { img: imgs[0], texts };
  }
  function isSideBySide(el) {
    const kids3 = contentChildren(el);
    if (kids3.length !== 2) return false;
    const img = kids3.find((k) => isImageTile(k));
    const text = kids3.find((k) => k !== img);
    if (!img || !text || contentImages(text).length || !textElements(text).length) return false;
    return flexDirection(el) === "row";
  }
  function isFramedTextGrid(el) {
    const kids3 = contentChildren(el);
    if (kids3.length < 2 || kids3.length > 6) return false;
    return kids3.every((k) => {
      const tile = artworkTextTile(k);
      if (!tile || isSideBySide(k)) return false;
      return tile.texts.length >= 2 || textOf14(k).split(" ").length > 6;
    });
  }
  function isLogoContrastGrid(el, ctx) {
    const kids3 = contentChildren(el);
    if (kids3.length < 4) return false;
    const ok = kids3.every((k) => !textOf14(k) && contentImages(k).length >= 1 && contentImages(k).length <= 2 && contentImages(k).every((i) => (i.getAttribute("src") || "").startsWith("data:image/svg+xml")));
    if (!ok) return false;
    const { heading } = contextOf(el, ctx);
    return /accessib|contrast|pairing/i.test(heading);
  }
  var EXCLUSION_RE = /exclusion|minimum size|clear ?space|safe ?zone/i;
  var LOCKUP_RE = /logo|wordmark|lock-?up|designation|marque/i;
  function isFramedGrid(el, ctx, { lockups = false } = {}) {
    if (isFramedTextGrid(el)) return true;
    if (!isImageGrid(el)) return false;
    const imgs = contentImages(el);
    if (imgs.length < 2 || imgs.length > 3) return false;
    const { heading } = contextOf(el, ctx);
    if (EXCLUSION_RE.test(heading)) return true;
    return lockups && LOCKUP_RE.test(heading) && imgs.every((i) => !isCropped(i));
  }

  // tools/importer/detectors/guideline-chapter.js
  function unwrap(el) {
    let node = el;
    for (let kids3 = contentChildren(node); kids3.length === 1; kids3 = contentChildren(node)) [node] = kids3;
    return node;
  }
  function isGradientTile(el) {
    const kids3 = contentChildren(unwrap(el));
    if (kids3.length !== 2) return false;
    const name = textElements(kids3[0]);
    if (name.length !== 1 || !/gradient/i.test(textOf14(name[0]))) return false;
    const stops = contentChildren(kids3[1]);
    return stops.length >= 2 && stops.every((s) => textElements(s).length === 1 && textOf14(s).split(" ").length <= 3);
  }
  function isGradientGrid(el) {
    const kids3 = contentChildren(el);
    return kids3.length >= 1 && kids3.every(isGradientTile);
  }
  function isPhotoRow(el, ctx) {
    if (!isImageGrid(el)) return false;
    const imgs = contentImages(el);
    if (imgs.length > 8 || !imgs.every(isPhoto) || !uniformBleed(imgs)) return false;
    const { heading } = contextOf(el, ctx);
    return !EXCLUSION_RE.test(heading);
  }
  function isLogoVersionGrid(el, ctx) {
    const kids3 = contentChildren(el);
    if (kids3.length < 2 || kids3.length > 8 || !kids3.every((k) => isLabelledImageTile(k))) return false;
    if (!kids3.some((k) => textOf14(k))) return false;
    return LOCKUP_RE.test(contextOf(el, ctx).heading);
  }
  function isBadgePanel(el, ctx) {
    if (!isImageGrid(el)) return false;
    const n = contentImages(el).length;
    return n >= 2 && n <= 6 && /badge|fav ?icon|avatar|app icon/i.test(contextOf(el, ctx).heading);
  }
  var ICON_BAND_RE = /icon|illustration|sticker/i;
  function isLabelledGrid(el) {
    const kids3 = contentChildren(el);
    return kids3.length >= 2 && kids3.every((k) => isLabelledImageTile(k));
  }
  function isShapeGrid(el) {
    if (!isImageGrid(el) && !isLabelledGrid(el)) return false;
    const imgs = contentImages(el);
    return imgs.length >= 3 && imgs.filter((i) => isGraphic(i)).length >= imgs.length * 0.75;
  }
  function isLoneGroupGraphic(el, ctx) {
    if (!isImageTile(el)) return false;
    const band = bandOf2(el);
    if (!band || !ICON_BAND_RE.test(band.getAttribute("data-framer-name") || "")) return false;
    const parent = el.parentElement;
    const siblings = parent ? contentChildren(parent).filter((c) => c !== el) : [];
    return siblings.length === 1 && headings(siblings[0]).length === 1 && !contentImages(siblings[0]).length && ICON_BAND_RE.test(contextOf(el, ctx).heading);
  }
  function textImageShape(el) {
    if (videos(el).length) return false;
    const kids3 = contentChildren(el);
    if (kids3.length !== 2) return false;
    const img = kids3.find(isImageTile);
    const text = kids3.find((k) => k !== img);
    if (!img || !text) return false;
    return !contentImages(text).length && headings(text).length >= 1 && textElements(text).length >= 2;
  }
  function isTextImage(el) {
    if (!textImageShape(el)) return false;
    if (isSideBySide(el)) return true;
    const parent = el.parentElement;
    const siblings = parent ? contentChildren(parent).filter((s) => s !== el) : [];
    return !siblings.some(textImageShape);
  }
  var TRANSPARENT_RE = /^(transparent|rgba\(0, 0, 0, 0\))$/;
  function bgOf(el) {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== "function") return "";
    try {
      return view.getComputedStyle(el).backgroundColor || "";
    } catch (e) {
      return "";
    }
  }
  function isPainted(el) {
    for (let n = el, i = 0; n && i < 5; i += 1) {
      const bg = bgOf(n);
      if (bg && !TRANSPARENT_RE.test(bg)) return true;
      const k = contentChildren(n);
      n = k.length === 1 ? k[0] : null;
    }
    return false;
  }
  function inPaintedPanel(el) {
    for (let n = el, i = 0; n && i < 4 && n.tagName !== "SECTION"; i += 1, n = n.parentElement) {
      const bg = bgOf(n);
      if (bg && !TRANSPARENT_RE.test(bg)) return true;
    }
    return false;
  }
  var words = (el) => textOf14(el).split(" ").filter(Boolean).length;
  var textOnly = (el) => !contentImages(el).length && !videos(el).length;
  function isPrincipleCard(el) {
    if (!textOnly(el)) return false;
    const hs = headings(el);
    const texts = textElements(el);
    return hs.length === 1 && texts.length >= 2 && texts.length <= 4 && words(hs[0]) <= 5 && words(el) >= 8 && words(el) <= 80 && isPainted(el);
  }
  function isPrincipleGrid(el) {
    const kids3 = contentChildren(el);
    return kids3.length >= 2 && kids3.length <= 8 && kids3.every(isPrincipleCard);
  }
  function isVoicePair(el) {
    const kids3 = contentChildren(unwrap(el));
    return kids3.length === 2 && kids3.every((t) => textOnly(t) && headings(t).length === 1 && textElements(t).length === 2 && words(t) <= 30 && isPainted(t));
  }
  function isVoiceExample(el) {
    if (!textOnly(el)) return false;
    if (isVoicePair(el)) return true;
    const kids3 = contentChildren(unwrap(el));
    if (kids3.length !== 2) return false;
    const [label, pair] = kids3;
    return !headings(label).length && textElements(label).length === 1 && words(label) <= 8 && isVoicePair(pair);
  }
  function isVoiceExamples(el) {
    const kids3 = contentChildren(el);
    const first = kids3.findIndex(isVoiceExample);
    if (first === -1) return false;
    return kids3.slice(first).every(isVoiceExample) && kids3.slice(0, first).every((c) => textOnly(c) && textElements(c).length <= 2);
  }
  function isTermIconCell(el) {
    const imgs = contentImages(el);
    if (imgs.length !== 1 || !(imgs[0].getAttribute("src") || "").startsWith("data:image/svg+xml")) return false;
    const w = parseFloat(imgs[0].getAttribute("width")) || 0;
    return w > 0 && w <= 60 && textElements(el).length <= 1 && words(el) <= 6;
  }
  function isTermIconGrid(el) {
    const rows = contentChildren(el);
    if (rows.length < 3) return false;
    const cells = [];
    const ok = rows.every((r) => {
      const k = contentChildren(r);
      cells.push(...k);
      return k.length >= 2 && k.length <= 3 && k.every(isTermIconCell);
    });
    return ok && cells.filter((c) => textOf14(c)).length >= cells.length / 2;
  }
  function isTermColumns(el) {
    const cols = contentChildren(el);
    if (cols.length < 2 || cols.length > 3 || !inPaintedPanel(el)) return false;
    return cols.every((c) => {
      const texts = textElements(c);
      return textOnly(c) && !headings(c).length && texts.length >= 4 && texts.every((t) => t.tagName === "P" && words(t) <= 12);
    });
  }
  function isSocialGrid(el) {
    const kids3 = contentChildren(el);
    if (kids3.length < 3) return false;
    const ok = kids3.every((t) => contentImages(t).length === 1 && !videos(t).length && !headings(t).length && textElements(t).length >= 1 && textElements(t).length <= 3 && words(t) <= 15);
    return ok && kids3.filter((t) => /[@#]/.test(textOf14(t))).length >= kids3.length / 2;
  }
  var detectors = [
    {
      name: "cards-swatch",
      test: (el) => isSwatchGrid(el) || isSwatchTile(el),
      // a lone tile: its container was rejected
      validate: (el) => /hex/i.test(textOf14(el))
    },
    {
      name: "cards-contrast",
      test: (el, ctx) => isContrastGrid(el) || isLogoContrastGrid(el, ctx),
      validate: (el) => /background/i.test(textOf14(el)) || contentImages(el).length >= 4
    },
    { name: "cards-gradient", test: (el) => isGradientGrid(el), validate: (el) => /gradient/i.test(textOf14(el)) },
    { name: "columns-voice", test: (el) => isVoiceExamples(el), validate: (el) => isVoiceExamples(el) },
    { name: "cards-principle", test: (el) => isPrincipleGrid(el), validate: (el) => isPrincipleGrid(el) },
    {
      name: "columns-terms",
      test: (el) => isTermIconGrid(el) || isTermColumns(el),
      validate: (el) => isTermIconGrid(el) || isTermColumns(el)
    },
    { name: "cards-social", test: (el) => isSocialGrid(el), validate: (el) => isSocialGrid(el) },
    { name: "cards-misuse", test: (el) => isMisuseGrid(el), validate: (el) => contentImages(el).length >= 2 && /don/i.test(textOf14(el)) },
    { name: "columns-typeface", test: (el) => isTypefaceRow(el), validate: (el) => /\d{4}/.test(textOf14(el)) },
    { name: "video-autoplay", test: (el) => isVideoContainer(el), validate: (el) => videos(el).length >= 1 },
    { name: "cards-logo", test: (el, ctx) => isLogoVersionGrid(el, ctx), validate: (el) => contentImages(el).length >= 2 },
    { name: "cards-framed", test: (el, ctx) => isFramedGrid(el, ctx, { lockups: true }), validate: (el) => contentImages(el).length >= 1 },
    { name: "columns-panel", test: (el, ctx) => isBadgePanel(el, ctx), validate: (el) => contentImages(el).length >= 2 },
    {
      name: "cards-shape",
      test: (el, ctx) => isShapeGrid(el) || isLoneGroupGraphic(el, ctx),
      validate: (el) => contentImages(el).length >= 1
    },
    { name: "columns-photos", test: (el, ctx) => isPhotoRow(el, ctx), validate: (el) => contentImages(el).length >= 2 },
    { name: "columns-text-image", test: (el) => isTextImage(el), validate: (el) => contentImages(el).length >= 1 && !!textOf14(el) }
  ];

  // tools/importer/import-guideline-chapter.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "cards-swatch": parse,
    "columns-text-image": parse2,
    "columns-photos": parse3,
    "video-autoplay": parse4,
    "cards-gradient": parse5,
    "cards-contrast": parse6,
    "cards-logo": parse7,
    "cards-framed": parse8,
    "cards-misuse": parse9,
    "columns-panel": parse10,
    "columns-typeface": parse11,
    "cards-shape": parse12,
    "cards-principle": parse13,
    "columns-voice": parse14,
    "columns-terms": parse15,
    "cards-social": parse16
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
    const byName = Object.fromEntries(detectors.map((d) => [d.name, d]));
    const mapped = [];
    template.blocks.forEach((blockDef) => {
      const det = byName[blockDef.name];
      blockDef.instances.forEach((selector) => {
        let els = [];
        try {
          els = [...document.querySelectorAll(selector)];
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
    const detected = detect(document, active, mapped);
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
  function loadVideoMetadata(document) {
    return __async(this, null, function* () {
      const all = [...document.querySelectorAll("video")];
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
  var import_guideline_chapter_default = {
    onLoad: (_0) => __async(null, [_0], function* ({ document }) {
      try {
        yield loadVideoMetadata(document);
      } catch (e) {
        console.warn("video metadata load failed", e);
      }
    }),
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.isConnected) return;
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
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
          detection: pageBlocks.map((b) => `${b.name}:${b.source}`)
        }
      }];
    }
  };
  return __toCommonJS(import_guideline_chapter_exports);
})();

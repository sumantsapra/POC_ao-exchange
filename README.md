# AO Exchange on Adobe Edge Delivery Services

Rebuild of [tennispartner.com.au/ao-exchange](https://tennispartner.com.au/ao-exchange) as an Adobe Edge Delivery Services project. The live site is a Framer microsite published on 22 October 2026. This project recreates the three pages — home, agenda, and speakers — as EDS blocks, with the same copy, photography, and sponsor marks.

The code sits beside the Tennis Australia AEM project at `repo/ao-exchange`. It is its own site, with its own Git repository, because Edge Delivery publishes code from GitHub and content from a separate content source.

## Preview it locally

From this folder:

```bash
npm run preview
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The same server serves `/agenda` and `/speakers`.

`npm run preview` uses only Node. It does not call Adobe. Use it to review the pages before the content bus is connected.

## What was rebuilt

| Live page | Local path | Blocks |
| --- | --- | --- |
| `/ao-exchange` | `/` | `hero`, `intro`, `register`, `partners` |
| `/ao-exchange/agenda` | `/agenda` | `agenda`, `partners` |
| `/ao-exchange/speakers` | `/speakers` | `speakers`, `partners` |

Header and footer are on every page. Navigation links match the live site: Home, Agenda, Speakers, and Register now. Social links go to Tennis Australia on LinkedIn and the Australian Open on Instagram, TikTok, Facebook, and ausopen.com.

Copy, session times, speaker biographies, and images were taken from the published Framer pages. Two agenda lines on the live site overlap (`10:15am - 10:45am` and `10:35am – 11:05am`); they are kept as published. The agenda line that reads “Avery Akkinen / VanyerX” on the Framer page is stored here as Avery Akkineni and VaynerX, matching the speakers page.

The registration form has the same fields: name, email, company, role, and dietaries. On localhost, a successful submit shows the thank-you state and does not send the data anywhere. See “Registration endpoint” below before go-live.

## How an Edge Delivery page is assembled

```text
content document  ->  .plain.html (block markup)
code repository   ->  blocks, CSS, scripts, head.html, images in /media
Edge Delivery     ->  HTML page on the CDN
```

Authors change words and pictures in the content source. Developers change layout in `blocks/`. A content publish does not require a code deploy, and a code deploy does not require a content publish.

Block markup in the HTML files is the same shape Edge Delivery produces from a document table. A block is a `div` whose class is the block name. Each row is a child `div`. Each cell is a `div` inside that row.

The home hero, for example, is one row for the wordmark and one row of five fact cells. The register block is one row per field:

| Label | Name | Type | Required | Placeholder |
| --- | --- | --- | --- | --- |
| Name | name | text | required | Enter full name |
| Email Address | email | email | required | Enter email |

A final row of `submit` / `Register now` sets the button.

## Deploy

Do these in order. Preview (`*.aem.page`) is available after step 3. The public site is available after step 6, and on the Tennis Australia domain after step 7.

### 1. Create the code repository

This folder is not inside the `tennisaustralia` Git repository. Create a repository for it, on GitHub or on a Git host Adobe Code Sync can read.

```bash
cd repo/ao-exchange
git init
git add .
git commit -m "Add the AO Exchange Edge Delivery site."
```

Push it to GitHub. The repository name becomes part of the Edge Delivery URL, so `ao-exchange` is a good name. Adobe’s onboarding accepts GitHub. Other hosts work if Code Sync is configured for them.

Do not commit `node_modules`. It is already in `.gitignore`.

### 2. Install the command line tool

```bash
npm install
```

That installs `@adobe/aem-cli`. You can also install it globally with `npm install -g @adobe/aem-cli`.

### 3. Onboard the code bus

Sign in to [https://tools.aem.live/onboard](https://tools.aem.live/onboard) with an Adobe ID that can manage the Tennis Australia org. Point the tool at the GitHub repository from step 1.

Code Sync adds a GitHub app. Every push to `main` updates the code on Edge Delivery. The preview URL looks like:

```text
https://main--ao-exchange--<org>.aem.page
```

`<org>` is the Edge Delivery organisation slug chosen during onboarding. Production uses `aem.live` instead of `aem.page`.

Confirm the code bus with:

```text
https://main--ao-exchange--<org>.aem.page/scripts/aem.js
```

That URL should return the script, not a 404.

### 4. Create the content source

Use Document Authoring for this microsite. It is the shortest path, and the pages are already written as block markup.

1. Open [https://da.live](https://da.live) and create an organisation and a repository named `ao-exchange`, or reuse the Tennis Australia organisation if one already exists.
2. Create three documents: `/` (index), `/agenda`, and `/speakers`.
3. Paste each page’s `<main>` contents into the document as HTML, or rebuild the same tables in the DA editor. The files to copy from are `index.html`, `agenda/index.html`, and `speakers/index.html`. Copy only the block `div`s inside `<main>`. Leave out `<header>`, `<footer>`, `<head>`, and the scripts. Edge Delivery adds those from `head.html` and the header and footer blocks.
4. Copy `fstab.yaml.example` to `fstab.yaml`. Replace `REPLACE_ORG` with the DA organisation:

```yaml
mountpoints:
  /:
    url: https://content.da.live/<org>/ao-exchange/
    type: markup
```

5. Commit `fstab.yaml` and push. Code Sync picks up the mount.

SharePoint or Google Drive can be used instead of DA. Change `type` to `onedrive` or `google` and set `url` to the folder. The column structure of each block stays the same.

AEM authoring with Universal Editor is the other option, because Tennis Australia already runs AEM as a Cloud Service. That path needs a configuration in Cloud Manager, `paths.json` (start from `paths.json.example`), and component models for each block. Use it if the pages must be edited in the same AEM author as tennis.com.au. For a three-page event site, Document Authoring is the one to start with.

### 5. Preview with the AEM CLI

After `fstab.yaml` points at real content:

```bash
npx aem up
```

The CLI serves local block code and remote content together, usually at `http://localhost:3000`. Edit a block, save, and the browser reloads. This is the loop to use once authors are working in DA. Until `fstab.yaml` exists, keep using `npm run preview`, which serves the HTML in this folder.

### 6. Publish

In Document Authoring, publish each page. Preview updates on `aem.page` as you edit. Publish promotes the page to `aem.live`.

Check, in this order:

- `https://main--ao-exchange--<org>.aem.page/`
- `https://main--ao-exchange--<org>.aem.page/agenda`
- `https://main--ao-exchange--<org>.aem.page/speakers`
- the same three paths on `aem.live` after publish

Use the [Sidekick](https://www.aem.live/docs/sidekick) Chrome extension on those URLs to preview, publish, and view the source document.

A code change is published by pushing to `main`. A content change is published from DA or the Sidekick. They are independent.

### 7. Put it on the Tennis Australia domain

The Framer site is `https://tennispartner.com.au/ao-exchange`. Edge Delivery will not replace that URL until DNS or the existing host is pointed at it.

Recommended: a dedicated host, for example `exchange.tennis.com.au` or `aoexchange.tennis.com.au`.

1. In the [Edge Delivery configuration service](https://tools.aem.live/config), or via a Slack/Adobe support request for the org, add the production hostname to the site.
2. Adobe returns a CNAME target, usually a `cdn.aem.live` or Fastly host.
3. Create the CNAME in the Tennis Australia DNS.
4. Add the hostname in Cloud Manager only if this site is wired through AEM. A DA-only site does not need a Cloud Manager domain.

To keep the path `tennispartner.com.au/ao-exchange`, the host that currently serves `tennispartner.com.au` has to reverse-proxy `/ao-exchange` to the Edge Delivery origin, and the EDS `publicPath` or a CDN path mapping has to strip or keep that prefix. The pages in this project use root-relative links (`/agenda`, `/speakers`, `/#form`). A subpath needs those links prefixed, or the proxy has to present the site at `/`. A dedicated hostname avoids that. Decide the hostname before the first production publish so authors do not bookmark the wrong URL.

`robots` and the sitemap come from the Edge Delivery production host after the domain is live.

### 8. Registration endpoint

The Framer form is submitted by Framer and is not a public API. This project posts JSON to the URL in the `form-endpoint` meta tag.

Set it in `head.html`:

```html
<meta name="form-endpoint" content="https://example.tennis.com.au/api/ao-exchange"/>
```

The body is:

```json
{
  "source": "ao-exchange",
  "name": "",
  "email": "",
  "company": "",
  "role": "",
  "dietaries": ""
}
```

The endpoint should accept `POST` with `Content-Type: application/json` and return a 2xx response. A typical Tennis Australia destination is a Marketo form, an AEM servlet, or a Power Automate / Logic Apps webhook in front of a shared mailbox. Allow the Edge Delivery origin in that service’s CORS rules.

Until the meta tag has a URL, production shows “Registration is not available yet” and does not drop the visitor’s details on the floor. Local preview still shows the thank-you state so the layout can be checked.

There is a hidden honeypot field, `company_website`. Discard submissions where it is filled in.

### 9. Fonts

The Framer site uses Sequel Sans, sold as Sequel 100 Wide, plus Poppins on the form and Geist Mono on the copyright line. Sequel Sans is a licensed font and is not in this repository.

Anybody (a wide variable face), Poppins, and Geist Mono are loaded from Google Fonts so the pages have the right proportions without redistributing Sequel. When Tennis Australia’s licence files are available, put the woff2 files in `fonts/` and uncomment the `@font-face` rules in `styles/fonts.css`. The CSS already prefers `Sequel Sans` when that family is defined.

### 10. Images

Photographs, the AO wordmark, and sponsor logos are in `media/`. They were saved from the published Framer site so the EDS pages can ship the same artwork. They are served from the code bus at `/media/...`. Replacing a file and pushing to `main` updates every page that references it.

Keep partner logo changes in the `partners` block inside each page document if marketing needs to swap a sponsor without a code release. The three HTML files currently repeat that block so the local preview matches production before DA is connected.

## Code map

```text
head.html                 Metadata, fonts, and the scripts Edge Delivery injects
scripts/aem.js            Adobe boilerplate runtime (Apache-2.0)
scripts/scripts.js        Page bootstrap for this site
styles/styles.css         Colour, type, and page background
blocks/header             Pill navigation
blocks/footer             Wordmark, social links, copyright
blocks/hero               Wordmark and the five event facts
blocks/intro              Conference copy and photo ticker
blocks/register           Registration form
blocks/agenda             Session timeline
blocks/speakers           Headline and featured speakers
blocks/partners           Supported by / in association with
media/                    Photographs and logos
icons/                    Event and social icons
tools/preview.mjs         Local preview server
fstab.yaml.example        Content mount, copied to fstab.yaml in step 4
paths.json.example        Only needed for AEM authoring
```

`scripts/aem.js` is the Adobe Edge Delivery boilerplate runtime, kept under the Apache License 2.0. See `LICENSE`.

## Updating a page later

Content change, such as a new speaker or a time change: edit the document in DA and publish. No deploy.

Layout change, such as the ticker or the form: edit the block’s `.js` and `.css`, push to `main`, and Code Sync updates the preview. Publish the code by merging to the branch the production site tracks (usually `main`).

A new page: add a document in DA at the path you want, using the same block tables. Add a link in `blocks/header/header.js` if it belongs in the pill.

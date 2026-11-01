# Full Site Migration to AEM Edge Delivery Services: AO Brand Playbook

## Status
> 🛑 **Phase 1 is blocked because your Execute setting isn't reaching this chat.** Your mode selector says **Execute**, but every message in this chat still arrives in plan mode. That's the fourth "start Phase 1" with the same result. In plan mode I can only read files, so I can't fetch the sitemap, crawl the site or create migration files. Sending "start Phase 1" again here won't change anything.
>
> **The best fix is to start a new chat:**
> 1. Open a **new chat** for this project.
> 2. Check that the mode selector says **Execute** *before* you send anything.
> 3. Paste this message:
>    *"Migrate https://aobrandplaybook.com.au/ to AEM: whole site, including header/navigation, footer and design. Start Phase 1: confirm the project type, find all URLs, group them into templates, build the site catalog and scope report, then stop for my review."*
>
> **Other things to try if the new chat also starts in plan mode:**
> - Reload the browser tab, select Execute again and send a message.
> - Contact your workspace administrator or support. The UI shows Execute while the chat stays in plan mode, which looks like a problem in the mode setting itself.
>
> The plan below has everything needed to pick up straight away in an Execute-mode chat.

## Overview
The plan moves the **AO Brand Playbook** site (https://aobrandplaybook.com.au/) to AEM Edge Delivery Services. That covers all page content, the header and navigation, the footer and the site-wide design. The project previews under **sumantsapra / POC_ao-exchange**.

## Pre-flight findings (read-only checks in plan mode)
- **Starting project:** this is an existing Edge Delivery Services project ("AO Exchange microsite") with a `blocks` folder and a local preview script. Migrated blocks and styles go in alongside what's already there. Existing code is only replaced where a block needs it.
- **Project type:** there's no Universal Editor model file, so this is most likely a **Document Authoring / document-based** project. Phase 1 step 1 will confirm that.
- **Content source:** no content-source mapping is set up yet. That only matters if you later ask for an upload to Document Authoring. Local migration and preview work without it.

## Inputs & Decisions
| Item | Value |
|---|---|
| Source site | https://aobrandplaybook.com.au/ |
| Scope | Whole site: find all URLs, group them into templates, migrate every page |
| Extras | Header/navigation, Footer, Design/styling |
| Preview target | sumantsapra / POC_ao-exchange |
| Remote publishing | **Not included.** All changes stay local unless you ask to upload to Document Authoring or publish |

## Approach

### Phase 1: Project setup & site discovery ▶️ *ready; blocked until Execute mode reaches the chat*
1. **Project type:** confirm the project type (probably Document Authoring) and its matching block library, and record both in the project settings.
2. **URL discovery:** collect every page URL on aobrandplaybook.com.au from the sitemap, or by crawling if there isn't one.
3. **Template grouping:** sort the pages into **templates**, such as the homepage, section pages, and detail pages for logo, colour, typography, imagery and tone of voice.
4. **Site catalog:** list the blocks and variants each template uses, for example colour swatches, type specimens, do/don't grids, downloads and tabs. Mark each one as a library block, a custom block or plain content.
5. **Scope report:** page count, templates and reusable blocks, plus anything unusual such as login areas, downloadable assets or embedded media.
6. **Checkpoint:** you review the templates and blocks before anything is built.

### Phase 2: Page analysis & block mapping (per template)
- Analyse one representative page per template: its sections, content structure and authoring decisions.
- Map each content area to a library block, a custom block or plain content. Name the variants, and reuse an existing variant (including blocks already in the project) when it's about 80% similar.
- Record which page elements and sections map to which blocks, for each template.

### Phase 3: Block development
- Build the custom blocks and variants the catalog calls for, such as a colour palette, typography specimen or do/don't comparison.
- Use library blocks and existing project blocks wherever they fit.

### Phase 4: Import setup
- Build the cleanup and section transformers, plus one parser per block variant.
- Write one import script per template.

### Phase 5: Content import & validation
- Bulk-import pages one template at a time.
- Score each imported page against the original. For pages that differ, run a visual critique, fix the parser or transformer, then re-import, and repeat until they match.

### Phase 6: Header & footer
- Rebuild the header and navigation from desktop and mobile screenshots, including menus, side navigation and interactions.
- Rebuild the footer for desktop and mobile, then check its structure and appearance.

### Phase 7: Design migration
- Pull the site-wide fonts, colours, spacing and breakpoints from the AO Brand Playbook.
- Style each block to match the source, then compare source and preview screenshots side by side.

### Phase 8: Final QA
- Compare every migrated page against its original.
- Fix what's left, then write up the migrated pages, known gaps and follow-ups.
- Uploading or publishing to Document Authoring is a separate step that needs your explicit go-ahead.

## Checklist
- [x] Get the source site URL (https://aobrandplaybook.com.au/)
- [x] Approve the plan and request Phase 1 start
- [x] Run pre-flight read-only checks of the existing project
- [x] Confirm what the mode selector shows (it says Execute, but this chat still runs in plan mode)
- [ ] **Open a new chat in Execute mode** and paste the start message from the Status section
- [ ] Confirm the project type and block library
- [ ] Collect all page URLs on aobrandplaybook.com.au (sitemap or crawl)
- [ ] Group pages into templates and build the site catalog
- [ ] Write the migration scope report
- [ ] **Checkpoint:** you review and approve the templates and blocks
- [ ] Analyse one representative page per template
- [ ] Name block variants and record block and section mappings
- [ ] Build custom blocks and variants
- [ ] Build import transformers and parsers
- [ ] Write one import script per template
- [ ] Bulk-import all pages, one template at a time
- [ ] Validate imported pages and fix any that differ
- [ ] Migrate the header and navigation (desktop, mobile, menus)
- [ ] Migrate the footer (desktop, mobile)
- [ ] Extract the site-wide design settings and apply global styles
- [ ] Style each migrated block and check it against the source
- [ ] Run a full-site comparison and make final fixes
- [ ] Send you a summary of what changed (local workspace only unless you ask otherwise)

## Notes
- All changes stay **local**. Nothing goes to Document Authoring, EDS preview or live unless you ask.
- Phase 1 ends at the checkpoint, where I'll stop and wait for your approval before building anything.
- If the site turns out to be large, I'll migrate it one template at a time and check in with you after each one.
- If any part of the site is behind a login or blocks automated access, I'll flag it in the scope report before going further.

# Image audit coverage and source/state findings

The baseline combines all 250 rendered HTML files from `.next-navigation-final/server/app` with eight runtime-only route responses from the existing local baseline server at `http://127.0.0.1:3180`. It was recorded before image replacements. The static files include redirect shells with no content photographs; these contribute only shared brand assets. English and Arabic are separate pages for this strict audit.

Runtime supplements are `/search`, `/cookie-policy`, `/privacy-policy`, `/terms-and-conditions`, `/ar/cookie-policy`, `/ar/privacy-policy`, `/ar/terms-and-conditions` and `/admin/cookie-consent`. Each currently renders five supporting photographs. All 40 are existing repeated content photographs. Reading the administrative page did not submit a form or change any setting.

## Interaction and responsive coverage

| Source | Behavior checked | Inventory treatment / remaining check |
| --- | --- | --- |
| `components/HomeHeroSlideshow.tsx` and `data/homeHeroSlides.ts` | All four slides are rendered in HTML, including inactive slides. | All four count as distinct placements. Homepage is locked. |
| `components/ProjectsPortfolio.tsx` | Initial filter is `All`; every project card is rendered. Other filters select subsets. | No additional gallery photographs exist outside the initial inventory. |
| `components/BlogKnowledgeHub.tsx` | The hero and featured card share `featuredAsset`. Spotlight cards stay on screen while filtered results may reintroduce their article images. | Final browser checks exercised all 15 categories and five searches. The `construction` query rendered 111 images versus the default 107, confirming four additional repeated article-list placements; no additional image identities appeared. |
| `app/(en)/search/page.tsx` | The first five results select photographs from the result topic; empty slots use generic browse photographs. | Eight final browser query states retained five images each but exposed 19 identities across alternative states, including 14 absent from the default search page and one absent from the final static/default website inventory. Exact state variants are recorded separately. |
| `components/ResponsiveIllustrativeImage.tsx` | Mobile `<source>` and desktop `<img>` are one art-directed `<picture>`. Next.js `srcset` requests represent responsive variants. | One placement is counted. All physical source variants are fingerprinted, and the family is one visual identity. |
| `components/ArabicSitePage.tsx` and `components/ArabicFullPage.tsx` | Translations reuse image data, including card images and service photography. | Arabic routes count separately; translation does not permit content-image sharing. |
| `components/ServiceDetailPage.tsx`, `components/ServiceVideoShowcase.tsx`, `app/(en)/dewa-approvals/page.tsx` | Videos expose poster images in HTML. | Posters are important visual placements and are counted. Video frames themselves are outside an image-file uniqueness audit. |
| `components/ErrorPageShell.tsx` | Five utility photographs are reused by error pages. | Both rendered language error shells are included. Arbitrarily many missing URLs displaying one error template are not invented as additional content pages. |
| `app` / `components` CSS and inline-style source search | No photographic CSS `url()` background was found. | Gradient and pattern backgrounds have no image-file identity. Inline photographic backgrounds would be detected by the runner. |

The initial `/blog` alone renders 107 content placements, largely from four generated blog-image families. `data/sectionPhotography.ts` selects from small topic pools across the whole website, which is the largest duplication source. Its explicit EN/AR sharing comment contradicts the new instruction. `data/internalServiceImages.ts` likewise shares service heroes between locales, and several sources are also locked homepage photographs.

## Locked homepage conflicts

The homepage has 20 content-image placements and only 13 image identities. These seven excess placements cannot be fixed while the homepage is locked.

| Photograph identity | Homepage sections | Placements | Locked excess |
| --- | --- | ---: | ---: |
| Unsplash `photo-1649587345666-0f4ad68aa723` | Hero slideshow; warehouse service card; construction-detail figure; warehouse blog card | 4 | 3 |
| Unsplash `photo-1541888946425-d81bb19240f5` | Civil service card; civil blog card | 2 | 1 |
| Unsplash `photo-1662120399978-738d233edbec` | Turnkey service card; industrial industry card | 2 | 1 |
| Unsplash `photo-1608303588026-884930af2559` | Approval service card; authority blog card | 2 | 1 |
| Unsplash `photo-1504297050568-910d24c426d3` | Commercial industry card; construction-detail figure | 2 | 1 |

The warehouse source occurs under both `internal/warehouse-steel-frame.webp` and `warehouse-construction-dubai.webp`; filenames and crops do not make it unique. The same is true for documented legacy/optimized aliases of the industrial-roof, drawing-review, site-coordination, commercial-corridor and reinforcement sources.

## Identity detection and limits

Every raster/vector asset under `public/images` is fingerprinted with SHA-256, normalized 32×32 grayscale pixel hash, and a 63-bit DCT perceptual hash. Documented Unsplash/Pexels source IDs unify known resized, re-encoded and cropped variants. Desktop/mobile/OG variants are one source family. Identical byte or normalized-pixel hashes merge identities across filenames. Perceptual matches within six bits are flagged for visual review rather than automatically treated as proof.

The only baseline perceptual candidate was the unused pair `home/emitronix-warehouse-team-generated.png` and `home/emitronix-warehouse-team-hero.webp`. Both were opened and visually confirmed to be the same image, so the runner now records their shared identity and inspection evidence. Neither is used in the baseline. The tool does not claim mathematical proof against every arbitrary crop/filter or an undocumented common photographic original.

Generated-image directories are not evidence of company ownership or real photography. Existing images under `images/generated/` need provenance review before being treated as real project images. The inventory does not label them as genuine company work.

OpenGraph/Twitter images, favicons, preload hints and Next.js responsive candidates are technical references to a placement, not extra visible sections. They remain listed separately in the machine-readable inventory. Shared logos are the only repeated visual UI assets in the baseline and are explicitly permitted by the user's rule.

## Final interactive-state verification

`image-state-browser-final.json` records 29 read-only desktop Playwright states on the final local build: the initial blog state, all 15 category filters, five blog searches, and eight site-search queries. The browser completed with zero console or page errors and was closed before the separate navigation-speed run. Only same-origin GET/HEAD requests were allowed. No new photographs appeared in either widget, so these interactions did not reuse any of the 58 new assignments.

The blog search `construction` displayed 111 content images, compared with 107 initially. It reintroduced four existing spotlight photographs into their article-library cards: civil construction, contractor selection, warehouse planning and authority approvals. These are four additional unresolved repeated placements in an observed simultaneous state.

Site search was checked with the default query, `warehouse`, `villa`, `interior`, `dewa`, `civil`, `project management` and a no-result query. Every state contained five images with five distinct identities within that state. Across those alternatives, 19 image identities appeared and 29 additional image/result placement variants were observed beyond the default state. The `villa` query rendered `/images/home/dubai-modern-villa-community.webp` (Pexels 34188580) beside `/villa-construction`; that old source no longer appears in final static/default pages after the service replacements, so the observed union has one more identity than the static/default count.

The final totals of 1,354 content placements, 127 identities and 1,220 missing editable replacements describe the 258 recorded static/default route snapshots. They are **not exhaustive counts of every possible query state**. The observed identity union including interactions contains 128 identities. The 29 alternative search variants must not be added as 29 simultaneous images or 29 new canonical pages. `image-state-variants-final.csv` records all four additional blog placements and all 29 additional search variants separately, with precise target, section, source and action. Arbitrary query strings remain unbounded; strict website-wide uniqueness is still unmet.

## Repeat the final audit

```powershell
node scripts/audit-image-uniqueness.mjs --build=.next-FINAL-BUILD --label=final --base-url=http://127.0.0.1:FINAL-PORT --routes=/search,/cookie-policy,/privacy-policy,/terms-and-conditions,/ar/cookie-policy,/ar/privacy-policy,/ar/terms-and-conditions,/admin/cookie-consent
```

Use the same runtime routes for before/after count comparability. `--strict` exits unsuccessfully while any content-image duplicate remains, including locked homepage duplicates. The final report must disclose these inherited conflicts and any missing suitable real photographs; an unchanged duplicate is not an acceptable shared asset.

# Internal-page polish and photography verification

The internal-page interaction changes and 58 real-photo replacements are implemented and validated locally. **The strict website-wide image uniqueness requirement remains incomplete.** The default-page inventory still requires 1,220 distinct internal replacements, and the locked homepage contains seven excess image uses. Interactive blog/search states expose additional inherited reuse, documented separately below.

The English and Arabic homepages were preserved: nine source-file hashes, 15 physical image hashes, rendered content, image geometry, metadata, structured data, and all four desktop/mobile screenshot comparisons are unchanged. No files were staged, committed, pushed or deployed. No environment files or secrets were modified by this task. Pre-existing working-tree changes were retained.

## Implemented behavior

- Internal pages have restrained button/card feedback, clear keyboard focus, native FAQ accordions, and short, once-only reveals for selected supporting photographs and process steps. At most four photographs and four process steps animate; primary text and hero content never wait for an animation.
- Mobile uses shorter, smaller movement. Reduced motion disables nonessential movement, including when the preference changes while the page is open. No animation dependency was added.
- Internal FAQ text and structured data remain server-rendered. An internal-only no-JavaScript fallback makes streamed route content visible. Its visual order is restored, but the underlying no-JavaScript DOM order still follows Next.js streaming; the content has a named landmark. This is not a claim of screen-reader certification.
- 58 reviewed Pexels photographs now replace repeated images across 15 internal routes. Each new photograph appears once, including across English and Arabic pages. Photos have descriptive alt text, representative-stock captions, source/license links, optimized WebP assets and stable image geometry. They are not presented as Emitronix projects or staff.
- The server-only image assignment registry rejects unknown sources, duplicate assignments, aliases of the same source, and homepage allocations. Image-specific metadata follows the assigned hero while canonical URLs and other SEO fields remain preserved.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Full automated suite | 220 passed; zero failures across 10 groups | `full-tests-final.log` |
| Lint | Passed; no ESLint warnings/errors | `lint-final.log` |
| Type check | Passed after restoring pre-build configuration | `type-check-final.log` |
| Production build | Passed, using `.next-internal-polish` | `build.log` |
| Browser matrix | 44/44 cases: 11 representative routes, desktop/mobile, normal/reduced motion | `internal-browser-final.json` |
| No-JavaScript and SEO comparisons | 11/11 passed | `internal-browser-final.json` |
| Browser errors, hydration, images and overflow | No failures in the matrix | `internal-browser-final.json` |
| Layout stability | Maximum measured CLS 0.077 | `internal-browser-final.json` |
| Internal links | 86/86 passed | `internal-browser-final.json` |
| General SEO | 237 HTML pages, 1,454 public image URLs and 34 redirects passed | `seo-validation.log` |
| Arabic SEO | 38 sitemap URLs passed | `arabic-seo-validation.log` |
| Route/error behavior | 358 checks passed | `route-validation.log` |
| Homepage lock | All four desktop/mobile comparisons passed | `homepage-after.json` |
| Navigation regression | All five journeys passed; ordinary cached clicks painted their destination heading in 60–210 ms | `navigation-final.json` |

The browser matrix covers warehouse construction, industrial buildings, villa construction, interior fit-out, building renovation, civil construction, DCD approvals, DEWA approvals, About, a long-form construction article, and Arabic civil construction. FAQ keyboard activation, visible focus, dynamic reduced-motion preferences and bounded reveals were exercised. Warehouse, fit-out, approvals, Arabic mobile and open FAQ screenshots were visually reviewed.

About painted in 163 ms on desktop and 111 ms on mobile. When a search request was deliberately delayed by 1.2 seconds, loading feedback appeared in 27 ms. These are unthrottled local production measurements, not a guarantee for every device or internet connection. The SEO validator reported only the existing homepage title/description length warnings; the homepage lock was respected. Next.js also printed its existing `next lint` deprecation notice.

## Image audit and outstanding work

The [full image table](image-audit-final.md) lists image, page, section, duplicate status and action. The [inventory CSV](image-inventory-final.csv) includes dimensions, formats and identities. The [missing-image CSV](missing-image-replacements-final.csv) identifies every remaining default-state internal placement requiring a distinct image.

| Default-route inventory metric | Before | After |
| --- | ---: | ---: |
| Rendered routes | 258 | 258 |
| Content-image placements | 1,354 | 1,354 |
| Unique content-image identities | 73 | 127 |
| Duplicate identity groups | 61 | 57 |
| Excess repeated placements | 1,281 | 1,227 |
| Editable replacements still required | 1,274 | 1,220 |
| Excess uses inside the locked homepage | 7 | 7 |
| Replacements made in this task | — | 58 |

All 58 new files match their reviewed provenance hashes and are used exactly once. No content-image placements were removed. The unique-identity increase is 54 because four old identities disappeared from the default snapshots. Perceptual/source-identity checks found no new-photo reuse or unresolved perceptual candidates, but cannot mathematically prove uniqueness against every arbitrary crop or undocumented source.

The only intentionally shared visual assets are the primary company logo (516 placements) and reversed company logo (three placements). They are necessary brand assets, expressly permitted by the requested rule. All remaining repeated content photographs are unresolved replacements, not approved sharing.

The separate [interactive-state audit](image-state-browser-final.json) checks 29 blog/search states. Blog filters can show four additional repeated article-list placements; search queries reveal 29 additional source/result combinations and one identity absent from the default inventory. Alternative-state counts must not be added as simultaneous images or treated as an exhaustive inventory of arbitrary queries. See [coverage and findings](source-and-state-image-audit.md) for the exact state evidence and limitations. None of the 58 new photographs appear in these widgets.

No verified company-owned photo provenance was found in the inspected workspace. The source review approved 58 suitable real photographs and rejected unsuitable candidates; it did not supply the 1,220 remaining assignments. These missing photos are explicitly reported, as requested. Existing generated assets are not treated as verified real project photographs. Completing global uniqueness requires additional relevant reviewed photography and separate authorization before changing any locked homepage usage.

# Final manual browser and accessibility verification

Status: **NOT RUN — release gate remains open.** Headless Chromium, viewport emulation and axe results are supporting evidence; they do not complete this checklist.

Record the reviewed build/commit or source snapshot, test URL, tester, date, browser/OS versions, device, result and evidence for each row. Use an approved test environment and synthetic details/CVs. Production form delivery, storage operations and provider traffic require the separately authorized [server verification](production-verification-checklist.md). Never use a real applicant CV to test failure handling.

| Environment | Required coverage | Result / evidence |
| --- | --- | --- |
| Desktop Chrome | Mouse, keyboard, normal and enlarged zoom | NOT RUN |
| Desktop Edge | Mouse, keyboard, normal and enlarged zoom | NOT RUN |
| Physical Android browser | Touch, portrait/landscape, on-screen keyboard | NOT RUN |
| Physical iPhone/iPad Safari, where available | Touch, portrait/landscape, text sizing and safe areas | NOT RUN |
| Screen reader with supported desktop/mobile browser | Landmarks, headings, forms, dialogs, errors and status announcements | NOT RUN |

## Page and navigation coverage

- [ ] Homepage; Services and a service detail; a warehouse detail; About; Contact; Careers; a blog/resource page; a missing URL. Check English and Arabic, language switching and RTL placement.
- [ ] Desktop navigation, dropdowns, mobile menu, breadcrumbs, footer, internal/external links, back/forward, refresh and deep links work. Menus close predictably and return focus to their trigger.
- [ ] Check all policy routes: `/cookie-policy`, `/privacy-policy`, `/terms-and-conditions`, their `/ar` equivalents, `/editorial-policy`, `/corrections-policy`, `/technical-review-policy` and `/disclaimer`. Check initial load, refresh and client navigation. Titles, H1, policy text and links remain present with JavaScript disabled.
- [ ] No React hydration warnings, uncaught exceptions, unexpected failed resources or persistent loading state in the console/network panel. Distinguish deliberate offline tests and blocked optional providers from unexplained failures; retain evidence of each.

## Forms, CVs and failure states

- [ ] Contact/enquiry fields have visible labels, useful required/format errors, an understandable submission state and accessible success/failure feedback. Check invalid email/phone, empty fields, long input, double submit, network loss and retry with synthetic data.
- [ ] Careers supports a small synthetic PDF, DOC and DOCX. Check mismatched/disallowed type, oversize file, missing required values, cancellation/reselection and interrupted upload. Confirm a safe error and usable retry; server-side duplicate/metadata verification belongs to the authorized storage checklist.
- [ ] During loading, submission cannot accidentally duplicate work. A failed response preserves enough form input to retry and does not disclose server paths, private data or credentials.
- [ ] Image loading, lazy loading, slow/offline recovery, fallback text and responsive sizing work. Navigation during image loading does not leave an error or broken layout.

## Consent and accessibility

- [ ] With clean browser storage, test reject, accept, individual categories, Save, reopening Cookie Settings, refresh and navigation. Repeat with existing choices and a policy-version change in an approved fixture. Optional integrations follow the selected categories. Provider network verification is a separate authorized check.
- [ ] Reach all controls using Tab/Shift+Tab; use Enter/Space and Escape as appropriate. Focus is visible, ordered, never trapped unexpectedly and restored after menus/dialogs close. Verify consent dialog focus and background interaction.
- [ ] Check accessible names, language/RTL announcements, headings/landmarks, image alternatives, links, error associations and live status messages with a screen reader. Do not rely on colour alone.
- [ ] Check 200% and 400% browser zoom, enlarged text, 320-CSS-pixel reflow, landscape and the on-screen keyboard. No essential content/control is clipped or overlapped, and ordinary text does not require horizontal scrolling.
- [ ] Review remaining axe-incomplete contrast cases in the actual rendered states: header/body/footer gradients, hover/focus states, image-backed text and fixed widgets. The repaired footer text passed measured desktop/mobile EN/AR contrast; that does not certify every state.
- [ ] Specifically inspect the desktop floating “Need Help?” label and overlapping/sticky elements, including while reading footer links and using forms. The audit retained three repeated occlusion cases for manual review.

## Completion record

Attach screenshots or short reproduction steps to each failure, identify its owner, and retest the same build after repair. Record unavailable devices/browsers as **NOT RUN**, not PASS. Close this gate only when required coverage is complete and remaining findings have an explicit reviewed disposition. This checklist does not authorize deployment, staging, committing or pushing.

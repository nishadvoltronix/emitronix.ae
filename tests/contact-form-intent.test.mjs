import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { prefillContactService } from "../lib/contactFormIntent.ts";

const english = "Request a Site Visit";
const arabic = "طلب زيارة للموقع";
const intent = (query) => new URLSearchParams(query).getAll("intent");
const select = (label = english, value = "") => ({
  value,
  options: [{ value: "", disabled: true }, { value: "Civil Contracting", disabled: false }, { value: label, disabled: false }],
});

test("site-visit URL preselects the existing English service option", () => {
  const field = select();
  assert.equal(prefillContactService(field, intent("?intent=site-visit"), english, false), true);
  assert.equal(field.value, english);
});

test("Arabic contact forms select their existing translated option, not English", () => {
  const field = select(arabic);
  assert.equal(prefillContactService(field, intent("intent=site-visit&service=dewa-approval"), arabic, false), true);
  assert.equal(field.value, arabic);
});

test("generic contact URLs and unrelated query parameters retain the blank selection", () => {
  for (const query of ["", "?utm_source=test", "?service=site-visit", "?intent=", "?intent=quote", "?intent=SITE-VISIT", "?intent=%3Cscript%3E"]) {
    const field = select();
    assert.equal(prefillContactService(field, intent(query), english, false), false, query);
    assert.equal(field.value, "", query);
  }
});

test("repeated intent parameters are ambiguous and do not prefill", () => {
  for (const query of ["intent=site-visit&intent=quote", "intent=quote&intent=site-visit", "intent=site-visit&intent=site-visit"]) {
    const field = select();
    assert.equal(prefillContactService(field, intent(query), english, false), false);
    assert.equal(field.value, "");
  }
});

test("an existing user or autofilled choice is never overwritten", () => {
  for (const edited of [false, true]) {
    const field = select(english, "Civil Contracting");
    assert.equal(prefillContactService(field, ["site-visit"], english, edited), false);
    assert.equal(field.value, "Civil Contracting");
  }
});

test("a user's cleared service selection is not replaced by a later URL effect", () => {
  const field = select();
  assert.equal(prefillContactService(field, ["site-visit"], english, true), false);
  assert.equal(field.value, "");
});

test("rerenders and repeated effects do not reset the service or reapply after editing", () => {
  const field = select();
  assert.equal(prefillContactService(field, ["site-visit"], english, false), true);
  assert.equal(prefillContactService(field, ["site-visit"], english, false), false);
  field.value = "Civil Contracting";
  assert.equal(prefillContactService(field, ["site-visit"], english, true), false);
  assert.equal(field.value, "Civil Contracting");
});

test("navigation from a generic contact URL can prefill an untouched field", () => {
  const field = select();
  assert.equal(prefillContactService(field, intent("utm_source=test"), english, false), false);
  assert.equal(prefillContactService(field, intent("intent=site-visit&utm_source=test"), english, false), true);
  assert.equal(field.value, english);
});

test("missing, disabled or untranslated options are not invented from query input", () => {
  assert.equal(prefillContactService(null, ["site-visit"], english, false), false);
  const field = select();
  assert.equal(prefillContactService(field, ["site-visit"], arabic, false), false);
  field.options[2].disabled = true;
  assert.equal(prefillContactService(field, ["site-visit"], english, false), false);
  assert.equal(field.value, "");
});

test("prefill leaves the form's blank default and explicit reset behavior unchanged", () => {
  const field = { ...select(), defaultValue: "" };
  prefillContactService(field, ["site-visit"], english, false);
  assert.equal(field.defaultValue, "");
});

test("shared form wires URL updates behind Suspense and tracks actual service edits", async () => {
  const component = await readFile(new URL("../components/ContactForm.tsx", import.meta.url), "utf8");
  const englishPage = await readFile(new URL("../app/(en)/contact/page.tsx", import.meta.url), "utf8");
  const arabicPage = await readFile(new URL("../components/ArabicSitePage.tsx", import.meta.url), "utf8");
  assert.match(component, /const searchParams = useSearchParams\(\)/);
  assert.match(component, /new URLSearchParams\(query\)\.getAll\("intent"\)/);
  assert.match(component, /<Suspense fallback=\{null\}>\s*<ContactIntentPrefill[^>]*siteVisitLabel=\{text\.siteVisit\}/);
  assert.match(component, /onChange=\{\(\) => \{ serviceEdited\.current = true; \}\}/);
  assert.match(component, /ref=\{serviceRef\}[\s\S]*?name="service"[\s\S]*?defaultValue=""/);
  assert.match(component, /service: formData\.get\("service"\)/);
  assert.match(component, /form\.reset\(\)/);
  assert.match(englishPage, /<ContactForm\s*\/>/);
  assert.match(arabicPage, /<ContactForm language="ar"\s*\/>/);
});

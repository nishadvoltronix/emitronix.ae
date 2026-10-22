import assert from "node:assert/strict";
import test from "node:test";
import { formatHeading } from "../lib/headings.ts";

test("headings keep minor words lowercase and begin each phrase with a capital", () => {
  assert.equal(formatHeading("a guide to construction in Dubai"), "A Guide to Construction in Dubai");
  assert.equal(formatHeading("Civil works: the documents to prepare"), "Civil Works: The Documents to Prepare");
  assert.equal(formatHeading("What to look for"), "What to Look For");
});

test("industry acronyms, brand spellings, possessives and hyphenated words survive formatting", () => {
  assert.equal(formatHeading("DEWA and QA/QC for G+4 buildings in the UAE"), "DEWA and QA/QC for G+4 Buildings in the UAE");
  assert.equal(formatHeading("Emitronix’s fit-out and WhatsApp enquiries"), "Emitronix’s Fit-Out and WhatsApp Enquiries");
  assert.equal(formatHeading("the owner's MEP checklist?"), "The Owner's MEP Checklist?");
});

test("Arabic copy and already formatted document headings remain unchanged", () => {
  for (const heading of [
    "خدمات DEWA في دبي",
    "A Dubai Construction Company Built Around Scope Clarity",
    "Civil Contracting Services in Dubai",
    "Civil Construction Documents and Deliverables",
    "",
  ]) assert.equal(formatHeading(heading), heading);
});

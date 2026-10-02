import assert from "node:assert/strict";
import test from "node:test";
import { isValidPhone } from "../lib/phoneValidation.ts";
import { readBoundedRequestBody } from "../lib/requestBody.ts";

test("phone validation retains common local and international formatting", () => {
  for (const phone of ["+971 50 000 0000", "0500000000", "+44 (20) 7000-0000", "٠٥٠٠٠٠٠٠٠٠", "۰۵۰۰۰۰۰۰۰۰"]) assert.equal(isValidPhone(phone), true, phone);
});

test("phone validation rejects empty, alphabetic and implausible-length input", () => {
  for (const phone of ["", " ", "not-a-phone", "+", "12", "1234567890123456", null, 1234567]) assert.equal(isValidPhone(phone), false);
});

test("body limit applies to actual UTF-8 bytes without a length header", async () => {
  const result = await readBoundedRequestBody(new Request("https://audit.invalid", { method: "POST", body: "ععععع" }), 8);
  assert.equal(result.tooLarge, true);
  assert.equal(result.body, null);
});

test("forged short Content-Length cannot bypass the actual body limit", async () => {
  const result = await readBoundedRequestBody(new Request("https://audit.invalid", { method: "POST", body: "123456789", headers: { "content-length": "1" } }), 8);
  assert.equal(result.tooLarge, true);
});

test("oversized stream is cancelled instead of reading all remaining chunks", async () => {
  let cancelled = false;
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(9)); }, cancel() { cancelled = true; } });
  const result = await readBoundedRequestBody({ headers: new Headers(), body }, 8);
  assert.equal(result.tooLarge, true);
  assert.equal(cancelled, true);
});

test("a body exactly at the limit remains available for parsing", async () => {
  const result = await readBoundedRequestBody(new Request("https://audit.invalid", { method: "POST", body: "12345678" }), 8);
  assert.equal(result.tooLarge, false);
  assert.equal(result.body.toString("utf8"), "12345678");
});

test("oversized declared length is rejected without reading a body", async () => {
  const result = await readBoundedRequestBody({ headers: new Headers({ "content-length": "100" }), body: null }, 8);
  assert.equal(result.tooLarge, true);
});

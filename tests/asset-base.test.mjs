import test from "node:test";
import assert from "node:assert/strict";
import { assetBase } from "../scripts/asset-base.mjs";

test("asset origin defaults locally and accepts HTTPS", () => {
  assert.equal(assetBase(), "/");
  assert.equal(
    assetBase("https://assets.example.com"),
    "https://assets.example.com/",
  );
});
test("asset origin rejects credentials, insecure URLs and unexpected paths", () => {
  for (const value of [
    "http://example.com",
    "https://user:secret@example.com",
    "https://example.com/path",
    "https://example.com/?key=value",
    "https://example.com/#x",
  ])
    assert.throws(() => assetBase(value));
});

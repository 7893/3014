import test from "node:test";
import assert from "node:assert/strict";
import { renderCopy } from "../scripts/html.mjs";

test("HTML copy escapes attributes and poem lines", () => {
  const result = renderCopy("<title>{{ title }}</title><p>{{ lines }}</p>", {
    title: '<tag name="x">&',
    lines: ["first's", "<second>"],
  });
  assert.equal(
    result,
    "<title>&lt;tag name=&quot;x&quot;&gt;&amp;</title><p>first&#39;s<br />&lt;second&gt;</p>",
  );
});
test("unknown and malformed placeholders fail the build", () => {
  assert.throws(() => renderCopy("{{ missing }}"), /Missing copy/);
  assert.throws(() => renderCopy("{{site.title}}"), /Unresolved/);
});

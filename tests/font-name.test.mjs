import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { create } from "fontkit";
import subsetFont from "subset-font";
import { renameSubset } from "../scripts/font-name.mjs";

test("subset renaming preserves glyphs, layout tables and font checksums", async () => {
	const woff = await readFile(
		new URL("../src/assets/fonts/wenkai.woff2", import.meta.url),
	);
	const before = await subsetFont(woff, undefined, {
		targetFormat: "sfnt",
		keepAllGlyphs: true,
	});
	const after = renameSubset(before, "Test");
	assert.equal(create(after).familyName, "Test");
	assert.deepEqual(create(after).characterSet, create(before).characterSet);
	for (let i = 12; i < 12 + before.readUInt16BE(4) * 16; i += 16) {
		const tag = before.toString("ascii", i, i + 4);
		if (tag === "head" || tag === "name") continue;
		const start = before.readUInt32BE(i + 8),
			length = before.readUInt32BE(i + 12);
		assert.deepEqual(
			after.subarray(start, start + length),
			before.subarray(start, start + length),
			tag,
		);
	}
	let sum = 0;
	for (let i = 0; i < after.length; i += 4) {
		let word = 0;
		for (let j = 0; j < 4; j++) word = (word * 256 + (after[i + j] || 0)) >>> 0;
		sum = (sum + word) >>> 0;
	}
	assert.equal(sum, 0xb1b0afba);
	assert.throws(() => renameSubset(before, "An excessively long family name"));
});

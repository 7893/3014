// Rename the web subset without rewriting outlines or OpenType layout tables.
// Short names fit in the existing name-table storage; table offsets stay intact.
export function renameSubset(input, family) {
	const font = Buffer.from(input);
	const tables = new Map();
	for (let offset = 12; offset < 12 + font.readUInt16BE(4) * 16; offset += 16)
		tables.set(font.toString("ascii", offset, offset + 4), {
			record: offset,
			start: font.readUInt32BE(offset + 8),
			length: font.readUInt32BE(offset + 12),
		});
	const name = tables.get("name");
	const storage = name.start + font.readUInt16BE(name.start + 4);
	for (let i = 0; i < font.readUInt16BE(name.start + 2); i++) {
		const record = name.start + 6 + i * 12;
		if (![1, 3, 4, 6, 16, 18, 21].includes(font.readUInt16BE(record + 6)))
			continue;
		const platform = font.readUInt16BE(record);
		const encoded =
			platform === 0 || platform === 3
				? Buffer.from(family, "utf16le").swap16()
				: Buffer.from(family, "ascii");
		const length = font.readUInt16BE(record + 8);
		if (encoded.length > length)
			throw new Error("Subset name exceeds reserved space");
		const start = storage + font.readUInt16BE(record + 10);
		font.fill(0, start, start + length);
		encoded.copy(font, start);
		font.writeUInt16BE(encoded.length, record + 8);
	}
	const checksum = (start, length) => {
		let sum = 0;
		for (let i = 0; i < length; i += 4) {
			let word = 0;
			for (let j = 0; j < 4; j++)
				word = (word * 256 + (i + j < length ? font[start + i + j] : 0)) >>> 0;
			sum = (sum + word) >>> 0;
		}
		return sum;
	};
	font.writeUInt32BE(checksum(name.start, name.length), name.record + 4);
	const adjustment = tables.get("head").start + 8;
	font.writeUInt32BE(0, adjustment);
	font.writeUInt32BE((0xb1b0afba - checksum(0, font.length)) >>> 0, adjustment);
	return font;
}

import { copy } from "../src/config/copy.ts";

const escape = (value) =>
	String(value).replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char],
	);

export function renderCopy(template, configuration = copy) {
	const html = template.replace(/\{\{ ([\w.]+) \}\}/g, (_, path) => {
		const value = path
			.split(".")
			.reduce((part, key) => part?.[key], configuration);
		if (typeof value !== "string" && !Array.isArray(value))
			throw new Error(`Missing copy: ${path}`);
		return Array.isArray(value)
			? value.map(escape).join("<br />")
			: escape(value);
	});
	if (html.includes("{{")) throw new Error("Unresolved HTML placeholder");
	return html;
}

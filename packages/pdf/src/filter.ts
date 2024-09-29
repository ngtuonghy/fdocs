import { Cell } from "./cell";
import { PdfConfig } from "./types";

function parseLineRange(line: string): number[] {
	const ranges = line.split(",");
	const result: number[] = [];

	for (const range of ranges) {
		const [start, end] = range.split("-").map(Number);
		if (isNaN(start) || (end !== undefined && isNaN(end))) {
			throw new Error(`Invalid line range: ${range}`);
		}
		if (end !== undefined) {
			result.push(
				...Array.from({ length: end - start + 1 }, (_, i) => start + i),
			);
		} else {
			result.push(start);
		}
	}

	return result;
}

function getSkipLines(options: PdfConfig, currentPage: number): number[] {
	let skipLines: number[] = [];

	if (options.skipLines?.allPages) {
		if (typeof options.skipLines.allPages.lines === "string") {
			skipLines = parseLineRange(options.skipLines.allPages.lines);
		} else {
			skipLines = options.skipLines.allPages.lines as number[];
		}
	}

	if (options.skipLines?.pages) {
		const page = options.skipLines.pages.find(
			(page) => page.page === currentPage,
		);
		if (page) {
			if (typeof page.lines === "string") {
				skipLines = parseLineRange(page.lines);
			} else {
				skipLines = page.lines as number[];
			}
		}
	}
	// console.log(skipLines);
	return skipLines;
}

function shouldDeleteItem(
	item: Cell,
	textFilters?: { text: string; type?: string }[],
): boolean {
	if (!textFilters) return false;

	return textFilters.some(({ text, type = "contain" }) => {
		switch (type) {
			case "contain":
				return item.text.includes(text);
			case "startWith":
				return item.text.startsWith(text);
			case "exact":
				return item.text === text;
			case "regex":
				try {
					const regex = new RegExp(text);
					return regex.test(item.text);
				} catch (e) {
					console.error(`Invalid regex pattern: ${text}`, e);
					return false;
				}
			default:
				return false;
		}
	});
}
export function filter(items: Cell[], options: PdfConfig, currentPage: number) {
	const skipLines = getSkipLines(options, currentPage);
	const cells = items
		.filter((_, index) => {
			const currentLine = index + 1;
			return !skipLines.includes(currentLine);
		})
		.filter((item) => !shouldDeleteItem(item, options.skipLinesByText));
	// console.log(cells.length);
	const page = options.skipLines?.pages.find(
		(page) => page.page === currentPage,
	);

	if (page?.lastLines) {
		cells.splice(-page.lastLines);
	} else if (options?.skipLines?.allPages?.lastLines) {
		cells.splice(-options.skipLines.allPages.lastLines);
	}

	return cells.map((item) => item.text).join("\n");
}

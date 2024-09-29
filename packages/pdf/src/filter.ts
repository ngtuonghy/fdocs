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
	return skipLines;
}

function checkTextMatch(
	text: string,
	matchText: string,
	matchType: string,
): boolean {
	switch (matchType) {
		case "exact":
			return text === matchText;
		case "contain":
			return text.includes(matchText);
		case "startWith":
			return text.startsWith(matchText);
		case "regex":
			try {
				const regex = new RegExp(matchText);
				return regex.test(text);
			} catch (e) {
				console.error(`Invalid regex pattern: ${matchText}`, e);
				return false;
			}
		default:
			return false;
	}
}

function shouldDeleteItem(
	item: Cell,
	textFilters?: {
		text: string;
		type?: string;
		nextLine?: {
			text: string;
			type: "contain" | "startWith" | "regex" | "exact";
		};
	}[],
	nextItem?: Cell,
): boolean {
	if (!textFilters) return false;

	return textFilters.some(({ text, type = "contain", nextLine }): boolean => {
		const match = checkTextMatch(item.text, text, type);
		return (
			match &&
			(!nextLine ||
				(nextItem &&
					checkTextMatch(nextItem.text, nextLine.text, nextLine.type)))
		);
	});
}
export function filter(items: Cell[], options: PdfConfig, currentPage: number) {
	const skipLines = getSkipLines(options, currentPage);
	const cells = items.filter((item, index) => {
		const currentLine = index + 1;
		if (skipLines.includes(currentLine)) {
			return false;
		}
		const nextItem = index + 1 < items.length ? items[index + 1] : undefined;
		return !shouldDeleteItem(item, options.skipLinesByText, nextItem);
	});

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

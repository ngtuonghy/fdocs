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

	if (options.skip?.global) {
		if (typeof options.skip.global.lines === "string") {
			skipLines = parseLineRange(options.skip.global.lines);
		} else {
			skipLines = options.skip.global.lines as number[];
		}
	}

	if (options.skip?.pageSpecific) {
		const page = options.skip.pageSpecific?.find(
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
	matchText: string | RegExp,
	matchType: string,
): boolean {
	switch (matchType) {
		case "exact":
			return text === matchText;
		case "contain":
			return text.includes(matchText as string);
		case "startWith":
			return text.startsWith(matchText as string);
		case "regex":
			return new RegExp(matchText).test(text);
		// return RegExp(matchText).test(text);
		default:
			return false;
	}
}

function shouldDeleteItem(
	item: Cell,
	textFilters?: {
		value: string | RegExp;
		match?: string;
		nextLine?: {
			value: string | RegExp;
			match: "contain" | "startWith" | "regex" | "exact";
		};
	}[],
	nextItem?: Cell,
): boolean {
	if (!textFilters) return false;

	return textFilters.some(({ value, match = "contain", nextLine }): boolean => {
		const matchF = checkTextMatch(item.text, value, match);
		return (
			matchF &&
			(!nextLine ||
				(nextItem &&
					checkTextMatch(nextItem.text, nextLine.match, nextLine.match)))
		);
	});
}
export function filter(items: Cell[], options: PdfConfig, currentPage: number) {
	const skipLines = getSkipLines(options, currentPage);

	const cells = items.filter((item, index) => {
		const currentLine = index + 1;
		if (skipLines?.includes(currentLine)) {
			return false;
		}
		const nextItem = index + 1 < items.length ? items[index + 1] : undefined;
		return !shouldDeleteItem(item, options.skip?.text, nextItem);
	});

	const page = options.skip?.pageSpecific?.find(
		(page) => page.page === currentPage,
	);

	if (page?.lastLines) {
		cells.splice(-page.lastLines);
	} else if (options?.skip?.global?.lastLines) {
		cells.splice(-options.skip.global.lastLines);
	}
	let isSkipping = false;
	return cells
		.map((item) => {
			if (options?.skip?.ranges) {
				for (const range of options.skip.ranges) {
					const startMatch = checkTextMatch(
						item.text,
						range.start.value,
						range.start.match || "contain",
					);

					if (startMatch) {
						isSkipping = true;
					}

					const endMatch = checkTextMatch(
						item.text,
						range.end.value,
						range.end.match || "contain",
					);

					if (endMatch) {
						isSkipping = false;
						return null;
					}
				}
			}

			if (!isSkipping) {
				return item.text.trim();
			}
		})
		.filter(Boolean)
		.join("\n");
}

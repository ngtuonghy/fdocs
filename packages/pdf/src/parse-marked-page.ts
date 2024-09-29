import { writeFileSync } from "fs";
import { Cell } from "./cell";
import { PdfConfig } from "./types";
////                                                          ////
//                                                              //
// authour: "https://github.com/dictadata/pdf-data-parser";     //
//                                                             //
////                                                          ////
export const parseMarkedPage = async (page: any, options: PdfConfig) => {
	let cell = null;
	let markedContent = ""; // assume NO nesting of markedContent tags, at least I haven't seen it yet.
	let artifact = false;
	let paragraph = false;
	let span = false;
	let cells = [];
	let content = await page.getTextContent({
		includeMarkedContent: true,
		disableNormalization: false,
		disableCombineTextItems: false,
	});

	content.items.forEach((item, index) => {
		if (item.type === "beginMarkedContent") {
			switch (item.tag) {
				case "Artifact":
					markedContent = "Artifact";
					artifact = true;
					// insert working cell
					cells.push(cell);
					cell = null;
					// note: start a new cell, because headers and footers could be in artifacts
					break;
				default:
					console.warn("unknown content tag: " + item.tag);
			}
		} else if (item.type === "beginMarkedContentProps") {
			switch (item.tag) {
				case "P":
					markedContent = "P";
					paragraph = true;
					break;
				case "Span":
					markedContent = "Span";
					span = true;
					break;
				default:
			}
		} else if (item.type === "endMarkedContent") {
			switch (markedContent) {
				case "Artifact":
					artifact = false;
					// ignore text in artifacts like headers and footers
					if (options.artifacts) cells.push(cell);
					cell = null;
					break;
				case "P":
					break;
				case "Span":
					break;
			}

			markedContent = "";
		} else if (item.type) {
			// unknown type
			console.warn("Warning: unknown content type: " + item.type);
		} else {
			// a string item
			if (item.dir !== "ltr")
				// expect direction left-to-right
				console.warn("Warning: text direction is: " + item.dir);

			if (paragraph || span) {
				// ignore EOL
				if (item.str === "" && item.width === 0 && paragraph && item.hasEOL)
					return;
				// ignore spacing between cells
				if (item.str === " " && (paragraph || item.width > cell?.fontWidth))
					return;
				// for span and less than one character width assume we need it

				// check to save and start a new cell
				if (cell && cell.count > 0) {
					cell.hasSpan = cell.hasSpan || span;
					if (!cell.isAdjacent(item)) {
						cells.push(cell);
						cell = null;
					}
				}
			}

			if (!cell) cell = new Cell(options);
			// append text to cell
			cell.addItem(item, index);
			paragraph = false;
			span = false;
		}
		// push last cell
	});
	if (cell) cells.push(cell);
	// cells.sort((a, b) => a.x1 - b.x1);
	// cells.sort((a, b) => a.id - b.id);
	cells.sort((a, b) => b.y1 - a.y1);
	// writeFileSync("output.json", JSON.stringify(cells, null, 2));
	return cells;
};

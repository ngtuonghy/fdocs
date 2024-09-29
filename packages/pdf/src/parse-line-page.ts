import { PDFPageProxy, TextItem } from "pdfjs-dist/types/src/display/api";
import { Cell } from "./cell";
import { PdfConfig } from "./types";
import { writeFileSync } from "fs";
////                                                          ////
//                                                              //
//   authour: "https://github.com/dictadata/pdf-data-parser";   //
//                                                              //
////                                                          ////
export const parseLinedPage = async (
	page: PDFPageProxy,
	options: PdfConfig,
) => {
	let cell = new Cell(options);
	let wasEOL = false;
	let cells = [];
	let content = await page.getTextContent({
		disableNormalization: false,
	});

	content.items.forEach((item: TextItem, index) => {
		if (item.dir !== "ltr")
			// expect direction left-to-right
			console.warn(item.dir);

		let aligns = cell.alignment(item);

		if (!aligns.adjacent && cell.count > 0) {
			cells.push(cell);
			cell = new Cell(options);
		}

		if (
			wasEOL &&
			(aligns.top || ((aligns.left || aligns.right) && aligns.adjacent))
		) {
			// ignore newline in the middle of a line, e.g. a split heading
			// may be sensitive to normal line spacing and heading line spacing
			wasEOL = false;
		}

		if (wasEOL && cell.count > 0) {
			cells.push(cell);
			cell = new Cell(options);
		}

		// characters have a height, ignore more than one space between cells
		if (item.height > 0 || (item.str === " " && item.width < cell?.fontWidth))
			cell.addItem(item, index);

		wasEOL = item.hasEOL;
	});

	if (cell.count > 0) cells.push(cell);

	// cells.sort((a, b) => a.x1 - b.x1);
	if (options.sortY1) cells.sort((a, b) => b.y1 - a.y1);
	else cells.sort((a, b) => b.y2 - a.y2);
	// console.log("line-page");
	// writeFileSync("output.json", JSON.stringify(cells, null, 2));
	return cells;
};

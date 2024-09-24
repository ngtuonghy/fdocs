import fs from "fs";
import { PdfTextExtract } from "./types";
import { Cell } from "./cell";
export function groupTextItems(textItems: Cell[], options: PdfTextExtract) {
	textItems.sort((a, b) => b.y1 - a.y1);
	const groupedRows = [];
	// let currentRow = [];

	textItems.forEach((item, index) => {
		if (options.dataDelete) {
			const shouldDelete = options.dataDelete.some(
				({ text, type = "contain" }) => {
					if (type === "contain") {
						return item.text.includes(text);
					}
					if (type === "startWith") {
						return item.text.startsWith(text);
					}
					if (type === "exact") {
						return item.text === text;
					}
					return false; // Nếu không xác định, không thực hiện gì cả
				},
			);

			if (shouldDelete) return;
		}

		groupedRows.push(item.text);
		// if (currentRow.length === 0) {
		// 	currentRow.push(item);
		// } else {
		// 	const lastItem = currentRow[currentRow.length - 1] as Cell;
		// 	if (item.isSameLine(lastItem) === 0) {
		// 		currentRow.push(item);
		// 	} else {
		// 		currentRow.sort((a, b) => a.x1 - b.x1);
		// 		groupedRows.push(currentRow.map((i) => i.text).join(", "));
		// 		currentRow = [item];
		// 	}
		// }
		// if (index === textItems.length - 1 && currentRow.length > 0) {
		// 	currentRow.sort((a, b) => a.x1 - b.x1);
		// 	groupedRows.push(currentRow.map((i) => i.text).join(", "));
		// }
	});

	// fs.writeFileSync("foo-gr.json", JSON.stringify(textItems, null, 2));
	return groupedRows.join("\n");
}

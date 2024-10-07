import { getDocument, PDFWorker } from "pdfjs-dist/legacy/build/pdf.mjs";
import { parseMarkedPage } from "./parse-marked-page";
import { parseLinedPage } from "./parse-line-page";
import { Cell } from "./cell";
import { readFileSync } from "fs";
import { filter } from "./filter";
import { parsePagesOption } from "./parse-pages-option";
import { PdfConfig } from "./types";
import {
	PDFDocumentProxy,
	PDFPageProxy,
	TextItem,
} from "pdfjs-dist/types/src/display/api";

const pdf = async (
	pdfPath: string,
	options: PdfConfig = {
		threshold: 5,
		lineHeight: 1.67,
		pages: "1",
	},
): Promise<{
	getText: () => string[];
	getRaw: () => string[];
	getPages: () => number;
	getTextContent: () => string[];
}> => {
	const finalOptions: PdfConfig = Object.assign(
		{
			threshold: 5,
			lineHeight: 1.67,
			pages: "1",
			sort: "Y2",
		},
		options,
	);
	const raw = [];
	const text = [];
	const textContentArray = [];
	const data = new Uint8Array(readFileSync(pdfPath));
	try {
		const doc = await getDocument({
			data: data,
			standardFontDataUrl: "../node_modules/pdfjs-dist/standard_fonts/",
			verbosity: 0,
			password: finalOptions.password,
		}).promise;
		const markInfo = await doc.getMarkInfo();
		const numPages = doc.numPages;
		const pagesToProcess = parsePagesOption(finalOptions.pages, numPages);
		// console.log(markInfo?.Marked);
		console.log("Extracting...");

		for (const i of pagesToProcess) {
			console.log("Page", i, "of", numPages);
			const page = await doc.getPage(i);
			const textContent = await page.getTextContent();
			const pageTextContent = textContent.items
				.map((item: TextItem) => item.str)
				.join("\n");
			textContentArray.push(pageTextContent);

			let temp: Cell[] = [];
			if (markInfo?.Marked) {
				temp = await parseMarkedPage(page, finalOptions);
			} else {
				temp = await parseLinedPage(page, finalOptions);
			}
			raw.push(
				...temp.map((cell) => ({
					text: cell.text,
					x1: cell.x1,
					y1: cell.y1,
					x2: cell.x2,
					y2: cell.y2,
					fontHeight: cell.fontHeight,
					fontWidth: cell.fontWidth,
				})),
			);
			text.push(filter(temp, finalOptions, i));
		}
		console.log("done");
		return {
			getRaw: () => raw,
			getText: () => text,
			getPages: () => numPages,
			getTextContent: () => textContentArray,
		};
	} catch (e) {
		console.error("Error reading pdf", e);
		throw e;
	}
};

export { pdf };

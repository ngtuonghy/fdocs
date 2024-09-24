import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { parseMarkedPage } from "./parse-marked-page";
import { parseLinedPage } from "./parse-line-page";
import { groupTextItems } from "./group-text-items";
import { PdfTextExtract } from "./types";
import { Cell } from "./cell";

const pdf = async (
	pdfPath: string,
	options: PdfTextExtract = {
		threshold: 5,
		lineHeight: 1.67,
	},
): Promise<{
	getText: string[];
	getRaw: string[];
}> => {
	const raw = [];
	const text = [];

	const doc = await getDocument(pdfPath).promise;
	const markInfo = await doc.getMarkInfo();
	const numPages = doc.numPages;
	for (let i = 1; i <= numPages; i++) {
		console.log("Page ", i, " of ", numPages);
		const page = await doc.getPage(i);
		let temp: Cell[] = [];
		if (markInfo?.Marked) {
			temp = await parseMarkedPage(page, options);
		} else {
			temp = await parseLinedPage(page, options);
		}
		raw.push(...temp);
		text.push(groupTextItems(temp, options));
	}
	console.log("done");

	// fs.writeFileSync("foo.json", JSON.stringify(raw, null, 2));
	// fs.writeFileSync("foo.csv", text.join("\n"));
	return {
		getText: text,
		getRaw: raw,
	};
};

export { pdf };

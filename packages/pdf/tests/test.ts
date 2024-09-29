import { writeFileSync } from "fs";
import { pdf } from "../src";

const extractTextFromPDF = async (file) => {
	// Parse the PDF file
	const content = await pdf(file, {
		pages: "all" /*, password: "123124" */,
		skipLines: {
			allPages: {
				lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				lastLines: 7,
			},
			pages: [
				{
					page: 1,
					lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					lastLines: 2,
				},
			],
		},
	});
	//  comma separated list of ranges, or all.
	//example: "1,3-4" or [3,4]  or "all", Default is  ["1"]

	// Get the extracted text lines
	const lines = content.getText(); // ==> array: text
	writeFileSync("vietcombank145.txt", lines.join("\n"));
	//  const lines = content.getRaw(); ==> object:  coordinates (x, y, etc.).
	//  const lines = content.getPages(); ==> total number pages

	// console.log(lines); // Output the extracted text
};
extractTextFromPDF("./bidv.pdf");

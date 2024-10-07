import { writeFileSync } from "fs";
import { pdf } from "../src";

const extractTextFromPDF = async (file) => {
	// Parse the PDF file
	const content = await pdf(file, {
		pages: "1-5",
		/*, password: "123124" */
		skip: {
			ranges: [
				{
					start: {
						value: "I love you",
						match: "contain",
					},
					end: {
						value: "I hate you",
						match: "contain",
					},
				},
			],
			text: [
				{
					value: /^\(.*\)$/,
					match: "regex",
				},
			],
		},
	});
	//  comma separated list of ranges, or all.
	//example: "1,3-4" or [3,4]  or "all", Default is  ["1"]

	// Get the extracted text lines
	const lines = content.getText(); // ==> array: text
	writeFileSync("pdftest.txt", lines.join("\n"));
	//  const lines = content.getRaw(); ==> object:  coordinates (x, y, etc.).
	//  const lines = content.getPages(); ==> total number pages

	// console.log(lines); // Output the extracted text
};
extractTextFromPDF("./bidv.pdf");

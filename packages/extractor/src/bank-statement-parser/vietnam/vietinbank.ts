import fs from "fs";
import { pdfTextExtract } from "@fdocs/pdf";
import { clearLine } from "readline";
import { text } from "stream/consumers";

type VietinbankParserOptions = {
	pages?: string | "all";
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
};
const vietinbankParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "2",
		format: "CSV",
	},
) => {
	const headers = config.headers || [
		"no",
		"dateTime",
		"transactionComment",
		"credit",
		"offsetName",
	];
	const pages = config.pages || "all";
	const content = await pdfTextExtract(file);
	const lines = content.getText;
	const cleanedLines = lines.map((line) => {
		return line
			.replace(/,+/g, ",")
			.replace(/"+/g, "")
			.replace(/^"+,/g, "")
			.replace(/^,/, "")
			.replace(/\r(?!$)/g, " ");
	});
	fs.writeFileSync("foo.txt", content.getText.join("\n"));
	console.log(cleanedLines);

	//
	// const lines = content.split("\n");
	// const cleanedLines = lines
	// 	.map((line) => {
	// 		return line
	// 			.replace(/,+/g, ",")
	// 			.replace(/"+/g, "")
	// 			.replace(/^"+,/g, "")
	// 			.replace(/^,/, "")
	// 			.replace(/\r(?!$)/g, " ");
	// 	})
	// 	.filter((line) => {
	// 		return line.trim() !== "" && !/^,\s*$/.test(line);
	// 	});
	//
	// let rs = cleanedLines.slice(0);
	// if (pages === "all" || pages.includes("1")) {
	// 	rs = cleanedLines.slice(2);
	// }

	// if (config.outputFile) {
	// 	const fileContent =
	// 		config.format === "JSON" ? JSON.stringify(obj) : rs.join("\n");
	// 	fs.writeFileSync(config.outputFile, fileContent);
	// 	return `File has been written to ${config.outputFile}`;
	// } else {
	// 	if (config.format === "JSON") {
	// 		return obj;
	// 	} else {
	// 		return rs.join("\n");
	// 	}
	// }
};
export { vietinbankParser };

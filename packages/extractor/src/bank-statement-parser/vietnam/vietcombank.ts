import fs from "fs";
import { tabulaConvert } from "../../../core";
import { toObject } from "../../../utils/to-object";

type VietinbankParserOptions = {
	pages?: string | "all";
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
};
const vietcombankParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "all",
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
	const content = await tabulaConvert(file, {
		pages: pages,
		useLineReturns: true,
	});

	const lines = content.split("\n");
	const cleanedLines = lines.map((line) => {
		return line
			.replace(/,+/g, ",")
			.replace(/"+/g, "")
			.replace(/^"+,/g, "")
			.replace(/^,/, "")
			.replace(/\r(?!$)/g, " ");
	});

	// .filter((line) => {
	// 	return line.trim() !== "" && !/^,\s*$/.test(line);
	// });
	// console.log(cleanedLines);
	console.log(lines[1].split("\r"));
	fs.writeFileSync("vietcombank145.csv", lines[1]);
	// let rs = cleanedLines.slice(0);
	// if (pages === "all" || pages.includes("1")) {
	// 	rs = cleanedLines.slice(2);
	// }
	// const obj = toObject(headers, rs, 0);
	//
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
export { vietcombankParser };

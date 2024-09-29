import fs from "fs";
import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../utils/generate-CSV";

type VietinbankParserOptions = {
	pages?: string | "all" | number[];
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
};
const bidvParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "all",
		format: "JSON",
	},
) => {
	const headers = config.headers || [
		"credit",
		"no",
		"dateTime",
		"transactionComment",
	];

	const pages = config.pages || "all";
	const content = await pdf(file, {
		pages: pages,
		skipLines: {
			pages: [
				{
					page: 1,
					lines: "1-19",
				},
			],
		},
		skipLinesByText: [
			{
				text: "Chứng từ này được in/chuyển đổi trực tiếp từ hệ thống In sao kê tài khoản khách",
				type: "contain",
			},
			{
				text: "351",
				type: "exact",
			},
		],
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	fs.writeFileSync("bidv-raw.txt", JSON.stringify(content.getRaw(), null, 2));
	let currentTransaction = null;
	lines.forEach((line) => {
		if (currentTransaction) {
			if (currentTransaction[headers[3]]) {
				transactions.push(currentTransaction);
				currentTransaction = {
					[headers[0]]: line,
					[headers[1]]: "",
					[headers[2]]: "",
					[headers[3]]: "",
				};
			} else if (!currentTransaction[headers[1]]) {
				currentTransaction[headers[1]] = line;
			} else if (!currentTransaction[headers[2]]) {
				currentTransaction[headers[2]] = line;
			} else if (!currentTransaction[headers[3]]) {
				currentTransaction[headers[3]] = line;
			}

			console.log(currentTransaction[headers[3]]);
		} else {
			currentTransaction = {
				[headers[0]]: line,
				[headers[1]]: "",
				[headers[2]]: "",
				[headers[3]]: "",
			};
		}
	});

	if (config.format === "CSV") {
		const csv = generateCSV(transactions, headers);
		if (config.outputFile) {
			fs.writeFileSync(config.outputFile, csv);
		}
		return csv;
	} else {
		if (config.outputFile) {
			fs.writeFileSync(
				config.outputFile,
				JSON.stringify(transactions, null, 2),
			);
		}
		return transactions;
	}
};

export { bidvParser };

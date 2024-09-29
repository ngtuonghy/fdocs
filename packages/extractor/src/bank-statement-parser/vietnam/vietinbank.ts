import fs from "fs";
import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../utils/generate-CSV";

type VietinbankParserOptions = {
	pages?: string | "all" | number[];
	password?: string;
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
};
const vietinbankParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "all",
		format: "JSON",
	},
) => {
	const headers = config.headers || [
		"no",
		"dateTime",
		"transactionComment",
		"credit",
		"offsetName",
	];

	const pages = config.pages || "1";
	const content = await pdf(file, {
		pages: pages,
		password: config.password,
		skipLines: {
			pages: [
				{
					page: 1,
					lines: "1-28",
				},
			],
		},
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	const regex = /^(\d+)(\d{2}\/\d{2}\/.+)$/;
	let currentTransaction = null;
	lines.forEach((line) => {
		const match = line.match(regex);

		if (match) {
			if (currentTransaction) {
				transactions.push(currentTransaction);
			}

			currentTransaction = {
				[headers[0]]: match[1], // "no"
				[headers[1]]: match[2], // "dateTime"
				[headers[2]]: "", // "transactionComment"
				[headers[3]]: "", // "credit"
				[headers[4]]: "", // "offsetName"
			};
		} else if (currentTransaction) {
			if (!currentTransaction[headers[2]]) {
				currentTransaction[headers[2]] = line;
			} else if (!currentTransaction[headers[3]] && /^\d/.test(line)) {
				currentTransaction[headers[3]] = line;
			} else {
				currentTransaction[headers[4]] = line;
			}
		}
	});

	if (currentTransaction) {
		transactions.push(currentTransaction);
	}

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

export { vietinbankParser };

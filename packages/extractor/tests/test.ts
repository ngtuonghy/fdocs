import { bidvParser, vietinbankParser } from "../src/bank-statement-parser";
import { vietcombankParser } from "../src/bank-statement-parser/vietnam/vietcombank";

const extractor = async () => {
	// const vietinbank = await vietinbankParser("./vietinbank.pdf", {
	// 	format: "JSON",
	// });
	// console.log(vietinbank);
	//
	// const vietcombank = await vietcombankParser("./vietcombank.pdf", {
	// 	outputFile: "vietcombank.csv",
	// 	format: "CSV",
	// });
	// console.log(vietcombank);

	const bidv = await bidvParser("./bidv.pdf", {
		pages: "all",
		outputFile: "bidv.csv",
		format: "CSV",
	});

	console.log(bidv);
};
extractor();

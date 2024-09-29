import { bidvParser, vietinbankParser } from "../src/bank-statement-parser";
import { vietcombankParser } from "../src/bank-statement-parser/vietnam/vietcombank";

const run = async () => {
	const b = await vietinbankParser("./vietinbank.pdf", {
		outputFile: "vietinbank.csv",
		format: "CSV",
	});
	// console.log(b);

	const c = await vietcombankParser("./vietcombank14.pdf", {
		outputFile: "vietcombank.csv",
		format: "CSV",
	});
	// console.log(c);
	const d = await bidvParser("./bidv.pdf", {
		outputFile: "bidv.csv",
		format: "CSV",
	});
	// console.log(d);
};
run();

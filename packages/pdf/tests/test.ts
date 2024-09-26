import { writeFileSync } from "fs";
import { pdf } from "../src";

const run = async () => {
	const b = await pdf("./vietinbank.pdf");
	console.log(b);
	writeFileSync("foo.txt", b.getText.join("\n"));
	writeFileSync("foo.json", JSON.stringify(b.getRaw, null, 2));
};
run();

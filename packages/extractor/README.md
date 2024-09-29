# `@fdocs/extractor`

`@fdocs/extractor` is a lightweight tool that uses `@fdocs/pdf` to quickly convert PDFs into CSV and JSON formats for efficient text extraction. Currently, it supports bank statements from:
- Vietcombank
- BIDV
- VietinBank

## Installation

Install `@fdocs/extractor` using npm or pnpm:
```sh
npm install @fdocs/extractor
```
## Usage 
```js
const extractor = async () => {
// 	const vietinbank = await vietinbankParser("./vietinbank.pdf", {
// 		format: "JSON",
// 	});
// 	console.log(vietinbank);
//
// 	const vietcombank = await vietcombankParser("./vietcombank.pdf", {
// 		outputFile: "vietcombank.csv",
// 		format: "CSV",
// 	});
// 	console.log(vietcombank);

    const bidv = await bidvParser("./bidv.pdf", {
		pages: "all",
		outputFile: "bidv.csv",
		format: "CSV",
		password: "81832981",
	});
  
	    console.log(bidv);
};
extractor(); 
```
## Authors
- Nguyễn Tường Hy ([@ngtuonghy](https://github.com/ngtuonghy))

## License
This package is licensed under the MIT License. See the [LICENSE](https://github.com/ngtuonghy/fdocs/blob/main/LICENSE) file for details.

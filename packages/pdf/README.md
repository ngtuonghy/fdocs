# `@fdocs/pdf`- simple light to extract plain text from a pdf file.
## Features

- 🔥 Easy-to-use
- 🔐 Password Protection: Securely handle password-protected documents.
- 📄 Flexible Page Selection: Process specific pages or the entire document.
- 🚫 Line Skipping: Easily skip unwanted lines from pages.

## Install 
```bash
npm install @fdocs/pdf
```
## Usage 
```js
import { pdf } from "@fdocs/pdf";

const extractTextFromPDF = async (file) => {
	// parse the PDF file
	const content = await pdf(file, { pages: "1"});
	// example: "1,3-4" or [3,4]  or "all", Default is  ["1"]

	// get the extracted text lines
	const lines = content.getText(); //  ==> array: text
	// const lines = content.getRaw();   ==> object:  coordinates (x, y, etc.).
	// const lines = content.getPages(); ==> total number pages

	console.log(lines); // Output the extracted text
};
extractTextFromPDF("vietcombank14.pdf");
```
## API
```js
const options = {
    pages ? : string | number[] | "all",
      
    password ? : string,
      
    skipLinesByText ? : {
        text: string;
        type ? : "contain" | "startWith" | "regex" | "exact";
    }[],
      
    skipLines ? : {
        allPages ? : {
            lines: string | number[];
            lastLines ? : number;
        },
        pages ? : {
            page: number;
            lines: string | number[];
            lastLines ? : number;
        }[],
    },
}

```
## Example
```js
const extractTextFromPDF = async (file) => {
    const content = await pdf(file, {
        pages: "all",
        skipLinesByText: [{
                text: "This document is printed/converted directly from the customer account statement printing system",
                type: "contain",
            },
            {
                text: "351",
                type: "exact",
            },
        ],
        skipLines: {
            allPages: {
                lines: "1-11",
                lastLines: 7,
            },
            pages: [{
                    page: 1,
                    lines: "1-28",
                },
                {
                    page: 2,
                    lines: [1, 5, 7],
                    lastLines: 4,
                },
            ],
        },
    });
    // get the extracted text lines
    const lines = content.getText(); //  ==> array: text
    // const lines = content.getRaw();   ==> object:  coordinates (x, y, etc.).
    // const lines = content.getPages(); ==> total number pages

    console.log(lines); // Output the extracted text
}
extractTextFromPDF("foo.pdf")
```
## Changelog


## Authors
- ngtuonghy

## License

This package is licensed under the MIT License. See the LICENSE file for details.

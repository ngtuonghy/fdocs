<p align="center"> 
    <h1 align="center">@fdocs/pdf 
    <br>
    simple light to extract plain text from a pdf file
</h1>
</p>


<p align="center"> 
  <a aria-label="NPM Downloads" href="https://www.npmjs.com/@fdocs/pdf">
        <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40fdocs%2Fpdf?style=for-the-badge&labelColor=4F75FF">
      
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/@fdocs/pdf">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/%40fdocs%2Fpdf?style=for-the-badge&labelColor=4F75FF">
  </a>
  <a aria-label="License" href="https://github.com/ngtuonghy/fdocs/blob/main/LICENSE">
    <img alt="NPM License" src="https://img.shields.io/npm/l/%40fdocs%2Fpdf?style=for-the-badge&labelColor=4F75FF">
  </a>
</p>

## Features

- 🔥 Easy-to-use
- 🔐 Password Protection:handle password-protected documents.
- 📄 Flexible Page Selection: Process specific pages or the entire document.
- 🚫 Line Skipping: Easily skip unwanted lines from pages.

## Install 
```console
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
## [Changelog](https://github.com/ngtuonghy/fdocs/blob/main/packages/pdf/CHANGELOG.md)

## Authors
- Nguyễn Tường Hy ([@ngtuonghy](https://github.com/ngtuonghy))

## License

This package is licensed under the MIT License. See the LICENSE file for details.

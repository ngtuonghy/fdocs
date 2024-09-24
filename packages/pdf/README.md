# `@fdocs/pdf`- simple light to extract plain text from a pdf file.
## Install 
```sh
npm install @fdocs/pdf
```
## Usage 
```js
import { pdf } from "@fdocs/pdf";

const extractTextFromPDF = async (file) => {
  // Parse the PDF file
  const content = await pdf(file);

  // Get the extracted text lines
  const lines = content.getText;

  console.log(lines); // Output the extracted text
};

extractTextFromPDF("foo.pdf");

```
## Authors
#### ngtuonghy

## License

This package is licensed under the MIT License. See the LICENSE file for details.

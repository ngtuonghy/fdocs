type PdfTextExtract = {
    threshold?: number;
    lineHeight?: number;
    newlines?: boolean;
    artifacts?: boolean;
    dataDelete?: {
        text: string;
        type?: "contain" | "startWith" | "regex" | "exact";
    }[];
};

declare const pdfTextExtract: (pdfPath: string, options?: PdfTextExtract) => Promise<{
    getText: string[];
    getRaw: string[];
}>;

export { pdfTextExtract };

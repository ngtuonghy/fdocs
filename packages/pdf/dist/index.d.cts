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

declare const pdf: (pdfPath: string, options?: PdfTextExtract) => Promise<{
    getText: string[];
    getRaw: string[];
}>;

export { pdf };

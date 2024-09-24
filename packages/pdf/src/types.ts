export type PdfTextExtract = {
	threshold?: number;
	lineHeight?: number;
	newlines?: boolean;
	artifacts?: boolean;
	dataDelete?: {
		text: string;
		type?: "contain" | "startWith" | "regex" | "exact";
	}[];
};

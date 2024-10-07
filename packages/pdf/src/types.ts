type AllPagesSkipConfig = {
	lines?: string | number[];
	lastLines?: number;
};

type PageSkipConfig = {
	page: number;
	lines?: string | number[];
	lastLines?: number;
};

export type PdfConfig = {
	threshold?: number;
	lineHeight?: number;
	newlines?: boolean;
	artifacts?: boolean;
	password?: string;
	sort?: "Y1" | "Y2" | "none";
	pages?: string | number[] | "all";
	skip?: {
		global?: AllPagesSkipConfig; // Skip lines for all pages
		pageSpecific?: PageSkipConfig[]; // Skip lines for specific pages
		text?: {
			value: string | RegExp;
			match?: "contain" | "startWith" | "regex" | "exact"; // Text match type
			nextLine?: {
				value: string | RegExp;
				match: "contain" | "startWith" | "regex" | "exact";
			};
		}[];
		ranges?: {
			start: {
				value: string | RegExp;
				match?: "contain" | "startWith" | "regex" | "exact"; // Start match type
			};
			end: {
				value: string | RegExp;
				match?: "contain" | "startWith" | "regex" | "exact"; // End match type
			};
		}[];
	};
};

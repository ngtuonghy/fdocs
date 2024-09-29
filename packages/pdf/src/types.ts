type AllPagesSkipConfig = {
	lines: string | number[];
	lastLines?: number;
};

type PageSkipConfig = {
	page: number;
	lines: string | number[];
	lastLines?: number;
};

export type PdfConfig = {
	threshold?: number;
	lineHeight?: number;
	newlines?: boolean;
	artifacts?: boolean;
	password?: string;
	sortY1?: boolean;
	skipLinesByText?: {
		text: string;
		type?: "contain" | "startWith" | "regex" | "exact";
		nextLine?: {
			text: string;
			type: "contain" | "startWith" | "regex" | "exact";
		};
	}[];
	pages?: string | number[] | "all";
	skipLines?: {
		allPages?: AllPagesSkipConfig;
		pages?: PageSkipConfig[];
	};
};

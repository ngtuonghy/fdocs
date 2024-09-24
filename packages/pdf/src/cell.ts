/**
 * Cell contains the data value (text) and bounding box coordinates.
 */

// @author: https://github.com/dictadata/pdf-data-parser
//
//
//
//

export class Cell {
	options: { lineHeight?: number; newlines?: boolean };
	text: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	fontHeight: number;
	fontWidth: number;
	private lineHeightRatio: number;
	count: number;
	prevX: number;
	prevY: number;
	prevX2: number;
	prevY2: number;
	hasSpan: boolean;
	inserted: boolean;

	constructor(options: { lineHeight?: number; newlines?: boolean } = {}) {
		this.options = options;
		this.text = "";
		this.x1 = 9999;
		this.y1 = 9999;
		this.x2 = 0;
		this.y2 = 0;
		this.fontHeight = 8;
		this.fontWidth = 4;
		this.lineHeightRatio = options.lineHeight || 1.67;
		this.count = 0;
		this.prevX = 0;
		this.prevY = 0;
		this.prevX2 = 0;
		this.prevY2 = 0;
		this.hasSpan = false;
		this.inserted = false;
	}

	get lineHeight(): number {
		return this.fontHeight * this.lineHeightRatio;
	}

	addItem(item: {
		str: string;
		hasEOL: boolean;
		transform: number[];
		width: number;
		height: number;
	}): void {
		this.count++;

		if (item.str) this.text += item.str;
		if (item.hasEOL) this.text += this.options.newlines ? "\n" : " ";

		const x = item.transform[4];
		const y = item.transform[5];
		const w = item.width;
		const h = item.height;

		// Update cell bounding box
		if (x < this.x1) this.x1 = x;
		if (y < this.y1) this.y1 = y;
		if (x + w > this.x2) this.x2 = x + w; // right edge of cell
		if (y + h > this.y2) this.y2 = y + h; // top edge of cell

		// Update font size
		const fh = item.transform[0];
		const fw = item.str ? item.width / item.str.length : 0;
		if (fh > this.fontHeight) this.fontHeight = fh;
		if (fw > this.fontWidth) this.fontWidth = fw;

		// Position of last item added
		this.prevX = x;
		this.prevY = y;
		this.prevX2 = x + w;
		this.prevY2 = y + h;
	}

	isSameLine(cell: Cell): number {
		let same = 0;

		if (cell.y1 - 1 > this.y2)
			// cell baseline is above this topline
			same = 1;
		else if (cell.y2 + 1 < this.y1)
			// cell topline is below this baseline
			same = -1;

		return same;
	}

	isOutputLine(cell: Cell): boolean {
		// Check if Y boundary overlaps
		let yOverlaps =
			(cell.y1 >= this.y1 && cell.y1 <= this.y2) ||
			(this.y1 >= cell.y1 && this.y1 <= cell.y2);

		if (yOverlaps) {
			// If cell has wrapped then check if previous cell was a vertical span
			if (this.x1 < cell.x1 && this.y2 - this.y1 < cell.y2 - cell.y1)
				yOverlaps = false;
		}

		return yOverlaps;
	}

	isAdjacent(item: {
		transform: number[];
		width: number;
		height: number;
	}): boolean {
		const x = item.transform[4];
		const y = item.transform[5];
		const w = item.width;
		const h = item.height;

		// Check if item on same line as previous item and within one character width
		if (
			Math.abs(y - this.prevY) <= this.lineHeight * 0.125 &&
			x - this.prevX2 < this.fontWidth
		)
			return true;

		// Check if item is on next line and x range overlaps cell x boundary
		if (
			this.hasSpan &&
			this.prevY - y > this.lineHeight * 0.75 &&
			this.prevY - y <= this.lineHeight * 1.25 &&
			((x >= this.x1 && x <= this.x2) || (this.x1 >= x && this.x1 <= x + w))
		)
			return true;

		return false;
	}

	alignment(item: { transform: number[]; width: number; height: number }): {
		top: boolean;
		bottom: boolean;
		left: boolean;
		right: boolean;
		adjacent: boolean;
	} {
		const aligns = {
			top: false,
			bottom: false,
			left: false,
			right: false,
			adjacent: false,
		};

		if (this.count === 0) return aligns;

		const x = item.transform[4];
		const y = item.transform[5];

		// Horizontal alignment baseline
		if (Math.abs(y - this.y1) <= 2.0) aligns.bottom = true;
		// Horizontal alignment topline
		if (Math.abs(y + item.height - this.y2) <= 2.0) aligns.top = true;
		// Vertical alignment left justified
		if (Math.abs(x - this.x1) <= 2.0) aligns.left = true;
		// Vertical alignment right justified
		if (Math.abs(x + item.width - this.x2) <= 2.0) aligns.right = true;

		// Assume we're processing top to bottom, left to right
		if ((aligns.top || aligns.bottom) && Math.abs(x - this.x2) < this.fontWidth)
			aligns.adjacent = true;
		if (
			(aligns.left || aligns.right) &&
			Math.abs(y + item.height - this.y1) < this.fontWidth
		)
			aligns.adjacent = true;

		return aligns;
	}
}

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

class Cell {
  constructor(options = {}) {
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
  get lineHeight() {
    return this.fontHeight * this.lineHeightRatio;
  }
  addItem(item) {
    this.count++;
    if (item.str) this.text += item.str;
    if (item.hasEOL) this.text += this.options.newlines ? "\n" : " ";
    const x = item.transform[4];
    const y = item.transform[5];
    const w = item.width;
    const h = item.height;
    if (x < this.x1) this.x1 = x;
    if (y < this.y1) this.y1 = y;
    if (x + w > this.x2) this.x2 = x + w;
    if (y + h > this.y2) this.y2 = y + h;
    const fh = item.transform[0];
    const fw = item.str ? item.width / item.str.length : 0;
    if (fh > this.fontHeight) this.fontHeight = fh;
    if (fw > this.fontWidth) this.fontWidth = fw;
    this.prevX = x;
    this.prevY = y;
    this.prevX2 = x + w;
    this.prevY2 = y + h;
  }
  isSameLine(cell) {
    let same = 0;
    if (cell.y1 - 1 > this.y2)
      same = 1;
    else if (cell.y2 + 1 < this.y1)
      same = -1;
    return same;
  }
  isOutputLine(cell) {
    let yOverlaps = cell.y1 >= this.y1 && cell.y1 <= this.y2 || this.y1 >= cell.y1 && this.y1 <= cell.y2;
    if (yOverlaps) {
      if (this.x1 < cell.x1 && this.y2 - this.y1 < cell.y2 - cell.y1)
        yOverlaps = false;
    }
    return yOverlaps;
  }
  isAdjacent(item) {
    const x = item.transform[4];
    const y = item.transform[5];
    const w = item.width;
    item.height;
    if (Math.abs(y - this.prevY) <= this.lineHeight * 0.125 && x - this.prevX2 < this.fontWidth)
      return true;
    if (this.hasSpan && this.prevY - y > this.lineHeight * 0.75 && this.prevY - y <= this.lineHeight * 1.25 && (x >= this.x1 && x <= this.x2 || this.x1 >= x && this.x1 <= x + w))
      return true;
    return false;
  }
  alignment(item) {
    const aligns = {
      top: false,
      bottom: false,
      left: false,
      right: false,
      adjacent: false
    };
    if (this.count === 0) return aligns;
    const x = item.transform[4];
    const y = item.transform[5];
    if (Math.abs(y - this.y1) <= 2) aligns.bottom = true;
    if (Math.abs(y + item.height - this.y2) <= 2) aligns.top = true;
    if (Math.abs(x - this.x1) <= 2) aligns.left = true;
    if (Math.abs(x + item.width - this.x2) <= 2) aligns.right = true;
    if ((aligns.top || aligns.bottom) && Math.abs(x - this.x2) < this.fontWidth)
      aligns.adjacent = true;
    if ((aligns.left || aligns.right) && Math.abs(y + item.height - this.y1) < this.fontWidth)
      aligns.adjacent = true;
    return aligns;
  }
}

const parseMarkedPage = async (page, options) => {
  let cell = null;
  let markedContent = "";
  let paragraph = false;
  let span = false;
  let cells = [];
  let content = await page.getTextContent({
    includeMarkedContent: true,
    disableNormalization: false,
    disableCombineTextItems: false
  });
  for (let item of content.items) {
    if (item.type === "beginMarkedContent") {
      switch (item.tag) {
        case "Artifact":
          markedContent = "Artifact";
          cells.push(cell);
          cell = null;
          break;
        default:
          console.warn("unknown content tag: " + item.tag);
      }
    } else if (item.type === "beginMarkedContentProps") {
      switch (item.tag) {
        case "P":
          markedContent = "P";
          paragraph = true;
          break;
        case "Span":
          markedContent = "Span";
          span = true;
          break;
      }
    } else if (item.type === "endMarkedContent") {
      switch (markedContent) {
        case "Artifact":
          if (options.artifacts) cells.push(cell);
          cell = null;
          break;
      }
      markedContent = "";
    } else if (item.type) {
      console.warn("Warning: unknown content type: " + item.type);
    } else {
      if (item.dir !== "ltr")
        console.warn("Warning: text direction is: " + item.dir);
      if (paragraph || span) {
        if (item.str === "" && item.width === 0 && paragraph && item.hasEOL)
          continue;
        if (item.str === " " && (paragraph || item.width > (cell == null ? void 0 : cell.fontWidth)))
          continue;
        if (cell && cell.count > 0) {
          cell.hasSpan = cell.hasSpan || span;
          if (!cell.isAdjacent(item)) {
            cells.push(cell);
            cell = null;
          }
        }
      }
      if (!cell) cell = new Cell(options);
      cell.addItem(item);
      paragraph = false;
      span = false;
    }
  }
  return cells;
};

const parseLinedPage = async (page, options) => {
  let cell = new Cell(options);
  let wasEOL = false;
  let cells = [];
  let content = await page.getTextContent({
    disableNormalization: false
  });
  content.items.forEach((item) => {
    if (item.dir !== "ltr")
      console.warn(item.dir);
    let aligns = cell.alignment(item);
    if (!aligns.adjacent && cell.count > 0) {
      cells.push(cell);
      cell = new Cell(options);
    }
    if (wasEOL && (aligns.top || (aligns.left || aligns.right) && aligns.adjacent)) {
      wasEOL = false;
    }
    if (wasEOL && cell.count > 0) {
      cells.push(cell);
      cell = new Cell(options);
    }
    if (item.height > 0 || item.str === " " && item.width < (cell == null ? void 0 : cell.fontWidth))
      cell.addItem(item);
    wasEOL = item.hasEOL;
  });
  if (cell.count > 0) cells.push(cell);
  return cells;
};

function groupTextItems(textItems, options) {
  textItems.sort((a, b) => b.y1 - a.y1);
  const groupedRows = [];
  textItems.forEach((item, index) => {
    if (options.dataDelete) {
      const shouldDelete = options.dataDelete.some(
        ({ text, type = "contain" }) => {
          if (type === "contain") {
            return item.text.includes(text);
          }
          if (type === "startWith") {
            return item.text.startsWith(text);
          }
          if (type === "exact") {
            return item.text === text;
          }
          return false;
        }
      );
      if (shouldDelete) return;
    }
    groupedRows.push(item.text);
  });
  return groupedRows.join("\n");
}

const pdf = async (pdfPath, options = {
  threshold: 5,
  lineHeight: 1.67
}) => {
  const raw = [];
  const text = [];
  const doc = await getDocument(pdfPath).promise;
  const markInfo = await doc.getMarkInfo();
  const numPages = doc.numPages;
  for (let i = 1; i <= numPages; i++) {
    console.log("Page ", i, " of ", numPages);
    const page = await doc.getPage(i);
    let temp = [];
    if (markInfo == null ? void 0 : markInfo.Marked) {
      temp = await parseMarkedPage(page, options);
    } else {
      temp = await parseLinedPage(page, options);
    }
    raw.push(...temp);
    text.push(groupTextItems(temp, options));
  }
  console.log("done");
  return {
    getText: text,
    getRaw: raw
  };
};

export { pdf };

const parsePagesOption = (
	pagesOption: string | number[],
	totalPages: number,
): number[] => {
	const pages: Set<number> = new Set();

	if (Array.isArray(pagesOption)) {
		// If an array is passed, add each element to the set
		pagesOption.forEach((page) => {
			if (page >= 1 && page <= totalPages) {
				pages.add(page);
			}
		});
	} else if (typeof pagesOption === "string") {
		// If the option is 'all', process all pages
		if (pagesOption.trim() === "all") {
			for (let i = 1; i <= totalPages; i++) {
				pages.add(i);
			}
		} else {
			// Split the input by commas and process each range or individual page
			const ranges = pagesOption.split(",");
			ranges.forEach((range) => {
				const [start, end] = range.split("-").map(Number);

				if (end) {
					// Add pages in the range if it's a valid range
					for (let i = start; i <= end; i++) {
						if (i >= 1 && i <= totalPages) {
							pages.add(i);
						}
					}
				} else if (start >= 1 && start <= totalPages) {
					// If it's a single valid page number, add it
					pages.add(start);
				}
			});
		}
	}
	return [...pages];
};
export { parsePagesOption };

const generateCSV = (
	transactions: Record<string, string>[],
	headers: string[],
) => {
	const csv = [
		headers.join(","),
		...transactions.map((transaction) =>
			headers.map((header) => transaction[header] || "").join(","),
		),
	];
	return csv.join("\n");
};
export { generateCSV };

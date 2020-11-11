export const sleep = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isNumber = (n) => {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

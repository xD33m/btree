export const sleep = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isNumber = (n) => {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

export const everyKeyCanBeDeleted = (input, insertedKeys) => {
	for (var i = 0; i < input.length; ++i) {
		if (insertedKeys.indexOf(input[i]) === -1) return false;
	}
	return true;
};

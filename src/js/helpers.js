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

// Helper-Klassen für den fomrmatierten Output für GraphViz
export class GraphString {
	constructor() {
		this.str = '';
	}
	add(str) {
		this.str += str;
	}
}

export class Counter {
	constructor() {
		this.count = 0;
	}
	add() {
		return this.count++;
	}
}

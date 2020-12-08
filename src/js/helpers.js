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

export const verifyInput = (type, keys, insertedKeys) => {
	if (type === 'insert' || type === 'delete') {
		if (keys.length === 1 && keys[0] === '') {
			return 'Enter some numbers first';
		} else if (new Set(keys).size !== keys.length) {
			// input has duplicates
			return 'The input has duplicates';
		} else if (keys.some(isNaN) || keys.includes('')) {
			// check for non Integer
			return 'Only numberic input allowed';
		}
	}
	if (type === 'insert') {
		// eine oder mehrere Zahlen wurden schon eingefügt
		if (insertedKeys.some((r) => keys.indexOf(r) >= 0)) {
			return 'A number has already been inserted';
		}
	} else if (type === 'delete') {
		if (!everyKeyCanBeDeleted(keys, insertedKeys)) {
			return 'At least one number is not in the tree';
		}
	} else if (type === 'previous') {
		if (insertedKeys.length === 0) {
			return "You can't go back any further";
		}
	} else if (type === 'search') {
		if (keys.length === 1 && keys[0] === '') {
			return 'Enter a number first';
		} else if (keys.length > 1) {
			return 'You can only search one number at a time';
		} else if (keys.some(isNaN) || keys.includes('')) {
			return 'Only numberic input allowed';
		}
	}
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

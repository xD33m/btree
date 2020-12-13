import BTreeNode from './BTreeNode';

class BTree {
	constructor(order) {
		this.root = new BTreeNode(order);
		this._order = order; // Order = Verzweigungsgrad = Anzahl an erlaubten Söhne
	}

	add(key) {
		let split = this.root.add(key);
		if (!split) return; // if false = kein split wurde vorgenommen

		this.root = this.newNode(split); // neue Node, wenn es ein Split gab
	}

	delete(key) {
		let removed = this.root.delete(key);

		if (this.root._keyCount === 0 && this.root._childs[0]) {
			// wenn Root gemerged wurde, wird die gemergte Node die neue Root.
			this.root = this.root._childs[0];
		}

		return removed;
	}

	search(key) {
		let depth = 0;
		const keyFound = this.root.search(key, depth);
		return keyFound;
	}

	newNode(split) {
		let node = new BTreeNode(this._order);

		node._keyCount = 1;
		node._keys[0] = split.key;
		node._childs[0] = split.left;
		node._childs[1] = split.right;

		return node;
	}

	toGraphViz(key) {
		return this.root.toGraphViz(key);
	}
}

export default BTree;

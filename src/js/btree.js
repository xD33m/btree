import BTreeNode from './BTreeNode';

class BTree {
	constructor(order) {
		this._root = new BTreeNode(order);
		this._order = order;
	}
	add(key) {
		let split = this._root.add(key);
		if (!split) return; // if false = kein split wurde vorgenommen

		this._root = this.newNode(split); // neue Node, wenn es ein Split gab
	}

	remove(key) {
		let removed = this._root.remove(key);

		if (this._root.keyCount() === 0 && this._root._childs[0]) {
			this._root = this._root._childs[0];
		}

		return removed;
	}

	search(key) {
		let deph = 0;
		const keyFound = this._root.search(key, deph);
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
		return this._root.toGraphViz(key);
	}
}

export default BTree;

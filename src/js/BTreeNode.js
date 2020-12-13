import { GraphString, Counter } from './helpers';

class BTreeNode {
	constructor(order) {
		this._order = order;
		this._keys = Array(order - 1).fill(null); // Array mit default values befüllen
		this._childs = Array(order).fill(null);
		this._keyCount = 0; // keyCount zählt die eigentlichen Schlüssel eines Knotens (!= null)
	}

	allowedMinKeys() {
		return Math.ceil(this._order / 2 - 1);
	}

	isFull() {
		return this._keyCount === this._order - 1;
	}

	isLeaf() {
		return this._childs[0] === null;
	}

	// add ist die Einfügeoperation
	add(key) {
		if (this.isLeaf()) {
			if (this.isFull()) {
				return this.split(key, null);
			} else {
				// Schlüssel an der richtigen Position des Knotens einfügen
				let pos = this._keyCount;
				let keys = this._keys;

				while (pos > 0 && keys[pos - 1] > key) {
					keys[pos] = keys[pos - 1];
					pos--;
				}
				keys[pos] = key;
				this._keyCount += 1;
				return null;
			}
		} else {
			let child = this.nextChildDestination(key);

			let split = child.add(key); // if null -> key wurde eingefügt
			if (!split) return null;

			if (this.isFull()) {
				// 'this' referenziert hier immer den "parent" und isFull() überprüft, ob ein weiterer Split notwendig ist
				return this.split(split.key, split.right);
			} else {
				// wenn man splittet, muss unterschieden werden, welcher Kindknoten gesplittet wird &
				// wie demenstrepchend die Schlüssel angeorndet werden müssen
				let leftChild = split.left;
				if (leftChild === this._childs[0]) {
					for (let i = this._keyCount; i > 0; i--)
						this._keys[i] = this._keys[i - 1];
					this._keys[0] = split.key;

					for (let i = this._keyCount + 1; i > 1; i--)
						this._childs[i] = this._childs[i - 1];
					this._childs[0] = leftChild;
					this._childs[1] = split.right;
				} else {
					let index = this._keyCount;
					while (index > 0 && this._childs[index] !== leftChild) {
						this._keys[index] = this._keys[index - 1];
						this._childs[index + 1] = this._childs[index];
						index--;
					}

					this._keys[index] = split.key;
					this._childs[index + 1] = split.right;
				}

				this._keyCount += 1;
				return null;
			}
		}
	}

	// nextChildDestination ist eine Helpfer-Function, die immer eine Ebene tiefer geht, um einen Schlüssel einzufügen, zu löschen oder zu suchen
	nextChildDestination(key) {
		for (let i = 0; i < this._keyCount; i += 1) {
			if (key <= this._keys[i]) {
				return this._childs[i];
			}
		}

		return this._childs[this._keyCount];
	}

	// split teilt eine Node in 2 Nodes + dem mitteren Key und gibt diese dann zurück
	split(key, rightSplitKey) {
		let left = this;
		let right = new BTreeNode(this._order);

		let keys = this._keys.slice();
		keys.push(null);

		let childs = this._childs.slice();
		childs.push(null);

		// die neue Position des einzufügenden Keys wird gesucht
		let pos = keys.length - 1;
		while (pos > 0 && keys[pos - 1] > key) {
			keys[pos] = keys[pos - 1];
			childs[pos + 1] = childs[pos];
			pos--;
		}

		keys[pos] = key;
		childs[pos + 1] = rightSplitKey;

		// Split-Position wird berechnet
		let medianIndex = Math.floor(keys.length / 2);
		let medianKey = keys[medianIndex];
		let i;

		// Die linke Node wird präpariert
		for (i = 0; i < keys.length; i++) {
			if (i < medianIndex) {
				left._childs[i] = childs[i];
				left._keys[i] = keys[i];
			} else if (i === medianIndex) {
				left._childs[i] = childs[i];
				left._keys[i] = null;
			} else {
				left._childs[i] = null;
				if (!this._keys.includes(null)) {
					this._keys[i] = null;
				}
			}
		}
		left._keyCount = medianIndex;

		// Die rechte Node wird präpariert
		for (i = 0; i < keys.length; i++) {
			if (i > medianIndex) {
				right._keys[i - medianIndex - 1] = keys[i];
				right._childs[i - medianIndex - 1] = childs[i];
				right._keyCount += 1;
			}
		}
		right._childs[keys.length - medianIndex - 1] = childs[keys.length];

		return { left: left, key: medianKey, right: right };
	}

	search(key) {
		let cost = 1;
		let found = this._keys.includes(key);
		let child = this;
		while (true) {
			if (child.isLeaf()) {
				found = child._keys.includes(key);
				break;
			} else {
				const keyIndex = child._keys.indexOf(key);
				if (keyIndex === -1) {
					cost++;
					child = child.nextChildDestination(key);
				} else {
					found = true;
					break;
				}
			}
		}

		return { found, cost };
	}

	rebalance(childIndex) {
		let child = this._childs[childIndex];
		if (child._keyCount >= this.allowedMinKeys()) {
			// don't rebalance if enough keys
			return;
		}

		// wenn ein linkes child exisitiert, nimm davon ein key
		if (childIndex) {
			let leftChild = this._childs[childIndex - 1];
			if (leftChild._keyCount > this.allowedMinKeys()) {
				let lastKey = leftChild._keys[leftChild._keyCount - 1];
				let lastChild = null;
				if (!leftChild.isLeaf()) {
					lastChild = leftChild._childs[leftChild._keyCount];
				}
				leftChild._keyCount--;

				let key = this._keys[childIndex - 1];
				this._keys[childIndex - 1] = lastKey;

				for (let i = child._keyCount - 1; i >= 0; i--) {
					child._keys[i + 1] = child._keys[i];
				}
				child._keys[0] = key;

				for (let i = child._keyCount; i >= 0; i--) {
					child._childs[i + 1] = child._childs[i];
				}
				child._childs[0] = lastChild;
				child._keyCount++;

				return;
			}
		}

		// sonst von rechts
		if (childIndex < this._keyCount) {
			let rightChild = this._childs[childIndex + 1];
			if (rightChild._keyCount > this.allowedMinKeys()) {
				let firstKey = rightChild._keys[0];
				let firstChild = rightChild._childs[0];

				for (let i = 0; i < rightChild._keyCount - 1; i++) {
					rightChild._keys[i] = rightChild._keys[i + 1];
				}

				for (let i = 0; i < rightChild._keyCount; i++) {
					rightChild._childs[i] = rightChild._childs[i + 1];
				}

				rightChild._keyCount--;

				child._keys[child._keyCount] = this._keys[childIndex];
				this._keys[childIndex] = firstKey;
				child._childs[child._keyCount + 1] = firstChild;
				child._keyCount++;

				return;
			}
		}

		if (childIndex) {
			childIndex -= 1;
		}

		// childIndex zeigt auf den linken Knoten der 2 germegten Kindknoten
		let merged = this.mergeChilds(childIndex);

		for (let i = childIndex; i < this._keyCount - 1; i += 1) {
			this._keys[i] = this._keys[i + 1];
			this._keys[i + 1] = null;
		}
		for (let i = childIndex; i < this._keyCount; i += 1) {
			this._childs[i] = this._childs[i + 1];
			this._childs[i + 1] = null;
		}
		this._keyCount--;
		this._childs[childIndex] = merged;
	}

	// löschen eines Schlüssels
	delete(key) {
		if (this.isLeaf()) {
			return this.removeKey(key);
		} else {
			let keyIndex = this._keys.indexOf(key); // check if key current node
			let child;

			if (keyIndex === -1) {
				// wemm der Key nicht im derzeitigen Knoten ist
				child = this.nextChildDestination(key); // eine Kindknoten weiter runter
				let result = child.delete(key); // von vorne anfangen

				this.rebalance(this._childs.indexOf(child));
				return result;
			} else {
				// Schlüssel wird mit dem größten Schlüssel von links ersetzt
				child = this._childs[keyIndex];
				this._keys[keyIndex] = child.getMaxKey();

				this.rebalance(keyIndex);
				return true;
			}
		}
	}

	mergeChilds(leftIndex) {
		let key = this._keys[leftIndex];

		let left = this._childs[leftIndex];
		let right = this._childs[leftIndex + 1];

		left._keys[left._keyCount] = key;
		left._keyCount++;

		// Schlüssel und Knoten werden in linken Knoten kopiert.
		for (let i = 0; i < right._keyCount; i++) {
			left._childs[left._keyCount] = right._childs[i];
			left._keys[left._keyCount] = right._keys[i];
			left._keyCount += 1;
		}

		left._childs[left._keyCount] = right._childs[right._keyCount];

		return left;
	}

	// gibt den größten Schlüssel im Knoten zurück, wenn es sich um Blattknoten handelt, sonst wird balnciert.
	getMaxKey() {
		let key;

		if (this.isLeaf()) {
			key = this._keys[this._keyCount - 1];
			this._keyCount--;
		} else {
			let child = this._childs[this._keyCount];
			key = child.getMaxKey();

			this.rebalance(this._keyCount); // von unten nach oben alles ausbalancieren
		}

		return key;
	}

	removeKey(key) {
		let keyIndex = this._keys.indexOf(key);
		if (keyIndex === -1) return false;
		this._keys.splice(keyIndex, 1);
		this._keyCount--;
		return true;
	}

	// toGraphViz parsed das Baum-Objekt in das GraphViz-Dot Format für die Darstellung
	toGraphViz(key) {
		let graphString = new GraphString();
		this.parseObject(new Counter(), graphString, key);
		let string = `digraph g {\n
			graph [center=true, bgcolor="#19181f", pad=1.5]
			edge [color=white]
			node [shape = plaintext,height=.1, color=white, fontcolor=white];\n${graphString.str}\n }`;
		return string;
	}
	// helper-funktion für toGraphViz
	parseObject(counter, graphString, key) {
		let nodeid = `node${counter.add()}`;
		graphString.add(
			`${nodeid}[label= <<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0"><TR>`
		);
		let i;
		for (i = 0; i < this._keyCount; i++) {
			graphString.add(
				`<TD PORT="f${i}" width="20" height="30" fixedsize="true"> </TD>`
			);
			if (this._keys[i] === key) {
				graphString.add(
					`<TD width="30" height="30" fixedsize="true" bgcolor="white"><FONT color="red">${this._keys[i]}</FONT></TD>`
				);
			} else {
				graphString.add(
					`<TD width="30" height="30" fixedsize="true">${this._keys[i]}</TD>`
				);
			}
		}
		graphString.add(
			`<TD PORT="f${i}" width="20" height="30" fixedsize="true"> </TD></TR></TABLE>>];\n`
		);

		this._childs.forEach(function (child, index) {
			if (child !== null) {
				let childnodeid = child.parseObject(counter, graphString, key);
				graphString.add(`"${nodeid}":f${index} -> "${childnodeid}"\n`);
			}
		});
		return nodeid;
	}
}

export default BTreeNode;

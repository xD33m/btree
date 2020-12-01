import React, { Component } from 'react';
import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { isNumber } from '../js/helpers';

const CustomTextField = withStyles({
	root: {
		'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderColor: 'white',
		},
		'&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderColor: 'white',
		},
		'& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
			borderColor: 'gray',
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: (props) => props.bordercolor,
		},
	},
})(TextField);

class Controls extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	// check, ob der Wert ein Array oder ein String. In beiden Fällen wird ein Array zurückgegeben.
	checkInput() {
		const input = this.props.inputValues.toString();
		if (!input.includes(',') && input) {
			return [parseFloat(this.props.inputValues)];
		} else {
			const arr = input.split(',').map((v) => (isNumber(v) ? parseFloat(v) : v));
			return arr;
		}
	}

	keyWasInserted(arr1, arr2) {
		arr2 = this.checkInput(arr2);
		return arr1.some((r) => arr2.indexOf(r) >= 0);
	}

	handleUpload = (input) => {
		input = input.target;
		let csvData = [];
		if (input.files && input.files[0]) {
			let reader = new FileReader();
			reader.readAsBinaryString(input.files[0]);
			reader.onload = function (e) {
				let lbreak = e.target.result.split('\n');
				lbreak.forEach((res) => {
					// alles außer Zahlen ignorieren
					if (!!parseFloat(res)) {
						if (res.includes(',')) {
							csvData = res.split(',').map((el) => parseFloat(el));
						} else if (!!parseFloat(res)) {
							csvData.push(parseFloat(res));
						}
					}
				});
			};
			reader.onloadend = () => this.props.setInputValues(csvData);
		}
	};

	hasDuplicates = (array) => {
		return new Set(array).size !== array.length;
	};

	inputIsEmpty = () => {
		const input = this.props.inputValues;
		if (input === '') return true;
	};

	handleInput = (e) => {
		const input = e.target.value;
		// const re = /^\d+(,\d+)*/;
		// if ((input === '', input === ',' || re.test(input))) {
		let arr = input.split(',');
		if (!this.hasDuplicates(arr)) {
			this.props.setInputValues(input);
		}

		// }
	};

	render() {
		const {
			openDialog,
			inputValues,
			add,
			removeKeys,
			currentOrder,
			changeOrder,
			isAutomaticInsert,
			resetTree,
			searchKey,
		} = this.props;
		return (
			<>
				<Grid item>
					<CustomTextField
						variant="outlined"
						bordercolor={currentOrder > 2 ? 'green' : 'red'}
						label="Order"
						value={currentOrder}
						name="newOrder"
						size="small"
						type="number"
						onChange={(e) => {
							changeOrder(e);
						}}
						style={{ margin: '10px', width: '100px' }}
						inputProps={{
							autoComplete: 'off',
							min: 3,
							max: 9999,
						}}
					/>
					<CustomTextField
						variant="outlined"
						bordercolor="green"
						label="Insert / Delete:"
						value={inputValues}
						id="inputField"
						name="inputField"
						size="small"
						onChange={(e) => this.handleInput(e)}
						style={{ margin: '10px' }}
						inputProps={{
							autoComplete: 'off',
						}}
						InputLabelProps={{ shrink: true }}
						disabled={currentOrder < 3 ? true : false}
						placeholder="55,32,20,10..."
					/>

					<Button
						variant="outlined"
						id="insertButton"
						onClick={() => add(this.checkInput(), true)}
						style={{ margin: '10px' }}
					>
						{isAutomaticInsert ? 'Insert' : 'Insert All'}
					</Button>
					<Button
						variant="outlined"
						onClick={() => searchKey(this.checkInput())}
						style={{
							margin: '10px',
							borderColor: 'blueviolet',
						}}
						disabled={currentOrder < 3 ? true : false}
					>
						Search
					</Button>
					<Button
						variant="outlined"
						className="redButton"
						onClick={() => removeKeys(this.checkInput())}
						style={{ margin: '10px' }}
					>
						{isAutomaticInsert ? 'Delete' : 'Delete All'}
					</Button>
				</Grid>
				<Grid item>
					<input
						accept=".csv"
						id="csvUpload"
						multiple
						type="file"
						style={{ display: 'none' }}
						onChange={(e, file) => this.handleUpload(e, file)}
					/>
					<label htmlFor="csvUpload">
						<Button
							id="uploadButton"
							className="defaultButton"
							variant="outlined"
							startIcon={<CloudUploadIcon />}
							style={{ margin: '10px', color: 'white' }}
							component="span"
						>
							Upload CSV
						</Button>
					</label>

					<Button
						variant="outlined"
						className="defaultButton"
						onClick={openDialog}
						style={{ margin: '10px' }}
						disabled={currentOrder < 3 ? true : false}
					>
						Generate Keys
					</Button>
					<Button
						className="redButton"
						variant="outlined"
						style={{ margin: '10px' }}
						onClick={() => resetTree()}
					>
						Reset Tree
					</Button>
				</Grid>
			</>
		);
	}
}

export default Controls;

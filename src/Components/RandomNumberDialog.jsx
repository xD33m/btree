import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	withStyles,
} from '@material-ui/core';
import React, { Component } from 'react';

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

class RandomNumberDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			minValue: 0,
			maxValue: 100,
			amountOfKeys: 30,
		};
	}

	// Generiert eine bestimmte zufüllige Anzahl an Zahlen zw
	generateInput = () => {
		const min = parseInt(this.state.minValue);
		const max = parseInt(this.state.maxValue);
		const amnt = parseInt(this.state.amountOfKeys);
		var arr = [];
		// https://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
		while (arr.length < amnt) {
			var r = Math.floor(Math.random() * max) + min;
			if (arr.indexOf(r) === -1) arr.push(r);
		}
		arr = arr.join(',');
		this.props.setRandomNumbers(arr);
		this.props.closeDialog();
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	render() {
		const { closeDialog, dialogOpen } = this.props;
		return (
			<Dialog open={dialogOpen}>
				<DialogTitle>{'Generate Unique Random Keys'}</DialogTitle>
				<DialogContent>
					<CustomTextField
						variant="outlined"
						bordercolor="white"
						label="Min Value"
						value={this.state.minValue}
						id="minValue"
						name="minValue"
						size="small"
						type="number"
						onChange={(e) => this.handleChange(e)}
						style={{ margin: '10px', width: '100px' }}
						inputProps={{
							autoComplete: 'off',
						}}
						InputLabelProps={{ shrink: true }}
						min={0}
					/>
					<CustomTextField
						variant="outlined"
						bordercolor="white"
						label="Max Value"
						value={this.state.maxValue}
						id="maxValue"
						name="maxValue"
						size="small"
						type="number"
						onChange={(e) => this.handleChange(e)}
						style={{ margin: '10px', width: '100px' }}
						inputProps={{
							autoComplete: 'off',
							min: 0,
						}}
						InputLabelProps={{ shrink: true }}
					/>
					<CustomTextField
						variant="outlined"
						bordercolor="white"
						label="Amount of Keys"
						value={this.state.amountOfKeys}
						id="amountOfKeys"
						name="amountOfKeys"
						size="small"
						type="number"
						onChange={(e) => this.handleChange(e)}
						style={{ margin: '10px', width: '150px' }}
						inputProps={{
							autoComplete: 'off',
							min: 0,
						}}
						InputLabelProps={{ shrink: true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => closeDialog()}>Cancel</Button>
					<Button
						onClick={this.generateInput}
						color="primary"
						disabled={
							parseInt(this.state.minValue) >=
								parseInt(this.state.maxValue) ||
							parseInt(this.state.maxValue) -
								parseInt(this.state.minValue) <
								parseInt(this.state.amountOfKeys)
								? true
								: false
						}
					>
						Generate
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default RandomNumberDialog;

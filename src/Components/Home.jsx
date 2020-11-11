import React, { Component } from 'react';
import { BTree } from '../js/btree';
import { sleep, isNumber } from '../js/helpers';
import { Graphviz } from 'graphviz-react';
import {
	Button,
	createMuiTheme,
	Grid,
	Slider,
	Switch,
	TextField,
	ThemeProvider,
	Typography,
	withStyles,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

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

const muiTheme = createMuiTheme({
	overrides: {
		MuiSlider: {
			root: {
				color: 'white',
			},
			thumb: {
				color: 'white',
			},
			track: {
				color: 'white',
			},
			rail: {
				color: 'grey',
			},
			markLabel: {
				color: 'white',
			},
			markLabelActive: {
				color: 'white',
			},
		},
		MuiDialog: {
			paper: {
				color: 'white',
				backgroundColor: '#19181f',
			},
		},
		MuiDialogContentText: {
			root: {
				color: 'white',
			},
		},
	},
});

// TODO
// --- Frontend ---
// [X] add "Upload Keys from CSV"
// [X] add "Enable Step-By-Step insertion"
// [X] add "Next / Back"
// [X] add Dialog for "Generate Input"
// [X] improve "Generate Input"
// [X] add "Reset"-Button
// [X] improve Button Layout
// [X] bei speed 0 -> instant, evtl checkmark
// [/] add Path-Color on Insert / Delete / Search
// [ ] improve lag
// [ ] delete should remove the deleted number from "insertedKeys"
// [ ] "delete all" button
// [ ] add "enable Zoom"
// [ ] add correct duplicate detection
// [ ] improve Visulisation performance?
// [ ] handle incorrect input
// --- BAUM ---
// [ ] "Suchen"-Button -> Suchfunktion
// [X] Delete fixen

let bTree;
class Home extends Component {
	constructor(props) {
		super(props);
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
		this.state = {
			dirGraph: `digraph g {}`,

			inputField: '',
			newOrder: 3,

			width: 0,
			height: 0,

			enteredNumbers: [],
			insertedKeys: [],
			keysToAdd: [],
			hideKey: false,

			insertSpeed: 300,

			automaticInsertSwitch: true,

			openDialog: false,

			minValue: 0,
			maxValue: 100,
			amountOfKeys: 30,
		};
	}

	componentDidMount = () => {
		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions);
		this.init(this.state.newOrder); // default Order is 3
		this.setState({
			dirGraph: `digraph g {
				graph [center=true bgcolor="#19181f", pad=1.5]
				edge [color=white]
				node [shape = record,height=.1, color=white, fontcolor=white, width=1];
				}`,
		});
	};

	updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight - 100 });
	}

	init(order) {
		bTree = new BTree(order);
		this.draw();
	}

	draw(key) {
		let dot = bTree.toGraphViz(key);
		this.setState({ dirGraph: dot });
	}

	add = async (keys, insertAll) => {
		const isAutomaticInsert = this.state.automaticInsertSwitch;
		// manuelles einfügen, wenn auf "next" geklickt wird
		if (!isAutomaticInsert && !insertAll) {
			await this.insertOnNext(keys);
		} else if (!isAutomaticInsert && insertAll) {
			// "insert all"-button bei manuelles Einfügen
			this.insertAllKeys(keys);
		} else {
			this.setState({ inputField: '' });
			let execForEach = Promise.resolve();
			keys.forEach((key, index) => {
				if (isAutomaticInsert) {
					execForEach = execForEach.then(() => {
						this.insertSingleKey(key);
						this.updateInsertedKeys(key);
						return sleep(this.state.insertSpeed);
					});
				}
			});
			execForEach.then(async () => {
				this.redrawAfterDelay(800);
			});
		}
	};

	redrawAfterDelay = async (ms) => {
		await sleep(ms);
		this.draw();
		this.setState({ hideKey: true });
	};

	updateInsertedKeys = (key) => {
		let insertedKeys = this.state.insertedKeys;
		insertedKeys.push(key);
		this.setState({ insertedKeys, hideKey: false });
	};

	insertOnNext = async (keys) => {
		let keyToAdd = keys;
		this.insertSingleKey(keyToAdd[0]);
		this.updateInsertedKeys(keyToAdd[0]);
		keyToAdd.shift();
		this.setState({ inputField: keyToAdd });
		await this.redrawAfterDelay(800);
	};

	insertAllKeys(keys) {
		keys.forEach((key) => {
			bTree.add(parseInt(key));
		});
		this.draw();
		this.setState({ inputField: '', insertedKeys: keys, hideKey: true });
	}

	insertSingleKey = (key) => {
		key = parseInt(key);
		bTree.add(key);
		this.draw(key);
	};

	removeKeys(keys) {
		this.setState({ inputField: '' });
		let execForEach = Promise.resolve();
		keys.forEach((key, index) => {
			execForEach = execForEach.then(() => {
				bTree.remove(parseInt(key));
				this.draw();
				let insertedKeys = this.state.insertedKeys;
				insertedKeys.pop();
				this.setState({ insertedKeys });
				return sleep(this.state.insertSpeed);
			});
		});
	}

	previousStep(keys) {
		let insertedKeys = this.state.insertedKeys;
		const latestInsert = insertedKeys[insertedKeys.length - 1];
		bTree.remove(parseInt(latestInsert));
		this.draw();
		if (keys[0] && keys.length >= 1) {
			keys.unshift(latestInsert);
			keys = keys.join(',');
		} else {
			keys = latestInsert;
		}

		insertedKeys.pop();
		this.setState({ inputField: keys, insertedKeys });
	}

	resetTree() {
		this.setState({
			dirGraph: `digraph g {}`,
			insertedKeys: [],
		});
		this.init(this.state.newOrder);
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
		this.setState({ inputField: arr, openDialog: false });
	};

	// check, ob der Wert ein Array oder ein String. In beiden Fällen wird ein Array zurückgegeben.
	checkInput() {
		const input = this.state.inputField.toString();
		if (!input.includes(',') && input) {
			return [parseFloat(this.state.inputField)];
		} else {
			const arr = input.split(',').map((v) => (isNumber(v) ? parseFloat(v) : v));
			return arr;
		}
	}

	changeOrder = (e) => {
		if (e.target.value) {
			this.setState({ enteredNumbers: [] }); // reset [] if tree is reset
			this.init(parseInt(e.target.value));
		}
	};

	// inputHasDuplicates(arr1, arr2) {
	// 	arr2 = this.checkInput(arr2);
	// 	return arr1.some((r) => arr2.indexOf(r) >= 0);
	// }

	parseData = (data) => {
		let csvData = [];
		let lbreak = data.split('\n');
		lbreak.forEach((res) => {
			csvData.push(res.split(','));
		});
	};

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
						csvData = res.split(',').map((el) => parseFloat(el));
					}
				});
			};
			reader.onloadend = () => this.setState({ inputField: csvData });
		}
	};

	handleSwitch = (e) => {
		this.setState({ automaticInsertSwitch: e.target.checked });
	};

	setInsertSpeed = (e, value) => {
		this.setState({ insertSpeed: value });
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	render() {
		return (
			<>
				<ThemeProvider theme={muiTheme}>
					<Grid
						container
						style={{
							flexDirection: 'column',
							alignContent: 'center',
						}}
					>
						<Typography variant="h1" align="center">
							B-Tree
						</Typography>
						<Grid
							item
							style={{
								padding: '10px',
								margin: '5px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<Grid item>
								<CustomTextField
									variant="outlined"
									bordercolor={
										this.state.newOrder > 2 ? 'green' : 'red'
									}
									label="Order"
									value={this.state.newOrder}
									name="newOrder"
									size="small"
									type="number"
									onChange={(e) => {
										this.handleChange(e);
										this.changeOrder(e);
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
									value={this.state.inputField}
									id="inputField"
									name="inputField"
									size="small"
									onChange={(e) => this.handleChange(e)}
									style={{ margin: '10px' }}
									inputProps={{
										autoComplete: 'off',
									}}
									InputLabelProps={{ shrink: true }}
									disabled={this.state.newOrder < 3 ? true : false}
									placeholder="55,32,20,10..."
								/>

								<Button
									variant="outlined"
									id="insertButton"
									onClick={() => this.add(this.checkInput(), true)}
									style={{ margin: '10px' }}
									disabled={this.state.newOrder < 3 ? true : false}
								>
									{this.state.automaticInsertSwitch
										? 'Insert'
										: 'Insert All'}
								</Button>
								<Button
									variant="outlined"
									onClick={() => this.searchKey(this.checkInput())}
									style={{
										margin: '10px',
										borderColor: 'blueviolet',
									}}
									disabled={this.state.newOrder < 3 ? true : false}
								>
									Search
								</Button>
								<Button
									variant="outlined"
									className="redButton"
									onClick={() => this.removeKeys(this.checkInput())}
									style={{ margin: '10px' }}
									disabled={this.state.newOrder < 3 ? true : false}
								>
									Delete
								</Button>
							</Grid>
							{/* <div style={{width: '100%'}}></div> */}
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
									onClick={() => this.setState({ openDialog: true })}
									style={{ margin: '10px' }}
									disabled={this.state.newOrder < 3 ? true : false}
								>
									Generate Keys
								</Button>
								<Button
									className="redButton"
									variant="outlined"
									style={{ margin: '10px' }}
									onClick={() => this.resetTree()}
								>
									Reset Tree
								</Button>
							</Grid>
						</Grid>
						<Grid
							item
							style={{
								display: 'flex',
								justifyContent: 'center',
								width: '1300px',
								height: '500px',
								border: 'solid white 1px',
								backgroundColor: '#19181f',
								position: 'relative',
							}}
						>
							<Typography
								style={{
									bottom: 0,
									left: 0,
									position: 'absolute',
									margin: '10px',
								}}
								visibility="hide"
							>
								Inserting:{' '}
								<span
									style={
										this.state.hideKey
											? { visibility: 'hidden' }
											: { visibility: 'visible' }
									}
								>
									{
										this.state.insertedKeys[
											this.state.insertedKeys.length - 1
										]
									}
								</span>
							</Typography>
							<Graphviz
								dot={this.state.dirGraph}
								options={{
									// zoom: true,
									// fit: true,
									width: 1295,
									height: 495,
								}}
							/>
						</Grid>
						<Grid
							item
							style={{
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{!this.state.automaticInsertSwitch ? (
								<Grid>
									<Button
										variant="outlined"
										className="defaultButton"
										startIcon={<ArrowBackIcon />}
										onClick={() =>
											this.previousStep(this.checkInput())
										}
										style={{ margin: '20px 10px 10px 10px' }}
										disabled={this.state.newOrder < 3 ? true : false}
									>
										Previous Insert
									</Button>
									<Button
										variant="outlined"
										className="defaultButton"
										endIcon={<ArrowForwardIcon />}
										onClick={() => {
											this.add(this.checkInput());
										}}
										style={{ margin: '20px 10px 10px 10px' }}
										disabled={this.state.newOrder < 3 ? true : false}
									>
										Next Insert
									</Button>
								</Grid>
							) : (
								<Grid style={{ flexFlow: 'column', alignSelf: 'center' }}>
									<Typography style={{ margin: '20px 0 -5px 0' }}>
										Insert/Delete Speed
									</Typography>
									<Slider
										defaultValue={500}
										value={this.value}
										onChange={this.setInsertSpeed}
										valueLabelDisplay="off"
										min={0}
										max={1500}
										step={100}
										marks={[
											{
												value: 0,
												label: '0ms',
											},
											{
												value: 750,
												label: '750ms',
											},
											{
												value: 1500,
												label: '1500ms',
											},
										]}
										style={{ width: '300px', marginBottom: '35px' }}
									/>
								</Grid>
							)}
						</Grid>
						<Grid
							item
							style={{
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							<Typography component="div">
								<Grid
									component="label"
									container
									alignItems="center"
									spacing={1}
								>
									<Grid item style={{ textAlign: 'center' }}>
										Manual <br /> Insert/Delete
									</Grid>
									<Grid item>
										<Switch
											checked={this.state.automaticInsertSwitch}
											onChange={this.handleSwitch}
											name="automaticInsertSwitch"
										/>
									</Grid>
									<Grid item style={{ textAlign: 'center' }}>
										Automatic <br /> Insert/Delete
									</Grid>
								</Grid>
							</Typography>
						</Grid>
						<Dialog open={this.state.openDialog}>
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
								<Button
									onClick={() => this.setState({ openDialog: false })}
								>
									Cancel
								</Button>
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
					</Grid>
				</ThemeProvider>
			</>
		);
	}
}

export default Home;

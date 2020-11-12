import React, { Component } from 'react';
import { BTree } from '../js/btree';
import { isNumber, sleep } from '../js/helpers';
import { Graphviz } from 'graphviz-react';
import {
	Button,
	createMuiTheme,
	Grid,
	Slider,
	Switch,
	ThemeProvider,
	Typography,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Controls from './Controls';
import RandomNumberDialog from './RandomNumberDialog';

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
// [X] fix previous input
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
		};
	}

	componentDidMount = () => {
		this.initTree(this.state.newOrder); // default Order is 3
		this.setState({
			dirGraph: `digraph g {
				graph [center=true bgcolor="#19181f", pad=1.5]
				edge [color=white]
				node [shape = record,height=.1, color=white, fontcolor=white, width=1];
				}`,
		});
	};

	initTree(order) {
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
		const insertedKeys = this.state.insertedKeys;
		keys = insertedKeys.concat(keys);
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

	resetTree() {
		this.setState({
			dirGraph: `digraph g {}`,
			insertedKeys: [],
		});
		this.initTree(this.state.newOrder);
	}

	changeOrder = (e) => {
		this.setState({ [e.target.name]: e.target.value, enteredNumbers: [] }); // reset [] if tree is reset
		if (Number(e.target.value)) {
			this.initTree(parseInt(e.target.value));
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
						<Grid id="upperControls" item>
							<Controls
								openDialog={() => this.setState({ openDialog: true })}
								inputValues={this.state.inputField}
								setInputValues={(input) =>
									this.setState({ inputField: input })
								}
								add={(keys, insertAll) => this.add(keys, insertAll)}
								removeKeys={(keys) => this.removeKeys(keys)}
								resetTree={() => this.resetTree()}
								changeOrder={(order) => this.changeOrder(order)}
								currentOrder={this.state.newOrder}
								isAutomaticInsert={this.state.automaticInsertSwitch}
							/>
						</Grid>
						<Grid id="treeContainer" item>
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
						<RandomNumberDialog
							closeDialog={() => this.setState({ openDialog: false })}
							dialogOpen={this.state.openDialog}
							setRandomNumbers={(input) =>
								this.setState({ inputField: input })
							}
						/>
					</Grid>
				</ThemeProvider>
			</>
		);
	}
}

export default Home;

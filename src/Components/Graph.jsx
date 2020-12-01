import { Graphviz } from 'graphviz-react';
import React, { Component } from 'react';

class Graph extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount = () => {
		this.props.setLoading(false);
	};

	componentDidUpdate = (prevProps) => {
		if (prevProps.dot !== this.props.dot) {
		}
		this.props.setLoading(false);
	};

	shouldComponentUpdate(nextProps, nextState) {
		return (
			this.props.dot !== nextProps.dot ||
			this.props.isLoading !== nextProps.isLoading
		);
	}
	render() {
		const { dot, isLoading } = this.props;
		return (
			<>
				{isLoading ? (
					<p>Loading</p>
				) : (
					<>
						<Graphviz
							dot={dot}
							options={{
								// zoom: true,
								// fit: true,
								width: 1295,
								height: 495,
								tweenPaths: false,
								tweenShapes: false,
								convertEqualSidedPolygons: false,
								useWorker: true,
							}}
						/>
					</>
				)}
			</>
		);
	}
}

export default Graph;

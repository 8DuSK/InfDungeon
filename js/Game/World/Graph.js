import { TileNode } from './TileNode.js';
import * as THREE from 'three';

export class Graph {
	
	// Constructor for our Graph class
	constructor(tileSize, cols, rows) {

		// node array to hold our graph
		this.nodes = [];

		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;

		this.obstacles = [];
	}

	length() {
		return this.nodes.length;
	}
	
	// Initialize our game graph
	initGraph(grid) {
		// Create a new tile node
		// for each index in the grid
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				let type = TileNode.Type.Ground;
				let node = new TileNode(this.nodes.length, i, j, type);

				if (grid.length != 0) {

					if (grid[i][j] == 1) {
						node.type = TileNode.Type.Obstacle;	
						this.obstacles.push(node);
					} else if (grid[i][j] == 2) {
						node.type = TileNode.Type.Goal;	
					}
					
				}

				this.nodes.push(node);
			}
		}

		
		// Create west, east, north, south
		// edges for each node in our graph
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				// The index of our current node
				let index = j * this.cols + i;
				let current = this.nodes[index];

				if (current.type == TileNode.Type.Ground || current.type == TileNode.Type.Goal) {

					let openSpots = {
						n:[(j > 0), false], 
						s:[(j < this.rows - 1), false], 
						w:[(i > 0), false],
						e:[(i < this.cols - 1), false]
					};

					if (openSpots.w[0]) {
						// CREATE A WEST EDGE
						let west = this.nodes[index - 1];
						current.tryAddEdge(west, this.tileSize);
						if (current.hasEdge(west)) openSpots.w[1] = true;
					}

					if (openSpots.e[0]) {
						// CREATE AN EAST EDGE
						let east = this.nodes[index + 1];
						current.tryAddEdge(east, this.tileSize);
						if (current.hasEdge(east)) openSpots.e[1] = true;
					}

					if (openSpots.n[0]) {
						// CREATE A NORTH EDGE
						let north = this.nodes[index-this.cols];
						current.tryAddEdge(north, this.tileSize);
						if (current.hasEdge(north)) openSpots.n[1] = true;
					}

					if (openSpots.s[0]) {
						// CREATE A SOUTH EDGE
						let south = this.nodes[index+this.cols];
						current.tryAddEdge(south, this.tileSize);
						if (current.hasEdge(south)) openSpots.s[1] = true;
					}

					if (openSpots.n[1] && openSpots.e[1]) {
						// CREATE A NORTHEAST EDGE
						let northeast = this.nodes[index-this.cols+1];
						current.tryAddEdge(northeast, this.tileSize);
					}

					if (openSpots.n[1] && openSpots.w[1]) {
						// CREATE A NORTHWEST EDGE
						let northwest = this.nodes[index-this.cols-1];
						current.tryAddEdge(northwest, this.tileSize);
					}

					if (openSpots.s[1] && openSpots.e[1]) {
						// CREATE A SOUTHEAST EDGE
						let southeast = this.nodes[index+this.cols+1];
						current.tryAddEdge(southeast, this.tileSize);
					}

					if (openSpots.s[1] && openSpots.w[1]) {
						// CREATE A SOUTHWEST EDGE
						let southwest = this.nodes[index+this.cols-1];
						current.tryAddEdge(southwest, this.tileSize);
					}

				}

			}
		}

	}

	getNode(x, z) {
		return this.nodes[z * this.cols + x];
	}

	getRandomEmptyTile() {
		let index = Math.floor(Math.random()*(this.nodes.length));
		while (this.nodes[index].type == TileNode.Type.Obstacle) {
			index = Math.floor(Math.random()*(this.nodes.length));
		}
		return this.nodes[index];
	}


}
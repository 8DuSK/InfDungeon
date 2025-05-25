import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor(start, tileSize, cols, rows) {

		this.start = start;
		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;

		this.groundGeometries = new THREE.BoxGeometry(0,0,0);
		this.obstacleGeometries = new THREE.BoxGeometry(0,0,0);

		this.goalGeometries = new THREE.BoxGeometry(0,0,0);

	
	}

	createRendering(graph, level) {
		// Iterate over all of the 
		// indices in our graph
		for (let index in graph) {
			let i = index % this.cols;
			let j = Math.floor(index/this.cols);

			this.createTile(i, j, graph[index].type);

		}

		this.createBorder();

		let groundMaterial = null;
		let obstacleMaterial = null;
		let goalMaterial = null;

		if (level >= 10 && level < 20) {
			groundMaterial = new THREE.MeshStandardMaterial({ color: 0x101336 });
			obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x1e0d36 });
			goalMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0347 });
		} else if (level >= 20) {
			groundMaterial = new THREE.MeshStandardMaterial({ color: 0x42280f });
			obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x5e1f1f });
			goalMaterial = new THREE.MeshStandardMaterial({ color: 0xa36a5d });
		} else {
			groundMaterial = new THREE.MeshStandardMaterial({ color: 0x5e4847 });
			obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x222445 });
			goalMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3e82 });
		}

		let gameObject = new THREE.Group();
		let ground = new THREE.Mesh(this.groundGeometries, groundMaterial);
		let obstacles = new THREE.Mesh(this.obstacleGeometries, obstacleMaterial);
		let goal = new THREE.Mesh(this.goalGeometries, goalMaterial);

		gameObject.add(ground);
		gameObject.add(obstacles);
		gameObject.add(goal);

		return gameObject;
	}

	createTile(i, j, type) {

		let x = (i * this.tileSize) + this.start.x;
		let y = 0;
		let z = (j * this.tileSize) + this.start.z;

		// Creates multiple boxes to represent stairs for goal tile
		if (type == TileNode.Type.Goal) {

			for (i = 0; i < this.tileSize; i++) {

				let stepWidth = this.tileSize/this.tileSize;

				let geometry = new THREE.BoxGeometry(stepWidth,
					this.tileSize, 
					this.tileSize);

				geometry.translate((i*stepWidth) + x + 0.5 * (stepWidth),
  				y + 0.5 * this.tileSize - (i),
 				z + 0.5 * this.tileSize);

				this.goalGeometries = BufferGeometryUtils.mergeGeometries(
					[this.goalGeometries, geometry]
				);
			}


		} else {
			let height = this.tileSize;
			if (type === TileNode.Type.Obstacle) {
				height = height * 2;
			}
	
	
			let geometry = new THREE.BoxGeometry(this.tileSize,
												 height, 
												 this.tileSize);

			geometry.translate(x + 0.5 * this.tileSize,
							   y + 0.5 * height,
							   z + 0.5 * this.tileSize);
	
			if (type === TileNode.Type.Obstacle) {
				this.obstacleGeometries = BufferGeometryUtils.mergeGeometries(
											[this.obstacleGeometries,
											geometry]
										);
			} else {
				this.groundGeometries = BufferGeometryUtils.mergeGeometries(
											[this.groundGeometries,
											geometry]
										);
			}
		}

	}

	// Creates a big border on each side of the grid
	createBorder() {
		let sizeX = this.cols*this.tileSize;
		let sizeZ = this.rows*this.tileSize;
		
		let height = this.tileSize * 2;

		let x = this.start.x;
		let z = this.start.z;

		let geometry = new THREE.BoxGeometry(sizeX, height, sizeZ);
		geometry.translate(x + 0.5 * sizeX, 0.5 * height, z - 0.5 * sizeZ);
		this.obstacleGeometries = BufferGeometryUtils.mergeGeometries([this.obstacleGeometries, geometry]);

		geometry = new THREE.BoxGeometry(sizeX, height, sizeZ);
		geometry.translate(x + 0.5 * sizeX, 0.5 * height, z + sizeZ * 1.5);
		this.obstacleGeometries = BufferGeometryUtils.mergeGeometries([this.obstacleGeometries, geometry]);

		geometry = new THREE.BoxGeometry(sizeX, height, sizeZ*3);
		geometry.translate(x - 0.5 * sizeX, 0.5 * height, z + 0.5 * sizeZ);
		this.obstacleGeometries = BufferGeometryUtils.mergeGeometries([this.obstacleGeometries, geometry]);

		geometry = new THREE.BoxGeometry(sizeX, height, sizeZ*3);
		geometry.translate(x + sizeX * 1.5, 0.5 * height, z + 0.5 * sizeZ);
		this.obstacleGeometries = BufferGeometryUtils.mergeGeometries([this.obstacleGeometries, geometry]);

	}


}
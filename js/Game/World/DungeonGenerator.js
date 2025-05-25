import { Room } from './Room';
import { Delaunay } from '../../Util/Delaunay';
import { PriorityQueue } from '../../Util/PriorityQueue';


export class DungeonGenerator {
	
	constructor(gameMap) {
		this.gameMap = gameMap;
		this.cols = gameMap.cols;
		this.rows = gameMap.rows;
		
	}

	generate(numRooms, seed) {
		this.initGrid();
		this.makeRooms(numRooms, seed);
		this.makeHallways();
	}


	initGrid() {
		this.grid = [];
		for (let i = 0; i < this.cols; i++) {
			this.grid[i] = [];
			for (let j = 0; j < this.rows; j++) {
				this.grid[i][j] = 1;
			}
		}
	}

	makeRooms(numRooms) {
		this.rooms = [];

		let maxRoomW = 20;
		let maxRoomD = 20;
		let minRoomW = 5;
		let minRoomD = 5;

		// puts goal tile in random room
		let goalRoom = Math.floor(Math.random()*numRooms);

		let count = 0;
		while (count < numRooms) {

			let x = Math.floor(Math.random() * (this.cols - 2) + 1);
			let z = Math.floor(Math.random() * (this.rows - 2) + 1);

			let w = Math.floor(Math.random() * (maxRoomW - minRoomW) + minRoomW);
			let d = Math.floor(Math.random() * (maxRoomD - minRoomD) + minRoomD);

			let newRoom = new Room(x,z,w,d);
			let buffer = new Room(x-1, z-1, w+2, d+2);

			let add = true;
			for (let room of this.rooms) {
				if (room.intersects(buffer)) {
					add = false;
					break;
				}
			}

			if (newRoom.x < 0 || newRoom.maxX >= this.cols ||
				newRoom.z < 0 || newRoom.maxZ >= this.rows) {
				add = false;
			} 

			if (add) {

				if (goalRoom == count) {
					this.addRoom(newRoom, true);
				} else {
					this.addRoom(newRoom, false);
				}

				count++;
			}
		}
	}

	addRoom(room, goalRoom) {
		this.rooms.push(room);

		let goalX = null;
		let goalZ = null;

		// goal tile is placed in random spot in room
		if (goalRoom) {
			goalX = Math.floor(Math.random() * (room.maxX - room.x) + room.x);
			goalZ = Math.floor(Math.random() * (room.maxZ - room.z) + room.z);
		}

		for (let i = room.x; i < room.maxX; i++) {
			for (let j = room.z; j < room.maxZ; j++) {

				if ((goalX == i && goalZ == j) || this.grid[i][j] == 2) {
					this.grid[i][j] = 2;
				} else {
					this.grid[i][j] = 0;
				}

			}
		}
	}

	makeHallways() {

		let centers = [];
		for (let room of this.rooms) {
			centers.push(room.center);
		}

		let dungeonGraph = Delaunay.triangulation(centers);
		let mst = this.prims(dungeonGraph);

		for (let edge of mst) {
			this.addHallway(edge.start, edge.end);
		}
	}

	addHallway(start, end) {
		let x1 = start.x;
		let z1 = start.y;

		let x2 = end.x;
		let z2 = end.y;

		let dirX = (x2-x1)/Math.abs(x2-x1);
		let dirZ = (z2-z1)/Math.abs(z2-z1);

		let x = x1;
		let z = z1;

		while (x != x2) {
			if (this.grid[x][z] == 2) {
				this.grid[x][z] = 2;
			} else {
				this.grid[x][z] = 0;
			}
			x=x+dirX;
		}

		while (z != z2) {
			if (this.grid[x][z] == 2) {
				this.grid[x][z] = 2;
			} else {
				this.grid[x][z] = 0;
			}
			z=z+dirZ;
		}
	}


	prims(nodes) {

		let mst = [];
		let visited = [];
		let pq = new PriorityQueue();

		let start = nodes[0];
		visited.push(start);

		for (let edge of start.edges) {
			if (!visited.includes(edge.node)) {
				pq.enqueue(edge, edge.cost);
			}
		}

		let count = 0;
		while (!pq.isEmpty() && count < nodes.length) {
			let current = pq.dequeue();

			if (!visited.includes(current.node)) {
				mst.push(current);
				count++;
				visited.push(current.node);

				for (let edge of current.node.edges) {
					if (!visited.includes(edge.node)) {
						pq.enqueue(edge, edge.cost);
					}
				}

			}

		}
		return mst;

	}

	
}















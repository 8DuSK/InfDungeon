import { TileNode } from './TileNode';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { PriorityQueue } from '../../Util/PriorityQueue';
import { DungeonGenerator } from './DungeonGenerator';


// Pick ups
import { Treasure } from '../Behaviour/Pickups/Treasure.js';
import { Ammo } from '../Behaviour/Pickups/Ammo.js';
import { HealthKit } from '../Behaviour/Pickups/HealthKit.js';


// Npcs
import { Grunt } from '../Behaviour/NPC/Variants/Grunt.js';
import { Guard } from '../Behaviour/NPC/Variants/Guard.js';
import { Runner } from '../Behaviour/NPC/Variants/Runner.js'
import { AngryRunner } from '../Behaviour/NPC/Variants/AngryRunner.js';
import { Sentry } from '../Behaviour/NPC/Variants/Sentry.js';
import { FlameThrower } from '../Behaviour/NPC/Variants/FlameThrower.js';
import { Mimic } from '../Behaviour/NPC/Variants/Mimic.js';
import { WealthyMimic } from '../Behaviour/NPC/Variants/WealthyMimic.js';
import { Stalker } from '../Behaviour/NPC/Variants/Stalker.js';
import { Radiance } from '../Behaviour/NPC/Variants/Radiance.js';
import { Marauder } from '../Behaviour/NPC/Variants/Marauder.js';
import { Tank } from '../Behaviour/NPC/Variants/Tank.js';
import { Hunter } from '../Behaviour/NPC/Variants/Hunter.js';
import { Fly } from '../Behaviour/NPC/Variants/Fly.js';
import { Mine } from '../Behaviour/NPC/Variants/Mine.js';
import { Shadow } from '../Behaviour/NPC/Variants/Shadow.js';

export class GameMap {
	
	// Determines geomtry parameters
	static mapSize = [
		{level: 0, width: 180, depth: 150, rooms: 5},
		{level: 10, width: 300, depth: 250, rooms: 10},
		{level: 20, width: 500, depth: 430, rooms: 15}
	];

	// Spawn table for pickups and npcs 
	// each npc included in the list has a certain spawn chance, adding to 1.0
	static spawnTable = [
        {level:0, treasure: 6, ammo: 3, hp: 1, npcAmount: 3, npcs: [
			{type: Grunt, chance: 0.6}, {type: Guard, chance: 0.4}
        ]},

		{level:2, treasure: 6, ammo: 3, hp: 1, npcAmount: 4, npcs: [
			{type: Grunt, chance: 0.39}, {type: Guard, chance: 0.36},
			{type: Sentry, chance: 0.2}, {type: Runner, chance: 0.05}
        ]},

		{level:5, treasure: 7, ammo: 4, hp: 2, npcAmount: 5, npcs: [
			{type: Grunt, chance: 0.29}, {type: Guard, chance: 0.34},
			{type: Sentry, chance: 0.2}, {type: Runner, chance: 0.05},
			{type: Mine, chance: 0.10}, {type: Mimic, chance: 0.02}

        ]},

		{level:8, treasure: 7, ammo: 4, hp: 2, npcAmount: 7, npcs: [
			{type: Guard, chance: 0.25}, {type: FlameThrower, chance: 0.2},
			{type: Fly, chance: 0.23}, {type: Sentry, chance: 0.19},
			{type: Runner, chance: 0.01}, {type: Mine, chance: 0.10}, 
			{type: Mimic, chance: 0.02}
        ]},

        {level:10, treasure: 12, ammo: 5, hp: 4, npcAmount: 10, npcs: [
			{type: Guard, chance: 0.14}, {type: Stalker, chance: 0.15},
			{type: Mimic, chance: 0.1}, {type: FlameThrower, chance: 0.2},
			{type: Mine, chance: 0.16}, {type: Runner, chance: 0.05},
			{type: AngryRunner, chance: 0.02}, {type: Tank, chance: 0.18}
        ]},

		{level:13, treasure: 8, ammo: 6, hp: 1, npcAmount: 13, npcs: [
			{type: Runner, chance: 0.90}, {type: AngryRunner, chance: 0.10}
        ]},

		{level:14, treasure: 13, ammo: 6, hp: 5, npcAmount: 13, npcs: [
			{type: Marauder, chance: 0.14}, {type: Stalker, chance: 0.15},
			{type: Mimic, chance: 0.1}, {type: Sentry, chance: 0.2},
			{type: Hunter, chance: 0.16}, {type: Fly, chance: 0.02},
			{type: AngryRunner, chance: 0.05}, {type: Tank, chance: 0.18}
        ]},

		{level:17, treasure: 13, ammo: 6, hp: 5, npcAmount: 15, npcs: [
			{type: Marauder, chance: 0.2}, {type: Radiance, chance: 0.10},
			{type: Shadow, chance: 0.1}, {type: Sentry, chance: 0.16},
			{type: Hunter, chance: 0.16}, {type: Fly, chance: 0.1},
			{type: AngryRunner, chance: 0.03}, {type: Tank, chance: 0.15}
        ]},

		{level:19, treasure: 20, ammo: 0, hp: 1, npcAmount: 20, npcs: [
			{type: Mimic, chance: 0.65}, {type: WealthyMimic, chance: 0.3},
			{type: AngryRunner, chance: 0.05}
        ]},

		{level:20, treasure: 17, ammo: 10, hp: 5, npcAmount: 20, npcs: [
			{type: Grunt, chance: 0.05}, {type: Guard, chance: 0.08},
			{type: Runner, chance: 0.01}, {type: AngryRunner, chance: 0.05},
			{type: Sentry, chance: 0.05}, {type: FlameThrower, chance: 0.05},
			{type: Mimic, chance: 0.02}, {type: WealthyMimic, chance: 0.05},
			{type: Stalker, chance: 0.05}, {type: Radiance, chance: 0.10},
			{type: Marauder, chance: 0.1}, {type: Tank, chance: 0.07}, 
			{type: Hunter, chance: 0.10}, {type: Fly, chance: 0.04},
			{type: Mine, chance: 0.13}, {type: Shadow, chance: 0.05}
        ]},
    ]

	// Constructor for our GameMap class
	constructor(level) {

		this.level = level;
		for (let c of GameMap.mapSize) {
			if (c.level <= this.level) {
				this.mapConfig = c;
			}
		}

		this.start = new THREE.Vector3(-50,0,-35);

		this.width = this.mapConfig.width;
		this.depth = this.mapConfig.depth;
	

		// We also need to define a tile size 
		// for our tile based map
		this.tileSize = 5;

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width/this.tileSize;
		this.rows = this.depth/this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer(this.start, this.tileSize, this.cols, this.rows);

		this.goalFound = false;


	}

	// initialize the GameMap
	init(scene) {
		this.scene = scene; 

		let dungeon = new DungeonGenerator(this);
		dungeon.generate(this.mapConfig.rooms);

		this.graph.initGraph(dungeon.grid);
		// Set the game object to our rendering
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes, this.level);
	}

	// Finds all open nodes in the graph and returns them in a array in random order
	getRandomOpenNodes() {
		
		let nodes = [];

		for (let node of this.graph.nodes) {
			if (node.type == TileNode.Type.Ground) {
				nodes.push(node);
			}
		}

		let index = nodes.length;

		while (index != 0) {

			let ranIndex = Math.floor(Math.random() * index)
			index--;

			let temp = nodes[index];
			nodes[index] = nodes[ranIndex];
			nodes[ranIndex] = temp;
		}

		return nodes;
	}


	// Method to get location from a node
	localize(node) {
		let x = this.start.x+(node.x*this.tileSize)+this.tileSize*0.5;
		let y = this.tileSize;
		let z = this.start.z+(node.z*this.tileSize)+this.tileSize*0.5;

		return new THREE.Vector3(x,y,z);
	}

	// Method to get node from a location
	quantize(location) {
		let x = Math.floor((location.x - this.start.x)/this.tileSize);
		let z = Math.floor((location.z - this.start.z)/this.tileSize);
		
		return this.graph.getNode(x,z);
	}

	manhattanDistance(node, end) {
		
		let n = this.localize(node);
		let e = this.localize(end);
		let dx = Math.abs(n.x - e.x);
		let dz = Math.abs(n.z - e.z);

		return dx + dz;
	}

	astar(start, end) {
	
		let open = new PriorityQueue();
		let closed = [];

		let parent = [];
		let g = [];

		for (let node of this.graph.nodes) {

			if (node == start) {
				g[node.id] = 0;
			} else {
				g[node.id] = Number.MAX_VALUE;
			}
		}

		open.enqueue(start, 0);

		while (!open.isEmpty()) {

			let current = open.dequeue();
			closed.push(current);

			// if end is closed, then path is found
			if (closed.includes(end)) {
				return this.backtrack(start, end, parent);
			}

			for (let edge of current.edges) {

				let pathCost = g[current.id] + edge.cost;

				if (pathCost < g[edge.node.id]) {

					parent[edge.node.id] = current;
					g[edge.node.id] = pathCost;

					if (!closed.includes(edge.node)) {

						if (open.includes(edge.node)) {
							open.remove(edge.node);
						}

						let f = g[edge.node.id] + this.manhattanDistance(edge.node, end);
						open.enqueue(edge.node, f);

					}
				}
			}
		}

		// ran out of nodes, no path found :(
		return;
	}

	backtrack(start, end, parents) {

		let node = end;
		let path = [];
		path.push(node);

		while (node != start) {
			if (node == null) return;

			path.push(parents[node.id]);
			node = parents[node.id];
		}

		return path.reverse();
	}

	// Spawns entities into the gamemap using the spawntable
	spawnEnities(entityManager, player) {

        let openNodes = this.getRandomOpenNodes();

        if (openNodes.length == 0) return;
        player.location = this.localize(openNodes.pop());
        entityManager.add(player);

        let levelInfo = null;

        for (let c of GameMap.spawnTable) {
            if (c.level <= this.level) {
                levelInfo = c;
            }
        }

        // Npc spawns
        for (let i = levelInfo.npcAmount; i > 0; i--) {
            let spawnChance = Math.random();
            let accumulative = 0;

            for (let npc of levelInfo.npcs) {
                if (npc.chance <= 0) continue;
                
                accumulative += npc.chance

                if ((spawnChance <= accumulative)) {

                    // spawn this npc
					let newNpc = new npc.type(player, entityManager, this);
                    newNpc.levelUp(this.level);

                    if (openNodes.length == 0) return;
                    newNpc.location = this.localize(openNodes.pop());
					entityManager.add(newNpc);
                    break;
                }
            }
        }

        // Treasure spawns
        for (let i = levelInfo.treasure; i > 0; i--) {

            let treasure = new Treasure(Math.floor(Math.random()*3+1));

            if (openNodes.length == 0) return;
            treasure.location = this.localize(openNodes.pop());
            entityManager.add(treasure)
        }

        // Ammo spawns
        for (let i = levelInfo.ammo; i > 0; i--) {

            let ammo = new Ammo();

            if (openNodes.length == 0) return;
            ammo.location = this.localize(openNodes.pop());
            entityManager.add(ammo)
        }

        // Health spawns
        for (let i = levelInfo.hp; i > 0; i--) {

            let hk = new HealthKit();

            if (openNodes.length == 0) return;
            hk.location = this.localize(openNodes.pop());
            entityManager.add(hk)
        }

    }

}


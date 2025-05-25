import { Entity } from './Entity.js';
import * as THREE from 'three';
import { CountValue } from '../../Util/CountValue.js';

export class Character extends Entity {

	// Character Constructor
	constructor(mColor, size, shape) {

		super(mColor, size, shape);

		this.hp = new CountValue(5, 5, -1);
		this.inv = new CountValue(0.5, 0, -1);
		
		this.level = 0;		
	}

	// update character
	update(deltaTime, gameMap) {

		this.physics(gameMap);
		super.update(deltaTime,gameMap);

		this.setColour(this.mColor);

		if (this.inv.count > 0) {
			this.inv.increment(deltaTime);
			let hurtColor = this.mColor.clone().lerp(new THREE.Color(0xcf6651),0.5);
			this.setColour(hurtColor);
		}
	}

	// check edges
	// for adjacent and corner tiles
	checkEdges(gameMap) {

		let node = gameMap.quantize(this.location);
		if (node == null) return;
		
		let nodeLocation = gameMap.localize(node);

		let possibleEdges = [{x:0,z:-1},{x:-1,z:0},
					 		 {x:1,z:0},{x:0,z:1},
					 		{x:1,z:1},{x:-1,z:-1},{x:-1,z:-1},{x:-1,z:1}];

		for (let edge of possibleEdges) {
			

			if (!node.hasEdgeTo(node.x+(edge.x), node.z+(edge.z))) { 

				let nodeEdge = new THREE.Vector3(nodeLocation.x + (gameMap.tileSize/2*edge.x),0,
												 nodeLocation.z + (gameMap.tileSize/2*edge.z));

				let characterEdge = new THREE.Vector3(this.location.x + (this.size/2*edge.x),0,
													  this.location.z + (this.size/2*edge.z));

				let diff = new THREE.Vector3(characterEdge.x - nodeEdge.x, 0, characterEdge.z - nodeEdge.z);

				if (edge.x == 0 || edge.z == 0) {
					if (edge.x != 0 && Math.sign(edge.x) == Math.sign(diff.x)) this.location.x -= diff.x;
					if (edge.z != 0 && Math.sign(edge.z) == Math.sign(diff.z)) this.location.z -= diff.z;	

				} else if (edge.x != 0 && edge.z != 0) {

					if (edge.x != 0 && Math.sign(edge.x) == Math.sign(diff.x)) {

						if (edge.z != 0 && Math.sign(edge.z) == Math.sign(diff.z)) {

							if (Math.abs(diff.x) > Math.abs(diff.z)) {
								this.location.z -= diff.z;
							} else {
								this.location.x -= diff.x;
							}

						}

					}

				}						  

			}


		}

 	}

	// simple physics
	physics(gameMap) {

		this.checkEdges(gameMap);
		// friction
		if (this.velocity.length() < 0.1) {
			this.velocity = new THREE.Vector3(0, 0, 0);

		} else {
			let friction = this.velocity.clone();
			friction.y = 0;

			let fm = this.frictionMagnitude;
			if (this.acceleration.length() == 0) {
				fm *= 5;
			}

			friction.multiplyScalar(-1);

			friction.normalize();
			friction.multiplyScalar(fm);
			this.applyForce(friction);
		}
	
	}

	// Decreases damage of character
	// Removes character if hp is 0
	// Also starts invincibility buff
	// and applies knockback force to character
	takeDamage(damage, knockbackForce) {

		this.hp.increment(damage);
		if (this.hp.count <= 0) {
			this.toRemove = true;
		}

		this.inv.count = this.inv.max;
		this.velocity.addScaledVector(knockbackForce,1)
	}


}
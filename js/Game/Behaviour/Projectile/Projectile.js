import { VectorUtil } from '../../../Util/VectorUtil.js';
import { Entity } from '../Entity.js';

export class Projectile extends Entity {

	static ProjectileType = Object.freeze({
		Range: Symbol("range"),
		Melee: Symbol("melee")
	})

    // Projectile Constructor
    constructor(mColor, size, speed, direction, owner, shape = Entity.Shapes.Cone) {

        super(mColor, size, shape);

        this.direction = direction;
        this.topSpeed = speed;

		this.mass = 0.1;

        this.despawnTime = 5;
        this.passThrough = false;
        this.owner = owner;
        this.damage = 5;

		let ownerLoc = this.owner.location.clone();
		let ownerSize = this.owner.size;
		this.location = VectorUtil.addScaledVector(ownerLoc, this.direction, ownerSize/2);

    }

    // check edges
	checkEdges(gameMap) {

		let node = gameMap.quantize(this.location);
		if (node == null) return;
		let nodeLocation = gameMap.localize(node);

  		if (!node.hasEdgeTo(node.x-1, node.z)) {
  			let nodeEdge = nodeLocation.x - gameMap.tileSize/2;
  			let characterEdge = this.location.x - this.size/2;
  			if (characterEdge < nodeEdge) {
                this.toRemove = true;
  			}
  		}

  		if (!node.hasEdgeTo(node.x+1, node.z)) {
			let nodeEdge = nodeLocation.x + gameMap.tileSize/2;
  			let characterEdge = this.location.x + this.size/2;
  			if (characterEdge > nodeEdge) {
                this.toRemove = true;
  			}

  		}
		if (!node.hasEdgeTo(node.x, node.z-1)) {
  			let nodeEdge = nodeLocation.z - gameMap.tileSize/2;
  			let characterEdge = this.location.z - this.size/2;
  			if (characterEdge < nodeEdge) {
                this.toRemove = true;
  			}
  		}

		if (!node.hasEdgeTo(node.x, node.z+1)) { 
  			let nodeEdge = nodeLocation.z + gameMap.tileSize/2;
  			let characterEdge = this.location.z + this.size/2;
  			if (characterEdge > nodeEdge) {
                this.toRemove = true;
  			}
  		}
		

 	}

    update(deltaTime, gameMap) {

        this.despawnTime = this.despawnTime - (1 * deltaTime);
        if (this.despawnTime <= 0) {
            this.toRemove = true;
        }

        this.applyForce(VectorUtil.multiplyScalar(this.direction, this.topSpeed));

        super.update(deltaTime,gameMap);

        this.checkEdges(gameMap);
    }
}
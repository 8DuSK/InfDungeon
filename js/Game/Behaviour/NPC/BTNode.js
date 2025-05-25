import * as THREE from 'three';
import { VectorUtil } from '../../../Util/VectorUtil';
import { TileNode } from '../../World/TileNode';

export class BTNode {

	static Status = Object.freeze({
		Success: Symbol("success"),
		Failure: Symbol("failure"),
		Running: Symbol("running")
	});


	// Creating an abstract class in JS
	// Ensuring run is implemented
	constructor() {
	
	    if(this.constructor == BTNode) {
	       throw new Error("Class is of abstract type and cannot be instantiated");
	    };

	    if(this.run == undefined) {
	        throw new Error("run method must be implemented");
	    };

	}
  
}

/**

General Purpose Nodes

**/

export class Condition extends BTNode {

	constructor() {
		super();
		this.conditional = null;
	}

	run() {

		if (this.conditional == null) {
			throw new Error("Conditional not set");

		} else if (this.conditional) {
			return BTNode.Status.Success;
		
		} else {
			return BTNode.Status.Failure;

		}

	}

}


export class Sequence extends BTNode {

	constructor() {
		super();
		this.children = [];
	}

	run() {

		for (let child of this.children) {
			if (child.run() != BTNode.Status.Success) {
				return BTNode.Status.Failure;
			}
		}
		return BTNode.Status.Success;

	}


}


export class Selector extends BTNode {

	constructor() {
		super();
		this.children = [];
	}

	run() {

		for (let child of this.children) {
			if (child.run() == BTNode.Status.Success) {
				return BTNode.Status.Success;
			}
		}
		return BTNode.Status.Failure;

	}

}


// Npc specific nodes




// Condition BTNodes

// Checks if entity is in range of target
export class InRangeOfEntity extends Condition {

	constructor(self, target, range) {
		super();

		this.self = self;
		this.target = target;
		this.range = range;
	}

	run() {
		let d = this.self.location.distanceTo(this.target.location);
		super.conditional = this.range > d;
		return super.run();
	}

}

// Checks if a entities shotcooldown is done
export class ReadyToShoot extends Condition {

	constructor(shotCooldown) {
		super();

		this.shotCooldown = shotCooldown;
	}

	run() {

		super.conditional = this.shotCooldown.count <= 0;
		return super.run();
	}

}

// Checks if obstacle is in front of entity
export class FacingObstacle extends Condition {

	constructor(self, gameMap) {
		super();

		this.self = self;
		this.gameMap = gameMap;
	}

	run() {

		let location = this.self.location;
		let dir = this.self.direction;

		super.conditional = false;

		for (let i = 1; i < 4; i++) {
			let frontLocation = VectorUtil.addScaledVector(location, dir, this.gameMap.tileSize*i);
			let node = this.gameMap.quantize(frontLocation);

			if (node != null && node.type == TileNode.Type.Obstacle) {
				super.conditional = true;
				break;
			}
		}

		return super.run();
	}
}

// Checks if entity has line of sight to target
// Checks quarter tile nodes until target is reached, 
// obstacle is discovered, or too many tiles have been searched
export class LineOfSight extends Condition {

	constructor(self, target, gameMap) {
		super();

		this.self = self;
		this.target = target;
		this.gameMap = gameMap;
	}

	run() {

		let lastNode = null;
		let progress = this.self.location.clone();

		let diff = VectorUtil.sub(this.target.location, this.self.location).normalize();
		diff.setLength(this.gameMap.tileSize/4);
		let targetNode = this.gameMap.quantize(this.target.location);

		super.conditional = false;

		for (let tiles = 0; tiles < 100; tiles++) {

			let node = this.gameMap.quantize(progress);

			if (node == null || !(node.isGround() || node.isGoal()) || 
			(lastNode != null && lastNode != node && !node.hasEdge(lastNode))) break;

			if (node == targetNode || progress.distanceTo(this.target.location) < this.gameMap.tileSize)  {
				super.conditional = true;
				break;
			}

			progress = VectorUtil.add(progress, diff);
			lastNode = node;
		}

		return super.run();
	}

}

// Checks if path is null or outdated
export class InvalidPath extends Condition {

	constructor(self, target, gameMap) {
		super();

		this.self = self;
		this.target = target;
		this.gameMap = gameMap;
	}

	run() {

		super.conditional = true;
		if (this.self.path != null && this.self.path.length > 0) {

			let lastNode = this.self.path[this.self.path.length - 1];
			let tileSize = this.gameMap.tileSize;
	
			super.conditional = (this.gameMap.localize(lastNode).distanceTo(this.target.location) > tileSize);
		}
		return super.run();
	}
}

// Compares a CountValue to a certain value
export class CountComparison extends Condition {

	constructor(counter, value, comparison) {
		super();

		this.counter = counter;
		this.value = value;
		this.comparison = comparison;
	}

	run() {
		switch (this.comparison) {
			case("<"):
				super.conditional = this.counter.count < this.value;
				break;

			case(">"):
				super.conditional = this.counter.count > this.value;
				break;

			case("<="):
				super.conditional = this.counter.count <= this.value;
				break;

			case(">="):
				super.conditional = this.counter.count >= this.value;
				break;

			default:
				super.conditional = this.counter.count == this.value;
				break;
		}

		return super.run();
	}
}

// Checks if entity has lost hp
export class Damaged extends Condition {

	constructor(self) {
		super();

		this.self = self;
	}

	run() {

		super.conditional = this.self.hp.max > this.self.hp.count;

		return super.run();
	}
}

// Checks if a property is a certain value (mainly for bools)
export class CheckValue extends Condition {

	constructor(self, propertyName, value) {
		super();

		this.self = self;
		this.propertyName = propertyName;
		this.value = value;
	}

	run() {
		super.conditional = this.self[this.propertyName] == this.value;

		return super.run();
	}
}



// Action BTNodes

// Seeks away from the target entity
export class EvadeTarget extends BTNode {
	constructor(self, target) {
		super();

		this.self = self;
		this.target = target;
	}

	run() {

		let evadeSteer = this.self.seek(this.target.location);
		evadeSteer = VectorUtil.multiplyScalar(evadeSteer, -1);

		this.self.applyForce(evadeSteer);
		return BTNode.Status.Success;
	}
}

// Seeks towards a target entity
export class SeekTarget extends BTNode {

	constructor(self, target) {
		super();

		this.self = self;
		this.target = target;
	}

	run() {

		this.self.applyForce(this.self.seek(this.target.location));
		return BTNode.Status.Success;
	}
}

// Slows down an entity as it reaches its target
export class ArriveTarget extends BTNode {

	constructor(self, target, radius) {
		super();

		this.self = self;
		this.target = target;
		this.radius = radius;
	}

	run() {

		this.self.applyForce(this.self.arrive(this.target.location, this.radius));
		return BTNode.Status.Success;
	}
}

// Makes entity travel in random directions
export class Wander extends BTNode {

	constructor(self) {
		super();

		this.self = self;
	}

	run() {

		this.self.applyForce(this.self.wander());
		return BTNode.Status.Success;
	}
}

// Fires one projectile in front of entity
export class FireProjectile extends BTNode {

	constructor(entityManager, projectileFactory, shootCooldown) {
		super();

		this.entityManager = entityManager;
		this.projectileFactory = projectileFactory;
		this.shootCooldown = shootCooldown;
	}

	run() {

		let projectile = this.projectileFactory.createProjectile();
		this.entityManager.add(projectile);

		this.shootCooldown.count = this.shootCooldown.max;

		return BTNode.Status.Success;
	}
}

// Shoots multiple projectiles around the entity
export class ProjectileExplosion extends BTNode {

	constructor(entityManager, projectileFactory, shootCooldown, angleInterval) {
		super();

		this.entityManager = entityManager;
		this.projectileFactory = projectileFactory;
		this.shootCooldown = shootCooldown;
		this.angleInterval = angleInterval;
	}

	run() {

		for (let angle = 0; angle < 360; angle += this.angleInterval) {

			let rad = (angle*Math.PI)/180
			let direction = new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad));

			let projectile = this.projectileFactory.createProjectile(direction);
			this.entityManager.add(projectile);

		}

		this.shootCooldown.count = this.shootCooldown.max;

		return BTNode.Status.Success;
	}
}

// Aims directly at target entity
export class AimAtTarget extends BTNode {

	constructor(self, target) {
		super();

		this.self = self;
		this.target = target;
	}

	run() {

		let desiredDirection = VectorUtil.sub(this.target.location, this.self.location).normalize();

		this.self.direction = desiredDirection;

		return BTNode.Status.Success;
	}
}

// Creates a path between one entity and another
export class CreatePath extends BTNode {

	constructor(self, goal, gameMap) {
		super();

		this.self = self;
		this.goal = goal;
		this.gameMap = gameMap;
	}

	run() {

		let startNode = this.gameMap.quantize(this.self.location);
		let endNode = this.gameMap.quantize(this.goal.location);

		let path = this.gameMap.astar(startNode, endNode);
		this.self.segment = 0;
		if (path == null) {
			this.self.path = [];
			return BTNode.Status.Failure;
		} else {
			this.self.path = path;
		}

		return BTNode.Status.Success;
	}

}

// Uses seek to follow the entities path
export class FollowPath extends BTNode {

	constructor(self, gameMap) {
		super();

		this.self = self;
		this.gameMap = gameMap;
	}

	run() {

		let seg = this.self.segment;
		let path = this.self.path;

		if (path[seg] == null) return BTNode.Status.Failure;

		if (this.gameMap.quantize(this.self.location) == path[seg])  {

			if (seg + 1 != path.length) this.self.segment++;

		}
		this.self.applyForce(this.self.seek(this.gameMap.localize(path[seg])));

		return BTNode.Status.Success;
	}
}

// Sets a property of entity object
export class SetProperty extends BTNode {

	constructor(self, propertyName, value) {
		super();

		this.self = self;
		this.propertyName = propertyName;
		this.value = value;
	}

	run() {

		this.self[this.propertyName] = this.value;
		return BTNode.Status.Success;
	}
}

// Restores entities hp
export class Heal extends BTNode {

	constructor(target, healAmount) {
		super();

		this.target = target;
		this.healAmount = healAmount;
	}

	run() {

		this.target.hp.count += this.healAmount;
		if (this.target.hp.count > this.target.hp.max) this.target.hp.count = this.target.hp.max;

		return BTNode.Status.Success;
	}
}

// Seeks to direction in front of entity
export class SeekDirection extends BTNode {

	constructor(self, direction) {
		super();

		this.self = self;
		this.direction = direction;
	}

	run() {

		let location = this.self.location;
		let newDir = this.self.direction.clone();

		if (this.direction != null) newDir.cross(this.direction);

		this.self.applyForce(this.self.seek(VectorUtil.add(location, newDir)));

		return BTNode.Status.Success;
	}

}

// Increments a CountValue
export class IncrementCount extends BTNode {

	constructor(self, counter, value) {
		super();

		this.self = self;
		this.counter = counter;
		this.value = value;
	}

	run() {
		this.counter.increment(this.value * this.self.deltaTime);

		return BTNode.Status.Success;
	}
}

// Sets a CountValue to a value
export class SetCount extends BTNode {

	constructor(counter, value) {
		super();

		this.counter = counter;
		this.value = value;
	}

	run() {
		this.counter.count = this.value;

		return BTNode.Status.Success;
	}
}

// Predicts where target is going and aims there
export class AimAtTargetVelocity extends BTNode {

	constructor(self, target) {
		super();

		this.self = self;
		this.target = target;
	}

	run() {

		let predictedLocation = VectorUtil.add(this.target.location, this.target.velocity);

		let desiredDirection = VectorUtil.sub(predictedLocation, this.self.location).normalize();

		this.self.direction = desiredDirection;

		return BTNode.Status.Success;	
	}
}

// Changes color of entity
export class ChangeColor extends BTNode {

	constructor(self, mColor) {
		super();

		this.self = self;
		this.mColor = mColor;
	}

	run() {
		
		this.self.mColor = this.mColor;
		this.self.setColour(this.mColor);

		return BTNode.Status.Success;	
	}
}

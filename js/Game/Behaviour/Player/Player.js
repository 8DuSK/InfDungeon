import * as THREE from 'three';
import { Character } from '../Character.js';
import { Projectile } from '../Projectile/Projectile.js';
import { State } from './State';
import { Entity } from '../Entity.js';
import { ProjectileFactory } from '../Projectile/ProjectileFactory.js';
import { CountValue } from '../../../Util/CountValue.js';
import { TileNode } from '../../World/TileNode.js';

export class Player extends Character {

	constructor(mColor, level = 0, xp = 0) {
		let size = 3;

		super(mColor, size, Entity.Shapes.Cone);

		this.frictionMagnitude = 10;
		this.inv.max = 1;

		// For creating projectiles
		let rangeParams = {
			type: Projectile.ProjectileType.Range,
			color: new THREE.Color(0xff0000),
			size: 0.5,
			speed: 22,
			owner: this
		}

		let meleeParams = {
			type: Projectile.ProjectileType.Melee,
			color: new THREE.Color(0xff0000),
			size: 2.5,
			owner: this
		}

		this.rangeFactory = new ProjectileFactory(rangeParams);
		this.meleeFactory = new ProjectileFactory(meleeParams);

		this.xp = new CountValue(10000, xp, 1, true);
		this.level = 0;
		this.levelUp(level);
		this.hp.count = this.hp.max;

		this.ammo = 10;

		this.deathTime = new CountValue(5, 0, 1);

		// State
		this.states = [];
		this.states.push(new AliveState());
		this.states.push(new ReadyAttackState());
		this.states.push(new IdleState());

		for (let state of this.states) {
			state.enterState(this);
		}
	}

	switchState(oldState, newState) {

		for (let i = 0; i < this.states.length; i++) {

			if (this.states[i] === oldState) {
				this.states[i] = newState;
				this.states[i].enterState(this);
				break;
			}
		}
	}

	update(deltaTime, gameMap, controller, entityManager){
		super.update(deltaTime, gameMap);

		this.entityManager = entityManager;
		for (let state of this.states) {
			state.updateState(this, controller, gameMap);
		}
	}

	// Sets player stats depending on level
	levelUp(level) {
		this.level = level;

		if (this.xp.count >= this.xp.max) this.xp.count = this.xp.count - this.xp.max;
		this.xp.max = this.nextMaxXP();

		let oldMaxHp = this.hp.max;
		this.hp.max = 10 + Math.floor(this.level*1.1);

		// Player is healed extra hp on level up
		this.hp.count += this.hp.max - oldMaxHp;
		if (this.hp.count > this.hp.max) this.hp.count = this.hp.max;

		this.rangeFactory.updateParam("damage", 1 + Math.floor(this.level*1.2));
		this.meleeFactory.updateParam("damage", 4 + Math.floor(this.level*1.5));

		// If extra xp gained goes over, then level up again
		if (this.xp.count >= this.xp.max) this.levelUp(this.level + 1);
	}

	// Determines next max xp
	nextMaxXP() {
		if (this.level < 30) {
			return(Math.floor(this.level*1.5) + 10);
		} else {
			return(Math.floor(this.level/2) + 20);
		}
	}

	// Returns a string of the player stats for the game ui
	printStats() {

		let ammoText = this.ammo;
		if (this.ammo > 1000) ammoText = "999+";

		return(
			"HP: " + Math.floor(this.hp.count) + "/" + Math.floor(this.hp.max) + " " +
			"XP: " + Math.floor(this.xp.count) + "/" + Math.floor(this.xp.max) + " " +
			"Lvl: " + this.level + " " + "Ammo: " + ammoText
		);
	}


}

// For when the player isn't moving
export class IdleState extends State {

	enterState(player) {
		player.velocity.x = 0;
		player.velocity.z = 0;
	}

	updateState(player, controller, gameMap) {

		if (controller.moving()) {
			player.switchState(this, new MovingState());
		}
	}

}

// For when the player is moving
export class MovingState extends State {

	enterState() {
	}

	updateState(player, controller, gameMap) {

		if (!controller.moving()) {
			player.switchState(this, new IdleState());
		} else {
			let force = controller.direction();
			force.setLength(50);
			player.applyForce(force);
		
		}	
	}
  
}

// Shoots a ranged projectile and switches back to ReadyAttack
export class ShootState extends State {

	enterState(player) {
		player.ammo--;
		let p = player.rangeFactory.createProjectile();
		player.entityManager.add(p);

		player.switchState(this, new ReadyAttackState());
	}

	updateState() {

	}
}

// Shoots a melee projectile and switches back to ReadyAttack
export class SwingState extends State {

	enterState(player) {
		let p = player.meleeFactory.createProjectile();
		player.entityManager.add(p);

		player.switchState(this, new ReadyAttackState());
	}

	updateState() {

	}
}

// Listens for attack commands from controller
export class ReadyAttackState extends State {

	enterState(player) {

	}

	updateState(player, controller) {

		if (controller.shoot && controller.canShoot && player.ammo > 0) {
			controller.canShoot = false;
			player.switchState(this, new ShootState());

		} else if (controller.swing && controller.canSwing) {
			controller.canSwing = false;
			player.switchState(this, new SwingState());

		} 

	}
}

// Aims player at mouse cursor, keeps track of leveling, detects if player has found goal
// Everything the player can do while alive
export class AliveState extends State {

	enterState(player) {

	}

	updateState(player, controller, gameMap) {

		if (player.hp.count <= 0) {
			player.switchState(this, new DeadState());
			return;
		}

		if (controller.mousePosition.length() > 0) {
			player.direction = controller.mousePosition.clone().normalize();
		}

		if (player.xp.count >= player.xp.max) {
			player.levelUp(player.level + 1);
		}

		let node = gameMap.quantize(player.location);
		if (node != null && node.type == TileNode.Type.Goal && controller.interact) {
			gameMap.goalFound = true;
		}
	}
}

// Mainly used to prevent player from moving around while dead
export class DeadState extends State {

	enterState(player) {
		
		let i = player.states.length - 1;
		while (player.states[player.states.length - 1] != this && i >= 0) {
			player.states.pop();
			i--;
		}

		player.inv.count = 50;
	}

	updateState(player, controller, entityManager, gameMap) {
		player.setColour(new THREE.Color(0xff0000));
		player.deathTime.increment(player.deltaTime);
	}
}

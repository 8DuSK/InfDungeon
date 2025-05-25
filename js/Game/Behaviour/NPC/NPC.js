import { Character } from '../Character.js';
import { CountValue } from '../../../Util/CountValue.js';

export class NPC extends Character {

	// Character Constructor
	constructor(player, mColor, size = 3, shape) {

		super(mColor, size, shape);

		this.damage = 2;
		this.xpReward = 1;
		this.statScales = {
			damage: [2, 1.2],
			hp: [3, 1.5],
			xpReward: [1, 0.9]
		}

		this.shotCooldown = new CountValue(1, 0, -1);

		this.player = player;

		this.segment = 0;
		this.path = [];
	}

	update(deltaTime, gameMap) {
		super.update(deltaTime, gameMap);

		if (this.shotCooldown.count > 0) {
			this.shotCooldown.increment(deltaTime);
		}
	}

	// Gives player xp if they die
	takeDamage(damage, kb) {
		super.takeDamage(damage, kb);

		if (this.toRemove) {
			this.player.xp.increment(this.xpReward);
		}
	}

	// Scales npcs stats with their level
	levelUp(level) {
		this.level = level;

		this.xpReward = this.statScales.xpReward[0] + (level*this.statScales.xpReward[1]);
		this.hp.max = this.statScales.hp[0] + (level*this.statScales.hp[1]);
		this.hp.count = this.hp.max;
		this.damage = this.statScales.damage[0] + (level*this.statScales.damage[1]);
	}


}
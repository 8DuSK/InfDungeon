import { Entity } from './Entity.js';
import { Player } from './Player/Player.js';
import { NPC } from './NPC/NPC.js';
import { Projectile } from './Projectile/Projectile.js';
import { Character } from './Character.js';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Treasure } from './Pickups/Treasure.js';
import { Ammo } from './Pickups/Ammo.js';
import { HealthKit } from './Pickups/HealthKit.js';

export class EntityManager {

    constructor(scene) {
        this.entities = [];
        this.scene = scene;
    }

    // Adds a entity to the array
    add(entity) {
        if (entity instanceof Entity) {
            this.entities.push(entity);  
            this.scene.add(entity.gameObject);
        }
    }

    // Removes every entity in the array with the "toRemove" flag set to true
    removeEntities() {

        for(let i = 0; i < this.entities.length; i++) {

            if (this.entities[i].toRemove && !(this.entities[i] instanceof Player)) {
  
                let char = (this.entities.splice(i, 1))[0];
                let object = char.gameObject;
                object.removeFromParent();

                i--;
            }
        }

    }

    // Looks at every other entity for a collision with a character
    searchforCollision(char) {
        if (!(char instanceof Character)) return;

        for (let hit of this.entities) {

            // Checks certain condtions for collision
                // Character cannot collide with themselves
                // NPCs do not collide with each other
                // Projectiles owned by NPCs cannot hit other NPCs
                // and Players will not be damaged by their own projectiles
            if (( hit.toRemove || hit == char) ||
                (hit instanceof Projectile && 
                ( hit.owner == char || (char instanceof NPC && hit.owner instanceof NPC) ) )) continue;

            if (!char.checkCollision(hit)) continue;

            // First three are for pickups
            // Treasure, ammo, health
            if (char instanceof Player && hit instanceof Treasure)   { 

                char.xp.increment(hit.xpReward);
                hit.toRemove = true;

            } else if (char instanceof Player && hit instanceof Ammo) {

                char.ammo += hit.amount;
                hit.toRemove = true;

            } else if (char instanceof Player && hit instanceof HealthKit) {

                char.hp.count += char.hp.max * hit.healAmount;
                if (char.hp.count > char.hp.max) char.hp.count = char.hp.max;

                hit.toRemove = true;


            // If player is hit by NPC, or NPC is hit by player projectile
            // then deal damage if invincibility is off
            } else if ( ((char instanceof Player && hit instanceof NPC) || 
                         (hit instanceof Projectile)) &&
                         (char.inv.count <= 0)) {

                let kb = VectorUtil.addScaledVector(char.location, hit.location, -1);
                kb.normalize();
                kb = VectorUtil.multiplyScalar(kb, 5);
                kb.y = 0;

                char.takeDamage(hit.damage, kb);
                if (hit instanceof Projectile && !hit.passThrough) hit.toRemove = true;

                break;
            }
            
        }
    }

    // Updates each entity in the array, also checks for collision for each entity
    update(deltaTime, gameMap, controller) {

        for (let char of this.entities) {

            if (char instanceof Player) {
                char.update(deltaTime, gameMap, controller, this);
            } else {
                char.update(deltaTime, gameMap);
            }

            this.searchforCollision(char);
        }

        this.removeEntities()
    }


}
import { Projectile } from "./Projectile";
import { Entity } from "../Entity";
import { VectorUtil } from "../../../Util/VectorUtil";

export class MeleeProjectile extends Projectile {

    constructor(mColor, size, direction, owner) {
        super(mColor, size, 0, direction, owner, Entity.Shapes.Ring);

        this.despawnTime = 0.2;
        this.passThrough = true;
    }

    // Melee projectile stays near owner
    update(deltaTime, gameMap) {
        super.update(deltaTime, gameMap);
        this.direction = this.owner.direction.clone();

        let ownerSize = this.owner.size;
        let ownerLoc = this.owner.location.clone();

        let newLoc = VectorUtil.addScaledVector(ownerLoc, this.direction, ownerSize/1.2);
        this.location = newLoc
    }
}
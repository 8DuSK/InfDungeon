import { Projectile } from "./Projectile";
import { MeleeProjectile } from "./MeleeProjectile";

export class ProjectileFactory {

    constructor(projectileParams) {
        this.pps = projectileParams;
    }

    // Creates a projectile based on the parameters
    createProjectile(direction) {
        let projectile = null;

        let damage = null;

        if (this.pps.type == Projectile.ProjectileType.Range) {

            let color = this.pps.color;
            let size = this.pps.size;
            let speed = this.pps.speed;
            let owner = this.pps.owner;
            let shape = this.pps.shape;
            
            damage = this.pps.damage;

            let dir = null;

            if (direction == null) {
                dir = this.pps.owner.direction.clone();
            } else {
                dir = direction;
            }

            projectile = new Projectile(color, size, speed, dir, owner, shape);

            if (damage != null) {

                if (damage == owner) {
                    damage = owner.damage;
                }
                
                projectile.damage = damage;
            }

        } else if (this.pps.type == Projectile.ProjectileType.Melee) {

            let color = this.pps.color;
            let size = this.pps.size;
            let owner = this.pps.owner;
            let dir = this.pps.owner.direction.clone();

            damage = this.pps.damage;

            projectile = new MeleeProjectile(color, size, dir, owner);
        }

        if (damage != null) {
            projectile.damage = damage;
        }

        return projectile;
    }

    // Projectile properties are able to be updated
    updateParam(param, value) {
        this.pps[param] = value;
    }
}
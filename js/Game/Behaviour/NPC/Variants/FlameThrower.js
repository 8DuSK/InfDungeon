import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';
import { CountValue } from '../../../../Util/CountValue';

export class FlameThrower extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xd62511), 3, Entity.Shapes.Sphere);

        this.topSpeed = 0;
        this.statScales.damage = [2, 0.9];

        this.shotCooldown = new CountValue(0.05, 0, -1);

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xed6526),
            owner: this,
            speed: 15,
            size: 1.3,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence
        let fireSeq = new BT.Sequence();
        fireSeq.children.push(new BT.InRangeOfEntity(this, player, 25));
        fireSeq.children.push(new BT.AimAtTarget(this, player));
        fireSeq.children.push(new BT.ReadyToShoot(this.shotCooldown));
        fireSeq.children.push(new BT.FireProjectile(entityManager, this.projectileFactory, this.shotCooldown));
        selector.children.push(fireSeq);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
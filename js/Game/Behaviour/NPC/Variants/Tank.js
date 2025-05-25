import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';

export class Tank extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x074d19), 3.8, Entity.Shapes.Sphere);

        this.statScales.hp = [8, 2];
        this.statScales.damage = [6, 1.4];

        this.topSpeed = 5;

        this.shotCooldown.max = 3;

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 30,
            size: 1.5,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence
        let farCheck = new BT.Sequence();
        farCheck.children.push(new BT.InRangeOfEntity(this, player, 50));
        farCheck.children.push(new BT.LineOfSight(this, player, gameMap));
        farCheck.children.push(new BT.AimAtTargetVelocity(this, player));

        let combat = new BT.Selector();

        let shoot = new BT.Sequence();
        shoot.children.push(new BT.ReadyToShoot(this.shotCooldown));
        shoot.children.push(new BT.FireProjectile(entityManager, this.projectileFactory, this.shotCooldown));
        combat.children.push(shoot);

        let seek = new BT.Sequence()
        seek.children.push(new BT.SeekTarget(this, player));
        combat.children.push(seek);

        farCheck.children.push(combat);

        selector.children.push(farCheck);

        // Arrive Sequence
        let arrive = new BT.Sequence();
        arrive.children.push(new BT.InRangeOfEntity(this, player, 6));
        arrive.children.push(new BT.LineOfSight(this, player, gameMap));
        arrive.children.push(new BT.ArriveTarget(this, player, 10));
        selector.children.push(arrive);

        // Wander Action
        let wander = new BT.Sequence();
        wander.children.push(new BT.Wander(this));
        selector.children.push(wander);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';

export class Hunter extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xa15f0a), 2.2, Entity.Shapes.Sphere);

        this.statScales.hp = [2, 0.5];
        this.statScales.xpReward = [1, 0.3];

        this.topSpeed = 10;

        this.shotCooldown.max = 4;

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 35,
            size: 0.7,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();

        // Stare sequence
        let sight = new BT.Sequence();
        sight.children.push(new BT.LineOfSight(this, player, gameMap));
        sight.children.push(new BT.SetProperty(this, "topSpeed", 2));
        sight.children.push(new BT.AimAtTargetVelocity(this, player));

        let combat = new BT.Selector();

        let shoot = new BT.Sequence();
        shoot.children.push(new BT.ReadyToShoot(this.shotCooldown));
        shoot.children.push(new BT.FireProjectile(entityManager, this.projectileFactory, this.shotCooldown));

        let evade = new BT.Sequence();
        evade.children.push(new BT.InRangeOfEntity(this, player, 20));
        evade.children.push(new BT.SetProperty(this, "topSpeed", 20));
        evade.children.push(new BT.EvadeTarget(this, player));

        let wait = new BT.Sequence();
        wait.children.push(new BT.SetProperty(this, "topSpeed", 2));

        combat.children.push(shoot);
        combat.children.push(evade);
        combat.children.push(wait);

        sight.children.push(combat);
        selector.children.push(sight);

        // Search sequence
        let search = new BT.Sequence();
        search.children.push(new BT.InvalidPath(this, player, gameMap));
        search.children.push(new BT.CreatePath(this, player, gameMap));

        selector.children.push(search);

        let follow = new BT.Sequence();
        follow.children.push(new BT.FollowPath(this, gameMap));
        follow.children.push(new BT.SetProperty(this, "topSpeed", 10));

        selector.children.push(follow);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
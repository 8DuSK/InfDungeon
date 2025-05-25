import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';

export class Radiance extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xf3f5bf), 3, Entity.Shapes.Sphere);

        this.statScales.hp = [4, 2];
        this.statScales.xpReward[0] = 3;

        this.topSpeed = 15;

        this.shotCooldown.max = 1.5;

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 20,
            size: 0.9,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();


        // Checks first if player is within range
        let inRangeSequence = new BT.Sequence();

        inRangeSequence.children.push(new BT.InRangeOfEntity(this, player, 50));

        let engageSelector = new BT.Selector();

        // Shoot sequence
        let shoot = new BT.Sequence();
        shoot.children.push(new BT.LineOfSight(this, player, gameMap));
        shoot.children.push(new BT.ReadyToShoot(this.shotCooldown));
        shoot.children.push(new BT.ProjectileExplosion(entityManager, this.projectileFactory, this.shotCooldown, 10));

        engageSelector.children.push(shoot);

        // Pursue sequence
        let pursue = new BT.Sequence();
        pursue.children.push(new BT.LineOfSight(this, player, gameMap));
        pursue.children.push(new BT.SetProperty(this, "topSpeed", 8));
        pursue.children.push(new BT.SeekTarget(this, player));

        engageSelector.children.push(pursue);

        // Search sequence
        let search = new BT.Sequence();
        search.children.push(new BT.InvalidPath(this, player, gameMap));
        search.children.push(new BT.CreatePath(this, player, gameMap));

        engageSelector.children.push(search);

        // Follow sequence
        let follow = new BT.Sequence();
        follow.children.push(new BT.FollowPath(this, gameMap));
        follow.children.push(new BT.SetProperty(this, "topSpeed", 15));

        engageSelector.children.push(follow);


        inRangeSequence.children.push(engageSelector);
        selector.children.push(inRangeSequence);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
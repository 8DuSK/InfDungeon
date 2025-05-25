import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { CountValue } from '../../../../Util/CountValue';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';

export class AngryRunner extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xff1100), 0.8, Entity.Shapes.Torus);

        this.statScales.damage[0] = 10;
        this.statScales.xpReward = [40, 2.1];
        this.topSpeed = 5;

        this.shotCooldown.max = 0.5;

        this.despawn = new CountValue(3.3, 3.3, -1);
        this.seen = false;

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 25,
            size: 0.5,
            damage: this
        };
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();


        // Detection Sequence
        let seenNode = new BT.CheckValue(this, "seen", false)

        let detect = new BT.Sequence();
        detect.children.push(seenNode);
        detect.children.push(new BT.InRangeOfEntity(this, player, 40));
        detect.children.push(new BT.LineOfSight(this, player, gameMap));
        detect.children.push(new BT.SetProperty(this, "seen", true));
        selector.children.push(detect);

        // Wander Sequence
        let wander = new BT.Sequence();
        wander.children.push(seenNode);
        wander.children.push(new BT.Wander(this));
        selector.children.push(wander);

        // Seek Sequence
        let evade = new BT.Sequence();
        evade.children.push(new BT.CountComparison(this.despawn, 0, ">"));
        evade.children.push(new BT.SetProperty(this, "topSpeed", 20));
        evade.children.push(new BT.EvadeTarget(this, player));
        evade.children.push(new BT.IncrementCount(this, this.despawn, 1));

        evade.children.push(new BT.ReadyToShoot(this.shotCooldown));
        evade.children.push(new BT.ProjectileExplosion(entityManager, this.projectileFactory, this.shotCooldown, 20));
        selector.children.push(evade);

        // Despawn sequence
        let desSeq = new BT.Sequence();
        desSeq.children.push(new BT.CountComparison(this.despawn, 0, "<="));
        desSeq.children.push(new BT.SetProperty(this, "toRemove", true));
        selector.children.push(desSeq);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
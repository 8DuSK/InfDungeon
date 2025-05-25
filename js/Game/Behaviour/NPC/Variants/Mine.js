import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';
import { CountValue } from '../../../../Util/CountValue';

export class Mine extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xd62b00), 2.5, Entity.Shapes.Sphere);

        this.statScales.hp = [10, 2];
        this.statScales.xpReward[0] = 1;

        this.topSpeed = 0;

        this.colors = [new THREE.Color(0xd62b00), new THREE.Color(0xd67900)];
        this.currentColor = 0;

        this.timer = new CountValue(1, 0, 1);

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 23,
            size: 0.9,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree

        let selector = new BT.Selector();

        // Hit sequence
        let hitSeq = new BT.Sequence();
        hitSeq.children.push(new BT.Damaged(this));
        hitSeq.children.push(new BT.ProjectileExplosion(entityManager, this.projectileFactory, this.shotCooldown, 15));
        hitSeq.children.push(new BT.SetProperty(this, "toRemove", true));

        selector.children.push(hitSeq);

        // Count sequence
        let countSeq = new BT.Sequence();
        countSeq.children.push(new BT.IncrementCount(this, this.timer, 1));
        countSeq.children.push(new BT.CountComparison(this.timer, 1, ">="));
        countSeq.children.push(new BT.SetCount(this.timer, 0));


        // For changing between different colors
        let colorSelector = new BT.Selector();

        let color0Seq = new BT.Sequence();
        color0Seq.children.push(new BT.CheckValue(this, "colors", 0));
        color0Seq.children.push(new BT.ChangeColor(this, this.colors[0]));
        color0Seq.children.push(new BT.SetProperty(this, "colors", 1));
        colorSelector.children.push(color0Seq);

        let color1Seq = new BT.Sequence();
        color1Seq.children.push(new BT.ChangeColor(this, this.colors[1]));
        color1Seq.children.push(new BT.SetProperty(this, "colors", 0));
        colorSelector.children.push(color1Seq);

        countSeq.children.push(colorSelector);

        selector.children.push(countSeq);

        this.root = selector;
    }

    update(deltaTime, gameMap) {

        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
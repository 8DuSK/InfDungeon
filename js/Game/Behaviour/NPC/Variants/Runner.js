import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { CountValue } from '../../../../Util/CountValue';

export class Runner extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x1f3fb5), 0.8, Entity.Shapes.Torus);

        this.statScales.damage[0] = 0;
        this.statScales.xpReward = [30, 2];
        this.topSpeed = 5;

        this.despawn = new CountValue(4, 4, -1);
        this.seen = false;

        // Behaviour Tree

        let selector = new BT.Selector();


        // Detection Sequence
        let seenNode = new BT.CheckValue(this, "seen", false)

        let detect = new BT.Sequence();
        detect.children.push(seenNode);
        detect.children.push(new BT.InRangeOfEntity(this, player, 50));
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
        selector.children.push(evade);

        selector.children.push(new BT.SetProperty(this, "toRemove", true));

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class WealthyMimic extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xdb9004), 1.3, Entity.Shapes.Torus);
        this.topSpeed = 10;

        this.statScales.damage[0] = 1;
        this.statScales.xpReward = [5, 1];

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence
        let seekSeq = new BT.Sequence();
        seekSeq.children.push(new BT.InRangeOfEntity(this, player, 8));
        seekSeq.children.push(new BT.SeekTarget(this, player));
        selector.children.push(seekSeq);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
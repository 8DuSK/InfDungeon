import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Mimic extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0xb51a09), 1.7, Entity.Shapes.Box);
        this.topSpeed = 10;

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence
        let seekSeq = new BT.Sequence();
        seekSeq.children.push(new BT.InRangeOfEntity(this, player, 9));
        seekSeq.children.push(new BT.SeekTarget(this, player));
        selector.children.push(seekSeq);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
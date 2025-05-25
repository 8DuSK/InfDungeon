import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Grunt extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x275e3d), 2, Entity.Shapes.Cone);

        this.statScales.damage[0] = 1;

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence
        let seekSeq = new BT.Sequence();
        seekSeq.children.push(new BT.InRangeOfEntity(this, player, 30));
        seekSeq.children.push(new BT.SeekTarget(this, player));
        selector.children.push(seekSeq);

        // Arrive Sequence
        let arriveSeq = new BT.Sequence();
        arriveSeq.children.push(new BT.InRangeOfEntity(this, player, 10));
        arriveSeq.children.push(new BT.ArriveTarget(this, player, 10));
        selector.children.push(arriveSeq);

        // Wander Action
        let wander = new BT.Wander(this);
        selector.children.push(wander);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
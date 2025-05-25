import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Fly extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x09d6e0), 1, Entity.Shapes.Cone);

        this.statScales.damage[0] = 1;
        this.statScales.hp = [1, 0];

        this.topSpeed = 35;

        // Behaviour Tree

        let selector = new BT.Selector();

        let touchSeq = new BT.Sequence();
        touchSeq.children.push(new BT.InRangeOfEntity(this, player, player.size/2));
        touchSeq.children.push(new BT.SetProperty(this, "toRemove", true));
        selector.children.push(touchSeq);

        // Seek Sequence
        let seekSeq = new BT.Sequence();
        seekSeq.children.push(new BT.InRangeOfEntity(this, player, 30));
        seekSeq.children.push(new BT.SeekTarget(this, player));
        selector.children.push(seekSeq);

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
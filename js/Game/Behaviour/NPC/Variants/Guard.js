import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Guard extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x454f4a), 3.1, Entity.Shapes.Cone);

        this.statScales.damage[0] = 3;
        this.statScales.hp[0] = 5;
        this.statScales.hp[1] = 1.6;

        // Behaviour Tree

        let selector = new BT.Selector();

        // Seek Sequence

        let seek = new BT.Sequence();
        seek.children.push(new BT.InRangeOfEntity(this, player, 30));
        seek.children.push(new BT.LineOfSight(this,player,gameMap));
        seek.children.push(new BT.SetProperty(this,"topSpeed", 18));
        seek.children.push(new BT.SeekTarget(this,player));
        selector.children.push(seek);


        // Patrol Sequence

        let patrolSequence = new BT.Sequence();
        patrolSequence.children.push(new BT.SetProperty(this,"topSpeed", 10));

        let patrolSelector = new BT.Selector();

        let turn = new BT.Sequence();
        turn.children.push(new BT.FacingObstacle(this, gameMap));
        turn.children.push(new BT.SeekDirection(this, new THREE.Vector3(0, -1, 0)));
        patrolSelector.children.push(turn);

        let forward = new BT.Sequence();
        forward.children.push(new BT.SeekDirection(this));
        patrolSelector.children.push(forward);

        patrolSequence.children.push(patrolSelector);
        selector.children.push(patrolSequence);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
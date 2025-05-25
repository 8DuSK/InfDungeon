import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Stalker extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x33264a), 2.8, Entity.Shapes.Cone);

        this.statScales.hp = [4, 2];
        this.statScales.xpReward = [1, 0.3];

        this.topSpeed = 23;

        // Behaviour Tree

        let selector = new BT.Selector();

        // Stare sequence
        let stare = new BT.Sequence();
        stare.children.push(new BT.LineOfSight(this, player, gameMap));
        stare.children.push(new BT.SetProperty(this, "topSpeed", 8));
        stare.children.push(new BT.AimAtTarget(this, player));

        selector.children.push(stare);

        // Search sequence
        let search = new BT.Sequence();
        search.children.push(new BT.InvalidPath(this, player, gameMap));
        search.children.push(new BT.CreatePath(this, player, gameMap));

        selector.children.push(search);

        let follow = new BT.Sequence();
        follow.children.push(new BT.FollowPath(this, gameMap));
        follow.children.push(new BT.SetProperty(this, "topSpeed", 23));

        selector.children.push(follow);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
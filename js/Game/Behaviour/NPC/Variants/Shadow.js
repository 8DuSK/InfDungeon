import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';

export class Shadow extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x000000), player.size, Entity.Shapes.Cone);

        this.statScales.hp = [999, 1];
        this.statScales.xpReward = [5, 1.5];
        this.statScales.damage = [999, 1];

        this.topSpeed = 6;

        // Behaviour Tree

        let selector = new BT.Selector();

        // Stare sequence
        let direct = new BT.Sequence();
        direct.children.push(new BT.LineOfSight(this, player, gameMap));
        direct.children.push(new BT.SeekTarget(this, player));

        selector.children.push(direct);

        // Search sequence
        let search = new BT.Sequence();
        search.children.push(new BT.InvalidPath(this, player, gameMap));
        search.children.push(new BT.CreatePath(this, player, gameMap));

        selector.children.push(search);

        let follow = new BT.Sequence();
        follow.children.push(new BT.FollowPath(this, gameMap));

        selector.children.push(follow);

        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
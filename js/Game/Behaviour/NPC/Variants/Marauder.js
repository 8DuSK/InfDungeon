import { NPC } from '../NPC';
import * as THREE from 'three';
import { Entity } from '../../Entity';
import * as BT from '../BTNode';
import { Projectile } from '../../Projectile/Projectile';
import { ProjectileFactory } from '../../Projectile/ProjectileFactory';

export class Marauder extends NPC {

    constructor(player, entityManager, gameMap) {

        super(player, new THREE.Color(0x00ffa6), 2.7, Entity.Shapes.Cone);

        this.seen = false;

        this.shotCooldown.max = 0.6;

        let pParams = {
            type: Projectile.ProjectileType.Range,
            color: new THREE.Color(0xffff00),
            owner: this,
            speed: 25,
            size: 0.6,
            damage: this
        }
        this.projectileFactory = new ProjectileFactory(pParams);

        // Behaviour Tree
        // Probably the most advance behaviour tree I made

        let selector = new BT.Selector();

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


        // If player is within range, pay attention to their movements
        let inRange = new BT.Sequence();
        inRange.children.push(new BT.InRangeOfEntity(this, player, 80));

        let inRangeSelector = new BT.Selector();


        // If npc sees player, then remember them and start combat
        let sight = new BT.Sequence();
        sight.children.push(new BT.LineOfSight(this, player, gameMap));
        sight.children.push(new BT.SetProperty(this, "seen", true));

        let combatSelector = new BT.Selector();

        let close = new BT.Sequence();
        close.children.push(new BT.InRangeOfEntity(this, player, 10));
        close.children.push(new BT.SetProperty(this,"topSpeed", 23));
        close.children.push(new BT.SeekTarget(this, player));

        let shoot = new BT.Sequence();
        shoot.children.push(new BT.ReadyToShoot(this.shotCooldown));
        shoot.children.push(new BT.AimAtTarget(this, player));
        shoot.children.push(new BT.FireProjectile(entityManager, this.projectileFactory, this.shotCooldown));
        shoot.children.push(new BT.SeekTarget(this, player));

        let further = new BT.Sequence();
        further.children.push(new BT.SetProperty(this,"topSpeed", 18));
        further.children.push(new BT.AimAtTarget(this, player));
        further.children.push(new BT.SeekTarget(this, player));

        combatSelector.children.push(close);
        combatSelector.children.push(shoot);
        combatSelector.children.push(further);

        sight.children.push(combatSelector);

        // If npc cannot see the player, then look for them if they remember seeing them
        // or go back to patrolling
        let nosight = new BT.Sequence();
        nosight.children.push(new BT.CheckValue(this, "seen", true));

        let pathFind = new BT.Selector();

        // Path search sequence
        let search = new BT.Sequence();
        search.children.push(new BT.InvalidPath(this, player, gameMap));
        search.children.push(new BT.CreatePath(this, player, gameMap));
        pathFind.children.push(search);
        
        // Path follow sequence
        let follow = new BT.Sequence();
        follow.children.push(new BT.FollowPath(this, gameMap));
        follow.children.push(new BT.SetProperty(this, "topSpeed", 18));
        pathFind.children.push(follow);

        nosight.children.push(pathFind);

        inRangeSelector.children.push(sight);
        inRangeSelector.children.push(nosight);

        inRange.children.push(inRangeSelector);
        

        // If player is too far away, then forget about them and patrol
        let outOfRange = new BT.Sequence();
        outOfRange.children.push(new BT.SetProperty(this, "seen", false));
        outOfRange.children.push(patrolSequence);


        selector.children.push(inRange);
        selector.children.push(outOfRange);
        this.root = selector;
    }

    update(deltaTime, gameMap) {
        
        super.update(deltaTime, gameMap);
        this.root.run();
    }

}
import { Entity } from "../Entity";
import * as THREE from 'three';

export class Treasure extends Entity {

    constructor(size) {
        super(new THREE.Color(0xffc219), size, Entity.Shapes.Torus);

        this.topSpeed = 0;
        this.mass = 0.5;

        this.xpReward = size*2;
    }


}
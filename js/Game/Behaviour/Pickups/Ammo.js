import { Entity } from "../Entity";
import * as THREE from 'three';

export class Ammo extends Entity {

    constructor() {
        super(new THREE.Color(0x00e300), 2, Entity.Shapes.Box);

        this.topSpeed = 0;
        this.mass = 0.5;

        this.amount = 5;
    }


}
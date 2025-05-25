import { Entity } from "../Entity";
import * as THREE from 'three';

export class HealthKit extends Entity {

    constructor() {
        super(new THREE.Color(0xbf0404), 1.5, Entity.Shapes.Box);

        this.topSpeed = 0;
        this.mass = 0.5;

        this.healAmount = 0.3;
    }


}
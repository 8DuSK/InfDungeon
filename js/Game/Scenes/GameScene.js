import * as THREE from 'three';
import { EntityManager } from '../Behaviour/EntityManager.js'

export class GameScene {

    constructor(scene, camera, renderer, controller) {

        if(this.constructor == GameScene) {
            throw new Error("Class is of abstract type and cannot be instantiated");
         };


        // Create Scene
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controller = controller;

        // Create clock
        this.clock = new THREE.Clock();
        this.paused = false;

        // Entity Manager
        this.entityManager = new EntityManager(this.scene);

    }

    animate() {
        let deltaTime = this.clock.getDelta();

        if (!this.paused) {
            this.entityManager.update(deltaTime, this.gameMap, this.controller);
        }
    }

    // Removes all the objects from the scene
    clearScene() {
        for(var i = this.scene.children.length - 1; i >= 0; i--) { 
            let obj = this.scene.children[i];
            this.scene.remove(obj); 
       }
    }

}
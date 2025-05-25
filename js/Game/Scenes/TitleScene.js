import * as THREE from 'three';
import { EntityManager } from '../Behaviour/EntityManager.js'
import { Player } from '../Behaviour/Player/Player.js';
import { PlayScene } from './PlayScene.js';
import { GameScene } from './GameScene.js';
import { GameMap } from '../World/GameMap.js';

export class TitleScene extends GameScene {

    constructor(scene, camera, renderer, controller) {
        super(scene, camera, renderer, controller);

        this.scene.background = new THREE.Color(0x000000);
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	    document.body.appendChild(this.renderer.domElement);

        // Create Light
	    let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	    directionalLight.position.set(0, 5, 5);
	    this.scene.add(directionalLight);

        // initialize our gameMap
	    this.gameMap = new GameMap(0);
        this.gameMap.init(this.scene);
	    this.scene.add(this.gameMap.gameObject);

        this.startGame == false;

        this.width = this.gameMap.width + this.gameMap.start.x;
        this.depth = this.gameMap.depth + this.gameMap.start.z

        this.camera.position.x = this.width/2;
        this.camera.position.z = this.depth/2;

        this.direction = new THREE.Vector3(Math.round(Math.random()*2 - 1), 0, Math.round(Math.random()*2 - 1));
        if (this.direction.x == 0) this.direction.x = 1;
        if (this.direction.z == 0) this.direction.z = 1;

        // initialize UI
        this.titleUI = document.getElementById("title");
        this.titleUI.style.display = 'block';

        this.buttonUI = document.getElementById("button");
        this.buttonUI.style.visibility = 'visible';
        this.buttonUI.addEventListener('click', this);

        this.loadingUI = document.getElementById("loading");
        this.loadingUI.style.display = 'none';

    }

    handleEvent(event) {
        if (event.type == 'click' && event.target == this.buttonUI) {
           this.startGame = true;
        }
    }

    animate() {
        super.animate();


        if (this.startGame) {
            this.clearScene();

            return(
                new PlayScene(this.scene, this.camera, this.renderer, this.controller, 
                10, new Player(new THREE.Color(0xffffff), 0, 0))
            );
        }

        this.camera.position.x += this.direction.x/10;
        this.camera.position.z += this.direction.z/10;

        if (this.camera.position.x > this.width) this.direction.x = -1;
        if (this.camera.position.x < this.gameMap.start.x) this.direction.x = 1;
        if (this.camera.position.z > this.depth) this.direction.z = -1;
        if (this.camera.position.z < this.gameMap.start.z) this.direction.z = 1;

        this.titleUI.style.fontSize = `10vh`;

        this.buttonUI.style.top = '50vh';
        this.buttonUI.style.left = '46vw';
        this.buttonUI.style.height = '5vh';
        this.buttonUI.style.width = '8vw';
        this.buttonUI.style.fontSize = '3vh';

        return this

    }

    clearScene() {
        super.clearScene();
        this.loadingUI.style.display = 'block';
        this.titleUI.style.display = 'none';
        this.buttonUI.style.visibility = 'hidden';

        document.removeEventListener('click', this);
    }

}
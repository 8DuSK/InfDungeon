import * as THREE from 'three';
import { GameMap } from '../World/GameMap.js';
import { GameScene } from './GameScene.js';
import { TitleScene } from './TitleScene.js';

import { Player } from '../Behaviour/Player/Player.js';
import { TileNode } from '../World/TileNode.js';


// Main game scene
export class PlayScene extends GameScene {

    constructor(scene, camera, renderer, controller, level, player) {
        super(scene, camera, renderer, controller);

        this.scene.background = new THREE.Color(0xffffff);
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	    document.body.appendChild(this.renderer.domElement);

	    //Create Light
	    let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	    directionalLight.position.set(0, 5, 5);
	    this.scene.add(directionalLight);

		this.level = level;

	    // initialize our gameMap
	    this.gameMap = new GameMap(level);
        this.gameMap.init(this.scene);
	    this.scene.add(this.gameMap.gameObject);

		this.player = player;
		this.player.inv.count = 3;

		// Spawns player, items, and leveled npcs
		this.gameMap.spawnEnities(this.entityManager, this.player);

		// UI elements
		this.playerStatsUI = document.getElementById('player-stats');
		this.playerStatsUI.style.visibility = 'visible';

		this.instructionUI = document.getElementById('instruction');
		this.instructionUI.style.top = `${100}px`;
		this.instructionUI.style.visibility = 'hidden'

		this.floorUI = document.getElementById('floor');
		this.floorUI.textContent = "Floor " + this.level;
		this.floorUI.style.top = `${50}px`;
		this.floorUI.style.visibility = 'visible';

		this.pauseUI = document.getElementById('pause');
		this.pauseUI.style.visibility = 'hidden';

		this.loadingUI = document.getElementById('loading');
		this.loadingUI.style.display = 'none';

    }

    animate() {
        super.animate();

		// Stops updating the scene when pause is true
		if (this.controller.pause && this.controller.canPause) {
			this.controller.canPause = false;
			this.paused = !this.paused;
		}

		if (this.paused) {
			this.pauseUI.style.top = `25vh`;
			this.pauseUI.style.left = `50vw`;
			this.pauseUI.style.visibility = 'visible';
		} else {
			this.pauseUI.style.visibility = 'hidden';
		}

		// Show death message to player when they lose the game
		if (this.player.toRemove) {
			this.floorUI.textContent = "You died!!!"
		}

		// Camera follows the player
		this.camera.position.x = this.player.location.x;
		this.camera.position.z = this.player.location.z;

		this.playerStatsUI.textContent = this.player.printStats();

		let node = this.gameMap.quantize(this.player.location);
		if (node != null && node.type == TileNode.Type.Goal) {
			this.instructionUI.style.visibility = 'visible'
		} else {
			this.instructionUI.style.visibility = 'hidden'
		}

		// If goal is found, then proceed to next floor
		if (this.gameMap.goalFound) {

			this.level+=1;
			this.clearScene();
			return new PlayScene(
				this.scene,this.camera,this.renderer,this.controller,
				this.level, this.player);

		// If player dies, reset to starting scene
		} else if (this.player.deathTime.count >= this.player.deathTime.max) {
			
			this.clearScene();
			return new TitleScene(this.scene,this.camera,this.renderer,this.controller);
		}

        return this;
    }

	clearScene() {
		super.clearScene();
		this.playerStatsUI.style.visibility = 'hidden';
		this.floorUI.style.visibility = 'hidden'
		this.instructionUI.style.visibility = 'hidden'
		this.loadingUI.style.display = 'block'
		this.floorUI.textContent = "Floor 0";
	}


}
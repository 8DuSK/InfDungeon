import * as THREE from 'three';
import { PlayScene } from "./Game/Scenes/PlayScene";
import { Controller } from './Game/Behaviour/Player/Controller';
import { Player } from './Game/Behaviour/Player/Player.js';
import { TitleScene } from './Game/Scenes/TitleScene.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Controller for player
const controller = new Controller(document);


// For keeping player in center of screen and keeping mousepos accurate
// Code from this fourm post
// https://discourse.threejs.org/t/resize-canvas-with-different-aspect-ratio/42439
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

camera.position.y = 65;
camera.lookAt(0,0,0);

//let currentScene = new PlayScene(scene, camera, renderer, controller, 0, new Player(new THREE.Color(0xffffff)));
let currentScene = new TitleScene(scene, camera, renderer, controller);

// Loops over scene until current scene is null
function animate() {

	if (currentScene != null) {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
		currentScene = currentScene.animate();
	}

}

animate();
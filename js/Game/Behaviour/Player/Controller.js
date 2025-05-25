import * as THREE from 'three';

export class Controller {
	// Controller Constructor
	constructor(doc) {
		this.doc = doc;
		this.left = false;
		this.right = false;
		this.forward = false;
		this.backward = false;
		this.shoot = false;
		this.swing = false;
		this.pause = true;
		this.interact = false;

		this.canShoot = true;
		this.canSwing = true;
		this.canPause = false;

		this.mousePosition = new THREE.Vector3();

		this.doc.addEventListener('keydown', this);
		this.doc.addEventListener('keyup', this);
		this.doc.addEventListener('mousemove', this);
	}

	handleEvent(event) {
		if (event.type == 'keydown') {
			switch (event.code) {
				case("KeyW"): 
					this.forward = true;
					break;
				case("KeyS"):
					this.backward = true;
					break;
				case("KeyA"):
					this.left = true;
					break;
				case("KeyD"):
					this.right = true;
					break;
				case("ShiftLeft"):
					this.shoot = true;
					break;
				case("Space"):
					this.swing = true;
					break;
				case("KeyP"):
					this.pause = true;
					break;
				case("KeyE"):
					this.interact = true;
					break;

			}
	
		}
		else if (event.type == 'keyup') {
			switch (event.code) {
				case("KeyW"): 
					this.forward = false;
					break;
				case("KeyS"):
					this.backward = false;
					break;
				case("KeyA"):
					this.left = false;
					break;
				case("KeyD"):
					this.right = false;
					break;
				case("ShiftLeft"):
					this.canShoot = true;
					this.shoot = false;
					break;
				case("Space"):
					this.canSwing = true;
					this.swing = false;
					break;
				case("KeyP"):
					this.pause == false;
					this.canPause = true;
				case("KeyE"):
					this.interact = false;
					break;
			}
		}
		else if (event.type == 'mousemove') {

			
			let sWidth = this.squareize(window.innerWidth, window.innerHeight, event.clientX);
			let sHeight = this.squareize(window.innerHeight, window.innerWidth, event.clientY);

			let width = sWidth[0];
			let mX = sWidth[1];

			let height = sHeight[0];
			let mY = sHeight[1];

			this.mousePosition.set(
				(mX / width) * 2 - 1,
				0,
				 -((mY / height) * -2 + 1),
			);
		}
	}

	// If a screen has a rectangular dimension, then this function calculates a more equal screen position
	// Used to keep cursor aim accurate
	squareize(larger, smaller, mouseCoord) {

		if (larger > smaller) {

			let start = (larger - smaller)/2;;
			let end = start + smaller;

			larger = smaller;

			if (mouseCoord < start) {
				mouseCoord = 0;
			} else if (mouseCoord > end) {
				mouseCoord = smaller;
			} else {
				mouseCoord -= start;
			}
		}

		return [larger, mouseCoord];
	}
	
	destroy() {
		this.doc.removeEventListener('keydown', this);
		this.doc.removeEventListener('keyup', this);
		this.doc.removeEventListener('movemove',this);
	}

	moving() {
		if (this.left || this.right || this.forward || this.backward)
			return true;
		return false;
	}


	direction() {
		let direction = new THREE.Vector3();

		if (this.left) {
			direction.x = -1;
		}
		if (this.right) {
			direction.x = 1;
		}

		if (this.forward) {
			direction.z = -1;
		}
		if (this.backward) {
			direction.z = 1;
		}

		return direction;
	}


}

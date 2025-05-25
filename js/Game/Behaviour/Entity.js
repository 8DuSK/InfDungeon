import * as THREE from 'three';

export class Entity {

	static Shapes = Object.freeze({
		Cone: Symbol("cone"),
		Sphere: Symbol("sphere"),
		Box: Symbol("box"),
		Ring: Symbol("ring"),
		Torus: Symbol("torus")
	})

	// Entity Constructor
	constructor(mColor, size, shape) {

		this.size = size;
		this.mColor = mColor;
		
		// Create our cone geometry and material
		let geometry = null;
		switch(shape) {

			case (Entity.Shapes.Sphere):
				geometry = new THREE.SphereGeometry(this.size/2);
				break;

			case (Entity.Shapes.Box):
				geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
				break;

			case (Entity.Shapes.Ring):
				geometry = new THREE.RingGeometry(this.size/2,this.size/4);
				break;

			case (Entity.Shapes.Torus):
				geometry =new THREE.TorusGeometry(this.size/2,this.size/4) 
				break;
			
			default:
				geometry = new THREE.ConeGeometry(this.size/2, this.size, this.size*10);
				break;

		}

		let material = new THREE.MeshStandardMaterial({color: mColor});
		
		// Create the local cone mesh (of type Object3D)
		let mesh = new THREE.Mesh(geometry, material);
		// Increment the y position so our cone is just atop the y origin
		mesh.position.y = mesh.position.y+1;
		// Rotate our X value of the mesh so it is facing the +z axis
		mesh.rotateX(Math.PI/2);

		// Add our mesh to a Group to serve as the game object
		this.gameObject = new THREE.Group();
		this.gameObject.add(mesh);		

		// Initialize movement variables
		this.location = new THREE.Vector3(0,0,0);
		this.velocity = new THREE.Vector3(0,0,0);
		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.direction = new THREE.Vector3(0 ,0, 1);

		this.topSpeed = 16;
		this.mass = 1;
		this.frictionMagnitude = 1;

		this.wanderAngle = null;

		// Flag for entity manager when entity needs to be removed
		this.toRemove = false;

		// Tracks deltaTime for every entity update
		// makes it easier to refer to deltaTime when needed
		this.deltaTime = 0;
	}

	setModel(model) {
		model.position.y = model.position.y+1;
		
		// Bounding box for the object
		var bbox = new THREE.Box3().setFromObject(model);

		// Get the depth of the object for avoiding collisions
		// Of course we could use a bounding box,
		// but for now we will just use one dimension as "size"
		// (this would work better if the model is square)
		let dz = bbox.max.z-bbox.min.z;

		// Scale the object based on how
		// large we want it to be
		let scale = this.size/dz;
		model.scale.set(scale, scale, scale);

        this.gameObject = new THREE.Group();
        this.gameObject.add(model);
    }

	// update entity
	update(deltaTime, gameMap) {

		this.deltaTime = deltaTime;

		if (gameMap.quantize(this.location) == null) {
			this.toRemove = true;
			return;
		}

		// update velocity via acceleration
		this.velocity.addScaledVector(this.acceleration, deltaTime);

		// rotate the entity to ensure they face 
		// the direction of movement
		let angle = Math.atan2(this.direction.x, this.direction.z);
		this.gameObject.rotation.y = angle;

		if (this.velocity.length() > 0) {

			if (this.velocity.length() > this.topSpeed) {
				this.velocity.setLength(this.topSpeed);
			} 

			// update location via velocity
			this.location.addScaledVector(this.velocity, deltaTime);

		}

		if (this.velocity.length() != 0) {
			this.direction = this.velocity.clone().normalize();
		}
		
		// set the game object position
		this.gameObject.position.set(this.location.x, this.location.y, this.location.z);
		this.acceleration.multiplyScalar(0);
	
	}

	// Apply force to our entity
	applyForce(force) {
		// here, we are saying force = force/mass
		force.divideScalar(this.mass);
		// this is acceleration + force/mass
		this.acceleration.add(force);
	}


	// check if two entities are colliding
	checkCollision(entity) {
		let cSize = entity.size;
		let cLocation = entity.location

		let d = this.location.distanceTo(cLocation);

		if (d < (cSize/2 + this.size/2)) {
			return true;
		}
		return false;
	}
	
	// Changes colour of entity
	setColour(mColor) {
		this.gameObject.children[0].material = new THREE.MeshStandardMaterial({color: mColor});

	}

	// Seek steering behaviour
	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

		if (steer.length() > this.maxForce) {
			steer.setLength(this.maxForce);
		}
		return steer;
	}

	// Wander steering behaviour
  	wander(d = 10, r = 10, a = 0.3) {

  		let futureLocation = this.velocity.clone();
  		futureLocation.setLength(d);
  		futureLocation.add(this.location);

  		if (this.wanderAngle == null) {
  			this.wanderAngle = Math.random() * (Math.PI*2);
  		} else {
  			let change = Math.random() * (a*2) - a;
  			this.wanderAngle = this.wanderAngle + change;
  		}

  		let target = new THREE.Vector3(r*Math.sin(this.wanderAngle), 0, r*Math.cos(this.wanderAngle));
  		target.add(futureLocation);
  		return this.seek(target);

  	}

  	// Arrive steering behaviour
  	arrive(target, radius) {
  		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		
		// get distance of the desired vector
		// which is the distance to the target
		// length is built in
		let distance = desired.length();

		// if distance is less than radius we want
		// to slow down based on how close we are
		if (distance < radius) {
			let speed = (distance/radius) * this.topSpeed;
			desired.setLength(speed);
		} else {
			desired.setLength(this.topSpeed);
		}
  		
  		// steer = desired velocity - current velocity
  		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

		return steer;


  	}

}
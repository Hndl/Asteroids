class LaserCannon {
	constructor ( _x, _y){
		this.origin = createVector(_x, _y);
		this.speed = 0.5;
		this.color = 255;
		this.stream = [];
	}

	fire( _x, _y) {
		this.stream.push( new Laser( _x, _y, this.speed, this.color ) );
	}

	update () {
		for (let i = this.stream.lenght-1; i >= 0 ; i--){
			//iterate the array back wards because we will need to remove elements.
			let l = this.stream[i];
			if ( l.isOffScreen() ){
				//remove it.
				l.splice(i,1);
			}
		}
	}
}

class Laser {
	constructor ( _x, _y , _s, _c ){
		this.pos 	= createVector(_x,_y);
		this.speed 	= _s;
		this.colour = _c;
	}

	update () { 
		//TODO update the laser XY to show its moving.
	}

	isOffScreen(){
		return ( this.x < 0 || this.y > width || this.y < 0 || this.y > height);
	}

	hit( _tX, _tY, _tR) {
		let d = dist( this.pos.x, this.pos.y, _tX, _tY);
		return ( d <= _tR); 

	}
	draw () {
		push();
		stroke(this.color);
		strokeWeight(3);
		point(this.pos.x, this.pos.y);
		pop();
	}
}


class Asteroid {
	constructor( _x, _y ) {
		//this.maxPoints 	= 6;
		this.r = floor(random(30,60));
		this.offset = [];
		this.total = floor(random(5, 15));
		this.heading = 0;
		this.rotationInc = random(-0.03,0.03);
		this.vel = p5.Vector.random2D();
		this.pos = createVector( _x, _y);
		for ( let i = 0 ; i < this.total ; i++ ) {
			//this.r = floor(random(30,60));
			this.offset[i] = random(-this.r * 0.2, this.r * 0.5);
		}
	}

	update() {
		this.pos.add(this.vel);
		this.heading += this.rotationInc;
		this.edges();
	}

	draw() {
		push();
		translate(this.pos.x, this.pos.y);
		noFill();
		stroke(255);
		strokeWeight(1);
		rotate(this.heading);
		//ellipse(0,0, this.r*2, this.r*2);
		beginShape();
		 for (let i = 0; i < this.total; i++) {
      		let angle = map(i, 0, this.total, 0, TWO_PI);
      		let rr = this.r + this.offset[i];
      		vertex(rr * cos(angle), rr * sin(angle));
    	}
		endShape(CLOSE);
		pop();
	}
	edges() { 
		if (this.pos.x < 0){
			this.pos.x = width;
		}
		if ( this.pos.x > width ) {
			this.pos.x = 0;
		}
		if (this.pos.y < 0){
			this.pos.y = height;
		}
		if ( this.pos.y > height ) {
			this.pos.y = 0;
		}
	}
}

class Ship {

	constructor ( _w, _h ) {
		this.r 				= 10;
		this.friction 		= 0.99;
		this.pos 			= createVector( _w /2 , _h / 2);
		this.theta 			= 0.08;
		this.thetaLeft 		= -this.theta;
		this.thetaRight 	= this.theta;
		this.turning 		= false;
		this.currentRotaton = 0 ;
		this.vel 			= createVector(0,0);
		this.heading		= 0;
		this.thrust 		= false;
		this.cHeading		= createVector(0,0);
		this.explode 		= false;
		this.explodeSequence = 300;
		this.explodeI		= 0;
	}

	update () {
		if ( this.turning ){
			this.currentRotaton += this.theta;
		}
		if ( this.thrust ) {
			// if the thrust is engaged, then we need to move the ship in the relevant direction.
			//console.log(`thrust engaged`);
			this.thrustCalc( 0.05 );
			this.pos.add(this.vel);
		} else { 
			this.thrustCalc( 0 );
			this.pos.add(this.vel);
		}
		this.edges();
	}


	draw () {

		push();
		translate( this.pos.x, this.pos.y);
		if ( this.explode ) {
			if ( this.explodeI <= this.explodeSequence ) {
				noFill();
				let alpha = map(this.explodeI, 255,0 , 0, this.explodeSequence);
				stroke(255,255,255,alpha);
				strokeWeight(2);
				ellipse(0, 0, this.explodeI*2, this.explodeI*2);	
				this.explodeI ++;
			} else {
				noFill();
				stroke(255);
				textSize(24);
				rotate ( this.currentRotaton );// why not!
				text("Game Over!",0,0);
				// really gameover now!
			}

		} else {
			rotate ( this.currentRotaton );
			strokeWeight(4)
			stroke(255);
			point(0,0)
			stroke(255,0,0);
			point(this.r*2 ,0);
			stroke(0,255,0);
			point(-this.r*2, this.r*2);
			stroke(0,0,255);
			point(-this.r*2, -this.r*2);
			
			stroke(255);
			strokeWeight(2);
			let d = this.r*2;
			noFill();
			triangle(-2 / 3 * this.r, -this.r,
	               -2 / 3 * this.r, this.r,
	                4 / 3 * this.r, 0);
		}
		pop();
	}

	rotateLeft ( ) {
		this.theta = this.thetaLeft;
		this.turning = true;
	}
	rotateRight() {
		this.theta = this.thetaRight;
		this.turning = true;
	}

	edges() { 
		if (this.pos.x < 0){
			this.pos.x = width;
		}
		if ( this.pos.x > width ) {
			this.pos.x = 0;
		}
		if (this.pos.y < 0){
			this.pos.y = height;
		}
		if ( this.pos.y > height ) {
			this.pos.y = 0;
		}
	}
	
	stopRotate ( _d  ){
		//console.log(`stopRotate()`);
		this.turning = false;
	}

	shutOffThrusters () {
		//console.log(`shutOffThrusters:`);
		this.thrust = false;
	}

	engageThrusters () {
		//console.log(`engageThrusters:`);
		this.thrust = true;
	}

	thrustCalc ( _d ) {

		let force = p5.Vector.fromAngle(this.currentRotaton);
		force.mult(_d);

		this.vel.add(force);
		
		//console.log(`force:${this.vel}`);
		
	}

	hit( _asteroid ) {
		let d = dist( _asteroid.pos.x, _asteroid.pos.y, this.pos.x, this.pos.y);
		let b = (d < (_asteroid.r + this.r) );
		if ( b ){
			//console.log(`distance:${d} hit${b}`);	
			this.explode = true;
		}
	}
}
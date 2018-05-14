class Hud {
	constructor ( _w, _h ) {
		this.w = _w;
		this.h = _h;
		this.b = 20;
		this.shots = 0;
		this.asteroidCount = 0;
		this.colorArray = ['#E68295','#8E8588','#D82F4E','#1B6B8C'];
		this.wave = 0;
	}

	update (_shots, _asteroidCount, _wave ) {
		this.shots = _shots;
		this.asteroidCount = _asteroidCount;
		this.wave = _wave;
	}

	

	draw() {
		push();
		stroke(this.colorArray[3]);
		strokeWeight(1);
		noFill();
		rect(this.b,this.b,this.w-this.b*2, 50);
		rect(this.b,this.b,this.w-this.b*2, this.h-this.b*2);
		
		stroke(255);
		noFill();
		textSize(24);
		text(`Wave:${this.wave}.   Asteroids Remaining:${this.asteroidCount}.    Fire:${this.shots}`, this.b+10, this.b+30);
		
		pop();
	}

}

class DustControl {
	constructor( _n) {
		this.sys = [];
		for ( var i = 0 ; i < _n ; i++){
			this.sys.push( new Dust() ) ;
		}
	}

	draw() {
		for ( var i = 0 ; i < this.sys.length ; i++){
			this.sys[i].update();
			this.sys[i].draw();
		}	
	}
}
class Dust {
	constructor( ) {
		this.pos = createVector(floor(random(width)), floor( random(height)));
		this.vel = p5.Vector.random2D();
		this.vel.mult(random(-1.5,1.5	));
		this.colorArray = ['#8B54BD','#94ABB1','#3F5F2E','#FBA92A','#FDEF43'];
		this.col = this.col = this.getColor();
	}
	getColor() {
		return ( this.colorArray[ floor( random( 0,this.colorArray.length))]) ;
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
	update () {
		this.pos.add(this.vel);
		this.edges();
	}

	draw() { 
		push();
		stroke(this.col);
		strokeWeight(random(1,5));
		point(this.pos.x, this.pos.y);
		pop();
	}
}


class Laser {
	constructor ( _origin, _originVelocity, _originHeading ){
		this.pos = createVector(_origin.x, _origin.y);
  		this.vel = p5.Vector.fromAngle(_originHeading);
  		this.vel.mult(10);
  		this.vel.add(_originVelocity);
  		this.impact = false;
  		this.colorArray = ['#E68295','#8E8588','#D82F4E','#1B6B8C'];
  		this.col = this.getColor();
	}
	getColor() {
		return ( this.colorArray[ floor( random( 0,this.colorArray.length))]) ;
	}

	update () { 
		
		this.pos.add(this.vel); // TODO this is a hack!
	}

	offScreen() { 
		return ( this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height || this.impact);
	}
	
	draw () {
		if (!this.impact){
			push();
			stroke(this.col);
			strokeWeight(5);
			point(this.pos.x, this.pos.y);
			pop();
		}
	}
}


class Asteroid {
	constructor( _x, _y , _r) {
		//this.maxPoints 	= 6;
		this.fireCount = 0;
		this.r = _r || floor(random(30,60));
		this.offset = [];
		this.total = floor(random(5, 15));
		this.heading = 0;
		this.rotationInc = random(-0.03,0.03);
		this.vel = p5.Vector.random2D();
		this.pos = createVector( _x, _y);
		this.explode = false;
		this.danger = false;
		this.dangerToship = false;
		this.colorArray = ['#8B54BD','#94ABB1','#3F5F2E','#FBA92A','#FDEF43'];
		this.col = this.col = this.getColor();

		for ( var i = 0 ; i < this.total ; i++ ) {
			//this.r = floor(random(30,60));
			this.offset[i] = random(-this.r * 0.2, this.r * 0.5);
		}
	}
	getColor() {
		return ( this.colorArray[ floor( random( 0,this.colorArray.length))]) ;
	}

	breakup () {
		var spawnAsteroid = [];
		if ( this.r/2 > 5) {
			spawnAsteroid.push( new Asteroid( this.pos.x, this.pos.y, this.r/2));
			spawnAsteroid.push( new Asteroid( this.pos.x, this.pos.y, this.r/2));
		} 
		return ( spawnAsteroid);
	}
	hit ( _laser ) {
		var d = dist( _laser.pos.x, _laser.pos.y, this.pos.x, this.pos.y);
		var b = (d < (this.r) );
		if ( b ){
			//console.log(`asteroid hit - distance:${d} hit${b}`);	
			this.explode = true;
			_laser.impact = true;
			this.danger = true;
		}
		//console.log(`asteroid hit - distance:${d} range${this.r+100}`);
		if ( d < this.r + 20 ) {
			this.danger = true;
		} else {
			this.danger = false;
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
		
		if (this.danger){
			fill(0,255,0);
			stroke(0,255,0,20);
			strokeWeight(1);
		} else {

			if ( this.dangerToship ){
				fill(255,0,0,20);
				stroke(this.col);
				strokeWeight(3);
			} else { 
				fill(0);
				stroke(this.col);
				strokeWeight(1);
			}
		}
		rotate(this.heading);
		//ellipse(0,0, this.r*2, this.r*2);
		beginShape();
		 for (var i = 0; i < this.total; i++) {
      		var angle = map(i, 0, this.total, 0, TWO_PI);
      		var rr = this.r + this.offset[i];
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
		this.r 				= 12;
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
		this.dead 			= false;
		this.explodeI		= 0;
		this.gameOverColorR	= floor(random(255));
		this.gameOverColorG	= floor(random(255));
		this.gameOverColorB	= floor(random(255));
		this.fireCount = 0;	
		this.laser = [];
		this.shield = 100;
		this.danger = false;
		
	}

	isDead() {
		return ( this.dead);
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


	
		for ( var i = this.laser.length-1 ; i >= 0 ; i--) {
				
			if (!this.laser[i].offScreen()){
				this.laser[i].update();
				this.laser[i].draw();
			} else {
				this.laser.splice(i,1);//remove the item from the array
			}
		}
	
		//console.log(`${this.laser.length}`);

		this.edges();
	}


	draw () {

		push();
		translate( this.pos.x, this.pos.y);
		if ( this.explode ) {
			if ( this.explodeI <= this.explodeSequence ) {
				noFill();
				var alpha = map(this.explodeI, 255,0 , 0, this.explodeSequence);
				stroke(alpha,alpha*-1,255,alpha);
				strokeWeight(2);
				for ( var i = 0 ; i < 10 ; i++ ){
					ellipse(0, 0, (this.explodeI-(i*10))*2, (this.explodeI-(i*10))*2);	
				}
				this.explodeI++;
				
			} else {
			
				this.dead = true;
				
			}

		} else {
			rotate ( this.currentRotaton );
			strokeWeight(4)
			//stroke(255);
			//point(0,0)
			stroke(255,0,0);
			point(this.r*2 ,0);
			stroke(0,255,0);
			point(-this.r*2, this.r*2);
			stroke(0,0,255);
			point(-this.r*2, -this.r*2);
			
			stroke(255);
			strokeWeight(2);
			var d = this.r*2;
			noFill();
			triangle(-2 / 3 * this.r, -this.r,
	               -2 / 3 * this.r, this.r,
	                4 / 3 * this.r, 0);

			if ( this.danger ) {
				strokeWeight(2);
				fill(100,100,100);
				ellipse(0,0,this.shield*2, this.shield*2);
			} else { 
				strokeWeight(0.5);
				fill(100,255,255,10);
				ellipse(0,0,this.shield*2, this.shield*2);
			}
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

		var force = p5.Vector.fromAngle(this.currentRotaton);
		force.mult(_d);

		this.vel.add(force);
		
		//console.log(`force:${this.vel}`);
		
	}

	fire() {
		//console.log(`fire!`);
		this.fireCount++;
		this.laser.push(  new Laser(this.pos, this.vel, this.currentRotaton) );
		//console.log(`fire! ${this.laser.length}`);
	}

	hit( _asteroid ) {
		var d = dist( _asteroid.pos.x, _asteroid.pos.y, this.pos.x, this.pos.y);
		var b = (d < (_asteroid.r + this.r) );

		_asteroid.dangerToship = d < (_asteroid.r + this.r + 100);
		

		if ( b ){
			//console.log(`distance:${d} hit${b}`);	
			this.explode = true;
		}

		for ( var i = this.laser.length-1 ; i >= 0 ; i--) {
			
			if ( _asteroid.hit( this.laser[i] ) ) {	
				this.laser.splice(i,1);//remove the item from the array
			}
			
		}

	}
}

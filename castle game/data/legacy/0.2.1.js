var c = document.createElement('canvas');
document.body.appendChild(c);
	var W = 232;
	var H = 180;
c.width = W;
c.height = H;
	c.style.width = W*4 + 'px';
	c.style.height = H*4 + 'px';
	c.style.imageRendering = 'pixelated';
var ctx = c.getContext('2d');
	ctx.imageSmoothingEnabled = false;

var world = {
	tick: 0,
	background: '#333',
	paused: false
};

var i, j;

/// sprites ///

function newImg(path) {
	var x = new Image();
		x.src = path;
		x.load
	return x;
}

var sprite = [];	
	sprite[0] = newImg('data/sprites/blu0.png');
	sprite[1] = newImg('data/sprites/blu1.png');
	sprite[2] = newImg('data/sprites/blu2.png');
	sprite[3] = newImg('data/sprites/blu3.png');

	sprite[4] = newImg('data/sprites/skeleton0.png');
	sprite[5] = newImg('data/sprites/skeleton1.png');
	sprite[6] = newImg('data/sprites/skeleton2.png');
	sprite[7] = newImg('data/sprites/skeleton3.png');

var tileSprite = [];
	tileSprite[0] = newImg('data/sprites/tile0.png');
	tileSprite[1] = newImg('data/sprites/tile1.png');

/// objects ///

var type = {
	entity: ['player', 'skeleton'],
	tile: ['normal', 'semi']
}

class tile {

	constructor(x,y,w,h,tileType) {
		this.x = x*8;
		this.y = y*8;
		this.w = w*8;
		this.h = h*8;
		this.type = type.tile[tileType];
		switch(this.type) {
			case type.tile[0]:
				this.img = tileSprite[0];
				break;
			case type.tile[1]:
				this.img = tileSprite[1];
				break;
		}
	}
}

class entity {

	updateBiped() {

		if(this.accel != 0) {
			this.spX += this.accel;
			if(this.spX >= this.maxSp) {
				this.spX = this.maxSp;
			} else if(this.spX <= -this.maxSp) {
				this.spX = -this.maxSp;
			}
		} else if(this.spX > 0 && this.onG) {
			this.spX -= this.frict;
			if(this.spX <= 0)
				this.spX = 0;
		} else if(this.spX < 0 && this.onG) {
			this.spX += this.frict;
			if(this.spX >= 0)
				this.spX = 0;
		}

		this.spY += this.grav;

		this.preX = this.x;
		this.preY = this.y;
		this.x = this.x + this.spX;
		this.y = this.y + this.spY;
	}

	animate2Frame(a0,a1,a2,a3) {
	
		if(!this.onG) {
			this.imgR = sprite[a1];
			this.imgL = sprite[a3];
			this.counter = 0;
		} else if(this.accel != 0) {
			if(this.counter % 10 == 0) {
				if(this.imgR == sprite[a0] || this.imgL == sprite[a2]) {
					this.imgR = sprite[a1];
					this.imgL = sprite[a3];
				} else {
					this.imgR = sprite[a0];
					this.imgL = sprite[a2];
				}
			}
		} else {
			this.imgR = sprite[a0];
			this.imgL = sprite[a2];
			this.counter = 0;
		}
	
		if(this.accel > 0)
			this.lookingRight = true;
		else if(this.accel < 0)
			this.lookingRight = false;
	
		if(this.lookingRight)
			this.img = this.imgR;
		else
			this.img = this.imgL;
		this.counter++;
	}

	collideTop() {
		for(j = 0; j < tiles.length; j++) {
			if(this.preY <= tiles[j].y - this.h && this.y >= tiles[j].y - this.h &&
			this.x > tiles[j].x - this.w && this.x < tiles[j].x + tiles[j].w)
				return true;
		}
	}
	collideBottom() {
		for(j = 0; j < tiles.length; j++) {
			if(tiles[j].type != type.tile[1]) {
				if(this.preY >= tiles[j].y + tiles[j].h && this.y <= tiles[j].y + tiles[j].h &&
				this.x > tiles[j].x - this.w && this.x < tiles[j].x + tiles[j].w)
					return true;
			}
		}
	}

	collideRight() {
		for(j = 0; j < tiles.length; j++) {
			if(tiles[j].type != type.tile[1]) {
				if(this.preX <= tiles[j].x - this.w && this.x >= tiles[j].x - this.w &&
				this.y > tiles[j].y - this.h && this.y < tiles[j].y + tiles[j].h)
					return true;
			}
		}
	}
	collideLeft() {
		for(j = 0; j < tiles.length; j++) {
			if(tiles[j].type != type.tile[1]) {
				if(this.preX >= tiles[j].x + tiles[j].w && this.x <= tiles[j].x + tiles[j].w &&
				this.y > tiles[j].y - this.h && this.y < tiles[j].y + tiles[j].h)
					return true;
			}
		}
	}


	constructor(w,h,x,y,spx,spy,grav,accelProp,frict,jump,maxSp,maxHp,entType) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.preX = x;
		this.preY = y;
		this.spX = spx;
		this.spY = spy;
		this.grav = grav;
		this.accelProp = accelProp;
		this.accel = 0;
		this.frict = frict;
		this.jump = jump;
		this.maxSp = maxSp;
		this.maxHp = maxHp;
		this.hp = maxHp;
		this.onG = false;
		this.type = type.entity[entType];
		this.alive = true;
		this.counter = 0;

		this.img = this.imgR;
		this.lookingRight = true;

		switch(this.type) {
			case(type.entity[0]):
				this.update = function() {
					this.updateBiped();
				}
				this.animate = function() {
					this.animate2Frame(0,1,2,3);
				}
				break;
			case(type.entity[1]):
				this.update = function() {

					if(entities[0].x > this.x + this.w)
						this.accel = this.accelProp;
					 else if(entities[0].x < this.x)
						this.accel = -this.accelProp;
					 else
						this.accel = 0;

					this.updateBiped();
				}
				this.animate = function() {
					this.animate2Frame(4,5,6,7);
				}
				break;
		}

	}
}

var conditions = []; // an array of conditions yet to be met that will be deleted once fulfilled (or failed)
var entities = [new entity(
	6,8,
	50,0,
	0,0,
	0.25,0.06,
	0.075,-4,
	2,30,
	0
),
new entity(
	12,16,
	50,0,
	0,0,
	0.25,0.06,
	0.075,-4,
	2,30,
	1
)];
var tiles = [new tile(
	1,19,
	27,3,
	0
),
new tile(
	3,14,
	8,2,
	0
),
new tile(
	11,15,
	4,1,
	1
)];

entities[0].keyW = entities[0].keyA = entities[0].keyS = entities[0].keyD = false;

/// controls ///

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(e) {
if(!world.paused) {
	if(e.keyCode === 68 || e.keyCode === 39) {
		entities[0].accel = entities[0].accelProp;
		entities[0].keyD = true;
		entities[0].keyA = false;
	} else if(e.keyCode === 65 || e.keyCode === 37) {
		entities[0].accel = -entities[0].accelProp;
		entities[0].keyA = true;
		entities[0].keyD = false;
	}

	if((e.keyCode === 87 || e.keyCode === 38) && !entities[0].keyW) {
		conditions.push({ /// pushes a coyote jump test
			coyote: 0,
			max: 7,
			check: function() {
				if(entities[0].onG && this.coyote < this.max) {
					entities[0].spY = entities[0].jump;
					return true;
				}
				this.coyote++;
				if(this.coyote >= this.max) {
					return true;
				}
			}
		});
		entities[0].keyW = true;
	}
}

	if(e.keyCode === 80) {
		world.paused = !world.paused;
		console.log('paused:', world.paused);
	}

}

function keyUp(e) {

	if((e.keyCode === 68 || e.keyCode === 39) && !entities[0].keyA) {
		entities[0].accel = 0;
		entities[0].keyD = false;
	} else if((e.keyCode === 65 || e.keyCode === 37) && !entities[0].keyD) {
		entities[0].accel = 0;
		entities[0].keyA = false;
	}

	if(e.keyCode === 87 || e.keyCode === 38) {
		entities[0].keyW = false;
	}

}

/// logic ///

function updateEntities() {
	for(i = 0; i < entities.length; i++) {

	entities[i].update();
	entities[i].animate();

	}
}

function updateConditions() {
	for(i = 0; i < conditions.length; i++) {
		if(conditions[i].check())
			conditions.splice(i,1);
	}
}

function updateCollision() { /// not to be confused with updateConditions()
	for(i = 0; i < entities.length; i++) {

		if(entities[i].x <= -entities[i].w && entities[i].preX >= -entities[i].w) {
			entities[i].x = W + entities[i].w;
			entities[i].preX = entities[i].x;
		} else if(entities[i].x >= W + entities[i].w && entities[i].preX <= W + entities[i].w) {
			entities[i].x = -entities[i].w;
			entities[i].preX = entities[i].x;
		}


		if(entities[i].collideRight()) {
			entities[i].x = tiles[j].x - entities[i].w;
			entities[i].spX = 0;
		} else if(entities[i].collideLeft()) {
			entities[i].x = tiles[j].x + tiles[j].w;
			entities[i].spX = 0;
		}

		if(entities[i].collideTop()) {
			entities[i].y = tiles[j].y - entities[i].h;
			entities[i].onG = true;
			entities[i].spY = 0;
		} else if(entities[i].collideBottom()) {
			entities[i].y = tiles[j].y + tiles[j].h;
			entities[i].spY = 0;
		} else {
			if(entities[i].onG && entities[i].type == type.entity[0]) {
				conditions.push({
					coyote: 0,
					max: 6,
					check: function() {
						if(this.coyote < this.max && entities[0].keyW) {
							entities[0].spY = entities[0].jump;
							return true;
						}
						this.coyote++;
						if(this.coyote >= this.max)
							return true;
					}
				});
			}
			entities[i].onG = false;
		}
	}
}

function update() {
	world.tick++;
	updateConditions();
	updateEntities();
	updateCollision();
}

function render() {
		ctx.clearRect(0,0,W,H);
		ctx.fillStyle = world.background;
		ctx.fillRect(0,0,W,H);

	for(i = 0; i < tiles.length; i++) {
		ctx.fillStyle = ctx.createPattern(tiles[i].img, '');
		ctx.fillRect(tiles[i].x,tiles[i].y,tiles[i].w,tiles[i].h);
	}
		
	for(i = 1; i < entities.length; i++) {
		ctx.drawImage(entities[i].img,Math.round(entities[i].x),Math.round(entities[i].y),entities[i].w,entities[i].h);
	}
		ctx.drawImage(entities[0].img,Math.round(entities[0].x),Math.round(entities[0].y),entities[0].w,entities[0].h);

}

/// game loop ///

function loop() {
	if(!world.paused) {
		update();
		render();
	}
		requestAnimationFrame(loop);
}

loop();
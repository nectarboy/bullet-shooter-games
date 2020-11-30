var c = document.createElement('canvas');
document.body.appendChild(c);
	var W = 228;
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

var i;

/// sprites ///

function newImg(path) {
	var x = new Image();
		x.src = path;
	return x;
}

var sprite = [];	
	sprite[0] = newImg('data/sprites/blu0.png');
	sprite[1] = newImg('data/sprites/blu1.png');
	sprite[2] = newImg('data/sprites/blu2.png');
	sprite[3] = newImg('data/sprites/blu3.png');

/// objects ///

var type = ['player'];

class entity {
	constructor(w,h,x,y,spx,spy,grav,accelProp,frict,jump,maxSp,maxHp,type) {
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
		this.type = type;
		this.alive = true;
		this.counter = 0;

		this.imgR = sprite[0];
		this.imgL = sprite[2];
		this.animate = function() {

			if(!this.onG) {
				this.imgR = sprite[1];
				this.imgL = sprite[3];
				this.counter = 0;
			} else if(this.accel != 0) {
				if(this.counter % 10 == 0) {
					if(this.imgR == sprite[0] || this.imgL == sprite[2]) {
						this.imgR = sprite[1];
						this.imgL = sprite[3];
					} else {
						this.imgR = sprite[0];
						this.imgL = sprite[2];
					}
				}
			} else {
				this.imgR = sprite[0];
				this.imgL = sprite[2];
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

		this.img = this.imgR;

	}
}

var player = new entity(
	8,8,
	0,0,
	0,0,
	0.25,0.05,
	0.06,-4,
	2,30,
	type[0]
);

player.keyW = player.keyA = player.keyS = player.keyD = false;

var conditions = []; // an array of conditions yet to be met that will be deleted once fulfilled (or failed)

/// controls ///

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(e) {
	if(e.keyCode === 68 || e.keyCode === 39) {
		player.accel = player.accelProp;
		player.keyD = true;
		player.keyA = false;
	} else if(e.keyCode === 65 || e.keyCode === 37) {
		player.accel = -player.accelProp;
		player.keyA = true;
		player.keyD = false;
	}

	if((e.keyCode === 87 || e.keyCode === 38) && !player.keyW) {
		conditions.push({ /// pushes a coyote jump test
			coyote: 0,
			max: 7,
			check: function() {
				if(player.onG && this.coyote < this.max) {
					player.spY = player.jump;
					return true;
				}
				this.coyote++;
				if(this.coyote >= this.max) {
					return true;
				}
			}
		});
		player.keyW = true;
	}

	if(e.keyCode === 80) {
		world.paused = !world.paused;
		console.log('paused:', world.paused);
	}
}

function keyUp(e) {
	if((e.keyCode === 68 || e.keyCode === 39) && !player.keyA) {
		player.accel = 0;
		player.keyD = false;
	} else if((e.keyCode === 65 || e.keyCode === 37) && !player.keyD) {
		player.accel = 0;
		player.keyA = false;
	}

	if(e.keyCode === 87 || e.keyCode === 38) {
		player.keyW = false;
	}
}

/// logic ///

function updatePlayer() {
	player.preX = player.x;
	player.preY = player.y;

	if(player.accel != 0) {
		player.spX += player.accel;
		if(player.spX >= player.maxSp) {
			player.spX = player.maxSp;
		} else if(player.spX <= -player.maxSp) {
			player.spX = -player.maxSp;
		}
	} else if(player.spX > 0 && player.onG) {
		player.spX -= player.frict;
		if(player.spX <= 0)
			player.spX = 0;
	} else if(player.spX < 0 && player.onG) {
		player.spX += player.frict;
		if(player.spX >= 0)
			player.spX = 0;
	}

	player.spY += player.grav;

	player.x = player.x + player.spX;
	player.y = player.y + player.spY;

	if(player.y >= 150) {
		player.y = 150;
		player.onG = true;
		player.spY = 0;
	} else {
		player.onG = false;
	}

	player.animate();
}

function updateConditions() {
	for(i = 0; i < conditions.length; i++) {
		if(conditions[i].check())
			conditions.splice(i,1);
	}
}

function update() {
	world.tick++;
	updateConditions();
	updatePlayer();
}

function render() {
		ctx.clearRect(0,0,W,H);
		ctx.fillStyle = world.background;
		ctx.fillRect(0,0,W,H);

	ctx.drawImage(player.img,Math.round(player.x),Math.round(player.y),player.w,player.h);

	ctx.fillStyle = '#000';
	ctx.fillRect(0,158,W,H);
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
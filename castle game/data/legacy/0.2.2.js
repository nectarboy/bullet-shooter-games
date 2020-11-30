var c = document.createElement('canvas');
document.body.appendChild(c);
	const W = 232;
	const H = 180;
c.width = W;
c.height = H;
	c.style.width = W*4 + 'px';
	c.style.height = H*4 + 'px';
	c.style.imageRendering = 'pixelated';
var ctx = c.getContext('2d');
	ctx.imageSmoothingEnabled = false;

var world = {
	fps: 0,
	tick: 0,
	background: '#2e2e2e',
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
	sprite[0] = newImg('sprites/blu0.png'); // player
	sprite[1] = newImg('sprites/blu1.png');
	sprite[2] = newImg('sprites/blu2.png');
	sprite[3] = newImg('sprites/blu3.png');
	sprite[4] = newImg('sprites/blu4.png');

	sprite[5] = newImg('sprites/skeleton0.png'); // skeleton
	sprite[6] = newImg('sprites/skeleton1.png');
	sprite[7] = newImg('sprites/skeleton2.png');
	sprite[8] = newImg('sprites/skeleton3.png');
	sprite[9] = newImg('sprites/skeleton4.png');

	sprite[10] = newImg('sprites/attack0.png'); // sword swing
	sprite[11] = newImg('sprites/attack1.png');
	sprite[12] = newImg('sprites/attack2.png');
	sprite[13] = newImg('sprites/attack3.png');
	sprite[14] = newImg('sprites/attack4.png');
	sprite[15] = newImg('sprites/attack5.png');

	sprite[16] = newImg('sprites/green0.png'); // green ghost
	sprite[17] = newImg('sprites/green1.png');
	sprite[18] = newImg('sprites/green2.png');
	sprite[19] = newImg('sprites/green3.png');

var tileSprite = [];
	tileSprite[0] = newImg('sprites/tile0.png');
	tileSprite[1] = newImg('sprites/tile1.png');
	tileSprite[2] = newImg('sprites/tile2.png');
	tileSprite[3] = newImg('sprites/tile3.png');

	tileSprite[4] = newImg('gui/hp0.png');
	tileSprite[5] = newImg('gui/hp1.png');

/// objects ///

var type = {
	entity: ['player', 'skeleton', 'green_phantom'],
	tile: ['solid', 'semi_solid'],
	effect: ['attack']
}

class tile {

	constructor(w,h,x,y,tileType) {
		this.w = w*8;
		this.h = h*8;
		this.x = x*8;
		this.y = y*8;
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
class effect {

	updateNorm() {
		this.x += this.spX;
		this.y += this.spY;
	}

	animate3FrameOnce(a0,a1,a2, a3,a4,a5) {
		if(this.counter >= 8) {
			this.imgR = sprite[a2];
			this.imgL = sprite[a5];
		} else if(this.counter >= 4) {
			this.imgR = sprite[a1];
			this.imgL = sprite[a4];
		} else {
			this.imgR = sprite[a0];
			this.imgL = sprite[a3];
		}
		this.counter++;

		if(this.lookingRight)
			this.img = this.imgR;
		else
			this.img = this.imgL;
	}

	constructor(w,h,x,y,spX,spY,effType) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.spX = spX;
		this.spY = spY;
		this.type = type.effect[effType];

		this.counter = 0;
		this.img = this.imgR;
		this.lookingRight = true;

		switch(this.type) {
			case type.effect[0]:
				this.animate = function() {
					this.animate3FrameOnce(10,11,12, 13,14,15);
				}
				break;
		}
		this.update = function() {
			this.updateNorm();
			if(this.counter >= 35) {
				effects.splice(effects.indexOf(this),1);
			}
		}
	}
}

function die(ent) {
	if(ent.alive) {
		ent.hp = 0;
		ent.alive = false;
		if(ent.type != type.entity[0]) {
			var index = entities.indexOf(ent);
			conditions.push({
				count: 0,
				max: 55,
				check: function() {
					this.count++;
					if(this.count >= this.max) {
						if(!ent.alive) {
							entities.splice(index,1);
							return true;
						}
					}
				}
			});
		}
	}
}

class biped {

	updateBiped() {

		if(!this.alive)
			this.accel = 0;

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

		this.preX = this.x;
		this.preY = this.y;
		this.x = this.x + this.spX;
		this.y = this.y + this.spY;

		this.spY += this.grav;

		if(this.accel > 0)
			this.lookingRight = true;
		else if(this.accel < 0)
			this.lookingRight = false;
	}
	jumpUp(height = this.jump) {
		if(this.alive) {
			this.spY = height;
			this.spX = this.x - this.preX;
			console.log(this.type, ': hup!');
		}
	}
	seekPlayer(num = 1) {
		if(this.alive) {
		if(entities[0].x >= this.x - this.radius*num - entities[0].w && entities[0].x <= this.x + this.radius*num + this.w)
			return true;
		}
	}
	damage(hitter) {
		if(hitter.alive && !this.invincible) {
			var damage = Math.floor(Math.random() * 2 + (hitter.dmg - 1));
			if(damage < 1)
				damage = 1;
				this.hp -= damage;
				if(hitter.lookingRight) {
					this.spX += hitter.kb;
					hitter.spX = -hitter.kb*0.5;
				} else {
					this.spX -= hitter.kb;
					hitter.spX = hitter.kb*0.5;
				}
				this.spY = -2;

				this.invincible = true;
				var ent = this;
				conditions.push({
					num: 0,
					max: ent.type != type.entity[0] ? 7 : 25,
					check: function() {
						this.num++
						if(this.num >= this.max) {
							ent.invincible = false;
							return true;
						}
					}
				});
			if(this.hp <= 0) {
				die(this);
			}
		}
	}
	animate2Frame(a0,a1,a2,a3,a4) {
	if(this.alive) {
	
		if(!this.onG) {
			this.imgR = sprite[a1];
			this.imgL = sprite[a3];
			this.counter = 0;
		} else if(this.accel != 0) {
			if(this.counter % 8 == 0) {
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
	} else
		this.imgR = this.imgL = sprite[a4];
	
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
				if(this.preY >= tiles[j].y + tiles[j].h && this.y < tiles[j].y + tiles[j].h &&
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
	checkOffscreen() {
		if(this.x <= -this.w && this.preX >= -this.w) {
			this.x = W;
			this.preX = this.x;
		} else if(this.x >= W && this.preX <= W + this.w) {
			this.x = -this.w;
			this.preX = this.x;
		}
	}
	updateCollision() { /// not to be confused with updateConditions()
	if(this.alive) {
		if(this.collideTop()) {
			this.y = tiles[j].y - this.h;
			this.onG = true;
			this.spY = 0;
		} else if(this.collideBottom()) {
			this.y = tiles[j].y + tiles[j].h;
			this.spY = 0;
		} else {
			if(this.onG && this.type == type.entity[0]) {
				conditions.push({
					coyote: 0,
					max: 6,
					check: function() {
						if(entities[0].keyW && entities[0].spY >=0) {
							entities[0].jumpUp(); 
							return true;
						}
						this.coyote++;
						if(this.coyote >= this.max)
							return true;
					}
				});
			}
			this.onG = false;
		}

		if(this.collideRight()) {
			this.x = tiles[j].x - this.w;
			this.spX = 0;
		} else if(this.collideLeft()) {
			this.x = tiles[j].x + tiles[j].w;
			this.spX = 0;
		}

	} else
		this.onG = false;
	}


	constructor(w,h,x,y,spx,spy,grav,accelProp,frict,jump,maxSp,maxHp,entType,radius,dmg,kb) {
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
		this.radius = radius;
		this.dmg = dmg;
		this.kb = kb;

		this.img = this.imgR;
		this.lookingRight = true;
		this.invincible = false;

		switch(this.type) {
			case(type.entity[0]):
				this.update = function() {
					this.updateBiped();
					this.checkOffscreen();
					this.updateCollision();
				}
				this.animate = function() {
					this.animate2Frame(0,1,2,3,4);
				}
				this.attack = function() {
				if(this.alive) {
					var sword = {
						w: 12,
						h: 12
					}

					var ent = this;
					var eff = new effect(8,8,0,0,0,0,0);
							eff.update = function() {
								if(ent.lookingRight) {
									eff.lookingRight = true;
									eff.x = ent.x + ent.w;
								} else {
									eff.lookingRight = false;
									eff.x = ent.x - eff.w;
								}

								eff.y = ent.y;

								if(this.counter >= 15) {
									effects.splice(effects.indexOf(this),1);
								}
							}
							effects.push(eff);

					conditions.push({
						count: 0,
						max: 13,
						check: function() {

							sword.y = ent.y - (sword.h - ent.h);
							if(ent.lookingRight)
								sword.x = ent.x + ent.w;
							else
								sword.x = ent.x - sword.w;

							for(i = 1; i < entities.length; i++) {
								if(sword.x >= entities[i].x - sword.w && sword.x <= entities[i].x + entities[i].w &&
								sword.y >= entities[i].y - sword.h && sword.y <= entities[i].y + entities[i].h) {
									entities[i].damage(ent);
									return true;
								}
							}

								this.count++;
								if(this.count >= this.max) {
									console.log('ended');
									return true;
								}
						}
					});
				}
				}
				break;
			case(type.entity[1]):
				this.update = function() {
					if(this.seekPlayer()) {
						if(this.onG && this.seekPlayer(0.15) && entities[0].y < this.y - 15)
							this.jumpUp();

						if(entities[0].x > this.x + this.w)
							this.accel = this.accelProp;
						 else if(entities[0].x < this.x - entities[0].w)
							this.accel = -this.accelProp;
						 else
							this.accel = 0;
					} else {
						this.accel = 0;
					}

					if(entities[0].x >= this.x - entities[0].w && entities[0].x <= this.x + this.w &&
					entities[0].y >= this.y - entities[0].h && entities[0].y <= this.y + this.h) {
						entities[0].damage(this);
					}

					this.updateBiped();
					this.checkOffscreen();
					this.updateCollision();
				}
				this.animate = function() {
					this.animate2Frame(5,6,7,8,9);
				}
				break;
		}

	}
}

class phantom {

	updatePhantom() {

		if(!this.alive)
			this.accel = 0;

		if(this.accelX != 0) {
			this.spX += this.accelX;
			if(this.spX >= this.maxSp) {
				this.spX = this.maxSp;
			} else if(this.spX <= -this.maxSp) {
				this.spX = -this.maxSp;
			}
		}

		if(this.accelY != 0) {
			this.spY += this.accelY;
			if(this.spY >= this.maxSp) {
				this.spY = this.maxSp;
			} else if(this.spY <= -this.maxSp) {
				this.spY = -this.maxSp;
			}
		}

		this.preX = this.x;
		this.preY = this.y;
		this.x = this.x + this.spX;
		this.y = this.y + this.spY;

		if(this.accelX > 0)
			this.lookingRight = true;
		else if(this.accelX < 0)
			this.lookingRight = false;
	}

	animate2Frame(a0,a1,a2,a3) {
	if(this.alive) {
	
		if(this.accel != 0) {
			if(this.counter % 20 == 0) {
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
	} else {
		this.imgR = sprite[a1];
		this.imgL = sprite[a3];
	}
	
		if(this.lookingRight)
			this.img = this.imgR;
		else
			this.img = this.imgL;
		this.counter++;
	}

	seekPlayer(num = 1) {
		if(this.alive) {
		if(entities[0].x >= this.x - this.radius*num - entities[0].w && entities[0].x <= this.x + this.radius*num + this.w)
			return true;
		}
	}
	damage(hitter) {
		if(hitter.alive && !this.invincible) {
			var damage = Math.floor(Math.random() * 2 + (hitter.dmg - 1));
			if(damage < 1)
				damage = 1;
				this.hp -= damage;
				if(hitter.lookingRight) {
					this.spX += hitter.kb;
					hitter.spX = -hitter.kb*0.5;
				} else {
					this.spX -= hitter.kb;
					hitter.spX = hitter.kb*0.5;
				}
				this.spY = -2;

				this.invincible = true;
				var ent = this;
				conditions.push({
					num: 0,
					max: ent.type != type.entity[0] ? 7 : 25,
					check: function() {
						this.num++
						if(this.num >= this.max) {
							ent.invincible = false;
							return true;
						}
					}
				});
			if(this.hp <= 0) {
				die(this);
			}
		}
	}

	constructor(w,h,x,y,spx,spy,accelProp,frict,maxSp,maxHp,entType,radius,dmg,kb) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.preX = x;
		this.preY = y;
		this.spX = spx;
		this.spY = spy;
		this.accelProp = accelProp;
		this.accelX = 0;
		this.accelY = 0;
		this.frict = frict;
		this.maxSp = maxSp;
		this.maxHp = maxHp;
		this.hp = maxHp;
		this.type = type.entity[entType];
		this.alive = true;
		this.counter = 0;
		this.radius = radius;
		this.dmg = dmg;
		this.kb = kb;

		this.img = this.imgR;
		this.lookingRight = true;
		this.invincible = false;

		switch(this.type) {
			case type.entity[2]:
				this.update = function() {
					if(this.seekPlayer()) {
						if(entities[0].x > this.x + this.w)
							this.accelX = accelProp;
						else if(entities[0].x < this.x - entities[0].w)
							this.accelX = -accelProp;
						else
							this.accelX = 0;

						if(entities[0].y > this.y + this.h)
							this.accelY = accelProp;
						else if(entities[0].y < this.y - entities[0].h)
							this.accelY = -accelProp;
						else
							this.accelY = 0;
					} else {
						this.accelX = 0;
						this.accelY = 0;

						if(this.spX > 0) {
							this.spX -= this.frict;
							if(this.spX <= 0)
								this.spX = 0;
						} else if(this.spX < 0) {
							this.spX += this.frict;
							if(this.spX >= 0)
								this.spX = 0;
						}

						if(this.spY > 0) {
							this.spY -= this.frict;
							if(this.spY <= 0)
								this.spY = 0;
						} else if(this.spY < 0) {
							this.spY += this.frict;
							if(this.spY >= 0)
								this.spY = 0;
						}
					}

					if(entities[0].x >= this.x - entities[0].w && entities[0].x <= this.x + this.w &&
					entities[0].y >= this.y - entities[0].h && entities[0].y <= this.y + this.h) {
						entities[0].damage(this);
					}

					this.updatePhantom();
				}
				this.animate = function() {
					this.animate2Frame(16,17,18,19);
				}
				break;
		}

	}
}

var conditions = []; // an array of conditions yet to be met that will be deleted once fulfilled (or failed)
var entities = [new biped(
	6,8,
	50,0,
	0,0,
	0.25,0.06,
	0.075,-4,
	2,40,

	0,undefined,
	7,1.6
),
new biped(
	6,8,
	210,50,
	0,0,
	0.2,0.05,
	0.07,-3,
	2.25,30,

	1,115,
	6,1
),
new phantom(
	8,8,
	90,70,
	0,0,
	0.03,0.03,
	0.7,25,
	2,

	130,8,0.7

)];
var tiles = [new tile(
	27,3,
	1,19,
	0
),
new tile(
	5,2,
	6,14,
	0
),
new tile(
	4,1,
	11,15,
	1
)];
var effects = [];

entities[0].keyW = entities[0].keyA = entities[0].keyS = entities[0].keyD = entities[0].keyL = false;


var gui = [];
gui[0] = {
		w: 32,
		h: 8,
		x: 1,
		y: 3,
		img: tileSprite[4]
	};
gui[1] = {
		w: entities[0].maxHp/(gui[0].w - 1),
		h: gui[0].h,
		x: gui[0].x + 1,
		y: gui[0].y,
		img: tileSprite[5]
	};

/// controls ///

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(e) {
if(!world.paused) {
	if(e.keyCode == 68 || e.keyCode == 39) {
		entities[0].accel = entities[0].accelProp;
		entities[0].keyD = true;
		entities[0].keyA = false;
	} else if(e.keyCode == 65 || e.keyCode == 37) {
		entities[0].accel = -entities[0].accelProp;
		entities[0].keyA = true;
		entities[0].keyD = false;
	}

	if(e.keyCode == 16 && !entities[0].keyL) {
		entities[0].keyL = true;
		entities[0].attack();
	}

	if((e.keyCode == 87 || e.keyCode == 38) && !entities[0].keyW) {
		conditions.push({ /// pushes a coyote jump test
			coyote: 0,
			max: 7,
			check: function() {
				if(entities[0].onG) {
					entities[0].jumpUp();
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

	if(e.keyCode == 16 && entities[0].keyL) {
		entities[0].keyL = false;
	}

	if(e.keyCode === 87 || e.keyCode === 38) {
		entities[0].keyW = false;
	}

}

/// logic ///

function updateEntities() {
	for(i = 0; i < entities.length; i++) {
		entities[i].update();
		if(entities.length > 0)
			entities[i].animate();
	}
}
function updateEffects() {
	for(i = 0; i < effects.length; i++) {
		effects[i].update();
		if(effects.length > 0)
			effects[i].animate();
	}
}
function updateConditions() {
	for(k = 0; k < conditions.length; k++) {
		if(conditions[k].check())
			conditions.splice(k,1);
	}
}

function update() {
	world.tick++;
	updateConditions(); // might be better?? idk (it removes 1 frame jump delay)
	updateEntities();
	//updateConditions(); might be better to do it after updating entities ¯\_(ツ)_/¯
	updateEffects();
}

function render() {
		ctx.clearRect(0,0,W,H);
		ctx.fillStyle = world.background;
		ctx.fillRect(0,0,W,H);

	function drawEnt(num) {
		if(entities[num].invincible) {
			if(world.tick % 2 == 0)
				ctx.drawImage(entities[num].img, entities[num].x, entities[num].y, entities[num].w, entities[num].h);
		} else {
			ctx.drawImage(entities[num].img, entities[num].x, entities[num].y, entities[num].w, entities[num].h);
		}
	}
 
	for(i = 0; i < tiles.length; i++) {
		ctx.fillStyle = ctx.createPattern(tiles[i].img, '');
		ctx.fillRect(tiles[i].x,tiles[i].y,tiles[i].w,tiles[i].h);
	}

	for(i = 0; i < effects.length; i++) {
		ctx.drawImage(effects[i].img,Math.round(effects[i].x),Math.round(effects[i].y),effects[i].w,effects[i].h);
	}
		
	for(i = 1; i < entities.length; i++) {
		drawEnt(i);
	}
		drawEnt(0);

	ctx.drawImage(gui[1].img, gui[1].x, gui[1].y, entities[0].hp/gui[1].w, gui[1].h);

	ctx.drawImage(gui[0].img, gui[0].x, gui[0].y, gui[0].w, gui[0].h);

}

/// game loop ///

function loop() {
	setTimeout(function() {
	if(!world.paused) {
		update();
		render();
	}
		requestAnimationFrame(loop);
	}, world.fps);
}

loop();
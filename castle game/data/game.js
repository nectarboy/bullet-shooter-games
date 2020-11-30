var c = document.createElement('canvas');
document.body.appendChild(c);
	const W = 232;
	const H = 180;
c.width = W;
c.height = H;
	c.style.width = W*4 + 'px';
	c.style.height = H*4 + 'px';
	c.style.imageRendering = 'pixelated';
var ctx = c.getContext('2d', {alpha:false});
	ctx.imageSmoothingEnabled = false;

var world = {
	fps: 0,
	tick: 0,
	background: '#2e2e2e',
	paused: false,
	godMode: true // turn this to true for the ability to place blocks and be invincible
};

var i, j, k;

/// objects ///

var type = {
	entity: ['knight', 'skeleton', 'greenPhantom', 'greenSlime'],
	tile: ['solid', 'semi-solid', 'chest'],
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
			case type.tile[2]:
				this.img = tileSprite[6];
				this.closed = true;
				this.openChest = function() {
					if(this.closed) {
						this.closed = false;
						this.img = tileSprite[7];
						// wip
					}
				}
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
		ent.hp = 0;
	if(ent.alive) {
		ent.alive = false;
		if(ent.type != type.entity[0]) {
			conditions.push({
				count: 0,
				max: 55,
				check: function() {
					this.count++;
					if(this.count >= this.max) {
						//if(!ent.alive) { // Is this condition causing the bug? probably not and it aint needed
							var index = entities.indexOf(ent);
							entities.splice(index,1);
							return true;
						//}
					}
				}
			});
		}
	}
}

function damage(hitter, victim) {
	if(hitter.alive && !victim.invincible && !world.godMode) {
		var damage = Math.floor(Math.random() * 2 + (hitter.dmg - 1));
		if(damage < 1)
			damage = 1;
			victim.hp -= damage;
			if(hitter.lookingRight) {
				victim.spX += hitter.kb;
				hitter.spX = -hitter.kb*0.5;
			} else {
				victim.spX -= hitter.kb;
				hitter.spX = hitter.kb*0.5;
			}
			victim.spY = -2;

			victim.invincible = true;
			conditions.push({
				num: 0,
				max: victim.type != type.entity[0] ? 13 : 30,
				check: function() {
					this.num++
					if(this.num >= this.max) {
						victim.invincible = false;
						return true;
					}
				}
			});
		if(victim.hp <= 0) {
			die(victim);
		}
	}
}

function spawnEntity() { // At first i thought about hardcoding all the properties in... imaaagine lmaoo.. maybe idk?
	spawnEntity.skeleton = function(w,h,x,y,grav,accelProp,frict,jump,maxSp,maxHp,radius,dmg,kb) {
		obj = new biped(
			w,h,
			x,y,
			0,0,
			grav,accelProp,
			frict,jump,
			maxSp,maxHp,
			1,

			radius,dmg,kb
		);
		obj.update = function() {
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

			if(collideTile(entities[0],this)) {
				damage(this, entities[0]);
			}

			this.updateBiped();
			this.updateCollision();
		}
		obj.animate = function() {
			this.animate2Frame(5,6,7,8,9);
		}
		entities.push(obj);
	}

	spawnEntity.greenPhantom = function(w,h,x,y,accelProp,frict,maxSp,maxHp,radius,dmg,kb) {
		obj = new phantom(
			w,h,
			x,y,
			0,0,
			accelProp,frict,
			maxSp,maxHp,
			2,
		
			radius,dmg,kb
		);
		obj.update = function() {
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

			if(collideTile(entities[0],this)) {
				damage(this, entities[0]);
			}

			this.updatePhantom();
		}
		obj.animate = function() {
			this.animate2Frame(16,17,18,19);
		}
		entities.push(obj);
	}

	spawnEntity.greenSlime = function(w,h,x,y,grav,jump,frict,maxSp,maxHp,dmg,kb,coolDown) {
		var obj = new slime(w,h,x,y,grav,jump,frict,maxSp,maxHp,3,dmg,kb,coolDown)

		obj.update = function() {
			this.hostileBehavior(entities[0]);
			this.updateSlime();
			this.updateCollision();
		}
		obj.animate = function() {
			this.animate2Frame(20,20,21,21,21);
		}

		entities.push(obj);
	}

}

function collideTile(obj, tile) {
	return (obj.x >= tile.x - obj.w && obj.x <= tile.x + tile.w &&
	obj.y >= tile.y - obj.h && obj.y <= tile.y + tile.h);
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

		if(this.x <= -this.w && this.preX >= -this.w) {
			this.x = W;
		} else if(this.x >= W && this.preX <= W + this.w) {
			this.x = -this.w;
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
		if(entities[0].x >= this.x-this.radius*num-entities[0].w && entities[0].x <= this.x+this.radius*num+this.w)
			return true;
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

	collideTop(rect) {
			if(rect.type == type.tile[0] || rect.type == type.tile[1]) {
				if(this.preY <= rect.y - this.h && this.y >= rect.y - this.h &&
				this.x > rect.x - this.w && this.x < rect.x + rect.w)
					return true;
			}
	}
	collideBottom(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preY >= rect.y + rect.h && this.y <= rect.y + rect.h &&
				this.x > rect.x - this.w && this.x < rect.x + rect.w)
					return true;
			}
	}
	collideRight(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preX <= rect.x - this.w && this.x >= rect.x - this.w &&
				this.y > rect.y - this.h && this.y < rect.y + rect.h)
					return true;
			}
	}
	collideLeft(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preX >= rect.x + rect.w && this.x <= rect.x + rect.w &&
				this.y > rect.y - this.h && this.y < rect.y + rect.h)
					return true;
			}
	}
	updateCollision() { /// not to be confused with updateConditions()
		this.onG = false;
	if(this.alive) {
		for(j = 0; j < tiles.length; j++) {

			if(this.collideTop(tiles[j])) {
				this.y = tiles[j].y - this.h;
				this.onG = true;
				this.spY = 0;
			} else if(this.collideBottom(tiles[j])) {
				this.y = tiles[j].y + tiles[j].h + 1;
				this.spY = 0;
			} else

			if(this.collideRight(tiles[j])) {
				this.x = tiles[j].x - this.w;
				this.spX = 0;
			} else if(this.collideLeft(tiles[j])) {
				this.x = tiles[j].x + tiles[j].w;
				this.spX = 0;
			}

		}
	}
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
		if(entities[0].x >= this.x-this.radius*num-entities[0].w && entities[0].x <= this.x+this.radius*num+this.w)
			return true;
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

	}
}

class slime {

	updateSlime() {

		if(this.spX > 0 && this.onG) {
			this.spX -= this.frict;
			if(this.spX <= 0)
				this.spX = 0;
		} else if(this.spX < 0 && this.onG) {
			this.spX += this.frict;
			if(this.spX >= 0)
				this.spX = 0;
		}

		if(this.x <= -this.w && this.preX >= -this.w) {
			this.x = W;
		} else if(this.x >= W && this.preX <= W + this.w) {
			this.x = -this.w;
		}

		this.preX = this.x;
		this.preY = this.y;
		this.x += this.spX;
		this.y += this.spY;

		this.spY += this.grav;
	}
	jumpUp(height = this.jump, length) {
		if(this.alive) {
			this.spY = this.jump;
			this.spX = length;
			if(this.spX >= this.maxSp)
				this.spX = this.maxSp;
			else if(this.spX <= -this.maxSp)
				this.spX = -this.maxSp;
			console.log(this.type, ': hup!');
		}
	}
	animate2Frame(a0,a1,a2,a3,a4) {
	if(this.alive) {
	
		this.imgR = sprite[a0];
		this.imgL = sprite[a2];

	}
	
		if(this.lookingRight)
			this.img = this.imgR;
		else
			this.img = this.imgL;
		this.counter++;

	}

	collideTop(rect) {
			if(rect.type == type.tile[0] || rect.type == type.tile[1]) {
				if(this.preY <= rect.y - this.h && this.y >= rect.y - this.h &&
				this.x > rect.x - this.w && this.x < rect.x + rect.w)
					return true;
			}
	}
	collideBottom(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preY >= rect.y + rect.h && this.y < rect.y + rect.h &&
				this.x > rect.x - this.w && this.x < rect.x + rect.w)
					return true;
			}
	}
	collideRight(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preX <= rect.x - this.w && this.x >= rect.x - this.w &&
				this.y > rect.y - this.h && this.y < rect.y + rect.h)
					return true;
			}
	}
	collideLeft(rect) {
			if(rect.type == type.tile[0]) {
				if(this.preX >= rect.x + rect.w && this.x <= rect.x + rect.w &&
				this.y > rect.y - this.h && this.y < rect.y + rect.h)
					return true;
			}
	}
	updateCollision() { /// not to be confused with updateConditions()
		this.onG = false;
	if(this.alive) {
		for(j = 0; j < tiles.length; j++) {

			if(this.collideRight(tiles[j])) {
				this.x = tiles[j].x - this.w;
			} else if(this.collideLeft(tiles[j])) {
				this.x = tiles[j].x + tiles[j].w;
			} else

			if(this.collideTop(tiles[j])) {
				this.y = tiles[j].y - this.h;
				this.onG = true;
				this.spY = 0;
			} else if(this.collideBottom(tiles[j])) {
				this.y = tiles[j].y + tiles[j].h;
				this.spY = 0;
			}

		}
	}
	}

	hostileBehavior(ent) {
		if(ent.x < this.x - ent.w)
			this.lookingRight = false;
		else if(ent.x > this.x + this.w)
			this.lookingRight = true;

		if(this.onG) {
			if(this.counter >= this.coolDown)
				this.jumpUp(this.jump, (ent.x - this.x)*0.04);
		} else
			this.counter = 0;

		if(collideTile(this,ent))
			damage(this,ent);

		this.attackCounter++;
	}

	constructor(w,h,x,y,grav,jump,frict,maxSp,maxHp,entType,dmg,kb,coolDown) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.spX = 0;
		this.spY = 0;
		this.grav = grav;
		this.jump = jump;
		this.frict = frict;
		this.maxSp = maxSp;
		this.maxHp = maxHp;
		this.hp = this.maxHp;
		this.type = type.entity[entType];
		this.dmg = dmg;
		this.kb = kb;
		this.attackCounter = 0;
		this.coolDown = coolDown;

		this.accel = 0;

		this.alive = true;
		this.lookingRight = true;
		this.counter = 0;
		this.onG = false;
	}
}

var conditions = []; // an array of conditions yet to be met that will be deleted once fulfilled (or failed)
var entities = [new biped(
	6,8,
	50,0,
	0,0,
	0.25,0.06,
	0.075,-3.3,
	2,40,

	0,undefined,
	7,1.7
)];
	entities[0].update = function() {
		this.updateBiped();
		var wasOnG = this.onG
		this.updateCollision();
		if(wasOnG && !this.onG && this.spY > 0 && this.type == type.entity[0]) { // coyote jumping is back!
			this.canJump = true;
			var ent = this;
			conditions.push({
				coyote: 0,
				max: 6,
				check: function() {
					if(this.coyote >= this.max) {
						delete ent.canJump;
						return true;
					}
					this.coyote++;
				}
			});
		}
	};
	entities[0].animate = function() {
		this.animate2Frame(0,1,2,3,4); //0,1,2,3,4
	};
	entities[0].attack = function() {
	//if(!this.alive) return
		var sword = {
			w: 12,
			h: 12
		}

		var ent = this;
		var eff = new effect(8,8,0,0,0,0,0);
		if(ent.lookingRight) {
			eff.lookingRight = true;
			eff.x = ent.x + ent.w;
		} else {
			eff.lookingRight = false;
			eff.x = ent.x - eff.w;
		}

		eff.y = ent.y;

				eff.update = function() {
					if(ent.lookingRight) {
						this.lookingRight = true;
						this.x = ent.x + ent.w;
					} else {
						this.lookingRight = false;
						this.x = ent.x - this.w;
					}

					this.y = ent.y;

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
					if(collideTile(sword,entities[i])) {
						damage(ent, entities[i]);
						return true;
					}
				}

				for(i = 0; i < tiles.length; i++) {
					if(tiles[i].type == type.tile[2] && collideTile(sword,tiles[i])) {
						if(tiles[i].openChest())
							return true;
					}
				}

					this.count++;
					if(this.count >= this.max) {
						return true;
					}
			}
		});
	};
(function() {
	spawnEntity();
	spawnEntity.skeleton(
		6,8,
		210,50,
		0.2,0.04,
		0.07,-3,
		2.1,30,
	
		115,
		6,1
	);
	spawnEntity.greenPhantom(
		8,8,
		90,70,
		0.02,0.02,
		0.6,25,
	
		130,8,0.8
	
	);

	spawnEntity.greenSlime(
		8,6,
		200,60,
		0.1,-2.5,
		0.1,1,20,

		4,1.6,35
	);
}());

spawnEntity.skeleton();

var tiles = [new tile(
	27,4,
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
),
new tile(
	1,1,
	8,18,
	2
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
				if(entities[0].onG || entities[0].canJump) {
					entities[0].jumpUp();
					return true;
				}
				this.coyote++;
				if(this.coyote >= this.max) {
					return true;
				}
			}
		});
		conditions.push({
			check: function() {
				if(entities[0].keyW && !entities[0].onG && entities[0].spY < 0) {
					entities[0].spY -= 0.1;
				} else if(!entities[0].keyW || entities[0].onG) {
					return true;
				}
			}
		})
		entities[0].keyW = true;
	}

	if(e.keyCode == 82)
		location.reload();
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

	// shadows
	ctx.shadowColor = '#1f1f1f';
	ctx.shadowOffsetX = ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 0;

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
		
	for(i = 1; i < entities.length; i++) {
		drawEnt(i);
	}
		drawEnt(0);

	for(i = 0; i < effects.length; i++) {
		ctx.drawImage(effects[i].img,Math.round(effects[i].x),Math.round(effects[i].y),effects[i].w,effects[i].h);
	}

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
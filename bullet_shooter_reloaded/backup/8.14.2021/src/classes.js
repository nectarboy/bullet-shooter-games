// ------------------------ //
class Sprite {
    constructor(asset, x, y, w, h, char, scale) {
        this.asset = asset;

        this.offset = 0;
        this.invisible = false;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.char = char;
        this.scale = scale;
    };

    draw(ctx) {
        if (this.invisible)
            return;

        var char = this.char + this.offset;
        var assetWidth = this.asset.width / 8;
        var tx = (0|(char % assetWidth))*8;
        var ty = (0|(char / assetWidth))*8;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.asset,
            tx, ty,
            this.w, this.h,
            Math.round(this.x), Math.round(this.y),
            this.scale * this.w, this.scale * this.h
        );
    }

    centerOnto(x, y, w, h) {
        this.x = x - (this.scale * this.w)*0.5 + w*0.5;
        this.y = y - (this.scale * this.h)*0.5 + h*0.5;
    }

}

class AnimManager {
    constructor(ent, anims) {
        this.ent = ent; // ent must have a sprite !
        this.anims = anims;

        this.current = 0;
        this.charInd = 0;
        this.tick = 0;
    }

    update() {
        this.updateOffset();
        var anim = this.anims[this.current];

        if (anim.oneFrame || this.tick++ < anim.speed) return;
        this.tick = 0;

        this.ent.sprite.char = anim.data[this.charInd++];
        if (this.charInd === anim.data.length)
            this.charInd = 0;
    }

    updateOffset() {
        this.ent.sprite.offset = this.ent.left ? 2 : 0;
    }

    switchAnim(anim) {
        if (anim === this.current) return;

        this.current = anim;
        this.resetAnim();
    }

    resetAnim() {
        this.tick = this.anims[this.current].speed
        this.charInd = 0;
        this.ent.sprite.char = this.anims[this.current].data[0];
    }
}

// ------------------------ //
class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.destroy = false; // when true, should be removed from an entity array
    };

}

class GravityEntity extends Entity {
    constructor(x, y, w, h, sx, sy, ax, ay, friction, airRes) {
        super(x, y, w, h);

        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.left = false;

        this.sx = sx;
        this.sy = sy;
        this.ax = ax;
        this.ay = ay;
        this.friction = friction;
        this.airRes = airRes;
    }

    updateVelocity(xdir) {
        var ax = this.grounded ? this.ax : this.ax * this.airRes;

        // update x
        if (xdir === 1) {
            this.left = false;
            this.vx += ax;
            // too fast ?
            if (this.vx > this.sx) this.vx = this.sx;
        }
        else if (xdir === -1) {
            this.left = true;
            this.vx -= ax;
            // too fast ?
            if (this.vx < -this.sx) this.vx = -this.sx;
        }
        else {
            // apply friction
            if (this.vx > 0) {
                this.vx -= this.friction;
                if (this.vx < 0) {
                    this.x = Math.round(this.x); // fix position
                    this.vx = 0;
                }
            } 
            else if (this.vx < 0) {
                this.vx += this.friction;
                if (this.vx > 0) {
                    this.x = Math.round(this.x); // fix position
                    this.vx = 0;
                }
            }
        }

        // update y
        this.vy += this.ay;
        if (this.vy > this.sy)
            this.vy = this.sy;
    }

    updatePosition() {
        this.x += this.vx;
        this.y += this.vy;

        // update collision
    }

}

class JumpManager {
    constructor(ent, h, ext, extMax) {
        this.ent = ent;
        this.h = h;
        this.ext = ext;
        this.extMax = extMax;

        this.isJumping = false;
        this.didJump = false;
        this.extTicks = 0;
    }

    update() {
        // did we jump ...
        if (this.didJump) {
            if (this.ent.grounded || !this.isJumping) {
                this.didJump = false;
                this.isJumping = false;
                return;
            }

            if (this.extTicks === this.extMax) return;
            this.extTicks++;

            this.ent.vy -= this.ext;
        }
        // first time jumping ...
        else {
            if (!this.ent.grounded || !this.isJumping) return;

            this.ent.vy = -this.h;

            this.extTicks = 0;
            this.didJump = true;
        }
    }

}

// ------------------------ //
class Player extends GravityEntity {
    constructor(x, y) {
        super(x, y, 14, 14, 2, 3, 0.2, 0.6, 0.3, 0.7);

        this.jumpManager = new JumpManager(this, 4, 0.4, 60);
        this.joypadWasUp = false;

        this.moving = false;
        this.animManager = new AnimManager(this, [
            { // Player idle
                speed: 30, oneFrame: false,
                data: [0, 4]
            },
            { // Player walking
                speed: 6, oneFrame: false,
                data: [32,36,40,36]
            },
            { // Player crouching
                speed: 0, oneFrame: true,
                data: [68]
            },
            { // Player jumping
                speed: 0, oneFrame: true,
                data: [8]
            },
            { // Player falling
                speed: 0, oneFrame: true,
                data: [12]
            }
        ]);

        this.sprite = new Sprite(assets.tile_player, 0, 0, 16, 16, 0, 1);
    }

    update(game) {
        this.checkMoving(); // --> updateVelocity
        this.updatePosition();

        this.updateCollision();
        this.updateAnimation();
    }

    // movement 
    checkMoving() {
        // Running
        const xdir = joypad.right - joypad.left;
        this.moving = (xdir !== 0);

        this.updateVelocity(xdir);

        // Jumping
        if (joypad.a) {
            if (!this.joypadWasUp) {
                this.joypadWasUp = true;
                this.jumpManager.isJumping = true;
            }
        }
        else {
            this.joypadWasUp = false;
            this.jumpManager.isJumping = false;
        }

        this.jumpManager.update();

    }

    // collision
    updateCollision() {
        // DEBUG
        if (this.y > 128 - this.h) {
            this.y = 128 - this.h;
            this.landOnGround();
        }
        else this.grounded = false;
    }

    landOnGround() {
        this.vy = 0;
        this.grounded = true;
    }

    // animation
    updateAnimation() {
        this.sprite.centerOnto(this.x, this.y, this.w, this.h);

        // handle sprite animation
        if (this.grounded) {
            if (this.moving) this.animManager.switchAnim(1);
            else {
                if (joypad.down) this.animManager.switchAnim(2); // cute lil crouch animation :3
                else this.animManager.switchAnim(0);
            }
        }
        else {
            this.animManager.switchAnim(3 + (this.vy > 0));
        }

        this.animManager.update();
    }

}

class DebugBox extends GravityEntity {
    constructor(x, y) {
        super(x, y, 16, 16, 128, 128, 0, 0.2, 0.1, 0);

        this.sprite = new Sprite(assets.tile_debug, 0, 0, 8, 8, 0, 2);
    }

    update(game) {
        this.updateVelocity(0);
        this.updatePosition();
        this.updateCollision(game);

        this.sprite.centerOnto(this.x, this.y, this.w, this.h);
    }

    updateCollision(game) {
        // Player pushing
        const player = game.player;
        if (game.colHandler.BoxInBox(this, player)) {
            if (game.colHandler.BoxStompedBox(this, player)) {
                this.y = player.y - this.h;
                this.bounceY();
            }
            else if (game.colHandler.BoxStompedBox(player, this)) {
                player.y = this.y - player.h;
                player.landOnGround();
                player.updateAnimation();
            }
            else {
                this.x += player.vx;
                this.vx = player.vx;
            }
        }

        // DEBUG
        if (this.y > 128 - this.h) {
            this.y = 128 - this.h;
            this.bounceY();
        }
    }

    bounceY() {
        this.vy *= -0.5;
    }
}
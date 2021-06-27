/* TODO:
 * make an entity class to group common methods
 */

// Important formula
// (Math.cos(Math.PI * n))

// GAME TEXTS
const rightText = 'arrow keys: move, z: jump, x: shuut';
const getScoreText = s => `score: ${s}`;
const getFinalScoreText = s => `and got a score of ${s}! ${determineScoreString(s)}`;

// GAME CONSTANTS
const WIDTH = 550;
const HEIGHT = 300;
const BG_COLOR = '#2a2a2a';

const FRICTION = 0.9;

const ENEMY_SPAWN_RATE = 60;
const ENEMY_SPAWN_RAND = 0.5;
const ENEMY_SPEED_RAND = 1;
const ENEMY_TOP_OFFSET = 110;

const SPAWNRATE_INC = 62;
const SPAWNRATE_MIN = 25;

const SCORE_FRAME_ADD = 5;
const SCORE_KILL_ADD = 250;
const SCORE_HORRIBLE = 1000;
const SCORE_BAD = 2000;
const SCORE_EH = 4000;
const SCORE_GOOD = 5500;
const SCORE_GREAT = 6750;
const SCORE_AMAZING = 8000;
// > SCORE_AMAZING (godlike max)

// GAME VARIABLES
const bullets = [];
const enemies = [];
var spawnTick = -ENEMY_SPAWN_RATE; // wait a lil cooldown
var dead = false;
var paused = true;
var requestedFrame = false;
var spawnRate = spawnRate;
var rateIncTick = -SPAWNRATE_INC;
var score = 0;
var finalScoreText = '';

function objectsColliding(a, b) {
    return (
        a.x > b.x - a.width && a.x < b.x + b.width &&
        a.y > b.y - a.height && a.y < b.y + b.height
    );
}

function randRange(n, r) {
    return n - n * (Math.random() * r);
}

// HTML
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

// SOUNDS
const sounds = {
    'jump': new Audio('./sfx/jump.wav'),
    'die': new Audio('./sfx/die.wav'),
    'boom': new Audio('./sfx/boom.wav'),
    'point': new Audio('./sfx/point.wav'),
    'shuut': new Audio('./sfx/shuut.wav'),
    'spawn': new Audio('./sfx/spawn.wav'),
    'pause': new Audio('./sfx/pause.wav'),

    play(name) {
        this[name].pause();
        this[name].currentTime = 0;
        this[name].play();
    }
};

// PLAYER
var player;
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 15;
        this.height = 20;

        this.vx = 0;
        this.vy = 0;

        this.ay = 0.8;
        this.sx = 2.5;

        this.jumping = false;
        this.jump_amt = -15;

        this.maxBullets = 6;
        this.right = false;

        this.glow = 15;
        this.color = '#9f6ee0';
        this.deathColor = '#ffffff';
    };

    update() {
        this.move();

        this.updateVelocity();
        this.updatePosition();

        this.whenDead();
    }

    // velocity methods
    updateVelocity() {
        // y
        this.vy += this.ay;
    }

    updatePosition() {
        this.y += this.vy;
        this.x += this.vx;

        this.checkCollision();
    }

    checkCollision() {
        // y
        var floor = HEIGHT - this.height;
        if (this.y > floor) {
            this.y = floor;
            this.vy = 0;
            this.jumping = false;
        }
        else
            this.jumping = true;

        // x
        var right_wall = WIDTH - this.width;

        if (this.x > right_wall)
            this.x = right_wall;
        else if (this.x < 0)
            this.x = 0;
    }

    jump() {
        if (this.jumping)
            return false;

        this.vy = this.jump_amt;
        sounds.play('jump');

        return true;
    }

    // movement methods
    move() {
        if (dead)
            return;

        // horizontal movement
        if (keys.right && !keys.left) {
            this.vx = this.sx;
            this.right = true;
        }
        else if (keys.left && !keys.right) {
            this.vx = -this.sx;
            this.right = false;
        }
        else
            this.vx = 0;

        // fall quicker
        this.vy += this.ay * keys.down;

        // jump
        if (keys.z)
            keys.z = !this.jump(); // jump returns true or false - look at it

        // shuut
        if (keys.x) {
            keys.x = !this.shuut();
        }
    }

    shuut() {
        if (bullets.length >= this.maxBullets)
            return false;

        var x = this.x + this.width*0.5;
        var y = this.y + this.height*0.5;

        var vertDir = keys.up - keys.down;
        var moving = keys.right - keys.left;

        bullets.push(new Bullet(x, y, this.right, vertDir, moving));
        sounds.play('shuut');

        return true;
    }

    // misc methods
    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;

        ctx.fillRect(this.x,this.y,this.width,this.height);
    }

    die() {
        if (dead)
            return;

        // animation
        this.vx = -this.vx * 2;
        this.vy = -this.vy / 2;

        dead = true;
        finalScoreText = getFinalScoreText(score);

        this.color = this.deathColor;
        sounds.play('die');
    }

    whenDead() {
        if (!dead)
            return;

        this.vx *= FRICTION;
        this.vy *= FRICTION;
    }
}

// BULLETS
class Bullet {
    constructor(x, y, right, vertDir, moving)  {
        this.x = x;
        this.y = y;

        this.width = 13;
        this.height = 13;

        this.x -= this.width * 0.5;
        this.y -= this.height * 0.5;

        // velocity
        const speed = 10;

        if (moving) {
            this.vx = right ? speed : -speed;
            // vertDir: 1=up, -1=down, 0=none
            if (vertDir !== 0) {
                this.vx *= 0.5;
                this.vy = speed * 0.5 * -vertDir;
            }
            else
                this.vy = 0;
            }
        else {
            if (vertDir !== 0)
                this.vx = 0;
            else
                this.vx = right ? speed : -speed;
            this.vy = speed * -vertDir;
        }

        this.shouldKill = false;

        this.glow = 20;
        this.color = '#9afdff';
    };

    update() {
        this.updatePosition();
    }

    // movement
    updatePosition() {
        this.y += this.vy;
        this.x += this.vx;

        this.checkCollision();
    }

    checkCollision() {
        if (
            this.x > WIDTH - this.width || this.x < 0 ||
            this.y > HEIGHT - this.height || this.y < 0
        )
            this.shouldKill = true;
    }

    // misc methods
    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;

        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

// ENEMIES
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 25;
        this.height = 25;

        this.sx = 
        this.sy = 1 + randRange(0.5, ENEMY_SPEED_RAND);

        this.shouldKill = false;

        this.glow = 20;
        this.color = '#c94a4a';
    };

    update() {
        this.move();
        this.checkCollision();
    }

    // movement methods
    move() {
        var width = this.width*0.5 - player.width*0.5;
        var height = this.height*0.5 - player.height*0.5;

        if (player.x > this.x + width)
            this.x += this.sx;
        else if (player.x < this.x - width)
            this.x -= this.sx;

        if (player.y > this.y + height)
            this.y += this.sy;
        else if (player.y < this.y - height)
            this.y -= this.sy; 
    }

    checkCollision() {
        // check bullets
        for (var i = 0; i < bullets.length; i++) {
            if (objectsColliding(bullets[i], this)) {
                this.die();
                return;
            }
        }

        // check player
        if (objectsColliding(player, this)) {
            // check if stomping
            if (player.y - player.vy < this.y - player.width) {
                this.die();
                player.vy = -player.vy;
            }
            else
                player.die();
        }
    }

    // misc methods
    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;

        ctx.fillRect(this.x,this.y,this.width,this.height);
    } 

    die() {
        this.shouldKill = true;
        sounds.play('boom');
    }
}

function updateEntArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i].update();

        if (arr[i].shouldKill) {
            arr.splice(i, 1);
            i--;
        }
    }
}

// ENEMY SPAWNING
function checkSpawn() {
    if (spawnTick++ >= spawnRate) { // >= cuz spawnRate is variable
        enemies.push(getNewEnemy());
        spawnTick = (spawnTick - randRange(spawnTick, ENEMY_SPAWN_RAND)) | 0;
        sounds.play('spawn');
    }
}

function getNewEnemy() {
    var e = new Enemy(0, 0);

    var rand = Math.random();

    e.x = Math.round(rand * (WIDTH - e.width));
    e.y = Math.abs(Math.cos(Math.PI * rand)) * ENEMY_TOP_OFFSET;
    // (Math.cos(Math.PI * n));

    return e;
}

function updateSpawnRate() {
    if (rateIncTick++ === SPAWNRATE_INC) {
        rateIncTick = 0;
        if (spawnRate === SPAWNRATE_MIN)
            return;
        spawnRate--;
    }
}

// GAME SCORE
function determineScoreString(s) {
    return (
        s < SCORE_HORRIBLE ? 'you\'re compelete utter ass at this!' :
        s < SCORE_BAD ? 'bro ... you can do better cmon' :
        s < SCORE_EH ? 'ehhh ,,, reach higher homie!' :
        s < SCORE_GOOD ? 'hm! pretty good!' :
        s < SCORE_GREAT ? 'wow! you\'re great at this bruh!!' :
        s < SCORE_AMAZING ? 'DAYUM YOU AMAZING ... can you go higher ???' :
        `JESUS FUCKING CHRIST ${s}?!?!?!!HOLY SHIT YOU A GOD`
    );
}

function addScore(s) {
    if (dead)
        return false;

    score += s;
    return true;
}

// GAME LOGIC
function updateLoop() {
    player.update();
    updateEntArray(bullets);
    updateEntArray(enemies);
    checkSpawn();
    updateSpawnRate();

    addScore(SCORE_FRAME_ADD);

    requestFrame();
}

function drawAll() {
    requestedFrame = false;

    // ready bg
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    // draw entities
    player.draw();

    for (var i = 0; i < enemies.length; i++)
        enemies[i].draw();
    for (var i = 0; i < bullets.length; i++)
        bullets[i].draw();

    // draw gui
    drawGui();
}

function drawGui() {
    // score


    // death screen
    if (!dead)
        return;


}
    
// RESET
function reset() {
    player = new Player(WIDTH/2, HEIGHT/2);

    // reset variables
    bullets.length = 0;
    enemies.length = 0;
    spawnTick = -ENEMY_SPAWN_RATE; // wait a lil cooldown
    dead = false;
    spawnRate = ENEMY_SPAWN_RATE;
    rateIncTick = -SPAWNRATE_INC;
    score = 0;
}

// LOOP
var timeout = null;
var interval = 1000 / 60;

function startLoop() {
    if (!paused)
        return;
    paused = false;

    loop();
}

function stopLoop() {
    paused = true;
    clearTimeout(timeout); // dont run next frame
    timeout = null;
}

function loop() {
    var msBefore = performance.now();
    updateLoop();
    var msAfter = performance.now();

    timeout = setTimeout(loop, interval - (msAfter - msBefore));
}

function requestFrame() {
    if (requestedFrame)
        return;
    requestedFrame = true;

    requestAnimationFrame(drawAll);
}

// CONTROLLER
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,

    z: false,
    x: false
};

const keyAPI = {
    // key states
    setKeyState(code, val) {
        switch (code) {
            // d-pad
            case 'ArrowUp': case 'KeyW':
                keys.up = val;
                break;
            case 'ArrowDown': case 'KeyS':
                keys.down = val;
                break;
            case 'ArrowLeft': case 'KeyA':
                keys.left = val;
                break;
            case 'ArrowRight': case 'KeyD':
                keys.right = val;
                break;

            // buttons
            case 'KeyZ': case 'Space': case 'Comma':
                keys.z = val;
                break;
            case 'KeyX': case 'ShiftRight': case 'Period':
                keys.x = val;
                break;

            // ???
            default:
                return false;
        }
        return true;
    },

    checkPause(code) {
        if (dead) {
            if (code === 'KeyR')
                reset();
            return;
        }

        if (code !== 'KeyP')
            return;

        if (paused)
            startLoop();
        else
            stopLoop();
        sounds.play('pause');
    },

    // key events
    /* NOTE
     * we use external functions as event listeners
     * fuck up the meaning of 'this'
     */
     firing: {},
     keydown(e) {
        if (keyAPI.firing[e.code])
            return;
        keyAPI.firing[e.code] = true;

        // pause
        keyAPI.checkPause(e.code);
        keyAPI.setKeyState(e.code, true);
     },

     keyup(e) {
        delete keyAPI.firing[e.code];
        keyAPI.setKeyState(e.code, false);
     },

     // event listeners
     start() {
        document.addEventListener('keydown', keyAPI.keydown);
        document.addEventListener('keyup', keyAPI.keyup);
     },
     stop() {
        document.removeEventListener('keydown', keyAPI.keydown);
        document.removeEventListener('keyup', keyAPI.keyup);
     }
};
    
// init
reset();
keyAPI.start();
startLoop();

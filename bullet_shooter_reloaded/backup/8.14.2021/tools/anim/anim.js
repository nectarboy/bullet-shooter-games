const int = n => n | 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

const tilesize = 16;
const sheet = new Image();
sheet.src = '../../src/img/playersheet.png';
    
var tick = 0;
var char = 0;

// crouch
// var anim = [18,18, 2,2, 18,18, 2,2,3, 19,19, 3,3, 19,19, 3,3,2];
// var animspeed = 8;

var anim = [8,10,12,10];
var animspeed = 20;

var animstep = 0;

function updateAnim() {
    if (tick-- !== 0)
        return;

    char = anim[animstep++];
    if (animstep === anim.length)
        animstep = 0;

    tick = animspeed;
    draw();
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    var x = int(char*tilesize % sheet.width);
    var y = int(char*tilesize / sheet.width)*tilesize;

    ctx.drawImage(
        sheet,
        x, y,
        tilesize, tilesize,
        0, 0,
        canvas.width, canvas.height
    );
}

setInterval(updateAnim, 1000/60);
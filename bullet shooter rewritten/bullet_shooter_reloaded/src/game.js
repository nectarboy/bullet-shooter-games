// nectarboy 2021

// game
onAssetsLoaded = function() {

    console.log('loading game ...');

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

    // CONSTANTS
    var CANV_WIDTH = 168;
    var CANV_HEIGHT = 160;
        canvas.width = CANV_WIDTH;
        canvas.height = CANV_HEIGHT;
    var MS_PER_FRAME = 1000 / 60;

    var STATE_GAME = 0;
    var STATE_PAUSE = 1;
    var STATE_CUSTOM = 2;

    var TILESIZE = 8;

    // basic game variables
    var score = 0;
    var tick = 0;
        var redSpawnTick = 0;
        var yellowSpawnTick = 0;
        var orangeSpawnTick = 0;
        var buffSpawnTick = 0;

    // entities
    this.player = null; // the player !!
    this.entities = []; // enemies, spawners, items, etc
    this.effects = []; // particles, etc

    function updateGameObjects() {
        this.player.update();
    }

    function drawGameObjects() {
        this.player.sprite.draw(ctx);
    }

    // game state
    var gameState = STATE_GAME;

    var customUpdate = function() {};
    var customDraw = function() {};

    // -- updating
    function gameUpdate() {
        updateGameObjects();
    }

    // -- drawing
    function gameDraw() {
        ctx.clearRect(0,0,CANV_WIDTH,CANV_HEIGHT);
        ctx.fillText('big gay cock', 100, 100);

        drawGameObjects();
    }

    // main loop
    function mainLoop() {
        var msBefore = performance.now();

        // ------------------------ //
        if (gameState === STATE_GAME) gameUpdate();
        else if (gameState === STATE_CUSTOM) customUpdate();

        tick++;
        // ------------------------ //

         var msAfter = performance.now();
        setTimeout(function() {
            mainLoop();
        }, MS_PER_FRAME - (msAfter - msBefore));

        requestAnimationFrame(function() {
            drawFrame();
        });
    }

    function drawFrame() {
        if (gameState === STATE_GAME) gameDraw();
        else if (gameState === STATE_CUSTOM) customDraw();
    }

    // initialize
    function reset() {
        player = new Player(CANV_WIDTH/2, 0);
    }

    controller.start();
    reset();
    mainLoop();

};

// assets
loadAssets([
    ['player_spritesheet', Image, 'src/img/player_spritesheet.png']
]);
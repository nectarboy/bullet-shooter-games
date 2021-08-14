function Game(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

    // CONSTANTS
    const CANV_WIDTH = 168;
    const CANV_HEIGHT = 160;
        canvas.width = CANV_WIDTH;
        canvas.height = CANV_HEIGHT;
    const MS_PER_FRAME = 1000 / 60;

    const STATE_GAME = 0;
    const STATE_PAUSE = 1;
    const STATE_CUSTOM = 2;

    const TILESIZE = 8;

    // game components
    this.spawners = new Spawners(this);
    this.mapHandler = new MapHandler(this);
    this.colHandler = new CollisionHandler(this);

    // basic game variables
    this.score = 0;
    this.tick = 0;
        this.redSpawnTick = 0;
        this.yellowSpawnTick = 0;
        this.orangeSpawnTick = 0;
        this.buffSpawnTick = 0;

    // Game objects
    this.player = null; // the player !!
    this.entities = []; // enemies, spawners, items, etc
    this.effects = []; // particles, etc

    this.UpdateGameObjects = function() {
        this.player.update(this);
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update(this);
        }
    };

    this.DrawGameObjects = function() {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].sprite.draw(this.ctx);
        }
        this.player.sprite.draw(this.ctx);
        for (var i = 0; i < this.effects.length; i++) {
            this.effects[i].sprite.draw(this.ctx);
        }

    };

    // Game state
    this.gameState = STATE_GAME;

    // Latch functions
    this.CustomUpdate = function() {};
    this.CustomDraw = function() {};

    // -- updating
    this.GameUpdate = function() {
        this.UpdateGameObjects();
    };

    // -- drawing
    this.GameDraw = function() {
        this.ctx.clearRect(0, 0, CANV_WIDTH, CANV_HEIGHT);
        this.ctx.fillText('big guy cat', 100, 100);

        this.DrawGameObjects();
    };

    // main loop
    this.MainLoop = function() {
        const msBefore = performance.now();

        // ------------------------ //
        if (this.gameState === STATE_GAME)
            this.GameUpdate();
        else if (this.gameState === STATE_CUSTOM)
            this.CustomUpdate();

        this.tick++;
        // ------------------------ //
        const that = this;

        const msAfter = performance.now();
        setTimeout(function() {
            that.MainLoop();
        }, MS_PER_FRAME - (msAfter - msBefore));

        requestAnimationFrame(function() {
            that.DrawFrame();
        });
    };

    this.DrawFrame = function() {
        if (this.gameState === STATE_GAME)
            this.GameDraw();
        else if (this.gameState === STATE_CUSTOM)
            this.CustomDraw();
    }

    // initialize
    this.Reset = function() {
        this.entities.length = 0;
        this.effects.length = 0;
        this.spawners.Player(CANV_WIDTH/2, 0);
        this.spawners.DebugBox(60, 0);

        // Debug config stuff
        window.player = this.player;
    };

}
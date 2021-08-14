// nectarboy 2021

// game
OnAssetsLoaded = function() {
    console.log('loading game ...');

    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    controller.Start();
    game.Reset();
    game.MainLoop();
};

// assets
LoadAssets([
    // Spritesheets / Tilesheets
    ['tile_player', Image, 'src/assets/img/tile/player.png'],
    ['tile_debug', Image, 'src/assets/img/tile/debug.png'],
    // GUI
    // Other images

    // Audio
]);
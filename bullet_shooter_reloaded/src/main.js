// nectarboy 2021

// assets
LoadAssets([
    // Spritesheets / Tilesheets
    ['tile_player', Image, 'src/assets/img/tile/player.png'],
    ['tile_grass', Image, 'src/assets/img/tile/grass.png'],
    ['tile_debug', Image, 'src/assets/img/tile/debug.png'],
    // Backgrounds
    ['bg_test', Image, 'src/assets/img/bg/test.png'],
    // GUI
    // Other images

    // Audio
],
// game
function() {
    console.log('loading game ...');

    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    controller.Start();
    game.Reset();
    game.MainLoop();
});
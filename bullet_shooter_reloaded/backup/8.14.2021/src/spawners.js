function Spawners(game) {
    this.game = game;

    this.Player = function(x, y) {
        if (this.game.player === null) {
            this.game.player = new Player(x, y);
        }
        else {
            this.game.entities.push(new Player(x, y));
        }
    };

    this.DebugBox = function(x, y) {
        this.game.entities.push(new DebugBox(x, y));
    };
}
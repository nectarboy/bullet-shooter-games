/// sprites ///

function newImg(path) {
	var x = new Image();
		x.src = path;
		x.load
	return x;
}

var sprite = [];	
	sprite[0] = newImg('data/sprites/blu0.png'); // player
	sprite[1] = newImg('data/sprites/blu1.png');
	sprite[2] = newImg('data/sprites/blu2.png');
	sprite[3] = newImg('data/sprites/blu3.png');
	sprite[4] = newImg('data/sprites/blu4.png');

	sprite[5] = newImg('data/sprites/skeleton0.png'); // skeleton
	sprite[6] = newImg('data/sprites/skeleton1.png');
	sprite[7] = newImg('data/sprites/skeleton2.png');
	sprite[8] = newImg('data/sprites/skeleton3.png');
	sprite[9] = newImg('data/sprites/skeleton4.png');

	sprite[10] = newImg('data/sprites/attack0.png'); // sword swing
	sprite[11] = newImg('data/sprites/attack1.png');
	sprite[12] = newImg('data/sprites/attack2.png');
	sprite[13] = newImg('data/sprites/attack3.png');
	sprite[14] = newImg('data/sprites/attack4.png');
	sprite[15] = newImg('data/sprites/attack5.png');

	sprite[16] = newImg('data/sprites/green0.png'); // green ghost
	sprite[17] = newImg('data/sprites/green1.png');
	sprite[18] = newImg('data/sprites/green2.png');
	sprite[19] = newImg('data/sprites/green3.png');

	sprite[20] = newImg('data/sprites/greenslime0.png'); // green slime
	sprite[21] = newImg('data/sprites/greenslime2.png');

var tileSprite = [];
	tileSprite[0] = newImg('data/sprites/tile0.png'); // brick
	tileSprite[1] = newImg('data/sprites/tile1.png'); // semisolid
	tileSprite[2] = newImg('data/sprites/tile2.png'); // fragile
	tileSprite[3] = newImg('data/sprites/tile3.png');

	tileSprite[4] = newImg('data/gui/hp0.png'); // hp glass
	tileSprite[5] = newImg('data/gui/hp1.png'); // hp red

	tileSprite[6] = newImg('data/sprites/tile4.png'); // chest
	tileSprite[7] = newImg('data/sprites/tile5.png');
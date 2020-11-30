
if(world.godMode) {

	document.addEventListener('mousedown', placeTile);

	function placeTile(e) {
		var rect = c.getBoundingClientRect();

		var destroying = false;

		var x = Math.floor((e.clientX - rect.left)/4);
		var y = Math.floor((e.clientY - rect.top)/4);

		for(i = 0; i < tiles.length; i++) {
			if(x >= tiles[i].x && x <= tiles[i].x + tiles[i].w &&
			y >= tiles[i].y && y <= tiles[i].y + tiles[i].h) {
				tiles.splice(i,1);
				console.log('pop!');
				destroying = true;
			}
		}
			if(!destroying) {
				var obj = new tile(2,2,x,y,0);
		
				obj.x = x;
				obj.y = y;
		
				for(i = obj.x; i % 8 != 0;) {
					i--;
					obj.x = i;
				}
		
				for(i = obj.y; i % 8 != 0;) {
					i--;
					obj.y = i;
				}
		
				console.log(obj.x,obj.y);
		
				tiles.push(obj);
			}
	}

}
function CollisionHandler(game) {
    this.BoxInBox = function(a, b) {
        return (
            a.x + a.w > b.x && a.x < b.x + b.w &&
            a.y + a.h > b.y && a.y < b.y + b.h
        );
    }

    this.BoxStompedBox = function(a, b) {
        const bottom = a.y + a.h;
        return (bottom > b.y && bottom - a.vy <= b.y);
    }
}
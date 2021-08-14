function MapHandler(game) {
    // --- State variables
    this.mapInfo = {
        name: null,
        desc: null,
        author: null
    };
    this.mapData = null;

    // --- Running variables
    // Chunks
    this.chX = 0;
    this.chY = 0;
    this.chData = null;

    // Assets
    this.mapAsset = null;

    // --- Methods
    this.LoadMapJson = function(jsonStr) {
        try {
            const obj = JSON.parse(jsonStr);

            if (typeof obj !== 'object')
                throw 'JSON does not provide an object !!';
            if (!obj.info || !obj.data)
                throw 'invalid map format !!';
        }
        catch (e) {
            throw 'error ! :: ' + e;
        }

        // Info
        this.mapInfo.name = obj.info.name || null;
        this.mapInfo.desc = obj.info.desc || null;
        this.mapInfo.author = obj.info.author || null;

        // Data
        
    };

    this.Reset = function() {
        this.chX = 0;
        this.chY = 0;
    };
}
// nectarboy 2021

const assets = {
    playSound(name) {
        this[name].pause();
        this[name].currentTime = 0;
        this[name].play();
    }
};

var OnAssetsLoaded = function() {}; // Latch function

/*
 * @param [array (3D)] assetBundle
 */
function LoadAssets(assetBundle) {
    var assetsLoaded = 0;
    for (var i = 0; i < assetBundle.length; i++) {
        var assetPack = assetBundle[i];

        assets[assetPack[0]] = new assetPack[1];
        assets[assetPack[0]].onload = function() {
            assetsLoaded++;
            if (assetsLoaded === assetBundle.length) {
                console.log('loaded assets !');
                OnAssetsLoaded();
            }
        };

        assets[assetPack[0]].src = assetPack[2];
    }

}
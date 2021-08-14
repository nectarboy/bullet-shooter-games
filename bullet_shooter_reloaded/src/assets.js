// nectarboy 2021

const assets = {
    playSound(name) {
        this[name].pause();
        this[name].currentTime = 0;
        this[name].play();
    }
};

/*
 * @param [array (3D)] assetBundle
 * @param [function] OnFinish
 */
function LoadAssets(assetBundle, OnFinish) {
    var assetsLoaded = 0;
    for (var i = 0; i < assetBundle.length; i++) {
        var assetPack = assetBundle[i];

        assets[assetPack[0]] = new assetPack[1];
        assets[assetPack[0]].onload = function() {
            assetsLoaded++;
            if (assetsLoaded === assetBundle.length) {
                console.log('loaded assets !');
                OnFinish();
            }
        };

        assets[assetPack[0]].src = assetPack[2];
    }

}
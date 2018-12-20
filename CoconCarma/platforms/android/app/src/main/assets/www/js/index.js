var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        let savedProducts = getData("Prods");

        if(savedProducts !== false && savedProducts !== null){
            products = JSON.parse(savedProducts);
        }
        else{
            products = JSON.parse(JSON.stringify(defaults));
        }
        fillTable();
        updateRealTimeStats();

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getFile("lol", { create: false, exclusive: false }, function () {}, function() {});
        }, function() {});
        AndroidFullScreen.immersiveMode();
    },
};

app.initialize();
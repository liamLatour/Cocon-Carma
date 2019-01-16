// Normal Workflow
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
        var savedProducts = getData("Prods");

        if(savedProducts !== false && savedProducts !== null){
            products = JSON.parse(savedProducts);
        }
        else{
            products = JSON.parse(JSON.stringify(defaults));
        }
        fillTable();
        updateRealTimeStats();

        // Just to ask for permition, does nothing
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getFile("lol", { create: false, exclusive: false }, function () {}, function() {});
        }, function() {});
        AndroidFullScreen.immersiveMode();

        // Removes the splash screen
        $("#loadScreen").css('display', 'none');
    },
};

app.initialize();
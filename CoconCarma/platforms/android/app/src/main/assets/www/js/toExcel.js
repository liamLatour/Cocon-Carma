// TODO: put newspaper and payment modes apart

function exportExcel(){
    let name = "Bilan " + new Date().toDateString().substring(4) + " " + new Date().getHours() + "h" + new Date().getMinutes();

    // Declaring work book
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Cocon Carma",
        Subject: name,
        Author: "Cocon-Carma",
        CreatedDate: new Date()
    };
    wb.SheetNames.push("Main Sheet");
    wb.SheetNames.push("La Montagne");

    // General data
    var newsPaper_data = [];
    newsPaper_data.push(["", "Jour 1"]);
    newsPaper_data.push(["Nombre", 0]);
    newsPaper_data.push(["Prix", 0]);

    var ws_data = [];
    let totalNb = 0;
    let totalMoney = 0;
    let totalCmd = 0;

    // To decrease complexity
    let percentageId = -1;

    // loop through commands
    for(let item in getData()){
        if(item[0] == 'C'){
            let obj = JSON.parse(getData(item));
            totalCmd++;
            let remise = 0;
            let normalSum = 0;
            let percentagedSum = 0;

            for(let key in obj){
                try{
                    let thisName = "";
                    let thisCost = 0;
                    let isPercentaged = false;

                    if(isNaN(key)){
                        // Check whether it is a payment mode or not
                        if(key[0] != key[0].toUpperCase()){
                            continue;
                        }

                        console.log("real shit");
                        let meal;

                        if(key.includes('M')){
                            meal = key.match(/(M)\d+/)[0].substring(1);

                            isPercentaged = true;
                            thisName = "Menu " + products[meal][3][2];
                            thisCost = products[meal][3][1] * obj[key];
                            if(key.includes('B')){
                                thisName += " + Boisson";
                                thisCost += (products[ key.match(/(B)\d+/)[0].substring(1) ][1] - 0.5) * obj[key];
                            }
                        }
                        else if(key.includes('F')){
                            meal = key.match(/(F)\d+/)[0].substring(1);
    
                            isPercentaged = true;
                            thisName = "Formule " + products[meal][3][2];
                            thisCost = products[meal][3][0] * obj[key];
                        }
                    }
                    else{
                        // If it is a remise in %
                        if(products[key][1] < 0 && products[key][3] === 'P'){
                            remise = obj[key];
                        }
                        else{
                            // If it is a:  meal || dessert || starter || drink
                            if((products[key].length === 4 && products[key][1] > 0 && products[key][3] != 'M') || products[key][2] === 1){
                                isPercentaged = true;
                            }

                            thisCost = products[key][1] * obj[key];
                            thisName = products[key][0];

                            // If it is a newsPaper
                            if(products[key].length === 4 && products[key][3] == 'M'){
                                newsPaper_data[1][1] += obj[key];
                                newsPaper_data[2][1] += thisCost;
                            }
                        }
                    }

                    if(thisCost > 0 || products[key][3] == 'E'){
                        let id = isItHere(thisName);

                        if(id != -1){
                            ws_data[id][1] += obj[key];
                            ws_data[id][3] += thisCost;
                        }
                        else{
                            ws_data.push([thisName, obj[key], thisCost/obj[key], thisCost]);
                        }

                        if(isPercentaged){
                            percentagedSum += thisCost;
                        }
                        else{
                            normalSum += thisCost;
                        }

                        if(thisCost > 0){
                            totalNb++;
                        }
                    }
                }
                catch(err){
                    console.log(err);
                }
            }

            if(remise > 0){
                let reduc = percentagedSum/100*Math.abs(remise);

                if(percentageId != -1){
                    ws_data[percentageId][1] += 1;
                    ws_data[percentageId][3] -= reduc;
                }
                else{
                    percentageId = ws_data.push([products[0][0], 1, -1, -reduc])-1;
                }

                totalMoney += normalSum + percentagedSum - reduc;
            }
            else{
                totalMoney += normalSum + percentagedSum;
            }
        }
    }

    ws_data.sort(sortCommand);
    ws_data.unshift(['Plats par popularités' , 'Nombre de produits', 'Coût seul', 'Coût total', '', 'Ticket moyen', 'Nombre de repas']);
    ws_data[1].push("", totalMoney/totalCmd, totalCmd);
    ws_data.push([], ['TOTAL', totalNb, "", totalMoney]);
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    var newsPaper = XLSX.utils.aoa_to_sheet(newsPaper_data);

    var wscols = [
        {wch:25},
        {wch:14},
        {wch:8},
        {wch:8},
        {wch:7},
        {wch:13},
        {wch:15}
    ];

    ws['!cols'] = wscols;

    wb.Sheets["Main Sheet"] = ws;
    wb.Sheets["La Montagne"] = newsPaper;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;    
    }

    function isItHere(thisName){
        let id = -1;
        for(let i=0; i<ws_data.length; i++){
            if(ws_data[i][0] == thisName){
                id = i;
                break;
            }
        }
        return id;
    }

    function sortCommand(a, b) {
        if(a[2] < 0){
            return 1;
        }
        else if(b[2] < 0){
            return -1;
        }
        if (a[1] === b[1]) {
            if(a[2] === b[2]){
                return 0;
            }
            else{
                return (a[2] < b[2]) ? 1 : -1;
            }
        }
        else {
            return (a[1] < b[1]) ? 1 : -1;
        }
    }

    try{
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        var fileName = name+".xlsx";
    
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    console.log("Success");
                    alert(fileName + " sauvegardé dans vos documents.");
                    $("#cmds").css('visibility', 'hidden');
                };
                fileWriter.onerror = function (e) {
                    console.log("Fail with ", e);
                };
                fileWriter.write(new Blob([s2ab(wbout)],{type:"application/octet-stream"}));
            });

        }, function(e) {console.log(e);});
    }, function(e) {console.log(e);});
    }
    catch(error){
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), name+".xlsx");
    }
}



function fromExcel(){
    var myPath = cordova.file.externalRootDirectory;

    window.resolveLocalFileSystemURL(myPath, function (dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(onSuccessCallback,onFailCallback);
    });
    function onSuccessCallback(entries){
        for (i=0; i<entries.length; i++) {
            var row = entries[i];
            if(!row.isDirectory && row.name.includes('.xlsx')){
                console.log("Excel File:", row.name, " nativeUrl:", row.nativeURL);
            }
        }
        console.log("Found this:", entries, " at:", myPath);
    }
    function onFailCallback(e){
        console.log(e);
    }


/*
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, successCallback, errorCallback)
    function successCallback(fs) {
        fs.root.getFile('log.txt', {}, function(fileEntry) {
  
            fileEntry.file(function(file) {
                var reader = new FileReader();
    
                reader.onloadend = function(e) {
                    var txtArea = document.getElementById('textarea');
                    txtArea.value = this.result;
                };
                reader.readAsText(file);

           }, function(err) {});
        }, function(err) {});
    }
  
    function errorCallback(error) {
        alert("Impossible de compléter le excel: " + error.code);
    }
*/
}
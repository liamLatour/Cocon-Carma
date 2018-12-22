// TODO: put newspaper and payment modes apart

// TODO: Upgrade newsPaper thing && do a totalisation sheet

function exportExcel(alreadyHere=undefined, summarySheet=undefined){

    var newsPaper_data = [];

    if(summarySheet != undefined){
        newsPaper_data = summarySheet;
    }
    else{
        newsPaper_data.push(["", "Jour 1"]);
        newsPaper_data.push(["Nombre", 0]);
        newsPaper_data.push(["Prix", 0]);
    }


    let ws_data = [];
    let totalNb = 0;
    let totalMoney = 0;
    let totalCmd = 0;
    let percentageId = -1; // To decrease complexity

    if(alreadyHere != undefined){
        ws_data = alreadyHere;

        // HARD CODED for the '6' and the rest
        totalCmd = Number(ws_data[1][6]);
        ws_data[1] = ws_data[1].slice(0, 4);

        for(let i=0; i<ws_data.length; i++){
            if(ws_data[i][0] == "TOTAL"){
                totalNb = Number(ws_data[i][1]);
                totalMoney = Number(ws_data[i][3]);
                ws_data.length = i-1;
                break;
            }
        }

        ws_data.shift(); // Removes title row
    }
    
    // loop through commands
    for(let item in getData()){
        if(item[0] == 'C'){
            let obj = JSON.parse(getData(item));

            // Check that the time of the command is superior to the last save time
            if(obj["time"] === undefined || getData("lastSave") > Date.parse(obj["time"])){
                continue;
            }

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
    ws_data.push([], ['TOTAL', totalNb, "", totalMoney]);
    if(ws_data[1] != undefined){
        ws_data[1].push("", coolRound(totalMoney/totalCmd), totalCmd);
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

    saveData("lastSave", Date.now());
    return [ws_data, newsPaper_data];
}


function updateExcel(){
    var myPath = cordova.file.externalRootDirectory; // Path to excels

    window.resolveLocalFileSystemURL(myPath, function (dirEntry) {
        let directoryReader = dirEntry.createReader();
        directoryReader.readEntries(onSuccessCallback, errorCallback);
    });
    function onSuccessCallback(entries){
        for (let i=0; i<entries.length; i++) {
            let row = entries[i];
            if(!row.isDirectory && row.name.includes('.xlsx')){
                let month = row.name.substring(6, 9);
                let year = row.name.substring(10, 14);
                if(new Date().toDateString().substring(4, 7) == month && new Date().getFullYear() == year){
                    console.log("Found", row.name);
                    retrieveData(row.name);
                    return;
                }
            }
        }
        mergeExcel(); // If no Excel was found
    }
  
    function retrieveData(foundExcel) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, successCallback, errorCallback);
        function successCallback(fs) {
            fs.root.getFile(foundExcel, {}, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        let excel = {};
                        let workbook = XLSX.read(this.result, { type: 'binary' });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Pass through each sheet, convert it to AoA and finally put it in 'excel' along with it's name
                            var XL_row_object = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                            excel[sheetName] = Papa.parse(XL_row_object)["data"];
                        });
                        console.log(excel);
                        mergeExcel(excel);
                    };
                    reader.onerror = function (e) { errorCallback(e); };
                    reader.readAsBinaryString(file);
                }, function (e) { errorCallback(e); });
            }, function (e) { errorCallback(e); });
        }
    }

    function errorCallback(error) {
        alert("Impossible de compléter le excel: " + error.code);
    }
}


function mergeExcel(oldExcel=undefined){
    // oldExcel is of the form:
    /*
        {
            sheetName: [['Title1', 'Title2'], ['Value1', 'Value2'], ...],
            sheetName2: [[], [], ...],
            ...,
        }
    */

    let workingSheet = undefined;
    let newsSheet = undefined;

    if(oldExcel != undefined){
        let day = new Date().getDate();
        for(let title in oldExcel){
            if(title.includes(day)){
                workingSheet = oldExcel[title];
            }
            if(title.includes("La Montagne")){
                newsSheet = oldExcel[title];
            }
        }
    }
    else{
        oldExcel = {};
    }

    let mergedSheet = exportExcel(workingSheet, newsSheet);

    if(workingSheet != undefined){ workingSheet = mergedSheet[0]; }
    else{ oldExcel["Jour " + new Date().getDate()] = mergedSheet[0]; }

    if(newsSheet != undefined){ newsSheet = mergedSheet[1]; }
    else{ oldExcel["La Montagne"] = mergedSheet[1]; }


    // Does the normal thing
    let name = "Bilan " + new Date().toDateString().slice(4, 7) + " " + new Date().getFullYear();

    // Declaring work book
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Cocon Carma",
        Subject: name,
        Author: "Cocon-Carma",
        CreatedDate: new Date()
    };

    var wscols = [{wch:25}, {wch:16}, {wch:8}, {wch:8}, {wch:7}, {wch:13}, {wch:15}]; // Cols for "Jour X"

    // Add sheets to excel
    for(let sheet in oldExcel){
        wb.SheetNames.push(sheet);
        let ws = XLSX.utils.aoa_to_sheet(oldExcel[sheet]);

        if(sheet.includes('Jour')){
            ws['!cols'] = wscols;
        }

        wb.Sheets[sheet] = ws;
    }

    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

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
                    fileWriter.write(new Blob([s2ab(wbout)],{type:"application/octet-stream"}) );
                });
    
            }, function(e) {console.log(e);});
        }, function(e) {console.log(e);});
    }
    catch(error){
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), name+".xlsx");
    }

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;    
    }
}
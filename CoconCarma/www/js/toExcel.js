function exportExcel(){
    let name = "Bilan " + new Date().toDateString().substring(4);
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Cocon Carma",
        Subject: name,
        Author: "Cocon-Carma",
        CreatedDate: new Date()
    };
    wb.SheetNames.push("Main Sheet");


    var ws_data = [];
    let totalNb = 0;
    let totalMoney = 0;
    let totalCmd = 0;

    // loop through commands
    for(let item in getData()){
        if(item[0] == 'C'){
            let obj = JSON.parse(getData(item));
            totalCmd++;
            let reducPour = 0;
            let sousTotal = 0;
            for(let product in obj){
                try{
                    let id = -1;
                    let thisName = "";
                    let thisCost = 0;

                    if(!isNaN(product)){
                        if(products[product][1] < 0 && products[product][2] === 'P'){
                            reducPour = obj[product];
                        }
                        thisName = products[product][0];
                        thisCost = products[product][1];
                    }
                    else if(product.includes('M')){
                        thisName = "Menu "+formules[product[1]][0];
                        thisCost = formules[product[1]][2];
                        if(product.includes('B')){
                            thisName += " + Boisson";
                            thisCost += products[Number(product.substring(product.length-1, product.length))+6][1];
                        }
                    }
                    else if(product.includes('F')){
                        thisName = "Formule "+formules[product[2]][0];
                        thisCost = formules[product[2]][1];
                        if(product.includes('B')){
                            thisName += " + Boisson";
                            thisCost += products[Number(product.substring(product.length-1, product.length))+6][1];
                        }
                    }
                    else{
                        continue;
                    }

                    if(thisCost > 0 || products[product][2] == 'E'){
                        // Check if already here
                        for(let i=0; i<ws_data.length; i++){
                            if(ws_data[i][0] == thisName){
                                id = i;
                                break;
                            }
                        }

                        if(id != -1){
                            ws_data[id][1] += obj[product];
                            ws_data[id][3] += thisCost * obj[product];
                        }
                        else{
                            ws_data.push([thisName, obj[product], thisCost, thisCost * obj[product]]);
                        }

                        totalMoney+=thisCost * obj[product];
                        sousTotal+=thisCost * obj[product];

                        if(thisCost > 0){
                            totalNb++;
                        }
                    }
                }
                catch{}
            }

            if(reducPour > 0){
                let id = -1;
                // Check if already here
                for(let i=0; i<ws_data.length; i++){
                    if(ws_data[i][0] == products[18][0]){
                        id = i;
                        break;
                    }
                }
                let reduc = sousTotal/100*Math.abs(reducPour);
                if(id != -1){
                    ws_data[id][1] += 1;
                    ws_data[id][3] -= reduc;
                }
                else{
                    ws_data.push([products[18][0], 1, -1, -reduc]);
                }
                totalMoney -= reduc;
            }
        }
    }
    ws_data.sort(sortCommand);
    ws_data.unshift(['Plats par popularités' , 'Nombre de plats', 'Coût seul', 'Coût total', '', 'Ticket moyen', 'Nombre de repas']);
    ws_data[1].push("", totalMoney/totalCmd, totalCmd);
    ws_data.push([], ['TOTAL', totalNb, "", totalMoney]);
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

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
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;    
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
        var absPath = cordova.file.externalRootDirectory;
        var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
        var fileName = name+".xlsx";
        var filePath = fileDir + fileName;
    
        fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry) {
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

        }, function(err) {});
    }, function(err) {});
    }
    catch(error){
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), name+".xlsx");
    }
}
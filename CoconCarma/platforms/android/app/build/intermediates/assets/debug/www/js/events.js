// Hide commands
$("#cmds").on('click', function(e){
    if (e.target !== this)
        return;

    $("#cmds").css('visibility', 'hidden');
});


// Shows commands
$("#myCmd").on('click', function(){
    $("#cmds").css('visibility', 'visible');
    $("#cmdConteneur").empty();
    console.log(localStorage);
    for(let i = 0; i < localStorage.length; i++){
        let toShow = "";
        if(localStorage.key(i)[0] != 'C'){
            continue;
        }

        let obj = JSON.parse(localStorage.getItem(localStorage.key(i)));
        for(let key in obj){
            try{
                if(!isNaN(key)){
                    toShow += products[key][0];
                }
                else if(key.includes('M')){
                    toShow += "Menu "+formules[key[1]][0];
                }
                else{
                    toShow += "Formules "+formules[key[2]][0];
                }
                toShow += ", ";
            }
            catch{}
        }
        toShow = toShow.substring(0, toShow.length-2);

        $("#cmdConteneur").prepend("<li class='cmdList' data-command='"+localStorage.key(i)+"'>"+toShow+"<span class='suprCmd'></span></li>");
    }
});


$("#cmdConteneur").on('click', ".suprCmd", function(event){
    localStorage.removeItem($(this).parent().data("command"));
    $(this).parent().remove();

    event.stopPropagation();
});

$("#clearCmd").on('click', function(){
    localStorage.clear();
    $("#cmds").css('visibility', 'hidden');
});

// Get clicks on commands
$("#cmdConteneur").on('click', ".cmdList", function(){
    modifyCmd = $(this).data("command");
    // Cur to raw
    curCommande = JSON.parse(localStorage.getItem(modifyCmd));
    rawCommande = {};
    // Pour simplifier
    rawCommande[0] = 0;
    rawCommande[5] = 0;
    rawCommande[1] = 0;
    rawCommande[2] = 0;
    rawCommande[3] = 0;
    rawCommande[4] = 0;

    for(let item in curCommande){
        if(isNaN(item) && item[0].toUpperCase() === item[0]){
            if(item.includes('M') || item.includes('e')){
                rawCommande[0]++;
            }
            rawCommande[item.match(/\d+/)[0]]++;
            if(item.includes('M') || item.includes('d')){
                rawCommande[5]++;
            }
        }
        else{
            rawCommande[item] = curCommande[item];
        }
    }
    $("#cmds").css('visibility', 'hidden');
    redraw();
});


// Fills the from tables on startUp
$(".from .item").each(function(index){
    $(this).append('<td class="titre">'+ products[$(this).data("item-id")][0] +'</td>\
                    <td class="prix">'+ products[$(this).data("item-id")][1] +'</td>');
});


// Hide OnSubmit
$("#modal").on('click', function(e){
    if (e.target !== this)
        return;

    $("#modal").css('visibility', 'hidden');
});


// Manages the modal OnSubmit
$("#submit").on('click', function(){
    if(total <= 0){
        return;
    }
    $("#Rest").html(total);
    $(".payMode").each(function(){
        if(modifyCmd != -1){
            $(this).val(curCommande[$(this).attr("id")]);
        }else{
            $(this).val('');
        }
    });
    $("#modal").css('visibility', 'visible');
});


$(".payMode").on('input', function(){
    let subTotal = total;
    $(".payMode").each(function(){
        if(!isNaN(parseFloat($(this).val()))){
            subTotal -= parseFloat($(this).val());
        }
    });
    subTotal = Math.round(subTotal*100)/100;
    $("#Rest").html(subTotal);
});


$("#End").on('click', function(){
    if($("#Rest").text() > 0){
       return; 
    }
    
    $("#modal").css('visibility', 'hidden');
    $("#to").empty();
    rawCommande = {};

    // add the payment mode to curCommand
    $(".payMode").each(function(){
        if(!isNaN(parseFloat($(this).val()))){
            curCommande[$(this).attr('id')] = parseFloat($(this).val());
        }
    });

    if (typeof(Storage) !== "undefined") {
        if(modifyCmd == -1){
            if(localStorage.getItem("nbC") === null){
                localStorage.setItem("nbC", 0);
            }
            else{
                localStorage.setItem("nbC", Number(localStorage.getItem("nbC"))+1);
            }
            localStorage.setItem("C"+localStorage.getItem("nbC"), JSON.stringify(curCommande));
        }
        else{
            localStorage.setItem(modifyCmd, JSON.stringify(curCommande));
        }
        modifyCmd = -1;
    }
    else {
        alert("Désolé ce navigateur ne supporte pas la sauvegarde");
    }
});


$("#menu").on('click', 'td', function(){
    $("#t"+id).css('display', 'none');
    $("#"+id).removeClass('highlight');

    id = $(this).attr('id');
    $("#"+id).addClass('highlight');
    $("#t"+id).css('display', 'table');
});


// Recupère les clicks sur les elements 'tr' qui ont un parent avec l'id 'from' 
$("table.from").on('click', 'tr', function(){

    let id = $(this).data("item-id");
    if(id in rawCommande){
        rawCommande[id]++;
    }
    else{
        rawCommande[id] = 1;
    }
    redraw();
});


// Recupère les clicks sur les éléments fils de '#to' ayant la classe 'supr' (et de type 'td')
$("#to").on('click', 'td.supr', function(){
    let parent = $(this).parent().data("item-id");
    if(isNaN(parent)){
        if(parent.includes('M') || parent.includes('e')){
            rawCommande[0] -= curCommande[parent];
        }
        rawCommande[parent.match(/\d+/)[0]] -= curCommande[parent];
        if(parent.includes('M') || parent.includes('d')){
            rawCommande[5] -= curCommande[parent];
        }
        if(parent.includes('B')){
            rawCommande[Number(parent.substring(parent.length-1, parent.length))+6] -= curCommande[parent];
        }
    }
    else{
        rawCommande[parent] -= curCommande[parent];
    }
    redraw();
});

// Gère les '+' et '-'
$("#to").on('click', 'span', function(){
    let parent = $(this).parent().parent().data("item-id");
    let add = 0;

    if($(this).hasClass('moins')){
        add = -1;
    }
    else if($(this).hasClass('plus')){
        add = 1;
    }

    if(isNaN(parent)){
        if(parent.includes('M') || parent.includes('e')){
            rawCommande[0] += add;
        }
        rawCommande[parent.match(/\d+/)[0]] += add;
        if(parent.includes('M') || parent.includes('d')){
            rawCommande[5] += add
        }
        if(parent.includes('B')){
            rawCommande[Number(parent.substring(parent.length-1, parent.length))+6] += add;
        }
    }
    else{
        rawCommande[parent] += add;
    }

    redraw();
});


$("#toExcel").on('click', function(){
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
    for(let item in localStorage){
        if(item[0] == 'C'){
            let obj = JSON.parse(localStorage.getItem(item));
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

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        var absPath = cordova.file.externalRootDirectory;
        var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
        var fileName = name+".xlsx";
        var filePath = fileDir + fileName;
    
        fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    console.log("Success");
                };
                fileWriter.onerror = function (e) {
                    console.log("Fail with ", e);
                };
                fileWriter.write(new Blob([s2ab(wbout)],{type:"application/octet-stream"}));
            });

        }, function(err) {});
    }, function(err) {});

    //saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), name+".xlsx");
});
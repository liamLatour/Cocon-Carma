// Hide modals when clicks away
$(".modal").on('click', function(e){
    if (e.target !== this)
        return;

    $(this).css('visibility', 'hidden');
});


// Fills prices
$("#settings").on('click', function(){
    $("#sets").css('visibility', 'visible');
    fillPrices();
});

// Remove Item
$("#pricesSetting").on('click', '.remProd', function(){
    var r = confirm("Voulez vous supprimer ce plat ?");
    if (r == true) {
        delete products[$(this).parent().data("id")];
        saveData("Prods", JSON.stringify(products));
        fillTable();
        redraw();
        fillPrices();
    }
});


// Add new item
$("#addPrice").on('click', function(){
    $("#addItem").css('visibility', 'visible');
});

$("#confirmNewItem").on('click', function(){
    if($("#newName").val() == "" || $("#newName").val() == undefined ||
       $("#newPrice").val() == "" || $("#newPrice").val() == undefined ||
       $("#newCategorie").val() == "" || $("#newCategorie").val() == undefined){
        return;
    }

    $("#addItem").css('visibility', 'hidden');

    let newIndex = 0;

    for(let index in products){
        if(parseInt(index) >= newIndex){
            newIndex = parseInt(index)+1;
        }
    }

    products[newIndex] = [$("#newName").val(), parseFloat($("#newPrice").val()), parseInt($("#newCategorie").val())];

    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
    fillPrices();
});

// Saves prices
$("#confirmPrice").on('click', function(){
    $("#sets").css('visibility', 'hidden');
    products = {};
    formules = {};
    
    products[0] = ['Remise pourcentage', -1, 3, 'P'];
    products[1] = ['Remise euro', -1, 3, 'E'];

    $("#pricesSetting label").each(function(){
        if($(this).attr('class') == "formul"){
            if($(this).attr('id')!=undefined){
                formules[ parseInt($(this).attr('id')[2]) ] = [$(this).html().substring(8), 
                                                                parseFloat($(this).next().val()), 
                                                                parseFloat($(this).next().next().next().next().val())
                                                              ];
            }
        }
        else{
            products[ parseInt($(this).data('id')) ] = [$(this).text(), parseFloat($(this).next().val()), parseInt($(this).data("catid"))];
        }
    });

    saveData("Prods", JSON.stringify(products));
    saveData("Forms", JSON.stringify(formules));
    fillTable();
    redraw();
});


// Shows commands
$("#myCmd").on('click', function(){
    $("#cmds").css('visibility', 'visible');
    $("#cmdConteneur").empty();
    for(let item in getData()){
        if(item[0] != 'C'){
            continue;
        }

        let toShow = "";
        let obj = JSON.parse(getData(item));
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

        $("#cmdConteneur").prepend("<li class='cmdList' data-command='"+item+"'>"+toShow+"<span class='suprCmd'></span></li>");
    }
});


$("#cmdConteneur").on('click', ".suprCmd", function(event){
    var r = confirm("Voulez vous supprimer cette commande ?");
    if (r == true) {
        removeData($(this).parent().data("command"));
        $(this).parent().remove();
    }
    event.stopPropagation();
});

$("#clearCmd").on('click', function(){
    removeData();
    $("#cmds").css('visibility', 'hidden');
});

// Get clicks on commands
$("#cmdConteneur").on('click', ".cmdList", function(){
    modifyCmd = $(this).data("command");
    // Cur to raw
    curCommande = JSON.parse(getData(modifyCmd));
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


// Manages the modal OnSubmit
$("#submit").on('click', function(){
    if(total <= 0){
        return;
    }
    $("#Rest").html(total);
    // fills the payment mode
    $(".payMode").each(function(){
        if(modifyCmd != -1){
            $(this).val(curCommande[$(this).attr("id")]);
        }else{
            $(this).val('');
        }
    });
    $("#modal").css('visibility', 'visible');
});

// Auto update sum to pay
$(".payMode").on('input', function(){
    let subTotal = total;
    $(".payMode").each(function(){
        if(!isNaN(parseFloat($(this).val()))){
            subTotal -= parseFloat($(this).val());
        }
    });
    subTotal = coolRound(subTotal);
    $("#Rest").html(subTotal);
});

// Sauvegarde la commande
$("#End").on('click', function(){
    if($("#Rest").text() > 0){
       return; 
    }
    
    $("#modal").css('visibility', 'hidden');
    $("#to").empty();
    $("#fTo .prix").html("");
    rawCommande = {};

    // add the payment mode to curCommand
    $(".payMode").each(function(){
        if(!isNaN(parseFloat($(this).val()))){
            curCommande[$(this).attr('id')] = parseFloat($(this).val());
        }
    });

    if (typeof(Storage) !== "undefined") {
        if(modifyCmd == -1){
            if(getData("nbC") === null){
                saveData("nbC", 0);
            }
            else{
                saveData("nbC", Number(getData("nbC"))+1);
            }
            saveData("C"+getData("nbC"), JSON.stringify(curCommande));
        }
        else{
            saveData(modifyCmd, JSON.stringify(curCommande));
        }
        modifyCmd = -1;
    }
    else {
        alert("Désolé ce navigateur ne supporte pas la sauvegarde");
    }
});


// Gère le menu
$("#menu").on('click', 'td', function(){
    if($(this).attr('id') == null || $(this).attr('id') == undefined ){
        return;
    }
    $("#t"+currentMenuId).css('display', 'none');
    $("#"+currentMenuId).removeClass('highlight');

    currentMenuId = $(this).attr('id');
    $("#"+currentMenuId).addClass('highlight');
    $("#t"+currentMenuId).css('display', 'table');
});


// Recupère les clicks sur les elements 'tr' qui ont un parent avec l'id 'from' 
$("table.from").on('click', 'tr', function(){
    let item = $(this).data("item-id");
    addItem(item, 1);
});


// Recupère les clicks sur les éléments fils de '#to' ayant la classe 'supr' (et de type 'td')
$("#to").on('click', 'td.supr', function(){
    let item = $(this).parent().data("item-id");
    addItem(item);
});

// Gère les '+' et '-'
$("#to").on('click', 'span', function(){
    let item = $(this).parent().parent().data("item-id");

    if($(this).hasClass('moins')){
        addItem(item, -1);
    }
    else if($(this).hasClass('plus')){
        addItem(item, 1);
    }
});


$("#toExcel").on('click', function(){
    exportExcel();
});

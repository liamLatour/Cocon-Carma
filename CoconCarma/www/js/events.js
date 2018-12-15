﻿"use strict";
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
    let id = $(this).parent().data("id");
    
    // Check whether this item is used or not
    for(let com in getData()){
        if(com[0] != 'C'){
            continue;
        }
        let obj = JSON.parse(getData(com));
        let decompressedObj = demystify(obj)[0];

        for(let it in decompressedObj){
            if(it == id){
                alert("Ce plat est dans au moins une formule, il ne peut être suprimé");
                return;
            }
        }
    }


    delete products[id];
    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
    fillPrices();
});

$("#resetPrices").on('click', function(){
    removeData("Prods");
    products = JSON.parse(JSON.stringify(defaults));
    fillTable();
    redraw();
    fillPrices();
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

    let radioValue = $("input[name='radio']:checked").val();

    if(parseInt($("#newCategorie").val()) === 1){
        if(radioValue === "dessert"){
            alert("Impossible d'avoir un dessert dans les boissons");
            return;
        }
        else if(radioValue === "entree"){
            alert("Impossible d'avoir une entrée dans les boissons");
            return;
        }
    }

    $("#addItem").css('visibility', 'hidden');

    let newIndex = 0;

    // Avoids to overwrite anything
    for(let index in products){
        if(parseInt(index) >= newIndex){
            newIndex = parseInt(index)+1;
        }
    }

    if(radioValue === "dessert"){
        products[newIndex] = [$("#newName").val(), parseFloat($("#newPrice").val()), parseInt($("#newCategorie").val()), 'D'];
    }
    else if(radioValue === "entree"){
        products[newIndex] = [$("#newName").val(), parseFloat($("#newPrice").val()), parseInt($("#newCategorie").val()), 'S'];
    }
    else{
        products[newIndex] = [$("#newName").val(), parseFloat($("#newPrice").val()), parseInt($("#newCategorie").val())];
    }

    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
    fillPrices();
});


// Saves prices (only updates name and price)
$("#confirmPrice").on('click', function(){
    $("#sets").css('visibility', 'hidden');

    $("#pricesSetting label").each(function(){
        if($(this).attr('class') == "formul"){
            if($(this).attr('id')!=undefined){
                let id = parseInt($(this).attr('id')[2]);
                products[id][3][0] = parseFloat($(this).next().val());
                products[id][3][1] = parseFloat($(this).next().next().next().next().val());
                products[id][3][2] = $(this).html().replace(/formule /ig, '').replace(/menu /ig, '');
            }
        }
        else{
            // MODIFY only the name and price
            let id = parseInt($(this).data('id'));
            products[id][0] = $(this).children().eq(1).val();
            products[id][1] = parseFloat($(this).next().val());
        }
    });

    saveData("Prods", JSON.stringify(products));
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
                    toShow += "Menu "+ products[key[1]][3][2];
                }
                else{
                    toShow += "Formules "+ products[key[2]][3][2];
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
    rawCommande = demystify(curCommande)[0];

    $("#cmds").css('visibility', 'hidden');
    redraw();
});


// Manages the modal OnSubmit
$("#submit").on('click', function(){
    if(total <= 0){
        console.warn("No Items");
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

        // Update the Real Time Peolple Count
        updateRealTimeStats();
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
    if($(this).data("nbper")){
        addItem(item, Number($(this).data("nbper")));
        return;
    }
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

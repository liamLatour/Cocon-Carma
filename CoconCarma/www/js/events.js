﻿$("#sets").on('click', function(e){
    if (e.target !== this)
        return;

    $("#sets").css('visibility', 'hidden');
});

$("#settings").on('click', function(){
    $("#sets").css('visibility', 'visible');
    $("#pricesSetting").empty();

    for(let i in products){
        $("#pricesSetting").append("<label>"+ products[i][0] +"</label><input type='text' class='payMode' value='"+ products[i][1] +"'><br>");
    }
});

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
    for(let item in getData()){
        let toShow = "";
        if(item[0] != 'C'){
            continue;
        }

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
    removeData($(this).parent().data("command"));
    $(this).parent().remove();

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
    subTotal = Math.round(subTotal*100)/100;
    $("#Rest").html(subTotal);
});

// Sauvegarde la commande
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
    $("#t"+id).css('display', 'none');
    $("#"+id).removeClass('highlight');

    id = $(this).attr('id');
    $("#"+id).addClass('highlight');
    $("#t"+id).css('display', 'table');
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
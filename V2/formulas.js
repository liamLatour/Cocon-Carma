"use strict";
// Shape is :
/*
    curCommande = {
        id : quantity,
        ...
    }
*/
var curCommande = {};
var rawCommande = {};
var total = 0;
var modifyCmd = -1;

var formules = {
    1 : ["Snack", 7.5, 11],
    2 : ["Salade", 10, 13.5],
    3 : ["Végé", 10, 13.5],
    4 : ["Omni", 12, 15]
};
var products = {
    0 : ['Entrée', 4],
    1 : ['Snack', 5],
    2 : ['Salade/Buddha Bowl', 7.5],
    3 : ['Végétarian', 8],
    4 : ['Omnivore', 10],
    5 : ['Dessert', 4],

    6 : ['Eau détox', 1.5],
    7 : ['Eau minérale plate', 1.5],
    8 : ['Eau minérale gazeuse', 2.5],
    9 : ['Lait végétal', 2.5],
    10 : ['Jus fruits, légumes, smoothie', 5],
    11 : ['Expresso simple', 2],
    12 : ['Expresso double', 4],
    13 : ['Thé, rooibos, infusion', 2.5],

    14 : ['Jetable écologique', 0.5],
    15 : ['MontBento original', 30],
    16 : ['MontBento square', 25],
    17 : ['Kit 4 couverts inox', 2],

    18 : ['Remise pourcentage', -1, 'P'],
    19 : ['Remise euro', -1, 'E']
};

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
    for(let i = 0; i < localStorage.length; i++){
        $("#cmdConteneur").prepend("<li>" + localStorage.getItem(localStorage.key(i)) + "</li>");
    }
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
    $("#modal").css('visibility', 'visible');
});

$(".payMode").on('change', function(){
    let subTotal = total;
    $(".payMode").each(function(){
        try{
            subTotal -= $(this).val().match(/\d+/)[0];
        }
        catch{}
    });
    $("#Rest").html(subTotal);
});

$("#End").on('click', function(){
    if($("#Rest").text() > 0){
       return; 
    }
    
    $("#modal").css('visibility', 'hidden');
    $("#to").empty();
    rawCommande = {};

    if (typeof(Storage) !== "undefined") {

        //localStorage.getItem(name)
        
        if(modifyCmd == -1){
            localStorage.setItem("C"+localStorage.length, JSON.stringify(curCommande));
        }
        else{
            localStorage.setItem(modifyCmd, JSON.stringify(curCommande));
        }
    }
    else {
        alert("Désolé ce navigateur ne supporte pas la sauvegarde");
    }
});

// Manages the list of items
var id = "Pri";
$("#menu").on('click', 'td', function(){
    $("#t"+id).css('display', 'none');

    id = $(this).attr('id');
    $("#t"+id).css('display', 'table');
});

function supZeros(c){
    for(let key in c){
        if(c[key] <= 0){
            delete c[key];
        }
    }
    return c;
}

// Check for Formulas
function checkFormules(cmd){
    let commande = supZeros(cmd);
    
    let entree = commande[0] === undefined ? 0 : commande[0];
    let desert = commande[5] === undefined ? 0 : commande[5];
    let nb = entree > desert ? entree : desert;

    for(let formu = 0; formu<nb; formu++){
        for(let i=1; i<5; i++){
            if(i in commande && commande[i] > 0){
                if(entree > 0 && desert > 0){
                    commande[i]--;
                    commande[0]--;
                    commande[5]--;
                    entree--;
                    desert--;
                    if(("M"+i) in commande){
                        commande["M"+i]++;                            
                    }
                    else{
                        commande["M"+i] = 1;
                    }
                }
                else if(entree > 0){
                    commande[i]--;
                    commande[0]--;
                    entree--;
                    if(("Fe"+i) in commande){
                        commande["Fe"+i]++;                            
                    }
                    else{
                        commande["Fe"+i] = 1;
                    }
                }
                else if(desert > 0){
                    commande[i]--;
                    commande[5]--;
                    desert--;
                    if(("Fd"+i) in commande){
                        commande["Fd"+i]++;                            
                    }
                    else{
                        commande["Fd"+i] = 1;
                    }
                }
            }
        }
    }
    return supZeros(commande);
}


function recalculateSum(){
    let remise = 0;
    total = 0;

    curCommande = {};
    Object.assign(curCommande, rawCommande);
    curCommande = checkFormules(curCommande);

    for(let key in curCommande){
        if(isNaN(key)){
            if(key.includes('M')){
                total += formules[key.replace('M', '')][2];
            }
            else{
                total += formules[key.substring(2, 3)][1];
            }
        }
        else{
            if(products[key][1] < 0 && products[key][2] === 'P'){
                remise = curCommande[key];
            }
            else{
                total += products[key][1] * curCommande[key];
            }
        }
    }

    total = total/100*(100- Math.abs(remise));
    total = Math.round(total*100)/100;

    $("#fTo .prix").html(total + "€");
}


function redraw(){
    recalculateSum();

    $("#to").empty();
    for(let key in curCommande){
        if(isNaN(key)){
            let itemData = "<tr class='item' data-item-id='"+key+"'>\
                                <td class='titre'>";

            if(key.includes('M') || key.includes('e')){
                itemData += products[0][0] + "</br>";
            }

            let id = key.match(/\d+/)[0];
            itemData += products[id][0];

            if(key.includes('M') || key.includes('d')){
                itemData += "</br>" + products[5][0];
            }

            itemData += "<td class='quantite'><span class='moins hover'>-</span>"+ curCommande[key] +"<span class='plus hover'>+</span></td>";

            if(key.includes('M')){
                itemData += "<td class='prix'>"+ formules[id][2] * curCommande[key] +"</td>";
            }
            else{
                itemData += "<td class='prix'>"+ formules[id][1] * curCommande[key] +"</td>";
            }

            itemData += "<td class='supr hover'></td></tr>";

            $("#to").prepend(itemData);
        }
        else{
            let itemData = "<tr class='item' data-item-id='"+ key +"'>\
                                <td class='titre'>"+ products[key][0] +"</td>\
                                <td class='quantite'><span class='moins hover'>-</span>"+ curCommande[key] +"<span class='plus hover'>+</span></td>\
                                <td class='prix'>"+ curCommande[key] * products[key][1] +"</td>\
                                <td class='supr hover'></td>\
                            </tr>";
                    if(products[key][1] < 0){
                    $("#to").append(itemData);
                    }
                    else{
                    $("#to").prepend(itemData);
                    }
        }
    }
}

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
    }
    else{
        rawCommande[parent] -= curCommande[parent];
    }
    redraw();
});

// Gère les '+' et '-'
$("#to").on('click', 'span', function(){
    let parent = $(this).parent().parent().data("item-id");

    if($(this).hasClass('moins')){
        if(isNaN(parent)){
            if(parent.includes('M') || parent.includes('e')){
                rawCommande[0]--;
            }
            rawCommande[parent.match(/\d+/)[0]]--;
            if(parent.includes('M') || parent.includes('d')){
                rawCommande[5]--;
            }
        }
        else{
            rawCommande[parent]--;
        }
    }
    else if($(this).hasClass('plus')){
        if(isNaN(parent)){
            if(parent.includes('M') || parent.includes('e')){
                rawCommande[0]++;
            }
            rawCommande[parent.match(/\d+/)[0]]++;
            if(parent.includes('M') || parent.includes('d')){
                rawCommande[5]++;
            }
        }
        else{
            rawCommande[parent]--;
        }
    }
    redraw();
});

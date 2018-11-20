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
        toShow = toShow.substring(0, toShow.length-2);

        $("#cmdConteneur").prepend("<li class='cmdList' data-command='"+localStorage.key(i)+"'>"+toShow+"</li>");
    }
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
        if(isNaN(item)){
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
        $(this).val('');
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
        if(modifyCmd == -1){
            localStorage.setItem("C"+localStorage.length, JSON.stringify(curCommande));
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

    id = $(this).attr('id');
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
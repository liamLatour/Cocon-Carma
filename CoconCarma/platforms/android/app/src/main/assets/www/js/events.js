"use strict";

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
    
    if(dataNotUsed(function(item){
        if(item == id){ return true; }
        else{ return false; }
    }, function(name){
        alert("Le produit '"+ name +"' est dans au moins une formule, il ne peut être modifié");
    }) ){
        return;
    };


    delete products[id];
    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
    fillPrices();
});


$("#resetPrices").on('click', function(){
    if(dataNotUsed(function(item){
        if(!(item in defaults) || (products[item][1] != defaults[item][1]) ){ return true; }
        else{ return false; }
    }, function(name){
        alert("Le produit '"+ name +"' est dans au moins une formule, il ne peut être modifié");
    }) ){
        return;
    };

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

    if(radioValue === "mf"){
        if($("#newMenuPrice").val() == undefined || $("#newMenuPrice").val() <= 0 ||
            $("#newFormulePrice").val() == undefined || $("#newFormulePrice").val() <= 0){
                alert("Impossible d'avoir ce prix pour les formules");
                return;
        }
    }


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

    for(let item in products){
        if(products[item][0].toLowerCase() === $("#newName").val().toLowerCase()){
            alert("Impossible d'avoir deux produits avec le même nom");
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
    else if(radioValue === "mf"){
        products[newIndex] = [$("#newName").val(),
                                parseFloat($("#newPrice").val()),
                                parseInt($("#newCategorie").val()),
                                [$("#newFormulePrice").val(),
                                    $("#newMenuPrice").val(),
                                    $("#newName").val()
                                ]
                            ];
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
            let id = parseInt($(this).data('id'));
            let name = $(this).children().eq(1).val();

            if(parseFloat($(this).next().val()) != products[id][1]){ // Check it is not a used product with different price
                if(dataNotUsed(function(item){
                    if(item == id){ return true; }
                    else{ return false; }
                }, function(name){
                    alert("Le produit '"+ name +"' est dans au moins une formule, il ne peut être modifié");
                }) ){
                    return;
                };
            }
            if(products[id][0] != name){ // Check it is not a used product with same name
                if($("#pricesSetting label").each(function(){
                    if($(this).attr('class') != "formul" && parseInt($(this).data('id')) != id){
                        if($(this).children().eq(1).val().toLowerCase() === name.toLowerCase()){
                            alert("Impossible d'avoir deux produits avec le même nom");
                            return true;
                        }
                    }
                }) ){
                    return;
                };
            }

            // MODIFY only the name and price
            products[id][0] = name;
            products[id][1] = parseFloat($(this).next().val());
        }
    });

    $("#sets").css('visibility', 'hidden');

    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
});


// Shows commands
$("#myCmd").on('click', function(){
    $("#cmds").css('visibility', 'visible');
    fillCommands();
});


$("#cmdConteneur").on('click', ".suprCmd", function(event){
    var r = confirm("Voulez vous supprimer cette commande ?");
    if (r == true) {
        removeData($(this).parent().data("command"));
        $(this).parent().remove();
        updateRealTimeStats();
        fillCommands();
    }
    event.stopPropagation();
});

$("#clearCmd").on('click', function(){
    removeData();
    $("#cmds").css('visibility', 'hidden');
    updateRealTimeStats();
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

    if(modifyCmd == -1){
        if(getData("nbC") === null){
            saveData("nbC", 0);
        }
        else{
            saveData("nbC", Number(getData("nbC"))+1);
        }
        curCommande["time"] = new Date();
        saveData("C"+getData("nbC"), JSON.stringify(curCommande));
    }
    else{
        // TODO: Specify it has been modified
        let old = JSON.parse(getData(modifyCmd));
        curCommande["modified"] = addition(difference(curCommande, old), old["modified"]); // The difference between old one and new one
        curCommande["time"] = new Date();
        saveData(modifyCmd, JSON.stringify(curCommande));
    }
    modifyCmd = -1;

    // Update the Real Time Peolple Count
    updateRealTimeStats();
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
    updateExcel();
});

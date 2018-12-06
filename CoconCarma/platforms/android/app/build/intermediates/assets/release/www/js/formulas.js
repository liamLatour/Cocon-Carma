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
// Add em to the modify price thing
var formules = {
    1 : ["Snack", 7.5, 11],
    2 : ["Salade", 10, 13.5],
    3 : ["Végé", 10, 13.5],
    4 : ["Omni", 12, 15]
};
var products = {
    0 : ['Entrée', 4],
    1 : ['Snack', 5],
    2 : ['Salade/Buddha Bowl', 8],
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

var currentMenuId = "Pri";


// Does startup things
let savedProducts = getData("Prods");
let savedFormules = getData("Forms");

if(savedProducts !== false && savedProducts !== null){
    products = JSON.parse(savedProducts);
}
if(savedFormules !== false && savedProducts !== null){
    formules = JSON.parse(savedFormules);
}
fillTable();


// Cleans the array
function supZeros(c){
    for(let key in c){
        if(c[key] <= 0 || isNaN(c[key])){
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
                let tag = "";
                if(entree > 0 && desert > 0){
                    commande[i]--;
                    commande[0]--;
                    commande[5]--;
                    entree--;
                    desert--;
                    tag = ("M"+i);
                }
                else if(entree > 0){
                    commande[i]--;
                    commande[0]--;
                    entree--;
                    tag = ("Fe"+i);
                }
                else if(desert > 0){
                    commande[i]--;
                    commande[5]--;
                    desert--;
                    tag = ("Fd"+i);
                }

                if(tag != ""){
                    // Add drinks
                    for(let b=0; b<8; b++){
                        if((b+6) in commande && commande[(b+6)] > 0){
                            commande[(b+6)]--;
                            tag += "B"+b;
                            break;
                        }
                    }

                    if(tag in commande){
                        commande[tag]++;                            
                    }
                    else{
                        commande[tag] = 1;
                    }
                }
            }
        }
    }
    return supZeros(commande);
}


function recalculateSum(){
    rawCommande = supZeros(rawCommande);
    let remise = 0;
    total = 0;

    curCommande = {};
    Object.assign(curCommande, rawCommande);
    curCommande = checkFormules(curCommande);

    for(let key in curCommande){
        if(isNaN(key)){
            if(key.includes('M')){
                total += formules[key.replace('M', '')[0]][2] * curCommande[key];
            }
            else if(key.includes('F')){
                total += formules[key.substring(2, 3)][1] * curCommande[key];
            }

            if(key.includes('B')){
                total += (products[Number(key.substring(key.length-1, key.length))+6][1] - 0.5) * curCommande[key];
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
    total = coolRound(total);

    $("#fTo .prix").html(total + "€");
}

// Sanitize prices
function redraw(){
    recalculateSum();

    $("#to").empty();
    for(let key in curCommande){
        if(isNaN(key) && key[0].toUpperCase() == key[0]){
            let reducEau = 0;
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

            // drinks
            if(key.includes('B')){
                itemData += "</br>" + products[Number(key.substring(key.length-1, key.length))+6][0];
                reducEau = products[Number(key.substring(key.length-1, key.length))+6][1] - 0.5;
            }

            itemData += "<td class='quantite'><span class='moins hover'>-</span>"+ curCommande[key] +"<span class='plus hover'>+</span></td>";

            if(key.includes('M')){
                itemData += "<td class='prix'>"+ coolRound((formules[id][2]+ reducEau) * curCommande[key]) +"</td>";
            }
            else{
                itemData += "<td class='prix'>"+ coolRound((formules[id][1]+ reducEau) * curCommande[key]) +"</td>";
            }

            itemData += "<td class='supr hover'></td></tr>";

            $("#to").prepend(itemData);
        }
        else if(!isNaN(key)){
            let itemData = "<tr class='item' data-item-id='"+ key +"'>\
                                <td class='titre'>"+ products[key][0] +"</td>\
                                <td class='quantite'><span class='moins hover'>-</span>"+ curCommande[key] +"<span class='plus hover'>+</span></td>\
                                <td class='prix'>"+ coolRound(curCommande[key] * products[key][1]) +"</td>\
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

function fillTable(){
    $(".from .item").empty();
    $(".from .item").each(function(){
        $(this).append('<td class="titre">'+ products[$(this).data("item-id")][0] +'</td>\
                        <td class="prix">'+ products[$(this).data("item-id")][1] +'</td>');
    });
}


function addItem(item, quantity=null){
    if(quantity == null){
        quantity = -curCommande[item];
    }

    if(!isNaN(item) && (rawCommande[item] == undefined || rawCommande[item] == null)){
        rawCommande[item] = quantity;
    }
    else{
        if(isNaN(item)){
            if(item.includes('M') || item.includes('e')){
                rawCommande[0] += quantity;
            }
            rawCommande[item.match(/\d+/)[0]] += quantity;
            if(item.includes('M') || item.includes('d')){
                rawCommande[5] += quantity;
            }
            if(item.includes('B')){
                rawCommande[Number(item.substring(item.length-1, item.length))+6] += quantity;
            }
        }
        else{
            rawCommande[item] += quantity;
        }
    }
    redraw();
}


function saveData(key, value){
    try{
        localStorage.setItem(key, value);
    }
    catch(error){
        console.log(error);
        alert("Sauvegarde échouée");
        return false;
    }
}

function removeData(key=null){
    if(key == null){
        localStorage.clear();
        saveData("Prods", JSON.stringify(products));
        saveData("Forms", JSON.stringify(formules));
    }
    else{
        try{
            localStorage.removeItem(key);
        }
        catch(error){
            console.log(error);
            alert("Sauvegarde échouée");
            return false;
        }
    }
}

function getData(key=null){
    if(key === null){
        // send a list of items
        return localStorage;
    }
    else{
        try{
            return localStorage.getItem(key);
        }
        catch(error){
            console.log(error);
            alert("Sauvegarde échouée");
            return false;
        }
    }
}

function coolRound(nb){
    return Math.round(nb*100)/100;
}
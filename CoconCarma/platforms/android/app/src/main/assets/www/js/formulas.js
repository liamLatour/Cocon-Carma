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
    3 : ["Snack", 7.5, 11],
    4 : ["Salade", 10, 13.5],
    5 : ["Végé", 10, 13.5],
    6 : ["Omni", 12, 15]
};
var products = {
    0 : ['Remise pourcentage', -1, 3, 'P'],
    1 : ['Remise euro', -1, 3, 'E'],

    2 : ['Entrée', 4, 0],
    3 : ['Snack', 5, 0],
    4 : ['Salade/Buddha Bowl', 8, 0],
    5 : ['Végétarian', 8, 0],
    6 : ['Omnivore', 10, 0],
    7 : ['Dessert', 4, 0],

    8 : ['Eau détox', 1.5, 1],
    9 : ['Eau minérale plate', 1.5, 1],
    10 : ['Eau minérale gazeuse', 2.5, 1],
    11 : ['Lait végétal', 2.5, 1],
    12 : ['Jus fruits, légumes, smoothie', 5, 1],
    13 : ['Expresso simple', 2, 1],
    14 : ['Expresso double', 4, 1],
    15 : ['Thé, rooibos, infusion', 2.5, 1],

    16 : ['Jetable écologique', 0.5, 2],
    17 : ['MontBento original', 30, 2],
    18 : ['MontBento square', 25, 2],
    19 : ['Kit 4 couverts inox', 2, 2]
};

var currentMenuId = "Pri";


// Does startup things
let savedProducts = getData("Prods");
let savedFormules = getData("Forms");

if(savedProducts !== false && savedProducts !== null){
    products = JSON.parse(savedProducts);
}
if(savedFormules !== false && savedFormules !== null){
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
    
    let entree = commande[2] === undefined ? 0 : commande[2];
    let desert = commande[7] === undefined ? 0 : commande[7];
    let nb = entree > desert ? entree : desert;
    
    for(let formu = 0; formu<nb; formu++){
        for(let i=3; i<7; i++){
            if(i in commande && commande[i] > 0){
                let tag = "";
                if(entree > 0 && desert > 0){
                    commande[i]--;
                    commande[2]--;
                    commande[7]--;
                    entree--;
                    desert--;
                    tag = ("M"+i);
                }
                else if(entree > 0){
                    commande[i]--;
                    commande[2]--;
                    entree--;
                    tag = ("Fe"+i);
                }
                else if(desert > 0){
                    commande[i]--;
                    commande[7]--;
                    desert--;
                    tag = ("Fd"+i);
                }

                if(tag != ""){
                    // Add drinks inteligently
                    if(tag.includes('M')){
                        for(let item in commande){
                            if(!isNaN(item) && products[item][2] == 1 && commande[item] > 0){
                                commande[item]--;
                                tag += "B"+item;
                                break;
                            }
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
                total += (products[ Number(key.match(/\d+$/)[0]) ][1] - 0.5) * curCommande[key];
            }
        }
        else{
            if(products[key][1] < 0 && products[key][3] === 'P'){
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
                itemData += products[2][0] + "</br>";
            }

            let id = key.match(/\d+/)[0];
            itemData += products[id][0];

            if(key.includes('M') || key.includes('d')){
                itemData += "</br>" + products[7][0];
            }

            // drinks
            if(key.includes('B')){
                itemData += "</br>" + products[Number(key.match(/\d+$/)[0])][0];
                reducEau = products[Number(key.match(/\d+$/)[0])][1] - 0.5;
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
    $(".from").empty();
    for(let item in products){
        $(".from:eq("+products[item][2]+")").append("<tr class='item' data-item-id='"+Number(item)+"' data-catid='"+ products[item][2] +"'>\
                                                        <td class='titre'>"+ products[item][0] +"</td>\
                                                        <td class='prix'>"+ products[item][1] +"</td>\
                                                    </tr>");
    }
}


function fillPrices(){
    $("#pricesSetting").empty();

    for(let i in products){
        if(products[i].length == 4){
            continue;
        }
        $("#pricesSetting").append("<label data-id='"+ i +"' data-catid='"+ products[i][2] +"'><span class='remProd'></span>"+ products[i][0] +"</label>\
                                        <input type='number' step='0.01' class='payMode' value='"+ products[i][1] +"'><br>");
    }

    for(let i in formules){
        // Formule
        $("#pricesSetting").append("<label class='formul' id='NB"+ i +"'>Formule "+ formules[i][0] +"</label>\
                                        <input type='number' step='0.01' class='payMode' value='"+ formules[i][1] +"'><br>");
        // Menu
        $("#pricesSetting").append("<label class='formul'>Menu "+ formules[i][0] +"</label>\
                                        <input type='number' step='0.01' class='payMode' value='"+ formules[i][2] +"'><br>");
    }
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
                rawCommande[2] += quantity;
            }
            rawCommande[item.match(/\d+/)[0]] += quantity;
            if(item.includes('M') || item.includes('d')){
                rawCommande[7] += quantity;
            }
            if(item.includes('B')){
                rawCommande[Number(item.match(/\d+$/)[0])] += quantity;
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
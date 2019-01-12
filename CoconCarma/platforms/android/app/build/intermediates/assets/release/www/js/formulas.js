var curCommande = {};
var rawCommande = {};
var total = 0;
var modifyCmd = -1;

var defaults = {
    0: ['Remise pourcentage', -1, 3, 'P'],
    1: ['Remise euro', -1, 3, 'E'],

    2: ['Entrée', 4, 0, 'S'],
    3: ['Snack', 5, 0, [7.5, 11, 'Snack']],
    4: ['Salade/Buddha Bowl', 8, 0, [10, 13.5, 'Salade']],
    5: ['Végétarien', 8, 0, [10, 13.5, 'Végé']],
    6: ['Omnivore', 10, 0, [12, 15, 'Omni']],
    7: ['Dessert', 4, 0, 'D'],

    8: ['Eau détox', 1.5, 1],
    9: ['Eau minérale plate', 1.5, 1],
    10: ['Eau minérale gazeuse', 2.5, 1],
    11: ['Lait végétal', 2.5, 1],
    12: ['Jus fruits, légumes, smoothie', 5, 1],
    13: ['Expresso simple', 2, 1],
    14: ['Expresso double', 4, 1],
    15: ['Thé, rooibos, infusion', 2.5, 1],

    16: ['Jetable écologique', 0.5, 2],
    17: ['MontBento original', 30, 2],
    18: ['MontBento square', 25, 2],
    19: ['Kit 4 couverts inox', 2, 2],

    20: ['Magazine Bien-être', 4.5, 3, 'M'],
    21: ['Consigne 0.5€', 0.5, 2],
    22: ['Consigne 1€', 1, 2]
};

var products;
var currentMenuId = "Pri";

// Just in case
var savedProducts = getData("Prods");
if (savedProducts !== false && savedProducts !== null) {
    products = JSON.parse(savedProducts);
} else {
    products = JSON.parse(JSON.stringify(defaults));
}
fillTable();
updateRealTimeStats();

// Cleans the array
function supZeros(c) {
    for (var key in c) {
        if (c[key] <= 0 || isNaN(c[key])) {
            delete c[key];
        }
    }
    return c;
}

// Check for Formulas
function checkFormules(cmd) {
    // 'commande' is just a copy of 'rawcommand' here
    var commande = supZeros(cmd);

    function easyAdd(id) {
        if (commande[id] === undefined) {
            commande[id] = 1;
        } else {
            commande[id]++;
        }
    }

    var formules = getFormulas();
    var DnS = getStartersDeserts();
    var entree = {};
    var desert = {};
    var meals = {};

    // Does the link between DnS/formules and the real command
    for (var it in DnS[0]) {
        entree[DnS[0][it]] = commande[DnS[0][it]] === undefined ? 0 : commande[DnS[0][it]];
    }
    for (it in DnS[1]) {
        desert[DnS[1][it]] = commande[DnS[1][it]] === undefined ? 0 : commande[DnS[1][it]];
    }
    for (it in formules) {
        meals[formules[it]] = commande[formules[it]] === undefined ? 0 : commande[formules[it]];
    }
    entree = supZeros(entree);
    desert = supZeros(desert);
    meals = supZeros(meals);

    // Loop through meals, sure there is some because of supZeros();
    noMoreMenus:
        for (var m in meals) {
            for (var nb = 0; nb < meals[m]; nb++) { // Loop through the number of main meals
                var desertFound = -1;
                var entreeFound = -1;
                for (var des in desert) {
                    if (desert[des] > 0) {
                        desert[des]--;
                        commande[des]--;
                        desertFound = des;
                        break;
                    }
                }
                for (var ent in entree) {
                    if (entree[ent] > 0) {
                        entree[ent]--;
                        commande[ent]--;
                        entreeFound = ent;
                        break;
                    }
                }

                // Add drinks inteligently
                if (desertFound != -1 && entreeFound != -1) {
                    commande[m]--;
                    drinks: {
                        for (var item in commande) {
                            if (!isNaN(item) && products[item][2] == 1 && commande[item] > 0) {
                                commande[item]--;
                                easyAdd("M" + m + "D" + desertFound + "E" + entreeFound + "B" + item);
                                break drinks;
                            }
                        }
                        easyAdd("M" + m + "D" + desertFound + "E" + entreeFound);
                    }
                } else if (desertFound != -1) {
                    commande[m]--;
                    easyAdd("F" + m + "D" + desertFound);
                } else if (entreeFound != -1) {
                    commande[m]--;
                    easyAdd("F" + m + "E" + entreeFound);
                } else {
                    break noMoreMenus;
                }
            }
        }
    return supZeros(commande);
}


function redraw() {
    // Recalculate sum
    curCommande = checkFormules(JSON.parse(JSON.stringify(supZeros(rawCommande))));
    total = demystify(curCommande)[1];
    $("#fTo .prix").html(total + "€");

    $("#to").empty();
    for (var key in curCommande) {
        if (key[0].toUpperCase() != key[0]) {
            continue;
        }

        var title = "";
        var quantity = curCommande[key];
        var price = 0;

        if (isNaN(key)) {
            var curObj = {};
            curObj[key] = 1;
            var curItem = demystify(curObj);

            for (var it in curItem[0]) {
                title += products[it][0] + "</br>";
            }
            price = curItem[1] * curCommande[key];

        } else {
            title = products[key][0];
            if(products[key][1] == 0){
                price = coolRound(curCommande[key]);
            }else{
                price = coolRound(curCommande[key] * products[key][1]);
            }
        }

        var itemData = "<tr class='item' data-item-id='" + key + "'>" +
            "<td class='titre'>" + title + "</td>" +
            "<td class='quantite'><span class='moins hover'>-</span>" + quantity + "<span class='plus hover'>+</span></td>" +
            "<td class='prix'>" + price + "</td>" +
            "<td class='supr hover'></td>" +
            "</tr>";

        if (price < 0) {
            $("#to").append(itemData);
        } else {
            $("#to").prepend(itemData);
        }
    }
}

function fillTable() {
    $(".from").empty();
    for (var item in products) {
        var prix = products[item][1];
        if (prix == 0) {
            prix = 'x';
        }

        $(".from:eq(" + products[item][2] + ")").append("<tr class='item' data-item-id='" + Number(item) + "' data-catid='" + products[item][2] + "'>" +
            "<td class='titre'>" + products[item][0] + "</td>" +
            "<td class='prix'>" + prix + "</td>" +
            "</tr>");
    }

    // Add the 5% and 10%
    $(".from:eq(3)").append("<tr class='item' data-item-id='0' data-catid='3' data-nbper='5'>" +
        "<td class='titre'>Remise pourcentage 5%</td>" +
        "<td class='prix'>-5%</td>" +
        "</tr>");
    $(".from:eq(3)").append("<tr class='item' data-item-id='0' data-catid='3' data-nbper='10'>" +
        "<td class='titre'>Remise pourcentage 10%</td>" +
        "<td class='prix'>-10%</td>" +
        "</tr>");
}


function fillPrices() {
    $("#pricesSetting").empty();

    for (var i in products) {
        if (products[i][1] < 0 && products[i].length == 4) {
            continue;
        }

        $("#pricesSetting").append("<label data-id='" + i + "' data-catid='" + products[i][2] + "'><span class='remProd'></span><input class='transparent OnePFiveText' value='" + products[i][0] + "'></input></label>" +
            "<input type='number' step='0.01' class='payMode OnePFiveText' value='" + products[i][1] + "'><br>");
    }

    var formulas = getFormulas();
    for (i in formulas) {
        // Formule
        $("#pricesSetting").append("<label class='formul' id='NB" + formulas[i] + "'>Formule " + products[formulas[i]][3][2] + "</label>" +
            "<input type='number' step='0.01' class='payMode OnePFiveText' value='" + products[formulas[i]][3][0] + "'><br>");
        // Menu
        $("#pricesSetting").append("<label class='formul'>Menu " + products[formulas[i]][3][2] + "</label>" +
            "<input type='number' step='0.01' class='payMode OnePFiveText' value='" + products[formulas[i]][3][1] + "'><br>");
    }
}


function fillCommands() {
    $("#cmdConteneur").empty();
    for (var item in getData()) {
        if (item[0] != 'C') {
            continue;
        }

        var toShow = "";
        var obj = JSON.parse(getData(item));
        for (var key in obj) {
            try {
                // Check whether it is a payment mode or not
                if (key[0] != key[0].toUpperCase()) {
                    continue;
                }

                if (!isNaN(key)) {
                    toShow += products[key][0];
                } else if (!isNaN(key[0]) && key.includes('P')) {
                    toShow += products[key.split("P")[0]][0];
                } else if (key.includes('M')) {
                    toShow += "Menu " + products[key.match(/(M)\d+/)[0].substring(1)][3][2];
                } else {
                    toShow += "Formules " + products[key.match(/(F)\d+/)[0].substring(1)][3][2];
                }
                toShow += ", ";
            } catch (error) {
                errorHandle("Erreur: " + error, 'hsl(357, 76%, 50%)', 'white');
            }
        }
        toShow = toShow.substring(0, toShow.length - 2);

        $("#cmdConteneur").prepend("<li class='cmdList' data-command='" + item + "'>" + toShow + "<span class='suprCmd'></span></li>");
    }
}

// Gets an object of compressed data and uncompress it && also sums it
function demystify(obj) {
    var realObj = {};
    var normalSum = 0;
    var percentagedSum = 0;
    var remise = 0;

    function easyAdd(id, nb) {
        if (realObj[id] === undefined) {
            realObj[id] = nb;
        } else {
            realObj[id] += nb;
        }
    }

    for (var key in obj) {
        if (isNaN(key)) {
            // Check whether it is a payment mode or not
            if (key[0] != key[0].toUpperCase()) {
                continue;
            }

            var meal;
            var drink = -1;

            // For the sum
            if (key.includes('M')) {
                meal = key.match(/(M)\d+/)[0].substring(1);
                percentagedSum += products[meal][3][1] * obj[key];
                if (key.includes('B')) {
                    drink = key.match(/(B)\d+/)[0].substring(1);
                    percentagedSum += (products[drink][1] - 0.5) * obj[key];
                }
            } else {
                meal = key.match(/(F)\d+/)[0].substring(1);
                percentagedSum += products[meal][3][0] * obj[key];
            }

            // For the rest
            if (key.includes('E')) {
                easyAdd(key.match(/(E)\d+/)[0].substring(1), obj[key]);
            }
            easyAdd(meal, obj[key]);
            if (key.includes('D')) {
                easyAdd(key.match(/(D)\d+/)[0].substring(1), obj[key]);
            }
            if (drink != -1) {
                easyAdd(drink, obj[key]);
            }
        } else {
            if (products[key][1] < 0 && products[key][3] === 'P') {
                remise = obj[key];
            } else {
                // If it is a:  meal || dessert || starter || drink
                if ((products[key].length === 4 && products[key][1] > 0) || products[key][2] === 1) {
                    percentagedSum += products[key][1] * obj[key];
                } else {
                    if (products[key][1] == 0) {
                        normalSum += obj[key];
                    } else {
                        normalSum += products[key][1] * obj[key];
                    }

                }
            }
            easyAdd(key, obj[key]);
        }
    }
    var sum = percentagedSum / 100 * (100 - Math.abs(remise)) + normalSum;

    return [realObj, coolRound(sum)];
}

function difference(obj1, obj2) {
    var copy1 = JSON.parse(JSON.stringify(obj1));
    for (var item in obj2) {
        if (item == "modified") {
            continue;
        }
        if (copy1[item] !== undefined) {
            copy1[item] -= obj2[item];
        } else {
            copy1[item] = -obj2[item];
        }
    }
    return copy1;
}

function addition(obj1, obj2) {
    var copy1 = JSON.parse(JSON.stringify(obj1));
    for (var item in obj2) {
        if (copy1[item] !== undefined) {
            copy1[item] += obj2[item];
        } else {
            copy1[item] = obj2[item];
        }
        if (copy1[item] == 0) {
            delete copy1[item];
        }
    }
    return copy1;
}

function getStartersDeserts() {
    var starters = [];
    var deserts = [];

    for (var it in products) {
        if (products[it].length === 4) {
            if (products[it][3] === 'S') {
                starters.push(it);
            } else if (products[it][3] === 'D') {
                deserts.push(it);
            }
        }
    }

    return [starters, deserts];
}

function getFormulas() {
    var indices = [];
    for (var i in products) {
        if (products[i].length === 4 && typeof products[i][3] !== 'string') {
            indices.push(i);
        }
    }
    return indices;
}

function updateRealTimeStats() {
    var nbPeople = 0;
    var totMoney = 0;
    for (var item in getData()) {
        if (item[0] === "C") {
            nbPeople++;
            totMoney += demystify(JSON.parse(getData(item)))[1];
        }
    }
    $("#realPeople").html("👥 " + nbPeople);
    $("#realMoney").html("💰 " + coolRound(totMoney));
    $("#realAverage").html("📈 " + coolRound(totMoney / nbPeople));
}


function addItem(item, quantity) {
    if (quantity == undefined) {
        quantity = -curCommande[item];
    }

    if (!isNaN(item) && (rawCommande[item] == undefined || rawCommande[item] == null)) {
        rawCommande[item] = quantity;
    } else {
        var thisItem = {};
        thisItem[item] = quantity;
        var items = demystify(thisItem)[0];

        for (var it in items) {
            rawCommande[it] += items[it];
        }
    }
    redraw();
}


function dataNotUsed(compareFunc, replyFunc) {
    for (var com in getData()) {
        if (com[0] != 'C') {
            continue;
        }
        var obj = JSON.parse(getData(com));
        var decompressedObj = demystify(obj)[0];
        for (var it in decompressedObj) {
            if (compareFunc(it)) {
                replyFunc(products[it][0]);
                return true;
            }
        }
    }
    return false;
}


function saveData(key, value) {
    if (typeof (Storage) !== "undefined") {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            errorHandle("Sauvegarde échouée, erreur: " + error, 'hsl(357, 76%, 50%)', 'white');
            return false;
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", 'hsl(357, 76%, 50%)', 'white');
    }
}

function removeData(key) {
    if (typeof (Storage) !== "undefined") {
        if (key == undefined) {
            localStorage.clear();
            saveData("Prods", JSON.stringify(products));
        } else {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                errorHandle("Sauvegarde échouée, erreur: " + error, 'hsl(357, 76%, 50%)', 'white');
                return false;
            }
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", 'hsl(357, 76%, 50%)', 'white');
    }
}

function getData(key) {
    if (typeof (Storage) !== "undefined") {
        if (key === undefined) {
            return localStorage; // send a list of items
        } else {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                errorHandle("Sauvegarde échouée, erreur: " + error, 'hsl(357, 76%, 50%)', 'white');
                return false;
            }
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", 'hsl(357, 76%, 50%)', 'white');
    }
}

function coolRound(nb) {
    var finNb = Math.round(nb * 100) / 100;
    return isNaN(finNb) ? 0 : finNb;
}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function errorHandle(name, colorBack, colorText, colorBorder) {
    console.warn(name);
    var div = $("#ALERT");
    div.stop(true);

    div.html(name);

    if (colorBack != undefined) {
        div.css('background-color', colorBack);
    } else {
        div.css('background-color', 'rgb(105, 105, 105)');
    }

    if (colorText != undefined) {
        div.css('color', colorText);
    } else {
        div.css('color', 'white');
    }

    if (colorBorder != undefined) {
        div.css('border-color', colorBorder);
    } else {
        div.css('border-color', 'white');
    }

    div.css({
        visibility: 'visible',
        top: '-' + div.css('height'),
        opacity: '1'
    });
    div.animate({
        top: '20px'
    }, 1000);
    div.animate({
        opacity: '1'
    }, 9000);
    div.animate({
        opacity: '0',
        visibility: 'hidden'
    }, 1000);
    div.css('top', '-80px');
}
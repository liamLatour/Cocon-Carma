var curCommande = {};
var rawCommande = {};
var total = 0;
var products;
var modifyCmd = -1;

/* #region Core Functions */
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
/* #endregion */


/* #region Redraw functions */
function redraw() {
    // Redraws everything (not optimized but who cares)
    fillTable();
    fillPrices();
    fillCommands();
    updateRealTimeStats();

    // Recalculate sum
    var curCommande = checkFormules(JSON.parse(JSON.stringify(supZeros(rawCommande))));
    //TODO: remove this (not OOP)
    total = demystify(curCommande)[1];
    $("#fTo .prix").html(total + "€");

    $("#to").empty();

    if (isEmpty(curCommande)) {
        $('#noContentProducts').css('display', 'block');
        return;
    } else {
        $('#noContentProducts').css('display', 'none');
    }

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
            if (products[key][1] == 0) {
                price = coolRound(curCommande[key]);
            } else {
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
    var commands = [];
    for (var item in getData()) {
        if (item[0] == 'C') {
            var curCommand = JSON.parse(getData(item));
            curCommand.item = item;
            commands.push(curCommand);
        }
    }

    if (isEmpty(commands)) {
        $('#noContentCommands').css('display', 'block');
        return;
    } else {
        $('#noContentCommands').css('display', 'none');
    }

    commands.sort(function (a, b) {
        at = a.time;
        bt = b.time;
        if (at === undefined && bt === undefined) {
            return 0;
        }
        if (at === undefined) {
            return 1;
        }
        if (bt === undefined) {
            return -1;
        }
        if (Date.parse(at) > Date.parse(bt)) {
            return 1;
        } else {
            return -1;
        }
    });

    for (var command in commands) {
        var obj = commands[command];
        var toShow = "";
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
                errorHandle("Erreur: " + error, colourPallets.Error);
            }
        }
        toShow = toShow.substring(0, toShow.length - 2);

        $("#cmdConteneur").prepend("<li class='cmdList' data-command='" + obj.item + "'>" + toShow + "<span class='suprCmd'></span></li>");
    }
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
/* #endregion */


/* #region Utility Functions */
function addItem(product, quantity) {
    if (quantity !== undefined) {
        var newPoduct = {};
        newPoduct[product] = quantity;
        product = newPoduct;
    }
    
    if (product == undefined) {
        rawCommande = {};
    } else {
        for (var item in product) {
            if (!isNaN(item) && (rawCommande[item] == undefined || rawCommande[item] == null)) {
                rawCommande[item] = product[item];
            } else {
                var thisItem = {};
                thisItem[item] = product[item];
                var items = demystify(thisItem)[0];

                for (var it in items) {
                    rawCommande[it] += items[it];
                }
            }
        }
    }
    redraw();
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
/* #endregion */


/* #region Data Management */
function saveData(key, value, draw = true) {
    if (typeof (Storage) !== "undefined") {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            errorHandle("Sauvegarde échouée, erreur: " + error, colourPallets.Error);
            return false;
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", colourPallets.Error);
    }
    if (draw) {
        redraw();
    }
}

function removeData(key, draw = true) {
    if (typeof (Storage) !== "undefined") {
        if (key == undefined) {
            localStorage.clear();
            saveData("Prods", JSON.stringify(products));
        } else {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                errorHandle("Sauvegarde échouée, erreur: " + error, colourPallets.Error);
                return false;
            }
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", colourPallets.Error);
    }
    if (draw) {
        redraw();
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
                errorHandle("Sauvegarde échouée, erreur: " + error, colourPallets.Error);
                return false;
            }
        }
    } else {
        errorHandle("Désolé ce navigateur ne supporte pas la sauvegarde", colourPallets.Error);
    }
}
/* #endregion */


/* #region Simple Functions */
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

function supZeros(c) {
    for (var key in c) {
        if (c[key] <= 0 || isNaN(c[key])) {
            delete c[key];
        }
    }
    return c;
}
/* #endregion */


/* #region Error Management */
function errorHandle(name, colorPallet) {
    if (colorPallet == colourPallets.Error) {
        console.error(name);
    } else if (colorPallet == colourPallets.Warning) {
        console.warn(name);
    } else if (colorPallet == colourPallets.Succes) {
        console.info(name);
    } else {
        console.log(name);
    }

    var startTime = Date.now();
    var div = $("#ALERT");
    div.stop(true);

    $("html").on('click', function (e) {
        if (e.target.id == "ALERT" || Date.now() - startTime < 500)
            return;

        div.stop(true);
        div.css('top', '-80px');
        $("html").off();
    });

    div.html(name);

    if (colorPallet != undefined) {
        div.css('background-color', colorPallet[0]);
        div.css('color', colorPallet[1]);
        div.css('border-color', colorPallet[2]);
    } else {
        div.css('background-color', colourPallets.Normal[0]);
        div.css('color', colourPallets.Normal[1]);
        div.css('border-color', colourPallets.Normal[2]);
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
    div.animate({
        top: '-80px'
    }, 1);
}

function Confirm(title, msg, $true, $false, funct, args) { /*change*/
    var $content = "<div class='modal' style='visibility:visible;z-index:99'>" +
        "<div class='dialog'><header>" +
        " <h3> " + title + " </h3> " +
        "</header>" +
        "<div class='dialog-msg'>" +
        " <p> " + msg + " </p> " +
        "</div>" +
        "<footer>" +
        "<div class='controls'>" +
        " <button class='button button-danger doAction'>" + $true + "</button> " +
        " <button class='button button-default cancelAction'>" + $false + "</button> " +
        "</div>" +
        "</footer>" +
        "</div>" +
        "</div>";
    $('body').prepend($content);
    $('.doAction').click(function () {
        funct(args);
        $(this).parents('.modal').fadeOut(10, function () {
            $(this).remove();
        });
    });
    $('.cancelAction, .fa-close').click(function () {
        $(this).parents('.modal').fadeOut(10, function () {
            $(this).remove();
        });
    });
}
/* #endregion */


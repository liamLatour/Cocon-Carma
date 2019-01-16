/* #region Evenements Généraux */
// Hide modals when clicks away
$(".modal:not(.persistent)").on('click', function (e) {
    if (e.target !== this)
        return;

    $(this).css('visibility', 'hidden');
});

// Gère le menu
$("#menu").on('click', 'td', function () {
    if ($(this).attr('id') == null || $(this).attr('id') == undefined) {
        return;
    }
    $("#t" + currentMenuId).css('display', 'none');
    $("#" + currentMenuId).removeClass('highlight');

    currentMenuId = $(this).attr('id');
    $("#" + currentMenuId).addClass('highlight');
    $("#t" + currentMenuId).css('display', 'table');
});
/* #endregion */


/* #region Price Settings */
// Fills prices
$("#settings").on('click', function () {
    $("#sets").css('visibility', 'visible');
    fillPrices();
});

$("#addPrice").on('click', function () {
    $("#addItem").css('visibility', 'visible');
    $("#confirmNewItem").on('click', function () {
        var radioValue = $("input[name='radio']:checked").val();
        var categorie = parseInt($("#newCategorie").val());
        var newIndex = 0;
        var price = $("#newPrice").val();
        var name = $("#newName").val();

        if (name == "" || name == undefined || isNaN(categorie)) {
            errorHandle("Veuillez remplir tous les champs", colourPallets.Warning);
            return;
        }

        if (radioValue === "mf") {
            if ($("#newMenuPrice").val() == undefined || $("#newMenuPrice").val() <= 0 ||
                $("#newFormulePrice").val() == undefined || $("#newFormulePrice").val() <= 0) {
                errorHandle("Impossible d'avoir un prix négatif pour les formules", colourPallets.Warning);
                return;
            }
        }

        if (categorie === 1) {
            if (radioValue === "dessert") {
                errorHandle("Impossible d'avoir un dessert dans les boissons", colourPallets.Warning);
                return;
            } else if (radioValue === "entree") {
                errorHandle("Impossible d'avoir une entrée dans les boissons", colourPallets.Warning);
                return;
            }
        }

        for (var item in products) {
            if (products[item][0].toLowerCase() === name.toLowerCase()) {
                errorHandle("Impossible d'avoir deux produits avec le même nom", colourPallets.Warning);
                return;
            }
        }

        if (price != "" && price != undefined) {
            price = parseFloat(price);
        } else {
            price = 0;
            errorHandle("Produit à prix libre ajouté", colourPallets.Succes);
        }

        $("#addItem").css('visibility', 'hidden');

        // Avoids to overwrite anything
        for (var index in products) {
            if (parseInt(index) >= newIndex) {
                newIndex = parseInt(index) + 1;
            }
        }

        if (radioValue === "dessert") {
            products[newIndex] = [name, price, categorie, 'D'];
        } else if (radioValue === "mf") {
            products[newIndex] = [name, price, categorie, [$("#newFormulePrice").val(), $("#newMenuPrice").val(), name]];
        } else if (radioValue === "entree") {
            products[newIndex] = [name, price, categorie, 'S'];
        } else {
            products[newIndex] = [name, price, categorie];
        }

        saveData("Prods", JSON.stringify(products));
        fillTable();
        redraw();
        fillPrices();
    });
});

$("#resetPrices").on('click', function () {
    if (dataNotUsed(function (item) {
            if (!(item in defaults) || (products[item][1] != defaults[item][1])) {
                return true;
            } else {
                return false;
            }
        }, function (name) {
            errorHandle("Le produit '" + name + "' est dans au moins une formule, il ne peut être modifié", colourPallets.Warning);
        })) {
        return;
    }

    removeData("Prods");
    products = JSON.parse(JSON.stringify(defaults));
    fillTable();
    redraw();
    fillPrices();
});

// Saves prices (only updates name and price)
$("#confirmPrice").on('click', function () {
    $("#pricesSetting label").each(function () {
        var id;
        if ($(this).attr('class') == "formul") {
            if ($(this).attr('id') != undefined) {
                id = parseInt($(this).attr('id')[2]);
                products[id][3][0] = parseFloat($(this).next().val());
                products[id][3][1] = parseFloat($(this).next().next().next().next().val());
                products[id][3][2] = $(this).html().replace(/formule /ig, '').replace(/menu /ig, '');
            }
        } else {
            id = parseInt($(this).data('id'));
            var name = $(this).children().eq(1).val();

            if (parseFloat($(this).next().val()) != products[id][1]) { // Check it is not a used product with different price
                if (dataNotUsed(function (item) {
                        if (item == id) {
                            return true;
                        } else {
                            return false;
                        }
                    }, function (name) {
                        errorHandle("Le produit '" + name + "' est dans au moins une formule, il ne peut être modifié", colourPallets.Warning);
                    })) {
                    return;
                }
            }
            if (products[id][0] != name) { // Check it is not a used product with same name
                if ($("#pricesSetting label").each(function () {
                        if ($(this).attr('class') != "formul" && parseInt($(this).data('id')) != id) {
                            if ($(this).children().eq(1).val().toLowerCase() === name.toLowerCase()) {
                                errorHandle("Impossible d'avoir deux produits avec le même nom", colourPallets.Warning);
                                return true;
                            }
                        }
                    })) {
                    return;
                }
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

// Remove Item
$("#pricesSetting").on('click', '.remProd', function () {
    var id = $(this).parent().data("id");

    if (dataNotUsed(function (item) {
            if (item == id) {
                return true;
            } else {
                return false;
            }
        }, function (name) {
            errorHandle("Le produit '" + name + "' est dans au moins une formule, il ne peut être modifié", colourPallets.Warning);
        })) {
        return;
    }

    delete products[id];
    saveData("Prods", JSON.stringify(products));
    fillTable();
    redraw();
    fillPrices();
});

/* #endregion */


/* #region Commands Panel */
$("#myCmd").on('click', function () {
    $("#cmds").css('visibility', 'visible');
    fillCommands();
});

$("#cmdConteneur").on('click', ".suprCmd", function (event) {
    Confirm("Supprimer", "Voulez vous supprimer cette commande ?", "Oui", "Annuler", function(){
        removeData($(this).parent().data("command"));
        $(this).parent().remove();
        updateRealTimeStats();
        fillCommands();
    });
    event.stopPropagation();
});

$("#cmdConteneur").on('click', ".cmdList", function () {
    modifyCmd = $(this).data("command");

    curCommande = JSON.parse(getData(modifyCmd));
    rawCommande = demystify(curCommande)[0];

    $("#cmds").css('visibility', 'hidden');
    console.log(modifyCmd);
    redraw();
});

$("#clearCmd").on('click', function () {
    removeData();
    $("#cmds").css('visibility', 'hidden');
    updateRealTimeStats();
});

$("#toExcel").on('click', function () {
    updateExcel();
});
/* #endregion */


/* #region Payment Panel */
// Manages the modal OnSubmit
$("#submit").on('click', function () {
    if (total == 0 && modifyCmd == -1) {
        errorHandle("Aucun produits séléctionné", colourPallets.Warning);
        return;
    }
    $("#Rest").html(total);
    // fills the payment mode
    $(".payMode").each(function () {
        if (modifyCmd != -1) {
            $(this).val(curCommande[$(this).attr("id")]);
        } else {
            $(this).val('');
        }
    });
    $("#modal").css('visibility', 'visible');
});

// Auto update sum to pay
$(".payMode").on('input', function () {
    var subTotal = total;
    $(".payMode").each(function () {
        if (!isNaN(parseFloat($(this).val()))) {
            subTotal -= parseFloat($(this).val());
        }
    });
    subTotal = coolRound(subTotal);
    $("#Rest").html(subTotal);
});

// Sauvegarde la commande
$("#End").on('click', function () {
    if ($("#Rest").text() > 0) {
        errorHandle("La commande n'est pas payé", colourPallets.Warning);
        return;
    }

    $("#modal").css('visibility', 'hidden');
    $("#to").empty();
    $("#fTo .prix").html("");
    rawCommande = {};

    // add the payment mode to curCommand
    $(".payMode").each(function () {
        if (!isNaN(parseFloat($(this).val()))) {
            curCommande[$(this).attr('id')] = parseFloat($(this).val());
        }
    });

    if (modifyCmd == -1) {
        if (getData("nbC") === null) {
            saveData("nbC", 0);
        } else {
            saveData("nbC", Number(getData("nbC")) + 1);
        }
        curCommande.time = new Date();
        saveData("C" + getData("nbC"), JSON.stringify(curCommande));
    } else {
        var old = JSON.parse(getData(modifyCmd));
        curCommande.modified = addition(difference(curCommande, old), old.modified); // The difference between old one and new one
        curCommande.time = new Date();
        saveData(modifyCmd, JSON.stringify(curCommande));
    }
    modifyCmd = -1;

    // Update the Real Time Peolple Count
    redraw();
    updateRealTimeStats();
});
/* #endregion */


/* #region Ajout de produit */
// Recupère les clicks sur les elements 'tr' qui ont un parent avec l'id 'from' 
$("table.from").on('click', 'tr', function () {
    var item = $(this).data("item-id");
    if ($(this).data("nbper")) {
        addItem(item, Number($(this).data("nbper")));
        return;
    }
    if (products[item][1] == 0) {
        $("#askPrice").data("newItem", item);
        $("#askPrice").css('visibility', 'visible');
    } else {
        addItem(item, 1);

    }
});

// Recupère les clicks sur les éléments fils de '#to' ayant la classe 'supr' (et de type 'td')
$("#to").on('click', 'td.supr', function () {
    var item = $(this).parent().data("item-id");
    addItem(item);
});

// Gère les '+' et '-'
$("#to").on('click', 'span', function () {
    var item = $(this).parent().parent().data("item-id");

    if ($(this).hasClass('moins')) {
        addItem(item, -1);
    } else if ($(this).hasClass('plus')) {
        addItem(item, 1);
    }
});
/* #endregion */


/* #region Special Price */
$("#cancelAskPrice").on('click', function () {
    $("#askPrice").css('visibility', 'hidden');
});

$("#confirmAskPrice").on('click', function () {
    console.log($("#askPrice").data("newItem"));
    addItem($("#askPrice").data("newItem"), parseFloat($("#askedprice").val()));
    $("#askPrice").css('visibility', 'hidden');
});
/* #endregion */
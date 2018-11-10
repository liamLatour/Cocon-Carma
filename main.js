function recalculateSum(){
    let total = 0;

    $("#to tr").each(function(){
        total += $(this).data("item-price") * $(this).data("item-number");
    });

    $("#fTo .prix").html((Math.round(total*100)/100) + "€");
}

// Function pour modifier nombre de produit
function add(produit, nombre){
    // Si le nombre de produit est zéro ou moins on le détruit
    if(produit.data("item-number")+nombre <= 0){
        produit.remove();
        return;
    }

    produit.data("item-number", produit.data("item-number")+nombre);
    produit.children(".quantite").html("<span class='moins hover'>-</span>"+produit.data("item-number")+"<span class='plus hover'>+</span>");
    produit.children(".prix").html(Math.round(produit.data("item-number") * produit.data("item-price")*100)/100);

    recalculateSum();
}

// Recupère les clicks sur les elements 'tr' qui ont un parent avec l'id 'from' 
$("#from").on('click', 'tr', function(){
    // declare une variable locale(qui se détruit quand la function à fini) 'id' qui stocke l'identité du produit
    let id = $(this).data("item-id");
    // variable pour savoir si le produit doit être modifié ou ajouté
    let createNew = true;

    // Fonction qui vérifie si il éxiste déjà ce produit, si oui on en rajoute 1
    $("#to").children().children("tr").each(function (){
        if($(this).data("item-id") == id){
            add($(this), 1);
            createNew = false;
            return;
        }
    });

    // Si le produit n'est pas déjà dans la commande on l'ajoute (c'est juste du html que l'on ajoute dans le tableau 'to')
    if(createNew){
        $("#to").append("<tr class='item' data-item-id='"+ id +"'\
                                        data-item-name='"+ $(this).data("item-name") +"'\
                                        data-item-price='"+ $(this).data("item-price") +"'\
                                        data-item-number='1'>\
                            <td class='titre'>"+ decodeURI($(this).data("item-name")) +"</td>\
                            <td class='quantite'><span class='moins hover'>-</span>1<span class='plus hover'>+</span></td>\
                            <td class='prix'>"+ $(this).data("item-price") +"</td>\
                            <td class='supr hover'></td>\
                        </tr>");
        recalculateSum();
    }
});

// Recupère les clicks sur les éléments fils de '#to' ayant la classe 'supr' (et de type 'td')
$("#to").on('click', 'td.supr', function(){
    // Détruit le parent(le 'tr') de cette élément
    $(this).parent().remove();
});

// Gère les '+' et '-'
$("#to").on('click', 'span', function(){
    let parent = $(this).parent().parent();

    if($(this).hasClass('moins')){
        add(parent, -1);
    }
    else if($(this).hasClass('plus')){
        add(parent, 1);
    }
});


// vérifie que le naviguateur supporte cette fonctionalitée
if (typeof(Storage) !== "undefined") {
    // Récupère et affiche les produits
    for (let i = 0; i < localStorage.length; i++){
        if(localStorage.key(i).includes("item")){
            let retrievedObject = JSON.parse(localStorage.getItem(localStorage.key(i)));
            let id = localStorage.key(i).replace("item", "");
            let name = retrievedObject.title;
            let price = retrievedObject.price;

            console.log(name);
            $("#from").append('<tr class="item hover" data-item-id="'+ id +'"\
                                            data-item-name="'+ encodeURI(name) +'"\
                                            data-item-price="'+ price +'">\
                                <td class="titre">'+ name +'</td>\
                                <td class="prix">'+ price +'</td>\
                                </tr>');
        }
    }
}

$("#hamClick").on('click', function(){
    document.getElementById("hamburger").classList.toggle("change");
    if($("#menuContainer").css("visibility") == "hidden"){
        $("#menuContainer").css('visibility', 'visible');
    }
    else{
        $("#menuContainer").css('visibility', 'hidden');
    }
});
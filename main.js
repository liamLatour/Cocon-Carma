// Function pour modifier nombre de produit
function add(produit, nombre){
    if(produit.data("item-number")+nombre <= 0){
        produit.remove();
    }

    produit.data("item-number", produit.data("item-number")+nombre);
    produit.children(".quantite").html("<span class='moins hover'>-</span>"+produit.data("item-number")+"<span class='plus hover'>+</span>");
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
                            <td class='titre'>"+ $(this).data("item-name") +"</td>\
                            <td class='quantite'><span class='moins hover'>-</span>1<span class='plus hover'>+</span></td>\
                            <td class='prix'>"+ $(this).data("item-price") +"</td>\
                            <td class='supr hover'></td>\
                        </tr>");
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
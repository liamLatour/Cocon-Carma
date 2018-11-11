var get = window.location.search.substr(1);
var idd;
if(get != null && get.includes("cmdId")){
    idd = Number(get.replace("cmdId=", ""));
    let obj = JSON.parse(localStorage.getItem("cmd"+idd));

    $("#commandeName input").val(obj.name);
    for(let key in obj){
        if(key.includes("item")){
            let itemObj = JSON.parse(localStorage.getItem(key));

            $("#to").append("<tr class='item' data-item-id='"+ Number(key.replace("item", "")) +"'\
                                        data-item-name='"+ itemObj.title +"'\
                                        data-item-price='"+ itemObj.price +"'\
                                        data-item-number='"+obj[key]+"'>\
                            <td class='titre'>"+ decodeURI(itemObj.title) +"</td>\
                            <td class='quantite'><span class='moins hover'>-</span>"+obj[key]+"<span class='plus hover'>+</span></td>\
                            <td class='prix'>"+ Math.round(itemObj.price*obj[key]*100)/100 +"</td>\
                            <td class='supr hover'></td>\
                        </tr>");
        }
    }
    recalculateSum();
}   

function recalculateSum(){
    let total = 0;

    $("#to tr").each(function(){
        total += $(this).data("item-price") * $(this).data("item-number");
    });

    $("#fTo .prix").html((Math.round(total*100)/100) + "€");
}

// Function pour modifier le nombre de produit
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

// Récupère les produits
getProducts("#from");

// Sauvegarde la commande
$("#submit").on('click', function(){
    if($("#to tbody").children().length > 0){
        let obj = {};

        $("#to tr").each(function(){
            obj["item"+$(this).data("item-id")] = $(this).data("item-number");
        });

        let date = new Date().toLocaleString();
        if(date.includes("PM")){
            date = date.substring(0, date.length - 3);
            let year = date.split(',')[0];
            let rest = date.split(', ')[1];
            
            let hour = Number(rest.split(':')[0]);
            if(hour !== 12){ hour += 12}
            let min = rest.split(':')[1];
            let sec = rest.split(':')[2];

            date = year + ', ' + hour+':'+min+':'+sec;
        }
        else{
            date = date.substring(0, date.length - 3);
        }

        obj["date"] = date;


        obj["name"] = $("#commandeName input").val();

        console.log(obj);
        save(obj, "cmd", id=idd);

        $("#modal").css("visibility", "visible");
    }
});
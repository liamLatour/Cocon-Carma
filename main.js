function getProducts(table, sup=""){
    // vérifie que le naviguateur supporte cette fonctionalitée
    if (typeof(Storage) !== "undefined") {
        // Récupère et affiche les produits
        for (let i = 0; i < localStorage.length; i++){
            if(localStorage.key(i).includes("item") && localStorage.key(i)!="item"){
                let retrievedObject = JSON.parse(localStorage.getItem(localStorage.key(i)));
                let id = localStorage.key(i).replace("item", "");
                let name = retrievedObject.title;
                let price = retrievedObject.price;

                $(table).append('<tr class="item hover" data-item-id="'+ id +'"\
                                                data-item-name="'+ encodeURI(name) +'"\
                                                data-item-price="'+ price +'">\
                                    <td class="titre">'+ name +'</td>\
                                    <td class="prix">'+ price +'</td>\
                                    '+sup+'\
                                    </tr>');
            }
        }
    }
}

function save(obj, name, id=null){
    if (typeof(Storage) !== "undefined") {
        if(id === null || isNaN(id)){
            if(localStorage.getItem(name)){
                localStorage.setItem(name, Number(localStorage.getItem(name)) + 1);
            }
            else{ localStorage.setItem(name, 0); }

            localStorage.setItem(name + localStorage.getItem(name), JSON.stringify(obj));
        }
        else{
            localStorage.setItem(name + id, JSON.stringify(obj));
        }
    }
    else {
        alert("Désolé ce navigateur ne supporte pas cette fonctionalitée");
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
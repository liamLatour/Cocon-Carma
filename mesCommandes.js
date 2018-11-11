 // vérifie que le naviguateur supporte cette fonctionalitée
 if (typeof(Storage) !== "undefined") {
    let done = [];

    // Récupère et affiche les produits
    for (let i = 0; i < localStorage.length; i++){
        if(localStorage.key(i).includes("cmd") && localStorage.key(i)!="cmd"){
            if(localStorage.getItem(localStorage.key(i))[0] === "V"){
                done.push(JSON.parse(localStorage.getItem(localStorage.key(i)).substring(1, localStorage.getItem(localStorage.key(i)).length)));
            }
            else{
                let retrievedObject = JSON.parse(localStorage.getItem(localStorage.key(i)));

                let id = localStorage.key(i).replace("cmd", "");

                let name = retrievedObject.name;
                let time = retrievedObject.date;
                //let price = retrievedObject.price;

                $("#commande").append('<tr class="item hover" data-item-id="'+ id +'"\
                                                data-item-name="'+ encodeURI(name) +'"\
                                                data-item-price="'+ "price" +'">\
                                            <td class="titre">'+ name +'</td>\
                                            <td class="time">'+ time +'</td>\
                                            <td class="prix">'+ "price" +'</td>\
                                        </tr>\
                                        <tr class="desc">\
                                            <td class="desc" colspan="3">\
                                                <ul class="itemOfCommand">\
                                                    <span title="Modifier la commande" class="modify"></span>\
                                                    <span title="Commande terminée !" class="check"></span>\
                                                </ul>\
                                            </td>\
                                        </tr>\
                                    ');

                let total = 0;
                for(let key in retrievedObject){
                    if(key.includes("item")){
                        let itemObject = JSON.parse(localStorage.getItem(key));
                        $(".itemOfCommand").last().append('<li>'+itemObject.title+' × '+retrievedObject[key]+'</li>');
                        total += retrievedObject[key] * itemObject.price;
                    }
                }
                $(".prix").last().html(Math.round(total*100)/100);
            }
        }
    }
    if(done.length > 0){
        $("#commande").append('<tr></tr>');// ADD SOME SHIT HERE
    }
    for(let it in done){
        console.log(done[it]);
        $("#commande").append('<tr class="item hover" data-item-id=""\
                                        data-item-name="'+ encodeURI(done[it].name) +'"\
                                        data-item-price="'+ "price" +'">\
                                    <td class="titre">'+ done[it].name +'</td>\
                                    <td class="time">'+ done[it].date +'</td>\
                                    <td class="prix">'+ "price" +'</td>\
                                </tr>\
                                <tr class="desc">\
                                    <td class="desc" colspan="3">\
                                        <ul class="itemOfCommand">\
                                        </ul>\
                                    </td>\
                                </tr>\
                            ');

        let total = 0;
        for(let key in done[it]){
            if(key.includes("item")){
                let itemObject = JSON.parse(localStorage.getItem(key));
                $(".itemOfCommand").last().append('<li>'+itemObject.title+' × '+done[it][key]+'</li>');
                total += done[it][key] * itemObject.price;
            }
        }
        $(".prix").last().html(Math.round(total*100)/100);
    }
}

// Pour modifier les commandes
$("#commande").on('click', '.modify', function(){
    window.location.href = "index.html?cmdId=" + $(this).parent().parent().parent().prev().data("item-id");
});

// Finir la commande
$("#commande").on('click', '.check', function(){
    let id = $(this).parent().parent().parent().prev().data("item-id");
    let curCmd = "V"+localStorage.getItem("cmd"+id);
    console.log(curCmd);
    localStorage.setItem("cmd"+id, curCmd);
    window.location.href = "mesCommandes.html";
});

var curDisp = null;
// Affiche les détails de la commande quand on click dessus
$("#commande").on('click', 'tr.item', function(){
    if(curDisp != this){
        if(curDisp != null){
            $(curDisp).next().css("display", "none");
            $(curDisp).children(".prix").css("border-bottom-right-radius", "20px");
            $(curDisp).children(".titre").css("border-bottom-left-radius", "20px");
        }

        $(this).next().css("display", "table-row");
        $(this).children(".prix").css("border-bottom-right-radius", "0");
        $(this).children(".titre").css("border-bottom-left-radius", "0");
        curDisp = this;
    }
    else{
        if(curDisp != null){
            $(curDisp).next().css("display", "none");
            $(curDisp).children(".prix").css("border-bottom-right-radius", "20px");
            $(curDisp).children(".titre").css("border-bottom-left-radius", "20px");
        }
        curDisp = null;
    }
});
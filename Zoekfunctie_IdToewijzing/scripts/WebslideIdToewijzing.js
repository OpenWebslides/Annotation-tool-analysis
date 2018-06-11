export
let idToewijzing = () => {
    let slides = document.getElementsByClassName("slide");
    //Voor elke slide wordt de id ervan gebruikt om een id voor al zijn kinderelementen te construeren
    for(let i = 0; i < slides.length; i++){
        //Slaat de id van een slide op
        let id = slides[i].attributes["id"].value;
        recursieveIdToewijzing(slides[i], id);
    }
    /*
    console.log("Zo ziet de body eruit met overal ID's: ");
    console.log(document.body);
    */
};

//Recursieve functie die per niveau dat men afdaalt, een postfix toevoegt aan de id
let recursieveIdToewijzing = (element, prefix_id) => {
    let postfix_id = 0;
    let children = element.children;
    for(let i = 0; i < children.length; i++){
        recursieveIdToewijzing(children[i], prefix_id + "-" + postfix_id);
        postfix_id++;
    }
    element.setAttribute("id", prefix_id);
};
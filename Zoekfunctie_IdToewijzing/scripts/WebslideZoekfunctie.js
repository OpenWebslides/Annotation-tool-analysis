// Moet het woord aanduiden dat gezocht wordt (cap-insensitive)
export
let zoekfunctieAan = (tekst) => {
    let slides = document.getElementsByClassName("slide");
    console.log("Zoek naar:\t" + tekst);
    for(let i = 0; i < slides.length; i++){
        recursiefZoeken(slides[i], tekst);
    }
};

//Verwijdert de aanduiding van elk woord
export
let zoekfunctieUit = () => {
    //Voor elk stukje tekst die we in zoekfunctieAan(...) hebben omringd met een Span-tag met class="searched_text"
    //  - De omringende Span-tag verwijderen
    //  - De tekst in die Span-tag samenvoegen met de textNode ervoor en/of erachter
    let gemarkeerdeElementen = document.getElementsByClassName("searched_text");
    console.log(gemarkeerdeElementen);
    for(let i = gemarkeerdeElementen.length - 1; i >= 0; i--){

        //De parent is de Node waaraan de 3  nieuwe Nodes hangen(zie uitleg bij ZoekfunctieAan())
        let parent = gemarkeerdeElementen[i].parentElement;
        let tekst = gemarkeerdeElementen[i].childNodes[0].nodeValue;
        let tekstVoor = "";
        let tekstNa = "";

        //Als de nodes voor/na de TagNode bestaan en een TextNode zijn, dan worden deze verwijderen en hun Textvalue bijgehouden
        if(gemarkeerdeElementen[i].previousSibling && gemarkeerdeElementen[i].previousSibling.nodeType === 3) {
            tekstVoor = gemarkeerdeElementen[i].previousSibling.nodeValue;
            parent.removeChild(gemarkeerdeElementen[i].previousSibling);
        }
        if(gemarkeerdeElementen[i].nextSibling && gemarkeerdeElementen[i].nextSibling.nodeType === 3) {
            tekstNa = gemarkeerdeElementen[i].nextSibling.nodeValue;
            parent.removeChild(gemarkeerdeElementen[i].nextSibling);
        }

        //De originele TextNode wordt weer samengesteld
        let textNode = document.createTextNode(tekstVoor + tekst + tekstNa);
        parent.replaceChild(textNode, gemarkeerdeElementen[i]);

    }
};


let recursiefZoeken = (element, tekst) => {
    //Is dit een textNode?
    //Ja:   Er wordt eerst gecheckt of deze textnode het woord bevat
    //      Als dit het geval is, dan wordt het woord gemarkeerd in de tekst
    if(element.nodeType === 3 /*=Textnode*/){
        // Als het gezochte woord zich in de nodeValue bevindt (index =! -1)
        // Dan moet de parent deze textNode vervangen door:
        //  - een textNode      (alle tekst voor het gezochte woord)
        //  - de gemarkeerde node (die zelf ook een textNode heeft met het gezochte woord)
        //  - nog een textNode   (alle tekst na het gezochte woord)
        let index = find(element.nodeValue.toLowerCase(),tekst.toLowerCase());
        if(index  !== -1){
            console.log("\t->\"" + element.nodeValue + "\" => \"" + tekst + "\"");

            //De tekst van de TextNode wordt opgedeeld in 3 stukken
            let tekstVoor = element.nodeValue.substr(0, index) || "";
            let tekstGezocht = element.nodeValue.substr(index, tekst.length) || "";
            let tekstNa = element.nodeValue.substr(index + tekst.length) || "";

            //De gezochte tekst wordt in een Span-tag geplaatst met het attribuut class="searched_text"
            let gemarkeerdeNode = document.createElement('span');
            gemarkeerdeNode.className = "searched_text";
            gemarkeerdeNode.appendChild(document.createTextNode(tekstGezocht));

            //De oorspronkelijke Node wordt vervangen door de 3 nieuwe Nodes (textNode, spanNode, textNode)
            let parent = element.parentElement;

            if(tekstVoor) parent.insertBefore(document.createTextNode(tekstVoor), element);
            parent.insertBefore(gemarkeerdeNode, element);
            if(tekstNa) parent.insertBefore(document.createTextNode(tekstNa), element);
            parent.removeChild(element);
        }
    }
    //Nee:  RecursiefZoeken(...) wordt opgeroepen voor elk kind van deze Node (recursie)
    else if(element.hasChildNodes()){
        let childnodes = element.childNodes;
        for(let child of childnodes){
            if(element.className !== "searched_text") {
                recursiefZoeken(child, tekst);
            }
        }
    }
};

let find = (zin, stukje)=> {





    return zin.indexOf(stukje);
};

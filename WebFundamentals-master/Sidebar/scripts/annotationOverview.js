import {translations} from "./internationalisation/translator.js";
import {logging} from "./logging.js";
import {getAnnotationsByIdOverview, getAnnotationsById, getSlideNumber, getPresentationId, localData, getUser, noHtml} from "./data/manager.js";
import {close_sidebar} from "./nav.js";
import {makeContent, fillTags,getScaling, drawAnnotationsMin} from "./data/Drawer.js";


window.viewAnnotation = viewAnnotation;
window.favoriteOverview = favoriteOverview;
window.viewAnnotation = viewAnnotation;
window.viewAnnotationEnter=viewAnnotationEnter;


//<editor-fold defaultstate="collapsed" desc="search, filter and cherrypick">
export function helpView(objectList){
    let searchList=[];
    for(let annotation of objectList){
        if(annotation.view==="public" || (annotation.view==="private" && getUser()===annotation.op)){
            searchList.push(annotation);
        }
    }
    return searchList;
}

//opvullen resultatentabel bij opzoeken
export function putResults(searchList){
    logging("fill resulttable in overview", null, "overview");
    $("#AnnotationTool_searchResults").empty();
    $("#AnnotationTool_searchResults").append(`<table id="AnnotationTool_searchResultsList"></table>`);
    $("#AnnotationTool_searchResultsList").append("<tr></tr>");
    let td = [];
    for(let i=0; i<4; i++){
        td[i] = document.createElement("td");
        td[i].className = "AnnotationTool_li_bullets AnnotationTool_tdOverview";
        $("table#AnnotationTool_searchResultsList tr:nth-child(1)").append(td[i]);
    }
    let column=0;
    for (let item of searchList) {
        let linkButton = `<a href="#${item.slideNumber}" class="AnnotationTool_jumpButton">${translations["txt_overview_jumptoslide"]}: ${noHtml(item.slideNumber)}<a>`; //knop om naar slide te springen
        let div = document.createElement("div");
        div.className = "AnnotationTool_listitem AnnotationTool_div_padding";
        $(div).append(linkButton);
        td[column].appendChild(div);
        let ann = document.createElement("DIV");
        ann.className = "AnnotationTool_annotation AnnotationTool_searchresult";
        let att = document.createAttribute("data-id");
        att.value = item.id;
        ann.setAttributeNode(att);
        // $(ann).append(makeContent(item));
        // fillTags(item, $(ann).find(".AnnotationTool_annotationTags")[0]);
        drawAnnotationsMin(item, ann);
        $(div).append(ann);
        let el = document.getElementsByClassName("AnnotationTool_jumpButton");
        let scaling=el[0].getBoundingClientRect().width / el[0].offsetWidth;
        if(scaling>1.4 || window.innerWidth<1000){
            if (column === 1) {
                column = 0;
            } else {
                column++;
            }
            if(window.innerWidth<1000){$(".AnnotationTool_searchresult").css("width","44vw");}
            if(scaling > 1.4){$(".AnnotationTool_searchresult").css("width","22vw");}
        }else if(window.innerWidth<1400){
            if (column === 2) {
                column = 0;
            } else {
                column++;
            }
            $(".AnnotationTool_searchresult").css("width","33vw");

        } else {
            $(".AnnotationTool_searchresult").css("width","22vw");
            if (column === 3) {
                column = 0;
            } else {
                column++;
            }
        }
    }
    if (searchList.length===0){
        $("#AnnotationTool_searchResults").append(`<p>${translations["txt_overview_no_results"]}</p>`);
    }
    $(".AnnotationTool_annotationUserName[accountvalue='prof']").addClass("AnnotationTool_annotationUserNameProfessor");
}

/*new*/export function orderOverview(searchList,orderAsked){
    logging("order searchresults", null, "overview");
    let filterDictionary = {};let orderedList=[];
    for(let annotation of searchList){
        let index;
        if(orderAsked==="slides"){index=annotation.slideNumber;}
        if(orderAsked==="votes"){index=annotation.rating.thumbsUp.length-annotation.rating.thumbsDown.length;}
        if(orderAsked==="dates"){index=annotation.date;}
        if(orderAsked==="reactions"){index=annotation.reactions.length;}
        if(filterDictionary[index]!==undefined){
            filterDictionary[index].push(annotation);
        }else{
            filterDictionary[index] = [annotation];
        }
    }
    //enkel bij ecmascript6 !!
    const ordered = {};
    Object.keys(filterDictionary).sort().forEach(function(key) {
        ordered[key] = filterDictionary[key];
    });
    for(let k in ordered){
        for(let annotation of ordered[k]){
            orderedList.push(annotation);   //kleinste votes vooraan of kleinste aantal reacties vooraan of vroegste/oudste data vooraan
        }                                   //alfabetisch dus geen inverse nodig
    }
    if(orderAsked==="slides"){return orderedList;}
    else{return orderedList.reverse();}          //grootste votes vooraan of grootste aantal reacties vooraan of laatste/nieuwste data vooraan
}

function helpCherryPicking(personList,objectList){
    if(typeof personList==='undefined' || personList.length===0 || personList[0]===""){return objectList;}
    let cherryPickedList=[];
    for(let i=0;i<objectList.length;i++){
        for(let j=0;j<personList.length;j++){
            if(objectList[i].cherrypicking.includes(personList[j])){
                if(!cherryPickedList.includes(objectList[i])){
                    cherryPickedList.push(objectList[i]);
                }
            }
        }
    }
    return cherryPickedList;
}

/*new*/function favoriteOverview(){
    let objectList=getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId());
    let searchList=helpCherryPicking([getUser()],objectList);
    putResults(searchList);
}

//zoek alle elementen waarmee alle elementen uit het zoekveld matchen
export function searchEverything(search,presentationId){
    let objectList=getAnnotationsByIdOverview(localData.getAnnotations(),presentationId);
    for(let i=0;i<search.length;i++){
        objectList=helpFilterEverything(search[i],objectList);
    }
    return objectList;
}
//<editor-fold defaultstate="collapsed" desc="search everything helpfuncties">
function helpFilterEverything(search,objectList){
    let finalAnnotationList=helpTagFilterOne(search,objectList);
    finalAnnotationList=helpCategoryFilterOne(search,objectList,finalAnnotationList);
    finalAnnotationList=helpTitleFilterOne(search,objectList,finalAnnotationList);
    finalAnnotationList=helpCommentaryFilterOne(search,objectList,finalAnnotationList);
    finalAnnotationList=helpOpFilterOne(search,objectList,finalAnnotationList);
    //Enkel wanneer er ook op reacties wil worden gezocht
    if(document.getElementById("AnnotationTool_inputSearchIncludeReactions").checked) {
        finalAnnotationList=helpPersonFilterOne(search,objectList,finalAnnotationList);  //reaction.person
        finalAnnotationList=helpTextFilterOne(search,objectList,finalAnnotationList);    //reaction.text
    }
    return finalAnnotationList;
}
function helpTagFilterOne(tag, objectList){
    let finalAnnotationList=[];
    for(let i=0;i<objectList.length;i++){
        let contentTagsLowerCase = objectList[i].contentTags.map( (item) => {
            return item.toLowerCase();
        });
        for(let j = 0; j < contentTagsLowerCase.length ; j++)
        {
            if (contentTagsLowerCase[j].includes(tag)) {
                if (!finalAnnotationList.includes(objectList[i])) {
                    finalAnnotationList.push(objectList[i]);
                }
            }
        }
    }
    return finalAnnotationList;
}
function helpCategoryFilterOne(category,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
        if (objectList[i].content.category.toLowerCase().includes(category)) {
            logging(objectList[i].content.category + " includes " + category,null, "overview");
            if(!finalAnnotationList.includes(objectList[i])){
                finalAnnotationList.push(objectList[i]);
            }
        }
    }
    return finalAnnotationList;
}
function helpTitleFilterOne(title,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
            if (objectList[i].title.toLowerCase().includes(title)) {
                logging(objectList[i].title + " includes " + title, null, "overview");
                if(!finalAnnotationList.includes(objectList[i])){
                    finalAnnotationList.push(objectList[i]);
                }
            }
    }
    return finalAnnotationList;
}
function helpCommentaryFilterOne(commentary,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
        let commentaryLowerCase = objectList[i].content.commentary[objectList[i].content.commentary.length - 1].toLowerCase();
            if (commentaryLowerCase.includes(commentary)) {
                logging(objectList[i].content.commentary[objectList[i].content.commentary.length - 1] + " includes " + commentary,null, "overview");
                if(!finalAnnotationList.includes(objectList[i])){
                    finalAnnotationList.push(objectList[i]);
                }
            }
    }
    return finalAnnotationList;
}
function helpOpFilterOne(op,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
        if (objectList[i].op.toLowerCase().includes(op)) {
            logging(objectList[i].op + " includes " + op,null, "overview");
            if(!finalAnnotationList.includes(objectList[i])){
                finalAnnotationList.push(objectList[i]);
            }
        }
    }
    return finalAnnotationList;
}
function helpPersonFilterOne(person,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
        for(let j=0;j<objectList[i].reactions.length;j++){
            if (objectList[i].reactions[j].person.toLowerCase().includes(person)) {
                logging(objectList[i].reactions[j].person + " includes " + person, null, "overview");
                if(!finalAnnotationList.includes(objectList[i])){
                    finalAnnotationList.push(objectList[i]);
                }
            }
        }
    }
    return finalAnnotationList;
}
function helpTextFilterOne(text,objectList,finalAnnotationList){
    for(let i=0;i<objectList.length;i++) {
        for(let j=0;j<objectList[i].reactions.length;j++){
                if (objectList[i].reactions[j].text[objectList[i].reactions[j].text.length-1].toLowerCase().indexOf(text) !== -1) {
                    logging(objectList[i].reactions[j].text[objectList[i].reactions[j].text.length-1] + " includes " + text, null, "overview");
                    if(!finalAnnotationList.includes(objectList[i])){
                        finalAnnotationList.push(objectList[i]);
                    }
                }
            }
    }
    return finalAnnotationList;
}
//</editor-fold>


/*new*/ function viewAnnotation() {
    logging("view matching annotations", null, "overview");
    let searchList;
    //Toon alle annotaties als de zoekbalk leeg is
    if ($("#AnnotationTool_searchEverythingId").val() === "") {
        searchList = getAnnotationsById(localData.getAnnotations(),getPresentationId(), null);
        searchList = helpView(searchList);
    }
    //Toon annotaties die voldoen aan zoekterm
    else {
        //Splitten en verwijderen van trailing en leading whitespaces
        let searchStrings = $("#AnnotationTool_searchEverythingId").val().split(",");
        for(let i = 0; i < searchStrings.length; i++) {
            searchStrings[i] = searchStrings[i].replace(/^[ ]+|[ ]+$/g,'').toLowerCase();
        }
        searchList = searchEverything(searchStrings,getPresentationId());
        searchList = helpView(searchList);
    }
    //Orden de annotaties
    let order = $("#AnnotationTool_order").val();
    if(order==="slides"){searchList=orderOverview(searchList,"slides");}
    if(order==="votes"){searchList=orderOverview(searchList,"votes");}
    if(order==="dates"){searchList=orderOverview(searchList,"dates");}
    if(order==="reactions"){searchList=orderOverview(searchList,"reactions");}
    putResults(searchList); //volgorde van slides by default
}

export function viewAnnotationEnter(event){
    //viewAnnotation();
    if (event.which == 13 || event.keyCode === 13) {
        $("#AnnotationTool_searchEverythingId").val("");
    }
}
//</editor-fold>
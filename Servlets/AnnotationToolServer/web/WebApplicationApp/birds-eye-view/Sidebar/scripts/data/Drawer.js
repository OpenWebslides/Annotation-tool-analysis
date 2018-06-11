//In dit bestand staan de voornaamste methodes die iets op de html tekenen
import {openForm, editStyle, selectedElement, setSelectedElement, clearSelection, drawTagInForm} from "../annotationForm.js";
import {localData, caller, getPresentationId, getSlideNumber, getAnnotationsById, getUser, refreshTable, getAccountFunction, getAnnotationsByIdOverview} from "./manager.js";
import {logging} from "../logging.js";
import {goToOverview,show,setReadyForForm} from "../nav.js";
import {putResults,searchEverything,helpView,orderOverview} from "../annotationOverview.js";
import {translations} from "../internationalisation/translator.js";
import {noHtml} from "./manager.js";
import {stopKeyEventPropagation} from "./manager.js";

window.reactionUpvote = reactionUpvote;
window.reactionDownvote = reactionDownvote;
window.ReactionEdit = ReactionEdit;
window.ReactionDelete = ReactionDelete;
window.maximize = maximize;
window.minimize = minimize;
window.annotationUpvote = annotationUpvote;
window.annotationDownvote = annotationDownvote;
window.favorite = favorite;
window.annotationEdit = annotationEdit;
window.annotationDelete = annotationDelete;
window.openHistoryContainer = openHistoryContainer;
window.closeHistoryContainer = closeHistoryContainer;

let voteColor = "#1976d2";
let favoriteColor = "#ffb300";
let iconColor = "#606060";
export let TAGCOLORS = { "solved": "#8bc34a", "important":"#fdd835", "info":"#1e88e5", "example":"#f06292"};
//bovenstaande lijst bevat alle default tags met bijhorend kleur.

//<editor-fold defaultstate="collapsed" desc="draw annotations">
export function drawAnnotations(annotations){
    logging("draw all annotations", annotations, "drawer");
    if(document.getElementById("AnnotationTool_overview").hidden === false){                        //Staat de overview open, dan moeten alle annotaties getoond worden
        let resAnnotations = getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId());
        resAnnotations=helpView(resAnnotations);
        resAnnotations=orderOverview(resAnnotations,$("#AnnotationTool_order").val());
        putResults(resAnnotations);
    }
        document.getElementById("AnnotationTool_annotationView").innerHTML = '';                    //De annotaties moeten ook getekend worden in de sidebar
        let slideName = document.createElement("P");                                                //zodat de jump to slide direct annotaties toont
        slideName.className="AnnotationTool_slideName";                                             //Daarom staat dit deel best niet in een else-structuur
        if(getSlideNumber() === null){
            slideName.innerHTML = translations["txt_defaultview_allannotations"];
        }
        else{
            slideName.innerHTML = "Webslide: " + noHtml(getSlideNumber());
        }
        document.getElementById("AnnotationTool_annotationView").appendChild(slideName);
        if(annotations.length > 0){
            for(let item of annotations){
                if(item.view==="public" || (item.view==="private" && getUser()===item.op)){
                    let ann = document.createElement("DIV");
                    ann.className = "AnnotationTool_annotation";
                    let att = document.createAttribute("data-id");
                    att.value = noHtml(item.id);
                    ann.setAttributeNode(att);
                    drawAnnotationsMin(item, ann);
                    $("#AnnotationTool_annotationView").append(ann);
                }
            }
        }
        else{
            drawEmptyAnnotations();
        }
}
// function showEditDeleteBtn(target) {
//     $(target).find(".editDel-container")[0].hidden = false;
// }
function drawAnnotationsMax(item,target){
    logging("draw this annotation maximized", item, "drawer");
    $(target).append(makeContentMax(item));
    fillTags(item, $(target).find(".AnnotationTool_annotationTags")[0]);
    fillReactions(item, $(target).children(".AnnotationTool_reactionsView")[0]);
    refreshRatingButtonsStyle($(target).find(".AnnotationTool_rating-container")[0],  item);
    refreshFavoriteButtonStyle(target, item);
    $(target).append(makeNewReaction());
    $(".AnnotationTool_annotationUserName[accountvalue='prof']").addClass("AnnotationTool_annotationUserNameProfessor");
}
export function drawAnnotationsMin(item,target){
    logging("draw this annotation minimized", item, "drawer");
    $(target).append(makeContent(item));
    fillTags(item, $(target).find(".AnnotationTool_annotationTags")[0]);
    $(".AnnotationTool_annotationUserName[accountvalue='prof']").addClass("AnnotationTool_annotationUserNameProfessor");
}

//toont een reactie bij een annotatie
export function drawReaction(annotation, reaction, target){
    $(target).find(".AnnotationTool_reactionsView").append(makeReaction(annotation,reaction, annotation.reactions.length-1));
    logging("draw reaction on annotation", [reaction, annotation], "drawer");
}

//toont een fout in de view
export function drawError(message,target){
    logging("draw error", message, "drawer");
    let ann = `<div class="AnnotationTool_alert">
                    <span class="AnnotationTool_alertclosebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
                        ${message}
                </div>`;
    $(target).prepend(ann);
}

//teken symbool als toevoegen reactie is mislukt
export function drawReactionError(target){
    logging("draw reactionerror", null, "drawer");
    let res =
        `<div onclick="this.style.display='none';" style="cursor: pointer"><i class="material-icons" style="float:left; color: red;">error_outline</i><p style="color: red">${translations["err_reaction_requestfailed"]}</p></div>
        `;
    $(target).append(res);
}


//toont een melding bij geen annotaties
function  drawEmptyAnnotations() {
    logging("draw empty annotations", null, "drawer");
    //document.getElementById("AnnotationTool_annotationView").innerHTML = "";
    $("#AnnotationTool_annotationView").append(`<p>${translations["err_annotation_nothingtoshow"]}</p>`);
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="make reactions and annotations">
//eerste div wordt toegevoegd in makeContent, laatste div wordt toegevoegd in newReaction
function makeNewReaction(){
    logging("make new reaction", null, "drawer");
    let returnvalue =
        `<div class="AnnotationTool_reactionBox AnnotationTool_hasTooltip"> <!--container voor reacties-->
                    <textarea class="AnnotationTool_reactionText" placeholder="plaats een reactie"></textarea>                    
                    <button class="AnnotationTool_hasTooltip AnnotationTool_reactionButton" onClick="postReaction(this)">
                        <i class="material-icons">send</i>
                        <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-bleft AnnotationTool_tooltiptext-below AnnotationTool_tooltiptext-long">
                          ${translations["ttp_annotation_send"]}
                        </div> 
                    </button>                                                      
            </div>
        `;
    stopKeyEventPropagation($(returnvalue));
    return returnvalue;
}
/*new*/function makeReaction(annotation,reaction,number){
    logging("make reaction", reaction, "drawer");
    let accountFunctionValue=getAccountFunction(reaction.person);
    let showDelete = "hidden";
    if(reaction.person === getUser() || getAccountFunction(getUser())==="prof"){
        showDelete = "";
    }
    let showEdit = "hidden";
    if(reaction.person === getUser()){
        showEdit = "";
    }
    let history = "hidden";
    if(reaction.status==="changed"){
         history = "";
    }
    if(reaction.status==="used" || reaction.status==="changed"){
       return `<div class="AnnotationTool_reaction" data-id = ${number} >
                <div>
                     <div class="AnnotationTool_rating-container">
                         <div class="AnnotationTool_hasTooltip" style="float: left">
                            <i class="AnnotationTool_upvote material-icons" onclick="reactionUpvote(this)">thumb_up</i><p style="float: right">${reaction.rating.thumbsUp.length}</p>
                            <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                              ${translations["ttp_annotation_upvote"]}
                            </div>
                          </div>
                          <div class="AnnotationTool_hasTooltip" style="float: right">
                            <i class="AnnotationTool_downvote material-icons" onclick="reactionDownvote(this)">thumb_down</i><p style="float: right">${reaction.rating.thumbsDown.length}</p>
                            <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-left">
                              ${translations["ttp_annotation_downvote"]}
                            </div>
                         </div>
                     </div>
                         <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue} >${noHtml(reaction.person)}</p> 
                </div>
                <div class = "AnnotationTool_editDel-container">
                     <div class="AnnotationTool_hasTooltip" ${showEdit}>
                        <i  class="AnnotationTool_btn_edit material-icons" onClick="ReactionEdit(this)">mode_edit</i>
                        <div class="AnnotationTool_tooltiptext">
                          ${translations["ttp_annotation_edit"]}
                        </div>
                     </div>
                     <div class="AnnotationTool_hasTooltip" ${showDelete}>
                        <i  class="AnnotationTool_btn_delete material-icons" onClick="ReactionDelete(this)">delete</i>
                        <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                          ${translations["ttp_annotation_delete"]}
                        </div>
                     </div>
                     <div class="AnnotationTool_hasTooltip" ${history} data-annotationId = ${annotation.id} data-id = ${number}>
                        <i  class="AnnotationTool_btn_history material-icons" onClick="openHistoryContainer(this)">restore</i>
                        <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                          ${translations["ttp_annotation_history"]}
                        </div>
                     </div>
                </div>
                <p class="AnnotationTool_pReaction">${noHtml(reaction.text[reaction.text.length-1])}</p>
            </div>`;
    }else{
        return `<div class="AnnotationTool_reaction" data-id = ${number}>
                    <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue}>${noHtml(reaction.person)}</p> 
                    <p class="AnnotationTool_pReaction"><i>${translations["ttp_annotation_removed"]}</i></p>
                </div>`;
    }
}
/*new*/ export function makeContent(annotation){
    logging("draw the minimized content of annotation", annotation, "drawer");
    let accountFunctionValue=getAccountFunction(annotation.op);
    if(annotation.status==="used" || annotation.status==="changed"){
        showAnnotationOnDia(annotation, false);
        return `
                  <div class="AnnotationTool_annotationContent" onclick="maximize(this)">
                      <div class="AnnotationTool_upper-row">
                        <div class="AnnotationTool_hasTooltip">
                            <i class="AnnotationTool_resizer material-icons">add_box</i>
                            <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-below">
                              ${translations["ttp_annotation_maximize"]}
                            </div>
                        </div>                                            
                        <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue} >${noHtml(annotation.op)}</p>
                        <div class="AnnotationTool_hasTooltip">
                            <div class="AnnotationTool_reactionCounter"><i class="material-icons">message</i><p style="float: right;">${annotation.reactions.length}</p></div>
                            <div class="AnnotationTool_tooltiptext ">${translations["ttp_annotation_reactioncounter"]}</div>
                        </div>
                      </div>
                      <p class="AnnotationTool_annotationCategory">[${noHtml(annotation.content.category)}]</p><p class="AnnotationTool_annotationTitle">${noHtml(annotation.title)}</p>
                  </div>
                  <div class="AnnotationTool_hasTooltip">
                      <div class="AnnotationTool_annotationTags"></div>
                      <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long">
                         ${translations["ttp_annotation_tag"]}
                      </div>
                  </div>
                  `;
    }else{
        return `<div class="AnnotationTool_annotationContent">
                     <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue}>${noHtml(annotation.op)}</p>
                     <p class="AnnotationTool_annotationText"><i>${translations["ttp_annotation_removed"]}</i></p>
               </div>`;
    }
}
/*new*/function makeContentMax(annotation) {
    logging("draw the maximized content of annotation", annotation, "drawer");
    let accountFunctionValue=getAccountFunction(annotation.op);
    let showDelete = "hidden";
    if(annotation.op === getUser() || getAccountFunction(getUser())==="prof"){
        showDelete = "";
    }
    let showEdit = "hidden";
    if(annotation.op === getUser()){
        showEdit = "";
    }
    let history = "hidden";
    if(annotation.status==="changed"){
         history = "";
    }
    if(annotation.status==="used" || annotation.status==="changed") {
        showAnnotationOnDia(annotation, true);
        return `
                  <div class="AnnotationTool_annotationContent" >
                        <div class="AnnotationTool_upper-row">
                            <div class="AnnotationTool_hasTooltip">
                                <i class="AnnotationTool_resizer material-icons" onClick="minimize(this)">indeterminate_check_box</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-below">
                                  ${translations["ttp_annotation_minimize"]}
                                </div>
                            </div>                            
                            <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue} >${noHtml(annotation.op)}</p>                          
                            <div class="AnnotationTool_rating-container">
                                <div class="AnnotationTool_hasTooltip" style="float: left">
                                    <i class="AnnotationTool_upvote material-icons" onClick="annotationUpvote(this)">thumb_up</i><p style="float: right">${annotation.rating.thumbsUp.length}</p>
                                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                                      ${translations["ttp_annotation_upvote"]}
                                    </div>
                                </div>
                                <div class="AnnotationTool_hasTooltip" style="float: right">
                                    <i class="AnnotationTool_downvote material-icons" onClick="annotationDownvote(this)">thumb_down</i><p style="float: right">${annotation.rating.thumbsDown.length}</p>
                                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                                      ${translations["ttp_annotation_downvote"]}
                                    </div>
                                </div>
                            </div>
                            <div class="AnnotationTool_favoriteContainer AnnotationTool_hasTooltip">
                                <i class="AnnotationTool_favorite material-icons" onClick="favorite(this)">star_border</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-below">
                                  ${translations["ttp_annotation_favorite"]}
                                </div>
                            </div>
                        </div>
                        <div class = "AnnotationTool_editDel-container" >
                            <div class="AnnotationTool_hasTooltip" ${showEdit}>
                                <i class="AnnotationTool_btn_edit material-icons" onClick="annotationEdit(this)">mode_edit</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                                  ${translations["ttp_annotation_edit"]}
                                </div>
                            </div>
                            <div class="AnnotationTool_hasTooltip" ${showDelete}>
                                <i class="AnnotationTool_btn_delete material-icons" onClick="annotationDelete(this)">delete</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-sleft">
                                  ${translations["ttp_annotation_delete"]}
                                </div>
                            </div>
                            <div class="AnnotationTool_hasTooltip" ${history} data-annotationId=${annotation.id}>
                                <i  class="AnnotationTool_btn_history material-icons" onClick="openHistoryContainer(this)">restore</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-left">
                                  ${translations["ttp_annotation_history"]}
                                </div>
                            </div>
                        </div>
                        <p class="AnnotationTool_annotationCategory">[${noHtml(annotation.content.category)}]</p><p class="AnnotationTool_annotationTitle">${noHtml(annotation.title)}</p>
                        <p class="AnnotationTool_annotationText">${noHtml(annotation.content.commentary[annotation.content.commentary.length-1])}</p>
                  </div>
                  <div class="AnnotationTool_hasTooltip">
                    <div class="AnnotationTool_annotationTags"></div>
                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long">
                      ${translations["ttp_annotation_tag"]}
                    </div>
                  </div>
                  <div class="AnnotationTool_reactionsView"></div>`;
    }else{
        return `<div class="AnnotationTool_annotationContent">
                     <p class="AnnotationTool_annotationUserName" accountvalue=${accountFunctionValue}>${noHtml(annotation.op)}</p>
                     <p class="AnnotationTool_annotationText"><i>${translations["ttp_annotation_removed"]}</i></p>
               </div>`;
    }
}

//verwacht de annotation en het element waartoe de tags worden toegevoegd, hier dus $(ann).children(".annotationTags")[0]
//met ann de js referentie naar een nieuw/bestaand annotation div element
export function fillTags(annotation, target){
    logging("draw the tags of annotation", annotation, "drawer");
    for (let annotationTag of annotation.contentTags) {
        let p = document.createElement("P");
        p.className = "AnnotationTool_tag";
        p.innerHTML = noHtml(annotationTag);
        if (TAGCOLORS[annotationTag]) {
            p.style.backgroundColor = TAGCOLORS[annotationTag];
        }
        p.addEventListener('click', function (e) {
            TagNavigation(e);
        });
        $(target).append(p);
    }
}
function TagNavigation(e){
    goToOverview();
    logging(e.target.innerHTML);
    let searchList = searchEverything([e.target.innerHTML],getPresentationId());
    searchList = helpView(searchList);
    putResults(searchList);
}

//verwacht de annotation en het element waartoe de reacties worden toegevoegd, hier dus $(ann).children(".reactionsView")[0]
//met ann de js referentie naar een nieuw/bestaand annotation div element
//reactions krijgen een id in de html aan de hand van de index van het element in de lijst reactions van zijn annotation
function fillReactions(annotation, element){
    let count = 0;
    for (let reaction of annotation.reactions) {
        $(element).append(makeReaction(annotation,reaction, count));
        count ++;
    }
    let reactions = $(element).find(".AnnotationTool_reaction");
    for(let reaction of reactions){
        let reactionObject = localData.findReactionByHtmlId(annotation.id,reaction.getAttribute("data-id"));
        let reactionRatingContainer = $(reaction).find(".AnnotationTool_rating-container")[0];
        refreshRatingButtonsStyle(reactionRatingContainer, reactionObject)
    }

}

//zal de kleur van de knoppen in de meegegeven rating-container aanpassen naargelang de rating van het object (annotation of reaction)
function refreshRatingButtonsStyle(ratingContainer, object){
    logging("refresh style of ratingbutton", null, "drawer");
    let upvote = $(ratingContainer).find(".AnnotationTool_upvote")[0];
    if(upvote){
        if(object.rating.thumbsUp.includes(getUser())){
            upvote.style.color = voteColor;
        }
        else{
            upvote.style.color = iconColor;
        }
    }
    let downvote = $(ratingContainer).find(".AnnotationTool_downvote")[0];
    if(downvote){
        if(object.rating.thumbsDown.includes(getUser())){
            downvote.style.color = voteColor;
        }
        else{
            downvote.style.color = iconColor;
        }
    }
}

function  refreshFavoriteButtonStyle(targetAnnotation, annotationObject) {
    logging("refresh style of favoritebutton", null, "drawer");
    if(annotationObject.cherrypicking.includes(getUser())){
        let favorite = $(targetAnnotation).find(".AnnotationTool_favorite")[0];
        if(favorite){
            favorite.innerHTML = "star";
            favorite.style.color = favoriteColor;
        }
        let reactions = $(targetAnnotation).find(".AnnotationTool_reaction");
        for(let reaction of reactions){
            let reactionObject = localData.findReactionByHtmlId(annotationObject.id,reaction.getAttribute("data-id"));
            if(reactionObject.rating.thumbsUp.includes(getUser())){
                let upvote = $(reaction).find(".AnnotationTool_upvote")[0];
                upvote.style.color = voteColor;
            }
            if(reactionObject.rating.thumbsDown.includes(getUser())){
                let downvote = $(reaction).find(".AnnotationTool_downvote")[0];
                downvote.style.color = voteColor;
            }
        }
    }
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="maximize and minimize annotations">
function maximize(target){
    let addHere= $(target).closest("div.AnnotationTool_annotation");
    let maxId = $(addHere).attr("data-id");
    let annotation = localData.findAnnotationByHtmlId(maxId);
    $(addHere).empty();
    drawAnnotationsMax(annotation,addHere);

    showAnnotationOnDia(annotation,true);
}
function minimize(target){
    let addHere= $(target).closest("div.AnnotationTool_annotation");
    let maxId = $(addHere).attr("data-id");
    let annotation = localData.findAnnotationByHtmlId(maxId);
    $(addHere).empty();
    drawAnnotationsMin(annotation,addHere);

    showAnnotationOnDia(annotation,false);
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="edit and delete reactions and annotations">
function annotationEdit(target){
    if(document.getElementById("AnnotationTool_overview").hidden === false) {
        let surrogate = {id : "AnnotationTool_navDefaultView"};     //Eerst naar defaultview gaan, door te simuleren dat de knop ingedrukt wordt.
        show(surrogate);
    }
    setReadyForForm();

    let editThisId = $(target).closest("div.AnnotationTool_annotation").attr("data-id");
    let annotation = localData.findAnnotationByHtmlId(editThisId);
    logging("edit an annotation", annotation, "drawer");
    openForm();

    //Stelt het geselecteerde element in
    setSelectedElement(null);
    if(annotation.element!== undefined){
        setSelectedElement(document.getElementById(annotation.element));
        editStyle(selectedElement, "click");
    }
    $("#AnnotationTool_ann_title").val(annotation.title);
    //$("#AnnotationTool_comment").val(annotation.content.commentary);
    /*new*/$("#AnnotationTool_comment").val(annotation.content.commentary[annotation.content.commentary.length-1]);
    $("#AnnotationTool_category").val(annotation.content.category);
    for(let item of annotation.contentTags){
        drawTagInForm(item);
    }
    if(annotation.view==="public"){
        $('input[id="AnnotationTool_switchCheckbox"]').click();

    }
    document.getElementById("AnnotationTool_ok").setAttribute("onClick", `submitAnnotationAgain('${editThisId}');`);
}
function annotationDelete(target){
    let deleteThis = $(target).closest("div.AnnotationTool_annotation");
    let deleteId = $(deleteThis).attr("data-id");
    let annotation = localData.findAnnotationByHtmlId(deleteId);
    logging("delete annotation", annotation, "drawer");
    hideAnnotationOnDia(annotation);
    let oldstatus = annotation.status;
    annotation.status = "deleted";
    caller.deleteAnnotation(annotation,
        () => {
            refreshTable();
            },
        () => {
                annotation.status = oldstatus;
                drawError(translations["err_annotation_deletefailed"], deleteThis);
                showAnnotationOnDia(annotation);
        }
    )
}
function ReactionEdit(target){
    let annotationId = $(target).closest("div.AnnotationTool_annotation").attr("data-id");
    let reactionId = $(target).closest("div.AnnotationTool_reaction").attr("data-id");
    let reaction = localData.findReactionByHtmlId(annotationId,reactionId);
    logging("edit reaction", reaction, "drawer");

    let editThis = $(target).closest("div.AnnotationTool_reaction");
    //editThis.getElementsByClassName("editDel-container")[0].setAttribute("type", "hidden");
    ($(editThis).find(".AnnotationTool_editDel-container")[0]).hidden=true;
    ($(editThis).find(".AnnotationTool_pReaction")[0]).remove();
    /*new*/$(editThis).append(`<div class="AnnotationTool_reactionBox"> 
                            <textarea class="AnnotationTool_reactionTextAgain">${noHtml(reaction.text[reaction.text.length-1])}</textarea>
                            <button class="AnnotationTool_hasTooltip AnnotationTool_reactionButton" onClick="postReactionAgain(this)">
                                <i class="material-icons">send</i>
                                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-left AnnotationTool_tooltiptext-below AnnotationTool_tooltiptext-long">
                                  ${translations["ttp_reaction_postreaction"]}
                                </div>
                            </button>
                        </div>`);
}
function ReactionDelete(target){
    //hoe kan dit zelfs werken als findReactionByHtmlId totaal niet klopt?
    let deleteFromThis = $(target).closest("div.AnnotationTool_annotation");
    let deleteFromId = $(deleteFromThis).attr("data-id");
    let annotation = localData.findAnnotationByHtmlId(deleteFromId);

    let deleteThis = $(target).closest("div.AnnotationTool_reaction");
    let deleteId = $(deleteThis).attr("data-id");
    let reaction = localData.findReactionByHtmlId(deleteFromId, deleteId);        //TODO: Juiste reactie kiezen die verwijderd moet worden
    logging("delete reaction", reaction, "drawer");

    let oldStatus = reaction.status;
    reaction.status = "deleted";
    caller.deleteReaction(annotation,
        () => {
            //refreshTable();
            maximize(target);
            },
        () => {
                reaction.status = oldStatus;
                drawError("verwijderen reactie mislukt",deleteThis);
            }
    )
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="color elements on slide after jumping to it">
function showAnnotationOnDia(annotation, maximized = false){
    logging("annotation drawn on slide",annotation,"drawer");
    let element = giveValidElement(annotation);
    if(element === null)return;

    if(maximized) {
        element.style.backgroundColor = "lightblue";
        element.style.border = "none";
    } else {
        element.style.backgroundColor = "";
        element.style.border = "solid medium lightblue";
    }
}

function hideAnnotationOnDia(annotation){
    logging("hide annotation on dia", annotation, "drawer");
    let element = giveValidElement(annotation);
    if(element === null)return;

    element.style.backgroundColor = "";
    element.style.border = "none";
}

function giveValidElement(annotation) {
    if(annotation === null || annotation === undefined) {return null;}
    let elementID = annotation.element;
    if(elementID === "" || elementID === undefined || elementID === null) {return null;}
    return document.getElementById(elementID);
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="after abruptly leaving, get back to default view">
export function setToDefault(){
    logging("set to default view", null, "drawer");
    clearSelection(); //Verwijdert de selectie op de slides
    $("#AnnotationTool_formHere").empty();
    $("#AnnotationTool_annotationView").empty();
    drawAnnotations(getAnnotationsById(localData.getAnnotations(),getPresentationId(), getSlideNumber()));
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="voting">
//niet eigen comments up/downvoten
function annotationUpvote(target){
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    logging("upvote annotation", targetAnnotation, "drawer");
    if(getUser()!==annotation.op){
        if(annotation.hasUpvoted(getUser())){
            annotation.removeVote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.upvote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
        else if(annotation.hasDownvoted(getUser())){
            annotation.removeVote(getUser());
            annotation.upvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.removeVote(getUser());
                    annotation.downvote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
        else{
            annotation.upvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.removeVote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
    }
}
function annotationDownvote(target){
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    logging("downvote annotation", targetAnnotation, "drawer");
    if(getUser()!==annotation.op){
        if(annotation.hasDownvoted(getUser())){
            annotation.removeVote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.downvote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
        else if(annotation.hasUpvoted(getUser())){
            annotation.removeVote(getUser());
            annotation.downvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.removeVote(getUser());
                    annotation.upvote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
        else{
            annotation.downvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, annotation);
                    refreshRatingButtonsStyle(ratingContainer, annotation);
                },
                () => {
                    annotation.removeVote(getUser());
                    drawError(translations["err_annotation_votefailed"],targetAnnotation);
                }
            );
        }
    }
}
function reactionUpvote(target){
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    let targetReaction = target.closest(".AnnotationTool_reaction");
    let reaction = annotation.reactions[parseInt(targetReaction.getAttribute("data-id"))];
    logging("upvote reaction", reaction, "drawer");
    if(getUser()!==reaction.person){
        if(reaction.hasUpvoted(getUser())){
            reaction.removeVote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.upvote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
        else if(reaction.hasDownvoted(getUser())){
            reaction.removeVote(getUser());
            reaction.upvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.removeVote(getUser());
                    reaction.downvote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
        else{
            reaction.upvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.removeVote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
    }
}
function reactionDownvote(target){
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    let targetReaction = target.closest(".AnnotationTool_reaction");
    let reaction = annotation.reactions[parseInt(targetReaction.getAttribute("data-id"))];
    logging("downvote reaction", reaction, "drawer");
    if(getUser()!==reaction.person){
        if(reaction.hasDownvoted(getUser())){
            reaction.removeVote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.downvote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
        else if(reaction.hasUpvoted(getUser())){
            reaction.removeVote(getUser());
            reaction.downvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.removeVote(getUser());
                    reaction.upvote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
        else{
            reaction.downvote(getUser());
            caller.sendVote(annotation,
                () => {
                    let ratingContainer = $(target).closest(".AnnotationTool_rating-container")[0];
                    refreshRatingButtons(ratingContainer, reaction);
                    refreshRatingButtonsStyle(ratingContainer, reaction);
                },
                () => {
                    reaction.removeVote(getUser());
                    drawError("Action failed",targetReaction);
                }
            );
        }
    }
}

function refreshRatingButtons(ratingContainer, object){
    logging("refresh ratingbuttons", null, "drawer");
    $(ratingContainer).find("p")[0].innerHTML = object.rating.thumbsUp.length;
    $(ratingContainer).find("p")[1].innerHTML = object.rating.thumbsDown.length;

}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="cherrypicking">
function favorite(target){
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    logging("favorite annotation", annotation, "drawer");
    let res = annotation.cherrypick(getUser());
    caller.sendVote(annotation,
        () => {
            if(res === 0){
                target.style.color = favoriteColor;
                target.innerHTML = "star";
            }
            if(res === 1){
                target.style.color = iconColor;
                target.innerHTML = "star_border";
            }
        },
        () => {
            annotation.cherrypick(getUser());
            drawError(translations["err_annotation_favoritefailed"],targetAnnotation);
        }
    );
}

//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="loading animation">
export function startLoadingAnimation(){
    logging("start loading animation", null, "drawer");
    document.getElementById("AnnotationTool_loadingAnimContainer").classList.remove("AnnotationTool_animationHidden");
    $("#AnnotationTool_loadingIcon").addClass("AnnotationTool_loadingAnim");
}
export function stopLoadingAnimation(){
    logging("stop loading animation", null, "drawer");
    document.getElementById("AnnotationTool_loadingAnimContainer").classList.add("AnnotationTool_animationHidden");
    $("#AnnotationTool_loadingIcon").removeClass("AnnotationTool_loadingAnim");

}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="view history">
/*new*/export function getScaling(){
    let scaling;
    if($("div#AnnotationTool_formHere").html() !== ""){
        let el = document.getElementById("AnnotationTool_switchLabel");
        scaling = el.getBoundingClientRect().width / el.offsetWidth;
        //enkel in add tabblad op dit element scaling baseren
    }else if(document.getElementById("AnnotationTool_overview").hidden === false) {
        let el = document.getElementsByClassName("AnnotationTool_jumpButton");
        scaling = el[0].getBoundingClientRect().width / el[0].offsetWidth;
        //enkel in overview tabblad op dit element scaling baseren
    }else{
        let el = document.getElementsByClassName("AnnotationTool_slideName");
        scaling = el[0].getBoundingClientRect().width / el[0].offsetWidth;
        //enkel in default tabblad op dit element scaling baseren
    }
    return scaling;
}
/*new*/function openHistoryContainer(target) {
    logging("open historycontainer", null, "drawer");
    if (document.getElementById('AnnotationTool_historyContainer').hidden === true) {
        $(".AnnotationTool_historyBody").empty();
        let content = "";
        let annotationId = $(target).closest("div").attr("data-annotationId");
        if (target.closest("div").hasAttribute("data-id")) {
            let reactionId = $(target).closest("div").attr("data-id");
            let reaction = localData.findReactionByHtmlId(annotationId, reactionId);
            for (let comment of reaction.text) {
                let contentComment = `<div class="AnnotationTool_historySection">
                                    <p>${noHtml(comment)}</p>
                                </div>                                
                               `;
                content += contentComment;
            }
        } else {
            let annotation = localData.findAnnotationByHtmlId(annotationId);
            for (let comment of annotation.content.commentary) {
                let contentComment = `<div class="AnnotationTool_historySection">
                                       <p>${noHtml(comment)}</p>
                                </div>                                
                               `;
                content += contentComment;
            }
        }
        //content toevoegen
        $(".AnnotationTool_historyBody").append(content);
        document.getElementById('AnnotationTool_historyContainer').hidden = false;
    } else {
        document.getElementById('AnnotationTool_historyContainer').hidden = true;
    }

    let scaling=getScaling();
    //logging("scaling"+scaling);
    //1 bij gewoon formaat en 1.5 op dia
    //logging("schermgrootte"+$(window).width());
    //logging("breedte AnnotationTool_annotation"+document.getElementsByClassName("AnnotationTool_annotation")[0].getBoundingClientRect().width);             //bij gewone schaling
    //logging("breedte AnnotationTool_searchresult"+document.getElementsByClassName("AnnotationTool_searchresult")[0].getBoundingClientRect().width);
    //logging("hoogte AnnotationTool_annotation"+document.getElementsByClassName("AnnotationTool_annotation")[0].getBoundingClientRect().height);             //bij gewone schaling
    //logging("hoogte AnnotationTool_searchresult"+document.getElementsByClassName("AnnotationTool_searchresult")[0].getBoundingClientRect().height);
    if(scaling>1.4){
            //document.getElementById("AnnotationTool_searchResults").style.transform="scaleX(0.7)";
            //document.getElementById("AnnotationTool_searchResults").style.transform="scaleY(0.7)";
            logging("hoogte"+ $(window).height()/4);
            let ytop = $(window).height()/6  + "px";
            $("#AnnotationTool_historyContainer").css("top", ytop);
             if (document.getElementById("AnnotationTool_overview").hidden === false) {
                 if (target.getBoundingClientRect().left < $(window).width() / 2) {
                     let xleft = "450px";
                     $("#AnnotationTool_historyContainer").css("left", xleft);
                 } else {
                     let xleft = "380px";
                     $("#AnnotationTool_historyContainer").css("left", xleft);
                 }
             }else{
                 let xleft = $(window).width()/30 + "px";
                 $("#AnnotationTool_historyContainer").css("left", xleft);
             }
            //dit nog aanpassen
    }else{
            let ytop = target.getBoundingClientRect().top - 50 + "px";
            $("#AnnotationTool_historyContainer").css("top", ytop);
            if (document.getElementById("AnnotationTool_overview").hidden === false) {
                if (target.getBoundingClientRect().left < $(window).width() / 2) {
                    let xleft = target.getBoundingClientRect().left + "px";
                    $("#AnnotationTool_historyContainer").css("left", xleft);
                } else {
                    let xleft = target.getBoundingClientRect().left - ( document.getElementsByClassName("AnnotationTool_searchresult")[0].getBoundingClientRect().width ) + "px";
                    $("#AnnotationTool_historyContainer").css("left", xleft);
                }
            } else {
                $("#AnnotationTool_historyContainer").css("left", "70px");
            }
    }
}
/*new*/function closeHistoryContainer() {
    document.getElementById('AnnotationTool_historyContainer').hidden = true;
}
//</editor-fold>
import {translations} from "./internationalisation/translator.js";
import {logging} from "./logging.js";
import {
    getPresentationId, getSlideNumber, getUser, caller, localData, refreshTable,
    getAnnotationsByIdOverview, noHtml, stopKeyEventPropagation
} from "./data/manager.js";
import {drawError, drawReaction, drawReactionError, setToDefault,getScaling,TAGCOLORS} from "./data/Drawer.js";
import {setToDefaultButtons,GROOTTE_SIDEBAR_ABSOLUUT} from "./nav.js";
import {Reaction, Annotation} from "./data/Component.js";


window.showtag = showtag;
window.showTagEnter = showTagEnter;
window.submitAnnotation = submitAnnotation;
window.submitAnnotationAgain = submitAnnotationAgain;
window.postReaction = postReaction;
window.postReactionAgain = postReactionAgain;

//<editor-fold defaultstate="collapsed" desc="add and delete tags">
//de aangemaakte tag weergeven in de form
function showtag () {
    logging("show tag", null, "form");
    let name = document.getElementById("AnnotationTool_txtTag").value;
    let childNodes = document.getElementById("AnnotationTool_showtags").childNodes;     //Haal alle al toegevoegde tag-elementen op
    let childNodesArray = [ ...childNodes];                                             //Maak er een array van
    let existingTags = childNodesArray.map((item) => {                                  //En haal vervolgens alle tekst van de tags
        return item.firstChild.data.toLowerCase();
    });
    if(name !== ""){
        name = name.replace(/^#*/g,"");
        let names = name.split("#");
        for(let n of names){
            if(!existingTags.includes(n.toLowerCase()) && existingTags.length < 100) {           //Maximaal vijftien tags
                drawTagInForm(n);
            }
        }
    }
    document.getElementById("AnnotationTool_txtTag").value = "";
}

function showTagEnter(event){
    if(event.which == 13 || event.keyCode === 13) {
        showtag();
    }
}

export function drawTagInForm(text) {
    logging("draw tag", null, "form");
    let b = document.createElement("BUTTON");
    b.innerHTML = noHtml(text);
    if(TAGCOLORS[noHtml(text)]){
        b.style.backgroundColor = TAGCOLORS[noHtml(text)];
    }
    b.classList.add("AnnotationTool_tag");
    b.addEventListener('click', function (e) {
        deletetag(e);
    });
    document.getElementById("AnnotationTool_showtags").appendChild(b);
}

//de aangeklikte tag in de form verwijderen
export function deletetag (e) {
    logging("delete tag", null, "form");
    document.getElementById("AnnotationTool_showtags").removeChild(e.target);
}
//</editor-fold>

//selecteer op dia
export let selectEnabled = false;
export let selectedElement = null;

export function setSelectedElement(element){selectedElement = element;}
export function setSelectedEnabled(boolean){selectEnabled = boolean;}

//<editor-fold defaultstate="collapsed" desc="select an element">
function isInvalidSelection(element) {
    if(element === null)
        return true;
    if(selectEnabled === false)
        return true; //Invalid als selecteren disabled is
    let regex = /-/;
    if(regex.exec(element.id) === null)
        return true; //Als er in elementID geen "-" voorkomt, is het element invalid
    return false;
}

function isSelectedElement(element) {
    if(element === null)
        return false;
    if(selectedElement === element)
        return true; //Als dat element reeds geselecteerd is
}
/*new*/let firstHover=true;
export let hooveredElement;
export function initEventListenersToSlide(){
    logging("initialise eventlisteners to slides", null, "form");
    let slides = document.getElementsByClassName("slide");    //alle dia's worden opgeslaan in sections, dit zijn dus alle dia's
    for(let s of slides){
        //Maakt elementen binnen dia's aanklikbaar voor het selecteren
        //Event bubbling propagation
        s.addEventListener('click', function (event) {
            let element = event.target;
            if(isInvalidSelection(element)){return;}
            editStyle(selectedElement, "clear");
            if(isSelectedElement(element)) {
                selectedElement = null;
            } else {
                selectedElement = element;
                editStyle(selectedElement, "click");
            }
            showSidebarWhenHover();
        });

        s.addEventListener('mouseover',function(event) {    //zorgt in combinatie met mouseout voor zichtbare hover over dia's
            hooveredElement = event.target;
            if(isInvalidSelection(hooveredElement) || isSelectedElement(hooveredElement)) { return;}
            editStyle(hooveredElement, "hover");
            hideSidebarWhenHover();
        });

        s.addEventListener('mouseout',function(event) {
            let element = event.target;
            if(isInvalidSelection(element) || isSelectedElement(element)){ return;}
            editStyle(element, "clear");
        });
    }
}

export function showSidebarWhenHover() {
    /*new*/if(firstHover===false){
        logging("show sidebar when hovering", null, "form");
        document.getElementById("AnnotationTool_mySidebar").style.right = "0";
        document.getElementById("AnnotationTool_mySidebar").style.width = GROOTTE_SIDEBAR_ABSOLUUT(false) + "px";
        document.getElementById("AnnotationTool_mySidebar").style.display= "inline-block";
        document.getElementById("AnnotationTool_openAnnotationsBtn").style.display = "none";
        firstHover=true;
    }
}

function hideSidebarWhenHover() {
    logging("hide sidebar when hovering", null, "form");
    /*new*/if(firstHover===true && (getScaling()>1.4 || window.innerWidth<1000) ){
        firstHover=false;
        document.getElementById("AnnotationTool_mySidebar").style.right = "0";
        document.getElementById("AnnotationTool_mySidebar").style.display = "none";
        document.getElementById("AnnotationTool_openAnnotationsBtn").style.display = "none";
    }
}

export function showSidebarWhenEscape() {
    logging("show sidebar when escape pressed", null, "form");
    $(document).keyup(showSidebarWhenHover);
}

//Vervangt de backgroundcolor van geselecteerd element afhankelijk van de actie
export function editStyle( element, action = "clear") {
    logging("edit style of element (action=" + action + ")", element, "form");
    if(element === null){return;}
    if(action === "click") {
        element.style.backgroundColor = "lightblue";
    }
    else if(action === "hover"){
        element.style.backgroundColor = "yellow";
    }
    else if(action === "clear") {
        element.style.backgroundColor = "";
    }
}

export function clearSelection() {
    //Selecteren is niet meer mogelijk, er wordt geen element meer geselecteerd (kleur wordt dus ook veranderd)
    logging("clear selection", null, "form");
    editStyle(selectedElement, "clear");
    selectEnabled = false; selectedElement = null;
}

//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="(re)submit annotations and reactions">
//annotatie toevoegen bij knop form
function submitAnnotation(){
    logging("submit", null, "form");
    if ($("#AnnotationTool_comment").val()!=="" && $("#AnnotationTool_ann_title").val()!=="") {
        let presentationId = getPresentationId();      //geef id van de presentatie
        let slideNumber = getSlideNumber(); //$("#slideNumber").text();            //geef slidenummer

        let element = null; //Kan null zijn
        if(selectedElement !== null)
        element = selectedElement.id;

        let op = getUser();
        //https://stackoverflow.com/questions/8601586/jquery-val-function-cleans-up-r-n-from-textarea-why
        $.valHooks.textarea = {
            get: function (elem) {
                return elem.value.replace(/\r?\n/g, "\r\n");
            }
        };
        let title = $("#AnnotationTool_ann_title").val();
        let commentary = $("#AnnotationTool_comment").val();
        let commentaryList = [];
        commentaryList.push(commentary);
        let markType = $(`input[name="markType"]:checked`).val();
        let category = $("#AnnotationTool_category").val();
        let tagslist = document.getElementById("AnnotationTool_showtags").childNodes;
        let contentTags = [];
        for (let t of tagslist) {
            contentTags.push(t.innerHTML);
        }
        let access=$("#AnnotationTool_switchLabel").text();
        let annotation = new Annotation(null, presentationId, slideNumber, element, op, title, commentaryList, markType, category, contentTags, access);   //TODO: geef id moet null

        caller.sendAnnotationToServer(annotation,
            () => {
                setToDefault();
                setToDefaultButtons();
                refreshTable();
                    },
            () => {drawError(translations["err_form_submitfail"], $("#AnnotationTool_formHere"));}
            );
    }else{
        drawError(translations["err_form_unvalidfields"], $(".AnnotationTool_newAnnotationForm"));
    }
}

//annotatie opnieuw toevoegen bij edit van al bestaande annotatie
function submitAnnotationAgain(editThisId){
    logging("submit again", null, "form");
    if ($("#AnnotationTool_comment").val()!=="" && $("#AnnotationTool_ann_title").val()!=="") {
        let annotation = localData.findAnnotationByHtmlId(editThisId);
        annotation.element = null; //Kan null zijn
        if(selectedElement !== null)
        annotation.element = selectedElement.id;

        $.valHooks.textarea = {
            get: function (elem) {
                return elem.value.replace(/\r?\n/g, "\r\n");
            }
        };
        annotation.category = $("#AnnotationTool_category").val();
        annotation.title = $("#AnnotationTool_ann_title").val();
        let tagslist = document.getElementById("AnnotationTool_showtags").childNodes;
        let contentTags = [];
        for (let t of tagslist) {
            contentTags.push(t.innerHTML);
        }
        annotation.contentTags = contentTags;
        /*new*/annotation.content.commentary.push($("#AnnotationTool_comment").val());
        annotation.view = $("#AnnotationTool_switchLabel").text();
        annotation.status = "changed";
        caller.sendAnnotationToServer(annotation,
            () => {
                    setToDefault();
                    setToDefaultButtons();
                    refreshTable()},
            () => {
                    drawError(translations["err_form_submitfail"], "#AnnotationTool_formHere");}
        );
    }else{
        drawError(translations["err_form_unvalidfields"],$(".AnnotationTool_newAnnotationForm"));
    }
}

//toevoegen nieuwe reactie aan annotatie
function postReaction(target){
    logging("post reaction", null, "form");
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let annotation = localData.findAnnotationByHtmlId(targetAnnotation.getAttribute("data-id"));
    let person = getUser();
    let text =$(targetAnnotation).find(".AnnotationTool_reactionText")[0].value;
    if(text !== ""){
        let content = [];
        content.push(text);
        let reaction = new Reaction(annotation,person,content);
        caller.sendReaction(annotation,
            () =>{drawReaction(annotation, reaction, targetAnnotation);  $(targetAnnotation).find(".AnnotationTool_reactionText")[0].value = ""},
            () => {annotation.deleteReaction(reaction); drawReactionError(targetAnnotation)});
    }
}
function postReactionAgain(target){
    logging("post reaction again", null, "form");
    let annotationId = $(target.closest("div.AnnotationTool_annotation")).attr("data-id");
    let targetAnnotation = target.closest(".AnnotationTool_annotation");
    let reactionId = $(target.closest("div.AnnotationTool_reaction")).attr("data-id");
    let text = $(targetAnnotation).find(".AnnotationTool_reactionTextAgain")[0].value;
    let targetReaction = target.closest(".AnnotationTool_reaction");
    let annotation = localData.findAnnotationByHtmlId(annotationId);
    let reaction = localData.findReactionByHtmlId(annotationId,reactionId);
    let oldStatus = reaction.status;
   reaction.status="changed";
    if(text !== ""){
        reaction.text.push(text);
        caller.sendReaction(annotation,
            ()=>{
                    $(targetReaction).append(`<p class="AnnotationTool_pReaction">${text}</p>`);
                    ($(targetReaction).find(".AnnotationTool_editDel-container")[0]).hidden=false;
                    target.closest(".AnnotationTool_reactionBox").remove();
                    },
            () => {
                    reaction.pop();
                    reaction.status = oldStatus;
                    drawReactionError(targetReaction);
                });
    }
    // ($(targetReaction).find(".AnnotationTool_editDel-container")[0]).hidden=false;
    // target.closest(".AnnotationTool_reactionBox").remove();
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="open and cancel form">
//annotatie toevoegen afbreken in form
export function cancelAnnotation(){
    clearSelection();
}

export function openForm(){
    logging("open form to add an annotation", null, "form");
        // <div id="AnnotationTool_Visibilityswitch">
        // <label for="AnnotationTool_access" class="AnnotationTool_switch" id="AnnotationTool_lblAccess_True">Public</label>
        // <label for="AnnotationTool_access" class="AnnotationTool_switch" id="AnnotationTool_lblAccess_False">Private</label>
        // </div>

    let content=`    <div class="AnnotationTool_newAnnotationForm">
                        <div>
                            <div class="AnnotationTool_smallField AnnotationTool_hasTooltip">              
                               <select id="AnnotationTool_category">
                                    <option value="remark">Remark</option>
                                    <option value="question">Question</option>
                                    <option value="extra">Extra</option>
                               </select>
                               
                               <div id="AnnotationTool_switch">
                                  <label class="switch">
                                    <input type="checkbox" id="AnnotationTool_switchCheckbox">
                                    <span class="slider round"></span>
                                  </label>
                               </div>
                               <p id="AnnotationTool_switchLabel">private</p>
                               
                               <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long" style="left: 20px;">
                                   ${translations["ttp_from_category_visibility"]}
                               </div>
                            </div>
                            <div class="AnnotationTool_smallField">
                                <textarea id="AnnotationTool_ann_title" type="text" placeholder="${translations["txt_form_titleplaceholder"]}" rows="1" maxlength="100" required></textarea>
                            </div>
                            <div class="AnnotationTool_smallField">
                                <textarea id="AnnotationTool_comment" type="text" placeholder="${translations["txt_form_contentplaceholder"]}" rows="10" required></textarea>
                            </div>
                            <div class="AnnotationTool_smallField" id="AnnotationTool_tagbox">
                                <div class="AnnotationTool_hasTooltip">
                                    <div id="AnnotationTool_showtags"></div>
                                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long" style="left: 20px">
                                        ${translations["ttp_form_tag"]}
                                    </div>
                                </div>
                                <div>
                                    <input list="AnnotationTool_filter_tags" id="AnnotationTool_txtTag" maxlength="30" placeholder="${translations["txt_form_addtagplaceholder"]}" onkeypress="showTagEnter(event)">
                                    <datalist id="AnnotationTool_filter_tags">
                                    </datalist>
                                    <button type="button" id="AnnotationTool_btnTag" onclick="showtag()">${translations["bttn_form_addtag"]}</button>      
                                </div>
                            </div>
                            <div class="AnnotationTool_buttonsForm">                       
                                <button id="AnnotationTool_ok" onClick="submitAnnotation()">${translations["bttn_form_submit"]}</button>                
                            </div>
                        </div>
                    </div>`;

    document.getElementById("AnnotationTool_alertBtnContainer").hidden = true;
    document.getElementById("AnnotationTool_languageBtnContainer").hidden = true;

    stopKeyEventPropagation($("#AnnotationTool_ann_title"));
    stopKeyEventPropagation($("#AnnotationTool_comment"));
    stopKeyEventPropagation($("#AnnotationTool_filter_tags"));

    $("#AnnotationTool_annotationView").empty();
    $("#AnnotationTool_formHere").empty().append(content);
    $("#AnnotationTool_filter_tags").empty();
    let tagListOverview = [];
    for(let o of Object.keys(TAGCOLORS)){
        tagListOverview.push(o);
    }
    for(let annotation of getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId())){
        for(let tag of annotation.contentTags){
            if(!tagListOverview.includes(tag)){
                tagListOverview.push(tag);
            }
        }
    }
    for(let tag of tagListOverview) {
        if(Object.keys(TAGCOLORS).includes(tag)){
            $("#AnnotationTool_filter_tags").append(`<option value=${tag}>`).css("background-color",TAGCOLORS[tag]);
        }else{
            $("#AnnotationTool_filter_tags").append(`<option value=${tag}>`);
        }
    }

    selectEnabled = true; //Enablen van het selecteren op een slide
    $('input[id="AnnotationTool_switchCheckbox"]').change(function(e){
        if($("#AnnotationTool_switchLabel").text()==="private"){
            $("#AnnotationTool_switchLabel").text("public");
            $("#AnnotationTool_switchLabel").css("color","#2196F3");
        }else{
            $("#AnnotationTool_switchLabel").text("private");
            $("#AnnotationTool_switchLabel").css("color","#A9A9A9");
        }
    });
}
//</editor-fold>

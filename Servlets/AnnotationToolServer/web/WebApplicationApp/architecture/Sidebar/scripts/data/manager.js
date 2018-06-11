//dit bestand bevat alle methodes/functies die uit de html worden op geroepen (events)
import {Caller} from "./Caller.js";
import {LocalData} from "./LocalData.js";
import {logging} from "../logging.js";
import {startLoadingAnimation, stopLoadingAnimation} from "./Drawer.js";
import {setToDefaultButtons} from "../nav.js";
import {setToDefault} from "./Drawer.js";
import {drawAnnotations, drawError,getScaling} from "./Drawer.js";
import {initEventListenersToSlide} from "../annotationForm.js";
import {initTranslator, switchLanguage, translations} from "../internationalisation/translator.js";
import {initIndex,changeDropdownExceptFor} from "./Sidebar.js";
import {makeSidebarResizable,open_sidebar,goToOverview} from "../nav.js";
import {showSidebarWhenHover,hooveredElement,editStyle,showSidebarWhenEscape} from "../annotationForm.js";


window.openAlertContainer = openAlertContainer;
window.closeAlertContainer = closeAlertContainer;
window.changeLanguage=changeLanguage;



let user=prompt("default: ugent name\nadmin: professor\n\nEnter name:", "ugent name");
let presentationId;
//<editor-fold defaultstate="collapsed" desc="getUser() getPresentationId() getSlideNumber()">
//todo: onderstaande functies implementeren
export function getUser() {
    logging("get user " + user, null, "manager");
    if(user !== null  && user !== ''){
        return user;
    }
    else{
        return "ugent name";
    }
}

export function getPresentationId() {
    return presentationId;
}

export function getAccountFunction(name){
    if(name==="professor"){return "prof";}
    else{return "student";}
}

export function getSlideNumber() {
    logging("get slidenummer", null, "manager");
    let slide = document.getElementsByClassName("slide active")[0];
    if(slide){
        let id = slide.getAttribute("id");
        return id;
    }
    else{
        return null;
    }
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="detecteren van wissel slide">
let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
let mutationObserverConfig = {attributes: true, childList: false};

//Houd de ID van de vorige actieve slide bij
let previousActiveSlideID = null;

function detectActiveSlideChange(mutationRecords) {
    logging("active slide change detected",null, "manager");
    for(let m of mutationRecords){
        if(m.type === 'attributes' && m.attributeName === 'class'){
            if(m.target.classList.contains("active") && m.target.id !== previousActiveSlideID){
                editStyle(hooveredElement, "clear");
                logging("class of this slide has been modified", m, "manager");
                showSidebarWhenHover();
                previousActiveSlideID = m.target.id;
                setToDefault();
                setToDefaultButtons();
            }
        }
    }
}
let observer = new MutationObserver(detectActiveSlideChange);
function addSlideChangeMutationObserver() {
    logging("adding observers", null, "manager");
    previousActiveSlideID = getSlideNumber();
    for(let slide of document.getElementsByClassName("slide")){
        logging(slide);
        observer.observe(slide, mutationObserverConfig);
    }
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="aanmaken localData en caller">
export let localData = new LocalData();
export let caller = new Caller(localData, startLoadingAnimation, stopLoadingAnimation);
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="main">
export function main(){
    presentationId=$("header a.module[href='#title']").text();
    logging(presentationId);
    logging("main", null, "manager");
    initIndex();
    makeSidebarResizable();
    idToewijzing(); //Wijst ID's toe aan elke element binnen een slide
    initEventListenersToSlide(); //js van form toevoegen
    refreshTable();
    addSlideChangeMutationObserver();
    document.getElementById("AnnotationTool_defaultView").hidden = false;
    stopKeyEventPropagation($("#AnnotationTool_inputSearch"));
    showSidebarWhenEscape();
}
//</editor-fold>
            
//<editor-fold defaultstate="collapsed" desc="refresh">
/*new*/let oldAnnotationList;
/*new*/export let refreshTable = () => {
    logging("refresh table", null, "manager");
    oldAnnotationList = getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId());
    caller.loadAnnotationsFromServer(
        () => {
                drawAnnotations(getAnnotationsById(localData.getAnnotations(),getPresentationId(),getSlideNumber()));
                },
        () => {drawError(translations["err_manager_failretrieveann"],document.getElementById("AnnotationTool_annotationView"))}
        );
    //drawAnnotationsError()
};
//</editor-fold>

//lokaal zoeken en filteren
//<editor-fold defaultstate="collapsed" desc="ask for specific presentation and slide">
export function getAnnotationsByIdOverview (annotationList, presentationId){
    logging("get annotations for presentation " + presentationId, null, "manager");
    let filterList = [];
    for(let item of annotationList) {
        if(item.presentationId === presentationId){
            filterList.push(item);
        }
    }
    return filterList;
}

export function getAnnotationsById(annotationList, presentationId,slideNumber){
    logging("get annotations for slide " + slideNumber, null, "manager");
    if(slideNumber === null){
        let filterList = [];
        for(let item of annotationList) {
            if(item.presentationId === presentationId){
                filterList.push(item);
            }
        }
        return filterList;
    }
    else{
        let filterList = [];
        for(let item of annotationList) {
            if(item.presentationId === presentationId && item.slideNumber === slideNumber){
                filterList.push(item);
            }
        }
        return filterList;
    }
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="stop event propagation on target key events">
export function stopKeyEventPropagation(target) {
    target.on("keypress keydown keyup", function(e) {
        e.stopPropagation();
    });
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="no injected html code may be shown to users">
export function noHtml(html) {
    //injectie tegengaan door alle html te vervangen door gewoon tekst
    return $( $.parseHTML(html) ).text();
}
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="automatic ID-Assignment to webslide-elements">
let idToewijzing = () => {
    let slides = document.getElementsByClassName("slide");
    //Voor elke slide wordt de id ervan gebruikt om een id voor al zijn kinderelementen te construeren
    for(let i = 0; i < slides.length; i++){
        //Slaat de id van een slide op
            let id = slides[i].attributes["id"].value;
        recursieveIdToewijzing(slides[i], id);
    }
    logging("assign Id's to all elements", document.body, "manager");
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
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="notifications for past week">
/*new*/function alertsThisWeek(){
    logging("show alerts this week", null, "manager");
    $(".AnnotationTool_alertBody").empty();
    function treatAsUTC(date) {
        let result = new Date(date);
        result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
        return result;
    }
    function daysBetween(startDate, endDate) {
        var millisecondsPerDay = 24 * 60 * 60 * 1000;
        return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
    }
    let newAnnotationList = getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId());
    let extraDictionary ={};
    let alertDictionary= {};//annotatie op nieuwe namen
    for(let annotation of newAnnotationList){
        if(annotation.view==="public" || (annotation.view==="private" && getUser()===annotation.op)) {
            if (daysBetween(annotation.date, new Date()) <= 7) {
                alertDictionary[annotation.id] = [annotation.op];
                extraDictionary[annotation.id] = annotation;
                for (let reaction of annotation.reactions) {
                    if (!alertDictionary[annotation.id].includes(reaction.person)) {
                        alertDictionary[annotation.id].push(reaction.person);
                    }
                }
            }
            else {
                for (let reaction of annotation.reactions) {
                    if (daysBetween(reaction.date, new Date()) <= 7) {
                        if (alertDictionary[annotation.id]) {
                            if (!alertDictionary[annotation.id].includes(reaction.person)) {
                                alertDictionary[annotation.id].push(reaction.person);
                            }
                        } else {
                            extraDictionary[annotation.id] = annotation;
                            alertDictionary[annotation.id] = [reaction.person];
                        }
                    }
                }
            }
        }
    }
    let content="";
    if(Object.keys(extraDictionary).length > 0){
        for(let id of Object.keys(extraDictionary)){
            let listReacters = alertDictionary[id];
            let l;
            if(listReacters.length>5){
                l=listReacters.length+" persons";}
            else{
                l=listReacters.toString();
            }
            let contentAlerts=`<div class="AnnotationTool_alertSection">
                                     <div class="AnnotationTool_alertText">${noHtml(l)} ${translations["txt_manager_postedannoreact"]}:</div>
                                     <p class="AnnotationTool_alertText"><b>${noHtml(extraDictionary[id].title)}</b></p>
                                     <div><a href="#${extraDictionary[id].slideNumber}" >${translations["txt_overview_jumptoslide"]}: ${noHtml(extraDictionary[id].slideNumber)}<a></div>
                                     <br/>
                                 </div>
                                `;
            content+=contentAlerts;
        }
        //content toevoegen
        $(".AnnotationTool_alertBody").append(content);
    }
    else{
        $(".AnnotationTool_alertBody").append(`<p>${translations["txt_manager_nothingnew"]}</p>`);
    }
}
/*new*/function openAlertContainer() {
    alertsThisWeek();
    document.getElementById('AnnotationTool_alertContainer').hidden = false;
    document.getElementById('AnnotationTool_alertBtn').onclick = closeAlertContainer;
}
/*new*/function closeAlertContainer() {
    document.getElementById('AnnotationTool_alertContainer').hidden = true;
    document.getElementById('AnnotationTool_alertBtn').onclick = openAlertContainer;
}
//</editor-fold>

$(document).ready(function(){
    logging("document ready", null, "manager");
    initTranslator(() => {main();}); //Moet voor de initIndex() komen
});

function changeLanguage(element){
    let language = element.innerHTML;
    logging("change language to " + language, null, "manager");
    let overviewHidden = document.getElementById("AnnotationTool_overview").hidden;
    removeSidebar();
    switchLanguage(language.toLowerCase());

    main();                     //Alles opnieuw tekenen

    document.getElementById("AnnotationTool_languageBtn").innerHTML = language;
    changeDropdownExceptFor(language);

    open_sidebar();

    if(! overviewHidden){
        goToOverview();
    }

}

function removeSidebar(){
    logging("remove sidebar", null, "manager");
    let parent = $("body")[0];
    let sidebar = document.getElementById("AnnotationTool_mySidebar");
    parent.removeChild(sidebar);
}


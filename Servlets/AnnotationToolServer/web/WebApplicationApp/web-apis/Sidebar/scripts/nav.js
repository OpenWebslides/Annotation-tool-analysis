import {logging} from "./logging.js";
import {setToDefault,getScaling} from "./data/Drawer.js";
import {getAnnotationsByIdOverview, getSlideNumber,getPresentationId, refreshTable} from "./data/manager.js";
import {localData} from "./data/manager.js";
import {cancelAnnotation, openForm} from "./annotationForm.js";
import {putResults,helpView,orderOverview} from "./annotationOverview.js";

window.open_sidebar = open_sidebar;
window.close_sidebar = close_sidebar;
window.show = show;
window.onDropDown = onDropDown;

const GROOTTE_SIDEBAR = 25;
const MIN_ABSOLUTE_SIZE = 500;

export function GROOTTE_SIDEBAR_ABSOLUUT(invert = false) {
    logging("determine size of sidebar", null, "navigation");
    let absoluut = (GROOTTE_SIDEBAR/100)*$(window).width();
    if(absoluut  < MIN_ABSOLUTE_SIZE){
        absoluut = MIN_ABSOLUTE_SIZE;
    }
    if(invert){
        absoluut = $(window).width() - absoluut;
    }

    if(document.getElementById("AnnotationTool_overview").hidden === false) {
        absoluut = $(window).width();

    }
    return absoluut;
}


export function open_sidebar() { //code voor main opschuiven gaat niet in Shower Framework
    // document.getElementById("main").style.left = "0";
    // document.getElementById("main").style.width = GROOTTE_SIDEBAR_ABSOLUUT(true) + "px";
    // document.getElementById("main").style.display= "inline-block";

    logging("open sidebar", null, "navigation");

    document.getElementById("AnnotationTool_mySidebar").style.right = "0";
    document.getElementById("AnnotationTool_mySidebar").style.width = GROOTTE_SIDEBAR_ABSOLUUT(false) + "px";
    document.getElementById("AnnotationTool_mySidebar").style.display= "inline-block";

    document.getElementById("AnnotationTool_openAnnotationsBtn").style.display = "none";

    document.getElementById("AnnotationTool_alertBtnContainer").hidden = false;

    setToDefault();
    setToDefaultButtons();
}

export function close_sidebar() {
    // document.getElementById("main").style.width = "100%";
    // document.getElementById("main").style.left = "0";

    logging("close sidebar", null, "navigation");
    document.getElementById("AnnotationTool_mySidebar").style.right = "0";
    document.getElementById("AnnotationTool_mySidebar").style.display = "none";

    document.getElementById("AnnotationTool_openAnnotationsBtn").style.display = "block";

    cancelAnnotation();
    setToDefault();
    setToDefaultButtons();
}
export function makeSidebarResizable() {
    logging("make sidebar resizable", null, "navigation");
    $(function () {
        $("#AnnotationTool_mySidebar").resizable({
            handles: 'w',
            minWidth: GROOTTE_SIDEBAR_ABSOLUUT(),
            resize: (event, ui) => {
                $("#AnnotationTool_mySidebar").css("position", "fixed");
                $("#AnnotationTool_mySidebar").css("right", "0px");
                $("#AnnotationTool_mySidebar").css("left", "");
            }
        }).on('resize', (e) => {
            e.stopPropagation();
        });
    });

    $(window).bind('resize', () => {
        document.getElementById("AnnotationTool_mySidebar").style.right = "0";
        //document.getElementById("AnnotationTool_mySidebar").style.width = GROOTTE_SIDEBAR_ABSOLUUT(false) + "px";
        if(window.innerWidth<900){$(".AnnotationTool_searchresult").css("width","44vw");}
        if(window.innerWidth>900){$(".AnnotationTool_searchresult").css("width","22vw");}
    });
}

//toon de juiste container in de sidebar
//de verschillende containers worden weergegeven door het attribuut hidden aan te passen.
export function show(target) {
    logging("show", target, "navigation");
    if(target.id === "AnnotationTool_navDefaultView"){
        cancelAnnotation();
        setToDefaultButtons();
        setToDefault();
        $("#AnnotationTool_filter_tags").empty();
        $("#AnnotationTool_searchEverythingId").val("");
    }
    else if(target.id === "AnnotationTool_navOverview"){
        goToOverview();
    }
    else if(target.id === "AnnotationTool_navAdd"){

        setReadyForForm();

        openForm();
    }
    else if(target.id === "AnnotationTool_navRefresh"){
        refreshTable();
    }
}
export function setToDefaultButtons(){
    logging("set buttons to default", null, "navigation");
    document.getElementById("AnnotationTool_defaultView").hidden = false;
    document.getElementById("AnnotationTool_overview").hidden = true;
    document.getElementById("AnnotationTool_mySidebar").style.right = "0";
    document.getElementById("AnnotationTool_mySidebar").style.width = GROOTTE_SIDEBAR_ABSOLUUT(false) + "px";

    document.getElementById("AnnotationTool_navOverview").hidden = false;
    document.getElementById("AnnotationTool_navDefaultView").hidden = true;

    document.getElementById("AnnotationTool_alertBtnContainer").hidden = false;
    document.getElementById("AnnotationTool_languageBtnContainer").hidden = false;

    if(getSlideNumber()===null){
        document.getElementById("AnnotationTool_navAdd").hidden = true;
    }
    else{
        document.getElementById("AnnotationTool_navAdd").hidden = false;
    }
    document.getElementById("AnnotationTool_navRefresh").hidden = false;
}
export function goToOverview(){
    logging("go to overview", null, "navigation");
    document.getElementById("AnnotationTool_defaultView").hidden = true;
    document.getElementById("AnnotationTool_overview").hidden = false;
    document.getElementById("AnnotationTool_mySidebar").style.right = 0+"%";
    document.getElementById("AnnotationTool_mySidebar").style.width = 100+"%";

    document.getElementById("AnnotationTool_navOverview").hidden = true;
    document.getElementById("AnnotationTool_navDefaultView").hidden = false;
    document.getElementById("AnnotationTool_navAdd").hidden = true;
    document.getElementById("AnnotationTool_navRefresh").hidden = false;
    let annotationList = getAnnotationsByIdOverview(localData.getAnnotations(),getPresentationId());
    annotationList=helpView(annotationList);
    annotationList=orderOverview(annotationList,"slides");
    putResults(annotationList);
    $("#AnnotationTool_filter_tags").empty();
    let tagListOverview = [];
    for(let annotation of annotationList){
        for(let tag of annotation.contentTags){
            if(!tagListOverview.includes(tag)){
                tagListOverview.push(tag);
            }
        }
    }
    for(let tag of tagListOverview) {
        //$("#AnnotationTool_filter_tags").append(`<option value="${tag}">${tag}</option>`);
        $("#AnnotationTool_filter_tags").append(`<option id="AnnotationTool_tagcolor" value="${tag}">Tag</option>`);
    }
    $('#AnnotationTool_order').prop('selectedIndex',0);
    cancelAnnotation();
}

export function setReadyForForm() {
    document.getElementById("AnnotationTool_defaultView").hidden = false;
    document.getElementById("AnnotationTool_overview").hidden = true;

    document.getElementById("AnnotationTool_navOverview").hidden = true;
    document.getElementById("AnnotationTool_navDefaultView").hidden = false;
    document.getElementById("AnnotationTool_navAdd").hidden = true;
    document.getElementById("AnnotationTool_navRefresh").hidden = true;
}

export function onDropDown() {
    document.getElementById("AnnotationTool_languageDropdown").classList.toggle("show");
}

window.onclick = (event) => {
    if(!event.target.matches('#AnnotationTool_languageBtn')) {
        closeDropDown();
    }
}
function closeDropDown() {
    let dropdown = document.getElementById("AnnotationTool_languageDropdown");
    if(dropdown.classList.contains('show')){
        dropdown.classList.remove('show');
    }
}

import {translations,languages,switchLanguage} from "../internationalisation/translator.js";
import {open_sidebar} from "../nav.js"
import {logging} from "../logging.js";


function drawSidebar() {
    logging("draw sidebar", null, "sidebar");
    return `
<div class="w3-sidebar w3-bar-block w3-card ui-widget-content"  id="AnnotationTool_mySidebar">
  <!--Navigatie-knoppen-->
  <div id="AnnotationTool_navDiv">
    <table class="AnnotationTool_table_for_title"><tr><td class="AnnotationTool_w-sm">
      <button class="AnnotationTool_navBtn AnnotationTool_hasTooltip" id="AnnotationTool_navOverview" onclick="show(this)">
        <i class="material-icons">dashboard</i>
        <div class="AnnotationTool_tooltiptext">
          ${translations["ttp_nav_overview"]}
        </div>
      </button>
      <button class="AnnotationTool_navBtn AnnotationTool_hasTooltip" id="AnnotationTool_navDefaultView" onclick="show(this)" hidden>
        <i class="material-icons">keyboard_arrow_right</i>
        <div class="AnnotationTool_tooltiptext">
          ${translations["ttp_nav_previous"]}
        </div>
      </button>
    </td><td class="AnnotationTool_w-sm">
      <button class="AnnotationTool_navBtn AnnotationTool_hasTooltip" id="AnnotationTool_navAdd" onclick="show(this)">
        <i class="material-icons">add</i>
        <div class="AnnotationTool_tooltiptext">
          ${translations["ttp_nav_add"]}
        </div>
      </button>
    </td><td class="AnnotationTool_w-sm">
      <button class="AnnotationTool_navBtn AnnotationTool_hasTooltip" id="AnnotationTool_navRefresh" onclick="show(this)">
        <i class="material-icons">cached</i>
        <div class="AnnotationTool_tooltiptext">
          ${translations["ttp_nav_refresh"]}
        </div>
      </button>
    </td><td class="AnnotationTool_w-sm">
      <button class="AnnotationTool_navBtn AnnotationTool_hasTooltip" id="AnnotationTool_closeAnnotationsBtn" onclick="close_sidebar()">
        <i class="material-icons">clear</i>
        <div class="AnnotationTool_tooltiptext" style="right: 10px">
          ${translations["ttp_nav_close"]}
        </div>
      </button>
    </td></tr></table>
  </div>

  <!--history container-->
  <div id="AnnotationTool_historyBtnContainer" >
    <div id="AnnotationTool_historyContainer" onclick="closeHistoryContainer()" hidden>
      <div id="AnnotationTool_historyTitle">
        ${translations["ttp_annotation_history"]}
      </div>
      <div class="AnnotationTool_historyBody"></div>
      <div id="AnnotationTool_historyFooter">
        ${translations["text_nav_boxClose"]}
      </div>
    </div>
  </div>

  <!--alert container-->
      <div id="AnnotationTool_alertBtnContainer" >
        <div class="AnnotationTool_hasTooltip">
          <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long AnnotationTool_tooltiptext-below AnnotationTool_tooltiptext-bleft" >
            ${translations["ttp_nav_alert"]}
          </div>
          <i class="material-icons" id="AnnotationTool_alertBtn" onclick="openAlertContainer()">add_alert</i>
        </div>
        <div id="AnnotationTool_alertContainer" onclick="closeAlertContainer()" hidden>
          <div id="AnnotationTool_alertTitle">
            ${translations["ttp_nav_alert"]}
          </div>
          <div class="AnnotationTool_alertBody"></div>
          <div id="AnnotationTool_alertFooter">
            ${translations["text_nav_boxClose"]}
          </div>
        </div>
      </div>
      
  <!--loading animation-->
  <div id="AnnotationTool_loadingAnimContainer" class="AnnotationTool_animationHidden">
    <i class="material-icons AnnotationTool_loadingAnim" id="AnnotationTool_loadingIcon">refresh</i>
    <p class="AnnotationTool_loadingText">loading ...</p>
  </div>
      
  <!--languageButton container-->
      <div id="AnnotationTool_languageBtnContainer" >
        <button id="AnnotationTool_languageBtn" onclick="onDropDown()">
        </button>
        <div id="AnnotationTool_languageDropdown">
        </div>
      </div>

  <!-- begin code voor weergeven annotaties-->

  <div id="AnnotationTool_defaultView" hidden>
    <div id="AnnotationTool_formHere">
      <!--Hier komt de form-->
    </div>
    <div class="AnnotationTool_annotationContainer" id="AnnotationTool_annotationView">
      <!--Hier komen de annotaties per slide-->
    </div>
  </div>

  <!--einde code annotaties-->

  <!-- begin code overview-->
  <div id="AnnotationTool_overview" hidden>
        <div id="AnnotationTool_inputsOverview">
        <!--Orderdropdown - favorites - zoekbalk-->

            <!--Orderdropdown-->
            <div id="AnnotationTool_inputsoverviewdivA" class="AnnotationTool_hasTooltip">
                <select id="AnnotationTool_order" onchange="viewAnnotation()">
                    <option value="slides">SLIDES</option>
                    <option value="votes">TOP</option>
                    <option value="dates">NEW</option>
                    <option value="reactions">HOT</option>
                </select>
                <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long">
                    ${translations["ttp_overview_order"]}
                </div>
            </div>

            <!--Favorites-->
            <div id="AnnotationTool_inputsoverviewdivB" class="AnnotationTool_hasTooltip">
              <i class="material-icons AnnotationTool_favoriteOverview" id="AnnotationTool_favoriteOverviewPosition" onclick="favoriteOverview()" >star</i>
              <div class="AnnotationTool_tooltiptext">
                ${translations["ttp_overview_favorite"]}
              </div>
            </div>

            <!--Zoekbalk-->
            <div id="AnnotationTool_inputsoverviewdivC">
                <div class="AnnotationTool_hasTooltip" id="AnnotationTool_inputSearchDiv">
                    <input list="AnnotationTool_inputSearch" type="text" placeholder="${translations["txt_overview_searchplaceholder"]}" id="AnnotationTool_searchEverythingId" onkeypress="viewAnnotationEnter(event)" oninput="viewAnnotation()">
                    <datalist id="AnnotationTool_inputSearch">
                      <select>
                        <optgroup label="category">
                          <option value="question">Category</option>
                          <option value="remark">Category</option>
                          <option value="extra">Category</option>
                        </optgroup>
                        <optgroup label="tags" id="AnnotationTool_filter_tags">
                        </optgroup>
                      </select>
                    </datalist>
                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long">
                      ${translations["ttp_overview_search"]}
                    </div>
                </div>
                <!--Checkbox om ook op reacties te zoeken-->
                <div class="AnnotationTool_hasTooltip" id="AnnotationTool_inputSearchIncludeReactionsSwitchDiv"> 
                    <input type="checkbox" id="AnnotationTool_inputSearchIncludeReactions" checked>
                    <div id="AnnotationTool_inputSearchIncludeReactionsLabels">
                        <label for="AnnotationTool_inputSearchIncludeReactions" class="AnnotationTool_inputSearchIncludeReactionsLabel" id="AnnotationTool_inputSearchIncludeReactionsSwitchTrue">${translations["txt_overview_reactions_on"]}</label>
                        <label for="AnnotationTool_inputSearchIncludeReactions" class="AnnotationTool_inputSearchIncludeReactionsLabel" id="AnnotationTool_inputSearchIncludeReactionsSwitchFalse">${translations["txt_overview_reactions_off"]}</label>
                    </div>
                    <div class="AnnotationTool_tooltiptext AnnotationTool_tooltiptext-long">
                      ${translations["ttp_overview_includereactions"]}
                    </div>
                </div> 
                
            </div>
        </div>

        <!--veld waarin alle zoekresultaten worden getoond -->
        <div id="AnnotationTool_searchResults">

        </div>
  </div>
  <!-- einde code overview-->



</div>
    `;
}

function drawOpenSidebarButton() {
    logging("draw open sidebarbutton", null, "sidebar");
    return `
    <div class="AnnotationTool_above">
        <button onclick="open_sidebar()" id="AnnotationTool_openAnnotationsBtn">
            <i class="material-icons">message</i>
        </button>
    </div>
`
}


export function initIndex() {
    logging("initialise index", null, "sidebar");
    $("body").prepend(drawOpenSidebarButton()).prepend(drawSidebar());


    if(languages.length > 1 ){
        let initialLanguage=languages[1];
        document.getElementById("AnnotationTool_languageBtn").innerHTML = uppercaseFirstLetter(initialLanguage);
    }


    for(let i=2; i<languages.length;i++) {
        let language = languages[i];
        let option = makeOption(language);
        document.getElementById("AnnotationTool_languageDropdown").appendChild(option);
    }
}

export function uppercaseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}


export function changeDropdownExceptFor(language){
    clearDropdown();
    for(let i = 1; i < languages.length; i++) {
        if(languages[i].toLowerCase() !== language.toLowerCase()) {
            let newLanguage = languages[i];
            let option = makeOption(newLanguage);
            document.getElementById("AnnotationTool_languageDropdown").appendChild(option);
        }
    }

}

export function clearDropdown(){
    let dropdown = document.getElementById("AnnotationTool_languageDropdown");
    let clone = dropdown.cloneNode(false);
    dropdown.parentNode.replaceChild(clone,dropdown);
}

export function makeOption(language){
    let option = document.createElement("a");
    option.setAttribute("href","#");
    option.setAttribute("onClick","changeLanguage(this)");
    option.innerHTML = uppercaseFirstLetter(language);
    return option;
}
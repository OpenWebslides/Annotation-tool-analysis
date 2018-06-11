import {logging} from "../logging.js";

let LANGUAGE_NUMBER;
export let languages = [];
let languageDictionaries = [];
export let translations = {};


export function initTranslator(callback) {
    $.ajax({
        type: "GET",
        url: "Sidebar/scripts/internationalisation/translations.txt",
        dataType: "text",
        success: function(data) {
            procesData(data);
        }
    }).then(callback);

}

function procesData(allText) {
    let allTextLines = allText.split(/\r\n|\n/);
    languages = allTextLines[0].split(';');
    for(let i = 0; i < languages.length; i++) {
        languageDictionaries[i] = {};
    }

    for (let line of allTextLines) {
        if(line.includes("##") || line === "") continue;
        let data = line.split(';');
        if (data.length === languages.length) {
            //Sla voor elke lijn data alle vertalingen op in de bijhorende dictionaries
            let key = data[0];
            if(key !== "")
            for(let col = 0; col < languages.length; col++) {
                languageDictionaries[col][key] = data[col];
            }
        }
    }
    switchLanguage("nederlands");
    logging("translations initialised", translations, "translator");
}

export function switchLanguage(language) {
    logging("switch to language " + language, null, "translator");
    LANGUAGE_NUMBER = languages.indexOf(language);
    if(LANGUAGE_NUMBER < 0) LANGUAGE_NUMBER = 0;
    translations = languageDictionaries[LANGUAGE_NUMBER];
}

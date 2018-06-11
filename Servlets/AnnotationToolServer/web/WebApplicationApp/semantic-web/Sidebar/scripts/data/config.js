export let serverSettings = {
    "serverAddress": "http://webslides-01.project.tiwi.be"
    ,"restPath" : "/webresources/api"
};

//Als de server lokaal in de Docker-container draait,
//gebruik je als serverAddress "http://webslides-01.project.tiwi.be".
//
//Wanneer de webapplicatie online op de server geplaatst wordt, moet deze variabele
//aangepast worden, waarschijnlijk naar
//"http://webslides-01.project.tiwi.be"
//https://api.myjson.com/bins/94d2e NIET VERWIJDEREN

//Het REST-pad waarnaartoe geluisterd wordt: /webresources/api
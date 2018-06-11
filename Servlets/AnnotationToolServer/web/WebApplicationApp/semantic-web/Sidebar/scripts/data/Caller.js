import {Annotation} from "./Component.js";
import {Reaction} from "./Component.js";
import {logging} from "../logging.js";
import {serverSettings} from "./config.js";
//deze klasse voert alle ajax calls uit

export class Caller{
    constructor(localData, before, after){
        this.localData = localData;
        this.before = before;
        this.after = after;

        this.serverAddress = serverSettings.serverAddress;
        this.restUrl = serverSettings.restPath;
        this.url = this.serverAddress + this.restUrl;
    }

    // afhalen van server
    loadAnnotationsFromServer(callback, fail){
        this.before();
        $.getJSON(this.url, (result) => {
            this.localData.clearData();
            for(let i = 0; i < result.length; i++){
                let o = result[i];
                let ann = Object.assign(new Annotation(), o);
                ann.reactions = [];
                for(let j = 0; j < o.reactions.length; j++){
                     let reaction = new Reaction(ann, o.reactions[j].person, o.reactions[j].text);
                     reaction.rating = o.reactions[j].rating;
                     reaction.date = o.reactions[j].date;
                     reaction.status = o.reactions[j].status;
                }
                this.localData.addAnnotation(ann);
            }
        }).fail(fail).then(() => logging("load annotations from server", null, "caller")).then(callback).always(this.after);
    }

    //versturen naar server
    sendAnnotationToServer(annotation, callback, fail){
        this.before();
        $.ajax({
            url: this.url,
            method: "POST",
            data: JSON.stringify(annotation),
            dataType: "application/json",
            contentType: "application/json"
        }).fail(fail).then(() => logging("send annotation to server", annotation, "caller")).then(callback).always(this.after);
    }

    sendReaction(annotation, callback, fail){
        this.before();
        $.ajax({
            url: this.url,
            method: "POST",
            data: JSON.stringify(annotation),
            dataType: "application/json",
            contentType: "application/json"
        }).fail(fail).then(() => logging("send reaction to server", annotation, "caller")).then(callback).always(this.after);
    }
	
    deleteAnnotation(annotation, callback,fail){
        this.sendAnnotationToServer(annotation, callback, fail);
    }

    deleteReaction(annotation, callback, fail){
        /*new*/this.sendReaction(annotation, callback, fail);
    }

    sendVote(annotation, callback, fail){
        this.before();
        $.ajax({
            url: this.url,
            method: "POST",
            data: JSON.stringify(annotation),
            dataType: "application/json",
            contentType: "application/json"
        }).fail(fail).then(() => logging("send vote to server", annotation, "caller")).then(callback).always(this.after);
    }

}



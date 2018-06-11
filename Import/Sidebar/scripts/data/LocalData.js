//klasse voor opslag lokale annotaties
import {logging} from "../logging.js";

export class LocalData{
    constructor(){
        this.annotationList = [];
        this.getAnnotations = this.getAnnotations.bind(this);
        this.addAnnotation = this.addAnnotation.bind(this);
        this.clearData = this.clearData.bind(this);
        this.findAnnotationByHtmlId = this.findAnnotationByHtmlId.bind(this);
        this.findReactionByHtmlId = this.findReactionByHtmlId.bind(this);
    }

    //lokale lijst teruggeven
    getAnnotations(){
        return this.annotationList;
    }

    //annotatie toevoegen aan lokale data
    addAnnotation(annotation){
        this.annotationList.push(annotation);
        logging("add annotation", annotation, "localdata");
    }

    //lijst van annotaties legen
    clearData(){
        this.annotationList = [];
        logging("clear data", null, "localdata");
    }

    findAnnotationByHtmlId(id){
        logging("find annotation by HTML ID " + id, null, "localdata");
        for(let item of this.annotationList){
            if(item.id === id){
                return item;
            }
        }
        return null;
    }

    findReactionByHtmlId(annotationId,reactionId){
        logging("find reaction by HTML ID " + reactionId, null, "localdata");
        let annotation = this.findAnnotationByHtmlId(annotationId);
        if(annotation!==null) {
             return annotation.reactions[reactionId];
        }
        return null;
    }

}
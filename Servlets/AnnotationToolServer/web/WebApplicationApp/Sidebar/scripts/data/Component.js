import {logging} from "../logging.js";

export class Voter{

    //<editor-fold defaultstate="collapsed" desc="voting">
    //returns 0 if user already upvoted, 1 if user added upvote
    static upvote(o,user){
        logging("upvote was clicked by " + user, null, "component");
        if(o.rating.thumbsUp.indexOf(user)===-1){
            //niet in lijst van upvotes dus toevoegen
            o.rating.thumbsUp.push(user);
            return 1;
        }
        else{
            return 0;
        }
    }
    static downvote(o,user){
        logging("downvote was clicked by " + user, null, "component");
        if(o.rating.thumbsDown.indexOf(user)===-1){
            //niet in lijst van upvotes dus toevoegen
            o.rating.thumbsDown.push(user);
            return 1;
        }
        else{
            return 0;
        }
    }
    static removeVote(o,user){
        if(o.rating.thumbsDown.indexOf(user)!==-1){
            //wel in lijst van downvotes dus verwijderen
            o.rating.thumbsDown.splice(o.rating.thumbsDown.indexOf(user),1);
        }
        if(o.rating.thumbsUp.indexOf(user)!==-1){
            //wel in lijst van upvotes dus verwijderen
            o.rating.thumbsUp.splice(o.rating.thumbsUp.indexOf(user),1);
        }
    }
    static hasUpvoted(o, user){
        if(o.rating.thumbsUp.indexOf(user)!==-1){
            return true;
        }else{
            return false;
        }
    }
    static hasDownvoted(o, user){
        if(o.rating.thumbsDown.indexOf(user)!==-1){
            return true;
        }else{
            return false;
        }
    }
    //</editor-fold>
}

export class Annotation{

    //<editor-fold defaultstate="collapsed" desc="annotation constructor">
    constructor(id, presentationId,slideNumber,element,op,title,commentary,markType,category,contentTags,view){
        this.id = id;
        this.presentationId=presentationId;
        this.slideNumber=slideNumber;
        this.element=element;               //DOM-element in webslide aangeduid door gebruiker
        this.op=op;                         //(original poster) dus gebruikersnaam
        this.title=title;
        /*new*/this.content={commentary:commentary,markType:markType,category:category};//onderlijning,fluo,omkadering
        this.contentTags=contentTags;
        this.view=view;                     //public/private
        this.cherrypicking=[];
        this.rating={thumbsUp:[],thumbsDown:[]};
        //length-property gebruiken om aantal personen te weten(niet size()!)
        this.date=new Date();
        this.reactions=[];                  //elk reactie-element bevat persoon,datum en rating
        /*new*/this.status="used";
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="voting">
    upvote(user){return Voter.upvote(this,user);}
    downvote(user){return Voter.downvote(this,user);}
    removeVote(user){Voter.removeVote(this,user);}
    hasUpvoted(user){return Voter.hasUpvoted(this, user);}
    hasDownvoted(user){return Voter.hasDownvoted(this, user);}
    //</editor-fold>

    //geeft 0 als nog niet voorkwam en is toegevoegd, geeft 1 als al voorkwam en is verwijderd.
    cherrypick(user){
        logging("favorite was clicked by " + user, null, "component");
        if(this.cherrypicking.indexOf(user)<0){
            this.cherrypicking.push(user);
            return 0;
        }
        else{
            this.cherrypicking.splice(this.cherrypicking.indexOf(user),1);
            return 1;
        }
    }

    deleteReaction(reaction){
        logging("reaction was deleted", reaction, "component");
        this.reactions.splice(this.reactions.indexOf(reaction),1);
    }

}

export class Reaction{
    //<editor-fold defaultstate="collapsed" desc="reaction constructor">
    constructor(annotation,person,text){
        this.person=person;
        this.date=new Date();
        this.rating={thumbsUp:[],thumbsDown:[]};
        /*new*/this.text=text;
        /*new*/this.status="used";
        annotation.reactions.push(this);
    }

    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="voting">
    upvote(user){return Voter.upvote(this,user);}
    downvote(user){return Voter.downvote(this,user);}
    removeVote(user){Voter.removeVote(this,user);}
    hasUpvoted(user){return Voter.hasUpvoted(this, user);}
    hasDownvoted(user){return Voter.hasDownvoted(this, user);}
    //</editor-fold>


}
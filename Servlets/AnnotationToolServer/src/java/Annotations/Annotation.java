package Annotations;

import java.util.ArrayList;
import org.bson.types.ObjectId;

/**
 *
 * @author Kurt D'haene && Bavo Deprez
 */
public class Annotation {
    
    public String id;
    public ObjectId _id;   
    public String presentationId;
    public String slideNumber;
    public String element;
    public String op;
    public String title;
    public Content content;
    public String[] contentTags;
    public String view;
    public ArrayList<String> cherrypicking;
    public Rating rating;
    public String date;
    public ArrayList<Reaction> reactions;
    public String status;
    
    
    public Annotation(){
        cherrypicking = new ArrayList<>();
        rating = new Rating();
        content = new Content();
        reactions = new ArrayList<>();
    }
    
    public void newContent(ArrayList<String> com, String ty, String cat) {
        content = new Content(com,ty,cat);
    }
    
    
    public class Content{
        public ArrayList<String> commentary;
        public String markType;
        public String category;
        
        public Content(ArrayList<String> com, String ty, String cat){
            this.category = cat;
            this.commentary = com;
            this.markType = ty;
        }

        private Content() {
        }
        
        private void print() {
            System.err.println("Commentary:"+commentary);
            System.err.println("markType: "+markType);
            System.err.println("Category: "+category);
        }
        
    }
    
    
    
    public void set_id(String hex_id) {
        _id = new ObjectId(hex_id);
        id = _id.toHexString();
    }
    
    public void set_id() {
        _id = ObjectId.get();
        id = _id.toHexString();
    }
    
    public void print() {
        System.err.println("\n_id :"+_id+"\n");
        System.err.println("\nid: "+id+"\n");
        System.err.println("\npresentationId : "+presentationId);
        System.err.println("\nslideNumber : "+slideNumber);
        System.err.println("\nelement : "+element);
        System.err.println("\nop : "+op);
        System.err.println("\ttitle : "+title);
        content.print();
        for(String tag : contentTags) {
            System.err.println("\t tag : "+tag+"\n");
        }
        System.err.println("\nview : "+view+"\n");
        for (String pers : cherrypicking) {
            System.err.println("\t cherryPickedBy : "+pers+"\n");
        }
        rating.print();
        System.err.println("\ndate : "+date+"\n");
        System.err.println("\nReactions \n");
        for (Reaction r : reactions) {
            r.print();
        }
    }
    
    public static ObjectId makeId(String id) {
        return new ObjectId(id);
    }
    
    public class Reaction{
        public String person;
        public String date;
        public Rating rating;
        public ArrayList<String> text;
        public String status;

        public Reaction(String poster, String date, Rating rating, ArrayList<String> text, String status) {
            this.person = poster;
            this.date = date;
            this.rating = rating;
            this.text = text;
            this.status = status;
        }
        
        public Reaction() {
            
        }
        
        public void print() {
            System.err.println("\n\t person : "+person+"\n");
            System.err.println("\n\t date : "+date+"\n");
            System.err.println("\n\t rating\n");
            rating.print();
            System.err.println("\n text : "+text+"\n");
        }
        
    }
    
    public void addReaction(String poster, String date, Rating rating, ArrayList<String> text, String status) {
            Reaction reaction = new Reaction(poster,date,rating,text,status);
            reactions.add(reaction);
    }
    
    public boolean isValid(Annotation an) {
        return !(an.presentationId == null || an.slideNumber == null || an.op == null);
    }
    
    public static boolean areEqual(Annotation item, Annotation an) {
        boolean res = item.presentationId == an.presentationId
                && item.op.equals(an.op)
                && item.date.equals(an.date)
                && item.element.equals(an.element)
                && item.id.equals(an.id);
        return res;
    }
}

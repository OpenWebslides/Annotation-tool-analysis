/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package jsongenerator;

import Annotations.Annotation;
import Annotations.Annotation.Reaction;
import Annotations.Rating;
import com.google.gson.Gson;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.bson.types.ObjectId;

/**
 *
 * @author Kurt D'haene
 */
public class JsonGenerator {

    private static final String[] names = {"Kurt", "Simeon", "Phaedra", "Bavo", "Toon", "Piet", "Jan", "Mieke", "Jos", "Arne", "Brecht", "Jasper", "Eva", "Elizabeth", "professor"};
    private static final String[] COMMENTARY = {"\"Afprinten\" moet afdrukken of uitprinten zijn.","Hier moet opgeteld worden","Wow, dat is wel goed gezegd","Zo onduidelijk..","Ik stuur de prof hier wel een mail over"};
    private static final String[] TAGS = {"important", "solved","info", "example"};
    private static final String[] CATEGORY = {"remark","question","extra"};
    private static final String[] TITLES = {"Belangrijke vraag over data","Wat is dit?","Uitbreiding over de leerstof","Webslides en webpages ..."};
    private static final String[] STATUS = {"used","changed","deleted"};
    private static final String[] VIEW = {"private","public"};
    private static final String[] PRESENTATIONS = {"Introduction","A Bird's-Eye View of the Web","Web Architecture & Technologies","Web APIs"};
    
    private static final String[] INTRODUCTION_SLIDENAMES = {"title","index","ruben","teaching","opinion","webslides","participate"};
    private static final String[] BIRDS_EYE_VIEW_SLIDENAMES = {"title","who-is-wh","tim-vint","forgotten-heroes","index","origins","ted-picture","ted-video","ted","hypertext","xanadu","doug-picture","doug","mother-of-all-demos","tim-picture","raw-data-now","for-everyone","internet","growth","evolution","business","centralization","forgotten-heroes-end","future"};
    private static final String[] ARCHITECTURE_SLIDENAMES = {"title","url-syntax","url-instructions","url-instructions-example","http-request","http-methods","idempotent-methods","response"};
    private static final String[] WEB_APIS_SLIDENAMES = {"title","90s","doors","rest","constraints","stateless","statelessness-benefits","uniform-interface","conceptual-resource","representations","self-descriptive-messages","hateoas-consequences","web","schaapstal","web-client-server","hypertext-definition","sustainability","resources-do-dont","self-descriptive-do-dont"};
    private static final String[][] SLIDENAMES = {INTRODUCTION_SLIDENAMES,BIRDS_EYE_VIEW_SLIDENAMES,ARCHITECTURE_SLIDENAMES,WEB_APIS_SLIDENAMES};
    static int presentation = 0;
    static int tellerId = 1;
    static LocalDate date;
    static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MM yyyy");

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        // TODO code application logic here
        String s = geefJson(7);
        printJson(s);
        maakJsonFile(s);
    }

    public static Annotation[] giveAnnotation(int n) {
        Annotation[] a = new Annotation[n];
        for (int i = 0; i < n; i++) {
            a[i] = new Annotation();
            Random r = new Random();
            a[i]._id = new ObjectId();
            a[i].id = a[i]._id.toHexString();
            presentation = (presentation + 1)%PRESENTATIONS.length;
            a[i].presentationId = PRESENTATIONS[presentation];
            int index = r.nextInt(SLIDENAMES[presentation].length);
            a[i].slideNumber = SLIDENAMES[presentation][index];
            a[i].element = "div";
            a[i].op = giveName();
            a[i].title = TITLES[r.nextInt(TITLES.length)];
            a[i].content.category = CATEGORY[r.nextInt(CATEGORY.length)];
            a[i].status = STATUS[r.nextInt(STATUS.length)];
            a[i].content.commentary = new ArrayList();
            a[i].content.commentary.add(COMMENTARY[r.nextInt(COMMENTARY.length)]);
            if(!a[i].status.equals(STATUS[0])){
                for(int t = 0; t<(r.nextInt(4)+1); t++){
                    a[i].content.commentary.add(COMMENTARY[r.nextInt(COMMENTARY.length)]);
                }
            }
            a[i].content.markType = "DUMMY";
            fillRating(a[i]);
            makeListWithReacties(COMMENTARY.length/3, a[i]);
            String tag = TAGS[r.nextInt(TAGS.length)];
            String[] contentTags = {tag};
            a[i].contentTags = contentTags;
            a[i].date = "23/04/2018";
            a[i].cherrypicking = maakListMetNamen(names.length / 8);
            int kans = r.nextInt(10);
            if(kans == 1) {
                a[i].view = VIEW[0];
            }
            else{
                a[i].view = VIEW[1];
            }
        }
        return a;
    }

    public static Annotation giveAnnotation() {
        return giveAnnotation(1)[0];
    }

    public static String geefJson(int aantal) {
        Gson gson = new Gson();

        String json = gson.toJson(giveAnnotation(aantal));
        return json;
    }

    public static void printJson(String json) {
        System.out.println(json);
    }

    public static void maakJsonFile(String json) {
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter("gen.json"));
            writer.write(json);
            writer.close();
        } catch (IOException ex) {
            Logger.getLogger(JsonGenerator.class.getName()).log(Level.SEVERE, null, ex);
            System.out.println("\n fout");
        }
    }

    //Maakt een arraylist met n namen aan
    private static ArrayList<String> maakListMetNamen(int n) {
        Random r = new Random();
        ArrayList<String> res = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String name = names[r.nextInt(names.length)];
            while (n <= names.length && res.contains(name)) {
                name = names[r.nextInt(names.length)];
            }
            res.add(name);
        }
        return res;
    }

    //Maakt een arraylist met n namen aan, waarbij geen namen toegevoegd worden die al
    //in de meegegeven lijst staan
    private static ArrayList<String> maakListMetNamen(int n, ArrayList<String> alreadyTaken) {
        Random r = new Random();
        ArrayList<String> res = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String name = names[r.nextInt(names.length)];
            while (n <= names.length && (res.contains(name) || alreadyTaken.contains(name))) {
                name = names[r.nextInt(names.length)];
            }
            res.add(name);
        }
        return res;
    }
    
    private static ArrayList<Annotation.Reaction> makeListWithReacties(int n, Annotation an) {
        Random r = new Random();
        ArrayList<Annotation.Reaction> res = new ArrayList<>(n);
        for(int i = 0; i < n ; i++) {
            String poster = names[r.nextInt(names.length)];
            date = LocalDate.now();
            String datum = date.format(formatter);
            String status = STATUS[r.nextInt(STATUS.length)];
            ArrayList<String> text =  new ArrayList();
            text.add(COMMENTARY[r.nextInt(COMMENTARY.length)]);
            if(!status.equals(STATUS[0])){
                for(int t = 0; t<r.nextInt(5); t++){
                    text.add(COMMENTARY[r.nextInt(COMMENTARY.length)]);
                }
            }
            Rating rating = new Rating();
            ArrayList<String> duplicate = new ArrayList<>();
            duplicate.add(poster);
            rating.thumbsUp = maakListMetNamen(names.length / 4, duplicate);
            duplicate.addAll(rating.thumbsUp);
            rating.thumbsDown = maakListMetNamen(names.length / 8, duplicate);
            an.addReaction(poster, datum, rating, text, status);
        }
        return res;
    }
    
    private static void fillRating(Annotation an) {
        ArrayList<String> duplicate = new ArrayList<>();
        duplicate.add(an.op);
        an.rating.thumbsUp = maakListMetNamen(names.length / 4, duplicate);
        duplicate.addAll(an.rating.thumbsUp);
        an.rating.thumbsDown = maakListMetNamen(names.length / 8, duplicate);
    }
    
    private static String giveName() {
        Random r = new Random();
        return names[r.nextInt(names.length)];
    }

}

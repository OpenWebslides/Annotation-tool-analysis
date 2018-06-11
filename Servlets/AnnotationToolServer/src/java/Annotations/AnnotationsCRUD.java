package Annotations;

import AnnotationsExceptions.InvalidAnnotationException;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import static com.mongodb.client.model.Filters.eq;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.bson.Document;

/**
 *
 * @author Bavo Deprez
 *
 * Deze klasse haalt de annotaties op uit en voegt nieuwe toe aan de databank.
 *
 */
public class AnnotationsCRUD {

    /**
     * Onderstaande variabele duidt de omgeving waarin gedraaid wordt. Momenteel
     * zijn dit twee mogelijkheden:
     *
     * -"dev" : ontwikkelingsomgeving. Dan zal deze klasse verbinding proberen
     * te maken met een lokale MongoDB
     *
     * -"prod" : productieomgeving. Deze klasse verbindt met de MongoDB in de
     * Dockercontainer, vanuit zijn eigen Dockercontainer
     */
    private static final String OMGEVING = "prod";

    private static AnnotationsCRUD instance;
    private static IAnnotationsAdapter adapter;
    private static MongoClient client;

    private static String connString;
    private static String dbNaam;
    private static String collNaam;

    private AnnotationsCRUD() {
        try {
            adapter = new AnnotationsAdapter();
            ClassLoader f = Thread.currentThread().getContextClassLoader();
            InputStream input = f.getResourceAsStream("Annotations/resources/" + OMGEVING + ".properties");
            Properties properties = new Properties();
            properties.load(input);
            connString = properties.getProperty("connString");
            dbNaam = properties.getProperty("dbNaam");
            collNaam = properties.getProperty("collNaam");
        } catch (IOException ex) {
            Logger.getLogger(AnnotationsCRUD.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public static AnnotationsCRUD getInstance() {
        if (instance == null) {
            instance = new AnnotationsCRUD();
        }
        return instance;
    }

    public List<Annotation> getItems() {
        ArrayList<Annotation> res;
        try {
            MongoCollection<Document> collection = getCollection();
            FindIterable<Document> docs = collection.find();
            res = new ArrayList<>();
            for (Document doc : docs) {
                Annotation an = adapter.toAnnotation(doc);
                an.id = an._id.toHexString();
                res.add(an);
            }
        } finally {
            client.close();
        }
        return res;
    }

    public String getJson() {
        List<Annotation> res = getItems();
        return adapter.toJSON(res);
    }

    //Deze methode is veilig om te gebruiken met de JsonGenerator-gegenereerde annotaties
    public void putItem(Annotation content) {
        try {
            MongoCollection<Document> coll = getCollection();
            if (content.id == null || content.content.markType.equals("DUMMY")) {
                Document doc = adapter.toDocument(content);
                coll.insertOne(doc);
            } else {
                content.set_id(content.id);
                Document doc = adapter.toDocument(content);
                coll.findOneAndUpdate(eq("_id", content._id), doc);
            }
        } finally {
            client.close();
        }
    }

    public void putJson(String json) {
        try {
            MongoCollection<Document> coll = getCollection();
            Annotation an = adapter.toAnnotation(json);
                if (an.id == null) {
                    an.set_id();
                    Document doc = adapter.toDocument(an);
                    coll.insertOne(doc);
                } else {
                    an.set_id(an.id);
                    Document doc = adapter.toDocument(an);
                    UpdateResult d = coll.replaceOne(eq("id", an.id), doc);
                }
        } catch (InvalidAnnotationException ex) {
            Logger.getLogger(AnnotationsCRUD.class.getName()).log(Level.SEVERE, null, ex);
        } finally {
            client.close();
        }
    }

    public boolean flushDb() {
        try {
            MongoCollection<Document> coll = getCollection();
            coll.drop();
            return true;
        } catch (Exception e) {
            return false;
        } finally {
            client.close();
        }
    }

    public boolean deleteAnnotation(String json) {
        try {
            MongoCollection<Document> coll = getCollection();
            Annotation an = adapter.toAnnotation(json);
            Document doc = adapter.toDocument(an);
            if (an.id == null) {
                return false;
            } else {
                an.set_id(an.id);
                coll.findOneAndDelete(eq("_id", an._id));
                return true;
            }
        } catch (InvalidAnnotationException ex) {
            Logger.getLogger(AnnotationsCRUD.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        } finally {
            client.close();
        }
    }

    public boolean deleteAnnotationById(String id) {
        try {
            MongoCollection<Document> coll = getCollection();
            if (id == null) {
                return false;
            } else {
                DeleteResult dr = coll.deleteOne(eq("id", id));
                return true;
            }
        } catch (Exception e) {
            System.err.println("\nException at deleteAnnotationById\n");
            e.printStackTrace();
            return false;
        } finally {
            client.close();
        }
    }

    private MongoCollection<Document> getCollection() {
        client = new MongoClient(new MongoClientURI(connString));
        MongoDatabase db = client.getDatabase(dbNaam);
        MongoCollection<Document> collection = db.getCollection(collNaam);
        return collection;
    }

}

package Annotations;

import AnnotationsExceptions.InvalidAnnotationException;
import com.google.gson.Gson;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.bson.Document;

/**
 *
 * @author Bavo Deprez
 */
public class AnnotationsAdapter implements IAnnotationsAdapter {
    
    private final Gson gson = new Gson();
    
    public AnnotationsAdapter() {
    }

    @Override
    public String toJSON(Annotation an) {
        return gson.toJson(an);
    }

    @Override
    public String toJSON(List<Annotation> ans) {
        return gson.toJson(ans);
    }
    
    @Override
    public Annotation toAnnotation(String json) throws InvalidAnnotationException {
        Annotation an =  gson.fromJson(json, Annotation.class);
        if(an.isValid(an)) {
            return an;
        }
        else throw new InvalidAnnotationException();
    }

    @Override
    public Annotation toAnnotation(Document d) {
        String json = d.toJson();
        return gson.fromJson(json, Annotation.class);
    }

    @Override
    public Document toDocument(Annotation an) {
        Document doc = Document.parse(gson.toJson(an));
        return doc;
    }

    @Override
    public Document toDocument(String json) throws InvalidAnnotationException{
        Annotation an = toAnnotation(json);
        return Document.parse(json);
    }
    
}

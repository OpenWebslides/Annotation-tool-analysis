package Annotations;

import AnnotationsExceptions.InvalidAnnotationException;
import java.util.List;
import org.bson.Document;

/**
 *
 * @author Bavo Deprez
 */
public interface IAnnotationsAdapter {
    public Annotation toAnnotation(Document d);
    public Annotation toAnnotation(String json) throws InvalidAnnotationException;
    public Document toDocument(Annotation an);
    public Document toDocument(String json) throws InvalidAnnotationException;
    public String toJSON(Annotation an);
    public String toJSON(List<Annotation> ans);
}

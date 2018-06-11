import {LocalData} from "../../data/LocalData";
import {Annotation} from "../../data/Component";

test('getAnnotation', () => {
    let localData = new LocalData();
    expect(localData.getAnnotations().length).toBe(0);
    let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    localData.addAnnotation(annotation);
    expect(localData.getAnnotations().length).toBe(1);
    expect(typeof localData.getAnnotations()[0]).toBe(typeof annotation);
});
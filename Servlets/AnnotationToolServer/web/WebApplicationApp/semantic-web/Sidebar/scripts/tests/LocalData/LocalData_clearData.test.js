import {LocalData} from "../../data/LocalData";
import {Annotation} from "../../data/Component";

test('delete everything from LocalData instance', () => {
    let localData = new LocalData();
    let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    localData.addAnnotation(annotation);
    expect(localData.getAnnotations().length).toBe(1);
    localData.clearData();
    expect(localData.getAnnotations().length).toBe(0);
});
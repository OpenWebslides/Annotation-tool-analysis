import {LocalData} from "../../data/LocalData";
import {Annotation} from "../../data/Component";

test('findAnnotationByHtmlId', () => {
    let localData = new LocalData();
    let annotation = [];
    annotation[0] = new Annotation("htmlId0", 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    annotation[1] = new Annotation("htmlId1", 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    annotation[2] = new Annotation("htmlId2", 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    annotation[3] = new Annotation("htmlId3", 1, "slide1", "p", "user", "titel", "tekst", "fluo", "question", "belangrijk", "private");
    expect(localData.getAnnotations().length).toBe(0);
    for(let i = 0; i<4; i++){
        localData.addAnnotation(annotation[i]);
    }
    expect(localData.getAnnotations().length).toBe(4);
    expect(localData.findAnnotationByHtmlId("htmlId0")).toBe(annotation[0]);
    expect(localData.findAnnotationByHtmlId("htmlId1")).toBe(annotation[1]);
    expect(localData.findAnnotationByHtmlId("htmlId2")).toBe(annotation[2]);
    expect(localData.findAnnotationByHtmlId("htmlId3")).toBe(annotation[3]);
    expect(localData.findAnnotationByHtmlId("falseData")).toBe(null);
});
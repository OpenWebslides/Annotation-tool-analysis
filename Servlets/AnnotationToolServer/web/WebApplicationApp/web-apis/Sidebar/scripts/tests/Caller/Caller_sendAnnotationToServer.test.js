import {Caller} from "../../data/Caller";
import {LocalData} from "../../data/LocalData";
import {Annotation} from "../../data/Component";
import "../test_Environment_Setup";

test("send annotation",done => {
    let callback = () => {
        expect(c).toBeTruthy();
        expect(a).toBeTruthy();
        expect(b).toBeTruthy();
        done();
    };
    let local = new LocalData();
    expect(local).toBeDefined();
    let a = false;
    let b = false;
    let c = false;
    let caller = new Caller(local, () => {a = true;}, () => {b = true; callback()});
    expect(caller).toBeDefined();
    expect(caller.localData).toEqual(local);
    expect(caller.before).toBeDefined();
    expect(caller.after).toBeDefined();
    expect(caller.serverAddress).toBeDefined();
    expect(caller.url).toBe(caller.serverAddress+caller.restUrl);
    let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", ["tekst"], "fluo", "question", ["belangrijk"], "private");
    caller.sendAnnotationToServer(annotation, () => {c = true;}, () => {c = false;});
});
import {Caller} from "../../data/Caller";
import {LocalData} from "../../data/LocalData";
import "../test_Environment_Setup";

test("load annotation",done => {
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
    caller.loadAnnotationsFromServer(() => {c = true;}, () => {c = false;});
});
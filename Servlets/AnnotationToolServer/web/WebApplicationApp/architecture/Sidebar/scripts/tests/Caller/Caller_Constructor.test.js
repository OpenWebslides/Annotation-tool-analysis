import {Caller} from "../../data/Caller";
import {LocalData} from "../../data/LocalData";
import "../test_Environment_Setup";

test("Caller contructor",() => {
    let local = new LocalData();
    expect(local).toBeDefined();
    let caller = new Caller(local, () => {}, () => {});
    expect(caller).toBeDefined();
    expect(caller.localData).toEqual(local);
    expect(caller.before).toBeDefined();
    expect(caller.after).toBeDefined();
    expect(caller.serverAddress).toBeDefined();
    expect(caller.url).toBe(caller.serverAddress+caller.restUrl);
});
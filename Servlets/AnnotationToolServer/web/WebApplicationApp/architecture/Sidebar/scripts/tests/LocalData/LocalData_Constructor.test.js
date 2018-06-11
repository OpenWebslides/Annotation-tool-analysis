import {LocalData} from "../../data/LocalData";

test('constructor LocalData', () => {
    let localData = new LocalData();
    expect(localData.getAnnotations().length).toBe(0);
});
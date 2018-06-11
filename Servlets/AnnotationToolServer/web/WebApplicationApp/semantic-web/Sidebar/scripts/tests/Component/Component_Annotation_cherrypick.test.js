import {Annotation} from "../../data/Component";

test('cherrypick annotation', () => {
        let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", ["tekst"], "fluo", "question", ["belangrijk"], "private");
        expect(annotation.cherrypicking.length).toBe(0);
        annotation.cherrypick("name");
        expect(annotation.cherrypicking.length).toBe(1);
        annotation.cherrypick("name");
        expect(annotation.cherrypicking.length).toBe(0);
        annotation.cherrypick("name2");
        expect(annotation.cherrypicking.length).toBe(1);
        annotation.cherrypick("name");
        expect(annotation.cherrypicking.length).toBe(2);
        annotation.cherrypick("name2");
        expect(annotation.cherrypicking.length).toBe(1);
        annotation.cherrypick("user");
        expect(annotation.cherrypicking.length).toBe(2);
    }
);
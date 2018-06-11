import {Annotation, Reaction} from "../../data/Component";

test('reaction constructor', () => {
        let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", ["tekst"], "fluo", "question", ["belangrijk"], "private");
        expect(annotation.id).toBe(null);
        expect(annotation.slideNumber).toBe("slide1");
        expect(annotation.element).toBe("p");
        expect(annotation.op).toBe("user");
        expect(annotation.title).toBe("titel");
        expect(annotation.content.commentary[0]).toBe("tekst");
        expect(annotation.content.markType).toBe("fluo");
        expect(annotation.content.category).toBe("question");
        expect(annotation.contentTags.length).toBe(1);
        expect(annotation.cherrypicking.length).toBe(0);
        expect(annotation.rating.thumbsUp.length).toBe(0);
        expect(annotation.rating.thumbsDown.length).toBe(0);
        expect(annotation.view).toBe("private");
        expect(annotation.status).toBe("used");
        expect(annotation.reactions.length).toBe(0);
        let reaction = new Reaction(annotation,"user",["some text"]);
        expect(reaction.person).toBe("user");
        expect(reaction.date).toBeDefined();
        expect(reaction.rating.thumbsUp.length).toBe(0);
        expect(reaction.rating.thumbsDown.length).toBe(0);
        expect(reaction.text.length).toBe(1);
        expect(reaction.text[0]).toBe("some text");
        expect(reaction.status).toBe("used");
        expect(annotation.reactions[0]).toEqual(reaction);
    }
);
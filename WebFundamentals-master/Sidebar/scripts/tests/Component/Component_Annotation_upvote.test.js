import {Annotation} from "../../data/Component";

test('annotation upvoten and remove vote', () => {
        let annotation = new Annotation(null, 1, "slide1", "p", "user", "titel", ["tekst"], "fluo", "question", ["belangrijk"], "private");
        expect(annotation.rating.thumbsUp.length).toBe(0);
        expect(annotation.rating.thumbsDown.length).toBe(0);
        annotation.upvote("user1");
        expect(annotation.rating.thumbsUp.length).toBe(1);
        annotation.removeVote("user1");
        expect(annotation.rating.thumbsUp.length).toBe(0);
        annotation.upvote("user1");
        annotation.upvote("user2");
        annotation.upvote("user3");
        expect(annotation.rating.thumbsUp.length).toBe(3);
        annotation.removeVote("user2");
        expect(annotation.rating.thumbsUp.length).toBe(2);
        annotation.removeVote("user1");
        expect(annotation.rating.thumbsUp.length).toBe(1);
        annotation.removeVote("user1");
        expect(annotation.rating.thumbsUp.length).toBe(1);
        annotation.removeVote("nonUser");
        expect(annotation.rating.thumbsUp.length).toBe(1);
        annotation.upvote("user");
        expect(annotation.rating.thumbsUp.length).toBe(2);
    }
);
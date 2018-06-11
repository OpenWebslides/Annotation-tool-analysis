package Annotations;

import java.util.ArrayList;

/**
 *
 * @author Bavo Deprez
 */
public class Rating {
        public ArrayList<String> thumbsUp;
        public ArrayList<String> thumbsDown;
        
        public Rating(ArrayList<String> upvoted, ArrayList<String> downvoted) {
            this.thumbsUp = upvoted;
            this.thumbsDown = downvoted;
        }

        public Rating() {
            thumbsUp = new ArrayList<>();
            thumbsDown = new ArrayList<>();
        }
        
        public void print() {
            System.err.println("\nthumbsUp leeg : "+thumbsUp.isEmpty()+"\n");
            for (String string : thumbsUp) {
                System.err.println("\t\n by : "+string);
            }
            System.err.println("\nthumbsDown leeg : "+thumbsDown.isEmpty()+"\n");
            for (String string : thumbsDown) {
                System.err.println("\t\n by : "+string);
            }
        }
    }
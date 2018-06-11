/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package AnnotationsExceptions;

/**
 *
 * @author badprez
 */
public class InvalidAnnotationException extends RuntimeException {

    /**
     * Creates a new instance of <code>InvalidAnnotation</code> without detail
     * message.
     */
    public InvalidAnnotationException() {
    }

    /**
     * Constructs an instance of <code>InvalidAnnotation</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public InvalidAnnotationException(String msg) {
        super(msg);
    }
}

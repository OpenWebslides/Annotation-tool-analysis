/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package AnnotationToolTests;

import Annotations.Annotation;
import Annotations.AnnotationsAdapter;
import AnnotationsExceptions.InvalidAnnotationException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * Deze testklasse test het gedrag van de AnnotationAdapter,
 * in het geval dat die een annotatie moet omzetten, of een 
 * niet-annotatie.
 */
public class AdapterTests {
    
    public AdapterTests() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    /*
    Deze methode test het gedrag wanneer een JSON naar een annotatie omgezet wordt,
    wanneer deze JSON niet voldoet aan het formaat van de klasse Annotation.
    Hierbij wordt verwacht dat deze een exceptie opgooit.
    */
    
    @Test(expected = InvalidAnnotationException.class)
    public void notAnAnnotation() {
        String json = "{@Veld@:@Geen echt veld@,@Extra@:@Nogmaals, dit bestaat niet@}".replace('@', '"');
        AnnotationsAdapter adapter = new AnnotationsAdapter();
        adapter.toAnnotation(json);
    }
    
    /*
    Deze methode test het gedrag wanneer een JSON van juist formaat omgezet wordt naar
    Annotation.
    */
    
    @Test
    public void isAnAnnotation(){
     String json = "{\"id\":\"5aeb0d14a7b11b00de4392d5\",\"_id\":{\"timestamp\":1525353748,\"machineIdentifier\":10989851,\"processIdentifier\":222,\"counter\":4428501},\"presentationId\":1,\"slideNumber\":\"title\",\"element\":\"div\",\"op\":\"Piet\",\"title\":\"Belangrijke vraag over data\",\"content\":{\"commentary\":[\"Zo onduidelijk..\",\"Hier moet opgeteld worden\"],\"markType\":\"DUMMY\",\"category\":\"Vraag\"},\"contentTags\":[\"opgelost\"],\"cherrypicking\":[\"Jan\"],\"rating\":{\"thumbsUp\":[\"Toon\",\"Simeon\",\"Jan\"],\"thumbsDown\":[\"Jasper\"]},\"date\":\"23/04/2018\",\"reactions\":[{\"person\":\"Toon\",\"date\":\"03 05 2018\",\"rating\":{\"thumbsUp\":[\"Mieke\",\"Simeon\",\"Jos\"],\"thumbsDown\":[\"Eva\"]},\"text\":[\"Ik stuur de prof hier wel een mail over\",\" moet afdrukken of uitprinten zijn.\"],\"status\":\"deleted\"}],\"status\":\"deleted\"}";       
        
        
        Annotation an = new AnnotationsAdapter().toAnnotation(json);
        assertEquals("5aeb0d14a7b11b00de4392d5", an.id);
        assertEquals(3, an.rating.thumbsUp.size());
        
    }
}

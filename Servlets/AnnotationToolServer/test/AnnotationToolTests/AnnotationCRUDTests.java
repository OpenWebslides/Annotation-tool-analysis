/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package AnnotationToolTests;

import Annotations.Annotation;
import Annotations.AnnotationsAdapter;
import Annotations.AnnotationsCRUD;
import java.util.ArrayList;
import java.util.List;
import jsongenerator.JsonGenerator;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * 
 * Deze klasse dient om de functionaliteit van de AnnotationCRUD
 * te testen. Hierbij wordt een werkende databank verondersteld.
 * 
 * LET OP: de testmethode removeAnnotations verwijdert alle annotaties
 * uit de databank! Hierna zijn alle annotaties dus verwijderd!
 */
public class AnnotationCRUDTests {

    public AnnotationCRUDTests() {
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
    Deze methode test het toevoegen van een annotatie aan de databank,
    en vervolgens het verwijderen van de annotatie in de databank.
    
    */
    @Test
    public void addAndRemoveAnnotation() {
        Annotation an = JsonGenerator.giveAnnotation();
        AnnotationsCRUD dao = AnnotationsCRUD.getInstance();
        AnnotationsAdapter adapter = new AnnotationsAdapter();
        dao.putItem(an);

        List<Annotation> lijst = dao.getItems();
        Annotation res = null;
        int aantalJuist = 0;
        for (Annotation item : lijst) {
            if (Annotation.areEqual(item, an)) {
                aantalJuist++;
                res = item;
            }
        }
        // Het aantal objecten dat identiek is met de gezochte annotatie moet één zijn.
        assertEquals(1, aantalJuist);
        
        assertTrue(dao.deleteAnnotationById(res == null ? null :res.id));
        
        lijst = dao.getItems();
        
        //De annotatie mag niet meer voorkomen in de databank.
        assertFalse((lijst.contains(res)));
    }
    
    /*
    
    Deze methode verwijdert test het verwijderen van alle annotaties in de databank.
    
    */
    
    @Test
    public void removeAllAnnotations(){
        AnnotationsCRUD dao = AnnotationsCRUD.getInstance();
        List<Annotation> items = dao.getItems();
        //Om te checken als alle annotaties verwijderd zijn,
        //moet er minstens een annotatie in de databank aanwezig zijn.
        if(items.isEmpty()) {
            Annotation an = JsonGenerator.giveAnnotation();
            dao.putItem(an);
        }
        
        //Vervolgens wordt de databank leeggemaakt.
        dao.flushDb();
        
        items = dao.getItems();
        
        assertTrue(items.isEmpty());
    }
}

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package AnnotationToolTests;

import Annotations.Annotation;
import jsongenerator.JsonGenerator;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author bavod
 */
public class JsonGeneratorTests {
    
    public JsonGeneratorTests() {
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
    Deze testklasse test de uitvoer van de JsonGeneratorklasse, die gebruikt
    om annotaties in de vorm van Annotation-objecten of in JSON-formaat te genereren.
    */
    @Test
    public void makeAnnotation(){
        Annotation an;
        for(int i = 0; i < 10; i++){
        an = JsonGenerator.giveAnnotation();
        
        /*Hier wordt getest als de essentiele velden aanwezig zijn:
        een presentatienummer, een slidenummer en een auteur van de annotatie
        */
        assertTrue(an.isValid(an));
        }
    }
}

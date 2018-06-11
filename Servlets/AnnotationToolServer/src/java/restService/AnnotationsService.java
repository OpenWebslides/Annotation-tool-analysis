/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package restService;

import Annotations.Annotation;
import Annotations.AnnotationsCRUD;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import jsongenerator.JsonGenerator;

/**
 * REST Web Service
 *
 * @author bavod
 * 
 * Deze service luistert op webresources/api, en gebruikt 
 * een instantie van AnnotationsCRUD om annotaties
 * op te halen en toe te voegen aan de databank.
 * 
 * Dummy-data kan bekomen worden via
 * webresources/api/dummy[/{aantal}]
 * om {aantal} dummy-annotaties in JSON-formaat te verkrijgen,
 * default is vijf.
 * 
 */
@Path("api")
public class AnnotationsService {

    @Context
    private UriInfo context;
    private AnnotationsCRUD dao;

    /**
     * Creates a new instance of AnnotationsService
     */
    public AnnotationsService(){
        dao = AnnotationsCRUD.getInstance();
    }

    
    @GET
    @Path("dummy")
    @Produces(MediaType.APPLICATION_JSON)
    public String getDummyJson() {
        return JsonGenerator.geefJson(5);
    }
    
    @GET
    @Path("dummy/{amount}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getMultipleDummyJson(@PathParam("amount") int n){
        return JsonGenerator.geefJson(n);
    }
    /**
     * PUT method for updating or creating an instance of AnnotationsService
     * @param content representation for the resource
     * @return 
     */
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson() {
        return dao.getJson();
    }
    
    
    @POST
    @Path("test")
    @Produces(MediaType.APPLICATION_JSON)
    public String getJsonAndPutOneDummy() {
        Annotation an = JsonGenerator.giveAnnotation();
        dao.putItem(an);
        return dao.getJson();
    }
    
    @POST
    @Path("test/{amount}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getJsonAndPutManyDummy(@PathParam("amount") int n) {
        for(int i = 0; i<n; i++){
            Annotation an = JsonGenerator.giveAnnotation();
            dao.putItem(an);
        }
        return dao.getJson();
    }
    
    @DELETE
    @Path("flush")
    @Produces(MediaType.TEXT_HTML)
    public String dropCollection(){
        if(dao.flushDb()) {
            return "<p>De databank is succesvol geleegd</p>";
        }
        else {
            return "<p>Er is een fout opgetreden.</p>";
        }
    }
    
    @DELETE
    @Path("/{id}")
    public String deleteItem(@PathParam("id") String id){
        if(dao.deleteAnnotationById(id)) {
            System.err.println("Joepie, gelukt met id :"+id);
            return "<p> De annotatie is correct verwijderd </p>";
        }
        else {
            System.err.println("Oeioei, het verwijderen is toch niet gelukt.. Was met id :"+id);
            return "<p> De annotatie is niet verwijderd </p>";
        }
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void putJson(String json) {
        dao.putJson(json);
    }
}

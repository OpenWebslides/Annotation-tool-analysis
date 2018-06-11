# Latest glassfish image
FROM glassfish:latest			

# Copy WAR file and startup script, make startup script executable
COPY AnnotationToolServer.war /
COPY start.sh /			
RUN chmod +x /start.sh

# Expose HTTP port
EXPOSE 8080						

# Execute startup script
ENTRYPOINT ["/start.sh"]		

#!/usr/bin/env bash

echo -e "[INF] \t Building and starting containers (might take some time)"
docker-compose -f docker/webslides-01.yml up -d --build --no-color >& webslides-01-compose.log
echo -e "[INF] \t Docker-compose logs written to webslides-01-compose.log" 
echo -e "[INF] \t Glassfish running at http://localhost:9003"
echo -e "[INF] \t For executing add asadmin commands,"
echo -e "      \t edit start.sh script inside container folder."
echo -e "[INF] \t MongoDB can be accessed from the web container"
echo -e "      \t at mongodb://webslides-01-mongodb:27017"
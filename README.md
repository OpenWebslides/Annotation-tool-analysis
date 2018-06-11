
# webslides-01

Welkom bij webslides-01! Deze repository bevat alles om de annotatietool te installeren in een bestaande WebSlides-presentatie, deze te testen en zelfs de broncode om zelf aanpassingen te doen.


### Inhoudstafel
**[Structuur repository](#structuur-repository)**<br>
**[Installatieinstructies](#installatieinstructies)**<br>
**[Gebruiksinstructies](#gebruiksinstructies)**<br>
**[Compatibiliteit](#compatibiliteit)**<br>
**[Frontend tests](#frontend-tests)**<br>
**[Usability tests](#usability-tests)**<br>
**[Logboeken](#logboeken)**<br>
**[Issues per sprint](#issues-per-sprint)**<br>


## Structuur repository

* [Analyse: ][Analyse]
   Alle info over de structuur en het ontwerp van de annotatietool is hier te vinden. Meer gedetailleerde info hierover vindt u op onze [Wiki][Wiki].
* [Import: ][Import]
   Hierin vindt u alles wat u nodig hebt om uw presentatie uit te breiden met de annotatietool.
   * [Sidebar: ][Sidebar] Hier staat alle front-end code van de annotatietool.
* [Servlets: ][Servlets]
   De gebruikte Java Servlet die deel van de back-end uitmaakt van de annotatietool.
* [WebFundamentals-master: ][WebFundamentals-master]
   Een [voorbeeldpresentatie][online versie] met annotatietool al geïnstalleerd, met dank aan prof. dr.  ir. Ruben Verborgh om ons zijn presentaties van de [WebFundamentalsmodule][Voorbeeldpresentaties] ter beschikking te stellen.
* [docker: ][docker] De gebruikte configuratiebestanden voor de Dockercontainers.
* [verslag: ][verslag] Het projectdossier met gedetailleerde uitleg kan men hier terugvinden.

[Analyse]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/Analyse
[buildandrun.sh]: https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/buildandrun.sh
[backend wiki]: https://github.ugent.be/bp-vop-2018/webslides-01/wiki/Backend
[compatibiliteit]: https://github.ugent.be/bp-vop-2018/webslides-01/wiki/Compatibiliteit
[configuratie mongodb]: https://github.ugent.be/bp-vop-2018/webslides-01/wiki/Backend#configuratie-mongodb
[connectiestring]: https://docs.mongodb.com/manual/reference/connection-string/
[docker]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/docker
[gebruiksinstructies]: #gebruiksinstructies
[Import]: https://github.ugent.be/bp-vop-2018/webslides-01/raw/master/Import/import.zip
[online versie]: http://webslides-01.project.tiwi.be/
[Servlets]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/Servlets
[Sidebar]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/Import/Sidebar
[vbstructuur]: https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/verslag/vbStructuur.PNG
[verslag]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/verslag
[Voorbeeldpresentaties]: https://github.com/RubenVerborgh/WebFundamentals
[WebFundamentals-master]: https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/WebFundamentals-master
[Wiki]: https://github.ugent.be/bp-vop-2018/webslides-01/wiki


## Installatieinstructies
De annotatietool gebruikt een databank om annotaties op te slaan en een webserver om de presentatie met annotatietool te sturen naar de gebruiker. Vooraleer presentaties dus online gezet kunnen worden, moeten deze vereisten in orde zijn. Deze twee services draaien elk in een Docker-container, en dit moet ook opgezet worden.
Concreet bestaat de pre-setup uit:

* [Configureren van de Docker-containers](#configureren-van-de-docker-containers)
* [Configureren van de Servlet](#configureren-van-de-servlet)

Gebruikt men voor elke presentatie dezelfde webserver en databank, dan hoeft de pre-setup maar één keer te gebeuren.
De setup zelf bestaat uit:

* [Het toevoegen van de annotatietool aan een presentatie](#de-annotatietool-toevoegen-aan-een-presentatie)
* [De presentatie toevoegen aan de webserver](#de-presentatie-toevoegen-aan-de-webserver)
* [Deployen van de webserver via een distributiebestand](#deployen-van-de-webserver-aan-de-hand-van-een-distributiebestand)

De setup voert men elke keer uit als een presentatie toegevoegd of verwijderd moet worden.

### Configureren van de Docker-containers

In deze stap kan men de naam van de containers aanpassen, in welke map verdere configuratie gezocht moet worden en welke poort van de containers afgebeeld wordt op de poort van de host. Verder vindt men hier ook de optie om te kiezen welke poort opengezet wordt van de container. 

Het `.yml`-bestand beschrijft de containers. Men kan de [docker][docker]-map gebruiken als template, om de containers te configureren. Bijvoorbeeld ziet het bestand `webslides-01.yml` er zo uit:

```
version: "2"  # "3" if beta release (swarm mode)
services:
  webslides-01-glassfish:
    build: 
      context: webslides-01-glassfish/
      dockerfile: Dockerfile
    ports:
      - "9003:8080"
  webslides-01-mongodb:
    build: 
      context: webslides-01-mongodb/
      dockerfile: Dockerfile
```
De lijn na `services` bepaalt de naam van de container, en de `context` bepaalt in welke map Docker moet zoeken om de `dockerfile` met bijkomende beschrijving van de container te vinden.

Hier worden dus twee services gedefinieerd: `webslides-01-glassfish` en `webslides-01-mongodb` en zijn de bijhorende Dockerfiles terug te vinden in respectievelijk `webslides-01-glassfish/` en `webslides-01-mongodb/`.

Belangrijk is hier dat de lijn na `ports` de poort `8080` van de container afbeeldt op de poort `9003` van de host. Hier kan men dus kiezen welke poort gebruikt wordt om de container te bereiken, in dit geval `9003`.

Verder staat in de individuele `Dockerfile`-bestanden (in de template zijn dit `docker/webslides-01-glassfish/Dockerfile` en `docker/webslides-01-mongodb/Dockerfile`) nog welke poort communicatie van buiten zijn container toelaat. Dit gebeurt via het `EXPOSE` sleutelwoord. In de template is dit `8080` voor de webserver, en `27017` voor de databank (de default poort van MongoDB).


### Configureren van de Servlet
De broncode van de Servlet vindt men terug in `Servlets`. Meer info over de huidige functionaliteit vindt men op onze [Wiki][backend wiki]. De enige configuratie van de Servlet t.o.v. de databank bevindt zich in de map `Servlets/AnnotationToolServer/src/java/Annotations/resources/`.
Het bestand `prod.properties` bevat de connectiestring van de databank, de databanknaam en de collectienaam, bijvoorbeeld:
```
connString=mongodb://webslides-01-mongodb:27017
dbNaam=BachelorproefDB
collNaam=Annotaties
```
Om de Servlet correct te laten verbinden met de databank, dient men de connectiestring correct in te vullen.
De [connectiestring][connectiestring] heeft een vaste vorm: `mongodb://host:poort`. Als host kiest u de naam van de Dockercontainer van de webserver die u in de vorige stap gekozen heeft, als poort de `port` die u in de vorige stap heeft opengezet van de databankcontainer (standaard is dit `27017`). De databanknaam en bijhorende collectienaam hoeven niet op voorhand te bestaan, of ingegeven te zijn op de instantie van MongoDB.

### De annotatietool toevoegen aan een presentatie
De annotatietool is zo ontworpen om te kunnen inhaken op een bestaande WebSlidespresentatie. Enkele voorbeelden van deze presentaties kan men [hier][Voorbeeldpresentaties] vinden, waarbij `index.html` een overzichtspresentatie is, en elke aparte map (buiten `_shared`) een ander `index.html` bevat, dat ook telkens een presentatie voorstelt.

Om de annotatietool nu toe te voegen aan een eigen WebSlidespresentatie, downloadt men het [.zip-bestand][Import] van `Import` en pakt men het uit op de plaats waar het `.html` bestand staat van uw presentatie.
Voordat de annotatietool toegevoegd wordt aan de presentatie, dient men in `Sidebar/scripts/data/config.js` met een simpele tekstverwerker een aanpassing te doen. In dit bestand staat de URL waarop de server te vinden is, en die dus gebruikt wordt om de annotaties op te vragen en door te sturen. Het bestand ziet er als volgt uit:
```
export let serverSettings = {
    "serverAddress": "webslides-01.project.tiwi.be"
    ,"restPath" : "/webresources/api"
};
```
Op de plaats van `webslides-01.project.tiwi.be` staat dus de URL van de eigen server. Op de plaats van `/webresources/api` komt het eigengekozen REST-pad dat aan de URL toegevoegd wordt. Als de server niet verandert voor volgende presentaties, kan men altijd een kopie van `config.js` of van de volledige `Sidebar`-map bijhouden, zodat deze aanpassing niet met elke volgende presentatie moet doorgevoerd worden.

Vervolgens voert men het script `import.sh` uit. Dit kan door gebruik te maken van eender welk bash-gebaseerde terminal, bijvoorbeeld de Docker Quickstart Terminal. Om dit te doen, navigeert men in deze terminal eerst naar de map waar u zojuist de inhoud van `Import` naartoe kopieerde, met het commando `cd`. Daarna voert men het script uit. Bijvoorbeeld:
```
$ cd /usr/webslides/presentation
$ ./import.sh mijn_index.html
```
Als argument neemt het script de naam van het `.html` van de presentatie en vervangt u `mijn_index.html` dus door de naam van uw eigen bestand. Wordt geen argument meegegeven, dan kiest die standaard voor `index.html`.

Hierdoor wordt al het nodige toegevoegd aan de presentatie zelf. Er wordt een backup genomen van het originele bestand, met dezelfde naam met een ~ erna. Dus in het vorige voorbeeld zou de originele presentatie terug te vinden zijn in het bestand `index.html~`.

### De presentatie toevoegen aan de webserver

De presentaties aan de webserver toevoegen, is simpel, maar eerst moet een beperking in acht genomen worden : elke presentatie moet in een eigen map zitten, met unieke mapnaam. Als dit het geval is, kopieert men elke elke map naar de map `/Servlets/AnnotationToolServer/web/WebApplicationApp/`. Als dat nog niet het geval is, wordt best een `index.html` voorzien in deze map, die kan bijvoorbeeld dienen als overzichtspagina tussen de verschillende presentaties. Natuurlijk kan een presentatie ook gebruikt worden hiervoor. De structuur in  `/Servlets/AnnotationToolServer/web/WebApplicationApp/` is nu dus bijvoorbeeld:

![alt text][vbstructuur]

Is dit correct gebeurd, dan buildt men de map `Servlets/AnnotationToolServer/` tot een distributiebestand (extensie `.war`). Dit ene bestand stelt de volledige logica van de webserver voor, en wordt door de Dockercontainer gebruikt.
Dit kan bijvoorbeeld door de map `Servlets/AnnotationToolServer/` te openen in NetBeans, en de optie "Clean and Build" te laten uitvoeren. Het `.war` bestand bevindt zich dan in `Servlets/AnnotationToolServer/dist/`.

### Deployen van de webserver aan de hand van een distributiebestand

Het distributiebestand dat men in de vorige stap verkregen heeft, kan men nu dus gebruiken om de webserver te deployen. Volgt men de [docker-template][docker], dan plaatst men deze in `docker/webslides-01-glassfish/`, met de naam `AnnotationToolServer.war`.

#### De containers starten

Als een correct distributiebestand toegevoegd is, is alles klaar om de twee containers te starten. Deze Dockercontainers zijn de omgeving waarin de webserver en de databank zullen werken. Gebruikt men de [docker-template][docker], dan plaatst men het [script][buildandrun.sh] `buildandrun.sh` buiten de map `docker/` en voert men het uit. Dit kan via de Docker Quickstart Terminal.

```
$ ./buildandrun.sh
```
Volgt men de template niet, dan verandert men best in het script het argument `docker/webslides-01.yml` in een verwijzing naar het voorgenoemde `.yml` bestand. Negeer in dat geval de uitvoer van het script.

Als test dat de databank correct gestart is, kan men in deze terminal de shell van MongoDB openen. Deze shell voorziet mogelijkheden om de databank te beheren, hierover meer in onze [Wiki][configuratie mongodb].

Als test dat de webserver én de databank correct gestart zijn, kan men al eens naar http://192.168.99.100:XXXX surfen (waarbij XXXX het gekozen poortnummer is). Standaard staat deze momenteel op http://192.168.99.100:9003 ingesteld. Indien men hier begroet wordt door de gekozen presentatie met annotatietool, dan is de front-end van de applicatie in orde. Indien u annotaties kunt toevoegen en verwijderen, dan is de back-end dat ook! Meer info over het gebruik van de annotatietool vindt men in de [Gebruiksinstructies][gebruiksinstructies].

## Gebruiksinstructies

### Login
Wanneer u surft naar de website, krijgt u een prompt te zien die vraagt achter uw loginnaam. Afhankelijk van de input zullen er andere features mogelijk zijn in de sidebar. Zo zullen professoren alle annotaties en reacties kunnen verwijderen en verschijnt hun gebruikersnaam in een opvallende kleur. U kan als professor inloggen door "professor" in te geven in de prompt, anders wordt u als student beschouwd.

### Handleiding
#### 1: Openen van de annotatietool
Om de annotatietool te openen, klikt u op het blauwe icoon aan de rechterkant van het scherm. Door de blauwgekleurde balk aan de linkerkant van de annotatietool te verslepen, kan men de grootte die hij inneemt op het scherm aanpassen.

#### 2: Navigatieknoppen
Via het overview-icoon wordt het overview-tabblad geopend waarin men kan filteren op annotaties van de gehele cursus (Zie 3: Annotaties zoeken en bekijken). (1) 
Via het plusicoon wordt het add-tabblad getoond en kan men zelf een annotatie schrijven en toevoegen (Zie 4: Annotaties plaatsen). (2) Het refreshen van de annotaties doet men door op het refresh-icoon te klikken. (3) 
Met behulp van het kruisicoon sluit men de annotatietool. (4) 
Om terug te gaan naar de default-tabblad klikt u op het pijlicoon. (5) 
Om een andere taal te selecteren, klikt u op de huidige taal en selecteert u in het drop-down menu de gewenste vertaling. (6) 
Het allerlaatste icoon wordt besproken onder de titel 7: Notificaties. (7)

<img src="https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/images/gebruikershandleiding_navigatie_defaultview.png" alt="screenshot navigatieknoppen" width="400px">

#### 3: Annotaties zoeken en bekijken
Wanneer de annotatietool is geopend, worden by default alle annotaties die bij de huidige webslide horen onder elkaar geminimaliseerd weergegeven. In deze geminimaliseerde versie zijn enkel de auteur, titel, categorie, tags en het aantal reacties te zien van de annotatie. Om de overige informatie zoals de inhoud van zo’n annotatie en de effectieve reacties erop te bekijken, klikt u op het plusicoon naast de auteur. (8) 
Om de annotatie opnieuw te minimaliseren, klikt u op het minicoon. (9) 
In het overview-tabblad (Zie 2: Navigatieknoppen) kan men de annotaties van de gehele cursus bekijken en filteren. Hierin kan men eveneens op dezelfde manier een annotatie vergroten en verkleinen.

In het overview-tabblad kan er zowel op inhoud als op een categorie, titel, naam of tag gefilterd worden door in het zoekveld een term op te geven en op de toets Enter te drukken. Ook meerdere zoektermen kunnen meegegeven worden, gescheiden door een komma. De output matcht dan met elk opgegeven zoekwoord, zonder rekening te houden met hoofdletters. (10) 
By default wordt ook een annotatie gematcht wanneer een gedeelte van een reactie (inhoud of poster) overeenkomt met het opgegeven stukje tekst. Dit kan aan- of uitgezet worden door op de blauwe tekst te klikken naast de zoekbalk. (11) 
Men kan eveneens favoriete annotaties opvragen, hiervoor klikt u op de favorite-knop naast de zoekbalk (Zie 8: Annotaties en reacties beoordelen). (12) 
Nadat men op de toets Enter of de favorite-knop heeft gedrukt, worden alle gematchte annotaties weergegeven onder de zoekbalk. De volgorde waarin al deze annotaties worden weergeven, kan ingesteld worden door een andere sorteervolgorde aan te duiden in het drop-down menu. (13) Standaard staat deze op SLIDES (ordenen volgens de naam van de webslide). Andere opties zijn TOP (sorteren op beoordeling door middel van aantal upvotes verminderd met aantal downvotes), HOT (sorteren op populariteit met aantal reacties) en NEW (sorteren op datum met vooraan de recentste annotaties).

Naast het filteren op een tag kan men ook binnen een annotatie op een tag klikken om automatisch naar het overview-tabblad te navigeren met soortgelijke annotaties. (14) Klik op ‘Jump to slide’ (of een vertaling hiervan) boven een annotatie in de lijst om naar de bijhorende slide te gaan. (15)

<img src="https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/images/gebruikershandleiding_overview.png" alt="screenshot overview" width="800px">

#### 4: Annotaties plaatsen
Om een annotatie te plaatsen bij een bepaalde slide, gaat u naar het add-tabblad (Zie 2: Navigatieknoppen). Er moet weliswaar eerst een slide geselecteerd zijn om een annotatie toe te voegen. Men kan een categorie kiezen via het drop-down menu en aanduiden of de annotatie publiek (voor iedereen zichtbaar) of privaat (enkel voor uzelf zichtbaar) moet worden geplaatst. (16) 
In de invoegkaders eronder geeft u een titel aan de annotatie en schrijft u de inhoud ervan. (17) 
Er kunnen eventueel tags worden toegevoegd door een tag op te geven en hierna op de add-knop te klikken. Deze opgegeven tag verschijnt boven het invoegbalkje. Om een tag te verwijderen, hoeft u er gewoon op te klikken. (18)

Normaliter wordt een annotatie gekoppeld aan de gehele slide. Om een annotatie aan een specifiek deel van de slide te koppelen, klikt u op het gewenste element in de webslide. Hierbij zal de annotatietool tijdelijk verborgen worden om over de gehele slide aan te kunnen duiden. Wanneer u een element heeft aangeduid, verschijnt het in het lichtblauw en komt de zijbalk opnieuw tevoorschijn. Om de sidebar op te roepen zonder een verplichte selectie, kunnen alle toetsen ingedrukt worden, behalve de toets ESC aangezien deze een speciale functie heeft binnen de webslides zelf).

Om de gerede annotatie toe te voegen, klikt u op de submit-knop. (19) Klik op de terug-knop links bovenaan om het maken van annotatie te annuleren en terug te keren naar het default-tabblad (Zie B Navigatieknoppen).

<img src="https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/images/gebruikershandleiding_add.png" alt="screenshot overview" width="400px">

#### 5: Annotaties aanpassen en verwijderen
Wanneer men in de het overview-tabblad of default-tabblad (Zie 2: Navigatieknoppen) een annotatie maximaliseert, zijn er drie klikbare icoons te zien aan de rechterkant: Een klokicoon, potloodicoon en vuilnisemmericoon. (20) 
Het klokicoon staat enkel bij annotaties die in het verleden aangepast zijn door hun original poster. Met behulp van dit icoon kan men de geschiedenis van zo’n bewerkte annotatie zien. Met het potloodicoon kan men een annotatie bewerken, het add-tabblad wordt dan geopend met daarin de velden reeds ingevuld met huidige info (Zie D Annotaties plaatsen). Belangrijk: Om de wijziging ook effectief door te voeren, klikt u op de submit-knop. (19) 
Om een annotatie te verwijderen, klikt u op het vuilnisemmericoon.

#### 6: Reactie op een annotatie plaatsen  en aanpassen 
Wanneer een annotatie gemaximaliseerd is, (Zie 3: Annotaties zoeken en bekijken) kan men er een reactie op plaatsen door deze reactie in te vullen in het invoegkader en daarna op het pijlicoon te klikken. (21) De reactie verschijnt nu onderaan de lijst van reacties op deze annotatie. 
Net zoals bij een annotatie (Zie 5: Annotaties aanpassen en verwijderen) kan men een eigen reactie bewerken en verwijderen met behulp van het potloodicoon en vuilnisemmericoon. Met het klokicoon kan men eveneens de geschiedenis van een reactie bekijken als deze aangepast is. (22)

<img src="https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/images/gebruikershandleiding_voting_reacties.png" alt="screenshot voting" width="400px">

#### 7: Notificaties 
Wanneer iemand een nieuwe annotatie of reactie heeft geplaatst binnen de laatste week, dan zal dit verschijnen in de notificatielijst. Deze lijst kan men bekijken door op het belicoon te klikken onder de navigatiebalk (Zie 2: Navigatieknoppen). (7) Hierin kan men opnieuw (zoals in 3: Annotaties zoeken en bekijken) door op ‘Jump to slide’ (of een vertaling hiervan) te klikken in de lijst naar de bijhorende slide en annotatie navigeren.

#### 8: Annotaties en reacties beoordelen
Wanneer een annotatie gemaximaliseerd is, (Zie 3: Annotaties zoeken en bekijken) kan u uw mening geven over een annotatie of reactie erop. Om een annotatie of reactie te up- of downvoten, klikt u op de overeenkomstige duim omhoog of omlaag. (23) Om een annotatie toe te voegen aan uw favorieten, klikt u op de ster. (24) Uw favoriete annotaties kan u bekijken in het overview-tabblad (Zie 3: Annotaties zoeken en bekijken).

#### 9: Tooltips
Als er toch iets van deze gebruikershandleiding u ontglipt is, zijn er nog steeds enkele tooltips die helpen bij het ontcijferen van de verscheidene icoons en knoppen. Blijf met de muis even op een knop of icoon staan om een tooltip tevoorschijn te laten komen. (25)

<img src="https://github.ugent.be/bp-vop-2018/webslides-01/blob/master/images/gebruikershandleiding_tooltips.png" alt="screenshot tooltip" width="400px">

## Compatibiliteit

Zie hiervoor de [Wikipagina][compatibiliteit].

## Frontend tests

### Benodigdheden
De front-end heeft enkele unit en integration testen die gebruik maken van het Jest framework. Dit framework wordt gebruikt met behulp van npm. Voor volgende stappen wordt verwacht dat npm al vooraf is geïnstalleerd.

### Installatie
Navigeer naar de map webslides-01/WebFundamentals-master/Sidebar

Voer volgend commando uit in powershell op deze locatie om jest te installeren:

    npm install --save-dev jest

Op sommige toestellen werpt Jest een fout op in verband met Babel, uit voorzorg is het best om ook volgend commando uit te voeren:

    npm install babel-preset-env --save-dev

Sommige testen maken gebruik van jQuery. Hiervoor verwacht npm dat jQuery beschikbaar is, dit kan via volgende regel:

    npm install jQuery

### Gebruik
De testen staan in de map webslides-01/WebFundamentals-master/Sidebar/scripts/tests

Uitvoeren van de testen kan door in de console in de map Sidebar het volgend commando uit te voeren:

    npm test
    
## Usability tests

Zie hiervoor de [Wikipagina](https://github.ugent.be/bp-vop-2018/webslides-01/wiki/Usability-testen).

## Logboeken

Zie hiervoor de map [logboeken](https://github.ugent.be/bp-vop-2018/webslides-01/tree/master/logboeken).

## Issues per sprint

### Sprint 1
- De gebruiker kan de sidebar openen en verslepen 
- De gebruiker kan gegenereerde annotaties bekijken in de sidebar
- De gebruiker kan annotaties cherrypicken, filteren, upvoten en downvoten
- De gebruiker kan zelf annotaties en reacties aanmaken 

### Sprint 2
- De gebruiker kan annotaties minimaliseren (by default) en maximaliseren
- De gebruiker kan zijn eigen annotaties en reacties aanpassen en verwijderen
- De gebruiker krijgt gepaste foutmeldingen wanneer er tekstvelden niet werden ingevuld of de verbinding wegvalt
- De gebruiker kan annotaties van één presentatie filteren op inhoud van de annotatie, tags, categorie en personen die iets gecherrypickt hebben. 
- Er is ondersteuning op verschillende browsers (firefox, chrome)
- De gebruiker kan de help-knop gebruiken wanneer iconen onduidelijk zijn en een beschrijving nodig hebben 

### Sprint 3 
- De gebruiker kan een taal (Engels, Nederlands (by default)) kiezen in de sidebar
- De gebruiker kan in één zoekbalk zoeken op personen, inhoud, titel, categorie en tags
- Na klikken op een tag wordt er genavigeerd naar de overview met soortgelijke annotaties.
- De weergave van annotaties wordt aangepast aan de grootte van het venster.
- De sidebar wordt dichtgeklapt en terug geopend bij selectie van een element in het formulier.
- Er zijn per presentatie wekelijkse 'meldingen': aanpassingen (annotaties,reacties), met namen en navigatiemogelijkheid
- De professor heeft moderatorfunctionaliteit: hij kan alle annotaties en reacties verwijderen en zijn naam komt in kleur
- Vanaf de muis één seconde op een icoon blijft staan, komt er een tooltip met extra uitleg. 
- De gebruiker kan all eigen favorieten opvragen.
- De flow wordt behouden: De bewerkingsgeschiedenis van annotaties/reacties kan opgevraagd worden. Zowel verwijderde als aangepaste annotaties/reacties doen mee bij filtering en ordening, wel slechts met de laatste aanpassing.
- De gebruiker kan annotaties ordenen op datum, totale beoordeling, populariteit en alfabetische slidenamen.

Vinted Komponente: Anzeige Erstellen



Was kann die Komponente?
-> Eine Komponente zum Erstellen von Anzeigen, ähnlich wie bei Vinted.
-> Man kann aus verschiedenen Kategorieren etc. wählen und Infos zur Anzeige angeben
-> Es können mehrere Bilder zur Anzeige hochgeladen werden
-> Es kann max. ein Video hochgeladen werden zur Anzeige
-> Bilder und Videos werden in die Azure Cloud hochgeladen
-> Benutzer werden gemoggt. Man kann aus 3 Benutzer  wählen um eine Anzeige hochzuladen
diese sind als Dummys zu sehen bis man die Komponente Benutzerregistrierung damit verknüpft. 
Ebenso läuft dies aber schon über JWT, so kann man nun auch seine eigene Anzeige wieder löschen.
-> Die Anzeigen können in einem seperaten Fenster angezeigt mit den jeweiligen Bilder und Videos. (Sollte ausgelagert werden in eine eigene Komponente)



Verwendete Technologien:
Backend:
	Spring Boot & Java
	Spring Security & JWT
	SQLite & JPA/Hibernate
	HTTPS Kommunikation im Backend
	SSL
	SQCipher zur Verschlüsselung der SQLite DB
	-> Hatte damit Probleme. In application properties kann ein Key übergegeben wodurch dann die SQLite Datei "encrypted" manuell nicht mehr öffnen lässt.
	   Das ist jedoch ziemlich umständlich dann manuell zu umschlüsseln um dort rein zu schauen, deshalb habe ich mal den Key weggelassen
	Asynchrone Verarbeitung der Videos
	FFMPEG
	Azure Blob Storage
Frontend:
	React
	JavaScript und Axios/fetch
	CSS
	React-easy-crop
	node.js



Was benötigt man um die Komponente zum laufen zu bringen?
- Java 17
- Maven
- Theoretisch SQLite falls man in die Datenbank reinschauen möchte
- Node.js zum ausführen des Reacts Frontend
- FFMpeg installieren für die Video Konventierung



Komponente Starten:
-> Jeweilige CMD im Client und Spring Boot Ordner öffnen. 
-> Backend starten mit "mvnw spring-boot:run -DskipTests"
	-> Es läuft über HTTPS auf Port 8443
-> Frontend starten mit "npm start" (Evtl zuerst npm install)
	-> Verfügbar über localhost:3000
	



Software Design
-> Die Komponente ist Modular aufgebaut
	-> Frontend und Backend sind getrennt
	-> Model: Enthält Domänendaten wie Anzeigen, Videos und kategoriespezifische Infos.
	-> Repository: Nutzt Spring Data JPA (SQLite) für den Datenzugriff.
	-> Service: Implementiert die Geschäftslogik, inklusive asynchroner Videokonvertierung (mit FFMPEG) und Integration in Azure Blob Storage.
	-> Controller: Stellt RESTful APIs bereit (z. B. POST, GET, DELETE), über die das Frontend mit dem Backend kommuniziert.
	-> Alle wichtigen Einstellungen sind zentral in application properties festgelegt
-> HTTPS und JWT werden genutzt für die Sicherheit
	-> Token basiert Authentifizieren damit nur berechtigte Benutzer auf die Endpunkte zugreifen. Schützt alle sensiblen Endpunkte
-> Cloud Integration: Bilder und Videos werden in der MS Azure Cloud gespeichert über SAS Token
	-> Mittels FFMpeg werden VVideos noch in verschiedenen Auflösungen gespeichert
	-> Asychrone Speicherung der Videos verbessert die Reaktionsfähigkeit wenn man sie hochlädt

Begründung von Software Design Entscheidungen:
-> Mehrschichte Archtiektur mit Model, Repository, … da es übersichtlicher ist und so einfach zu entwickeln
-> Asynchrone Verarbeitung der Videos rauben nicht zu lange zeit und der Nutzer muss nicht lange warten
-> JWT -> Einfach über die anderen weiteren Komponenten hinweg einsetzbar -> Sicherheitsstandard
-> Cloud Integration entlastet Anwendungsserver, gerade eben bei Videos und ermöglicht einen kontrollierten Zugriff mit SAS Token
-> SQLite ist für den Prototyp ausreichend und ist einfach zu konfigurieren was den Entwicklungsprozess effizienter macht




Integration in die Gesamtsoftware Vinted:
Es gibt bereits mögliche Schnittstellen in meiner Komponente.
Eine Sinnvolle zur Verknüpfung mit z.B. Eriks Startseite wäre die "GET /api/ads" API bei der eine Liste aller anzeigen geliefert wird. 
-> Dort werden bisher jedoch alle Informationen geteilt. Man könnte mit spezifischeren APIs noch arbeiten. Falls Erik z.B. für die Startseite eben 
nur Hauptinformationen braucht. Und wenn dann man eine Detaliertere Anzeigenbeschreibung möchte auf eine detaliertere API (die jetzige) zugegriffen wird. 
Auch das Bestellsystem kann sich anhand der Anzeigen ID und der darin enthaltenen Preise mit einer Transaktion verbinden. 
Die anderen Komponenten können über die URLS die über SAS Tokens abgesichert sind der Azure Cloud dort die Bilder und Videos beziehen. 
-> Mit den APIs "GET /api/ads/images/{filename}" und "GET /api/ads/videos/{filename}" <- Liefert sichere URLs mit SAS Tokens, So können die anderen die Bilder / Videos beziehen.
Da bei mir bereits JWT miteingebaut ist und die Benutzeregistrierung ebenso JWT Tokens verwendet kann man diese miteinander in Verbindung setzen. Durch jeden API Aufruf
Man könnte ebenso noch API Schnittstellen hinzufügen wie PUT/PATCH /api/ads/{id}: Damit kann man Anzeigen aktualisieren bzw ändern. So könnte eine Komponente wie die Verwaltung
von Anzeigen eines Nutzers auf diese Schnittstellen zugreifen




Weitere wichtige Infos und Anmerkungen zu meiner Komponente:
-> Die sensiblen Daten wie Keys, JWT Schlüssel, SAS Token sind fest im Code drin. Das ist für einen produktiv Einsatz zu ändern
mittels Umgebungsvariablen oder einen secret Manager. Für den Entwicklungsprozess und damit ihr es einfacher nutzen könnt auf eurem rechner ist es einfach angenehmer
-> Die gemoggten User und die dazu vorliegende Authentifizieren ist ohne Passwort. Das ganze soll nur als Beispiel gelten um eben die Anzeigen an User zu verknüpfen. 
Um das mit Luis Benutzerregistrierung zu verbinden müsste man dann viel anpassen
-> Validierungen im Frontend sind größenteils manuell gemachtz
-> Der GlobalExceptionHandler habe ich eher nur mithilfe chatgpt implementiert um genauere Fehler zu bekommen wenn etwas nicht ging. Er könnte aber erweitert werden
um genauere Exceptions zu werfen
-> Genauso wäre mein nächster Schritt die APIs zu dokumentierten mithilfe Swagger oder OpenAPI
-> Meine Frontend Dateien lassen sich ebenso noch weitere aufteilen und besser strukturieren
-> Ebenso gäbe es auch von React mehr Bibliotheken die ich verwenden hätte können. Ich habe aber auch viel manuell gemacht da ich am anfang
viel mit YouTube tutorials gearbeitet habe um eben Dropdowns etc. zu entwerfen











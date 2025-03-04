package com.scharfenort.adsbackend.controller;

import com.scharfenort.adsbackend.dto.CreateAdRequest;
import com.scharfenort.adsbackend.model.Ad;
import com.scharfenort.adsbackend.service.AdService;
import com.scharfenort.adsbackend.service.FileStorageService;
import com.scharfenort.adsbackend.service.VideoProcessingService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller zur Verwaltung von Anzeigen (Ads).
 * <p>
 * Dieser Controller stellt Endpunkte zum Erstellen von Anzeigen, Hochladen von Videos,
 * Abrufen von Anzeigen, Bildern und Videos bereit.
 * <p>
 * Die CORS-Konfiguration erlaubt alle Ursprünge, was in der Entwicklung hilfreich sein kann.
 */
@RestController
@RequestMapping("/api/ads")
@CrossOrigin(origins = "*")
public class AdController {

    private final AdService adService;
    private final VideoProcessingService videoProcessingService;
    private final FileStorageService fileStorageService;

    /**
     * Konstruktor mit Injektion der benötigten Services.
     *
     * @param adService              Service zur Verwaltung der Anzeigen.
     * @param videoProcessingService Service zur Verarbeitung von Video-Uploads.
     * @param fileStorageService     Service zum Speichern und Laden von Bilddateien.
     */
    public AdController(AdService adService,
                        VideoProcessingService videoProcessingService,
                        FileStorageService fileStorageService) {
        this.adService = adService;
        this.videoProcessingService = videoProcessingService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Endpunkt zur Erstellung einer neuen Anzeige.
     * <p>
     * Dieser Endpunkt erwartet einen multipart/form-data Request, der ein {@link CreateAdRequest}
     * DTO enthält. Nach der erfolgreichen Erstellung wird die ID der neuen Anzeige zurückgegeben.
     *
     * @param adRequest DTO mit den erforderlichen Daten zur Anzeigeerstellung.
     * @return ResponseEntity mit Erfolgsmeldung und der ID der erstellten Anzeige.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAd(@ModelAttribute CreateAdRequest adRequest) {
        try {
            Ad createdAd = adService.createAd(adRequest);
            return ResponseEntity.ok("{\"success\": true, \"adId\": " + createdAd.getId() + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Speichern der Anzeige: " + e.getMessage());
        }
    }

    /**
     * Endpunkt zum Hochladen und Verarbeiten eines Videos für eine Anzeige.
     * <p>
     * Dieser Endpunkt akzeptiert ein multipart/form-data Request, das ein Video und die zugehörige Anzeigen-ID enthält.
     *
     * @param videoFile Das hochgeladene Video als MultipartFile.
     * @param adId      Die ID der Anzeige, der das Video zugeordnet werden soll.
     * @return ResponseEntity mit einer Erfolgsmeldung und dem sicheren Dateinamen des Videos.
     */
    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadVideo(@RequestParam("video") MultipartFile videoFile,
                                         @RequestParam("adId") Long adId) {
        try {
            String videoFilename = videoProcessingService.processAndStoreVideo(videoFile, adId);
            return ResponseEntity.ok("{\"success\": true, \"videoFilename\": \"" + videoFilename + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Hochladen oder Verarbeiten des Videos: " + e.getMessage());
        }
    }

    /**
     * Endpunkt zum Abrufen aller gespeicherten Anzeigen.
     *
     * @return Liste aller in der Datenbank gespeicherten Anzeigen.
     */
    @GetMapping
    public List<Ad> getAds() {
        return adService.getAds();
    }

    /**
     * Endpunkt zum Abrufen eines Bildes als Resource.
     *
     * @param filename Der Dateiname des Bildes.
     * @return ResponseEntity mit der Bild-Resource oder einem entsprechenden Fehlerstatus.
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        return fileStorageService.loadImageAsResource(filename);
    }

    /**
     * Endpunkt zum Abrufen eines Videos als Resource.
     * <p>
     * Unterstützt HTTP Range-Requests, um das Streaming von Videos zu ermöglichen.
     *
     * @param filename Der Dateiname des Videos.
     * @param headers  HTTP-Header, die Range-Informationen enthalten können.
     * @return ResponseEntity mit der Video-Resource oder einem entsprechenden Fehlerstatus.
     */
    @GetMapping("/videos/{filename}")
    public ResponseEntity<Resource> getVideo(@PathVariable String filename, @RequestHeader HttpHeaders headers) {
        return videoProcessingService.loadVideoAsResource(filename, headers);
    }
}

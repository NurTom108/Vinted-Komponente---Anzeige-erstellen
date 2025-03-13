package com.scharfenort.adsbackend.controller;

import com.scharfenort.adsbackend.dto.CreateAdRequest;
import com.scharfenort.adsbackend.model.Ad;
import com.scharfenort.adsbackend.service.AdService;
import com.scharfenort.adsbackend.service.VideoProcessingService;
import com.scharfenort.adsbackend.service.AzureBlobStorageService;
import com.scharfenort.adsbackend.service.AzureBlobVideoService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/*
  Einfacher Controller für Anzeigen (Ads).
  Enthält Endpoints zum Erstellen, Abrufen und Löschen von Anzeigen sowie
  zum Hochladen von Videos und Abrufen von SAS-URLs für Bilder und Videos.
 */
@RestController
@RequestMapping("/api/ads")
@CrossOrigin(origins = "*")
public class AdController {

    private static final Logger logger = LoggerFactory.getLogger(AdController.class);

    private final AdService adService;
    private final VideoProcessingService videoProcessingService;
    private final AzureBlobStorageService azureBlobStorageService;
    private final AzureBlobVideoService azureBlobVideoService;

    public AdController(AdService adService,
                        VideoProcessingService videoProcessingService,
                        AzureBlobStorageService azureBlobStorageService,
                        AzureBlobVideoService azureBlobVideoService) {
        this.adService = adService;
        this.videoProcessingService = videoProcessingService;
        this.azureBlobStorageService = azureBlobStorageService;
        this.azureBlobVideoService = azureBlobVideoService;
    }

    // Erstellt eine neue Anzeige. Hier werden die Bilder in Azure hochgeladen und der Benutzer wird aus dem SecurityContext gesetzt.
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createAd(@ModelAttribute CreateAdRequest adRequest, HttpServletRequest request) {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        adRequest.setUserId(userId);

        try {
            Ad createdAd = adService.createAd(adRequest);
            String jsonResponse = "{\"success\": true, \"adId\": " + createdAd.getId() + "}";
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            logger.error("Fehler beim Speichern der Anzeige: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Fehler beim Speichern der Anzeige: " + e.getMessage());
        }
    }

    // Lädt ein Video für eine Anzeige hoch. Das Video wird verarbeitet und in Azure gespeichert. Anschließend wird die URL mit SAS-Token zurückgegeben.
    @PostMapping(value = "/video", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadVideo(@RequestParam("video") MultipartFile videoFile,
                                         @RequestParam("adId") Long adId) {
        try {
            String videoFilename = videoProcessingService.processAndStoreVideo(videoFile, adId);

            String videoUrl = azureBlobVideoService.getVideoUrlWithSasToken(videoFilename);
            String jsonResponse = "{\"success\": true, \"videoUrl\": \"" + videoUrl + "\"}";
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            logger.error("Fehler beim Hochladen des Videos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Fehler beim Hochladen des Videos: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Ad> getAds() {
        return adService.getAds();
    }

    // Holt die SAS-URL eines Bildes anhand des Dateinamens aus Azure Blob Storage.
    @GetMapping("/images/{filename}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        String imageUrl = azureBlobStorageService.getBlobUrlWithSasToken(filename);
        String jsonResponse = "{\"url\": \"" + imageUrl + "\"}";
        return ResponseEntity.ok().body(jsonResponse);
    }

    // Holt die SAS-URL eines Videos anhand des Dateinamens aus Azure Blob Storage.
    @GetMapping("/videos/{filename}")
    public ResponseEntity<?> getVideo(@PathVariable String filename) {
        String videoUrl = azureBlobVideoService.getVideoUrlWithSasToken(filename);
        String jsonResponse = "{\"url\": \"" + videoUrl + "\"}";
        return ResponseEntity.ok().body(jsonResponse);
    }

    // Löscht eine Anzeige. Es wird geprüft, ob der angemeldete Benutzer auch der Eigentümer ist. (In adslist)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAd(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            Ad ad = adService.findAdById(id);
            if (ad == null) {
                return ResponseEntity.status(404).body("Anzeige nicht gefunden");
            }

            if (!ad.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Du darfst nur deine eigenen Anzeigen löschen!");
            }
            adService.deleteAd(id);
            return ResponseEntity.ok("Anzeige erfolgreich gelöscht");
        } catch (Exception e) {
            logger.error("Fehler beim Löschen der Anzeige: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Fehler beim Löschen: " + e.getMessage());
        }
    }
}

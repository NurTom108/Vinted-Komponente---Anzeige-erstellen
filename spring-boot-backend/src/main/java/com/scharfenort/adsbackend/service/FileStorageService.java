package com.scharfenort.adsbackend.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service für das Speichern und Laden von Bilddateien.
 * <p>
 * Dieser Service erstellt die erforderlichen Upload-Verzeichnisse und
 * stellt Methoden zum Speichern einzelner oder mehrerer Bilder sowie zum Laden
 * von Bildern als Resource zur Verfügung.
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    // Der Upload-Pfad wird aus der Application-Properties geladen.
    @Value("${upload.path}")
    private String uploadPath;

    // Maximale Dateigröße für Bilder (5MB)
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    // Erlaubte MIME-Typen für Bilder
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/gif");

    /**
     * Initialisiert die notwendigen Upload-Verzeichnisse, falls sie nicht existieren.
     */
    @PostConstruct
    public void initUploadDirs() {
        try {
            Path mainDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(mainDir);
            logger.info("Upload-Ordner: {}", mainDir);

            Path tempDir = mainDir.resolve("temp");
            Files.createDirectories(tempDir);
            logger.info("Temp-Ordner: {}", tempDir);

            Path videoDir = mainDir.resolve("videos");
            Files.createDirectories(videoDir);
            logger.info("Video-Upload-Ordner: {}", videoDir);
        } catch (IOException e) {
            logger.error("Fehler beim Erstellen der Upload-Verzeichnisse: {}", e.getMessage(), e);
        }
    }

    /**
     * Speichert ein einzelnes Bild und gibt den sicheren Dateinamen zurück.
     *
     * @param file MultipartFile, die das Bild enthält.
     * @return sicher generierter Dateiname.
     * @throws IOException, wenn z. B. die Datei leer ist, den falschen MIME-Typ hat oder zu groß ist.
     */
    public String storeImage(MultipartFile file) throws IOException {
        // Prüfung auf leere Datei
        if (file == null || file.isEmpty()) {
            throw new IOException("Leere Datei.");
        }

        // Prüfung auf unterstützten MIME-Typ
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IOException("Nicht unterstützter Bild-MIME-Typ: " + contentType);
        }

        // Prüfung der Dateigröße
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IOException("Dateigröße überschreitet das Limit (max 5MB).");
        }

        // Bestimme Dateiendung
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "unknown.jpg";
        }
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        // Generiere einen sicheren, eindeutigen Dateinamen
        String safeFilename = UUID.randomUUID().toString() + extension;
        Path destination = Paths.get(uploadPath, safeFilename).normalize();
        Path uploadDirPath = Paths.get(uploadPath).toAbsolutePath().normalize();

        // Sicherheit: Der Zielpfad muss innerhalb des Upload-Ordners liegen
        if (!destination.toAbsolutePath().startsWith(uploadDirPath)) {
            throw new IOException("Ungültiger Dateipfad.");
        }

        // Speichere die Datei
        file.transferTo(destination.toFile());
        logger.info("Bild gespeichert: {}", safeFilename);
        return safeFilename;
    }

    /**
     * Speichert mehrere Bilder und gibt eine Liste der sicheren Dateinamen zurück.
     *
     * @param images Array von MultipartFile-Objekten.
     * @return Liste der Dateinamen, unter denen die Bilder gespeichert wurden.
     * @throws IOException, falls ein Fehler beim Speichern auftritt.
     */
    public List<String> storeImages(MultipartFile[] images) throws IOException {
        List<String> filenames = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    filenames.add(storeImage(file));
                }
            }
        }
        return filenames;
    }

    /**
     * Lädt ein Bild als Resource anhand des Dateinamens.
     *
     * @param filename Dateiname des gespeicherten Bildes.
     * @return ResponseEntity, die die Resource oder einen entsprechenden Fehlerstatus enthält.
     */
    public ResponseEntity<Resource> loadImageAsResource(String filename) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                logger.error("Datei {} existiert nicht.", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                logger.error("Datei {} ist nicht lesbar.", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            logger.error("Fehler beim Laden des Bildes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

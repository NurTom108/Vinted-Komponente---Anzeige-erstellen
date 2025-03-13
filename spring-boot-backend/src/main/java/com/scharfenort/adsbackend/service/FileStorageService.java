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

import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/*
  Überblick: (Wird nicht verwendet da ich auf Cloud umgestiegen bin, ich lasse es trotzdem noch drin für den Fall der Fälle)
  Diese Klasse speichert und lädt Bilddateien.
  Sie richtet beim Start die nötigen Ordner ein, speichert einzelne oder mehrere Bilder,
  und liefert Bilder als Resource zurück, damit sie per HTTP ausgegeben werden können.
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    // noch alt
    @Value("${upload.path}")
    private String uploadPath;
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    // Erlaubte MIME-Typen für Bilder.
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/gif");

    // Für ohne AZURE Microsoft (Lokale Speicherung)
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

    // Speichert ein einzelnes Bild und gibt den sicheren Dateinamen zurück.
    // Es wird geprüft: Datei darf nicht leer sein, MIME-Typ muss passen, Größe muss in Ordnung sein,
    // und der tatsächliche Inhalt (Magic Numbers) muss zu einem unterstützten Bildformat passen.
    public String storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Leere Datei.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IOException("Nicht unterstützter Bild-MIME-Typ: " + contentType);
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IOException("Dateigröße überschreitet das Limit (max 5MB).");
        }

        if (!isValidImageByMagic(file)) {
            throw new IOException("Der Dateiinhalte entspricht nicht einem unterstützten Bildformat.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "unknown.jpg";
        }
        String extension = extractFileExtension(originalFilename);

        // Erzeuge einen sicheren, eindeutigen Dateinamen.
        String safeFilename = UUID.randomUUID().toString() + extension;
        Path destination = Paths.get(uploadPath, safeFilename).normalize();
        Path uploadDirPath = Paths.get(uploadPath).toAbsolutePath().normalize();

        if (!destination.toAbsolutePath().startsWith(uploadDirPath)) {
            throw new IOException("Ungültiger Dateipfad.");
        }
        // Speichere die Datei.
        file.transferTo(destination.toFile());
        logger.info("Bild gespeichert: {}", safeFilename);
        return safeFilename;
    }

    // Speichert mehrere Bilder und gibt eine Liste der sicheren Dateinamen zurück.
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

    // Lädt ein Bild als Resource anhand des Dateinamens.
    // Hier wird überprüft, ob die Datei existiert und lesbar ist, und der richtige Content-Type wird ermittelt.
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

    // Prüft anhand der ersten 8 Bytes (Magic Numbers), ob die Datei zu JPEG, PNG oder GIF gehört.
    private boolean isValidImageByMagic(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = is.read(header);
            if (bytesRead < 8) {
                return false;
            }
            // JPEG: Beginnt mit 0xFF 0xD8.
            if (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) {
                return true;
            }
            // PNG: 89 50 4E 47 0D 0A 1A 0A.
            if (header[0] == (byte) 0x89 &&
                    header[1] == 0x50 &&
                    header[2] == 0x4E &&
                    header[3] == 0x47 &&
                    header[4] == 0x0D &&
                    header[5] == 0x0A &&
                    header[6] == 0x1A &&
                    header[7] == 0x0A) {
                return true;
            }
            // GIF: "GIF87a" oder "GIF89a".
            if (header[0] == 'G' && header[1] == 'I' && header[2] == 'F' &&
                    header[3] == '8' && (header[4] == '7' || header[4] == '9') &&
                    header[5] == 'a') {
                return true;
            }
            return false;
        }
    }

    // Extrahiert die Dateiendung aus dem Originaldateinamen.
    private String extractFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf(".");
        return (dotIndex > 0) ? filename.substring(dotIndex) : "";
    }
}

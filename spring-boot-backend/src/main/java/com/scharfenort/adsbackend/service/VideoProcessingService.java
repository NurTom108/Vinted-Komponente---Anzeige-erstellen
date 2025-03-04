package com.scharfenort.adsbackend.service;

import com.scharfenort.adsbackend.model.Ad;
import com.scharfenort.adsbackend.model.Video;
import com.scharfenort.adsbackend.repository.AdRepository;
import com.scharfenort.adsbackend.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Service zur Verarbeitung und Speicherung von Video-Uploads.
 * <p>
 * Dieser Service übernimmt:
 * <ul>
 *   <li>Validierung und Speicherung des Originalvideos</li>
 *   <li>Konvertierung des Videos in 720p und 1080p</li>
 *   <li>Bereitstellung der Video-Dateien als Resource (inklusive Unterstützung von Range-Requests)</li>
 *   <li>Verknüpfung des Videos mit einer Anzeige (Ad)</li>
 * </ul>
 */
@Service
public class VideoProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(VideoProcessingService.class);

    @Value("${upload.path}")
    private String uploadPath;

    // Maximale Dateigröße für Videos: 50MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;

    private final VideoRepository videoRepository;
    private final AdRepository adRepository;

    public VideoProcessingService(VideoRepository videoRepository, AdRepository adRepository) {
        this.videoRepository = videoRepository;
        this.adRepository = adRepository;
    }

    /**
     * Validiert, speichert und verarbeitet das hochgeladene Video für eine Anzeige (Ad).
     *
     * @param videoFile das hochgeladene Video als MultipartFile.
     * @param adId      die ID der zugehörigen Anzeige.
     * @return den sicheren Dateinamen des Originalvideos.
     * @throws Exception wenn das Video ungültig ist, die Größe überschreitet oder ein Fehler während der Verarbeitung auftritt.
     */
    public String processAndStoreVideo(MultipartFile videoFile, Long adId) throws Exception {
        // Prüfe, ob die hochgeladene Datei ein Video ist
        if (videoFile.getContentType() == null || !videoFile.getContentType().startsWith("video/")) {
            throw new Exception("Die hochgeladene Datei ist kein Video.");
        }

        // Prüfe die Dateigröße
        if (videoFile.getSize() > MAX_VIDEO_SIZE) {
            throw new Exception("Videodateigröße überschreitet das Limit (max 50MB).");
        }

        // Hole die zugehörige Anzeige oder werfe eine Exception, falls sie nicht existiert
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new Exception("Anzeige mit der angegebenen ID wurde nicht gefunden."));

        // Erzeuge einen sicheren Dateinamen basierend auf dem Originalnamen
        String safeFilename = generateSafeFilename(videoFile.getOriginalFilename(), "mp4");

        // Definiere das Video-Verzeichnis und stelle sicher, dass es existiert
        Path videoDir = Paths.get(uploadPath, "videos").normalize();
        Files.createDirectories(videoDir);

        // Definiere den Zielpfad und überprüfe, dass er innerhalb des Upload-Verzeichnisses liegt
        Path destination = videoDir.resolve(safeFilename).normalize();
        if (!destination.toAbsolutePath().startsWith(videoDir.toAbsolutePath())) {
            throw new Exception("Ungültiger Dateipfad für Video.");
        }

        // Speichere das Originalvideo
        videoFile.transferTo(destination.toFile());

        // Bestimme Dateinamen für die konvertierten Versionen
        String output720pFilename = "720p-" + safeFilename;
        String output1080pFilename = "1080p-" + safeFilename;
        Path output720pPath = videoDir.resolve(output720pFilename);
        Path output1080pPath = videoDir.resolve(output1080pFilename);

        // Verarbeite das Video (Konvertierung in 720p und 1080p)
        processVideo(destination.toFile(), output720pPath.toString(), output1080pPath.toString());

        // Erstelle und speichere das Video-Entity, verknüpfe es mit der Anzeige und speichere die Anzeige
        Video video = new Video(safeFilename, output720pFilename, output1080pFilename, ad);
        videoRepository.save(video);
        ad.setVideo(video);
        adRepository.save(ad);

        return safeFilename;
    }

    /**
     * Lädt ein Video als Resource und unterstützt HTTP Range-Requests.
     *
     * @param filename der Dateiname des Videos.
     * @param headers  die HTTP-Header, die Range-Informationen enthalten können.
     * @return ResponseEntity mit der Video-Resource oder einem entsprechenden HTTP-Fehlerstatus.
     */
    public ResponseEntity<Resource> loadVideoAsResource(String filename, HttpHeaders headers) {
        try {
            Path videoPath = Paths.get(uploadPath, "videos", filename).normalize();
            if (!Files.exists(videoPath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            long fileLength = Files.size(videoPath);
            List<HttpRange> httpRanges = headers.getRange();
            String contentType = Files.probeContentType(videoPath);
            if (contentType == null || contentType.equals("application/octet-stream")) {
                contentType = "video/mp4";
            }

            // Wenn keine Range-Anfrage vorliegt, liefere die gesamte Datei
            if (httpRanges == null || httpRanges.isEmpty()) {
                Resource resource = new UrlResource(videoPath.toUri());
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .contentLength(fileLength)
                        .body(resource);
            } else {
                // Verarbeite die Range-Anfrage
                HttpRange range = httpRanges.get(0);
                long start = range.getRangeStart(fileLength);
                long end = range.getRangeEnd(fileLength);
                long rangeLength = end - start + 1;
                try (InputStream inputStream = new BufferedInputStream(new FileInputStream(videoPath.toFile()))) {
                    inputStream.skip(start);
                    byte[] data = new byte[(int) rangeLength];
                    int bytesRead = inputStream.read(data, 0, (int) rangeLength);
                    if (bytesRead < rangeLength) {
                        logger.warn("Gelesene Bytezahl ({}) ist geringer als erwartet ({})", bytesRead, rangeLength);
                    }
                    ByteArrayResource byteResource = new ByteArrayResource(data);
                    return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                            .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileLength)
                            .contentType(MediaType.parseMediaType(contentType))
                            .contentLength(rangeLength)
                            .body(byteResource);
                }
            }
        } catch (MalformedURLException e) {
            logger.error("Ungültige URL: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            logger.error("Fehler beim Laden des Videos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Führt die Konvertierung eines Videos in 720p und 1080p durch.
     *
     * @param inputFile    die Originalvideodatei.
     * @param output720p   Pfad für die 720p-Ausgabe.
     * @param output1080p  Pfad für die 1080p-Ausgabe.
     * @throws IOException          wenn während der Verarbeitung ein Fehler auftritt.
     * @throws InterruptedException wenn der Prozess unterbrochen wird.
     */
    private void processVideo(File inputFile, String output720p, String output1080p) throws IOException, InterruptedException {
        // 720p-Konvertierung
        ProcessBuilder pb720p = new ProcessBuilder(
                "ffmpeg", "-y", "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=-2:720",
                "-c:v", "libx264", "-crf", "23", "-preset", "medium",
                "-c:a", "aac", "-b:a", "128k",
                output720p
        );
        Process process720p = pb720p.start();
        logProcessErrors(process720p, "720p");
        int exitCode720p = process720p.waitFor();
        if (exitCode720p != 0) {
            throw new IOException("Fehler bei der 720p-Konvertierung (ExitCode=" + exitCode720p + ")");
        }

        // 1080p-Konvertierung
        ProcessBuilder pb1080p = new ProcessBuilder(
                "ffmpeg", "-y", "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=-2:1080",
                "-c:v", "libx264", "-crf", "23", "-preset", "medium",
                "-c:a", "aac", "-b:a", "128k",
                output1080p
        );
        Process process1080p = pb1080p.start();
        logProcessErrors(process1080p, "1080p");
        int exitCode1080p = process1080p.waitFor();
        if (exitCode1080p != 0) {
            throw new IOException("Fehler bei der 1080p-Konvertierung (ExitCode=" + exitCode1080p + ")");
        }
    }

    /**
     * Liest und loggt den Fehler-Stream eines Prozesses.
     *
     * @param process der Prozess, dessen Fehler-Stream gelesen wird.
     * @param label   ein Label (z. B. "720p" oder "1080p"), um den Prozess zu identifizieren.
     * @throws IOException wenn beim Lesen des Streams ein Fehler auftritt.
     */
    private void logProcessErrors(Process process, String label) throws IOException {
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = errorReader.readLine()) != null) {
                logger.error("FFmpeg ({}): {}", label, line);
            }
        }
    }

    /**
     * Erzeugt einen sicheren Dateinamen basierend auf einer UUID und der Dateiendung.
     *
     * @param originalFilename der Originaldateiname.
     * @param defaultExtension die Standard-Dateiendung, falls der Originalname nicht verfügbar ist.
     * @return ein sicher generierter Dateiname.
     */
    private String generateSafeFilename(String originalFilename, String defaultExtension) {
        String extension = defaultExtension != null ? "." + defaultExtension : "";
        if (originalFilename != null && !originalFilename.isEmpty()) {
            int dotIndex = originalFilename.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }
        }
        return UUID.randomUUID().toString() + extension;
    }
}

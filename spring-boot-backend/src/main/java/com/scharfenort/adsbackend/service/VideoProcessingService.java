package com.scharfenort.adsbackend.service;

import com.scharfenort.adsbackend.model.Ad;
import com.scharfenort.adsbackend.model.Video;
import com.scharfenort.adsbackend.repository.AdRepository;
import com.scharfenort.adsbackend.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/*
  Überblick:
  Dieser Service verarbeitet und konvertiert Videodateien.
  Er überprüft und speichert das hochgeladene Video, lädt es in Azure Blob Storage hoch,
  startet die asynchrone Konvertierung in 720p und 1080p via ffmpeg, (asynchron sprich man muss nicht warten)
  lädt die konvertierten Videos hoch und aktualisiert das Video-Entity.
  Außerdem liefert er ein Endpoint, um Videos (inklusive Range-Requests) als Resource bereitzustellen.
 */
@Service
public class VideoProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(VideoProcessingService.class);

    @Value("${upload.path}")
    private String uploadPath;

    // Maximale erlaubt Dateigröße für Videos: 50MB.
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;

    private final VideoRepository videoRepository;
    private final AdRepository adRepository;
    private final AzureBlobVideoService azureBlobVideoService;

    // Konstruktor: Reicht die Repositories und den Azure-Video-Service rein.
    public VideoProcessingService(VideoRepository videoRepository,
                                  AdRepository adRepository,
                                  AzureBlobVideoService azureBlobVideoService) {
        this.videoRepository = videoRepository;
        this.adRepository = adRepository;
        this.azureBlobVideoService = azureBlobVideoService;
    }

    // Validiert das hochgeladene Video, speichert es temporär lokal und startet die asynchrone Konvertierung.
    // Dabei wird das Originalvideo sowie die konvertierten Versionen (720p und 1080p) in Azure Blob Storage hochgeladen.
    public String processAndStoreVideo(MultipartFile videoFile, Long adId) throws Exception {
        // Ist die Datei wirklich ein Video?
        if (videoFile.getContentType() == null || !videoFile.getContentType().startsWith("video/")) {
            throw new Exception("Die hochgeladene Datei ist kein Video.");
        }

        if (videoFile.getSize() > MAX_VIDEO_SIZE) {
            throw new Exception("Videodateigröße überschreitet das Limit (max 50MB).");
        }

        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new Exception("Anzeige mit der angegebenen ID wurde nicht gefunden."));

        // Dateinamen wählen
        String safeFilename = generateSafeFilename(videoFile.getOriginalFilename(), "mp4");

        Path baseUploadDir = Paths.get(System.getProperty("user.dir"), uploadPath).normalize();
        Path videoDir = baseUploadDir.resolve("videos");
        Files.createDirectories(videoDir);

        Path localDestination = videoDir.resolve(safeFilename).normalize();
        if (!localDestination.toAbsolutePath().startsWith(videoDir.toAbsolutePath())) {
            throw new Exception("Ungültiger Dateipfad für Video.");
        }

        // Speichere das Originalvideo lokal temporär
        videoFile.transferTo(localDestination.toFile());

        // hochladen
        String azureOriginalFilename = azureBlobVideoService.uploadVideoFromLocalFile(localDestination.toString(), safeFilename);

        String output720pFilename = "720p-" + safeFilename;
        String output1080pFilename = "1080p-" + safeFilename;

        // Video-Entity mit dem Azure Dateinamen und speichern
        Video video = new Video(azureOriginalFilename, null, null, ad);
        videoRepository.save(video);
        ad.setVideo(video);
        adRepository.save(ad);

        convertVideoAsync(localDestination.toFile(), video.getId(), videoDir, output720pFilename, output1080pFilename);
        return azureOriginalFilename;
    }

    // Führt die Videokonvertierung asynchron durch.
    // Nach der Konvertierung werden die Dateien in Azure hochgeladen und das Video-Entity aktualisiert.
    @Async
    public void convertVideoAsync(File inputFile, Long videoId, Path videoDir,
                                  String output720pFilename, String output1080pFilename) {
        Path output720pPath = videoDir.resolve(output720pFilename);
        Path output1080pPath = videoDir.resolve(output1080pFilename);
        try {
            processVideo(inputFile, output720pPath.toString(), output1080pPath.toString());

            String azure720pFilename = azureBlobVideoService.uploadVideoFromLocalFile(output720pPath.toString(), output720pFilename);
            String azure1080pFilename = azureBlobVideoService.uploadVideoFromLocalFile(output1080pPath.toString(), output1080pFilename);

            // Aktualisiert das Video-Entity in der DB.
            Video video = videoRepository.findById(videoId).orElse(null);
            if (video != null) {
                video.setPath720p(azure720pFilename);
                video.setPath1080p(azure1080pFilename);
                videoRepository.save(video);
            }
        } catch (Exception e) {
            logger.error("Fehler bei der asynchronen Videokonvertierung: {}", e.getMessage(), e);
        } finally {
            deleteFileQuietly(inputFile.toPath());
            deleteFileQuietly(output720pPath);
            deleteFileQuietly(output1080pPath);
        }
    }

    // Stellt ein Video als Resource bereit, unterstützt Range-Requests.
    public ResponseEntity<Resource> loadVideoAsResource(String filename, HttpHeaders headers) {
        try {
            Resource resource = azureBlobVideoService.downloadVideo(filename);
            long fileLength = resource.contentLength();
            String contentType = "video/mp4";

            // Falls keine Range-Informationen angefordert werden, liefere das gesamte Video.
            if (headers.getRange() == null || headers.getRange().isEmpty()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .contentLength(fileLength)
                        .body(resource);
            } else {
                // Andernfalls liefer nur den angeforderten teil.
                HttpRange range = headers.getRange().get(0);
                long start = range.getRangeStart(fileLength);
                long end = range.getRangeEnd(fileLength);
                long rangeLength = end - start + 1;
                try (InputStream inputStream = resource.getInputStream()) {
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

    // Führt die Konvertierung des Videos in 720p und 1080p durch, indem ffmpeg verwendet wird.
    private void processVideo(File inputFile, String output720p, String output1080p) throws IOException, InterruptedException {
        ProcessBuilder pb720p = createFfmpegProcess(inputFile, output720p, 720);
        Process process720p = pb720p.start();
        logProcessErrors(process720p, "720p");
        int exitCode720p = process720p.waitFor();
        if (exitCode720p != 0) {
            throw new IOException("Fehler bei der 720p-Konvertierung (ExitCode=" + exitCode720p + ")");
        }
        ProcessBuilder pb1080p = createFfmpegProcess(inputFile, output1080p, 1080);
        Process process1080p = pb1080p.start();
        logProcessErrors(process1080p, "1080p");
        int exitCode1080p = process1080p.waitFor();
        if (exitCode1080p != 0) {
            throw new IOException("Fehler bei der 1080p-Konvertierung (ExitCode=" + exitCode1080p + ")");
        }
    }

    // Erzeugt einen ProcessBuilder für ffmpeg, um das Video in die gewünschte Auflösung zu konvertieren.
    private ProcessBuilder createFfmpegProcess(File inputFile, String outputPath, int height) {
        return new ProcessBuilder(
                "ffmpeg", "-y",
                "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=-2:" + height,
                "-c:v", "libx264", "-crf", "23", "-preset", "medium",
                "-c:a", "aac", "-b:a", "128k",
                outputPath
        );
    }

    //
    private void logProcessErrors(Process process, String label) throws IOException {
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = errorReader.readLine()) != null) {
                logger.error("FFmpeg ({}): {}", label, line);
            }
        }
    }

    // Generiert einen sicheren Dateinamen basierend auf einer UUID und der Dateiendung.
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

    // Löscht eine Datei still, loggt aber Fehler, falls etwas schiefgeht (zum testen)
    private void deleteFileQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ioException) {
            logger.warn("Fehler beim Löschen der temporären Datei {}: {}", path, ioException.getMessage());
        }
    }
}

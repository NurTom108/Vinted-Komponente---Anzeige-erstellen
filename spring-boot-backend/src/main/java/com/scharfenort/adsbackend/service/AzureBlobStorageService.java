package com.scharfenort.adsbackend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/*
  Überblick:
  Dieser Service verwaltet den Dateiupload in Azure Blob Storage.
  Er lädt bilder hoch und generiert eine URL mit SAS-Token,
  über die die Dateien sicher abgerufen werden können.

  In echten Anwendung sollten SAS-Tokens und die Storage-URL
  nicht hartkodiert werden, sondern extern konfiguriert sein.
 */
@Service
public class AzureBlobStorageService {

    private final BlobServiceClient blobServiceClient;

    @Value("${azure.storage.container}")
    private String containerName;

    // Sollten extern konfiguriert werden
    private static final String SAS_TOKEN = "sp=r&st=2025-03-08T10:51:43Z&se=2025-11-14T18:51:43Z&spr=https&sv=2022-11-02&sr=c&sig=MYe90LNDic0r97eXILF2ohx%2BdRQawdBa1TyPLsz0%2Bj0%3D";
    private static final String STORAGE_URL = "https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/";

    public AzureBlobStorageService(BlobServiceClient blobServiceClient) {
        this.blobServiceClient = blobServiceClient;
    }

    // Lädt ein Bild in den Azure Blob Storage hoch.
    // Dabei wird überprüft, ob der Container existiert, und falls nicht, wird er erstellt.
    // Ein sicherer Dateiname wird generiert und der Content-Type gesetzt.
    public String uploadFile(MultipartFile file) throws IOException {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.create();
        }

        // Erzeuge einen sicheren Dateinamen
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
        String fileName = UUID.randomUUID().toString() + "_" + originalFilename;

        BlobClient blobClient = containerClient.getBlobClient(fileName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        // Setzt Type (z.B. image/jpeg, image/png)
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(file.getContentType());
        blobClient.setHttpHeaders(headers);

        return fileName;
    }

    public void deleteFile(String fileName) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(fileName);
        if (blobClient.exists()) {
            blobClient.delete();
        }
    }

    // Generiert die vollständige URL einer hochgeladenen Datei inklusive SAS-Token.
    public String getBlobUrlWithSasToken(String fileName) {
        return STORAGE_URL + fileName + "?" + SAS_TOKEN;
    }
}

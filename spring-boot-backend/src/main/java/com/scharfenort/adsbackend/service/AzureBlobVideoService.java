package com.scharfenort.adsbackend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;

/*
  Überblick:
  Dieser Service kümmert sich um Video-Dateien in Azure Blob Storage.
  Er lädt Videos hoch, stellt sie als Resource bereit und erstellt sichere URLs
  mit SAS-Token, damit man die Videos abrufen kann.

  Im productive sollten SAS-Tokens und Storage-URLs extern konfiguriert werden.
 */
@Service
public class AzureBlobVideoService {

    private final BlobServiceClient blobServiceClient;

    @Value("${azure.storage.container}")
    private String videoContainerName;

    // Diese Werte sollten nicht fest im Code stehen – wiue gesagt besser extern konfigurieren
    private static final String SAS_TOKEN = "sp=r&st=2025-03-08T10:51:43Z&se=2025-11-14T18:51:43Z&spr=https&sv=2022-11-02&sr=c&sig=MYe90LNDic0r97eXILF2ohx%2BdRQawdBa1TyPLsz0%2Bj0%3D";
    private static final String STORAGE_URL = "https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/";

    // Konstruktor: BlobServiceClient wird hier reingereicht.
    public AzureBlobVideoService(BlobServiceClient blobServiceClient) {
        this.blobServiceClient = blobServiceClient;
    }

    // Lädt ein Video von einem lokalen Pfad in Azure hoch.
    // Falls der Container nicht existiert, wird er erstellt.
    // Der Content-Type wird auf "video/mp4" gesetzt.
    public String uploadVideoFromLocalFile(String localFilePath, String fileName) throws IOException {
        // Hole den Container-Client für unseren Container
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(videoContainerName);
        if (!containerClient.exists()) {
            containerClient.create();
        }
        BlobClient blobClient = containerClient.getBlobClient(fileName);
        blobClient.uploadFromFile(localFilePath, true);
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType("video/mp4");
        blobClient.setHttpHeaders(headers);
        return fileName;
    }

    // Erstellt eine vollständige URL für das Video inklusive SAS-Token
    public String getVideoUrlWithSasToken(String fileName) {
        return STORAGE_URL + fileName + "?" + SAS_TOKEN;
    }

    // Lädt ein Video als Resource aus Azure Blob Storage.
    // Wenn das Video nicht existiert oder die URL ungültig ist, wird eine RuntimeException geworfen.
    public Resource downloadVideo(String fileName) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(videoContainerName);
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        if (!blobClient.exists()) {
            throw new RuntimeException("Video nicht gefunden: " + fileName);
        }

        try {
            return new UrlResource(blobClient.getBlobUrl());
        } catch (MalformedURLException e) {
            throw new RuntimeException("Ungültige URL für Video: " + fileName, e);
        }
    }

    public void deleteVideo(String fileName) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(videoContainerName);
        BlobClient blobClient = containerClient.getBlobClient(fileName);
        if (blobClient.exists()) {
            blobClient.delete();
        }
    }
}

package com.scharfenort.adsbackend.config;

import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Kurzer Überblick:
// Diese Klasse erstelt einen BlobServiceClient, der den Zugriff auf den Azure Blob Storage ermöglicht.
// Der Connection-String wird aus den Anwendungseinstellungen geladen, und der erstellte Client wird
// in anderen Komponente genutzt um Dateien hoch oder herunterzuladen.

@Configuration
public class AzureBlobStorageConfig {

    // Hier wird der Connection-String aus application.properties geladen.
    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Bean
    public BlobServiceClient blobServiceClient() {
        return new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }
}

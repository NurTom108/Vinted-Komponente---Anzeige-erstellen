package com.scharfenort.adsbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scharfenort.adsbackend.dto.CreateAdRequest;
import com.scharfenort.adsbackend.model.*;
import com.scharfenort.adsbackend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Service zur Verarbeitung von Anzeigen (Ads).
 * <p>
 * Dieser Service übernimmt:
 * <ul>
 *   <li>Speicherung von Bildern (über FileStorageService)</li>
 *   <li>Umwandlung von JSON-Daten (Versandanbieter) in ein Set</li>
 *   <li>Erstellung der Hauptanzeige (Ad)</li>
 *   <li>Kategoriespezifische Verarbeitung und Speicherung der zugehörigen Sub-Entitäten</li>
 * </ul>
 */
@Service
public class AdService {

    private static final Logger logger = LoggerFactory.getLogger(AdService.class);

    private final AdRepository adRepository;
    private final AdClothingRepository adClothingRepository;
    private final AdElectronicsRepository adElectronicsRepository;
    private final AdFurnitureRepository adFurnitureRepository;
    private final AdAccessoriesRepository adAccessoriesRepository;
    private final AdHouseholdRepository adHouseholdRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    public AdService(AdRepository adRepository,
                     AdClothingRepository adClothingRepository,
                     AdElectronicsRepository adElectronicsRepository,
                     AdFurnitureRepository adFurnitureRepository,
                     AdAccessoriesRepository adAccessoriesRepository,
                     AdHouseholdRepository adHouseholdRepository,
                     FileStorageService fileStorageService) {
        this.adRepository = adRepository;
        this.adClothingRepository = adClothingRepository;
        this.adElectronicsRepository = adElectronicsRepository;
        this.adFurnitureRepository = adFurnitureRepository;
        this.adAccessoriesRepository = adAccessoriesRepository;
        this.adHouseholdRepository = adHouseholdRepository;
        this.fileStorageService = fileStorageService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Erstellt eine neue Anzeige basierend auf den übergebenen Request-Daten.
     * <p>
     * Dabei werden:
     * <ul>
     *   <li>Die Bilder gespeichert und deren Dateinamen als JSON-String abgelegt.</li>
     *   <li>Die Versandanbieter (als JSON-String) in ein Set umgewandelt.</li>
     *   <li>Die Hauptanzeige erstellt und in der Datenbank gespeichert.</li>
     *   <li>Kategoriespezifische Sub-Entitäten erzeugt und gespeichert.</li>
     * </ul>
     *
     * @param request der CreateAdRequest mit allen notwendigen Feldern.
     * @return das erstellte Ad-Objekt.
     * @throws Exception falls ein Fehler während der Verarbeitung auftritt.
     */
    public Ad createAd(CreateAdRequest request) throws Exception {
        logger.info("Neue Anzeige wird erstellt...");

        // Speichere die Bilder und wandle die Liste in einen JSON-String um
        List<String> imageFilenames = fileStorageService.storeImages(request.getImages());
        String imagePathsJson = objectMapper.writeValueAsString(imageFilenames);
        logger.info("Gespeicherte Bildpfade: {}", imagePathsJson);

        // Versandanbieter (JSON) in ein Set umwandeln, falls vorhanden
        Set<String> shippingProviders = new HashSet<>();
        if (request.getShippingProviders() != null && !request.getShippingProviders().isEmpty()) {
            shippingProviders = objectMapper.readValue(request.getShippingProviders(), new TypeReference<Set<String>>() {});
        }

        // Erstelle die Hauptanzeige
        Ad ad = new Ad(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategory(),
                request.getCondition(),
                request.getShippingMethod(),
                request.getPaymentMethod(),
                imagePathsJson,
                shippingProviders
        );
        adRepository.save(ad);
        logger.info("Anzeige erfolgreich gespeichert: ID = {}", ad.getId());

        // Führe kategoriespezifische Verarbeitung aus
        switch (request.getCategory()) {
            case "Kleidung":
                AdClothing clothing = new AdClothing(ad, request.getClothingSize(), request.getClothingBrand(), request.getClothingMaterial());
                adClothingRepository.save(clothing);
                break;
            case "Elektronik":
                AdElectronics electronics = new AdElectronics(ad, request.getElectronicDeviceType(), request.getElectronicOS(), request.getElectronicWarranty());
                adElectronicsRepository.save(electronics);
                break;
            case "Möbel":
                AdFurniture furniture = new AdFurniture(ad, request.getFurnitureStyle(), request.getFurnitureDimensions());
                adFurnitureRepository.save(furniture);
                break;
            case "Accessoires":
                AdAccessories accessories = new AdAccessories(ad, request.getAccessoryType());
                adAccessoriesRepository.save(accessories);
                break;
            case "Haushaltsgeräte":
                AdHousehold household = new AdHousehold(ad, request.getApplianceEnergy(), request.getApplianceBrand());
                adHouseholdRepository.save(household);
                break;
            default:
                logger.warn("Unbekannte Kategorie: {}", request.getCategory());
                break;
        }
        return ad;
    }

    /**
     * Liefert eine Liste aller gespeicherten Anzeigen.
     *
     * @return Liste aller Ads.
     */
    public List<Ad> getAds() {
        return adRepository.findAll();
    }
}

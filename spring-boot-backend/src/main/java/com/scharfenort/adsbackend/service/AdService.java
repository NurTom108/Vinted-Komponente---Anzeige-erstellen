package com.scharfenort.adsbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scharfenort.adsbackend.dto.CreateAdRequest;
import com.scharfenort.adsbackend.model.Ad;
import com.scharfenort.adsbackend.model.AdAccessories;
import com.scharfenort.adsbackend.model.AdClothing;
import com.scharfenort.adsbackend.model.AdElectronics;
import com.scharfenort.adsbackend.model.AdFurniture;
import com.scharfenort.adsbackend.model.AdHousehold;
import com.scharfenort.adsbackend.model.Video;
import com.scharfenort.adsbackend.repository.AdAccessoriesRepository;
import com.scharfenort.adsbackend.repository.AdClothingRepository;
import com.scharfenort.adsbackend.repository.AdElectronicsRepository;
import com.scharfenort.adsbackend.repository.AdFurnitureRepository;
import com.scharfenort.adsbackend.repository.AdHouseholdRepository;
import com.scharfenort.adsbackend.repository.AdRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/*
  Überblick:
  Dieser Service kümmert sich um die Verarbeitung von Anzeigen (Ads).
  Er lädt Bilder hoch, wandelt JSON-Daten zu Sets um, speichert die Anzeige in der DB
  und verarbeitet kategoriespezifische Zusatzinfos (wie Kleidung, Elektronik etc.).
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
    private final AzureBlobStorageService azureBlobStorageService;
    private final AzureBlobVideoService azureBlobVideoService;
    private final ObjectMapper objectMapper;

    // Konstruktor: Alle benötigten Repositories und Services werden injiziert.
    public AdService(AdRepository adRepository,
                     AdClothingRepository adClothingRepository,
                     AdElectronicsRepository adElectronicsRepository,
                     AdFurnitureRepository adFurnitureRepository,
                     AdAccessoriesRepository adAccessoriesRepository,
                     AdHouseholdRepository adHouseholdRepository,
                     AzureBlobStorageService azureBlobStorageService,
                     AzureBlobVideoService azureBlobVideoService) {
        this.adRepository = adRepository;
        this.adClothingRepository = adClothingRepository;
        this.adElectronicsRepository = adElectronicsRepository;
        this.adFurnitureRepository = adFurnitureRepository;
        this.adAccessoriesRepository = adAccessoriesRepository;
        this.adHouseholdRepository = adHouseholdRepository;
        this.azureBlobStorageService = azureBlobStorageService;
        this.azureBlobVideoService = azureBlobVideoService;
        this.objectMapper = new ObjectMapper();
    }

    // Erstellt eine Anzeige basierend auf den übergebenen Daten.
    // 1. Bilder werden hochgeladen und als JSON gespeichert.
    // 2. Versandanbieter werden vom JSON-String in ein Set umgewandelt.
    // 3. Hauptanzeige wird erstellt und in der DB gespeichert.
    // 4. Je nach Kategorie werden zusätzliche Infos verarbeitet und gespeichert.
    public Ad createAd(CreateAdRequest request) throws Exception {
        logger.info("Neue Anzeige wird erstellt...");

        List<String> imageFilenames = uploadImages(request.getImages());
        String imagePathsJson = objectMapper.writeValueAsString(imageFilenames);
        logger.info("Gespeicherte Bildpfade: {}", imagePathsJson);

        Set<String> shippingProviders = parseShippingProviders(request.getShippingProviders());

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
        ad.setUserId(request.getUserId());
        adRepository.save(ad);
        logger.info("Anzeige erfolgreich gespeichert: ID = {}", ad.getId());

        processCategorySpecificData(ad, request);

        return ad;
    }


    // Geht jedes Bild durch und lädt es hoch, sofern es nicht leer ist.
    private List<String> uploadImages(MultipartFile[] images) throws Exception {
        List<String> filenames = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String uploadedFileName = azureBlobStorageService.uploadFile(file);
                    filenames.add(uploadedFileName);
                }
            }
        }
        return filenames;
    }

    // Wandelt den JSON-String der Versandanbieter in ein Set um.
    private Set<String> parseShippingProviders(String shippingProvidersJson) throws Exception {
        if (shippingProvidersJson != null && !shippingProvidersJson.isEmpty()) {
            return objectMapper.readValue(shippingProvidersJson, new TypeReference<Set<String>>() {});
        }
        return new HashSet<>();
    }

    // Verarbeitet und speichert kategoriespezifische Zusatzinfos.
    private void processCategorySpecificData(Ad ad, CreateAdRequest request) {
        String category = request.getCategory();
        switch (category) {
            case "Kleidung":
                saveAdClothing(ad, request);
                break;
            case "Elektronik":
                saveAdElectronics(ad, request);
                break;
            case "Möbel":
                saveAdFurniture(ad, request);
                break;
            case "Accessoires":
                saveAdAccessories(ad, request);
                break;
            case "Haushaltsgeräte":
                saveAdHousehold(ad, request);
                break;
            default:
                logger.warn("Unbekannte Kategorie: {}", category);
                break;
        }
    }

    // Speichert zusätzliche Infos für Kleidung.
    private void saveAdClothing(Ad ad, CreateAdRequest request) {
        AdClothing clothing = new AdClothing(
                ad,
                request.getClothingSize(),
                request.getClothingBrand(),
                request.getClothingMaterial()
        );
        adClothingRepository.save(clothing);
    }

    // Speichert zusätzliche Infos für Elektronik.
    private void saveAdElectronics(Ad ad, CreateAdRequest request) {
        AdElectronics electronics = new AdElectronics(
                ad,
                request.getElectronicDeviceType(),
                request.getElectronicOS(),
                request.getElectronicWarranty()
        );
        adElectronicsRepository.save(electronics);
    }

    // Speichert zusätzliche Infos für Möbel.
    private void saveAdFurniture(Ad ad, CreateAdRequest request) {
        AdFurniture furniture = new AdFurniture(
                ad,
                request.getFurnitureStyle(),
                request.getFurnitureDimensions()
        );
        adFurnitureRepository.save(furniture);
    }

    // Speichert zusätzliche Infos für Accessoires.
    private void saveAdAccessories(Ad ad, CreateAdRequest request) {
        AdAccessories accessories = new AdAccessories(
                ad,
                request.getAccessoryType()
        );
        adAccessoriesRepository.save(accessories);
    }

    // Speichert zusätzliche Infos für Haushaltsgeräte.
    private void saveAdHousehold(Ad ad, CreateAdRequest request) {
        AdHousehold household = new AdHousehold(
                ad,
                request.getApplianceEnergy(),
                request.getApplianceBrand()
        );
        adHouseholdRepository.save(household);
    }

    // Sucht eine Anzeige anhand der ID und gibt sie zurück, oder null, wenn sie nicht gefunden wird.
    public Ad findAdById(Long id) {
        return adRepository.findById(id).orElse(null);
    }

    // Löscht eine Anzeige anhand der ID.
    public void deleteAd(Long id) throws Exception {
        Ad ad = findAdById(id);
        if (ad == null) {
            throw new Exception("Anzeige nicht gefunden");
        }
        // Lösche Bilder in Azure
        String imagePathsJson = ad.getImagePaths();
        if (imagePathsJson != null && !imagePathsJson.isEmpty()) {
            List<String> imageFilenames = objectMapper.readValue(imagePathsJson, new TypeReference<List<String>>() {});
            for (String fileName : imageFilenames) {
                azureBlobStorageService.deleteFile(fileName);
            }
        }
        // Lösche zugehörige Videos in Azure, falls vorhanden
        if (ad.getVideo() != null) {
            Video video = ad.getVideo();
            if (video.getOriginalPath() != null) {
                azureBlobVideoService.deleteVideo(video.getOriginalPath());
            }
            if (video.getPath720p() != null) {
                azureBlobVideoService.deleteVideo(video.getPath720p());
            }
            if (video.getPath1080p() != null) {
                azureBlobVideoService.deleteVideo(video.getPath1080p());
            }
        }
        // Lösche die Anzeige aus der Datenbank
        adRepository.delete(ad);
    }

    // Gibt alle Anzeigen aus der Datenbank zurück.
    public List<Ad> getAds() {
        return adRepository.findAll();
    }
}

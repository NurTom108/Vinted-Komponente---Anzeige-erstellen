package com.scharfenort.adsbackend.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonManagedReference;
@Entity
@Table(name = "ads")
public class Ad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;



    private String userId;

    private Double price;
    private String category;
    private String condition;
    private String shippingMethod;
    private String paymentMethod;


    @Column(columnDefinition = "TEXT")
    private String imagePaths;

    // Mehrfachauswahl für Versandanbieter
    @ElementCollection
    @CollectionTable(name = "ad_shipping_providers", joinColumns = @JoinColumn(name = "ad_id"))
    @Column(name = "provider")
    private Set<String> shippingProviders = new HashSet<>();


    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdClothing adClothing;

    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdElectronics adElectronics;

    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdFurniture adFurniture;

    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdAccessories adAccessories;

    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdHousehold adHousehold;

    public Ad() {}

    public Ad(String title, String description, Double price, String category, String condition,
              String shippingMethod, String paymentMethod, String imagePaths, Set<String> shippingProviders) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.condition = condition;
        this.shippingMethod = shippingMethod;
        this.paymentMethod = paymentMethod;
        this.imagePaths = imagePaths;
        this.shippingProviders = shippingProviders;
    }


    @OneToOne(mappedBy = "ad", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Video video;

    public Video getVideo() {
        return video;
    }

    public void setVideo(Video video) {
        this.video = video;
    }


    // Getter und Setter
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public String getCategory() { return category; }
    public String getCondition() { return condition; }
    public String getShippingMethod() { return shippingMethod; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getImagePaths() { return imagePaths; }
    public Set<String> getShippingProviders() { return shippingProviders; }

    public AdClothing getAdClothing() { return adClothing; }
    public AdElectronics getAdElectronics() { return adElectronics; }
    public AdFurniture getAdFurniture() { return adFurniture; }
    public AdAccessories getAdAccessories() { return adAccessories; }
    public AdHousehold getAdHousehold() { return adHousehold; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(Double price) { this.price = price; }
    public void setCategory(String category) { this.category = category; }
    public void setCondition(String condition) { this.condition = condition; }
    public void setShippingMethod(String shippingMethod) { this.shippingMethod = shippingMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setImagePaths(String imagePaths) { this.imagePaths = imagePaths; }
    public void setShippingProviders(Set<String> shippingProviders) { this.shippingProviders = shippingProviders; }

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }


    public void setAdClothing(AdClothing adClothing) { this.adClothing = adClothing; }
    public void setAdElectronics(AdElectronics adElectronics) { this.adElectronics = adElectronics; }
    public void setAdFurniture(AdFurniture adFurniture) { this.adFurniture = adFurniture; }
    public void setAdAccessories(AdAccessories adAccessories) { this.adAccessories = adAccessories; }
    public void setAdHousehold(AdHousehold adHousehold) { this.adHousehold = adHousehold; }
}




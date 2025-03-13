package com.scharfenort.adsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ad_clothing")
public class AdClothing {

    @Id
    private Long adId;

    private String clothingSize;
    private String clothingBrand;
    private String clothingMaterial;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ad_id")
    @JsonIgnore
    private Ad ad;

    public AdClothing() {}

    public AdClothing(Ad ad, String clothingSize, String clothingBrand, String clothingMaterial) {
        this.ad = ad;
        this.clothingSize = clothingSize;
        this.clothingBrand = clothingBrand;
        this.clothingMaterial = clothingMaterial;
    }

    // Getter und Setter
    public Long getAdId() { return adId; }
    public String getClothingSize() { return clothingSize; }
    public String getClothingBrand() { return clothingBrand; }
    public String getClothingMaterial() { return clothingMaterial; }

    public void setClothingSize(String clothingSize) { this.clothingSize = clothingSize; }
    public void setClothingBrand(String clothingBrand) { this.clothingBrand = clothingBrand; }
    public void setClothingMaterial(String clothingMaterial) { this.clothingMaterial = clothingMaterial; }
    public void setAd(Ad ad) { this.ad = ad; }
}

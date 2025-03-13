package com.scharfenort.adsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ad_furniture")
public class AdFurniture {

    @Id
    private Long adId;

    private String furnitureStyle;
    private String furnitureDimensions;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ad_id")
    @JsonIgnore
    private Ad ad;

    public AdFurniture() {}

    public AdFurniture(Ad ad, String furnitureStyle, String furnitureDimensions) {
        this.ad = ad;
        this.furnitureStyle = furnitureStyle;
        this.furnitureDimensions = furnitureDimensions;
    }

    // Getter und Setter
    public Long getAdId() { return adId; }
    public String getFurnitureStyle() { return furnitureStyle; }
    public String getFurnitureDimensions() { return furnitureDimensions; }

    public void setFurnitureStyle(String furnitureStyle) { this.furnitureStyle = furnitureStyle; }
    public void setFurnitureDimensions(String furnitureDimensions) { this.furnitureDimensions = furnitureDimensions; }
    public void setAd(Ad ad) { this.ad = ad; }
}

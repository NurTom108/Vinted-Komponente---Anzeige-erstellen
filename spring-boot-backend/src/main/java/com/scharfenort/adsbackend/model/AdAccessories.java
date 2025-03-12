package com.scharfenort.adsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ad_accessories")
public class AdAccessories {

    @Id
    private Long adId;

    private String accessoryType;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ad_id")
    @JsonIgnore
    private Ad ad;

    public AdAccessories() {}

    public AdAccessories(Ad ad, String accessoryType) {
        this.ad = ad;
        this.accessoryType = accessoryType;
    }

    // Getter und Setter
    public Long getAdId() { return adId; }
    public String getAccessoryType() { return accessoryType; }

    public void setAccessoryType(String accessoryType) { this.accessoryType = accessoryType; }
    public void setAd(Ad ad) { this.ad = ad; }
}

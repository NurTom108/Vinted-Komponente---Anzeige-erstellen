package com.scharfenort.adsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ad_household")
public class AdHousehold {

    @Id
    private Long adId;

    private String applianceEnergy;
    private String applianceBrand;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ad_id")
    @JsonIgnore
    private Ad ad;

    public AdHousehold() {}

    public AdHousehold(Ad ad, String applianceEnergy, String applianceBrand) {
        this.ad = ad;
        this.applianceEnergy = applianceEnergy;
        this.applianceBrand = applianceBrand;
    }

    // Getter und Setter
    public Long getAdId() { return adId; }
    public String getApplianceEnergy() { return applianceEnergy; }
    public String getApplianceBrand() { return applianceBrand; }

    public void setApplianceEnergy(String applianceEnergy) { this.applianceEnergy = applianceEnergy; }
    public void setApplianceBrand(String applianceBrand) { this.applianceBrand = applianceBrand; }
    public void setAd(Ad ad) { this.ad = ad; }
}

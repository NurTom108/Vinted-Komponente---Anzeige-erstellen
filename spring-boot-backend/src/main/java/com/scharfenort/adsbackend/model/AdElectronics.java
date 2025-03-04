package com.scharfenort.adsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "ad_electronics")
public class AdElectronics {

    @Id
    private Long adId;

    private String electronicDeviceType;
    private String electronicOS;
    private String electronicWarranty;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ad_id")
    @JsonIgnore
    private Ad ad;

    public AdElectronics() {}

    public AdElectronics(Ad ad, String electronicDeviceType, String electronicOS, String electronicWarranty) {
        this.ad = ad;
        this.electronicDeviceType = electronicDeviceType;
        this.electronicOS = electronicOS;
        this.electronicWarranty = electronicWarranty;
    }

    // Getter und Setter
    public Long getAdId() { return adId; }
    public String getElectronicDeviceType() { return electronicDeviceType; }
    public String getElectronicOS() { return electronicOS; }
    public String getElectronicWarranty() { return electronicWarranty; }

    public void setElectronicDeviceType(String electronicDeviceType) { this.electronicDeviceType = electronicDeviceType; }
    public void setElectronicOS(String electronicOS) { this.electronicOS = electronicOS; }
    public void setElectronicWarranty(String electronicWarranty) { this.electronicWarranty = electronicWarranty; }
    public void setAd(Ad ad) { this.ad = ad; }
}

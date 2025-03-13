package com.scharfenort.adsbackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Table(name = "videos")
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String originalPath;


    private String path720p;
    private String path1080p;


    private LocalDateTime uploadedAt;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ad_id")
    @JsonBackReference
    private Ad ad;

    public Video() {}

    public Video(String originalPath, String path720p, String path1080p, Ad ad) {
        this.originalPath = originalPath;
        this.path720p = path720p;
        this.path1080p = path1080p;
        this.uploadedAt = LocalDateTime.now();
        this.ad = ad;
    }

    // Getter und Setter...
    public Long getId() { return id; }
    public String getOriginalPath() { return originalPath; }
    public String getPath720p() { return path720p; }
    public String getPath1080p() { return path1080p; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public Ad getAd() { return ad; }

    public void setOriginalPath(String originalPath) { this.originalPath = originalPath; }
    public void setPath720p(String path720p) { this.path720p = path720p; }
    public void setPath1080p(String path1080p) { this.path1080p = path1080p; }
    public void setAd(Ad ad) { this.ad = ad; }
}

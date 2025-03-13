package com.scharfenort.adsbackend.dto;

import org.springframework.web.multipart.MultipartFile;

public class CreateAdRequest {

    private String userId;

    private String title;
    private String description;
    private Double price;
    private String category;
    private String condition;
    private String shippingMethod;
    private String paymentMethod;
    private MultipartFile[] images;


    private String clothingSize;
    private String clothingBrand;
    private String clothingMaterial;


    private String electronicDeviceType;
    private String electronicOS;
    private String electronicWarranty;


    private String furnitureStyle;
    private String furnitureDimensions;


    private String accessoryType;


    private String applianceEnergy;
    private String applianceBrand;


    private String shippingProviders;



    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getShippingMethod() {
        return shippingMethod;
    }

    public void setShippingMethod(String shippingMethod) {
        this.shippingMethod = shippingMethod;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public MultipartFile[] getImages() {
        return images;
    }

    public void setImages(MultipartFile[] images) {
        this.images = images;
    }

    public String getClothingSize() {
        return clothingSize;
    }

    public void setClothingSize(String clothingSize) {
        this.clothingSize = clothingSize;
    }

    public String getClothingBrand() {
        return clothingBrand;
    }

    public void setClothingBrand(String clothingBrand) {
        this.clothingBrand = clothingBrand;
    }

    public String getClothingMaterial() {
        return clothingMaterial;
    }

    public void setClothingMaterial(String clothingMaterial) {
        this.clothingMaterial = clothingMaterial;
    }

    public String getElectronicDeviceType() {
        return electronicDeviceType;
    }

    public void setElectronicDeviceType(String electronicDeviceType) {
        this.electronicDeviceType = electronicDeviceType;
    }

    public String getElectronicOS() {
        return electronicOS;
    }

    public void setElectronicOS(String electronicOS) {
        this.electronicOS = electronicOS;
    }

    public String getElectronicWarranty() {
        return electronicWarranty;
    }

    public void setElectronicWarranty(String electronicWarranty) {
        this.electronicWarranty = electronicWarranty;
    }

    public String getFurnitureStyle() {
        return furnitureStyle;
    }

    public void setFurnitureStyle(String furnitureStyle) {
        this.furnitureStyle = furnitureStyle;
    }

    public String getFurnitureDimensions() {
        return furnitureDimensions;
    }

    public void setFurnitureDimensions(String furnitureDimensions) {
        this.furnitureDimensions = furnitureDimensions;
    }

    public String getAccessoryType() {
        return accessoryType;
    }

    public void setAccessoryType(String accessoryType) {
        this.accessoryType = accessoryType;
    }

    public String getApplianceEnergy() {
        return applianceEnergy;
    }

    public void setApplianceEnergy(String applianceEnergy) {
        this.applianceEnergy = applianceEnergy;
    }

    public String getApplianceBrand() {
        return applianceBrand;
    }

    public void setApplianceBrand(String applianceBrand) {
        this.applianceBrand = applianceBrand;
    }

    public String getShippingProviders() {
        return shippingProviders;
    }

    public void setShippingProviders(String shippingProviders) {
        this.shippingProviders = shippingProviders;
    }

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

}

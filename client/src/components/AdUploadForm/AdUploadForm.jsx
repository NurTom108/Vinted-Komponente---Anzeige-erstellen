// Datei: src/components/AdUploadForm/AdUploadForm.jsx
// Überblick: 
// Diese Komponnte stellt ein mehrstufiges Formular bereit, um eine Anzeige zu erstellen.
// Sie kümmert sich um Basisdaten, Medien (Bilder/Video) und Preis-/Versanddetails.
// Außerdem zeigt sie Feedback (Toast, Progressbar) und ermöglicht Navigation zwischen den Schritten.

import React, { useState } from "react";
import axios from "axios";

import Step1Details from "./Step1Details";
import Step2Media from "./Step2Media";
import Step3PriceShipping from "./Step3PriceShipping";

import ImageCropper from "../ImageCropper/ImageCropper";
import Toast from "../common/Toast";
import Dropdown from "../common/Dropdown";
import MultiSelectDropdown from "../common/MultiSelectDropdown";

import "./AdUploadForm.css"; 

// Base-URL der API – entweder aus der .env oder als Fallback
const API_URL = process.env.REACT_APP_API_URL || "https://localhost:8443";

// Wandelt eine Base64-DataURL in ein Blob um.
// Das Blob wird dann für den Upload des zugeschnittenen Bildes genutzt.
function dataURLtoBlob(dataurl) {
  const [header, base64data] = dataurl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error("Ungültige Data-URL");
  }
  const mime = mimeMatch[1];
  const binary = atob(base64data);
  const u8arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    u8arr[i] = binary.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

// Die Hauptkomponente
export default function AdUploadForm({
  onSuccess,
  onViewAds,
  simulatedUserToken = "",
}) {
  // Schritt-Index (0: Basisdaten, 1: Medien, 2: Preis & Versand)
  const [currentStep, setCurrentStep] = useState(0);

  // Zustand für die Basisdaten (Schritt 1)
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    // Kleidung
    clothingSize: "",
    clothingBrand: "",
    clothingMaterial: "",
    // Elektronik
    electronicDeviceType: "",
    electronicOS: "",
    electronicWarranty: "",
    // Möbel
    furnitureStyle: "",
    furnitureDimensions: "",
    // Accessoires
    accessoryType: "",
    // Haushaltsgeräte
    applianceEnergy: "",
    applianceBrand: "",
  });

  // Zustand für Medien (Schritt 2)
  const [mediaData, setMediaData] = useState({
    uploadedImages: [],  // Liste der hochgeladenenn Bilder
    selectedImage: null, // Das aktuell ausgewählte Bild für das Zuschneiden
    showCropper: false,  // Ob der Cropper angezeigt wird
    videoFile: null,     // Ausgewählte Videodatei
    videoPreviewUrl: null, // URL zur Videovorschau
    videoUploadProgress: 0, // Fortschritt des Video-Uploads in Prozent
  });

  // Zustand für Preis- und Versandinformationen (Schritt 3)
  const [step3Data, setStep3Data] = useState({
    price: "",
    shippingProviders: [],
    shippingMethod: "",
    paymentMethod: "",
  });

  const [dropdowns, setDropdowns] = useState({
    showCategory: false,
    showCondition: false,
    showClothingSize: false,
    showClothingMaterial: false,
    showElectronicDeviceType: false,
    showElectronicOS: false,
    showElectronicWarranty: false,
    showFurnitureStyle: false,
    showAccessoryType: false,
    showApplianceEnergy: false,
    showShippingProviders: false,
    showShippingMethod: false,
    showPaymentMethod: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [errorFields, setErrorFields] = useState([]);
  const [shakeForm, setShakeForm] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adUploadStatus, setAdUploadStatus] = useState("");

  // Funktion, um den "Shake"-Effekt zu triggern (bei Fehlern)
  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 300);
  };

  // Setzt Fehlerfelder und zeigt eine Fehlermeldung an
  const setErrors = (fields, msg) => {
    setErrorFields(fields);
    setErrorMessage(msg);
    setToastMessage(msg);
    triggerShake();
  };

  // Löscht alle Fehlermeldungen
  const clearErrors = () => {
    setErrorFields([]);
    setErrorMessage("");
  };

  // Aktualisiert den Fehlerstatus eines bestimmten Feldes
  const updateErrorField = (field, isValid) => {
    setErrorFields((prev) => {
      const alreadyKnown = prev.includes(field);
      if (!isValid && !alreadyKnown) {
        return [...prev, field];
      }
      if (isValid && alreadyKnown) {
        return prev.filter((f) => f !== field);
      }
      return prev;
    });
  };

  // Validierung: Prüft, ob der Titel den Anforderungen entspricht
  const validateTitle = () =>
    formState.title.trim() &&
    formState.title.length >= 5 &&
    formState.title.length <= 50;

  // Validierung: Prüft, ob die Beschreibung ausreichend lan ist
  const validateDescription = () =>
    formState.description.trim() &&
    formState.description.length >= 10;

  // Valiediert alle Felder in Schritt 1 (Basisdaten und kategoriespezifisch)
  function validateStep0() {
    const tempErrors = [];

    // Basisfelder prüfen
    if (!formState.title.trim()) tempErrors.push("title");
    if (!formState.description.trim()) tempErrors.push("description");
    if (!formState.category) tempErrors.push("category");
    if (!formState.condition) tempErrors.push("condition");

    if (formState.title && !validateTitle()) tempErrors.push("title");
    if (formState.description && !validateDescription()) tempErrors.push("description");

    // Abhängig von der Kategorie werden spezifische Felder geprüft
    switch (formState.category) {
      case "Kleidung":
        if (!formState.clothingSize) tempErrors.push("clothingSize");
        if (!formState.clothingBrand.trim()) tempErrors.push("clothingBrand");
        if (!formState.clothingMaterial) tempErrors.push("clothingMaterial");
        break;
      case "Elektronik":
        if (!formState.electronicDeviceType) tempErrors.push("electronicDeviceType");
        if (!formState.electronicOS) tempErrors.push("electronicOS");
        if (!formState.electronicWarranty) tempErrors.push("electronicWarranty");
        break;
      case "Möbel":
        if (!formState.furnitureStyle) tempErrors.push("furnitureStyle");
        if (!formState.furnitureDimensions.trim()) tempErrors.push("furnitureDimensions");
        break;
      case "Accessoires":
        if (!formState.accessoryType) tempErrors.push("accessoryType");
        break;
      case "Haushaltsgeräte":
        if (!formState.applianceEnergy) tempErrors.push("applianceEnergy");
        if (!formState.applianceBrand.trim()) tempErrors.push("applianceBrand");
        break;
      default:
        break;
    }

    if (tempErrors.length > 0) {
      setErrors(
        tempErrors,
        "Bitte fülle alle Pflichtfelder in Schritt 1 (📝) korrekt aus."
      );
      return false;
    }
    return true;
  }

  // Prüft, ob mindestens ein Bild hochgeladen wurde (Schritt 2)
  function validateStep1() {
    if (mediaData.uploadedImages.length === 0) {
      setErrors([], "Bitte lade mindestens ein Bild hoch (📷).");
      return false;
    }
    return true;
  }

  // Validiert die Felder in Schritt 3 (Preis, Versand, Zahlungsmetode)
  function validateStep2() {
    const tempErrors = [];

    if (!step3Data.price.trim()) tempErrors.push("price");
    if (step3Data.shippingProviders.length === 0) tempErrors.push("shippingProviders");
    if (!step3Data.shippingMethod) tempErrors.push("shippingMethod");
    if (!step3Data.paymentMethod) tempErrors.push("paymentMethod");

    if (tempErrors.length > 0) {
      setErrors(tempErrors, "Bitte fülle alle Pflichtfelder in Schritt 3 (💶) aus.");
      return false;
    }
    return true;
  }

  // Wechselt zum nächsten Schritt, wenn alle Felder valide sind
  const handleNext = (event) => {
    event.preventDefault();
    clearErrors();

    if (currentStep === 0 && !validateStep0()) return;
    if (currentStep === 1 && !validateStep1()) return;

    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Wechselt zum vorherigen Schritt
  const handlePrev = (event) => {
    event.preventDefault();
    clearErrors();

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Schritt 2: Wenn ein Bild ausgewählt wird, zeige den Cropper zum Zuschneiden an
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setMediaData((prev) => ({
        ...prev,
        selectedImage: imageUrl,
        showCropper: true,
      }));
    }
  };

  // Schritt 2: Nachdem das Bild zugeschnitten wurde, speichert sich es als DataURL
  const handleCropComplete = (croppedDataUrl) => {
    setMediaData((prev) => ({
      ...prev,
      uploadedImages: [
        ...prev.uploadedImages,
        { file: null, preview: croppedDataUrl },
      ],
      showCropper: false,
    }));
  };

  // Entfernt ein Bild aus der Upload-Liste
  const removeImage = (index) => {
    setMediaData((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
    }));
  };

  // Schritt 2: Wenn Video ausgewählt wird, wird es gepeichert und eine Vorschau erstellt
  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaData((prev) => ({
        ...prev,
        videoFile: file,
        videoPreviewUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Schritt 3: Beim Absenden des Formulars
  const handleSubmit = async (event) => {
    event.preventDefault();
    clearErrors();

    if (!validateStep2()) return;

    setIsSubmitting(true);
    setAdUploadStatus("Anzeige wird hochgeladen...");

    // Erstelle ein FormData-Objekt und fülle es mit den Formular-Daten
    const uploadData = new FormData();

    uploadData.append("title", formState.title);
    uploadData.append("description", formState.description);
    uploadData.append("category", formState.category);
    uploadData.append("condition", formState.condition);
    uploadData.append("price", step3Data.price);
    uploadData.append("shippingMethod", step3Data.shippingMethod);

    if (formState.category === "Kleidung") {
      uploadData.append("clothingSize", formState.clothingSize);
      uploadData.append("clothingBrand", formState.clothingBrand);
      uploadData.append("clothingMaterial", formState.clothingMaterial);
    } else if (formState.category === "Elektronik") {
      uploadData.append("electronicDeviceType", formState.electronicDeviceType);
      uploadData.append("electronicOS", formState.electronicOS);
      uploadData.append("electronicWarranty", formState.electronicWarranty);
    } else if (formState.category === "Möbel") {
      uploadData.append("furnitureStyle", formState.furnitureStyle);
      uploadData.append("furnitureDimensions", formState.furnitureDimensions);
    } else if (formState.category === "Accessoires") {
      uploadData.append("accessoryType", formState.accessoryType);
    } else if (formState.category === "Haushaltsgeräte") {
      uploadData.append("applianceEnergy", formState.applianceEnergy);
      uploadData.append("applianceBrand", formState.applianceBrand);
    }

    // Versand und Zahlungsmethode hinzufügen
    uploadData.append(
      "shippingProviders",
      JSON.stringify(step3Data.shippingProviders)
    );
    uploadData.append("paymentMethod", step3Data.paymentMethod);

    // Füge alle Bilder hinzu
    mediaData.uploadedImages.forEach((imgObj, index) => {
      if (imgObj.file) {
        uploadData.append("images", imgObj.file);
      } else if (imgObj.preview) {
        const blob = dataURLtoBlob(imgObj.preview);
        const filename = `${Date.now()}-cropped-image-${index}.jpg`;
        uploadData.append("images", blob, filename);
      }
    });

    try {
      // Sendet den POST-Request ans Backend mit dem JWT im Header
      const response = await fetch(`${API_URL}/api/ads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${simulatedUserToken}`,
        },
        body: uploadData,
      });

      // Falls der Server einen Fehler meldet
      if (!response.ok) {
        const text = await response.text();
        console.error("Serverfehler:", text);
        setErrors([], text || "Fehler beim Hochladen.");
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setAdUploadStatus("Anzeige erfolgreich hochgeladen! ID: " + result.adId); // Id steht nur da um es leichter beim testen etc zu haben
        setToastMessage("Anzeige erfolgreich hochgeladen!");

        // Falls ein Video hochgeladen wurde, wird es separat gesendet
        if (mediaData.videoFile) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", mediaData.videoFile);
            videoFormData.append("adId", result.adId);

            await axios.post(`${API_URL}/api/ads/video`, videoFormData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${simulatedUserToken}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setMediaData((prev) => ({
                  ...prev,
                  videoUploadProgress: percentCompleted,
                }));
              },
            });
          } catch (uploadError) {
            console.error("Fehler beim Video-Upload:", uploadError);
          }
        }

        // Setze das Formular zurück
        resetForm();
        setIsSubmitting(false);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error("Server-Fehler oder success=false:", result.error);
        setErrors([], result.error || "Es ist ein Fehler aufgetreten.");
        setIsSubmitting(false);
      }
    } catch (fetchError) {
      console.error("Fetch-Fehler:", fetchError);
      setErrors([], "Verbindungsfehler zum Server.");
      setIsSubmitting(false);
    }
  };

  // Setzt alle Formularfelder auf den Anfangszustand zurück.
  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      category: "",
      condition: "",
      clothingSize: "",
      clothingBrand: "",
      clothingMaterial: "",
      electronicDeviceType: "",
      electronicOS: "",
      electronicWarranty: "",
      furnitureStyle: "",
      furnitureDimensions: "",
      accessoryType: "",
      applianceEnergy: "",
      applianceBrand: "",
    });

    setStep3Data({
      price: "",
      shippingProviders: [],
      shippingMethod: "",
      paymentMethod: "",
    });

    setMediaData({
      uploadedImages: [],
      selectedImage: null,
      showCropper: false,
      videoFile: null,
      videoPreviewUrl: null,
      videoUploadProgress: 0,
    });

    setCurrentStep(0);
  };

  // Berechnet die Breite des Fortschrittsbalkens (3 Schritte, Index 0-2)
  const progressWidth = `${currentStep * 50}%`;

  // Render der Komponente
  return (
    <div className="ad-upload-container">
      {}
      {mediaData.showCropper && mediaData.selectedImage ? (
        <ImageCropper
          imageSrc={mediaData.selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() =>
            setMediaData((prev) => ({ ...prev, showCropper: false }))
          }
        />
      ) : (
        <form className={`form ${shakeForm ? "shake" : ""}`} onSubmit={handleSubmit}>
          {/* Zeige Toast-Nachrichten */}
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />

          {/* Fortschrittsbalken für die Schritte */}
          <div className="progressbar">
            <div className="progress" style={{ width: progressWidth }}></div>
            <div
              className={`progress-step ${currentStep >= 0 ? "active" : ""}`}
              data-title="Details 📝"
            ></div>
            <div
              className={`progress-step ${currentStep >= 1 ? "active" : ""}`}
              data-title="Bilder & Video 📷🎥"
            ></div>
            <div
              className={`progress-step ${currentStep >= 2 ? "active" : ""}`}
              data-title="Versand 💶"
            ></div>
          </div>

          {/* Zeigt globale Fehlermeldungen */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Schritt 1: Formular für Basisdaten */}
          {currentStep === 0 && (
            <Step1Details
              formData={formState}
              setFormData={setFormState}
              dropdowns={dropdowns}
              setDropdowns={setDropdowns}
              errorFields={errorFields}
              updateErrorField={updateErrorField}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />
          )}

          {/* Schritt 2: Medien (Bilder & Video) hochladen */}
          {currentStep === 1 && (
            <Step2Media
              mediaData={mediaData}
              setMediaData={setMediaData}
              handleFileSelect={handleFileSelect}
              removeImage={removeImage}
              handleVideoSelect={handleVideoSelect}
              errorFields={errorFields}
            />
          )}

          {/* Schritt 3: Preis- und Versandinformationen */}
          {currentStep === 2 && (
            <Step3PriceShipping
              step3Data={step3Data}
              setStep3Data={setStep3Data}
              dropdowns={dropdowns}
              setDropdowns={setDropdowns}
              errorFields={errorFields}
            />
          )}

          {/* Navigations-Buttons */}
          <div className="btns-group">
            {currentStep === 0 && onViewAds && (
              <button
                className="btn"
                type="button"
                onClick={onViewAds}
                style={{ marginRight: "0.5rem" }}
              >
                ⬇️ Anzeigen ansehen
              </button>
            )}
            {currentStep > 0 && (
              <button className="btn" onClick={handlePrev}>
                ⬅️ Zurück
              </button>
            )}
            {currentStep < 2 && (
              <button className="btn" onClick={handleNext}>
                Weiter ➡️
              </button>
            )}
            {currentStep === 2 && (
              <button className="btn" type="submit">
                Anzeige aufgeben 🚀
              </button>
            )}
          </div>

          {/* uploadstatus Beim hochladen */}
          {isSubmitting && (
            <div className="upload-progress">
              <progress value={mediaData.videoUploadProgress || 50} max="100"></progress>
              <p>{adUploadStatus}</p>
              <div className="spinner"></div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

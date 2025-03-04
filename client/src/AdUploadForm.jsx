// Datei: src/components/AdUploadForm/AdUploadForm.jsx

import React, { useState } from "react";
import axios from "axios";

// Unter-Komponenten für die verschiedenen Schritte
import Step1Details from "./Step1Details";
import Step2Media from "./Step2Media";
import Step3PriceShipping from "./Step3PriceShipping";

// Zusätzliche Sub-Components & Utilities
import ImageCropper from "./ImageCropper";
import Toast from "./Toast";
import Dropdown from "./Dropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";

import "./AdUploadForm.css"; // Globale Stile (Progressbar, etc.)

// ----------------------------------------------------------
// API-Base-URL (Entweder von .env über REACT_APP_API_URL oder Standard)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// ----------------------------------------------------------
// Hilfsfunktion: Wandelt Base64-DataURL in ein Blob-Objekt um
// (wird benutzt, um das zugeschnittene Bild aus dem Cropper
// an den Server zu senden)
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

// ----------------------------------------------------------
// Haupt-Komponente "AdUploadForm"
// ----------------------------------------------------------
export default function AdUploadForm({ onSuccess, onViewAds }) {
  // --------------------------------------------------------
  // Schritt-Navigation
  // --------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);

  // --------------------------------------------------------
  // STEP 1: Felder (Allgemeine Basisfelder & Kategorie-spezifisch)
  // --------------------------------------------------------
  // Basisfelder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  // Kategorie: Kleidung
  const [clothingSize, setClothingSize] = useState("");
  const [clothingBrand, setClothingBrand] = useState("");
  const [clothingMaterial, setClothingMaterial] = useState("");

  // Kategorie: Elektronik
  const [electronicDeviceType, setElectronicDeviceType] = useState("");
  const [electronicOS, setElectronicOS] = useState("");
  const [electronicWarranty, setElectronicWarranty] = useState("");

  // Kategorie: Möbel
  const [furnitureStyle, setFurnitureStyle] = useState("");
  const [furnitureDimensions, setFurnitureDimensions] = useState("");

  // Kategorie: Accessoires
  const [accessoryType, setAccessoryType] = useState("");

  // Kategorie: Haushaltsgeräte
  const [applianceEnergy, setApplianceEnergy] = useState("");
  const [applianceBrand, setApplianceBrand] = useState("");

  // --------------------------------------------------------
  // STEP 2: Bilder und Videos
  // --------------------------------------------------------
  const [uploadedImages, setUploadedImages] = useState([]); // Array an hochgeladenen (ggf. gecroppten) Bildern
  const [selectedImage, setSelectedImage] = useState(null); // aktuell zum Zuschneiden ausgewähltes Bild
  const [showCropper, setShowCropper] = useState(false);    // steuert, ob der Cropper gezeigt wird

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  // --------------------------------------------------------
  // STEP 3: Preis & Versand
  // --------------------------------------------------------
  const [price, setPrice] = useState("");
  const [shippingProviders, setShippingProviders] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // --------------------------------------------------------
  // UI-States, Fehlerbehandlung und Meldungen
  // --------------------------------------------------------
  // Dropdown-Visibility (steuert, ob ein bestimmtes Dropdown geöffnet ist)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showClothingSizeDropdown, setShowClothingSizeDropdown] = useState(false);
  const [showClothingMaterialDropdown, setShowClothingMaterialDropdown] = useState(false);
  const [showElectronicDeviceTypeDropdown, setShowElectronicDeviceTypeDropdown] = useState(false);
  const [showElectronicOSDropdown, setShowElectronicOSDropdown] = useState(false);
  const [showElectronicWarrantyDropdown, setShowElectronicWarrantyDropdown] = useState(false);
  const [showFurnitureStyleDropdown, setShowFurnitureStyleDropdown] = useState(false);
  const [showAccessoryTypeDropdown, setShowAccessoryTypeDropdown] = useState(false);
  const [showApplianceEnergyDropdown, setShowApplianceEnergyDropdown] = useState(false);
  const [showShippingProvidersDropdown, setShowShippingProvidersDropdown] = useState(false);
  const [showShippingMethodDropdown, setShowShippingMethodDropdown] = useState(false);
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);

  // Fehler, Toast-Nachrichten, Fokus usw.
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState(""); // Textinhalt des Toasts
  const [errorFields, setErrorFields] = useState([]);   // Welche Felder fehlerhaft sind
  const [shakeForm, setShakeForm] = useState(false);    // visuelles Wackeln bei Fehler
  const [focusedField, setFocusedField] = useState(""); // aktuelles Fokusfeld
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adUploadStatus, setAdUploadStatus] = useState("");

  // --------------------------------------------------------
  // Hilfsfunktionen zur Fehlerbehandlung und UI
  // --------------------------------------------------------

  /**
   * Löst einen "Wackel-Effekt" am Formular aus, um auf einen Fehler aufmerksam zu machen.
   */
  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 300);
  };

  /**
   * Setzt die Fehler-Zustände (betroffene Felder und Meldung)
   * und zeigt eine Toast-Message an.
   */
  const setErrors = (fields, msg) => {
    setErrorFields(fields);
    setErrorMessage(msg);
    setToastMessage(msg);
    triggerShake();
  };

  /**
   * Löscht alle Fehlerzustände.
   */
  const clearErrors = () => {
    setErrorFields([]);
    setErrorMessage("");
  };

  /**
   * Aktualisiert das Array der fehlerhaften Felder basierend darauf,
   * ob das Feld gültig ist oder nicht.
   */
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

  // --------------------------------------------------------
  // Validierungsfunktionen
  // --------------------------------------------------------
  const validateTitle = () => title.trim() && title.length >= 5 && title.length <= 50;
  const validateDescription = () => description.trim() && description.length >= 10;

  /**
   * Validierung für Schritt 1: Basisfelder + Kategorie-spezifische Felder
   */
  function validateStep0() {
    const tempErrors = [];

    // Basis
    if (!title.trim()) tempErrors.push("title");
    if (!description.trim()) tempErrors.push("description");
    if (!category) tempErrors.push("category");
    if (!condition) tempErrors.push("condition");
    if (title && !validateTitle()) tempErrors.push("title");
    if (description && !validateDescription()) tempErrors.push("description");

    // Kategorie-spezifisch
    if (category === "Kleidung") {
      if (!clothingSize) tempErrors.push("clothingSize");
      if (!clothingBrand.trim()) tempErrors.push("clothingBrand");
      if (!clothingMaterial) tempErrors.push("clothingMaterial");
    }
    if (category === "Elektronik") {
      if (!electronicDeviceType) tempErrors.push("electronicDeviceType");
      if (!electronicOS) tempErrors.push("electronicOS");
      if (!electronicWarranty) tempErrors.push("electronicWarranty");
    }
    if (category === "Möbel") {
      if (!furnitureStyle) tempErrors.push("furnitureStyle");
      if (!furnitureDimensions.trim()) tempErrors.push("furnitureDimensions");
    }
    if (category === "Accessoires") {
      if (!accessoryType) tempErrors.push("accessoryType");
    }
    if (category === "Haushaltsgeräte") {
      if (!applianceEnergy) tempErrors.push("applianceEnergy");
      if (!applianceBrand.trim()) tempErrors.push("applianceBrand");
    }

    if (tempErrors.length > 0) {
      setErrors(tempErrors, "Bitte fülle alle Pflichtfelder in Schritt 1 (📝) korrekt aus.");
      return false;
    }
    return true;
  }

  /**
   * Validierung für Schritt 2: Mindestens ein Bild muss hochgeladen sein.
   */
  function validateStep1() {
    if (uploadedImages.length === 0) {
      setErrors([], "Bitte lade mindestens ein Bild hoch (📷).");
      return false;
    }
    return true;
  }

  /**
   * Validierung für Schritt 3: Preis, Versand und Zahlungsoptionen müssen gesetzt sein.
   */
  function validateStep2() {
    const tempErrors = [];
    if (!price.trim()) tempErrors.push("price");
    if (shippingProviders.length === 0) tempErrors.push("shippingProviders");
    if (!shippingMethod) tempErrors.push("shippingMethod");
    if (!paymentMethod) tempErrors.push("paymentMethod");

    if (tempErrors.length > 0) {
      setErrors(tempErrors, "Bitte fülle alle Pflichtfelder in Schritt 3 (💶) aus.");
      return false;
    }
    return true;
  }

  // --------------------------------------------------------
  // Navigation zwischen den Schritten
  // --------------------------------------------------------
  const handleNext = (event) => {
    event.preventDefault();
    clearErrors();

    // Schritt 1 (Step 0) prüfen
    if (currentStep === 0 && !validateStep0()) return;

    // Schritt 2 (Step 1) prüfen
    if (currentStep === 1 && !validateStep1()) return;

    // Bei Step 2 (Index 2) erfolgt die letzte Validierung erst beim Submit
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = (event) => {
    event.preventDefault();
    clearErrors();

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // --------------------------------------------------------
  // STEP 2: Bild-Upload und -Crop
  // --------------------------------------------------------
  /**
   * Handler, wenn der User ein Bild auswählt.
   * Zeigt den Cropper an, damit das Bild ggf. zugeschnitten werden kann.
   */
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowCropper(true);
    }
  };

  /**
   * Wenn der Crop abgeschlossen ist, wird das zugeschnittene Bild
   * als DataURL in `uploadedImages` gespeichert.
   */
  const handleCropComplete = (croppedDataUrl) => {
    setUploadedImages((prev) => [...prev, { file: null, preview: croppedDataUrl }]);
    setShowCropper(false);
  };

  /**
   * Entfernt ein bereits hochgeladenes Bild (z.B. wenn der Nutzer es doch nicht möchte).
   */
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------------
  // STEP 2: Video-Upload
  // --------------------------------------------------------
  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --------------------------------------------------------
  // STEP 3: Submit-Handler (Anzeige hochladen)
  // --------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    clearErrors();

    // Prüfe Felder für Schritt 3
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setAdUploadStatus("Anzeige wird hochgeladen...");

    // Vorbereitung für POST-Request
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("condition", condition);
    formData.append("price", price);
    formData.append("shippingMethod", shippingMethod);

    // Kategorie-spezifische Felder
    if (category === "Kleidung") {
      formData.append("clothingSize", clothingSize);
      formData.append("clothingBrand", clothingBrand);
      formData.append("clothingMaterial", clothingMaterial);
    } else if (category === "Elektronik") {
      formData.append("electronicDeviceType", electronicDeviceType);
      formData.append("electronicOS", electronicOS);
      formData.append("electronicWarranty", electronicWarranty);
    } else if (category === "Möbel") {
      formData.append("furnitureStyle", furnitureStyle);
      formData.append("furnitureDimensions", furnitureDimensions);
    } else if (category === "Accessoires") {
      formData.append("accessoryType", accessoryType);
    } else if (category === "Haushaltsgeräte") {
      formData.append("applianceEnergy", applianceEnergy);
      formData.append("applianceBrand", applianceBrand);
    }

    formData.append("shippingProviders", JSON.stringify(shippingProviders));
    formData.append("paymentMethod", paymentMethod);

    // Bilder hinzufügen (entweder Original-File oder gecropptes DataURL-Blob)
    uploadedImages.forEach((imgObj, index) => {
      if (imgObj.file) {
        // Unverändert hochladen
        formData.append("images", imgObj.file);
      } else if (imgObj.preview) {
        // Gecropptes Bild (DataURL)
        const blob = dataURLtoBlob(imgObj.preview);
        const filename = `${Date.now()}-cropped-image-${index}.jpg`;
        formData.append("images", blob, filename);
      }
    });

    // ------------------------------------------------------
    // Request an Backend senden
    // ------------------------------------------------------
    try {
      const response = await fetch(`${API_URL}/api/ads`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // Anzeige erfolgreich erstellt
        setAdUploadStatus("Anzeige erfolgreich hochgeladen! ID: " + result.adId);
        setToastMessage("Anzeige erfolgreich hochgeladen!");

        // Video-Upload (wenn vorhanden)
        if (videoFile) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", videoFile);
            videoFormData.append("adId", result.adId);

            // Upload mit Axios (Progressbar)
            await axios.post(`${API_URL}/api/ads/video`, videoFormData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setVideoUploadProgress(percentCompleted);
              },
            });
          } catch (uploadError) {
            console.error("Fehler beim Video-Upload:", uploadError);
          }
        }

        // Formular zurücksetzen
        resetForm();
        setIsSubmitting(false);

        // Callback z.B. um eine Anzeigeliste zu refreshen
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Server hat geantwortet, aber success == false
        console.error("Server-Fehler:", result.error);
        setErrors([], result.error || "Es ist ein Fehler aufgetreten.");
        setIsSubmitting(false);
      }
    } catch (fetchError) {
      // Technischer Fehler (z.B. kein Netz)
      console.error("Fetch-Fehler:", fetchError);
      setErrors([], "Verbindungsfehler zum Server.");
      setIsSubmitting(false);
    }
  };

  /**
   * Setzt das gesamte Formular auf Anfangszustand zurück
   * (z.B. nach erfolgreichem Upload).
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setCondition("");
    setPrice("");
    setShippingMethod("");
    setClothingSize("");
    setClothingBrand("");
    setClothingMaterial("");
    setElectronicDeviceType("");
    setElectronicOS("");
    setElectronicWarranty("");
    setFurnitureStyle("");
    setFurnitureDimensions("");
    setAccessoryType("");
    setApplianceEnergy("");
    setApplianceBrand("");
    setShippingProviders([]);
    setPaymentMethod("");
    setUploadedImages([]);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoUploadProgress(0);
    setCurrentStep(0);
  };

  // Dynamische Breite der Fortschritts-Anzeige
  const progressWidth = `${currentStep * 50}%`;

  // --------------------------------------------------------
  // Render
  // --------------------------------------------------------
  return (
    <div className="ad-upload-container">
      {/* Falls wir gerade ein Bild zuschneiden, zeige den Cropper (Overlay) */}
      {showCropper && selectedImage ? (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      ) : (
        <form className={`form ${shakeForm ? "shake" : ""}`} onSubmit={handleSubmit}>
          {/* Kurze Hinweis-Nachricht (Toast) */}
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />

          {/* Fortschrittsbalken (3 Schritte) */}
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
              data-title="Preis & Versand 💶"
            ></div>
          </div>

          {/* Globale Fehlermeldung */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* ==================== SCHRITT 1 ==================== */}
          {currentStep === 0 && (
            <Step1Details
              // Basiseingaben
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              condition={condition}
              setCondition={setCondition}

              // Kleidung
              clothingSize={clothingSize}
              setClothingSize={setClothingSize}
              clothingBrand={clothingBrand}
              setClothingBrand={setClothingBrand}
              clothingMaterial={clothingMaterial}
              setClothingMaterial={setClothingMaterial}

              // Elektronik
              electronicDeviceType={electronicDeviceType}
              setElectronicDeviceType={setElectronicDeviceType}
              electronicOS={electronicOS}
              setElectronicOS={setElectronicOS}
              electronicWarranty={electronicWarranty}
              setElectronicWarranty={setElectronicWarranty}

              // Möbel
              furnitureStyle={furnitureStyle}
              setFurnitureStyle={setFurnitureStyle}
              furnitureDimensions={furnitureDimensions}
              setFurnitureDimensions={setFurnitureDimensions}

              // Accessoires
              accessoryType={accessoryType}
              setAccessoryType={setAccessoryType}

              // Haushaltsgeräte
              applianceEnergy={applianceEnergy}
              setApplianceEnergy={setApplianceEnergy}
              applianceBrand={applianceBrand}
              setApplianceBrand={setApplianceBrand}

              // Dropdown-States
              showCategoryDropdown={showCategoryDropdown}
              setShowCategoryDropdown={setShowCategoryDropdown}
              showConditionDropdown={showConditionDropdown}
              setShowConditionDropdown={setShowConditionDropdown}
              showClothingSizeDropdown={showClothingSizeDropdown}
              setShowClothingSizeDropdown={setShowClothingSizeDropdown}
              showClothingMaterialDropdown={showClothingMaterialDropdown}
              setShowClothingMaterialDropdown={setShowClothingMaterialDropdown}
              showElectronicDeviceTypeDropdown={showElectronicDeviceTypeDropdown}
              setShowElectronicDeviceTypeDropdown={setShowElectronicDeviceTypeDropdown}
              showElectronicOSDropdown={showElectronicOSDropdown}
              setShowElectronicOSDropdown={setShowElectronicOSDropdown}
              showElectronicWarrantyDropdown={showElectronicWarrantyDropdown}
              setShowElectronicWarrantyDropdown={setShowElectronicWarrantyDropdown}
              showFurnitureStyleDropdown={showFurnitureStyleDropdown}
              setShowFurnitureStyleDropdown={setShowFurnitureStyleDropdown}
              showAccessoryTypeDropdown={showAccessoryTypeDropdown}
              setShowAccessoryTypeDropdown={setShowAccessoryTypeDropdown}
              showApplianceEnergyDropdown={showApplianceEnergyDropdown}
              setShowApplianceEnergyDropdown={setShowApplianceEnergyDropdown}

              // Fehler/Fokus
              errorFields={errorFields}
              updateErrorField={updateErrorField}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />
          )}

          {/* ==================== SCHRITT 2 ==================== */}
          {currentStep === 1 && (
            <Step2Media
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              handleFileSelect={handleFileSelect}
              removeImage={removeImage}
              videoFile={videoFile}
              setVideoFile={setVideoFile}
              videoPreviewUrl={videoPreviewUrl}
              setVideoPreviewUrl={setVideoPreviewUrl}
              videoUploadProgress={videoUploadProgress}
              handleVideoSelect={handleVideoSelect}
              errorFields={errorFields}
            />
          )}

          {/* ==================== SCHRITT 3 ==================== */}
          {currentStep === 2 && (
            <Step3PriceShipping
              price={price}
              setPrice={setPrice}
              shippingProviders={shippingProviders}
              setShippingProviders={setShippingProviders}
              shippingMethod={shippingMethod}
              setShippingMethod={setShippingMethod}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}

              showShippingProvidersDropdown={showShippingProvidersDropdown}
              setShowShippingProvidersDropdown={setShowShippingProvidersDropdown}
              showShippingMethodDropdown={showShippingMethodDropdown}
              setShowShippingMethodDropdown={setShowShippingMethodDropdown}
              showPaymentMethodDropdown={showPaymentMethodDropdown}
              setShowPaymentMethodDropdown={setShowPaymentMethodDropdown}

              errorFields={errorFields}
            />
          )}

          {/* Buttons für Navigation & Submit */}
          <div className="btns-group">
            {/* Anzeigen ansehen: nur im ersten Schritt sichtbar */}
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

            {/* "Zurück"-Button, außer im ersten Schritt */}
            {currentStep > 0 && (
              <button className="btn" onClick={handlePrev}>
                ⬅️ Zurück
              </button>
            )}

            {/* "Weiter"-Button, solange wir nicht im letzten Schritt sind */}
            {currentStep < 2 && (
              <button className="btn" onClick={handleNext}>
                Weiter ➡️
              </button>
            )}

            {/* "Anzeige aufgeben"-Button nur im letzten Schritt */}
            {currentStep === 2 && (
              <button className="btn" type="submit">
                Anzeige aufgeben 🚀
              </button>
            )}
          </div>

          {/* Falls wir gerade hochladen, zeige Spinner & Status */}
          {isSubmitting && (
            <div className="upload-progress">
              <progress value={videoUploadProgress || 50} max="100"></progress>
              <p>{adUploadStatus}</p>
              <div className="spinner"></div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

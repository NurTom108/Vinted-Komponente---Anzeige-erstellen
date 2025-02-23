import React, { useState } from "react";

import "./AdUploadForm.css";

// Anstatt: export default function AdUploadForm() {
// NEU:
export default function AdUploadForm({ onSuccess, onViewAds, isViewingAds }) {

  // STATES für die einzelnen Schritte & Felder
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  // Neuer State für den Shake-Effekt
  const [shakeForm, setShakeForm] = useState(false);

  // Textfelder / Zahlenfelder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");



  // Dropdowns
  const [category, setCategory] = useState("");
  const [showCategory, setShowCategory] = useState(false);

  const [condition, setCondition] = useState("");
  const [showCondition, setShowCondition] = useState(false);

  const [packageSize, setPackageSize] = useState("");
  const [showPackageSize, setShowPackageSize] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("");
  const [showShippingMethodDropdown, setShowShippingMethodDropdown] =
    useState(false);

  // ZUSÄTZLICH: State für Fehlermeldung
  const [errorMessage, setErrorMessage] = useState("");
  

  // -----------------------------------
  // VALIDIERUNGEN je Schritt
  // -----------------------------------
  const validateCurrentStep = () => {
    // Erstmal alles zurücksetzen
    setErrorMessage("");

    // Felder wieder normal anzeigen (kein roter Rand)
    removeErrorBorders();

    switch (currentStep) {
        case 0:
            if (!title.trim() || !description.trim() || !category || !condition) {
              setErrorMessage("Bitte fülle alle Felder in Schritt 1 (📝) aus.");
              addErrorBorders(["title", "description", "category", "condition"]);
              triggerShake(); // <-- Hier rufst du die Vibration auf
              return false;
            }
            return true;
          

      case 1:
        // Schritt 2: Mindestens 1 Bild
        if (uploadedImages.length === 0) {
          setErrorMessage("Bitte lade mindestens ein Bild hoch (📷).");
          triggerShake();
          // Wir lassen .error-border an den eigentlichen Feldern weg,
          // da es hier nur um file-input geht.
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // -----------------------------------
  // Hilfe-Funktionen für Error-Border
  // -----------------------------------
  const addErrorBorders = (fieldNames) => {
    // fieldNames kann z. B. ["title", "description", ...] sein
    fieldNames.forEach((name) => {
      const el = document.getElementById(name);
      if (el) {
        el.classList.add("error-border");
      }
    });
  };

  const removeErrorBorders = () => {
    const errorEls = document.querySelectorAll(".error-border");
    errorEls.forEach((el) => {
      el.classList.remove("error-border");
    });
  };

  // -----------------------------------
  // NAVIGATION
  // -----------------------------------
  const handleNext = (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setErrorMessage("");
    removeErrorBorders();

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  //Shake
  function triggerShake() {
    setShakeForm(true);
    // Nach 300ms wieder zurücksetzen, damit die Animation nicht dauerhaft läuft
    setTimeout(() => {
      setShakeForm(false);
    }, 300);
  }
  

 // -----------------------------------
// FORMULAR ABSCHICKEN (3. Schritt)
// -----------------------------------
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");
  removeErrorBorders();

  // Schritt 3: Preis, Sendungsgröße, Versandart
  const isStep3Valid = price.trim() && packageSize && shippingMethod;
  if (!isStep3Valid) {
    setErrorMessage("Bitte fülle alle Felder in Schritt 3 (💶) aus.");
    addErrorBorders(["price"]);
    triggerShake();
    return;
  }

  // 1) FormData erstellen
  const formData = new FormData();

  // 2) Textfelder hinzufügen
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("condition", condition);
  formData.append("price", price);
  formData.append("packageSize", packageSize);
  formData.append("shippingMethod", shippingMethod);

  // 3) Bilder hinzufügen
  uploadedImages.forEach((imgObj) => {
    formData.append("images", imgObj.file);
  });

  try {
    // 4) fetch mit FormData
    const response = await fetch("http://localhost:3001/api/ads", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log("Anzeige erfolgreich gespeichert", result);
      alert("Anzeige erfolgreich erstellt! ID: " + result.adId);

      // Felder zurücksetzen
      setTitle("");
      setDescription("");
      setCategory("");
      setCondition("");
      setUploadedImages([]);
      setPrice("");
      setPackageSize("");
      setShippingMethod("");
      setCurrentStep(0);

      // <-- NEU: Callback aufrufen
      if (onSuccess) {
        onSuccess(); 
      }
    } else {
      console.error("Server-Fehler:", result.error);
      setErrorMessage(result.error || "Es ist ein Fehler aufgetreten.");
      triggerShake();
    }
  } catch (error) {
    console.error("Fetch-Fehler:", error);
    setErrorMessage("Verbindungsfehler zum Server.");
    triggerShake();
  }
};

  
  

  // -----------------------------------
  // BILDER HOCHLADEN
  // -----------------------------------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const mappedFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prevImages) => [...prevImages, ...mappedFiles]);
  };

  // -----------------------------------
  // PROGRESSBAR
  // -----------------------------------
  const progressWidth = `${currentStep * 50}%`;

  return (
    <form className={`form ${shakeForm ? "shake" : ""}`} onSubmit={handleSubmit}>

      {/* PROGRESSBAR */}
      <div className="progressbar">
        <div className="progress" style={{ width: progressWidth }}></div>
        <div
          className={`progress-step ${currentStep >= 0 ? "active" : ""}`}
          data-title="Details 📝"
        ></div>
        <div
          className={`progress-step ${currentStep >= 1 ? "active" : ""}`}
          data-title="Bilder 📷"
        ></div>
        <div
          className={`progress-step ${currentStep >= 2 ? "active" : ""}`}
          data-title="Preis & Versand 💶"
        ></div>
      </div>

      {/* OPTIONAL: Globale Fehlermeldung */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* --------------------------------------- */}
      {/* SCHRITT 1: Anzeige-Details (📝) */}
      {/* --------------------------------------- */}
      <div className={`form-step ${currentStep === 0 ? "active" : ""}`}>
        <h2>Anzeige Details 📝</h2>
        <div className="input-group">
          <label htmlFor="title">Titel der Anzeige</label>
          <input
            id="title"
            type="text"
            placeholder="🪧 Gib den Titel deiner Anzeige ein"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Beschreibung der Anzeige</label>
          <textarea
            id="description"
            placeholder="🔍 Beschreibe deinen Artikel ausführlich"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Dropdown: Kategorie */}
        <div className="input-group">
          <label htmlFor="category">Kategorie auswählen</label>
          <div className="dropdown">
            <button
              id="category"
              type="button"
              className="dropdown-toggle"
              onClick={() => setShowCategory(!showCategory)}
            >
              {category || "-- Kategorie wählen --"}{" "}
              <span style={{ marginLeft: "0.5rem", fontSize: "0.7em" }}>▼</span>
            </button>
            {showCategory && (
              <ul className="dropdown-menu">
                <li
                  onClick={() => {
                    setCategory("Kleidung");
                    setShowCategory(false);
                  }}
                >
                  👚 Kleidung
                </li>
                <li
                  onClick={() => {
                    setCategory("Elektronik");
                    setShowCategory(false);
                  }}
                >
                  💻 Elektronik
                </li>
                <li
                  onClick={() => {
                    setCategory("Möbel");
                    setShowCategory(false);
                  }}
                >
                  🪑 Möbel
                </li>
                <li
                  onClick={() => {
                    setCategory("Accessoires");
                    setShowCategory(false);
                  }}
                >
                  💍 Accessoires
                </li>
                <li
                  onClick={() => {
                    setCategory("Haushaltsgeräte");
                    setShowCategory(false);
                  }}
                >
                  🍳 Haushaltsgeräte
                </li>
                <li
                  onClick={() => {
                    setCategory("Sonstiges");
                    setShowCategory(false);
                  }}
                >
                  🌀 Sonstiges
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Dropdown: Zustand */}
        <div className="input-group">
          <label htmlFor="condition">Zustand</label>
          <div className="dropdown">
            <button
              id="condition"
              type="button"
              className="dropdown-toggle"
              onClick={() => setShowCondition(!showCondition)}
            >
              {condition || "-- Zustand wählen --"}{" "}
              <span style={{ marginLeft: "0.5rem", fontSize: "0.7em" }}>▼</span>
            </button>
            {showCondition && (
              <ul className="dropdown-menu">
                <li
                  onClick={() => {
                    setCondition("Neu");
                    setShowCondition(false);
                  }}
                >
                  ✨ Neu
                </li>
                <li
                  onClick={() => {
                    setCondition("Gebraucht");
                    setShowCondition(false);
                  }}
                >
                  ♻️ Gebraucht
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* SCHRITT 2: Bilder hochladen (📷) */}
      {/* --------------------------------------- */}
      <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
        <h2>Bilder hochladen 📷</h2>
        <div className="input-group">
          <label htmlFor="file-input">Bilder hochladen</label>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="btn"
            onClick={() => document.getElementById("file-input").click()}
          >
            📁 Bilder auswählen
          </button>
        </div>
        {uploadedImages.length > 0 && (
          <div
            className="image-preview-list"
            style={{ display: "flex", flexWrap: "wrap", marginTop: "1rem" }}
          >
            {uploadedImages.map((img, index) => (
              <div
                key={index}
                className="image-preview"
                style={{ marginRight: "10px", marginBottom: "10px" }}
              >
                <img
                  src={img.preview}
                  alt={`upload-${index}`}
                  style={{
                    maxWidth: "100px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --------------------------------------- */}
      {/* SCHRITT 3: Preis & Versand (💶) */}
      {/* --------------------------------------- */}
      <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
        <h2>Preis & Versand 💶</h2>
        <div className="input-group">
          <label htmlFor="price">Preis (€)</label>
          <input
            id="price"
            type="number"
            placeholder="z.B. 49.99"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Dropdown: Sendungsgröße */}
        <div className="input-group">
          <label>Sendungsgröße</label>
          <div className="dropdown">
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => setShowPackageSize(!showPackageSize)}
            >
              {packageSize || "-- Größe wählen --"}
              <span style={{ marginLeft: "0.5rem", fontSize: "0.7em" }}>▼</span>
            </button>
            {showPackageSize && (
              <ul className="dropdown-menu">
                <li
                  onClick={() => {
                    setPackageSize("S");
                    setShowPackageSize(false);
                  }}
                >
                  S
                </li>
                <li
                  onClick={() => {
                    setPackageSize("M");
                    setShowPackageSize(false);
                  }}
                >
                  M
                </li>
                <li
                  onClick={() => {
                    setPackageSize("L");
                    setShowPackageSize(false);
                  }}
                >
                  L
                </li>
                <li
                  onClick={() => {
                    setPackageSize("XL");
                    setShowPackageSize(false);
                  }}
                >
                  XL
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Dropdown: Versandart */}
        <div className="input-group">
          <label>Versandart</label>
          <div className="dropdown">
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() =>
                setShowShippingMethodDropdown(!showShippingMethodDropdown)
              }
            >
              {shippingMethod || "-- Versandart wählen --"}
              <span style={{ marginLeft: "0.5rem", fontSize: "0.7em" }}>▼</span>
            </button>
            {showShippingMethodDropdown && (
              <ul className="dropdown-menu">
                <li
                  onClick={() => {
                    setShippingMethod("Standard");
                    setShowShippingMethodDropdown(false);
                  }}
                >
                  🚚 Standard
                </li>
                <li
                  onClick={() => {
                    setShippingMethod("Express");
                    setShowShippingMethodDropdown(false);
                  }}
                >
                  ⚡ Express
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* BUTTONS UNTEN */}
      {/* --------------------------------------- */}
      <div className="btns-group">
        {/* Button „Anzeigen ansehen“, nur im Schritt 0 (falls gewünscht) */}
        {currentStep === 0 && onViewAds && (
          <button 
            className="btn" 
            type="button"
            onClick={onViewAds}
            style={{ marginRight: '0.5rem' }}
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
    </form>
  );
}

// Datei: src/components/AdUploadForm/Step1Details.jsx

import React from "react";
import Dropdown from "./Dropdown";

/**
 * Komponente für Schritt 1 des Formulars:
 * Zeigt Basisfelder (Titel, Beschreibung, Kategorie, Zustand)
 * sowie (je nach gewählter Kategorie) unterschiedliche Zusatzfelder an.
 */
export default function Step1Details({
  // -------------------
  // Allgemeine Felder
  // -------------------
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  condition,
  setCondition,

  // -------------------
  // Kategorie: Kleidung
  // -------------------
  clothingSize,
  setClothingSize,
  clothingBrand,
  setClothingBrand,
  clothingMaterial,
  setClothingMaterial,

  // -------------------
  // Kategorie: Elektronik
  // -------------------
  electronicDeviceType,
  setElectronicDeviceType,
  electronicOS,
  setElectronicOS,
  electronicWarranty,
  setElectronicWarranty,

  // -------------------
  // Kategorie: Möbel
  // -------------------
  furnitureStyle,
  setFurnitureStyle,
  furnitureDimensions,
  setFurnitureDimensions,

  // -------------------
  // Kategorie: Accessoires
  // -------------------
  accessoryType,
  setAccessoryType,

  // -------------------
  // Kategorie: Haushaltsgeräte
  // -------------------
  applianceEnergy,
  setApplianceEnergy,
  applianceBrand,
  setApplianceBrand,

  // -------------------
  // Steuert, ob bestimmte Dropdowns offen oder geschlossen sind
  // -------------------
  showCategoryDropdown,
  setShowCategoryDropdown,
  showConditionDropdown,
  setShowConditionDropdown,
  showClothingSizeDropdown,
  setShowClothingSizeDropdown,
  showClothingMaterialDropdown,
  setShowClothingMaterialDropdown,
  showElectronicDeviceTypeDropdown,
  setShowElectronicDeviceTypeDropdown,
  showElectronicOSDropdown,
  setShowElectronicOSDropdown,
  showElectronicWarrantyDropdown,
  setShowElectronicWarrantyDropdown,
  showFurnitureStyleDropdown,
  setShowFurnitureStyleDropdown,
  showAccessoryTypeDropdown,
  setShowAccessoryTypeDropdown,
  showApplianceEnergyDropdown,
  setShowApplianceEnergyDropdown,

  // -------------------
  // Fehlerbehandlung & Fokus
  // -------------------
  errorFields,
  updateErrorField,
  focusedField,
  setFocusedField,
}) {
  // ------------------------------------------------------
  // Hilfsfunktionen zur Validierung für Titel & Beschreibung
  // (Kontrolliert z. B. Mindestlänge)
  // ------------------------------------------------------
  const validateTitle = () =>
    title.trim() && title.length >= 5 && title.length <= 50;

  const validateDescription = () =>
    description.trim() && description.length >= 10;

  // ------------------------------------------------------
  // Dropdown-Optionen für Kategorie und Zustand
  // (Könnten ggf. auch in ein separates Config-File ausgelagert werden)
  // ------------------------------------------------------
  const categoryOptions = [
    { value: "Kleidung", label: "Kleidung", emoji: "👚" },
    { value: "Elektronik", label: "Elektronik", emoji: "💻" },
    { value: "Möbel", label: "Möbel", emoji: "🪑" },
    { value: "Accessoires", label: "Accessoires", emoji: "💍" },
    { value: "Haushaltsgeräte", label: "Haushaltsgeräte", emoji: "🍳" },
    { value: "Sonstiges", label: "Sonstiges", emoji: "🌀" },
  ];

  const conditionOptions = [
    { value: "Neu", label: "Neu", emoji: "✨" },
    { value: "Gebraucht", label: "Gebraucht", emoji: "♻️" },
  ];

  // ------------------------------------------------------
  // Weitere Dropdown-Optionen für Kleidung, Elektronik etc.
  // ------------------------------------------------------
  const clothingSizeOptions = [
    { value: "XS", label: "XS", emoji: "📏" },
    { value: "S", label: "S", emoji: "📏" },
    { value: "M", label: "M", emoji: "📏" },
    { value: "L", label: "L", emoji: "📏" },
    { value: "XL", label: "XL", emoji: "📏" },
  ];

  const clothingMaterialOptions = [
    { value: "Baumwolle", label: "Baumwolle", emoji: "🌱" },
    { value: "Polyester", label: "Polyester", emoji: "🧵" },
    { value: "Wolle", label: "Wolle", emoji: "🐑" },
    { value: "Sonstiges", label: "Sonstiges", emoji: "❓" },
  ];

  const electronicDeviceTypeOptions = [
    { value: "Smartphone", label: "Smartphone", emoji: "📱" },
    { value: "Laptop", label: "Laptop", emoji: "💻" },
    { value: "Tablet", label: "Tablet", emoji: "📲" },
    { value: "Kamera", label: "Kamera", emoji: "📷" },
  ];

  const electronicOSOptions = [
    { value: "Android", label: "Android", emoji: "🤖" },
    { value: "iOS", label: "iOS", emoji: "🍎" },
    { value: "Windows", label: "Windows", emoji: "🪟" },
    { value: "macOS", label: "macOS", emoji: "🍏" },
  ];

  const electronicWarrantyOptions = [
    { value: "Ja", label: "Ja", emoji: "✅" },
    { value: "Nein", label: "Nein", emoji: "❌" },
  ];

  const furnitureStyleOptions = [
    { value: "Modern", label: "Modern", emoji: "🆕" },
    { value: "Klassisch", label: "Klassisch", emoji: "📜" },
    { value: "Skandinavisch", label: "Skandinavisch", emoji: "❄️" },
    { value: "Industrial", label: "Industrial", emoji: "⚙️" },
  ];

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------
  return (
    <div className="form-step active">
      <h2>Anzeige Details 📝</h2>

      {/* ---------------------------
         TITEL-EINGABE
         --------------------------- */}
      <div className="input-group">
        <label htmlFor="title">Titel der Anzeige</label>
        <input
          id="title"
          type="text"
          placeholder="🪧 Gib den Titel deiner Anzeige ein"
          value={title}
          onChange={(e) => {
            // Titel-Update + Fehlermarkierung
            setTitle(e.target.value);
            updateErrorField(
              "title",
              e.target.value.trim() &&
                e.target.value.length >= 5 &&
                e.target.value.length <= 50
            );
          }}
          onFocus={() => setFocusedField("title")}
          onBlur={() => {
            setFocusedField("");
            updateErrorField("title", validateTitle());
          }}
          className={errorFields.includes("title") ? "error-border" : ""}
        />

        {/* Zusätzliche Hilfe-/Fehlermeldungen */}
        {focusedField === "title" && (
          <small className="help-text">📝 Tipp: 5-50 Zeichen.</small>
        )}
        {title && !validateTitle() && (
          <small className="validation-error">❌ Ungültige Länge.</small>
        )}
      </div>

      {/* ---------------------------
         BESCHREIBUNG-EINGABE
         --------------------------- */}
      <div className="input-group">
        <label htmlFor="description">Beschreibung</label>
        <textarea
          id="description"
          placeholder="🔍 Beschreibe deinen Artikel ausführlich"
          rows="4"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            updateErrorField(
              "description",
              e.target.value.trim() && e.target.value.length >= 10
            );
          }}
          onFocus={() => setFocusedField("description")}
          onBlur={() => {
            setFocusedField("");
            updateErrorField("description", validateDescription());
          }}
          className={errorFields.includes("description") ? "error-border" : ""}
        />
        {focusedField === "description" && (
          <small className="help-text">🔍 Tipp: Mindestens 10 Zeichen.</small>
        )}
        {description && !validateDescription() && (
          <small className="validation-error">❌ Zu kurz!</small>
        )}
      </div>

      {/* ---------------------------
         KATEGORIE
         --------------------------- */}
      <div className="input-group">
        <label htmlFor="category">Kategorie</label>
        <Dropdown
          id="category"
          value={category}
          placeholder="-- Kategorie wählen --"
          options={categoryOptions}
          error={errorFields.includes("category")}
          onSelect={setCategory}
          show={showCategoryDropdown}
          toggle={() => setShowCategoryDropdown((prev) => !prev)}
        />
      </div>

      {/* ---------------------------
         ZUSTAND
         --------------------------- */}
      <div className="input-group">
        <label htmlFor="condition">Zustand</label>
        <Dropdown
          id="condition"
          value={condition}
          placeholder="-- Zustand wählen --"
          options={conditionOptions}
          error={errorFields.includes("condition")}
          onSelect={setCondition}
          show={showConditionDropdown}
          toggle={() => setShowConditionDropdown((prev) => !prev)}
        />
      </div>

      {/* ===========================================================================
         KATEGORIE-SPEZIFISCHE ABSCHNITTE
         Sobald "category" einen Wert hat, werden die Felder unten angezeigt
         =========================================================================== */}

      {/* ------------------- KLEIDUNG ------------------- */}
      {category === "Kleidung" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Kleidung 👚</h3>

          {/* Größe */}
          <div className="input-group">
            <label htmlFor="clothingSize">Größe</label>
            <Dropdown
              id="clothingSize"
              value={clothingSize}
              placeholder="-- Größe wählen --"
              options={clothingSizeOptions}
              error={errorFields.includes("clothingSize")}
              onSelect={setClothingSize}
              show={showClothingSizeDropdown}
              toggle={() => setShowClothingSizeDropdown((prev) => !prev)}
            />
          </div>

          {/* Marke */}
          <div className="input-group">
            <label htmlFor="clothingBrand">Marke</label>
            <input
              id="clothingBrand"
              type="text"
              placeholder="👟 z.B. Nike, Adidas"
              value={clothingBrand}
              onChange={(e) => {
                setClothingBrand(e.target.value);
                updateErrorField(
                  "clothingBrand",
                  e.target.value.trim() !== ""
                );
              }}
              className={
                errorFields.includes("clothingBrand") ? "error-border" : ""
              }
            />
          </div>

          {/* Material */}
          <div className="input-group">
            <label htmlFor="clothingMaterial">Material</label>
            <Dropdown
              id="clothingMaterial"
              value={clothingMaterial}
              placeholder="-- Material wählen --"
              options={clothingMaterialOptions}
              error={errorFields.includes("clothingMaterial")}
              onSelect={setClothingMaterial}
              show={showClothingMaterialDropdown}
              toggle={() =>
                setShowClothingMaterialDropdown((prev) => !prev)
              }
            />
          </div>
        </>
      )}

      {/* ------------------- ELEKTRONIK ------------------- */}
      {category === "Elektronik" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Elektronik 💻</h3>

          {/* Gerätetyp */}
          <div className="input-group">
            <label htmlFor="electronicDeviceType">Gerätetyp</label>
            <Dropdown
              id="electronicDeviceType"
              value={electronicDeviceType}
              placeholder="-- Gerätetyp wählen --"
              options={electronicDeviceTypeOptions}
              error={errorFields.includes("electronicDeviceType")}
              onSelect={setElectronicDeviceType}
              show={showElectronicDeviceTypeDropdown}
              toggle={() =>
                setShowElectronicDeviceTypeDropdown((prev) => !prev)
              }
            />
          </div>

          {/* Betriebssystem */}
          <div className="input-group">
            <label htmlFor="electronicOS">Betriebssystem</label>
            <Dropdown
              id="electronicOS"
              value={electronicOS}
              placeholder="-- OS wählen --"
              options={electronicOSOptions}
              error={errorFields.includes("electronicOS")}
              onSelect={setElectronicOS}
              show={showElectronicOSDropdown}
              toggle={() => setShowElectronicOSDropdown((prev) => !prev)}
            />
          </div>

          {/* Garantie */}
          <div className="input-group">
            <label htmlFor="electronicWarranty">Garantie</label>
            <Dropdown
              id="electronicWarranty"
              value={electronicWarranty}
              placeholder="-- Garantie wählen --"
              options={electronicWarrantyOptions}
              error={errorFields.includes("electronicWarranty")}
              onSelect={setElectronicWarranty}
              show={showElectronicWarrantyDropdown}
              toggle={() =>
                setShowElectronicWarrantyDropdown((prev) => !prev)
              }
            />
          </div>
        </>
      )}

      {/* ------------------- MÖBEL ------------------- */}
      {category === "Möbel" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Möbel 🪑</h3>

          {/* Stil */}
          <div className="input-group">
            <label htmlFor="furnitureStyle">Stil</label>
            <Dropdown
              id="furnitureStyle"
              value={furnitureStyle}
              placeholder="-- Stil wählen --"
              options={furnitureStyleOptions}
              error={errorFields.includes("furnitureStyle")}
              onSelect={setFurnitureStyle}
              show={showFurnitureStyleDropdown}
              toggle={() => setShowFurnitureStyleDropdown((prev) => !prev)}
            />
          </div>

          {/* Abmessungen */}
          <div className="input-group">
            <label htmlFor="furnitureDimensions">Abmessungen</label>
            <input
              id="furnitureDimensions"
              type="text"
              placeholder="📐 z.B. 200x80x75 cm"
              value={furnitureDimensions}
              onChange={(e) => {
                setFurnitureDimensions(e.target.value);
                updateErrorField(
                  "furnitureDimensions",
                  e.target.value.trim() !== ""
                );
              }}
              className={
                errorFields.includes("furnitureDimensions")
                  ? "error-border"
                  : ""
              }
            />
          </div>
        </>
      )}

      {/* ------------------- ACCESSOIRES ------------------- */}
      {category === "Accessoires" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Accessoires 💍</h3>

          {/* Typ (Uhr, Tasche, Schmuck...) */}
          <div className="input-group">
            <label htmlFor="accessoryType">Typ</label>
            <Dropdown
              id="accessoryType"
              value={accessoryType}
              placeholder="-- Typ wählen --"
              options={[
                { value: "Uhr", label: "Uhr", emoji: "⌚" },
                { value: "Tasche", label: "Tasche", emoji: "👜" },
                { value: "Schmuck", label: "Schmuck", emoji: "💎" },
                { value: "Sonnenbrille", label: "Sonnenbrille", emoji: "😎" },
              ]}
              error={errorFields.includes("accessoryType")}
              onSelect={setAccessoryType}
              show={showAccessoryTypeDropdown}
              toggle={() =>
                setShowAccessoryTypeDropdown((prev) => !prev)
              }
            />
          </div>
        </>
      )}

      {/* ------------------- HAUSHALTSGERÄTE ------------------- */}
      {category === "Haushaltsgeräte" && (
        <>
          <h3 className="section-subtitle">
            Zusätzliche Infos für Haushaltsgeräte 🍳
          </h3>

          {/* Energieeffizienz */}
          <div className="input-group">
            <label htmlFor="applianceEnergy">Energieeffizienz</label>
            <Dropdown
              id="applianceEnergy"
              value={applianceEnergy}
              placeholder="-- Klasse wählen --"
              options={[
                { value: "A+++", label: "A+++", emoji: "💡" },
                { value: "A++", label: "A++", emoji: "💡" },
                { value: "A+", label: "A+", emoji: "💡" },
                { value: "A", label: "A", emoji: "💡" },
              ]}
              error={errorFields.includes("applianceEnergy")}
              onSelect={setApplianceEnergy}
              show={showApplianceEnergyDropdown}
              toggle={() =>
                setShowApplianceEnergyDropdown((prev) => !prev)
              }
            />
          </div>

          {/* Marke */}
          <div className="input-group">
            <label htmlFor="applianceBrand">Marke</label>
            <input
              id="applianceBrand"
              type="text"
              placeholder="🏷️ z.B. Bosch, Siemens"
              value={applianceBrand}
              onChange={(e) => {
                setApplianceBrand(e.target.value);
                updateErrorField(
                  "applianceBrand",
                  e.target.value.trim() !== ""
                );
              }}
              className={
                errorFields.includes("applianceBrand") ? "error-border" : ""
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

// Datei: src/components/AdUploadForm/Step1Details.jsx
// Übersicht:
// Zeigt die Eingabefelder für Schritt 1 beim Erstellen einer Anzeige.
// Es enthält Basisfelder wie Titel, Beschreibung, Kategorie und Zustand sowie
// kategoriespezifische Felder (z.B. für Kleidung, Elektronik, Möbel usw.).
// Außerdem werden einfache Validierungen durchgeführt und Fehlermeldungen angezeigt.

import React from "react";
import Dropdown from "../common/Dropdown";

export default function Step1Details({
  // Das gesamte Objekt mit allen Formularfeldern
  formData,
  setFormData,

  dropdowns,
  setDropdowns,

  errorFields,
  updateErrorField,
  focusedField,
  setFocusedField,
}) {
  // Holen der benötigten Felder aus formData
  const {
    title,
    description,
    category,
    condition,

    clothingSize,
    clothingBrand,
    clothingMaterial,

    electronicDeviceType,
    electronicOS,
    electronicWarranty,

    furnitureStyle,
    furnitureDimensions,

    accessoryType,

    applianceEnergy,
    applianceBrand,
  } = formData;

  // Holen der Dropdown-Zustände aus dropdowns
  const {
    showCategoryDropdown,
    showConditionDropdown,
    showClothingSizeDropdown,
    showClothingMaterialDropdown,
    showElectronicDeviceTypeDropdown,
    showElectronicOSDropdown,
    showElectronicWarrantyDropdown,
    showFurnitureStyleDropdown,
    showAccessoryTypeDropdown,
    showApplianceEnergyDropdown,
  } = dropdowns;

  // Einfache Valiedierung für Titel und Beschreibung
  const validateTitle = () =>
    title.trim() && title.length >= 5 && title.length <= 50;

  const validateDescription = () =>
    description.trim() && description.length >= 10;

  // Dropdown-Optionen für die verschiedenen Felder
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

  // Render-Teil der Komponente
  return (
    <div className="form-step active">
      <h2>Anzeige Details 📝</h2>

      {/* Eingabefeld für den Titel */}
      <div className="input-group">
        <label htmlFor="title">Titel der Anzeige</label>
        <input
          id="title"
          type="text"
          placeholder="🪧 Gib den Titel deiner Anzeige ein"
          value={title}
          onChange={(e) => {
            const newValue = e.target.value;
            setFormData((prev) => ({ ...prev, title: newValue }));
            updateErrorField("title", newValue.trim() && newValue.length >= 5 && newValue.length <= 50);
          }}
          onFocus={() => setFocusedField("title")}
          onBlur={() => {
            setFocusedField("");
            updateErrorField("title", validateTitle());
          }}
          className={errorFields.includes("title") ? "error-border" : ""}
        />
        {focusedField === "title" && (
          <small className="help-text">📝 Tipp: 5-50 Zeichen.</small>
        )}
        {title && !validateTitle() && (
         <>
        <br />
        <small className="validation-error">❌ Ungültige Länge.</small>
        </>
          )}
      </div>

      {/* Eingabefeld für die Beschreibung */}
      <div className="input-group">
        <label htmlFor="description">Beschreibung</label>
        <textarea
          id="description"
          placeholder="🔍 Beschreibe deinen Artikel ausführlich"
          rows="4"
          value={description}
          onChange={(e) => {
            const newValue = e.target.value;
            setFormData((prev) => ({ ...prev, description: newValue }));
            updateErrorField("description", newValue.trim() && newValue.length >= 10);
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
            <>
           <br />
          <small className="validation-error">❌ Zu kurz!</small>
          </>
        )}
      </div>

      {/* Dropdown für Kategorie */}
      <div className="input-group">
        <label htmlFor="category">Kategorie</label>
        <Dropdown
          id="category"
          value={category}
          placeholder="-- Kategorie wählen --"
          options={categoryOptions}
          error={errorFields.includes("category")}
          onSelect={(val) => setFormData((prev) => ({ ...prev, category: val }))}
          show={showCategoryDropdown}
          toggle={() =>
            setDropdowns((prev) => ({
              ...prev,
              showCategoryDropdown: !prev.showCategoryDropdown,
            }))
          }
        />
      </div>

      {/* Dropdown für Zustand */}
      <div className="input-group">
        <label htmlFor="condition">Zustand</label>
        <Dropdown
          id="condition"
          value={condition}
          placeholder="-- Zustand wählen --"
          options={conditionOptions}
          error={errorFields.includes("condition")}
          onSelect={(val) => setFormData((prev) => ({ ...prev, condition: val }))}
          show={showConditionDropdown}
          toggle={() =>
            setDropdowns((prev) => ({
              ...prev,
              showConditionDropdown: !prev.showConditionDropdown,
            }))
          }
        />
      </div>

      {/* Kategorie-spezifische Felder */}
      {category === "Kleidung" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Kleidung 👚</h3>
          <div className="input-group">
            <label htmlFor="clothingSize">Größe</label>
            <Dropdown
              id="clothingSize"
              value={clothingSize}
              placeholder="-- Größe wählen --"
              options={clothingSizeOptions}
              error={errorFields.includes("clothingSize")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, clothingSize: val }))}
              show={showClothingSizeDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showClothingSizeDropdown: !prev.showClothingSizeDropdown,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="clothingBrand">Marke</label>
            <input
              id="clothingBrand"
              type="text"
              placeholder="👟 z.B. Nike, Adidas"
              value={clothingBrand}
              onChange={(e) => {
                const newVal = e.target.value;
                setFormData((prev) => ({ ...prev, clothingBrand: newVal }));
                updateErrorField("clothingBrand", newVal.trim() !== "");
              }}
              className={errorFields.includes("clothingBrand") ? "error-border" : ""}
            />
          </div>
          <div className="input-group">
            <label htmlFor="clothingMaterial">Material</label>
            <Dropdown
              id="clothingMaterial"
              value={clothingMaterial}
              placeholder="-- Material wählen --"
              options={clothingMaterialOptions}
              error={errorFields.includes("clothingMaterial")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, clothingMaterial: val }))}
              show={showClothingMaterialDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showClothingMaterialDropdown: !prev.showClothingMaterialDropdown,
                }))
              }
            />
          </div>
        </>
      )}

      {category === "Elektronik" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Elektronik 💻</h3>
          <div className="input-group">
            <label htmlFor="electronicDeviceType">Gerätetyp</label>
            <Dropdown
              id="electronicDeviceType"
              value={electronicDeviceType}
              placeholder="-- Gerätetyp wählen --"
              options={electronicDeviceTypeOptions}
              error={errorFields.includes("electronicDeviceType")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, electronicDeviceType: val }))}
              show={showElectronicDeviceTypeDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showElectronicDeviceTypeDropdown: !prev.showElectronicDeviceTypeDropdown,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="electronicOS">Betriebssystem</label>
            <Dropdown
              id="electronicOS"
              value={electronicOS}
              placeholder="-- OS wählen --"
              options={electronicOSOptions}
              error={errorFields.includes("electronicOS")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, electronicOS: val }))}
              show={showElectronicOSDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showElectronicOSDropdown: !prev.showElectronicOSDropdown,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="electronicWarranty">Garantie</label>
            <Dropdown
              id="electronicWarranty"
              value={electronicWarranty}
              placeholder="-- Garantie wählen --"
              options={electronicWarrantyOptions}
              error={errorFields.includes("electronicWarranty")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, electronicWarranty: val }))}
              show={showElectronicWarrantyDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showElectronicWarrantyDropdown: !prev.showElectronicWarrantyDropdown,
                }))
              }
            />
          </div>
        </>
      )}

      {category === "Möbel" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Möbel 🪑</h3>
          <div className="input-group">
            <label htmlFor="furnitureStyle">Stil</label>
            <Dropdown
              id="furnitureStyle"
              value={furnitureStyle}
              placeholder="-- Stil wählen --"
              options={furnitureStyleOptions}
              error={errorFields.includes("furnitureStyle")}
              onSelect={(val) => setFormData((prev) => ({ ...prev, furnitureStyle: val }))}
              show={showFurnitureStyleDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showFurnitureStyleDropdown: !prev.showFurnitureStyleDropdown,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="furnitureDimensions">Abmessungen</label>
            <input
              id="furnitureDimensions"
              type="text"
              placeholder="📐 z.B. 200x80x75 cm"
              value={furnitureDimensions}
              onChange={(e) => {
                const newVal = e.target.value;
                setFormData((prev) => ({ ...prev, furnitureDimensions: newVal }));
                updateErrorField("furnitureDimensions", newVal.trim() !== "");
              }}
              className={errorFields.includes("furnitureDimensions") ? "error-border" : ""}
            />
          </div>
        </>
      )}

      {category === "Accessoires" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Accessoires 💍</h3>
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
              onSelect={(val) => setFormData((prev) => ({ ...prev, accessoryType: val }))}
              show={showAccessoryTypeDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showAccessoryTypeDropdown: !prev.showAccessoryTypeDropdown,
                }))
              }
            />
          </div>
        </>
      )}

      {category === "Haushaltsgeräte" && (
        <>
          <h3 className="section-subtitle">Zusätzliche Infos für Haushaltsgeräte 🍳</h3>
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
              onSelect={(val) => setFormData((prev) => ({ ...prev, applianceEnergy: val }))}
              show={showApplianceEnergyDropdown}
              toggle={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  showApplianceEnergyDropdown: !prev.showApplianceEnergyDropdown,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="applianceBrand">Marke</label>
            <input
              id="applianceBrand"
              type="text"
              placeholder="🏷️ z.B. Bosch, Siemens"
              value={applianceBrand}
              onChange={(e) => {
                const newVal = e.target.value;
                setFormData((prev) => ({ ...prev, applianceBrand: newVal }));
                updateErrorField("applianceBrand", newVal.trim() !== "");
              }}
              className={errorFields.includes("applianceBrand") ? "error-border" : ""}
            />
          </div>
        </>
      )}
    </div>
  );
}

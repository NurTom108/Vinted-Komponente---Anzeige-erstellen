// Datei: src/components/AdUploadForm/Step3PriceShipping.jsx
// Überblick:
// Zeigt den dritten Schritt im Formular, wo der Preis, die Versand- und Zahlungsmethode eingegeben werden.
// Es wird Dropdowns und einen MultiSelect für die Auswahl von Versanddienstleistern.

import React from "react";
import Dropdown from "../common/Dropdown";
import MultiSelectDropdown from "../common/MultiSelectDropdown";

export default function Step3PriceShipping({
  step3Data,
  setStep3Data,
  dropdowns,
  setDropdowns,
  errorFields,
}) {
  // Holen der Werte aus dem step3Data-Objekt
  const { price, shippingProviders, shippingMethod, paymentMethod } = step3Data;

  // Holen der Dropdown-Zustände aus dem dropdowns-Objekt
  const {
    showShippingProviders,
    showShippingMethod,
    showPaymentMethod,
  } = dropdowns;

  // Optionen für den MultiSelect der Versandanbieter
  const shippingProvidersOptions = [
    { value: "DHL", label: "DHL", emoji: "🚚" },
    { value: "Hermes", label: "Hermes", emoji: "🚛" },
    { value: "UPS", label: "UPS", emoji: "📦" },
    { value: "DPD", label: "DPD", emoji: "🚚" },
  ];

  // Optionen für den Versandart-Dropdown
  const shippingMethodOptions = [
    { value: "Standard", label: "Standard", emoji: "🚚" },
    { value: "Express", label: "Express", emoji: "⚡" },
  ];

  // Optionen für den Zahlungsmethoden-Dropdown
  const paymentMethodOptions = [
    { value: "PayPal", label: "PayPal", emoji: "💳" },
    { value: "Kreditkarte", label: "Kreditkarte", emoji: "💳" },
    { value: "Nachnahme", label: "Nachnahme", emoji: "💰" },
  ];

  // Handler, um einen Versanddienstleister auszuwählen oder zu entfernen (MultiSelect)
  const handleToggleShippingProvider = (provider) => {
    setStep3Data((prev) => {
      const currentProviders = prev.shippingProviders || [];
      if (currentProviders.includes(provider)) {
        return {
          ...prev,
          shippingProviders: currentProviders.filter((p) => p !== provider),
        };
      } else {
        return {
          ...prev,
          shippingProviders: [...currentProviders, provider],
        };
      }
    });
  };

  // Fallback, falls errorFields undefined ist
  const safeErrorFields = errorFields || [];

  return (
    <div className="form-step active">
      <h2>Preis & Versand 💶</h2>

      {/* Preis-Eingabe */}
      <div className="input-group">
        <label htmlFor="price">Preis (€)</label>
        <input
          id="price"
          type="number"
          placeholder="💶 z.B. 49.99"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) =>
            setStep3Data((prev) => ({ ...prev, price: e.target.value }))
          }
          className={safeErrorFields.includes("price") ? "error-border" : ""}
        />
      </div>

      {/* MultiSelect für Versanddienstleister */}
      <div className="input-group">
        <label>Versandanbieter</label>
        <MultiSelectDropdown
          id="shippingProviders"
          selectedValues={shippingProviders || []}
          placeholder="-- Anbieter wählen --"
          options={shippingProvidersOptions}
          error={safeErrorFields.includes("shippingProviders")}
          onToggleOption={handleToggleShippingProvider}
          show={showShippingProviders}
          toggle={() =>
            setDropdowns((prev) => ({
              ...prev,
              showShippingProviders: !prev.showShippingProviders,
            }))
          }
        />
      </div>

      {/* Dropdown für Versandart */}
      <div className="input-group">
        <label>Versandart</label>
        <Dropdown
          id="shippingMethod"
          value={shippingMethod}
          placeholder="-- Versandart wählen --"
          options={shippingMethodOptions}
          error={safeErrorFields.includes("shippingMethod")}
          onSelect={(val) =>
            setStep3Data((prev) => ({ ...prev, shippingMethod: val }))
          }
          show={showShippingMethod}
          toggle={() =>
            setDropdowns((prev) => ({
              ...prev,
              showShippingMethod: !prev.showShippingMethod,
            }))
          }
        />
      </div>

      {/* Dropdown für Zahlungsmethode */}
      <div className="input-group">
        <label>Zahlungsmethode</label>
        <Dropdown
          id="paymentMethod"
          value={paymentMethod}
          placeholder="-- Zahlungsmethode wählen --"
          options={paymentMethodOptions}
          error={safeErrorFields.includes("paymentMethod")}
          onSelect={(val) =>
            setStep3Data((prev) => ({ ...prev, paymentMethod: val }))
          }
          show={showPaymentMethod}
          toggle={() =>
            setDropdowns((prev) => ({
              ...prev,
              showPaymentMethod: !prev.showPaymentMethod,
            }))
          }
        />
      </div>
    </div>
  );
}

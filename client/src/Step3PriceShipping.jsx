// Datei: src/components/AdUploadForm/Step3PriceShipping.jsx

import React from "react";
import Dropdown from "./Dropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";

/**
 * Step3PriceShipping:
 * - Bietet Felder für den Preis (Geldeingabe)
 * - Ermöglicht die Auswahl mehrerer Versanddienstleister (MultiSelect)
 * - Legt Versandart (Standard / Express) und Zahlungsmethode (PayPal, Kreditkarte etc.) fest
 */
export default function Step3PriceShipping({
  price,
  setPrice,
  shippingProviders,
  setShippingProviders,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod,

  // Steuert, ob die Dropdowns offen / geschlossen sind
  showShippingProvidersDropdown,
  setShowShippingProvidersDropdown,
  showShippingMethodDropdown,
  setShowShippingMethodDropdown,
  showPaymentMethodDropdown,
  setShowPaymentMethodDropdown,

  // Array der Felder, die fehlerhaft sind (für rote Umrandung etc.)
  errorFields,
}) {
  // ------------------------------------------------------
  // Optionen für Versanddienstleister und -arten
  // ------------------------------------------------------
  const shippingProvidersOptions = [
    { value: "DHL", label: "DHL", emoji: "🚚" },
    { value: "Hermes", label: "Hermes", emoji: "🚛" },
    { value: "UPS", label: "UPS", emoji: "📦" },
    { value: "DPD", label: "DPD", emoji: "🚚" },
  ];

  const shippingMethodOptions = [
    { value: "Standard", label: "Standard", emoji: "🚚" },
    { value: "Express", label: "Express", emoji: "⚡" },
  ];

  // ------------------------------------------------------
  // Optionen für Zahlungsmethoden
  // ------------------------------------------------------
  const paymentMethodOptions = [
    { value: "PayPal", label: "PayPal", emoji: "💳" },
    { value: "Kreditkarte", label: "Kreditkarte", emoji: "💳" },
    { value: "Nachnahme", label: "Nachnahme", emoji: "💰" },
  ];

  // ------------------------------------------------------
  // Handler zum Hinzufügen/Entfernen von Versanddienstleistern
  // (für das MultiSelectDropdown)
  // ------------------------------------------------------
  const handleToggleShippingProvider = (provider) => {
    if (shippingProviders.includes(provider)) {
      // Provider war bereits ausgewählt -> entferne ihn
      setShippingProviders((prev) => prev.filter((p) => p !== provider));
    } else {
      // Provider ist neu -> hinzufügen
      setShippingProviders((prev) => [...prev, provider]);
    }
  };

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------
  return (
    <div className="form-step active">
      <h2>Preis & Versand 💶</h2>

      {/* Eingabefeld für den Preis */}
      <div className="input-group">
        <label htmlFor="price">Preis (€)</label>
        <input
          id="price"
          type="number"
          placeholder="💶 z.B. 49.99"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={errorFields.includes("price") ? "error-border" : ""}
        />
      </div>

      {/* MultiSelectDropdown für Versanddienstleister */}
      <div className="input-group">
        <label>Versandanbieter</label>
        <MultiSelectDropdown
          id="shippingProviders"
          selectedValues={shippingProviders}
          placeholder="-- Anbieter wählen --"
          options={shippingProvidersOptions}
          error={errorFields.includes("shippingProviders")}
          onToggleOption={handleToggleShippingProvider}
          show={showShippingProvidersDropdown}
          toggle={() => setShowShippingProvidersDropdown((prev) => !prev)}
        />
      </div>

      {/* Dropdown für die Versandart */}
      <div className="input-group">
        <label>Versandart</label>
        <Dropdown
          id="shippingMethod"
          value={shippingMethod}
          placeholder="-- Versandart wählen --"
          options={shippingMethodOptions}
          error={errorFields.includes("shippingMethod")}
          onSelect={setShippingMethod}
          show={showShippingMethodDropdown}
          toggle={() => setShowShippingMethodDropdown((prev) => !prev)}
        />
      </div>

      {/* Dropdown für die Zahlungsmethode */}
      <div className="input-group">
        <label>Zahlungsmethode</label>
        <Dropdown
          id="paymentMethod"
          value={paymentMethod}
          placeholder="-- Zahlungsmethode wählen --"
          options={paymentMethodOptions}
          error={errorFields.includes("paymentMethod")}
          onSelect={setPaymentMethod}
          show={showPaymentMethodDropdown}
          toggle={() => setShowPaymentMethodDropdown((prev) => !prev)}
        />
      </div>
    </div>
  );
}

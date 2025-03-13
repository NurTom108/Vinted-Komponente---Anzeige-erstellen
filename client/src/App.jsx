// Datei: src/App.js
// Übersicht:
// Diese Datei ist meine Haupt-App-Component, das zwischen dem Anzeigen-Upload-Formular
// und der AnzeigeListe wechslt. Es verwaltet auch den simulierten Benutzer und den dazugehörigen JWT.

import React, { useState, useEffect } from "react";
import AdUploadForm from "./components/AdUploadForm/AdUploadForm";
import AdsList from "./components/AdsLists/AdsList";

export default function App() {

  const [showAds, setShowAds] = useState(false);

  // Standardmäßig wird der Benutzer "user1" simuliert
  const [simulatedUserId, setSimulatedUserId] = useState("user1");

  // Hier speichert der JWT-Token des simulierten Benutzers
  const [simulatedUserToken, setSimulatedUserToken] = useState("");

  // Zeigt die Anzeigenliste an
  const handleViewAds = () => setShowAds(true);
  // Wechselt zurück zum Upload-Formular
  const handleBackToForm = () => setShowAds(false);

  // Funktion, um den Token für einen gegebenen Benutzer abzurufen (POST an /auth/login)
  async function fetchTokenForUser(username) {
    try {
      const resp = await fetch("https://localhost:8443/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }), 
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
      const data = await resp.json(); // Erwartet { token: "..." }
      return data.token;
    } catch (err) {
      console.error("Fehler beim Token-Fetch:", err);
      return "";
    }
  }

  // Wird aufgerufen, wen der Benutzer im Dropdown wechselt
  async function handleUserChange(e) {
    const newUser = e.target.value;
    setSimulatedUserId(newUser);
    const token = await fetchTokenForUser(newUser);
    setSimulatedUserToken(token);
    console.log("User geändert -> JWT:", token);
  }

  // Beim ersten Laden der App wird gleich der Token für "user1" geholt - Da wenn man kein user explizit wählt es kein Token gibt für user1
  useEffect(() => {
    fetchTokenForUser("user1").then((token) => {
      setSimulatedUserToken(token);
      console.log("Initialer User 'user1' -> JWT:", token);
    });
  }, []); 

  return (
    <div>
      <label>Simulierter Benutzer: </label>
      <select value={simulatedUserId} onChange={handleUserChange}>
        <option value="user1">User 1</option>
        <option value="user2">User 2</option>
        <option value="user3">User 3</option>
      </select>

      {/* Je nachdem, ob showAds true oder false ist, das Upload-Form oder die Anzeigenliste */}
      {!showAds ? (
        <AdUploadForm
          simulatedUserToken={simulatedUserToken}
          simulatedUserId={simulatedUserId}
          onViewAds={handleViewAds}
        />
      ) : (
        <AdsList
          simulatedUserToken={simulatedUserToken}
          simulatedUserId={simulatedUserId}
          onBack={handleBackToForm}
        />
      )}
    </div>
  );
}

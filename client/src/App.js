// App.js
import React, { useState } from 'react';
import AdUploadForm from './AdUploadForm';
import AdsList from './AdsList';

export default function App() {
  const [showAds, setShowAds] = useState(false);

  // Anzeigen ansehen
  const handleViewAds = () => {
    setShowAds(true);
  };

  // Zurück zum Formular
  const handleBackToForm = () => {
    setShowAds(false);
  };

  return (
    <div>
      {!showAds ? (
        <AdUploadForm onViewAds={handleViewAds} />
      ) : (
        <AdsList onBack={handleBackToForm} />
      )}
    </div>
  );
}

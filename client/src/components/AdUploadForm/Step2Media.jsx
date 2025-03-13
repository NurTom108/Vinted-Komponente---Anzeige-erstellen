// Datei: src/components/AdUploadForm/Step2Media.jsx
// Übersicht:
// Zeigt zwei Bereiche für den Upload: einen für Bilder und einen für Videos.
// Es erlaubt dem Nutzer, Bilder auszuwählen (und gegebenenfalls zu croppen) sowie ein Video hochzuladen

import React, { useRef } from "react";

export default function Step2Media({
  mediaData,
  setMediaData,
  handleFileSelect,
  removeImage,
  handleVideoSelect,
  errorFields,
}) {
  // Extrahiert die nötigen Felder aus mediaData
  const {
    uploadedImages = [],
    videoFile = null,
    videoPreviewUrl = null,
    videoUploadProgress = 0,
    selectedImage = null,
    showCropper = false,
  } = mediaData;

  // Referenzen für die file-inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  return (
    <div className="form-step active step-2-grid">
      {/* Bereich für den Bilder-Upload */}
      <div className="upload-section">
        <h2>Bilder hochladen 📷</h2>
        <div className="input-group">
          <input
            id="file-input"
            ref={imageInputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            className="btn"
            onClick={() => imageInputRef.current && imageInputRef.current.click()}
          >
            📁 Bilder auswählen
          </button>
        </div>

        {/* Zeigt an   wie viele Bilde ausgewählt wurden */}
        <p className="image-count">
          {uploadedImages.length === 0
            ? "Keine Bilder ausgewählt"
            : `${uploadedImages.length} Bild(er) ausgewählt`}
        </p>

        {/* Vorschau der ausgewählten Bilder */}
        {uploadedImages.length > 0 && (
          <div className="image-preview-list">
            {uploadedImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img.preview} alt={`upload-${index}`} />
                <div className="preview-controls">
                  <button type="button" onClick={() => removeImage(index)}>
                    Entfernen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bereich für den Video-Upload */}
      <div className="upload-section">
        <h2>Video hochladen (max. 1 Video) 🎥</h2>
        <div className="input-group">
          <input
            id="video-input"
            ref={videoInputRef}
            className="file-input-hidden"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
          />
          <button
            type="button"
            className="btn"
            onClick={() => videoInputRef.current && videoInputRef.current.click()}
          >
            📁 Video auswählen
          </button>
        </div>

        {/* Anzeige, ob ein Video ausgewählt wurde */}
        <p className="video-count">
          {videoFile ? "Eine Datei ausgewählt" : "Keine Datei ausgewählt"}
        </p>

        {/* Video-Vorschau */}
        {videoPreviewUrl && (
          <div className="video-preview centered-video">
            <video controls src={videoPreviewUrl} />
          </div>
        )}

        {/* Fortschrittsanzeige beim Video-Upload */}
        {videoUploadProgress > 0 && videoUploadProgress < 100 && (
          <progress value={videoUploadProgress} max="100">
            {videoUploadProgress}%
          </progress>
        )}
      </div>
    </div>
  );
}

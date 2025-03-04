// Datei: src/components/AdUploadForm/Step2Media.jsx

import React from "react";

/**
 * Step2Media
 *
 * Zeigt zwei Bereiche an:
 *  1. Hochladen und Vorschau von Bildern
 *  2. Hochladen und Vorschau eines einzelnen Videos
 *
 * "uploadedImages" hält bereits hochgeladene/gecroppte Bilder.
 * "videoFile" hält das ausgewählte Video (falls vorhanden).
 */
export default function Step2Media({
  uploadedImages,      // Array mit { file, preview }-Objekten
  setUploadedImages,   // State-Updater für Bilder
  handleFileSelect,    // Handler, wenn User ein Bild auswählt (öffnet Cropper etc.)
  removeImage,         // Funktion, um ein Bild aus "uploadedImages" zu entfernen

  videoFile,           // Aktuell ausgewähltes Video
  setVideoFile,        // Updater für videoFile
  videoPreviewUrl,     // Preview-URL für das ausgewählte Video
  setVideoPreviewUrl,  // Updater für die Preview-URL
  videoUploadProgress, // Fortschritt beim Video-Upload
  handleVideoSelect,   // Handler, wenn User ein Video auswählt
  errorFields,         // Fehlerhafte Felder (nicht zwingend hier gebraucht)
}) {
  return (
    <div className="form-step active step-2-grid">
      {/* ----------------------------------------------------
         LINKE SPALTE: BILDER HOCHLADEN
         ---------------------------------------------------- */}
      <div className="upload-section">
        <h2>Bilder hochladen 📷</h2>

        {/* "input-group" für das Versteckte File-Input und den Button */}
        <div className="input-group">
          {/* Verstecktes File-Input (für Bilder) */}
          <input
            id="file-input"
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            className="btn"
            onClick={() => document.getElementById("file-input").click()}
          >
            📁 Bilder auswählen
          </button>
        </div>

        {/* Zeigt an, wie viele Bilder bereits ausgewählt wurden */}
        <p className="image-count">
          {uploadedImages.length === 0
            ? "Keine Bilder ausgewählt"
            : `${uploadedImages.length} Bild(er) ausgewählt`}
        </p>

        {/* Bilder-Vorschau (wenn mindestens 1 Bild vorhanden ist) */}
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

      {/* ----------------------------------------------------
         RECHTE SPALTE: VIDEO HOCHLADEN
         ---------------------------------------------------- */}
      <div className="upload-section">
        <h2>Video hochladen (max. 1 Video) 🎥</h2>

        {/* "input-group" für das versteckte Video-Input und den Button */}
        <div className="input-group">
          <input
            id="video-input"
            className="file-input-hidden"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
          />
          <button
            type="button"
            className="btn"
            onClick={() => document.getElementById("video-input").click()}
          >
            📁 Video auswählen
          </button>
        </div>

        {/* Text, ob schon ein Video ausgewählt wurde */}
        <p className="video-count">
          {videoFile ? "Eine Datei ausgewählt" : "Keine Datei ausgewählt"}
        </p>

        {/* Video-Vorschau, falls eine Preview-URL vorhanden ist */}
        {videoPreviewUrl && (
          <div className="video-preview centered-video">
            <video controls src={videoPreviewUrl} />
          </div>
        )}

        {/* Fortschrittsanzeige für den Video-Upload (nur sichtbar, wenn
            der Upload läuft und noch nicht abgeschlossen ist) */}
        {videoUploadProgress > 0 && videoUploadProgress < 100 && (
          <progress value={videoUploadProgress} max="100">
            {videoUploadProgress}%
          </progress>
        )}
      </div>
    </div>
  );
}

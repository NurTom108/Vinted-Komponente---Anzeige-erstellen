// Datei: src/components/AdUploadForm/ImageCropper.jsx
// Kurzer Überblick:
// Ermöglicht das Zuschneiden eines Bildes mit react-easy-crop.
// Der Nutzer kann den Ausschnitt, Zoom und Rotation anpassen. Sobald der Crop abgeschlossen ist,
// wird das zugeschnittene Bild (als DataURL) an den Callback onCropComplete übergeben.

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider"; // Slider-Komponente von MUI
import getCroppedImg from "./cropImage";
import "./ImageCropper.css";

// Die ImageCropper-Komponente
export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  // Lokale States für Crop-Position, Zoom und Rotation
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  // Speichert den exakten Pixelbereich, der zugeschnitten werden soll
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Zeigt Ladebalken
  const [isCropping, setIsCropping] = useState(false);

  // Callback von react-easy-crop, um den exakten Zuschnittbereich zu speichern
  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Wird aufgerufen, wenn der Nutzer den Crop bestätigt.
  // Zeigt den Laedebalken, erstellt des zugeschnittene Bild und ruft den onCropComplete-Callback auf.
  const handleCropConfirm = async () => {
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Crop-Fehler:", error);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="cropper-container">
      {/* Zeige einen Spinner, solange das Zuschneiden läuft */}
      {isCropping && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="cropper-wrapper">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteInternal}
        />
      </div>
      <div className="cropper-controls">
        {/* Steuerung für Zoom */}
        <div className="slider-container">
          <label htmlFor="zoom-slider">Zoom</label>
          <Slider
            id="zoom-slider"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, value) => setZoom(value)}
            aria-labelledby="Zoom"
          />
        </div>
        {/* Steuerung für Rotation */}
        <div className="slider-container">
          <label htmlFor="rotation-slider">Drehung</label>
          <Slider
            id="rotation-slider"
            value={rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e, value) => setRotation(value)}
            aria-labelledby="Rotation"
          />
        </div>
        {/* Buttons zum Zuschneiden oder Abbrechen */}
        <div className="button-group">
          <button className="btn" onClick={handleCropConfirm}>
            Zuschneiden ✔️
          </button>
          <button className="btn" onClick={onCancel}>
            Abbrechen ❌
          </button>
        </div>
      </div>
    </div>
  );
}

ImageCropper.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

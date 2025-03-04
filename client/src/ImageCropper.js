import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import getCroppedImg from "./cropImage";
import "./ImageCropper.css";

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error("Crop-Fehler:", e);
    }
  };

  return (
    <div className="cropper-container">
      <div className="cropper-wrapper">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3} // Passe das Seitenverhältnis nach Bedarf an
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteInternal}
        />
      </div>
      <div className="cropper-controls">
        <div className="slider-container">
          <label>Zoom</label>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, value) => setZoom(value)}
            aria-labelledby="Zoom"
          />
        </div>
        <div className="slider-container">
          <label>Drehung</label>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e, value) => setRotation(value)}
            aria-labelledby="Rotation"
          />
        </div>
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

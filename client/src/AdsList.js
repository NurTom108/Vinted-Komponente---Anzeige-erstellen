// Datei: src/components/AdsList/AdsList.jsx (oder ähnlich)

import React, { useState, useEffect } from "react";
import "./AdsList.css";

/**
 * Wandelt das JSON-Feld "imagePaths" in ein Array um.
 */
function parseImagePaths(imagePaths) {
  if (!imagePaths) return [];
  try {
    // Fall 1: String -> parse zu Array
    // Fall 2: Array -> benutze direkt
    let arr = typeof imagePaths === "string" ? JSON.parse(imagePaths) : imagePaths;
    if (typeof arr === "string") {
      arr = JSON.parse(arr);
    }
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error("Fehler beim Parsen von imagePaths:", err);
    return [];
  }
}

/**
 * Lightbox für Bilder (mit Pfeil-Navigation).
 */
function ImageLightbox({ images, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex);

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        <img src={images[index]} alt={`Slide ${index}`} className="lightbox-image" />
        {images.length > 1 && (
          <>
            <button className="lightbox-prev" onClick={handlePrev}>
              &#8249;
            </button>
            <button className="lightbox-next" onClick={handleNext}>
              &#8250;
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Lightbox für Videos (große Anzeige mit Controls).
 */
function VideoLightbox({ videoUrl, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        <video
          src={videoUrl}
          controls
          autoPlay
          className="video-lightbox-player"
        >
          Dein Browser unterstützt dieses Videoformat nicht.
        </video>
      </div>
    </div>
  );
}

/**
 * Listet alle Anzeigen auf. Zeigt Bilder (mit Lightbox) und Videos (mit Lightbox).
 */
export default function AdsList({ onBack }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bild-Lightbox
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Video-Lightbox
  const [videoUrl, setVideoUrl] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      try {
        const response = await fetch("http://localhost:8080/api/ads");
        if (!response.ok) {
          throw new Error("Serverfehler beim Laden der Anzeigen");
        }
        const data = await response.json();
        if (!data || data.length === 0) {
          setError("😕 Keine Anzeigen gefunden.");
        } else {
          setAds(data);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Anzeigen:", err);
        setError("❌ Die Anzeigen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  /**
   * Öffnet die Bild-Lightbox
   */
  const openLightbox = (images, index) => {
    const fullImageUrls = images.map(
      (filename) => `http://localhost:8080/api/ads/images/${encodeURIComponent(filename)}`
    );
    setLightboxImages(fullImageUrls);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  /**
   * Öffnet die Video-Lightbox mit einer bestimmten URL
   */
  const openVideoLightbox = (url) => {
    setVideoUrl(url);
    setIsVideoOpen(true);
  };

  // ---------------------------
  // Render-Logik
  // ---------------------------
  if (loading) return <p className="loading">Loading Anzeigen...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="ads-list-container">
      <h2>Alle Anzeigen</h2>

      <ul className="ads-list">
        {ads.map((ad) => {
          // Bilder parsen
          const images = parseImagePaths(ad.imagePaths);

          return (
            <li key={ad.id} className="ads-list-item ad-card">
              <h3 className="ad-title">{ad.title}</h3>
              <p className="ad-info">
                <strong>Kategorie:</strong> {ad.category}
              </p>
              <p className="ad-info">
                <strong>🔎 Zustand:</strong> {ad.condition}
              </p>
              <p className="ad-info">
                <strong>💶 Preis:</strong> {ad.price} €
              </p>
              <p className="ad-info">
                <strong>📝 Beschreibung:</strong> {ad.description}
              </p>

              {/* Kategoriespezifische Zusatzinformationen */}
              {ad.category === "Kleidung" && ad.adClothing && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>📏 Größe:</strong>{" "}
                    {ad.adClothing.clothingSize || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>👟 Marke:</strong>{" "}
                    {ad.adClothing.clothingBrand || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🧵 Material:</strong>{" "}
                    {ad.adClothing.clothingMaterial || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Elektronik" && ad.adElectronics && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>📱 Gerätetyp:</strong>{" "}
                    {ad.adElectronics.electronicDeviceType || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>💻 Betriebssystem:</strong>{" "}
                    {ad.adElectronics.electronicOS || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🔒 Garantie:</strong>{" "}
                    {ad.adElectronics.electronicWarranty || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Möbel" && ad.adFurniture && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>🪑 Stil:</strong>{" "}
                    {ad.adFurniture.furnitureStyle || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>📐 Abmessungen:</strong>{" "}
                    {ad.adFurniture.furnitureDimensions || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Accessoires" && ad.adAccessories && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>💍 Typ:</strong>{" "}
                    {ad.adAccessories.accessoryType || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Haushaltsgeräte" && ad.adHousehold && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>⚡ Energieeffizienz:</strong>{" "}
                    {ad.adHousehold.applianceEnergy || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🏷️ Marke:</strong>{" "}
                    {ad.adHousehold.applianceBrand || "Nicht angegeben"}
                  </p>
                </div>
              )}

              {/* Bilder (Lightbox beim Klick) */}
              {images.length > 0 ? (
                <div className="ad-images">
                  {images.map((filename, idx) => {
                    const imageUrl = `http://localhost:8080/api/ads/images/${encodeURIComponent(
                      filename
                    )}`;
                    return (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`Bild zu Anzeige ${ad.id}`}
                        className="ad-image clickable"
                        onClick={() => openLightbox(images, idx)}
                        onError={(e) => {
                          console.error("Bild konnte nicht geladen werden:", imageUrl);
                          e.target.src = "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="no-images">❌ Keine Bilder verfügbar</p>
              )}

              {/* Statt einem statischen Thumbnail ein echtes <video>,
                  das automatisch einen Frame als Vorschau zeigt.
                  Klick => Lightbox öffnet sich. */}
              {ad.video && (
                <div className="video-preview-wrapper">
                  <video
                    className="ad-video-preview"
                    src={`http://localhost:8080/api/ads/videos/${
                      encodeURIComponent(ad.video.path720p || ad.video.originalPath)
                    }`}
                    preload="metadata"
                    // Autoplay, muted und playsInline ermöglichen evtl. sofort sichtbare Vorschau
                    muted
                    playsInline
                    onClick={() =>
                      openVideoLightbox(
                        `http://localhost:8080/api/ads/videos/${
                          encodeURIComponent(ad.video.path720p || ad.video.originalPath)
                        }`
                      )
                    }
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* "Zurück"-Button, falls über Props mitgegeben */}
      {onBack && (
        <div className="btns-group">
          <button className="btn" onClick={onBack}>
            ⬅️ Zurück
          </button>
        </div>
      )}

      {/* Bild-Lightbox */}
      {isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Video-Lightbox */}
      {isVideoOpen && (
        <VideoLightbox
          videoUrl={videoUrl}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </div>
  );
}

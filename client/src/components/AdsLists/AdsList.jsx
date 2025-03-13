// Datei: src/components/AdUploadForm/AdsList.jsx
// Überblick: 
// Zeigt alle Anzeigen an. Es lädt die Anzeigen vom Server, 
// ermöglicht das Löschen von Anzeigen (falls der simulierte User mit dem tokenb es erlaubt),
// und zeigt Bild- und Video-Lightboxen, wenn der Nutzer auf die Medien klickt.

import React, { useState, useEffect } from "react";
import "./AdsList.css";

// Wandelt den JSON-String oder das Objekt in ein Array (ist Hilfsfunktion)
function parseImagePaths(imagePaths) {
  if (!imagePaths) return [];
  try {
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

// Lightbox für Bilder mit Navigation (vorher/nächster Slide)
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

// Lightbox für Videos
function VideoLightbox({ videoUrl, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        <video src={videoUrl} controls autoPlay className="video-lightbox-player">
          Dein Browser unterstützt dieses Videoformat nicht.
        </video>
      </div>
    </div>
  );
}

export default function AdsList({ onBack, simulatedUserToken, simulatedUserId }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Zustände für die Bild-Lightbox
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Zustände für die Video-Lightbox
  const [videoUrl, setVideoUrl] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Anzeigen vom Server laden, wenn der Token sich ändert
  useEffect(() => {
    async function fetchAds() {
      try {
        const response = await fetch("https://localhost:8443/api/ads", {
          headers: {
            "Authorization": `Bearer ${simulatedUserToken}`,
          },
        });
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
  }, [simulatedUserToken]);

  // Löscht eine Anzeige und entfernt sie aus dem lokalen State
  async function handleDeleteAd(adId) {
    try {
      const response = await fetch(`https://localhost:8443/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${simulatedUserToken}`,
        },
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      console.error("Fehler beim Löschen der Anzeige:", err);
      alert("Fehler beim Löschen der Anzeige: " + err.message);
    }
  }

  // SAS-Token aus der .env datei lesen
  const SAS_TOKEN = process.env.REACT_APP_AZURE_SAS_TOKEN || "";

  // Öffnet die Bild-Lightbox und erstellt vollständige URLs der Bilder
  const openLightbox = (images, index) => {
    const fullImageUrls = images.map(
      (filename) =>
        `https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/${encodeURIComponent(
          filename
        )}?${SAS_TOKEN}`
    );
    setLightboxImages(fullImageUrls);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Öffnet die Video-Lightbox mit der angegebenen URL
  const openVideoLightbox = (url) => {
    setVideoUrl(url);
    setIsVideoOpen(true);
  };

  if (loading) return <p className="loading">Loading Anzeigen...</p>;
  if (error) {
    return (
      <div className="error-container">
        <p className="error"> {error}</p>
        {onBack && (
          <button className="btn" onClick={onBack}>
            ⬅️ Zurück
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="ads-list-container">
      <h2>Alle Anzeigen</h2>
      <ul className="ads-list">
        {ads.map((ad) => {
          // Bildpfade parsen
          const images = parseImagePaths(ad.imagePaths);

          return (
            <li key={ad.id} className="ads-list-item ad-card">
              <h3 className="ad-title">{ad.title}</h3>
              {ad.userId && (
                <p className="ad-info">
                  <strong>Benutzer:</strong> {ad.userId}
                </p>
              )}
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

              {/* Zusatzinfos je nach Kategorie */}
              {ad.category === "Kleidung" && ad.adClothing && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>📏 Größe:</strong> {ad.adClothing.clothingSize || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>👟 Marke:</strong> {ad.adClothing.clothingBrand || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🧵 Material:</strong> {ad.adClothing.clothingMaterial || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Elektronik" && ad.adElectronics && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>📱 Gerätetyp:</strong> {ad.adElectronics.electronicDeviceType || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>💻 Betriebssystem:</strong> {ad.adElectronics.electronicOS || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🔒 Garantie:</strong> {ad.adElectronics.electronicWarranty || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Möbel" && ad.adFurniture && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>🪑 Stil:</strong> {ad.adFurniture.furnitureStyle || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>📐 Abmessungen:</strong> {ad.adFurniture.furnitureDimensions || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Accessoires" && ad.adAccessories && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>💍 Typ:</strong> {ad.adAccessories.accessoryType || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {ad.category === "Haushaltsgeräte" && ad.adHousehold && (
                <div className="ad-info extra-info">
                  <p>
                    <strong>⚡ Energieeffizienz:</strong> {ad.adHousehold.applianceEnergy || "Nicht angegeben"}
                  </p>
                  <p>
                    <strong>🏷️ Marke:</strong> {ad.adHousehold.applianceBrand || "Nicht angegeben"}
                  </p>
                </div>
              )}
              {/* Versand- und Zahlungsdetails */}
              <div className="ad-info extra-info">
               <p>
                 <strong>🚚 Versandanbieter:</strong>{" "}
                 {ad.shippingProviders && ad.shippingProviders.length > 0
                ? ad.shippingProviders.join(", ")
                  : "Nicht angegeben"}
               </p>
               <p>
                 <strong>📦 Versandart:</strong> {ad.shippingMethod || "Nicht angegeben"}
               </p>
                 <p>
               <strong>💳 Zahlungsmethode:</strong> {ad.paymentMethod || "Nicht angegeben"}
                </p>
              </div>

              {/* Bilder anzeigen mit Lightbox */}
              {images.length > 0 ? (
                <div className="ad-images">
                  {images.map((filename, idx) => {
                    const imageUrl = `https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/${encodeURIComponent(filename)}?${SAS_TOKEN}`;
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

              {/* Video-Vorschau */}
              {ad.video && (
                <div className="video-preview-wrapper">
                  <video
                    className="ad-video-preview"
                    src={`https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/${encodeURIComponent(ad.video.path720p || ad.video.originalPath)}?${SAS_TOKEN}`}
                    preload="metadata"
                    muted
                    playsInline
                    onClick={() =>
                      openVideoLightbox(
                        `https://vintedanzeigeerstellen.blob.core.windows.net/vintedanzeigeerstellen/${encodeURIComponent(ad.video.path720p || ad.video.originalPath)}?${SAS_TOKEN}`
                      )
                    }
                  />
                </div>
              )}

              {/* Lösch-Button, wenn die Anzeige zum simulierten Benutzer gehört */}
              {ad.userId === simulatedUserId && (
                <button className="btn-delete" onClick={() => handleDeleteAd(ad.id)}>
                  ❌ Anzeige löschen
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Zurück-Button */}
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

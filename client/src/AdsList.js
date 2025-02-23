import React, { useEffect, useState } from 'react';

export default function AdsList({ onBack }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAds() {
      try {
        const response = await fetch('http://localhost:3001/api/ads');
        if (!response.ok) {
          throw new Error("Serverfehler beim Laden der Anzeigen");
        }
        const data = await response.json();
        setAds(data);
      } catch (err) {
        console.error("Fehler beim Laden der Anzeigen:", err);
        setError("Die Anzeigen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  if (loading) return <p>Loading Anzeigen...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (ads.length === 0) {
    return (
      <div>
        <p>Es sind noch keine Anzeigen vorhanden.</p>
        {onBack && (
          <div className="btns-group">
            <button className="btn" onClick={onBack}>Zurück</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Alle Anzeigen</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {ads.map((ad) => (
          <li
            key={ad.id}
            style={{
              marginBottom: '2rem',
              borderBottom: '1px solid #ccc',
              paddingBottom: '1rem'
            }}
          >
            <h3>{ad.title}</h3>
            <p><strong>Kategorie:</strong> {ad.category}</p>
            <p><strong>Zustand:</strong> {ad.condition}</p>
            <p><strong>Preis:</strong> {ad.price} €</p>
            <p><strong>Beschreibung:</strong> {ad.description}</p>
            {ad.imagePaths && ad.imagePaths.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {ad.imagePaths.map((filename, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:3001/uploads/${filename}`}
                    alt={`Bild zu Anzeige ${ad.id}`}
                    style={{ width: '100px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Hier der Zurück-Button mit dem richtigen Styling */}
      {onBack && (
        <div className="btns-group">
          <button className="btn" onClick={onBack}>⬅️ Zurück</button>
        </div>
      )}
    </div>
  );
}

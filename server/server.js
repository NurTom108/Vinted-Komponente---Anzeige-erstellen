// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

// CORS erlauben (wenn dein Client auf Port 3000 läuft)
app.use(cors());

// Da wir mit Multer "multipart/form-data" nutzen, brauchst du express.json() nur für andere Routen
// Du kannst es drin lassen, aber für die Upload-Route wird Multer übernehmen.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1) Verbindung zur Datenbank herstellen
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err);
  } else {
    console.log('Mit SQLite verbunden.');
  }
});

// 2) Tabelle anlegen (falls noch nicht vorhanden)
//    Hier erweitern wir die Tabelle um mehrere Felder, u.a. "condition", "packageSize", "shippingMethod"
//    und ein TEXT-Feld "imagePaths", in das wir ein JSON-Array schreiben können.
db.run(`
  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    category TEXT,
    condition TEXT,
    packageSize TEXT,
    shippingMethod TEXT,
    imagePaths TEXT  -- Hier wird z.B. ein JSON-String aller hochgeladenen Bildnamen gespeichert
  )
`, (err) => {
  if (err) {
    console.error('Fehler beim Erstellen der Tabelle:', err);
  } else {
    console.log('Tabelle "ads" ist bereit (ggf. schon existent).');
  }
});

// 3) Multer konfigurieren (Speicherort & Dateinamen)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Hierhin werden die Bilder gespeichert
  },
  filename: (req, file, cb) => {
    // Dateiname z.B. Zeitstempel + Originalname
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 4) Damit die hochgeladenen Dateien statisch ausgeliefert werden können (optional):
//    Dann kannst du sie z.B. unter http://localhost:3001/uploads/deinBild.png abrufen
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 5) POST-Route zum Anlegen einer Anzeige mit mehreren Bildern
 * 
 *   - upload.array('images', 10) bedeutet: erwarte FormData-Feld 'images' mit bis zu 10 Dateien.
 *   - Titel & andere Textfelder kommen aus req.body.
 *   - Bilder liegen in req.files (als Array).
 */
app.post('/api/ads', upload.array('images', 10), (req, res) => {
  // Textfelder aus req.body:
  const {
    title,
    description,
    price,
    category,
    condition,
    packageSize,
    shippingMethod
  } = req.body;

  // Falls nötig: Validierung
  if (!title || !category) {
    return res.status(400).json({ error: 'Titel und Kategorie sind Pflichtfelder.' });
  }

  // Bilder liegen nun in req.files, z.B. [{ filename, originalname, ...}, ...]
  // Wir speichern nur "filename" in einem Array, das in der DB landet
  const imageFilenames = req.files.map(file => file.filename);

  // DB-Eintrag
  const insertSql = `
    INSERT INTO ads
      (title, description, price, category, condition, packageSize, shippingMethod, imagePaths)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertSql,
    [
      title,
      description || '',
      price || 0,
      category,
      condition || '',
      packageSize || '',
      shippingMethod || '',
      JSON.stringify(imageFilenames)  // Hier speichern wir ein JSON-Array
    ],
    function(err) {
      if (err) {
        console.error('Fehler beim Einfügen in die DB:', err);
        return res.status(500).json({ error: 'Datenbankfehler beim Einfügen.' });
      }
      res.json({ success: true, adId: this.lastID });
    }
  );
});

// 6) GET-Route: Alle Anzeigen auslesen
app.get('/api/ads', (req, res) => {
  db.all('SELECT * FROM ads', (err, rows) => {
    if (err) {
      console.error('Fehler beim Auslesen:', err);
      return res.status(500).json({ error: 'Datenbankfehler beim Auslesen.' });
    }

    // rows[i].imagePaths ist z.B. ein JSON-String wie '["123456789-img.png","..."]'
    // Du kannst es hier schon parsen, damit du dem Client ein array gibst:
    const parsedRows = rows.map(row => {
      return {
        ...row,
        imagePaths: row.imagePaths ? JSON.parse(row.imagePaths) : []
      };
    });

    res.json(parsedRows);
  });
});

// 7) Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

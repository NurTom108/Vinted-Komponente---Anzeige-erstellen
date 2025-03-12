// Lädt ein Bild von einer URL und gibt ein Promise zurück, das das Image-Objekt liefert.
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    // Setze crossOrigin, um CORS-Probleme zu vermeiden.
    image.setAttribute("crossOrigin", "anonymous");
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Konvertiert einen Grad-Wert um des Bild dann halt zu drehen
function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

// Schneidet ein Bild anhand von Pixelkoordinaten und einer Rotation zu.
// Lädt das Bild, berechnet eine "sichere Fläche" zum Rotieren, rotiert das Bild
// und extrahiert dann den gewünschten Bereich. Gibt eine DataURL (JPEG) des zugeschnittenen Bildes zurück.
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = Math.ceil(maxSize * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Zeichn das Bild in der Mitte des Canvas
  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  // Hole die Bilddaten der gesamten sicheren Fläche
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Setztdas Canvas auf die Größe des gewünschten Ausschnitts
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Verschiebt die Bilddaten so, dass der gewünschte Bereich extrahiert wird
  ctx.putImageData(
    data,
    Math.round(0 - (safeArea / 2 - image.width / 2) - pixelCrop.x),
    Math.round(0 - (safeArea / 2 - image.height / 2) - pixelCrop.y)
  );

  // Gib das zugeschnittene Bild als JPEG DataURL zurück
  return canvas.toDataURL("image/jpeg");
}

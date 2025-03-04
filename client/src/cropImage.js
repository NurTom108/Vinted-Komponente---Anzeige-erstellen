const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // wichtig, um CORS-Probleme zu vermeiden
      image.src = url;
    });
  
  function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
  }
  
  export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
  
    // Setze Canvas-Größe auf die "sichere" Fläche, damit beim Drehen nichts abgeschnitten wird.
    canvas.width = safeArea;
    canvas.height = safeArea;
  
    // Verschiebe den Kontext in die Mitte, drehe, und verschiebe wieder zurück
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);
  
    // Zeichne das Bild in die "sichere" Fläche
    ctx.drawImage(
      image,
      (safeArea - image.width) / 2,
      (safeArea - image.height) / 2
    );
  
    // Hole das Bilddaten-Objekt
    const data = ctx.getImageData(0, 0, safeArea, safeArea);
  
    // Setze die Canvas-Größe auf die Zielgröße des Crops
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    // Füge die Bilddaten wieder ein, verschoben um den gewünschten Ausschnitt
    ctx.putImageData(
      data,
      Math.round(0 - (safeArea / 2 - image.width / 2) - pixelCrop.x),
      Math.round(0 - (safeArea / 2 - image.height / 2) - pixelCrop.y)
    );
  
    // Liefere das zugeschnittene Bild als DataURL zurück
    return canvas.toDataURL("image/jpeg");
  }
  
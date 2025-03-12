// Datei: src/components/Toast.jsx
import React from "react";



export default function Toast({ message, onClose }) {
  if (!message) return null;

  // Automatisch nach 3s schließen:
  setTimeout(onClose, 3000);

  return <div className="toast">{message}</div>;
}

import React from "react";
// import "./MultiSelectDropdown.css"; 
// (optional, falls du spezielles CSS verwenden willst)

export default function MultiSelectDropdown({
  id,
  selectedValues,
  placeholder,
  options,
  error,
  onToggleOption,
  show,
  toggle,
}) {
  return (
    <div className="dropdown">
      <button
        id={id}
        type="button"
        className={`dropdown-toggle ${error ? "error-border" : ""}`}
        onClick={toggle}
      >
        {selectedValues.length === 0 ? placeholder : selectedValues.join(", ")} ▼
      </button>
      {show && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li key={option.value} onClick={() => onToggleOption(option.value)}>
              {selectedValues.includes(option.value) ? "✅ " : ""}
              {option.emoji} {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

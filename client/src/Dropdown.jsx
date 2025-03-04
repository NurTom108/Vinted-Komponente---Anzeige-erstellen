import React from "react";

// (optional, falls du spezielles Dropdown-CSS möchtest, sonst weglassen)

export default function Dropdown({
  id,
  value,
  placeholder,
  options,
  error,
  onSelect,
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
        {value || placeholder} ▼
      </button>
      {show && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                toggle();
              }}
            >
              {option.emoji} {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

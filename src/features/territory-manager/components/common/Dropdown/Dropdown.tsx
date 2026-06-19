import React from 'react';
import './DropdownStyles.css';

export interface DropdownOption {
  value: number | string;
  label: string;
}

interface DropdownProps {
  id: string;
  label: string;
  value: number | string;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  value,
  options,
  placeholder = '-- Select --',
  disabled = false,
  hint,
  onChange,
}) => (
  <div className="dropdown-container">
    <label
      htmlFor={id}
      className={`dropdown-label ${disabled ? 'disabled' : ''}`}
    >
      {label}
      {hint && (
        <span className="dropdown-hint">
          {hint}
        </span>
      )}
    </label>
    <select
      id={id}
      className="dropdown-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

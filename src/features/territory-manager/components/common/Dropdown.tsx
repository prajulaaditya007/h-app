import React from 'react';

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
  /** Hint text shown next to the label when disabled (e.g. "select a territory first") */
  hint?: string;
  onChange: (value: string) => void;
}

/**
 * Reusable labeled <select> dropdown.
 * Used inside MoveBranchesForm for each territory level.
 */
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
  <div className="mb-3">
    <label
      htmlFor={id}
      className={`form-label fw-bold small mb-1 ${disabled ? 'text-muted' : 'text-dark'}`}
    >
      {label}
      {hint && (
        <span className="ms-1 fw-normal text-muted" style={{ fontSize: '0.75rem' }}>
          {hint}
        </span>
      )}
    </label>
    <select
      id={id}
      className={`form-select form-select-sm ${disabled ? 'bg-light text-muted' : ''}`}
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

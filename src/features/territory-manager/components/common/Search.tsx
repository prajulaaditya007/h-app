import React, { useState, useEffect, useRef } from 'react';

interface SearchProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** 'sm' uses form-control-sm; 'default' uses full-size form-control */
  size?: 'sm' | 'default';
  minChars?: number;
}

/**
 * Reusable search input with a magnifier icon.
 * Supports optional minChars constraint to defer parent updates.
 */
export const Search: React.FC<SearchProps> = ({
  id,
  placeholder,
  value,
  onChange,
  label,
  size = 'sm',
  minChars = 0,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const lastPropagatedValueRef = useRef(value);

  // Sync parent's external value resets (e.g. on clearing selection)
  useEffect(() => {
    if (value !== lastPropagatedValueRef.current) {
      setLocalValue(value);
      lastPropagatedValueRef.current = value;
    }
  }, [value]);

  const handleChange = (newVal: string) => {
    setLocalValue(newVal);

    if (minChars > 0) {
      const trimmed = newVal.trim();
      if (trimmed.length === 0 || trimmed.length >= minChars) {
        lastPropagatedValueRef.current = newVal;
        onChange(newVal);
      } else {
        // If parent state is not empty, propagate empty to clear parent state
        if (lastPropagatedValueRef.current !== '') {
          lastPropagatedValueRef.current = '';
          onChange('');
        }
      }
    } else {
      lastPropagatedValueRef.current = newVal;
      onChange(newVal);
    }
  };

  const inputClass =
    size === 'sm'
      ? 'form-control form-control-sm ps-4'
      : 'form-control ps-4';

  return (
    <div className="d-flex align-items-center gap-2 w-100">
      {label && (
        <label htmlFor={id} className="fw-bold mb-0 text-muted text-nowrap">
          {label}
        </label>
      )}
      <div className="position-relative flex-grow-1">
        <input
          id={id}
          type="text"
          className={inputClass}
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
        />
        <span
          className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted"
          style={{ fontSize: '0.85rem', pointerEvents: 'none' }}
        >
          🔍
        </span>
      </div>
    </div>
  );
};

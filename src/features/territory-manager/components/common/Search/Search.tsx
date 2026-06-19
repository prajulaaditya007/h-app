import React, { useState, useEffect, useRef } from 'react';
import './SearchStyles.css';

interface SearchProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'sm' | 'default';
  minChars?: number;
}

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

  return (
    <div className="search-input-wrapper">
      {label && (
        <label htmlFor={id} className="search-input-label">
          {label}
        </label>
      )}
      <div className="search-field-container">
        <input
          id={id}
          type="text"
          className={`search-input-control size-${size}`}
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
        />
        <span className="search-icon-indicator">
          🔍
        </span>
      </div>
    </div>
  );
};

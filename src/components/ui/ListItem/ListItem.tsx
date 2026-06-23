import React from 'react';
import './ListItemStyles.css';

export type ListItemVariant = 'territory' | 'sub-territory' | 'branch';

export interface ListItemProps {
  variant?: ListItemVariant;
  label: string;
  sublabel?: React.ReactNode;
  isSelected?: boolean;
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  variant = 'branch',
  label,
  sublabel,
  isSelected = false,
  startSlot,
  endSlot,
  onClick,
  className = '',
  style,
  id,
}) => {
  const rootClasses = [
    'list-item-container',
    variant,
    isSelected ? 'selected' : '',
    onClick ? 'clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      id={id}
      className={rootClasses}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {startSlot && (
        <div className="list-item-start-slot">
          {startSlot}
        </div>
      )}

      <div className="list-item-content">
        <span className="list-item-label">
          {label}
        </span>
        {sublabel && (
          <span className="list-item-sublabel">
            {sublabel}
          </span>
        )}
      </div>

      {endSlot && (
        <div className="list-item-end-slot">
          {endSlot}
        </div>
      )}
    </div>
  );
};

ListItem.displayName = 'ListItem';

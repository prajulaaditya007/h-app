import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Visual depth variant. Maps to indentation level and typographic weight.
 *
 *  territory     → bold, larger accent  (top-level regions)
 *  sub-territory → medium weight        (states / sub-regions)
 *  branch        → regular weight, muted indicator (leaf items)
 */
export type ListItemVariant = 'territory' | 'sub-territory' | 'branch';

export interface ListItemProps {
  /** Visual hierarchy level */
  variant?: ListItemVariant;

  /** Primary label */
  label: string;

  /** Secondary line beneath the label (ID, territory name, description…) */
  sublabel?: React.ReactNode;

  /** Whether this row is currently selected / checked */
  isSelected?: boolean;

  /** Slot rendered before the label — checkbox, expand-arrow, bullet dot… */
  startSlot?: React.ReactNode;

  /** Slot rendered after the label — badge count, action buttons… */
  endSlot?: React.ReactNode;

  /** Click handler for the whole row */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  /** Extra className forwarded to the root element */
  className?: string;

  /** Extra inline style forwarded to the root element */
  style?: React.CSSProperties;

  /** data-testid / aria helpers */
  id?: string;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  ListItemVariant,
  {
    selectedBg: string;
    selectedText: string;
    defaultBg: string;
    defaultBorder: string;
    selectedBorder: string;
    labelClass: string;
    paddingClass: string;
  }
> = {
  territory: {
    selectedBg: 'bg-success-subtle',
    selectedText: 'text-success-emphasis',
    defaultBg: 'bg-body',
    defaultBorder: 'border-light-subtle',
    selectedBorder: 'border-success',
    labelClass: 'fw-semibold',
    paddingClass: 'p-2',
  },
  'sub-territory': {
    selectedBg: 'bg-success-subtle',
    selectedText: 'text-success-emphasis',
    defaultBg: 'bg-body',
    defaultBorder: 'border-light-subtle',
    selectedBorder: 'border-success',
    labelClass: 'fw-medium',
    paddingClass: 'p-2',
  },
  branch: {
    selectedBg: 'bg-primary-subtle',
    selectedText: 'text-primary-emphasis',
    defaultBg: 'bg-body',
    defaultBorder: 'border-light-subtle',
    selectedBorder: 'border-primary',
    labelClass: 'fw-medium',
    paddingClass: 'px-2 py-2',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ListItem — the single visual primitive for all list rows in this app.
 *
 * Usage patterns:
 *
 *   Territory / Sub-territory (accordion header):
 *     <ListItem variant="territory" label={node.nodeNm} sublabel={node.nodeDesc}
 *               isSelected={isSelected} startSlot={<ExpandButton />} endSlot={<Badge />} />
 *
 *   Branch leaf inside accordion expansion:
 *     <ListItem variant="branch" label={branch.branchNm} sublabel={`ID: ${branch.brancheId}`}
 *               startSlot={<BulletDot />} />
 *
 *   Assigned / Unassigned branch row:
 *     <ListItem variant="branch" label={branch.branchNm} sublabel={`ID: ${branch.brancheId} | ${nodeNm}`}
 *               isSelected={isSelected} startSlot={<Checkbox />} />
 */
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
  const cfg = variantConfig[variant];

  const rootClasses = [
    'd-flex align-items-center gap-2 border rounded mb-2',
    cfg.paddingClass,
    isSelected ? cfg.selectedBg : cfg.defaultBg,
    isSelected ? cfg.selectedBorder : cfg.defaultBorder,
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={id}
      className={rootClasses}
      style={{
        transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
        cursor: onClick ? 'pointer' : undefined,
        borderLeft: isSelected && variant !== 'branch' ? '4px solid #198754' : undefined,
        ...style,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as unknown as React.MouseEvent<HTMLDivElement>); } : undefined}
    >
      {/* Start slot — checkbox, expand arrow, bullet indicator */}
      {startSlot && (
        <div className="d-flex align-items-center flex-shrink-0">
          {startSlot}
        </div>
      )}

      {/* Main content */}
      <div className="d-flex flex-column overflow-hidden flex-grow-1">
        <span
          className={[
            cfg.labelClass,
            'text-truncate lh-sm',
            isSelected ? cfg.selectedText : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ fontSize: variant === 'territory' ? '0.9rem' : '0.85rem' }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className="text-muted text-truncate d-block"
            style={{ fontSize: '0.72rem', marginTop: '1px' }}
          >
            {sublabel}
          </span>
        )}
      </div>

      {/* End slot — badges, action buttons */}
      {endSlot && (
        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
          {endSlot}
        </div>
      )}
    </div>
  );
};

ListItem.displayName = 'ListItem';

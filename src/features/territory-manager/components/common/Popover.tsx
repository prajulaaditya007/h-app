import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PopoverAction {
  label: string;
  icon?: string;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface PopoverProps {
  /** The trigger element — clicking it opens/closes the popover */
  trigger: React.ReactElement;
  /** Actions to render as a menu */
  actions: PopoverAction[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Popover — a lightweight, self-positioning action menu that portals to
 * document.body so it is never clipped by overflow:hidden parents.
 *
 * Usage:
 *   <Popover
 *     trigger={<button>•••</button>}
 *     actions={[
 *       { label: 'Reassign', icon: '↗', onClick: handleReassign },
 *       { label: 'Delete',   icon: '🗑', variant: 'danger', onClick: handleDelete },
 *     ]}
 *   />
 */
export const Popover: React.FC<PopoverProps> = ({ trigger, actions }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 176; // fixed menu width
    const spaceRight = window.innerWidth - rect.right;

    setPosition({
      top: rect.bottom + window.scrollY + 4,
      left:
        spaceRight >= menuWidth
          ? rect.left + window.scrollX
          : rect.right + window.scrollX - menuWidth,
    });
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) calculatePosition();
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    const reposition = () => calculatePosition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, calculatePosition]);

  const menu = open
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: '176px',
            zIndex: 9999,
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '4px 0',
            animation: 'fadeSlideDown 0.12s ease-out',
          }}
        >
          {actions.map((action, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 14px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                fontSize: '0.84rem',
                fontWeight: 500,
                cursor: 'pointer',
                color: action.variant === 'danger' ? '#dc3545' : '#212529',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  action.variant === 'danger' ? '#fff5f5' : '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              {action.icon && (
                <span style={{ fontSize: '0.9rem', width: '16px', textAlign: 'center' }}>
                  {action.icon}
                </span>
              )}
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={triggerRef} style={{ display: 'inline-flex' }} onClick={handleToggle}>
        {trigger}
      </div>
      {menu}
    </>
  );
};

Popover.displayName = 'Popover';

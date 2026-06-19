import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1040 }}
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        role="dialog" 
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px' }}>
            {/* Header */}
            <div className="modal-header bg-light border-bottom-0 pb-0 pt-3 px-3 d-flex justify-content-between align-items-center">
              <h5 className="modal-title fw-bold text-dark">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
                onClick={onClose}
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="modal-body px-3 py-3">
              {children}
            </div>
            
            {/* Footer */}
            <div className="modal-footer border-top-0 pt-0 pb-3 px-3 d-flex justify-content-end gap-2">
              {footer ? (
                footer
              ) : (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

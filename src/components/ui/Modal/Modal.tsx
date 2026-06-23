import React from 'react';
import './ModalStyles.css';

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
        className="modal-backdrop-custom" 
        onClick={onClose}
      />
      
      {/* Modal Dialog Wrapper */}
      <div 
        className="modal-wrapper-custom" 
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog-custom">
          <div className="modal-content-custom">
            {/* Header */}
            <div className="modal-header-custom">
              <h5 className="modal-title-custom">{title}</h5>
              <button 
                type="button" 
                className="btn-modal-close" 
                aria-label="Close" 
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="modal-body-custom">
              {children}
            </div>
            
            {/* Footer */}
            <div className="modal-footer-custom">
              {footer ? (
                footer
              ) : (
                <button 
                  type="button" 
                  className="btn-secondary" 
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

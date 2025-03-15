import React from 'react';
import { useModal } from './ModalContext.js';

export interface SelectModalProps {
  /** Custom class name for the modal container */
  className?: string;
  /** Custom styles for the modal container */
  style?: React.CSSProperties;
  /** Content to render inside the modal */
  children?: React.ReactNode;
  /** Function to render a custom close button */
  renderCloseButton?: () => React.ReactNode;
}

/**
 * Modal component for wallet selection
 * Uses the modal store to manage visibility state
 */
export function SelectModal({
  className,
  style,
  children,
  renderCloseButton,
}: SelectModalProps) {
  const { isSelectModalOpen, closeSelectModal } = useModal();

  if (!isSelectModalOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        className={`modal-container ${className || ''}`}
        style={style}
      >
        {renderCloseButton ? (
          renderCloseButton()
        ) : (
          <button 
            className="modal-close"
            onClick={() => closeSelectModal()}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// Add default styling
const style = document.createElement('style');
style.textContent = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    position: relative;
    min-width: 300px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    line-height: 1;
  }

  .modal-close:hover {
    opacity: 0.7;
  }
`;
document.head.appendChild(style);
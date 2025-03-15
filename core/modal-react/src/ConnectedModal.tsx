import React from 'react';
import { useModal } from './ModalContext.js';

export interface ConnectedModalProps {
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
 * Modal component for connected wallet state
 * Uses the modal store to manage visibility state
 */
export function ConnectedModal({
  className,
  style,
  children,
  renderCloseButton,
}: ConnectedModalProps) {
  const { isConnectedModalOpen, closeConnectedModal } = useModal();

  if (!isConnectedModalOpen) return null;

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
            onClick={() => closeConnectedModal()}
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
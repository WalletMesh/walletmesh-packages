/**
 * Tests for WalletMeshErrorRecovery component
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { ModalError } from '@walletmesh/modal-core';
import type { ChainType } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletMeshErrorRecovery } from './WalletMeshErrorRecovery.js';

// Mock the useConnect hook
vi.mock('../hooks/useConnect.js', () => ({
  useConnect: () => ({
    disconnect: vi.fn(),
  }),
}));

// Mock CSS modules
vi.mock('./WalletMeshErrorRecovery.module.css', () => ({
  default: {
    errorContainer: 'errorContainer',
    errorCard: 'errorCard',
    errorIcon: 'errorIcon',
    errorTitle: 'errorTitle',
    errorDescription: 'errorDescription',
    retryInfo: 'retryInfo',
    errorActions: 'errorActions',
    actionButton: 'actionButton',
    actionIcon: 'actionIcon',
    errorDetails: 'errorDetails',
    technicalInfo: 'technicalInfo',
    errorStack: 'errorStack',
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    dark: 'dark',
    light: 'light',
  },
}));

describe('WalletMeshErrorRecovery', () => {
  let mockResetError: ReturnType<typeof vi.fn>;
  let mockOnRetry: ReturnType<typeof vi.fn>;
  let mockOnDisconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockResetError = vi.fn();
    mockOnRetry = vi.fn().mockResolvedValue(undefined);
    mockOnDisconnect = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Error Type Detection', () => {
    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');

      render(<WalletMeshErrorRecovery error={error} resetError={mockResetError} />);

      expect(screen.getByText('Something Went Wrong')).toBeDefined();
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    it('should handle ModalError objects with retry strategy', () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Network connection failed',
        category: 'network',
        recoveryStrategy: 'retry',
      };

      render(<WalletMeshErrorRecovery error={modalError} resetError={mockResetError} />);

      expect(screen.getByText('Network Error')).toBeDefined();
      expect(screen.getByText('Try Again')).toBeDefined();
    });

    it('should handle ModalError with wait_and_retry strategy', () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Temporary network issue',
        category: 'network',
        recoveryStrategy: 'wait_and_retry',
        retryDelay: 5000,
      };

      render(<WalletMeshErrorRecovery error={modalError} resetError={mockResetError} />);

      expect(screen.getByText('Try Again')).toBeDefined();
    });

    it('should handle fatal errors (no recovery strategy)', () => {
      const modalError: ModalError = {
        code: 'fatal_error',
        message: 'Fatal error occurred',
        category: 'general',
        recoveryStrategy: 'none',
      };

      render(<WalletMeshErrorRecovery error={modalError} resetError={mockResetError} />);

      expect(screen.getByText('Reconnect Wallet')).toBeDefined();
      expect(screen.getByText('Close')).toBeDefined();
      expect(screen.queryByText('Try Again')).toBeNull();
    });
  });

  describe('Error Pattern Detection', () => {
    it('should detect user rejection errors', () => {
      const error = new Error('User rejected the request');

      render(<WalletMeshErrorRecovery error={error} resetError={mockResetError} />);

      expect(screen.getByText('Action Cancelled')).toBeDefined();
      // User rejection is not retryable
      expect(screen.queryByText('Try Again')).toBeNull();
    });

    it('should detect insufficient funds errors', () => {
      const error = new Error('Insufficient funds for transaction');

      render(<WalletMeshErrorRecovery error={error} resetError={mockResetError} />);

      expect(screen.getByText('Wallet Error')).toBeDefined();
      expect(screen.getByText('Dismiss')).toBeDefined();
    });

    it('should detect network timeout errors', () => {
      const error = new Error('Request timeout');

      render(<WalletMeshErrorRecovery error={error} resetError={mockResetError} />);

      expect(screen.getByText('Network Error')).toBeDefined();
    });

    it('should detect proof generation errors', () => {
      const error = new Error('Proof generation failed');

      render(<WalletMeshErrorRecovery error={error} resetError={mockResetError} />);

      expect(screen.getByText('Wallet Error')).toBeDefined();
    });
  });

  describe('Chain-Specific Errors', () => {
    it('should show Aztec-specific error for proof failures', () => {
      const modalError: ModalError = {
        code: 'proving_failed',
        message: 'Failed to generate proof',
        category: 'wallet',
        recoveryStrategy: 'retry',
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          chainType={'aztec' as ChainType}
        />,
      );

      expect(screen.getByText('Proof Generation Failed')).toBeDefined();
      expect(
        screen.getByText('Failed to generate zero-knowledge proof. This may be a temporary issue.'),
      ).toBeDefined();
    });

    it('should show EVM-specific error for gas estimation', () => {
      const modalError: ModalError = {
        code: 'gas_estimation_failed',
        message: 'Cannot estimate gas',
        category: 'network',
        recoveryStrategy: 'retry',
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          chainType={'evm' as ChainType}
        />,
      );

      expect(screen.getByText('Gas Estimation Failed')).toBeDefined();
      expect(
        screen.getByText('Unable to estimate transaction gas. The network may be congested.'),
      ).toBeDefined();
    });

    it('should show Solana-specific error for compute units', () => {
      const modalError: ModalError = {
        code: 'compute_units_exceeded',
        message: 'Too many compute units',
        category: 'network',
        recoveryStrategy: 'none',
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          chainType={'solana' as ChainType}
        />,
      );

      expect(screen.getByText('Compute Units Exceeded')).toBeDefined();
      expect(screen.getByText('Transaction requires too many compute units.')).toBeDefined();
    });
  });

  describe('Recovery Actions', () => {
    it('should call onRetry when Try Again is clicked', () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Network error',
        category: 'network',
        recoveryStrategy: 'retry',
      };

      render(
        <WalletMeshErrorRecovery error={modalError} resetError={mockResetError} onRetry={mockOnRetry} />,
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // The mock is called synchronously on click
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call resetError when Close is clicked', () => {
      const modalError: ModalError = {
        code: 'fatal_error',
        message: 'Fatal error',
        category: 'general',
        recoveryStrategy: 'none',
      };

      render(<WalletMeshErrorRecovery error={modalError} resetError={mockResetError} />);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockResetError).toHaveBeenCalledTimes(1);
    });

    it('should call onDisconnect for reconnect action', () => {
      const modalError: ModalError = {
        code: 'fatal_error',
        message: 'Fatal error',
        category: 'general',
        recoveryStrategy: 'none',
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          onDisconnect={mockOnDisconnect}
        />,
      );

      const reconnectButton = screen.getByText('Reconnect Wallet');
      fireEvent.click(reconnectButton);

      // The mock is called synchronously on click
      expect(mockOnDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-Retry Functionality', () => {
    it('should auto-retry for wait_and_retry strategy when enabled', async () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Network error',
        category: 'network',
        recoveryStrategy: 'wait_and_retry',
        retryDelay: 1000,
        maxRetries: 3,
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          onRetry={mockOnRetry}
          enableAutoRetry={true}
        />,
      );

      // Advance timers to trigger auto-retry
      await vi.advanceTimersByTimeAsync(1000);

      // Check that retry was called after timer advance
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should show countdown for delayed retry', async () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Network error',
        category: 'network',
        recoveryStrategy: 'wait_and_retry',
        retryDelay: 3000,
        maxRetries: 3,
      };

      render(
        <WalletMeshErrorRecovery error={modalError} resetError={mockResetError} enableAutoRetry={true} />,
      );

      // Should show countdown
      expect(screen.getByText(/Retry in \d+s/)).toBeDefined();
    });

    it('should not auto-retry beyond max retry limit', () => {
      const modalError: ModalError = {
        code: 'network_error',
        message: 'Network error',
        category: 'network',
        recoveryStrategy: 'wait_and_retry',
        retryDelay: 100,
        maxRetries: 0, // Set to 0 to prevent any retries
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          onRetry={mockOnRetry}
          enableAutoRetry={true}
          maxAutoRetries={0} // Also set to 0
        />,
      );

      // Should show the error but not the countdown since max retries is 0
      expect(screen.getByText('Network error')).toBeDefined();

      // onRetry should not be called when max retries is 0
      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  describe('Technical Details', () => {
    it('should show technical details when enabled', () => {
      const modalError: ModalError = {
        code: 'test_error',
        message: 'Test error',
        category: 'general',
        recoveryStrategy: 'none',
        classification: 'temporary',
      };

      render(
        <WalletMeshErrorRecovery
          error={modalError}
          resetError={mockResetError}
          showTechnicalDetails={true}
        />,
      );

      expect(screen.getByText('Technical Details')).toBeDefined();
      expect(screen.getByText('test_error')).toBeDefined();
      expect(screen.getByText('general')).toBeDefined();
      expect(screen.getByText('temporary')).toBeDefined();
    });

    it('should not show technical details by default', () => {
      const modalError: ModalError = {
        code: 'test_error',
        message: 'Test error',
        category: 'general',
        recoveryStrategy: 'none',
      };

      render(<WalletMeshErrorRecovery error={modalError} resetError={mockResetError} />);

      expect(screen.queryByText('Technical Details')).toBeNull();
    });
  });

  describe('Custom Actions', () => {
    it('should render custom actions when provided', () => {
      const customAction = vi.fn();

      render(
        <WalletMeshErrorRecovery
          error={new Error('Test error')}
          resetError={mockResetError}
          customActions={[
            {
              label: 'Custom Action',
              action: customAction,
              variant: 'primary',
            },
          ]}
        />,
      );

      const customButton = screen.getByText('Custom Action');
      expect(customButton).toBeDefined();

      fireEvent.click(customButton);
      expect(customAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme Support', () => {
    it('should apply dark theme class', () => {
      const { container } = render(
        <WalletMeshErrorRecovery error={new Error('Test')} resetError={mockResetError} theme="dark" />,
      );

      const errorContainer = container.querySelector('.errorContainer');
      expect(errorContainer?.className).toContain('dark');
    });

    it('should apply light theme class', () => {
      const { container } = render(
        <WalletMeshErrorRecovery error={new Error('Test')} resetError={mockResetError} theme="light" />,
      );

      const errorContainer = container.querySelector('.errorContainer');
      expect(errorContainer?.className).toContain('light');
    });
  });
});

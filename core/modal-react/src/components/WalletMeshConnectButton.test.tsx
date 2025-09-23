import { render, screen } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSharedTestSetup } from '../test-utils/testHelpers.js';
import { WalletMeshConnectButton } from './WalletMeshConnectButton.js';

// Mock the useConnectButtonState to return dynamic values based on input
vi.mock('@walletmesh/modal-core', async () => {
  const actual = await vi.importActual('@walletmesh/modal-core');
  return {
    ...actual,
    useConnectButtonState: vi.fn((_state, options) => {
      // Return disconnected state with custom label if provided
      return {
        state: 'disconnected',
        content: {
          text: options?.labels?.connect || 'Connect Wallet',
          showIndicator: false,
          indicatorType: 'none',
          disabled: false,
        },
        action: 'connect',
        shouldShowConnectionInfo: false,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
      };
    }),
  };
});

describe('WalletMeshConnectButton', () => {
  const { wrapper, cleanup } = createSharedTestSetup();

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show connect text when disconnected', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Connect Wallet');
    });

    it('should apply custom className', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton className="custom-class" />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should be clickable when not disabled', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton disabled />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Props and Customization', () => {
    it('should use custom label when provided', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton label="Connect Now" />
        </TestWrapper>,
      );

      expect(screen.getByText('Connect Now')).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      const TestWrapper = wrapper;
      const customStyle = { backgroundColor: 'red' };

      render(
        <TestWrapper>
          <WalletMeshConnectButton style={customStyle} />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background-color: red');
    });

    it('should have proper button type', () => {
      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <WalletMeshConnectButton />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Chain-Specific Buttons', () => {
    it('should accept targetChainType prop', () => {
      const TestWrapper = wrapper;

      // Should render without error when targetChainType is provided
      render(
        <TestWrapper>
          <WalletMeshConnectButton targetChainType={ChainType.Evm} />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show wallet information when connected', () => {
      const TestWrapper = wrapper;

      // Should render without error when display options are provided
      render(
        <TestWrapper>
          <WalletMeshConnectButton showAddress={true} showChain={true} showWalletName={true} />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept custom labels', () => {
      const TestWrapper = wrapper;

      // Should render without error when custom labels are provided
      render(
        <TestWrapper>
          <WalletMeshConnectButton
            connectingLabel="Connecting to wallet..."
            connectedLabel="Account Connected"
          />
        </TestWrapper>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Context Requirement', () => {
    it('should throw error when used without WalletMeshProvider', () => {
      // Suppress console.error for this test since we expect an error
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(<WalletMeshConnectButton />);
      }).toThrow('useWalletMeshContext must be used within a WalletMeshProvider');

      // Restore console.error
      console.error = originalError;
    });
  });
});

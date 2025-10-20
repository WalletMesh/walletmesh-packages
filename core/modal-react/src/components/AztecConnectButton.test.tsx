/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { AztecConnectButton } from './AztecConnectButton.js';

// Mock the CSS module
vi.mock('./AztecConnectButton.module.css', () => ({
  default: {
    aztecButton: 'aztecButton',
    aztecButtonContainer: 'aztecButtonContainer',
    proving: 'proving',
    provingBadge: 'provingBadge',
    provingIcon: 'provingIcon',
    provingText: 'provingText',
  },
}));

// Mock the useConnectButtonState from modal-core
vi.mock('@walletmesh/modal-core', async () => {
  const actual = await vi.importActual('@walletmesh/modal-core');
  return {
    ...actual,
    getAztecProvingState: actual['getAztecProvingState'] ?? (() => ({ entries: {} })),
    getActiveAztecProvingEntries: actual['getActiveAztecProvingEntries'] ?? (() => []),
    provingActions: actual['provingActions'] ?? { handleNotification: vi.fn(), clearAll: vi.fn() },
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

describe('AztecConnectButton', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  it('renders with Aztec-specific label by default', () => {
    render(<AztecConnectButton />, { wrapper });

    expect(screen.getByText('Connect Aztec Wallet')).toBeInTheDocument();
  });

  it('allows custom labels', () => {
    render(<AztecConnectButton label="Custom Connect" connectedLabel="Custom Disconnect" />, {
      wrapper,
    });

    expect(screen.getByText('Custom Connect')).toBeInTheDocument();
  });

  it('applies Aztec styling class', () => {
    render(<AztecConnectButton />, { wrapper });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('aztecButton');
  });

  it('passes through props to WalletMeshConnectButton', () => {
    render(<AztecConnectButton size="lg" variant="primary" showAddress={true} showChain={true} />, {
      wrapper,
    });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('combines custom className with Aztec styles', () => {
    render(<AztecConnectButton className="custom-class" />, { wrapper });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('aztecButton');
    expect(button).toHaveClass('custom-class');
  });

  it('does not show proving badge when disconnected', () => {
    render(<AztecConnectButton showProvingStatus={true} />, { wrapper });

    expect(screen.queryByText('Proving...')).not.toBeInTheDocument();
  });

  it('calls onProvingStart callback when provided', () => {
    const onProvingStart = vi.fn();

    render(<AztecConnectButton onProvingStart={onProvingStart} showProvingStatus={true} />, {
      wrapper,
    });

    // Callback would be called when wallet emits proving:start event
    // This requires mocking the wallet provider
  });

  it('calls onProvingComplete callback when provided', () => {
    const onProvingComplete = vi.fn();

    render(<AztecConnectButton onProvingComplete={onProvingComplete} showProvingStatus={true} />, {
      wrapper,
    });

    // Callback would be called when wallet emits proving:complete event
    // This requires mocking the wallet provider
  });

  it('disables proving status when showProvingStatus is false', () => {
    render(<AztecConnectButton showProvingStatus={false} />, { wrapper });

    expect(screen.queryByText('Proving...')).not.toBeInTheDocument();
  });
});

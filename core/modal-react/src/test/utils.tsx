/**
 * Test utilities for modal-react tests
 */

import { render } from '@testing-library/react';
import { ChainType, type SupportedChain } from '@walletmesh/modal-core';
import type React from 'react';
import { WalletMeshProvider } from '../WalletMeshProvider.js';
import type { WalletMeshProviderProps } from '../types.js';

export const mockConfig: WalletMeshProviderProps['config'] = {
  appName: 'Test App',
  appDescription: 'Test application',
  appUrl: 'http://localhost:3000',
  chains: [
    { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: false } as SupportedChain,
    {
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainType: ChainType.Solana,
      name: 'Solana',
      required: false,
    } as SupportedChain,
    {
      chainId: 'aztec:31337',
      chainType: ChainType.Aztec,
      name: 'Aztec Sandbox',
      required: false,
    } as SupportedChain,
  ],
  wallets: [
    {
      id: 'evm-wallet-1',
      name: 'EVM Wallet',
      icon: 'data:image/svg+xml;base64,test',
      chains: [ChainType.Evm],
      description: 'Test EVM wallet',
    },
    {
      id: 'solana-wallet-1',
      name: 'Solana Wallet',
      icon: 'data:image/svg+xml;base64,test',
      chains: [ChainType.Solana],
      description: 'Test Solana wallet',
    },
    {
      id: 'aztec-wallet',
      name: 'Aztec Wallet',
      icon: 'data:image/svg+xml;base64,test',
      chains: [ChainType.Aztec],
      description: 'Test Aztec wallet',
    },
  ],
  autoInjectModal: false,
};

interface WrapperProps {
  children: React.ReactNode;
}

export function createWrapper(config = mockConfig) {
  return function Wrapper({ children }: WrapperProps) {
    return <WalletMeshProvider config={config}>{children}</WalletMeshProvider>;
  };
}

export function renderWithProvider(ui: React.ReactElement, options?: Parameters<typeof render>[1]) {
  return render(ui, {
    wrapper: createWrapper(),
    ...options,
  });
}

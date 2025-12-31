[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createModal

# Function: createModal()

> **createModal**(`config`): [`ModalController`](../interfaces/ModalController.md)

Defined in: core/modal-core/dist/api/core/modal.d.ts:108

Create a headless modal controller for wallet connections

This is the main factory function for creating a headless wallet connection modal.
It validates all wallet configurations and sets up the modal controller for
state management. UI frameworks handle their own rendering based on state subscriptions.

## Parameters

### config

[`ModalFactoryConfig`](../interfaces/ModalFactoryConfig.md)

Modal configuration options

## Returns

[`ModalController`](../interfaces/ModalController.md)

Headless modal controller instance with methods to open, close, and manage state

## Throws

Configuration error if wallet validation fails

## Examples

```ts
// Basic headless usage with MetaMask and supported chains
import { createModal, createWalletMeshClient, ChainType } from '@walletmesh/modal-core';

const client = createWalletMeshClient({ appName: 'My DApp' });
const modal = createModal({
  wallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://example.com/metamask-icon.png',
      chainTypes: ['evm']
    }
  ],
  supportedChains: [
    {
      chainId: 'eip155:1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: true,
      icon: 'https://example.com/eth-icon.png'
    },
    {
      chainId: 'eip155:137',
      chainType: ChainType.Evm,
      name: 'Polygon',
      required: false
    }
  ],
  client,
  debug: true
});

// Subscribe to state changes for UI updates
modal.subscribe((state) => {
  console.log('Modal state changed:', state);
});

// Open modal and handle connection
await modal.open();
```

```ts
// Advanced usage with multiple wallets and chains
const modal = createModal({
  wallets: [
    { id: 'metamask', name: 'MetaMask', icon: '...', chainTypes: ['evm'] },
    { id: 'phantom', name: 'Phantom', icon: '...', chainTypes: ['solana'] },
    { id: 'aztec', name: 'Aztec Wallet', icon: '...', chainTypes: ['aztec'] }
  ],
  supportedChains: [
    {
      chainId: 'eip155:1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: true,
      interfaces: ['eip-1193', 'eip-6963']
    },
    {
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainType: ChainType.Solana,
      name: 'Solana Mainnet',
      required: false,
      interfaces: ['solana-standard-wallet']
    },
    {
      chainId: 'aztec:mainnet',
      chainType: ChainType.Aztec,
      name: 'Aztec Mainnet',
      required: false,
      interfaces: ['aztec-connect-v2', 'aztec-wallet-api-v1']
    }
  ],
  client,
  debug: true,
  autoCloseDelay: 3000
});

@public
```

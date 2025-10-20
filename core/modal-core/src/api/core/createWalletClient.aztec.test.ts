/**
 * Tests for AztecAdapter registration in createWalletMesh
 *
 * Verifies that AztecAdapter is automatically registered when Aztec chains
 * are configured, matching the behavior of EVM and Solana adapters.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createWalletMesh } from './createWalletClient.js';
import { ChainType } from '../../types.js';

describe('createWalletMesh - AztecAdapter Registration', () => {
  // Clear any cached clients between tests
  afterEach(() => {
    // Cache is internal to the module, but sequential tests should still work
  });

  describe('Automatic Registration', () => {
    it('should register AztecAdapter when Aztec chain is in config', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        chains: [
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec Sandbox',
          },
        ],
      });

      // Get all available wallets (which come from registered adapters)
      const wallets = client.getAllWallets();

      // Should have aztec-wallet adapter registered
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });

    it('should register AztecAdapter for testnet', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        chains: [
          {
            chainId: 'aztec:testnet',
            chainType: ChainType.Aztec,
            name: 'Aztec Testnet',
          },
        ],
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });

    it('should register AztecAdapter for mainnet', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        chains: [
          {
            chainId: 'aztec:mainnet',
            chainType: ChainType.Aztec,
            name: 'Aztec Mainnet',
          },
        ],
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });
  });

  describe('Multi-Chain Configuration', () => {
    it('should register all adapters for multi-chain config', async () => {
      const client = await createWalletMesh({
        appName: 'Multi-Chain DApp',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
          },
          {
            chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            chainType: ChainType.Solana,
            name: 'Solana',
          },
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec Sandbox',
          },
        ],
      });

      const wallets = client.getAllWallets();

      const hasEvmWallet = wallets.some((wallet) => wallet.id === 'evm-wallet');
      const hasSolanaWallet = wallets.some((wallet) => wallet.id === 'solana-wallet');
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasEvmWallet).toBe(true);
      expect(hasSolanaWallet).toBe(true);
      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });
  });

  describe('No Aztec Configuration', () => {
    it('should not register AztecAdapter when no Aztec chain configured', async () => {
      const client = await createWalletMesh({
        appName: 'EVM Only DApp',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
          },
        ],
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      // Should not have Aztec wallet when no Aztec chain is configured
      expect(hasAztecWallet).toBe(false);

      await client.destroy();
    });

    it('should not register AztecAdapter when chains array is empty', async () => {
      const client = await createWalletMesh({
        appName: 'No Chains DApp',
        chains: [],
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(false);

      await client.destroy();
    });

    it('should not register AztecAdapter when chains is undefined', async () => {
      const client = await createWalletMesh({
        appName: 'Default DApp',
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      // Without explicit chain config, Aztec should not be registered
      expect(hasAztecWallet).toBe(false);

      await client.destroy();
    });
  });

  describe('Wallet Config Integration', () => {
    it('should register AztecAdapter when specified in wallets.include', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        wallets: {
          include: ['aztec-wallet'],
        },
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });

    it('should not register AztecAdapter when excluded', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        chains: [
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec Sandbox',
          },
        ],
        wallets: {
          exclude: ['aztec-wallet'],
        },
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      // Should be excluded even though Aztec chain is configured
      expect(hasAztecWallet).toBe(false);

      await client.destroy();
    });

    it('should not register when using empty include array', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp Empty Include',
        chains: [
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec Sandbox',
          },
        ],
        wallets: {
          include: [], // Empty include array prevents default registration
        },
      });

      const wallets = client.getAllWallets();

      // No adapters should be registered with empty include
      expect(wallets.length).toBe(0);

      await client.destroy();
    });
  });

  describe('Direct Wallet Info Array', () => {
    it('should register AztecAdapter when wallet ID is provided in array', async () => {
      const client = await createWalletMesh({
        appName: 'Test DApp',
        wallets: [
          {
            id: 'aztec-wallet',
            name: 'Aztec Wallet',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjwvc3ZnPg==',
            chains: ['aztec'],
          },
        ],
      });

      const wallets = client.getAllWallets();
      const hasAztecWallet = wallets.some((wallet) => wallet.id === 'aztec-wallet');

      expect(hasAztecWallet).toBe(true);

      await client.destroy();
    });
  });

  describe('Consistency with EVM and Solana', () => {
    it('should behave consistently with EvmAdapter registration', async () => {
      // Create client with EVM chain
      const evmClient = await createWalletMesh({
        appName: 'EVM DApp',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
          },
        ],
      });

      const evmWallets = evmClient.getAllWallets();
      const hasEvmWallet = evmWallets.some((wallet) => wallet.id === 'evm-wallet');

      // Create client with Aztec chain
      const aztecClient = await createWalletMesh({
        appName: 'Aztec DApp',
        chains: [
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec',
          },
        ],
      });

      const aztecWallets = aztecClient.getAllWallets();
      const hasAztecWallet = aztecWallets.some((wallet) => wallet.id === 'aztec-wallet');

      // Both should be registered automatically
      expect(hasEvmWallet).toBe(true);
      expect(hasAztecWallet).toBe(true);

      await evmClient.destroy();
      await aztecClient.destroy();
    });

    it('should behave consistently with SolanaAdapter registration', async () => {
      // Create client with Solana chain
      const solanaClient = await createWalletMesh({
        appName: 'Solana DApp Test',
        chains: [
          {
            chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            chainType: ChainType.Solana,
            name: 'Solana',
          },
        ],
      });

      const solanaWallets = solanaClient.getAllWallets();
      const hasSolanaWallet = solanaWallets.some((wallet) => wallet.id === 'solana-wallet');

      // Destroy first client before creating second to avoid cache issues
      await solanaClient.destroy();

      // Create client with Aztec chain
      const aztecClient = await createWalletMesh({
        appName: 'Aztec DApp Test',
        chains: [
          {
            chainId: 'aztec:31337',
            chainType: ChainType.Aztec,
            name: 'Aztec',
          },
        ],
      });

      const aztecWallets = aztecClient.getAllWallets();
      const hasAztecWallet = aztecWallets.some((wallet) => wallet.id === 'aztec-wallet');

      // Both should be registered automatically
      expect(hasSolanaWallet).toBe(true);
      expect(hasAztecWallet).toBe(true);

      await aztecClient.destroy();
    });
  });
});

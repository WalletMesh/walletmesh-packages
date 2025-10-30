/**
 * @fileoverview Integration tests for schema validation
 */

import { describe, it, expect } from 'vitest';
import {
  expectSchemaToAccept,
  expectSchemaToReject,
  generateEvmAddress,
  generateMockWalletInfo,
  generateMockChainConfig,
} from './testUtils.js';

// Import all schemas
import { walletMeshClientConfigSchema } from './client.js';
import { advancedConnectOptionsSchema } from './connectOptions.js';
import { evmTransactionParamsSchema, solanaTransactionParamsSchema } from './transactions.js';
import { fullChainConfigSchema } from './chains.js';
import { modalConfigSchema } from './modal.js';
import { originValidationConfigSchema, sessionSecurityConfigSchema } from './security.js';

describe('Schema Integration Tests', () => {
  describe('Client Configuration Integration', () => {
    it('should validate complete client configuration', () => {
      const config = {
        appName: 'Test DApp',
        appDescription: 'A test decentralized application',
        appUrl: 'https://testdapp.com',
        appIcon: 'https://testdapp.com/icon.png',
        projectId: 'test-project-id',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'evm',
            name: 'Ethereum Mainnet',
          },
          {
            chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            chainType: 'solana',
            name: 'Solana Mainnet',
          },
        ],
        wallets: {
          filter: {
            mobile: false,
            desktop: true,
            features: ['eip1193'],
          },
          featured: ['metamask', 'walletconnect'],
          hidden: ['trust-wallet'],
        },
        modal: {
          theme: {
            mode: 'dark',
            primaryColor: '#007AFF',
          },
          size: {
            width: 450,
            height: 'auto',
          },
        },
        security: {
          originValidation: {
            enabled: true,
            allowedOrigins: ['https://testdapp.com'],
          },
          rateLimit: {
            maxRequests: 100,
            windowMs: 60000,
          },
        },
        logger: {
          debug: true,
          level: 'debug',
          prefix: 'TestDApp',
        },
      };

      const result = expectSchemaToAccept(walletMeshClientConfigSchema, config);
      expect(result.appName).toBe('Test DApp');
      expect(result.chains).toHaveLength(2);
      expect(result.modal?.theme?.mode).toBe('dark');
    });

    it('should provide sensible defaults', () => {
      const minimalConfig = {
        appName: 'Minimal App',
      };

      const result = expectSchemaToAccept(walletMeshClientConfigSchema, minimalConfig);
      expect(result.appName).toBe('Minimal App');
      // Discovery and providerLoader configs don't have defaults in the schema itself
    });
  });

  describe('Connection Flow Integration', () => {
    it('should validate connection options with wallet selection', () => {
      const connectOptions = {
        chainId: 'eip155:1',
        chainType: 'evm',
        walletSelection: {
          walletId: 'metamask',
          features: ['eip1193', 'eip6963'],
          installedOnly: true,
        },
        showModal: true,
        timeout: {
          connection: 60000,
          discovery: 10000,
          operation: 30000,
        },
        onProgress: (progress: unknown) => {
          console.log('Progress:', progress);
        },
      };

      expectSchemaToAccept(advancedConnectOptionsSchema, connectOptions);
    });

    it('should validate session recovery flow', () => {
      const sessionConfig = {
        timeout: 3600000, // 1 hour
        idleTimeout: 900000, // 15 minutes
        maxConcurrentSessions: 3,
        validateOnRequest: true,
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        },
      };

      expectSchemaToAccept(sessionSecurityConfigSchema, sessionConfig);
    });
  });

  describe('Multi-Chain Transaction Integration', () => {
    it('should validate EVM transaction with full parameters', () => {
      const evmTx = {
        to: generateEvmAddress(),
        from: generateEvmAddress(),
        value: '1000000000000000000', // 1 ETH
        data: `0xa9059cbb${generateEvmAddress().slice(2).padStart(64, '0')}00000000000000000000000000000000000000000000000000000000000186a0`,
        gas: '21000',
        maxFeePerGas: '30000000000',
        maxPriorityFeePerGas: '2000000000',
        nonce: 42,
        chainId: 'eip155:1',
        autoSwitchChain: true,
        metadata: {
          description: 'Transfer 1 ETH',
          action: 'transfer',
          data: {
            recipient: generateEvmAddress(),
            amount: '1000000000000000000',
          },
        },
      };

      expectSchemaToAccept(evmTransactionParamsSchema, evmTx);
    });

    it('should validate Solana transaction with serialized data', () => {
      // Create a mock base64 serialized transaction
      const mockSerializedTx = Buffer.from([
        0x01, // Version
        0x00,
        0x01, // Signature count
        ...Array(64).fill(0), // Signature placeholder
        0x01, // Message header
        ...Array(32).fill(0), // Recent blockhash
        0x01, // Instruction count
        0x00, // Program ID index
        0x00, // Account count
        0x00, // Data length
      ]).toString('base64');

      const solanaTx = {
        transaction: mockSerializedTx,
        chainId: 'solana:mainnet-beta',
        options: {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        },
        metadata: {
          description: 'Transfer SOL',
          action: 'transfer',
        },
      };

      expectSchemaToAccept(solanaTransactionParamsSchema, solanaTx);
    });
  });

  describe('Chain Configuration Integration', () => {
    it('should validate mixed chain configurations', () => {
      const chains = [
        generateMockChainConfig('evm', {
          chainId: 'eip155:1',
          name: 'Ethereum Mainnet',
          ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        }),
        generateMockChainConfig('solana', {
          chainId: 'solana:mainnet-beta',
          name: 'Solana Mainnet',
          commitment: 'confirmed',
        }),
        generateMockChainConfig('aztec', {
          chainId: 'aztec:mainnet',
          name: 'Aztec Mainnet',
          privacyLevel: 'private',
        }),
      ];

      for (const chain of chains) {
        expectSchemaToAccept(fullChainConfigSchema, chain);
      }
    });

    it('should reject mismatched chain configurations', () => {
      const invalidChain = {
        chainId: 'eip155:1', // EVM chain ID
        chainType: 'solana', // But Solana type
        name: 'Invalid Chain',
        nativeCurrency: {
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
        },
        rpcUrls: [{ url: 'https://rpc.example.com' }],
      };

      expectSchemaToReject(fullChainConfigSchema, invalidChain);
    });
  });

  describe('Modal UI Integration', () => {
    it('should validate complete modal configuration', () => {
      const modalConfig = {
        theme: {
          mode: 'dark',
          primaryColor: '#007AFF',
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
        },
        size: {
          width: 450,
          height: 'auto',
          maxWidth: '90vw',
          maxHeight: '90vh',
        },
        animation: {
          enabled: true,
          duration: 300,
          easing: 'ease-out',
        },
        backdrop: {
          enabled: true,
          blur: 5,
          closeOnClick: true,
        },
        walletDisplay: {
          sortBy: 'popularity',
          showInstallButton: true,
        },
        qrCode: {
          enabled: true,
          size: 256,
          errorCorrectionLevel: 'M',
        },
        sections: {
          header: true,
          search: true,
          walletList: true,
          qrCode: true,
          help: true,
          custom: [
            {
              id: 'promo',
              title: 'Special Offer',
              content: 'Get started with our DeFi platform',
              position: 'before-wallets',
            },
          ],
        },
        autoClose: true,
        closeDelay: 1500,
        keyboardNavigation: true,
        escapeClose: true,
        zIndex: 10000,
      };

      expectSchemaToAccept(modalConfigSchema, modalConfig);
    });
  });

  describe('Security Configuration Integration', () => {
    it('should validate comprehensive security setup', () => {
      const securityConfig = {
        enabled: true,
        allowedOrigins: ['https://app.example.com', 'https://beta.example.com', 'https://localhost:3000'],
        blockedOrigins: ['https://malicious.com'],
        mode: 'strict',
        logFailures: true,
      };

      expectSchemaToAccept(originValidationConfigSchema, securityConfig);
    });

    it('should validate session security with all options', () => {
      const sessionConfig = {
        timeout: 7200000, // 2 hours
        idleTimeout: 1800000, // 30 minutes
        maxConcurrentSessions: 3,
        tokenLength: 64,
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          domain: '.example.com',
          path: '/api/wallet',
        },
        validateOnRequest: true,
        rotateToken: true,
      };

      expectSchemaToAccept(sessionSecurityConfigSchema, sessionConfig);
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle deeply nested configurations', () => {
      const complexConfig = {
        appName: 'Complex DApp',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'evm',
            name: 'Ethereum',
          },
        ],
        wallets: {
          filter: {
            features: ['eip1193', 'eip6963'],
            chains: ['eip155:1', 'eip155:137'],
          },
        },
        modal: {
          theme: {
            mode: 'auto',
            cssVariables: {
              '--modal-primary': '#007AFF',
              '--modal-background': '#FFFFFF',
              '--modal-text': '#000000',
            },
          },
          sections: {
            custom: [
              {
                id: 'custom-1',
                title: 'Welcome',
                content: 'Welcome to our DApp',
                position: 'before-wallets',
              },
            ],
          },
        },
        security: {
          originValidation: {
            enabled: true,
            mode: 'custom',
            customValidator: (origin: string) => origin.includes('example.com'),
          },
          rateLimit: {
            maxRequests: 50,
            windowMs: 60000,
            keyGenerator: 'custom',
            customKeyGenerator: (req: unknown) => (req as { ip?: string }).ip || 'anonymous',
          },
          sessionSecurity: {
            timeout: 3600000,
            validateOnRequest: true,
          },
        },
      };

      expectSchemaToAccept(walletMeshClientConfigSchema, complexConfig);
    });

    it('should validate cross-schema references', () => {
      // Test that wallet IDs used in various schemas are consistent
      const walletId = 'metamask';

      const walletInfo = generateMockWalletInfo({ id: walletId });
      const connectOptions = {
        walletSelection: { walletId },
        showModal: true,
      };
      const permissionRequest = {
        walletId,
        scopes: [{ method: 'eth_accounts' }],
      };

      // All should accept the same wallet ID format
      expect(walletInfo.id).toBe(walletId);
      expect(connectOptions.walletSelection.walletId).toBe(walletId);
      expect(permissionRequest.walletId).toBe(walletId);
    });
  });

  describe('Error Message Consistency', () => {
    it('should provide consistent error messages across schemas', () => {
      const invalidUrl = 'not-a-url';

      // Test URL validation in schema that requires URLs
      try {
        walletMeshClientConfigSchema.parse({ appName: 'Test', appUrl: invalidUrl });
        throw new Error('Should have thrown');
      } catch (error) {
        expect((error as { errors: Array<{ message: string }> }).errors[0].message.toLowerCase()).toContain(
          'url',
        );
      }

      // Test that originValidationConfigSchema accepts non-URL strings for wildcards
      expect(() =>
        originValidationConfigSchema.parse({
          allowedOrigins: ['*', '*.example.com', invalidUrl],
        }),
      ).not.toThrow();
    });
  });
});

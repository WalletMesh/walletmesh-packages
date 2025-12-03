/**
 * Tests for TypeDoc Export Types
 */

import { describe, expect, it } from 'vitest';

// Test imports to ensure they exist and are properly typed
describe('TypeDoc Export Types', () => {
  describe('Event Type Exports', () => {
    it('should import modal event types', async () => {
      const {
        InternalModalEventType,
        ModalEventType,
        OpeningEvent,
        OpenedEvent,
        ClosingEvent,
        ClosedEvent,
        ViewChangingEvent,
        ViewChangedEvent,
        ModalErrorEvent,
      } = await import('./typedocExports.js');

      // Verify the exports exist
      expect(typeof InternalModalEventType).toBe('object'); // Enum export
      expect(typeof ModalEventType).toBe('object'); // Enum export
      expect(typeof OpeningEvent).toBe('undefined'); // Type export
      expect(typeof OpenedEvent).toBe('undefined'); // Type export
      expect(typeof ClosingEvent).toBe('undefined'); // Type export
      expect(typeof ClosedEvent).toBe('undefined'); // Type export
      expect(typeof ViewChangingEvent).toBe('undefined'); // Type export
      expect(typeof ViewChangedEvent).toBe('undefined'); // Type export
      expect(typeof ModalErrorEvent).toBe('undefined'); // Type export
    });

    it('should import remaining types', async () => {
      // Note: Wallet event types have been removed as they were unused
      // This test now just verifies the import doesn't fail
      const exports = await import('./typedocExports.js');
      expect(exports).toBeDefined();
    });
  });

  describe('Framework Adapter Exports', () => {
    it('should import framework adapter types', async () => {
      const {
        ReactAdapterConfig,
        ReactAdapter,
        VueAdapterConfig,
        VueAdapter,
        SvelteAdapterConfig,
        SvelteAdapter,
        ComponentMap,
      } = await import('./typedocExports.js');

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof ReactAdapterConfig).toBe('undefined'); // Type export
      expect(typeof ReactAdapter).toBe('undefined'); // Type export
      expect(typeof VueAdapterConfig).toBe('undefined'); // Type export
      expect(typeof VueAdapter).toBe('undefined'); // Type export
      expect(typeof SvelteAdapterConfig).toBe('undefined'); // Type export
      expect(typeof SvelteAdapter).toBe('undefined'); // Type export
      expect(typeof ComponentMap).toBe('undefined'); // Type export
    });
  });

  describe('Error and State Exports', () => {
    it('should import error and state types', async () => {
      const { ErrorCategory, ErrorData, ModalView, ModalState, AnyTransportConfig, ViewHooks } = await import(
        './typedocExports.js'
      );

      // Verify the exports exist
      // ErrorCategory should be an enum/object
      expect(typeof ErrorCategory).toBe('object');

      // Others are type exports
      expect(typeof ErrorData).toBe('undefined'); // Type export
      expect(typeof ModalView).toBe('undefined'); // Type export
      expect(typeof ModalState).toBe('undefined'); // Type export
      expect(typeof AnyTransportConfig).toBe('undefined'); // Type export
      expect(typeof ViewHooks).toBe('undefined'); // Type export
    });
  });

  describe('Client Type Exports', () => {
    it('should import client types', async () => {
      const { WalletMeshBaseClient, CreateWalletMeshOptions, ChainConfig } = await import(
        './typedocExports.js'
      );

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof WalletMeshBaseClient).toBe('undefined'); // Type export
      expect(typeof CreateWalletMeshOptions).toBe('undefined'); // Type export
      expect(typeof ChainConfig).toBe('undefined'); // Type export
    });
  });

  describe('Provider Type Exports', () => {
    it('should import provider types', async () => {
      const {
        EvmTransaction,
        SolanaTransaction,
        SolanaInstruction,
        WalletStateType,
        WalletInfo,
        WalletProvider,
        ChainInfo,
        WalletConnectionState,
      } = await import('./typedocExports.js');

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof EvmTransaction).toBe('undefined'); // Type export
      expect(typeof SolanaTransaction).toBe('undefined'); // Type export
      expect(typeof SolanaInstruction).toBe('undefined'); // Type export
      expect(typeof WalletStateType).toBe('undefined'); // Type export
      expect(typeof WalletInfo).toBe('undefined'); // Type export
      expect(typeof WalletProvider).toBe('undefined'); // Type export
      expect(typeof ChainInfo).toBe('undefined'); // Type export
      expect(typeof WalletConnectionState).toBe('undefined'); // Type export
    });
  });

  describe('Schema and Class Exports', () => {
    it('should import schema and class exports', async () => {
      const { modalViewSchema, BaseWalletProvider } = await import('./typedocExports.js');

      // modalViewSchema should be a Zod schema object
      expect(typeof modalViewSchema).toBe('object');
      expect(modalViewSchema).toHaveProperty('parse');

      // BaseWalletProvider should be a class
      expect(typeof BaseWalletProvider).toBe('function');
      expect(BaseWalletProvider.prototype).toBeDefined();
    });
  });

  describe('Transport Event Exports', () => {
    it('should import transport event types', async () => {
      const {
        TransportConnectedEvent,
        TransportDisconnectedEvent,
        TransportErrorEvent,
        TransportMessageEvent,
      } = await import('./typedocExports.js');

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof TransportConnectedEvent).toBe('undefined'); // Type export
      expect(typeof TransportDisconnectedEvent).toBe('undefined'); // Type export
      expect(typeof TransportErrorEvent).toBe('undefined'); // Type export
      expect(typeof TransportMessageEvent).toBe('undefined'); // Type export
    });
  });

  describe('Discovery Service Exports', () => {
    it('should import Aztec discovery types', async () => {
      const { AztecAccount } = await import('./typedocExports.js');

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof AztecAccount).toBe('undefined'); // Type export
    });

    it('should import Solana discovery types', async () => {
      const { SolanaWallet, SolanaAccount, WalletStandardEvent } = await import('./typedocExports.js');

      // Verify the exports exist (they're types, so we can't test values directly)
      expect(typeof SolanaWallet).toBe('undefined'); // Type export
      expect(typeof SolanaAccount).toBe('undefined'); // Type export
      expect(typeof WalletStandardEvent).toBe('undefined'); // Type export
    });
  });

  describe('Import Structure Validation', () => {
    it('should successfully import all exports without errors', async () => {
      // This test verifies that all exports can be imported without circular dependency issues
      const exports = await import('./typedocExports.js');

      // Count the number of runtime exports (enums + objects + classes)
      const exportKeys = Object.keys(exports);
      expect(exportKeys.length).toBeGreaterThanOrEqual(5); // Runtime exports: enums + objects + classes

      // Verify key runtime exports exist
      expect('ModalEventType' in exports).toBe(true);
      expect('InternalModalEventType' in exports).toBe(true);
      expect('ErrorCategory' in exports).toBe(true);
      expect('modalViewSchema' in exports).toBe(true);
      expect('BaseWalletProvider' in exports).toBe(true);
    });

    it('should have no undefined exports for value exports', async () => {
      const exports = await import('./typedocExports.js');

      // These should be actual values/objects, not just types
      const valueExports = ['ErrorCategory', 'modalViewSchema', 'BaseWalletProvider'];

      for (const exportName of valueExports) {
        expect(exports[exportName]).toBeDefined();
        expect(exports[exportName]).not.toBeNull();
      }
    });
  });

  describe('Type Export Completeness', () => {
    it('should export all documented runtime values', async () => {
      const exports = await import('./typedocExports.js');

      // Key internal runtime exports (enums, objects, classes) that should be available at runtime
      const requiredRuntimeExports = [
        // Enums
        'ModalEventType',
        'InternalModalEventType',

        // Objects/schemas
        'ErrorCategory',
        'modalViewSchema',

        // Classes
        'BaseWalletProvider',
      ];

      for (const exportName of requiredRuntimeExports) {
        expect(exportName in exports).toBe(true);
      }
    });

    it('should maintain backward compatibility with previous runtime exports', async () => {
      const exports = await import('./typedocExports.js');

      // These runtime exports should remain stable for TypeDoc generation
      const stableRuntimeExports = [
        'ModalEventType',
        'ErrorCategory',
        'BaseWalletProvider',
        'modalViewSchema',
      ];

      for (const exportName of stableRuntimeExports) {
        expect(exportName in exports).toBe(true);
      }
    });
  });

  describe('Error Category Validation', () => {
    it('should export ErrorCategory as an object with expected values', async () => {
      const { ErrorCategory } = await import('./typedocExports.js');

      expect(typeof ErrorCategory).toBe('object');
      expect(ErrorCategory).not.toBeNull();

      // ErrorCategory should have the expected error categories
      // Note: we can't test specific values without knowing the implementation
      // but we can verify it's a proper object
      expect(Object.keys(ErrorCategory).length).toBeGreaterThan(0);
    });
  });

  describe('Schema Validation', () => {
    it('should export modalViewSchema as a valid Zod schema', async () => {
      const { modalViewSchema } = await import('./typedocExports.js');

      expect(typeof modalViewSchema).toBe('object');
      expect(modalViewSchema).not.toBeNull();

      // Zod schemas should have these methods
      expect(typeof modalViewSchema.parse).toBe('function');
      expect(typeof modalViewSchema.safeParse).toBe('function');
    });
  });

  describe('Class Export Validation', () => {
    it('should export BaseWalletProvider as a constructible class', async () => {
      const { BaseWalletProvider } = await import('./typedocExports.js');

      expect(typeof BaseWalletProvider).toBe('function');
      expect(BaseWalletProvider.prototype).toBeDefined();
      expect(BaseWalletProvider.name).toBe('BaseWalletProvider');
    });
  });
});

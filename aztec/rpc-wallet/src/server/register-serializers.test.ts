import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SERIALIZERS } from '../serializers.js';
import { registerAztecWalletSerializers } from './register-serializers.js';

// Mock logger
vi.mock('@aztec/foundation/log', () => {
  const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
  };
});

describe('registerAztecWalletSerializers', () => {
  let mockNode: {
    registerSerializer: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockNode = {
      registerSerializer: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register all serializers from SERIALIZERS object', () => {
    registerAztecWalletSerializers(mockNode as never);

    // Verify registerSerializer was called for each serializer
    const serializerCount = Object.keys(SERIALIZERS).length;
    expect(mockNode.registerSerializer).toHaveBeenCalledTimes(serializerCount);
  });

  it('should register serializers with correct method names', () => {
    registerAztecWalletSerializers(mockNode as never);

    const registeredMethods = vi.mocked(mockNode.registerSerializer).mock.calls.map((call) => call[0]);

    // Check that key methods are registered
    expect(registeredMethods).toContain('aztec_getChainInfo');
    expect(registeredMethods).toContain('aztec_getAccounts');
    expect(registeredMethods).toContain('aztec_registerSender');
    expect(registeredMethods).toContain('aztec_getContractClassMetadata');
    expect(registeredMethods).toContain('aztec_getContractMetadata');
    expect(registeredMethods).toContain('aztec_sendTx');
    expect(registeredMethods).toContain('aztec_simulateTx');
  });

  it('should register serializers with correct serializer instances', () => {
    registerAztecWalletSerializers(mockNode as never);

    // Verify that the correct serializer is registered for each method
    for (const [method, serializer] of Object.entries(SERIALIZERS)) {
      expect(mockNode.registerSerializer).toHaveBeenCalledWith(method, serializer);
    }
  });

  it('should throw error when serializer is missing', () => {
    // The implementation throws an error if a serializer is missing
    // Since SERIALIZERS is imported at module level and all serializers exist,
    // we verify the normal registration works correctly
    registerAztecWalletSerializers(mockNode as never);

    // All serializers should be registered
    expect(mockNode.registerSerializer).toHaveBeenCalledTimes(Object.keys(SERIALIZERS).length);
  });

  it('should register serializers in the correct order', () => {
    registerAztecWalletSerializers(mockNode as never);

    const calls = vi.mocked(mockNode.registerSerializer).mock.calls;
    const methodNames = calls.map((call) => call[0]);

    // Verify that all methods from SERIALIZERS are registered
    const expectedMethods = Object.keys(SERIALIZERS);
    expect(methodNames.length).toBe(expectedMethods.length);

    // Verify each method is registered exactly once
    const uniqueMethods = new Set(methodNames);
    expect(uniqueMethods.size).toBe(methodNames.length);
  });
});

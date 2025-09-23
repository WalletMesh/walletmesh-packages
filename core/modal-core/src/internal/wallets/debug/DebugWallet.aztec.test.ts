import { describe, expect, it } from 'vitest';
import { ChainType } from '../../../types.js';
import { DebugWallet } from './DebugWallet.js';

describe('DebugWallet - Aztec Support', () => {
  it('should support Aztec chain by default', () => {
    const adapter = new DebugWallet({});

    // Check capabilities include Aztec
    const supportedChainTypes = adapter.capabilities.chains.map((chain) => chain.type);
    expect(supportedChainTypes).toContain(ChainType.Aztec);
  });

  it('should connect to Aztec chain', async () => {
    const adapter = new DebugWallet({});

    const connection = await adapter.connect({
      chains: [{ type: ChainType.Aztec }],
    });

    expect(connection).toBeDefined();
    expect(connection.chainType).toBe(ChainType.Aztec);
    expect(connection.chain.chainId).toBe('aztec:31337'); // Default local Aztec
  });

  it('should create Aztec provider when connected', async () => {
    const adapter = new DebugWallet({});

    const connection = await adapter.connect({
      chains: [{ type: ChainType.Aztec }],
    });

    expect(connection.provider).toBeDefined();

    // Test basic Aztec provider methods
    const accounts = await connection.provider.getAccounts();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toBe('0x1234567890123456789012345678901234567890');

    const chainId = await connection.provider.getChainId();
    expect(chainId).toBe('aztec:31337');
  });

  it('should handle Aztec-specific requests', async () => {
    const adapter = new DebugWallet({});

    const connection = await adapter.connect({
      chains: [{ type: ChainType.Aztec }],
    });

    // Test Aztec-specific methods
    const aztecAddress = await connection.provider.request({
      method: 'aztec_getAddress',
    });
    expect(aztecAddress).toEqual('0x1234567890123456789012345678901234567890');

    const aztecChainId = await connection.provider.request({
      method: 'aztec_getChainId',
    });
    expect(aztecChainId).toBe('aztec:31337');

    const signature = await connection.provider.request({
      method: 'aztec_signMessage',
      params: ['message'],
    });
    expect(signature).toBe('0xmocksignature');
  });

  it('should support custom Aztec chain configuration', () => {
    const adapter = new DebugWallet({
      chains: [ChainType.Aztec, ChainType.Evm],
    });

    const supportedChainTypes = adapter.capabilities.chains.map((chain) => chain.type);
    expect(supportedChainTypes).toContain(ChainType.Aztec);
    expect(supportedChainTypes).toContain(ChainType.Evm);
    expect(supportedChainTypes).toHaveLength(2);
  });

  it('should support all three chain types by default', () => {
    const adapter = new DebugWallet({});

    const supportedChainTypes = adapter.capabilities.chains.map((chain) => chain.type);
    expect(supportedChainTypes).toContain(ChainType.Evm);
    expect(supportedChainTypes).toContain(ChainType.Solana);
    expect(supportedChainTypes).toContain(ChainType.Aztec);
    expect(supportedChainTypes).toHaveLength(3);
  });
});

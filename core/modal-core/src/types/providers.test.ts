import { describe, test, expect } from 'vitest';
import {
  ProviderInterface,
  ProviderNotSupportedError,
  ProviderMethodNotSupportedError,
  type EIP1193Provider,
  type EIP6963Provider,
  type EthersProvider,
  type NativeProvider,
  type ProviderCapability,
} from './providers.js';

describe('Provider Types', () => {
  test('defines expected provider interfaces', () => {
    expect(ProviderInterface.EIP1193).toBe('eip1193');
    expect(ProviderInterface.EIP6963).toBe('eip6963');
    expect(ProviderInterface.ETHERS).toBe('ethers');
    expect(ProviderInterface.NATIVE).toBe('native');
  });

  test('creates ProviderNotSupportedError with correct message and name', () => {
    const error = new ProviderNotSupportedError(ProviderInterface.EIP1193);
    expect(error.message).toBe('Provider interface eip1193 is not supported');
    expect(error.name).toBe('ProviderNotSupportedError');
    expect(error).toBeInstanceOf(Error);
  });

  test('creates ProviderMethodNotSupportedError with correct properties', () => {
    // Create multiple instances to ensure full coverage of constructor
    const error1 = new ProviderMethodNotSupportedError('eth_requestAccounts', ProviderInterface.EIP1193);
    expect(error1.message).toBe('Method eth_requestAccounts is not supported by provider eip1193');
    expect(error1.name).toBe('ProviderMethodNotSupportedError');
    expect(error1).toBeInstanceOf(Error);

    const error2 = new ProviderMethodNotSupportedError('eth_accounts', ProviderInterface.EIP6963);
    expect(error2.message).toBe('Method eth_accounts is not supported by provider eip6963');
    expect(error2.name).toBe('ProviderMethodNotSupportedError');
    expect(error2).toBeInstanceOf(Error);

    // Test with different method names and interfaces
    const error3 = new ProviderMethodNotSupportedError('personal_sign', ProviderInterface.ETHERS);
    expect(error3.message).toBe('Method personal_sign is not supported by provider ethers');
    expect(error3.name).toBe('ProviderMethodNotSupportedError');
    expect(error3).toBeInstanceOf(Error);
  });

  test('implements provider interfaces correctly', () => {
    // Create and validate a provider capability object
    const capability: ProviderCapability = {
      interface: ProviderInterface.EIP1193,
      version: '1.0.0',
      methods: ['eth_requestAccounts', 'eth_accounts'],
      events: ['accountsChanged', 'chainChanged'],
    };
    expect(capability.interface).toBe(ProviderInterface.EIP1193);
    expect(capability.methods).toContain('eth_requestAccounts');
    expect(capability.events).toContain('chainChanged');

    // EIP1193Provider
    const eip1193Provider: EIP1193Provider = {
      type: ProviderInterface.EIP1193,
      request: async () => Promise.resolve({}),
      on: () => {},
      removeListener: () => {},
    };
    expect(eip1193Provider.type).toBe(ProviderInterface.EIP1193);

    // EIP6963Provider
    const eip6963Provider: EIP6963Provider = {
      type: ProviderInterface.EIP6963,
      request: async () => Promise.resolve({}),
      info: {
        uuid: '123',
        name: 'Test Provider',
        icon: 'icon.png',
        rdns: 'com.test.provider',
      },
    };
    expect(eip6963Provider.type).toBe(ProviderInterface.EIP6963);
    expect(eip6963Provider.info.uuid).toBe('123');

    // EthersProvider
    const ethersProvider: EthersProvider = {
      type: ProviderInterface.ETHERS,
      request: async () => Promise.resolve({}),
      getSigner: async () => Promise.resolve({}),
    };
    expect(ethersProvider.type).toBe(ProviderInterface.ETHERS);

    // NativeProvider
    const nativeProvider: NativeProvider = {
      type: ProviderInterface.NATIVE,
      request: async () => Promise.resolve({}),
      isNative: true,
    };
    expect(nativeProvider.type).toBe(ProviderInterface.NATIVE);
    expect(nativeProvider.isNative).toBe(true);
  });
});

/**
 * Mock for @aztec/aztec.js
 * Prevents loading the 302MB Aztec library during tests
 */
import { vi } from 'vitest';

// Log to verify mock is being loaded
console.log('[TEST] Using mocked @aztec/aztec.js');

// Mock AztecAddress class
export class AztecAddress {
  constructor(address) {
    // Normalize to lowercase on construction
    this.address = address ? address.toLowerCase() : '0x0000000000000000000000000000000000000000000000000000000000000001';
  }

  toString() {
    // Always return lowercase
    return this.address.toLowerCase();
  }

  toShortString() {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  equals(other) {
    return this.address === other?.address;
  }

  static fromString(str) {
    // Validate address format
    if (typeof str !== 'string') {
      throw new Error(`Invalid address: expected string, got ${typeof str}`);
    }
    if (!str.match(/^0x[0-9a-fA-F]{64}$/)) {
      throw new Error(`Invalid address: ${str}`);
    }
    return new AztecAddress(str);
  }

  static random() {
    return new AztecAddress(`0x${Math.random().toString(16).slice(2).padStart(64, '0')}`);
  }

  static ZERO = new AztecAddress('0x0000000000000000000000000000000000000000000000000000000000000000');
}

// Mock Contract class
export class Contract {
  constructor(address, artifact, wallet) {
    this.address = address;
    this.artifact = artifact;
    this.wallet = wallet;
    this.methods = {};
  }

  static at(address, artifact, wallet) {
    return new Contract(address, artifact, wallet);
  }
}

// Mock Fr (Field element)
export class Fr {
  constructor(value) {
    this.value = value || 0n;
  }

  toString() {
    return this.value.toString();
  }

  toBigInt() {
    return this.value;
  }

  static fromString(str) {
    return new Fr(BigInt(str));
  }

  static ZERO = new Fr(0n);
  static ONE = new Fr(1n);
}

// Mock PXE (Private eXecution Environment)
export const createPXEClient = vi.fn().mockResolvedValue({
  getNodeInfo: vi.fn().mockResolvedValue({ nodeVersion: 'mock', chainId: 'aztec:31337' }),
  getRegisteredAccounts: vi.fn().mockResolvedValue([]),
  getRecipients: vi.fn().mockResolvedValue([]),
  registerAccount: vi.fn().mockResolvedValue(undefined),
  registerRecipient: vi.fn().mockResolvedValue(undefined),
  addContracts: vi.fn().mockResolvedValue(undefined),
  getContractInstance: vi.fn().mockResolvedValue(null),
});

// Mock wallet types
export class AccountWallet {
  constructor(pxe, address) {
    this.pxe = pxe;
    this.address = address;
  }

  getAddress() {
    return this.address;
  }

  getChainId() {
    return 'aztec:31337';
  }
}

// Mock transaction types
export class TxHash {
  constructor(hash) {
    this.hash = hash || '0x0000000000000000000000000000000000000000000000000000000000000001';
  }

  toString() {
    return this.hash;
  }

  static fromString(str) {
    return new TxHash(str);
  }
}

export class TxReceipt {
  constructor(status, txHash) {
    this.status = status || 'success';
    this.txHash = txHash || new TxHash();
    this.blockNumber = 1;
  }
}

// Export common utilities
export const computeMessageSecretHash = vi.fn().mockReturnValue(Fr.ZERO);
export const derivePublicKeyFromSecretKey = vi.fn().mockReturnValue(AztecAddress.random());
export const generatePublicKey = vi.fn().mockReturnValue(AztecAddress.random());

// Export constants
export const MAX_FIELD_VALUE = 2n ** 254n - 1n;

// Default export
export default {
  AztecAddress,
  Contract,
  Fr,
  createPXEClient,
  AccountWallet,
  TxHash,
  TxReceipt,
  computeMessageSecretHash,
  derivePublicKeyFromSecretKey,
  generatePublicKey,
  MAX_FIELD_VALUE,
};

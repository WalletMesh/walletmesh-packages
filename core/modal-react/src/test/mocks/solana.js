/**
 * Mock implementation of @solana/web3.js for testing
 *
 * This file provides a complete mock of the Solana Web3.js library
 * to prevent import errors during testing when the library is not installed.
 */

// Mock PublicKey
export class PublicKey {
  constructor(key) {
    this._key = key;
  }

  toString() {
    return this._key || 'mockPublicKey';
  }

  toBase58() {
    return this._key || 'mockPublicKey';
  }

  toBuffer() {
    return new Uint8Array([1, 2, 3, 4]);
  }

  static isOnCurve(key) {
    return true;
  }
}

// Mock Transaction
export class Transaction {
  constructor() {
    this.signatures = [];
    this.instructions = [];
  }

  serialize() {
    return new Uint8Array([1, 2, 3, 4]);
  }

  static from(data) {
    const tx = new Transaction();
    tx.data = data;
    return tx;
  }

  add(instruction) {
    this.instructions.push(instruction);
    return this;
  }
}

// Mock Connection
export class Connection {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAccountInfo(publicKey) {
    return null;
  }

  async getBalance(publicKey) {
    return 2000000000; // 2 SOL in lamports
  }

  async sendTransaction(transaction, signers) {
    return 'mockTransactionSignature';
  }

  async confirmTransaction(signature) {
    return { value: { err: null } };
  }
}

// Mock Keypair
export class Keypair {
  constructor() {
    this.publicKey = new PublicKey('mockKeypairPublicKey');
    this.secretKey = new Uint8Array(64);
  }

  static generate() {
    return new Keypair();
  }

  static fromSecretKey(secretKey) {
    const kp = new Keypair();
    kp.secretKey = secretKey;
    return kp;
  }
}

// Mock SystemProgram
export const SystemProgram = {
  transfer: (params) => ({
    keys: [
      { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
      { pubkey: params.toPubkey, isSigner: false, isWritable: true },
    ],
    programId: new PublicKey('11111111111111111111111111111112'),
    data: new Uint8Array([2, 0, 0, 0, ...new Array(8).fill(0)]),
  }),

  createAccount: (params) => ({
    keys: [
      { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
      { pubkey: params.newAccountPubkey, isSigner: true, isWritable: true },
    ],
    programId: new PublicKey('11111111111111111111111111111112'),
    data: new Uint8Array([0, 0, 0, 0]),
  }),
};

// Mock LAMPORTS_PER_SOL
export const LAMPORTS_PER_SOL = 1000000000;

// Default export for CommonJS compatibility
export default {
  PublicKey,
  Transaction,
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
};

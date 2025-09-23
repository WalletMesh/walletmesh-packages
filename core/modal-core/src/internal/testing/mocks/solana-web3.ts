/**
 * Mock implementation of @solana/web3.js for testing
 *
 * This provides mock implementations of Solana Web3.js classes
 * for testing purposes when the actual library is not available.
 *
 * @internal
 */

/**
 * Mock PublicKey class
 */
export class PublicKey {
  constructor(public key: string) {}

  toString() {
    return this.key;
  }

  toBase58() {
    return this.key;
  }

  toBuffer() {
    return Buffer.from(this.key);
  }

  equals(other: PublicKey) {
    return this.key === other.key;
  }
}

/**
 * Mock Transaction class
 */
export class Transaction {
  instructions: unknown[] = [];
  feePayer?: PublicKey;
  recentBlockhash?: string;

  serialize(_options?: unknown) {
    return new Uint8Array([1, 2, 3, 4]);
  }

  static from(_data: Buffer) {
    return new Transaction();
  }

  add(instruction: unknown) {
    this.instructions.push(instruction);
    return this;
  }
}

/**
 * Mock Connection class
 */
export class Connection {
  constructor(public endpoint: string) {}

  async getBalance(_publicKey: PublicKey) {
    return 1000000000; // 1 SOL in lamports
  }

  async getLatestBlockhash() {
    return {
      blockhash: 'mock-blockhash',
      lastValidBlockHeight: 12345,
    };
  }

  async sendTransaction(_transaction: Transaction) {
    return 'mock-transaction-signature';
  }
}

/**
 * Mock Keypair class
 */
export class Keypair {
  publicKey: PublicKey;
  secretKey: Uint8Array;

  constructor() {
    this.publicKey = new PublicKey('mock-public-key');
    this.secretKey = new Uint8Array(64);
  }

  static generate() {
    return new Keypair();
  }
}

/**
 * Mock System Program
 */
export const systemProgram = {
  programId: new PublicKey('11111111111111111111111111111111'),

  transfer(params: { fromPubkey: PublicKey; toPubkey: PublicKey; lamports: number }) {
    return {
      programId: systemProgram.programId,
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
      ],
      data: Buffer.from([]),
    };
  },
};

/**
 * Mock LAMPORTS_PER_SOL constant
 */
export const LAMPORTS_PER_SOL = 1000000000;

/**
 * Mock clusterApiUrl function
 */
export function clusterApiUrl(cluster: 'mainnet-beta' | 'testnet' | 'devnet') {
  const urls = {
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com',
    devnet: 'https://api.devnet.solana.com',
  };
  return urls[cluster];
}

// Default export for compatibility
export default {
  PublicKey,
  Transaction,
  Connection,
  Keypair,
  systemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
};

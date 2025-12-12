import type { AccountContract } from '@aztec/aztec.js/account';
import { Fq } from '@aztec/aztec.js/fields';

/**
 * Factory interface for creating account contracts.
 * Allows users to register custom account contract types.
 */
export interface AccountContractFactory {
  /**
   * Creates an account contract instance from a signing key.
   * @param signingKey - The signing key (Buffer or Fq)
   * @returns An account contract instance
   */
  createContract(signingKey: Buffer | Fq): AccountContract;

  /**
   * Returns the account type identifier for this factory.
   * @returns The account type string (e.g., "schnorr", "ecdsasecp256k1", "ecdsasecp256r1")
   */
  getType(): string;
}

/**
 * Registry for managing account contract factories.
 * Supports registration of custom account contract types.
 */
export class AccountContractRegistry {
  private factories: Map<string, AccountContractFactory> = new Map();

  /**
   * Registers an account contract factory.
   * @param factory - The factory to register
   */
  registerFactory(factory: AccountContractFactory): void {
    this.factories.set(factory.getType(), factory);
  }

  /**
   * Registers an account contract factory by type and factory function.
   * @param type - The account type identifier
   * @param factory - Factory function that creates the contract from a signing key
   */
  registerAccountContractFactory(type: string, factory: (signingKey: Buffer | Fq) => AccountContract): void {
    this.factories.set(type, {
      createContract: factory,
      getType: () => type,
    });
  }

  /**
   * Gets a factory for a specific account type.
   * @param type - The account type identifier
   * @returns The factory for the type, or undefined if not registered
   */
  getFactory(type: string): AccountContractFactory | undefined {
    return this.factories.get(type);
  }

  /**
   * Checks if a factory is registered for a given type.
   * @param type - The account type identifier
   * @returns True if a factory is registered for this type
   */
  hasFactory(type: string): boolean {
    return this.factories.has(type);
  }

  /**
   * Creates an account contract for a given type and signing key.
   * @param type - The account type identifier
   * @param signingKey - The signing key (Buffer or Fq)
   * @returns An account contract instance
   * @throws Error if the type is not registered
   */
  createContract(type: string, signingKey: Buffer | Fq): AccountContract {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(
        `Account contract type "${type}" is not registered. Available types: ${Array.from(this.factories.keys()).join(', ')}`,
      );
    }
    return factory.createContract(signingKey);
  }

  /**
   * Gets all registered account types.
   * @returns Array of registered account type strings
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Creates a default AccountContractRegistry with built-in account types registered.
 * Uses lazy imports to avoid requiring dependencies if not used.
 * @returns A registry with "schnorr", "ecdsasecp256k1", and "ecdsasecp256r1" factories
 */
export function createDefaultAccountContractRegistry(): AccountContractRegistry {
  const registry = new AccountContractRegistry();

  // Register Schnorr account contract
  registry.registerAccountContractFactory('schnorr', (signingKey) => {
    // Lazy import - will be resolved at runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SchnorrAccountContract } = require('@aztec/accounts/schnorr/lazy');
    const signingKeyFq = signingKey instanceof Fq ? signingKey : Fq.fromBuffer(signingKey);
    return new SchnorrAccountContract(signingKeyFq);
  });

  // Register ECDSA secp256k1 account contract
  registry.registerAccountContractFactory('ecdsasecp256k1', (signingKey) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EcdsaKAccountContract } = require('@aztec/accounts/ecdsa');
    return new EcdsaKAccountContract(signingKey);
  });

  // Register ECDSA secp256r1 account contract
  registry.registerAccountContractFactory('ecdsasecp256r1', (signingKey) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EcdsaRAccountContract } = require('@aztec/accounts/ecdsa');
    return new EcdsaRAccountContract(signingKey);
  });

  return registry;
}

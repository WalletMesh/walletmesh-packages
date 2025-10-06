/**
 * Shared helpers for normalizing Aztec contract artifacts and ensuring
 * registration with the connected wallet.
 */

import type { AztecDappWallet } from '@walletmesh/modal-core/providers/aztec/lazy';
import type { ContractArtifact } from '../useAztecDeploy.js';

const registeredContractClasses = new Set<string>();

export function normalizeArtifact(artifact: ContractArtifact): ContractArtifact {
  if (!artifact) {
    throw new Error('Artifact is required');
  }

  if (artifact.notes) {
    return artifact;
  }

  return {
    ...artifact,
    notes: {},
  } satisfies ContractArtifact;
}

export async function registerArtifactWithWallet(
  wallet: AztecDappWallet | null,
  artifact: ContractArtifact,
): Promise<void> {
  if (!wallet) {
    return;
  }

  const { getContractClassFromArtifact } = await import('@aztec/stdlib/contract');
  const { id } = await getContractClassFromArtifact(artifact as any);
  const key = id.toString();

  if (registeredContractClasses.has(key)) {
    return;
  }

  try {
    await wallet.registerContractClass(artifact as Parameters<typeof wallet.registerContractClass>[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('already registered')) {
      throw error;
    }
  }

  registeredContractClasses.add(key);
}

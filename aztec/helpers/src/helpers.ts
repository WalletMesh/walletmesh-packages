import type { ContractArtifact, FunctionArtifact, FunctionSelector, PXE } from '@aztec/aztec.js';
import { AztecAddress } from '@aztec/aztec.js';
import { getFunctionArtifact } from '@aztec/stdlib/abi';

/**
 * @internal
 * Cache for contract artifacts to avoid redundant fetches from the PXE.
 * Keyed by contract address string.
 */
const contractArtifactCache = new Map<string, ContractArtifact>();

/**
 * Retrieves the contract artifact for a given contract address.
 * Fetches from the PXE service and caches the result.
 *
 * @param pxe - An initialized PXE client instance.
 * @param contractAddress - The Aztec address of the contract as a string.
 * @returns A promise that resolves to the {@link ContractArtifact}.
 * @throws If the contract or its artifact is not registered in the PXE.
 */
export async function getContractArtifactFromContractAddress(
  pxe: PXE,
  contractAddress: string,
): Promise<ContractArtifact> {
  // TODO: do we need to make the cache aware of different networks?
  const cached = contractArtifactCache.get(contractAddress);
  if (cached) {
    return cached;
  }

  const aztecAddr = AztecAddress.fromString(contractAddress);
  const contractMetadata = await pxe.getContractMetadata(aztecAddr);
  const instance = contractMetadata?.contractInstance;
  if (!instance) {
    throw new Error(`Contract ${contractAddress} is not registered in the PXE, or metadata is incomplete.`);
  }

  // Use currentContractClassId as it reflects the active class for the instance
  const contractClassMetadata = await pxe.getContractClassMetadata(instance.currentContractClassId);

  const artifact = contractClassMetadata?.artifact;
  if (!artifact) {
    throw new Error(
      `Artifact for contract class ID ${instance.currentContractClassId.toString()} is not registered in the PXE, or metadata is incomplete.`,
    );
  }

  contractArtifactCache.set(contractAddress, artifact);
  return artifact;
}

/**
 * Retrieves the function artifact for a specific function within a contract.
 *
 * @param pxe - An initialized PXE client instance.
 * @param contractAddress - The Aztec address of the contract as a string.
 * @param functionNameOrSelector - The name of the function (string) or its {@link FunctionSelector}.
 * @returns A promise that resolves to the {@link FunctionArtifact}.
 * @throws If the contract artifact or the specific function artifact cannot be found.
 */
export async function getFunctionArtifactFromContractAddress(
  pxe: PXE,
  contractAddress: string,
  functionNameOrSelector: string | FunctionSelector,
): Promise<FunctionArtifact> {
  const artifact = await getContractArtifactFromContractAddress(pxe, contractAddress);
  return await getFunctionArtifact(artifact, functionNameOrSelector);
}

/**
 * Represents information about a function parameter.
 */
export type FunctionParameterInfo = {
  /** The name of the parameter. */
  name: string;
  /** The type of the parameter (e.g., 'field', 'boolean', or a struct name like 'MyStruct'). */
  type: string;
};

/**
 * Retrieves simplified parameter information (name and type string) for a specific function.
 *
 * @param pxe - An initialized PXE client instance.
 * @param contractAddress - The Aztec address of the contract as a string.
 * @param functionNameOrSelector - The name of the function (string) or its {@link FunctionSelector}.
 * @returns A promise that resolves to an array of {@link FunctionParameterInfo} objects.
 * @throws If the contract or function artifact cannot be found.
 */
export async function getFunctionParameterInfoFromContractAddress(
  pxe: PXE,
  contractAddress: string,
  functionNameOrSelector: string | FunctionSelector,
): Promise<FunctionParameterInfo[]> {
  const functionArtifact = await getFunctionArtifactFromContractAddress(
    pxe,
    contractAddress,
    functionNameOrSelector,
  );
  return functionArtifact.parameters.map((p) => {
    let typeString: string;
    if (p.type.kind === 'struct') {
      typeString = p.type.path; // Use the struct's path (name)
    } else {
      typeString = p.type.kind; // Use the primitive kind (e.g., 'field', 'boolean')
    }
    return { name: p.name, type: typeString };
  });
}

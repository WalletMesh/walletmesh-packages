import type { AbiType, ContractArtifact, FunctionArtifact, FunctionSelector, PXE } from '@aztec/aztec.js';
import { AztecAddress } from '@aztec/aztec.js';
import { getFunctionArtifact } from '@aztec/stdlib/abi';
import type { EnhancedParameterInfo } from './types.js';

/**
 * @internal
 * Cache for contract artifacts to avoid redundant fetches from the PXE.
 * Keyed by contract address string.
 */
const contractArtifactCache = new Map<string, ContractArtifact>();

/**
 * @internal
 * Cache for contract artifacts by class ID to avoid redundant fetches from the PXE.
 * Keyed by contract class ID hex string.
 */
const contractClassArtifactCache = new Map<string, ContractArtifact>();

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
  // Pass true to includeArtifact parameter to ensure the artifact is returned
  const contractClassMetadata = await pxe.getContractClassMetadata(instance.currentContractClassId, true);

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
 * Retrieves the contract artifact for a given contract class ID.
 * Fetches from the PXE service and caches the result.
 * This is useful when the contract instance doesn't exist yet but the class is registered.
 *
 * @param pxe - An initialized PXE client instance.
 * @param contractClassId - The contract class ID (can be string or object with toString()).
 * @returns A promise that resolves to the {@link ContractArtifact}.
 * @throws If the contract class or its artifact is not registered in the PXE.
 */
export async function getContractArtifactFromClassId(
  pxe: PXE,
  contractClassId: string | { toString(): string },
): Promise<ContractArtifact> {
  const classIdString = typeof contractClassId === 'string' ? contractClassId : contractClassId.toString();

  // Check cache first
  const cached = contractClassArtifactCache.get(classIdString);
  if (cached) {
    return cached;
  }

  // Import Fr to handle class ID conversion if needed
  const { Fr } = await import('@aztec/aztec.js');
  const classIdFr = Fr.fromHexString(classIdString);

  // Pass true to includeArtifact parameter to ensure the artifact is returned
  const contractClassMetadata = await pxe.getContractClassMetadata(classIdFr, true);

  const artifact = contractClassMetadata?.artifact;
  if (!artifact) {
    throw new Error(
      `Artifact for contract class ID ${classIdString} is not registered in the PXE, or metadata is incomplete.`,
    );
  }

  contractClassArtifactCache.set(classIdString, artifact);
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

/**
 * Format ABI type as human-readable string
 *
 * @param type - The ABI type to format
 * @returns Human-readable type string
 *
 * @internal
 */
function formatAbiTypeString(type: AbiType): string {
  if (type.kind === 'struct') {
    return type.path || 'struct';
  }
  if (type.kind === 'array') {
    return `${formatAbiTypeString(type.type)}[${type.length}]`;
  }
  if (type.kind === 'integer') {
    return `${type.sign === 'signed' ? 'i' : 'u'}${type.width}`;
  }
  return type.kind;
}

/**
 * Retrieves enhanced parameter information with full ABI types preserved
 *
 * This function returns complete parameter information including the full ABI type object,
 * which enables type-aware value formatting in the UI.
 *
 * @param pxe - An initialized PXE client instance.
 * @param contractAddress - The Aztec address of the contract as a string.
 * @param functionNameOrSelector - The name of the function (string) or its {@link FunctionSelector}.
 * @returns A promise that resolves to an array of {@link EnhancedParameterInfo} objects.
 * @throws If the contract or function artifact cannot be found.
 *
 * @example
 * ```typescript
 * const paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, 'transfer');
 * // Returns:
 * // [
 * //   { name: 'recipient', abiType: { kind: 'field' }, typeString: 'field' },
 * //   { name: 'amount', abiType: { kind: 'field' }, typeString: 'field' }
 * // ]
 * ```
 *
 * @public
 */
export async function getEnhancedParameterInfo(
  pxe: PXE,
  contractAddress: string,
  functionNameOrSelector: string | FunctionSelector,
): Promise<EnhancedParameterInfo[]> {
  const functionArtifact = await getFunctionArtifactFromContractAddress(
    pxe,
    contractAddress,
    functionNameOrSelector,
  );

  return functionArtifact.parameters.map((p) => ({
    name: p.name,
    abiType: p.type, // Preserve full AbiType object
    typeString: formatAbiTypeString(p.type),
  }));
}

import type { ContractArtifact, FunctionArtifact, FunctionSelector, PXE } from '@aztec/aztec.js';
import { AztecAddress } from '@aztec/aztec.js';

const contractArtifactCache = new Map<string, ContractArtifact>();

export async function getContractArtifactFromContractAddress(
  pxe: PXE,
  contractAddress: string,
): Promise<ContractArtifact> {
  // TODO: do we need to make the cache aware of different networks?
  const cached = contractArtifactCache.get(contractAddress);
  if (cached) {
    return cached;
  }

  const instance = await pxe.getContractInstance(AztecAddress.fromString(contractAddress));
  if (!instance) {
    throw new Error(`Contract ${contractAddress} is not registered in the PXE`);
  }

  const artifact = await pxe.getContractArtifact(instance.contractClassId);

  if (!artifact) {
    throw new Error(
      `Artifact for contract class ID ${instance.contractClassId.toString()} is not registered in the PXE`,
    );
  }

  contractArtifactCache.set(contractAddress, artifact);
  return artifact;
}

export async function getFunctionArtifactFromContractAddress(
  pxe: PXE,
  contractAddress: string,
  functionNameOrSelector: string | FunctionSelector,
): Promise<FunctionArtifact> {
  const artifact = await getContractArtifactFromContractAddress(pxe, contractAddress);

  const functionArtifact = artifact.functions.find((f) =>
    typeof functionNameOrSelector === 'string'
      ? f.name === functionNameOrSelector
      : functionNameOrSelector.equals(f.name, f.parameters),
  );
  if (!functionArtifact) {
    throw new Error(`Unknown function ${functionNameOrSelector}`);
  }

  return functionArtifact;
}

export type FunctionParameterInfo = { name: string; type: string };

export async function getFunctionParameterInfoFromContractAddress(
  pxe: PXE,
  contractAddress: string,
  functionNameOrSelector: string | FunctionSelector,
): Promise<FunctionParameterInfo[]> {
  const artifact = await getFunctionArtifactFromContractAddress(pxe, contractAddress, functionNameOrSelector);
  return artifact.parameters.map((p) => {
    let kind: string;
    if (p.type.kind === 'struct') {
      kind = p.type.path;
    } else {
      kind = p.type.kind;
    }
    return { name: p.name, type: kind };
  });
}

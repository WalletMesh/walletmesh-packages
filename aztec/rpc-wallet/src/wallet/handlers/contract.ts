import { createLogger } from '@aztec/foundation/log';
import type { ContractArtifact } from '@aztec/stdlib/abi';
import type { ContractInstanceWithAddress } from '@aztec/stdlib/contract';
import type { AztecWalletMethodMap } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:contract');

/**
 * Creates handlers for contract-related Aztec wallet JSON-RPC methods.
 * These handlers are responsible for managing the registration of deployed contract
 * instances and contract classes (artifacts), as well as retrieving contract metadata.
 *
 * Each handler function receives an {@link AztecHandlerContext} which provides access
 * to the {@link AccountWallet}, {@link PXE} client, and {@link ContractArtifactCache}.
 *
 * @returns An object where keys are contract-related method names
 *          (e.g., "aztec_registerContract", "aztec_getContractMetadata") and values
 *          are their corresponding handler functions.
 * @see {@link AztecWalletMethodMap} for method definitions.
 */
export function createContractHandlers() {
  return {
    /**
     * Handles the "aztec_registerContract" JSON-RPC method.
     * Registers a deployed contract instance with the {@link AccountWallet} in the context.
     * This allows the wallet to be aware of and interact with the specified contract.
     * An optional {@link ContractArtifact} can be provided to include ABI information.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the contract instance and optional artifact.
     *                      Defined by {@link AztecWalletMethodMap.aztec_registerContract.params}.
     * @param paramsTuple.0 - The {@link ContractInstanceWithAddress} to register.
     * @param paramsTuple.1 - Optional: The {@link ContractArtifact} associated with the instance.
     * @returns A promise that resolves to `true` if the registration was successful.
     * @throws {Error} If critical parameters like `instance` are missing or invalid,
     *                 though type checking and serializer validation should catch this earlier.
     */
    aztec_registerContract: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_registerContract']['params'],
    ): Promise<AztecWalletMethodMap['aztec_registerContract']['result']> => {
      const [instance, artifact] = paramsTuple;
      logger.debug(
        `[HANDLER] aztec_registerContract: instance = ${instance?.address?.toString()}, artifact provided = ${!!artifact}`,
      );
      // Original logic used `instance === undefined` check, but instance is not optional in the tuple.
      // The type system should ensure `instance` is provided.
      // If `instance` itself could be undefined in the tuple, the tuple type would be `[ContractInstanceWithAddress | undefined, ...]`.
      // Assuming `instance` is guaranteed by the tuple type.
      const contractToRegister: { instance: ContractInstanceWithAddress; artifact?: ContractArtifact } = {
        instance,
      };
      if (artifact) {
        contractToRegister.artifact = artifact;
      }
      await ctx.wallet.registerContract(contractToRegister);
      return true;
    },

    /**
     * Handles the "aztec_registerContractClass" JSON-RPC method.
     * Registers a contract class (defined by its {@link ContractArtifact}) with the
     * {@link AccountWallet} in the context. This makes the contract's bytecode and ABI
     * known to the wallet, typically for future deployments or interactions.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the contract artifact.
     *                      Defined by {@link AztecWalletMethodMap.aztec_registerContractClass.params}.
     * @param paramsTuple.0 - The {@link ContractArtifact} to register.
     * @returns A promise that resolves to `true` if the registration was successful.
     * @throws {Error} If the `artifact` parameter is missing or invalid,
     *                 though type checking and serializer validation should catch this earlier.
     */
    aztec_registerContractClass: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_registerContractClass']['params'],
    ): Promise<AztecWalletMethodMap['aztec_registerContractClass']['result']> => {
      const [artifact] = paramsTuple;
      logger.debug(`[HANDLER] aztec_registerContractClass: artifact name = ${artifact?.name}`);
      // Artifact is not optional in the tuple type.
      await ctx.wallet.registerContractClass(artifact);
      return true;
    },

    /**
     * Handles the "aztec_getContractMetadata" JSON-RPC method.
     * Retrieves {@link ContractMetadata} for a deployed contract at a given {@link AztecAddress},
     * using the {@link AccountWallet} in the context.
     *
     * Contract metadata typically includes information about the contract's instance,
     * initialization status, and public deployment status.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the contract address.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getContractMetadata.params}.
     * @param paramsTuple.0 - The {@link AztecAddress} of the contract.
     * @returns A promise that resolves to the {@link ContractMetadata}.
     * @throws {Error} If the `address` parameter is missing or invalid, or if metadata is not found.
     */
    aztec_getContractMetadata: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getContractMetadata']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getContractMetadata']['result']> => {
      const [address] = paramsTuple;
      logger.debug(`[HANDLER] aztec_getContractMetadata: address = ${address?.toString()}`);
      // Address is not optional in the tuple type.
      // Add runtime check for robustness if needed, though TS should catch it.
      if (!address || typeof address.toString !== 'function') {
        // Basic check
        throw new Error('Invalid address parameter received in tuple');
      }
      const metadata = await ctx.wallet.getContractMetadata(address);
      if (!metadata) {
        throw new Error(`Contract metadata not found for address: ${address.toString()}`);
      }
      return metadata;
    },

    /**
     * Handles the "aztec_getContracts" JSON-RPC method.
     * Retrieves a list of {@link AztecAddress}es for all contracts known to the {@link PXE}
     * instance in the current context. This typically includes contracts that have been
     * registered or deployed through this PXE.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `pxe` instance.
     * @param _paramsTuple - Parameters for this method (expected to be an empty array).
     *                       Defined by {@link AztecWalletMethodMap.aztec_getContracts.params}.
     * @returns A promise that resolves to an array of {@link AztecAddress} objects.
     *          Type defined by {@link AztecWalletMethodMap.aztec_getContracts.result}.
     */
    aztec_getContracts: async (
      ctx: AztecHandlerContext,
      _paramsTuple: AztecWalletMethodMap['aztec_getContracts']['params'], // Will be `[]`
    ): Promise<AztecWalletMethodMap['aztec_getContracts']['result']> => {
      logger.debug('[HANDLER] aztec_getContracts');
      return await ctx.pxe.getContracts();
    },

    /**
     * Handles the "aztec_getContractClassMetadata" JSON-RPC method.
     * Retrieves {@link ContractClassMetadata} for a contract class identified by its {@link Fr} ID,
     * using the {@link AccountWallet} in the context.
     *
     * Contract class metadata provides information about a registered contract class,
     * potentially including its artifact if requested.
     *
     * @param ctx - The {@link AztecHandlerContext} containing the `wallet` instance.
     * @param paramsTuple - A tuple containing the class ID and an optional flag to include the artifact.
     *                      Defined by {@link AztecWalletMethodMap.aztec_getContractClassMetadata.params}.
     * @param paramsTuple.0 - The {@link Fr} ID of the contract class.
     * @param paramsTuple.1 - Optional: A boolean indicating whether to include the full {@link ContractArtifact}
     *                        in the returned metadata. Defaults to `false`.
     * @returns A promise that resolves to the {@link ContractClassMetadata}.
     * @throws {Error} If the `id` parameter is missing or invalid.
     */
    aztec_getContractClassMetadata: async (
      ctx: AztecHandlerContext,
      paramsTuple: AztecWalletMethodMap['aztec_getContractClassMetadata']['params'],
    ): Promise<AztecWalletMethodMap['aztec_getContractClassMetadata']['result']> => {
      const [id, includeArtifactInput] = paramsTuple;
      const includeArtifact = includeArtifactInput === undefined ? false : includeArtifactInput; // Default for optional
      logger.debug(
        `[HANDLER] aztec_getContractClassMetadata: id = ${id?.toString()}, includeArtifact = ${includeArtifact}`,
      );
      // Id is not optional in the tuple type.
      if (!id || typeof id.toString !== 'function') {
        // Basic check for Fr-like object
        throw new Error('Invalid id parameter received in tuple');
      }
      return await ctx.wallet.getContractClassMetadata(id, includeArtifact);
    },
  };
}

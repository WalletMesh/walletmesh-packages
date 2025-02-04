import type { AccountWallet } from '@aztec/aztec.js';
import { AztecWalletError } from '../errors.js';
import type { AztecWalletContext, AztecWalletMethodMap } from '../types.js';

export const AZTEC_WALLET_METHODS: (keyof AztecWalletMethodMap)[] = [
  'aztec_getBlock',
  'aztec_getBlockNumber',
  'aztec_getChainId',
  'aztec_getVersion',
  'aztec_getNodeInfo',
  'aztec_getCurrentBaseFees',
  'aztec_setScopes',
  'aztec_getScopes',
  'aztec_isL1ToL2MessageSynced',
  'aztec_getL1ToL2MembershipWitness',
  'aztec_addCapsule',
  'aztec_getAddress',
  'aztec_getCompleteAddress',
  'aztec_registerAccount',
  'aztec_getRegisteredAccounts',
  'aztec_addAuthWitness',
  'aztec_getAuthWitness',
  'aztec_createAuthWit',
  'aztec_registerSender',
  'aztec_getSenders',
  'aztec_removeSender',
  'aztec_getContracts',
  'aztec_getContractInstance',
  'aztec_getContractClass',
  'aztec_getContractArtifact',
  'aztec_isContractClassPubliclyRegistered',
  'aztec_isContractPubliclyDeployed',
  'aztec_isContractInitialized',
  'aztec_registerContract',
  'aztec_registerContractClass',
  'aztec_getPublicStorageAt',
  'aztec_createTxExecutionRequest',
  'aztec_proveTx',
  'aztec_sendTx',
  'aztec_getTxEffect',
  'aztec_getTxReceipt',
  'aztec_simulateTx',
  'aztec_simulateUnconstrained',
  'aztec_getNotes',
  'aztec_addNote',
  'aztec_addNullifiedNote',
  'aztec_getPublicLogs',
  'aztec_getContractClassLogs',
  'aztec_getPrivateEvents',
  'aztec_getPublicEvents',
] as const;

// Handler functions with proper type safety
async function handleGetBlock(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getBlock']['params'],
): Promise<AztecWalletMethodMap['aztec_getBlock']['result']> {
  const block = await wallet.getBlock(params.number);
  if (!block) throw new AztecWalletError('blockNotFound', 'aztec_getBlock');
  return block;
}

async function handleGetBlockNumber(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getBlockNumber']['result']> {
  return await wallet.getBlockNumber();
}

async function handleGetChainId(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getChainId']['result']> {
  return Number(wallet.getChainId());
}

async function handleGetVersion(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getVersion']['result']> {
  return Number(wallet.getVersion());
}

async function handleGetNodeInfo(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getNodeInfo']['result']> {
  return await wallet.getNodeInfo();
}

async function handleGetCurrentBaseFees(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getCurrentBaseFees']['result']> {
  return await wallet.getCurrentBaseFees();
}

async function handleSetScopes(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_setScopes']['params'],
): Promise<AztecWalletMethodMap['aztec_setScopes']['result']> {
  await wallet.setScopes(params.scopes);
  return true;
}

async function handleGetScopes(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getScopes']['result']> {
  const scopes = await wallet.getScopes();
  return scopes ?? [];
}

async function handleAddCapsule(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_addCapsule']['params'],
): Promise<AztecWalletMethodMap['aztec_addCapsule']['result']> {
  await wallet.addCapsule(params.capsule);
  return true;
}

async function handleGetAddress(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getAddress']['result']> {
  return wallet.getAddress();
}

async function handleGetCompleteAddress(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getCompleteAddress']['result']> {
  return wallet.getCompleteAddress();
}

async function handleRegisterAccount(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_registerAccount']['params'],
): Promise<AztecWalletMethodMap['aztec_registerAccount']['result']> {
  return await wallet.registerAccount(params.secretKey, params.partialAddress);
}

async function handleGetRegisteredAccounts(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getRegisteredAccounts']['result']> {
  return await wallet.getRegisteredAccounts();
}

async function handleRegisterSender(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_registerSender']['params'],
): Promise<AztecWalletMethodMap['aztec_registerSender']['result']> {
  return await wallet.registerSender(params.sender);
}

async function handleGetSenders(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getSenders']['result']> {
  return await wallet.getSenders();
}

async function handleRemoveSender(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_removeSender']['params'],
): Promise<AztecWalletMethodMap['aztec_removeSender']['result']> {
  await wallet.removeSender(params.sender);
  return true;
}

async function handleAddAuthWitness(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_addAuthWitness']['params'],
): Promise<AztecWalletMethodMap['aztec_addAuthWitness']['result']> {
  await wallet.addAuthWitness(params.authWitness);
  return true;
}

async function handleGetAuthWitness(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getAuthWitness']['params'],
): Promise<AztecWalletMethodMap['aztec_getAuthWitness']['result']> {
  const witness = await wallet.getAuthWitness(params.messageHash);
  if (!witness) throw new AztecWalletError('authWitnessNotFound', 'aztec_getAuthWitness');
  return witness;
}

async function handleCreateAuthWit(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_createAuthWit']['params'],
): Promise<AztecWalletMethodMap['aztec_createAuthWit']['result']> {
  return await wallet.createAuthWit(params.intent);
}

async function handleL1ToL2MessageSynced(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_isL1ToL2MessageSynced']['params'],
): Promise<AztecWalletMethodMap['aztec_isL1ToL2MessageSynced']['result']> {
  return await wallet.isL1ToL2MessageSynced(params.l1ToL2Message);
}

async function handleGetContracts(
  wallet: AccountWallet,
): Promise<AztecWalletMethodMap['aztec_getContracts']['result']> {
  return await wallet.getContracts();
}

async function handleGetContractInstance(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getContractInstance']['params'],
): Promise<AztecWalletMethodMap['aztec_getContractInstance']['result']> {
  const instance = await wallet.getContractInstance(params.address);
  if (!instance) throw new AztecWalletError('contractInstanceNotRegistered', 'aztec_getContractInstance');
  return instance;
}

async function handleGetContractClass(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getContractClass']['params'],
): Promise<AztecWalletMethodMap['aztec_getContractClass']['result']> {
  const contractClass = await wallet.getContractClass(params.id);
  if (!contractClass) throw new AztecWalletError('contractClassNotRegistered', 'aztec_getContractClass');
  return contractClass;
}

async function handleGetContractArtifact(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getContractArtifact']['params'],
): Promise<AztecWalletMethodMap['aztec_getContractArtifact']['result']> {
  const artifact = await wallet.getContractArtifact(params.id);
  if (!artifact) throw new AztecWalletError('contractClassNotRegistered', 'aztec_getContractArtifact');
  return artifact;
}

async function handleIsContractClassPubliclyRegistered(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_isContractClassPubliclyRegistered']['params'],
): Promise<AztecWalletMethodMap['aztec_isContractClassPubliclyRegistered']['result']> {
  return await wallet.isContractClassPubliclyRegistered(params.id);
}

async function handleIsContractPubliclyDeployed(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_isContractPubliclyDeployed']['params'],
): Promise<AztecWalletMethodMap['aztec_isContractPubliclyDeployed']['result']> {
  return await wallet.isContractPubliclyDeployed(params.address);
}

async function handleIsContractInitialized(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_isContractInitialized']['params'],
): Promise<AztecWalletMethodMap['aztec_isContractInitialized']['result']> {
  return await wallet.isContractInitialized(params.address);
}

async function handleRegisterContract(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_registerContract']['params'],
): Promise<AztecWalletMethodMap['aztec_registerContract']['result']> {
  const { instance, artifact } = params;
  await wallet.registerContract({ instance, ...(artifact && { artifact }) });
  return true;
}

async function handleRegisterContractClass(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_registerContractClass']['params'],
): Promise<AztecWalletMethodMap['aztec_registerContractClass']['result']> {
  const { artifact } = params;
  await wallet.registerContractClass(artifact);
  return true;
}

async function handleGetTxReceipt(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getTxReceipt']['params'],
): Promise<AztecWalletMethodMap['aztec_getTxReceipt']['result']> {
  const receipt = await wallet.getTxReceipt(params.txHash);
  if (!receipt) throw new AztecWalletError('transactionNotFound', 'aztec_getTxReceipt');
  return receipt;
}

async function handleSimulateTx(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_simulateTx']['params'],
): Promise<AztecWalletMethodMap['aztec_simulateTx']['result']> {
  const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } = params;
  return await wallet.simulateTx(
    txRequest,
    simulatePublic,
    msgSender,
    skipTxValidation,
    enforceFeePayment,
    profile,
  );
}

async function handleSimulateUnconstrained(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_simulateUnconstrained']['params'],
): Promise<AztecWalletMethodMap['aztec_simulateUnconstrained']['result']> {
  const { functionName, args, to, from } = params;
  return await wallet.simulateUnconstrained(functionName, args, to, from);
}

async function handleCreateTxExecutionRequest(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
): Promise<AztecWalletMethodMap['aztec_createTxExecutionRequest']['result']> {
  return await wallet.createTxExecutionRequest(params.exec);
}

async function handleProveTx(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_proveTx']['params'],
): Promise<AztecWalletMethodMap['aztec_proveTx']['result']> {
  return await wallet.proveTx(params.txRequest, params.privateExecutionResult);
}

async function handleSendTx(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_sendTx']['params'],
): Promise<AztecWalletMethodMap['aztec_sendTx']['result']> {
  return await wallet.sendTx(params.tx);
}

async function handleGetTxEffect(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getTxEffect']['params'],
): Promise<AztecWalletMethodMap['aztec_getTxEffect']['result']> {
  const effect = await wallet.getTxEffect(params.txHash);
  if (!effect) throw new AztecWalletError('transactionNotFound', 'aztec_getTxEffect');
  return effect;
}

async function handleGetPublicStorageAt(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getPublicStorageAt']['params'],
): Promise<AztecWalletMethodMap['aztec_getPublicStorageAt']['result']> {
  return await wallet.getPublicStorageAt(params.contract, params.storageSlot);
}

async function handleGetNotes(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getNotes']['params'],
): Promise<AztecWalletMethodMap['aztec_getNotes']['result']> {
  return await wallet.getNotes(params.filter);
}

async function handleAddNote(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_addNote']['params'],
): Promise<AztecWalletMethodMap['aztec_addNote']['result']> {
  await wallet.addNote(params.note);
  return true;
}

async function handleAddNullifiedNote(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
): Promise<AztecWalletMethodMap['aztec_addNullifiedNote']['result']> {
  await wallet.addNullifiedNote(params.note);
  return true;
}

async function handleGetPublicLogs(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getPublicLogs']['params'],
): Promise<AztecWalletMethodMap['aztec_getPublicLogs']['result']> {
  return await wallet.getPublicLogs(params.filter);
}

async function handleGetContractClassLogs(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getContractClassLogs']['params'],
): Promise<AztecWalletMethodMap['aztec_getContractClassLogs']['result']> {
  return await wallet.getContractClassLogs(params.filter);
}

async function handleGetPrivateEvents(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
): Promise<AztecWalletMethodMap['aztec_getPrivateEvents']['result']> {
  const { event, from, limit, vpks } = params;
  return await wallet.getPrivateEvents(event, from, limit, vpks);
}

async function handleGetPublicEvents(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getPublicEvents']['params'],
): Promise<AztecWalletMethodMap['aztec_getPublicEvents']['result']> {
  const { event, from, limit } = params;
  return await wallet.getPublicEvents(event, from, limit);
}

async function handleL1ToL2MembershipWitness(
  wallet: AccountWallet,
  params: AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['params'],
): Promise<AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['result']> {
  const { contractAddress, messageHash, secret } = params;
  return await wallet.getL1ToL2MembershipWitness(contractAddress, messageHash, secret);
}

export async function aztecWalletHandler<M extends keyof AztecWalletMethodMap>(
  context: AztecWalletContext,
  method: M,
  params: AztecWalletMethodMap[M]['params'],
): Promise<AztecWalletMethodMap[M]['result']> {
  switch (method) {
    // Chain methods
    case 'aztec_getBlock':
      return handleGetBlock(context.wallet, params as AztecWalletMethodMap['aztec_getBlock']['params']);
    case 'aztec_getBlockNumber':
      return handleGetBlockNumber(context.wallet);
    case 'aztec_getChainId':
      return handleGetChainId(context.wallet);
    case 'aztec_getVersion':
      return handleGetVersion(context.wallet);
    case 'aztec_getNodeInfo':
      return handleGetNodeInfo(context.wallet);
    case 'aztec_getCurrentBaseFees':
      return handleGetCurrentBaseFees(context.wallet);

    // Scopes methods
    case 'aztec_setScopes':
      return handleSetScopes(context.wallet, params as AztecWalletMethodMap['aztec_setScopes']['params']);
    case 'aztec_getScopes':
      return handleGetScopes(context.wallet);

    // L1->L2 Messages methods
    case 'aztec_isL1ToL2MessageSynced':
      return handleL1ToL2MessageSynced(
        context.wallet,
        params as AztecWalletMethodMap['aztec_isL1ToL2MessageSynced']['params'],
      );
    case 'aztec_getL1ToL2MembershipWitness':
      return handleL1ToL2MembershipWitness(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['params'],
      );

    // Capsules methods
    case 'aztec_addCapsule':
      return handleAddCapsule(context.wallet, params as AztecWalletMethodMap['aztec_addCapsule']['params']);

    // Accounts methods
    case 'aztec_getAddress':
      return handleGetAddress(context.wallet);
    case 'aztec_getCompleteAddress':
      return handleGetCompleteAddress(context.wallet);
    case 'aztec_registerAccount':
      return handleRegisterAccount(
        context.wallet,
        params as AztecWalletMethodMap['aztec_registerAccount']['params'],
      );
    case 'aztec_getRegisteredAccounts':
      return handleGetRegisteredAccounts(context.wallet);

    // AuthWitness methods
    case 'aztec_addAuthWitness':
      return handleAddAuthWitness(
        context.wallet,
        params as AztecWalletMethodMap['aztec_addAuthWitness']['params'],
      );
    case 'aztec_getAuthWitness':
      return handleGetAuthWitness(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getAuthWitness']['params'],
      );
    case 'aztec_createAuthWit':
      return handleCreateAuthWit(
        context.wallet,
        params as AztecWalletMethodMap['aztec_createAuthWit']['params'],
      );

    // Senders methods
    case 'aztec_registerSender':
      return handleRegisterSender(
        context.wallet,
        params as AztecWalletMethodMap['aztec_registerSender']['params'],
      );
    case 'aztec_getSenders':
      return handleGetSenders(context.wallet);
    case 'aztec_removeSender':
      return handleRemoveSender(
        context.wallet,
        params as AztecWalletMethodMap['aztec_removeSender']['params'],
      );

    // Contracts methods
    case 'aztec_getContracts':
      return handleGetContracts(context.wallet);
    case 'aztec_getContractInstance':
      return handleGetContractInstance(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getContractInstance']['params'],
      );
    case 'aztec_getContractClass':
      return handleGetContractClass(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getContractClass']['params'],
      );
    case 'aztec_getContractArtifact':
      return handleGetContractArtifact(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getContractArtifact']['params'],
      );
    case 'aztec_isContractClassPubliclyRegistered':
      return handleIsContractClassPubliclyRegistered(
        context.wallet,
        params as AztecWalletMethodMap['aztec_isContractClassPubliclyRegistered']['params'],
      );
    case 'aztec_isContractPubliclyDeployed':
      return handleIsContractPubliclyDeployed(
        context.wallet,
        params as AztecWalletMethodMap['aztec_isContractPubliclyDeployed']['params'],
      );
    case 'aztec_isContractInitialized':
      return handleIsContractInitialized(
        context.wallet,
        params as AztecWalletMethodMap['aztec_isContractInitialized']['params'],
      );
    case 'aztec_registerContract':
      return handleRegisterContract(
        context.wallet,
        params as AztecWalletMethodMap['aztec_registerContract']['params'],
      );
    case 'aztec_registerContractClass':
      return handleRegisterContractClass(
        context.wallet,
        params as AztecWalletMethodMap['aztec_registerContractClass']['params'],
      );
    case 'aztec_getPublicStorageAt':
      return handleGetPublicStorageAt(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getPublicStorageAt']['params'],
      );

    // Transactions methods
    case 'aztec_createTxExecutionRequest':
      return handleCreateTxExecutionRequest(
        context.wallet,
        params as AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
      );
    case 'aztec_proveTx':
      return handleProveTx(context.wallet, params as AztecWalletMethodMap['aztec_proveTx']['params']);
    case 'aztec_sendTx':
      return handleSendTx(context.wallet, params as AztecWalletMethodMap['aztec_sendTx']['params']);
    case 'aztec_getTxEffect':
      return handleGetTxEffect(context.wallet, params as AztecWalletMethodMap['aztec_getTxEffect']['params']);
    case 'aztec_getTxReceipt':
      return handleGetTxReceipt(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getTxReceipt']['params'],
      );
    case 'aztec_simulateTx':
      return handleSimulateTx(context.wallet, params as AztecWalletMethodMap['aztec_simulateTx']['params']);
    case 'aztec_simulateUnconstrained':
      return handleSimulateUnconstrained(
        context.wallet,
        params as AztecWalletMethodMap['aztec_simulateUnconstrained']['params'],
      );

    // Notes methods
    case 'aztec_getNotes':
      return handleGetNotes(context.wallet, params as AztecWalletMethodMap['aztec_getNotes']['params']);
    case 'aztec_addNote':
      return handleAddNote(context.wallet, params as AztecWalletMethodMap['aztec_addNote']['params']);
    case 'aztec_addNullifiedNote':
      return handleAddNullifiedNote(
        context.wallet,
        params as AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
      );

    // Logs and Events methods
    case 'aztec_getPublicLogs':
      return handleGetPublicLogs(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getPublicLogs']['params'],
      );
    case 'aztec_getContractClassLogs':
      return handleGetContractClassLogs(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getContractClassLogs']['params'],
      );
    case 'aztec_getPrivateEvents':
      return handleGetPrivateEvents(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
      );
    case 'aztec_getPublicEvents':
      return handleGetPublicEvents(
        context.wallet,
        params as AztecWalletMethodMap['aztec_getPublicEvents']['params'],
      );
    default:
      throw new AztecWalletError('invalidRequest', `Method not supported: ${String(method)}`);
  }
}

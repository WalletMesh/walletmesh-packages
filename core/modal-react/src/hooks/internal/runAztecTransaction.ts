import { ErrorFactory } from '@walletmesh/modal-core';
import {
  executeTx as executeAztecTx,
  type AztecDappWallet,
  type ContractFunctionInteraction,
  type TxReceipt,
} from '@walletmesh/modal-core/providers/aztec/lazy';
import type { AztecSendOptions } from '@walletmesh/modal-core/providers/aztec';

type ProgressTimer = ReturnType<typeof setInterval> | undefined;

export interface TransactionRunnerOptions {
  onSent?: (hash: string) => void;
  onProvingProgress?: (progress: number) => void;
  sendOptions?: AztecSendOptions;
}

export interface TransactionRunnerResult {
  hash: string;
  receipt: TxReceipt;
  status: string;
}

function simulateProgress(cb: ((progress: number) => void) | undefined): ProgressTimer {
  if (!cb) {
    return undefined;
  }
  cb(0);
  let progress = 0;
  const timer = setInterval(() => {
    progress = progress >= 90 ? 90 : progress + 10;
    cb(progress);
    if (progress >= 90) {
      clearInterval(timer);
    }
  }, 500);
  return timer;
}

export async function runAztecTransaction(
  wallet: AztecDappWallet,
  interaction: ContractFunctionInteraction,
  options: TransactionRunnerOptions = {},
): Promise<TransactionRunnerResult> {
  const { onSent, onProvingProgress, sendOptions } = options;
  const progressTimer = simulateProgress(onProvingProgress);

  try {
    const sentTx = await executeAztecTx(wallet, interaction, sendOptions);
    const txHash = sentTx.txHash;

    if (onSent) {
      onSent(txHash);
    }

    onProvingProgress?.(100);
    if (progressTimer) {
      clearInterval(progressTimer);
    }

    const receipt = (await sentTx.wait()) as TxReceipt;

    if (receipt.error) {
      throw ErrorFactory.transactionFailed(`Transaction failed: ${receipt.error}`);
    }

    const status = receipt.status ?? 'SUCCESS';
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
    if (normalizedStatus === '0' || normalizedStatus === '0X0' || normalizedStatus === 'FAILED') {
      throw ErrorFactory.transactionFailed(`Transaction failed with status: ${status}`);
    }

    return {
      hash: txHash,
      receipt,
      status,
    };
  } catch (error) {
    throw error instanceof Error ? error : ErrorFactory.transactionFailed('Transaction failed');
  } finally {
    if (progressTimer) {
      clearInterval(progressTimer);
    }
  }
}

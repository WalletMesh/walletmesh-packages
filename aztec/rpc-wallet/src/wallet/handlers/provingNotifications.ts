import { createLogger } from '@aztec/foundation/log';
import type { AztecProvingStatusNotification } from '../../types.js';
import type { AztecHandlerContext } from './index.js';

const logger = createLogger('aztec-rpc-wallet:proving-notifications');

type ProvingStatusPayload = Omit<AztecProvingStatusNotification, 'timestamp'> & {
  timestamp?: number;
};

/**
 * Generate a unique identifier for a proving lifecycle using Web Crypto where available.
 */
export function generateProvingId(): string {
  try {
    const globalObj = globalThis as typeof globalThis & {
      crypto?: { randomUUID?: () => string };
    };
    const cryptoObj = globalObj?.crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      return cryptoObj.randomUUID();
    }
  } catch {
    // ignore and fall back to random string
  }
  // Fallback: timestamp + random suffix
  return `proving-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Helper to emit aztec_provingStatus notifications while gracefully handling transport errors.
 */
export async function notifyProvingStatus(
  ctx: AztecHandlerContext,
  payload: ProvingStatusPayload,
): Promise<void> {
  if (typeof ctx.notify !== 'function') {
    return;
  }

  const resolvedTimestamp = payload.timestamp ?? Date.now();

  try {
    await ctx.notify('aztec_provingStatus', {
      ...payload,
      timestamp: resolvedTimestamp,
    });
  } catch (error) {
    logger.warn('Failed to emit aztec_provingStatus notification', {
      error: error instanceof Error ? error.message : error,
      status: payload.status,
    });
  }
}

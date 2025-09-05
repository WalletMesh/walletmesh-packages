import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap, AztecHandlerContext } from '@walletmesh/aztec-rpc-wallet';
import type { FunctionArgNames } from './functionArgNamesMiddleware';

export type RequestStatus = 'processing' | 'approved' | 'denied' | 'success' | 'error';

export type HistoryEntry = {
  method: string;
  params: unknown;
  origin: string;
  time: string;
  status?: RequestStatus;
  functionArgNames?: FunctionArgNames;
  id?: number;
  // New fields for enhanced tracking
  requestTimestamp: number;
  responseTimestamp?: number;
  duration?: number;
  approvalStatus?: 'approved' | 'denied';
  processingStatus?: 'processing' | 'success' | 'error';
  // New field for error information
  error?: {
    message: string;
    stack?: string;
    details?: unknown;
  };
};

/**
 * Gets the origin of the dApp that opened this wallet window.
 * Prioritizes document.referrer since it works reliably in cross-origin scenarios.
 */
function getDappOrigin(): string | undefined {
  // Method 1: Use document.referrer (most reliable for cross-origin scenarios)
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      console.log('History middleware: Detected dApp origin from document.referrer:', referrerUrl.origin);
      return referrerUrl.origin;
    } catch (e) {
      console.warn('History middleware: Failed to parse document.referrer:', e);
    }
  }

  // Method 2: Try to access window.opener.location.origin (only for same-origin scenarios)
  if (typeof window !== 'undefined' && window.opener) {
    try {
      const origin = window.opener.location.origin;
      console.log('History middleware: Successfully detected dApp origin from window.opener:', origin);
      return origin;
    } catch (e) {
      // CORS error - this is expected in cross-origin scenarios
      console.log('History middleware: Cross-origin context detected, window.opener access blocked by CORS');
    }
  }

  // Method 3: Try to access window.parent.location.origin (for iframe scenarios)
  if (typeof window !== 'undefined' && window.parent !== window) {
    try {
      const origin = window.parent.location.origin;
      console.log('History middleware: Detected dApp origin from window.parent:', origin);
      return origin;
    } catch (e) {
      // CORS error - this is expected in cross-origin scenarios
      console.log('History middleware: Cross-origin context detected, window.parent access blocked by CORS');
    }
  }

  console.warn('History middleware: Could not detect dApp origin from any method');
  return undefined;
}

export const createHistoryMiddleware = (
  onHistoryUpdate: (history: HistoryEntry[]) => void,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & { functionCallArgNames?: FunctionArgNames }
> => {
  // Maintain history internally
  let history: HistoryEntry[] = [];

  return async (context, req, next) => {
    const timestamp = new Date().toLocaleString();
    const requestTimestamp = Date.now();

    // Get the dApp origin using the same logic as the origin middleware
    let origin = getDappOrigin();

    // If we still don't have an origin, fall back to current window origin
    if (!origin && typeof window !== 'undefined') {
      origin = window.location.origin;
    }

    // Always set an origin, use 'unknown' as final fallback
    const detectedOrigin = origin || 'unknown';

    const entry: HistoryEntry = {
      method: String(req.method),
      params: req.params,
      origin: detectedOrigin,
      time: timestamp,
      functionArgNames: context.functionCallArgNames,
      requestTimestamp,
      status: 'processing',
      processingStatus: 'processing',
    };

    // Add new entry with processing status
    const newHistoryId = Date.now(); // Use timestamp as unique identifier
    history = [...history, { ...entry, id: newHistoryId }];
    onHistoryUpdate(history);

    try {
      const result = await next();
      const responseTimestamp = Date.now();
      const duration = responseTimestamp - requestTimestamp;

      // Update with success status
      history = history.map((item) =>
        item.id === newHistoryId
          ? {
              ...item,
              status: 'success',
              approvalStatus: 'approved',
              processingStatus: 'success',
              responseTimestamp,
              duration
            }
          : item
      );
      onHistoryUpdate(history);
      return result;
    } catch (error) {
      const responseTimestamp = Date.now();
      const duration = responseTimestamp - requestTimestamp;

      // Extract error information
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        details: error
      };

      // Update with error status - but don't change approval status to 'denied'
      // The approval status should remain as it was (approved if user approved it)
      history = history.map((item) =>
        item.id === newHistoryId
          ? {
              ...item,
              status: 'error',
              // Keep the existing approval status - don't override it
              processingStatus: 'error',
              responseTimestamp,
              duration,
              error: errorInfo
            }
          : item
      );
      onHistoryUpdate(history);
      throw error;
    }
  };
};

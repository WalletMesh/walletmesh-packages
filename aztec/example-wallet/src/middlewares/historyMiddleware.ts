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
};

/**
 * Gets the origin of the dApp that opened this wallet window.
 * Uses the same logic as the origin middleware since they run in different chains.
 */
function getDappOrigin(): string | undefined {
  // Method 1: Try to access window.opener.location.origin (should work with proper CORS headers)
  if (typeof window !== 'undefined' && window.opener) {
    try {
      const origin = window.opener.location.origin;
      console.log('History middleware: Successfully detected dApp origin from window.opener:', origin);
      return origin;
    } catch (e) {
      console.warn('History middleware: Could not access window.opener.location.origin due to CORS:', e);
    }
  }

  // Method 2: Use document.referrer (fallback for popup windows)
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      console.log('History middleware: Detected dApp origin from document.referrer:', referrerUrl.origin);
      return referrerUrl.origin;
    } catch (e) {
      console.warn('History middleware: Failed to parse document.referrer:', e);
    }
  }

  // Method 3: Try to access window.parent.location.origin (for iframe scenarios)
  if (typeof window !== 'undefined' && window.parent !== window) {
    try {
      const origin = window.parent.location.origin;
      console.log('History middleware: Detected dApp origin from window.parent:', origin);
      return origin;
    } catch (e) {
      console.warn('History middleware: Could not access window.parent.location.origin due to CORS:', e);
    }
  }

  console.warn('History middleware: Could not detect dApp origin from any method');
  return undefined;
}

export const createHistoryMiddleware = (
  setRequestHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>,
): JSONRPCMiddleware<
  AztecWalletMethodMap,
  AztecHandlerContext & { functionCallArgNames?: FunctionArgNames }
> => {
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
    setRequestHistory((prev) => [...prev, { ...entry, id: newHistoryId }]);

    try {
      const result = await next();
      const responseTimestamp = Date.now();
      const duration = responseTimestamp - requestTimestamp;

      // Update with success status
      setRequestHistory((prev) =>
        prev.map((item) =>
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
        ),
      );
      return result;
    } catch (error) {
      const responseTimestamp = Date.now();
      const duration = responseTimestamp - requestTimestamp;

      // Update with error status
      setRequestHistory((prev) =>
        prev.map((item) =>
          item.id === newHistoryId
            ? {
                ...item,
                status: 'error',
                approvalStatus: 'denied',
                processingStatus: 'error',
                responseTimestamp,
                duration
              }
            : item
        ),
      );
      throw error;
    }
  };
};

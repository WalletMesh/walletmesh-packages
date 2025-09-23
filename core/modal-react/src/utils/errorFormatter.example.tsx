/**
 * Example usage of the error formatter utility
 *
 * This demonstrates how to properly format errors for display in the UI
 */

import { ErrorFactory, formatError, getRecoveryMessage } from '@walletmesh/modal-core';

// Example 1: Handling a ModalError from ErrorFactory
export function handleWalletTimeout() {
  const error = ErrorFactory.connectorError(
    'aztec-wallet',
    'The wallet service is not responding',
    'WALLET_TIMEOUT',
    {
      recoveryHint: 'retry',
      data: {
        walletUrl: 'https://wallet.example.com',
        timeout: 30000,
      },
    },
  );

  const formatted = formatError(error);
  console.log('Formatted error:', {
    message: formatted.message, // "The wallet service is not responding"
    code: formatted.code, // "WALLET_TIMEOUT"
    recoveryHint: formatted.recoveryHint, // "retry"
    errorType: formatted.errorType, // ErrorType.ModalError
  });

  // Get user-friendly recovery message
  const recoveryMessage = getRecoveryMessage(formatted.recoveryHint);
  console.log('Recovery message:', recoveryMessage);
  // "Please check your internet connection and try again."
}

// Example 2: Handling a standard JavaScript Error
export function handleJavaScriptError() {
  try {
    throw new Error('Network request failed');
  } catch (error) {
    const formatted = formatError(error);
    console.log('Formatted:', formatted);
    // { message: "Network request failed", errorType: ErrorType.JavaScriptError }
  }
}

// Example 3: Handling unknown error objects
export function handleUnknownError() {
  // This might come from a third-party library or API
  const unknownError = {
    error: {
      message: 'Invalid parameters',
      code: 'INVALID_PARAMS',
    },
    details: 'Missing required field: address',
  };

  const formatted = formatError(unknownError);
  console.log('Formatted:', formatted);
  // {
  //   message: "Invalid parameters",
  //   code: "INVALID_PARAMS",
  //   errorType: ErrorType.UnknownObject
  // }
}

// Example 4: Using in a React component
export function ErrorDisplay({ error }: { error: unknown }) {
  if (!error) return null;

  const formatted = formatError(error);
  const recoveryMessage = getRecoveryMessage(formatted.recoveryHint);

  return (
    <div className="error-container">
      <h3>Connection Failed</h3>
      <p className="error-message">{formatted.message}</p>

      {formatted.code && <p className="error-code">Error code: {formatted.code}</p>}

      {recoveryMessage && <p className="recovery-hint">💡 {recoveryMessage}</p>}

      {/* Show retry button for retryable errors */}
      {formatted.recoveryHint === 'retry' && (
        <button type="button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      )}
    </div>
  );
}

// Example 5: Handling the dreaded [object Object]
export function handleBadlyFormattedError() {
  // Sometimes errors get stringified badly
  const badError = {
    someProperty: 'value',
    nested: { data: 'more data' },
  };

  // If this gets converted to string, it becomes "[object Object]"
  console.log(String(badError)); // "[object Object]"

  // Our formatter handles this gracefully
  const formatted = formatError(badError);
  console.log('Formatted:', formatted);
  // {
  //   message: 'Error details: {"someProperty":"value","nested":{"data":"more data"}}',
  //   errorType: ErrorType.UnknownObject
  // }
}

// Example 6: Type detection
export function demonstrateTypeDetection() {
  const errors = [
    ErrorFactory.connectionFailed('Connection refused'), // ModalError
    new Error('Standard error'), // JavaScriptError
    'Simple string error', // StringError
    { message: 'Object with message' }, // UnknownObject
    null, // Unknown
    undefined, // Unknown
  ];

  errors.forEach((error, index) => {
    const formatted = formatError(error);
    console.log(`Error ${index + 1} type:`, formatted.errorType);
  });
}

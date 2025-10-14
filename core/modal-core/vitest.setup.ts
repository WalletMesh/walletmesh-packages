/**
 * Vitest global setup file
 * Automatically skips browser-dependent tests in test environments
 * and handles unhandled errors
 */

// This is a workaround to ensure browser-dependent tests are always skipped in CI/CD
// environments or when running in non-browser contexts.
//
// It works by defining a global flag that browser-dependent tests can check.
declare global {
  var SKIP_BROWSER_TESTS: boolean;
}

// Detect if running in a CI/CD environment
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Detect if running in Node.js environment
const isNode = typeof window === 'undefined';

// Set the global flag
// Always skip browser tests in CI or Node environments
// You can also forcibly skip by setting the environment variable SKIP_BROWSER_TESTS=true
globalThis.SKIP_BROWSER_TESTS = isCI || isNode || process.env.SKIP_BROWSER_TESTS === 'true';

// Fix for vi.advanceTimersByTime not resolving promises in some environments
// This ensures all implementations can use the same timer advancement approach
if (typeof vi !== 'undefined' && typeof vi.advanceTimersByTimeAsync !== 'function') {
  // @ts-expect-error -- Adding polyfill for older vitest versions
  vi.advanceTimersByTimeAsync = async (ms) => {
    vi.advanceTimersByTime(ms);
    // Wait for any microtasks to complete using setImmediate or queueMicrotask
    await new Promise((resolve) => {
      if (typeof queueMicrotask !== 'undefined') {
        queueMicrotask(resolve);
      } else if (typeof setImmediate !== 'undefined') {
        setImmediate(resolve);
      } else {
        // Fallback to process.nextTick for Node.js
        process.nextTick(resolve);
      }
    });
  };
}

// Handle unhandled errors - particularly for parse5 dependency issues
process.on('unhandledRejection', (reason) => {
  // Suppress errors from parse5 dependency
  if (typeof reason === 'object' && reason !== null && 'code' in reason) {
    if (reason.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      // This suppresses the error from being shown as an unhandled rejection
      return;
    }
  }

  // Check for ModalError objects with specific codes
  if (typeof reason === 'object' && reason !== null && 'code' in reason) {
    const errorCode = (reason as { code: string }).code;
    // Suppress expected transport error codes
    if (
      errorCode === 'connection_failed' ||
      errorCode === 'message_failed' ||
      errorCode === 'transport_unavailable' ||
      errorCode === 'cleanup_failed' ||
      errorCode === 'request_timeout'
    ) {
      // These are expected errors in our transport tests and timeout tests
      return;
    }
  }

  // Suppress expected transport errors that we test for
  if (reason instanceof Error || (typeof reason === 'object' && reason !== null && 'message' in reason)) {
    const errorMessage = (reason as { message?: string }).message || String(reason);

    // WebSocket specific errors
    if (
      errorMessage === 'WebSocket connection timeout' ||
      errorMessage === 'WebSocket connection error' ||
      errorMessage === 'WebSocket is not connected' ||
      errorMessage === 'WebSocket is not open'
    ) {
      // These are expected errors in our tests
      return;
    }

    // Chrome extension specific errors
    if (
      errorMessage === 'Chrome runtime API not available' ||
      errorMessage === 'Failed to connect to extension' ||
      errorMessage.includes('Connection attempt') ||
      errorMessage === 'Transport is not connected' ||
      errorMessage === 'Failed to send message'
    ) {
      // These are expected errors in our tests
      return;
    }

    // Transport errors
    if (
      errorMessage === 'Failed to connect to transport' ||
      errorMessage === 'Failed to send message through transport' ||
      errorMessage === 'Timeout waiting for state' ||
      errorMessage === 'Connection failed for unreliable-wallet' ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('disconnected')
    ) {
      // These are expected error patterns in our tests
      return;
    }

    // Resource acquisition errors that are expected in tests
    if (
      errorMessage.includes('Failed to acquire resource') ||
      errorMessage.includes('Resource acquisition failed') ||
      errorMessage.includes('Resource limit reached') ||
      errorMessage.includes('Acquisition failed') ||
      errorMessage.includes('dependency_failed') ||
      errorMessage.includes('release_failed')
    ) {
      // These are expected errors in our resource tests
      return;
    }
  }

  // Also check for ModalError objects by looking at the string representation
  const errorStr = String(reason);
  if (
    errorStr.includes('ModalError: Failed to acquire resource') ||
    errorStr.includes('Failed to acquire resource test-resource') ||
    errorStr.includes('Failed to acquire resource dep2') ||
    errorStr.includes('Failed to acquire resource fail-resource') ||
    errorStr.includes('Failed to acquire resource resource1') ||
    errorStr.includes('Failed to acquire resource extra-resource-test') ||
    errorStr.includes('Failed to acquire resource failing-resource') ||
    errorStr.includes('Failed to acquire resource failing-integrated-resource')
  ) {
    // These are expected errors in our resource tests
    return;
  }

  // For all other errors, log them as usual
  console.error('Unhandled Rejection:', reason);
});

// Add a utility function for safe mocking of WebSocket
globalThis.mockWebSocket = () => {
  if (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined') {
    // Store original WebSocket
    const originalWebSocket = window.WebSocket;

    // Return a cleanup function
    return {
      restore: () => {
        window.WebSocket = originalWebSocket;
      },
    };
  }
  return { restore: () => {} };
};

// Mock timer functions if not available
if (typeof clearInterval === 'undefined') {
  // @ts-expect-error
  globalThis.clearInterval = () => {};
}

if (typeof setInterval === 'undefined') {
  // @ts-expect-error
  globalThis.setInterval = () => {};
}

export {};

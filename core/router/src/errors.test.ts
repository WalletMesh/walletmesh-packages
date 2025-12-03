import { JSONRPCError } from '@walletmesh/jsonrpc';
import { describe, expect, it } from 'vitest';
import { RouterError, RouterErrorMap } from './errors.js';

describe('RouterErrorMap', () => {
  it('should contain all error codes and messages', () => {
    expect(RouterErrorMap).toEqual({
      unknownChain: { code: -32000, message: 'Unknown chain ID' },
      invalidSession: { code: -32001, message: 'Invalid or expired session' },
      insufficientPermissions: { code: -32002, message: 'Insufficient permissions for method' },
      methodNotSupported: { code: -32003, message: 'Method not supported by chain' },
      walletNotAvailable: { code: -32004, message: 'Wallet service not available' },
      partialFailure: { code: -32005, message: 'Partial failure' },
      invalidRequest: { code: -32006, message: 'Invalid request parameters' },
      walletError: { code: -32007, message: 'Wallet returned an error' },
      duplicateRequestId: { code: -32008, message: 'Duplicate request ID - approval already pending' },
      unknownError: { code: -32603, message: 'Internal error' },
    });
  });
});

describe('RouterError', () => {
  it('should create error with correct properties', () => {
    const error = new RouterError('unknownChain');
    expect(error.code).toBe(-32000);
    expect(error.message).toBe('Unknown chain ID');
    expect(error.name).toBe('RouterError');
  });

  it('should include additional data when provided', () => {
    const error = new RouterError('invalidSession', { details: 'test' });
    expect(error.data).toEqual({ details: 'test' });
  });

  it('should inherit from JSONRPCError', () => {
    const error = new RouterError('unknownChain');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(JSONRPCError);
  });
});

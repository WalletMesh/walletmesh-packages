import type { JSONRPCRequest, JSONRPCResponse } from '@walletmesh/jsonrpc';
import { describe, expect, it, vi } from 'vitest';
import { RouterError } from './errors.js';
import { createPermissionsMiddleware, createSessionMiddleware } from './middleware.js';
import type { SessionStore } from './session-store.js';
import type { RouterContext, RouterMethodMap } from './types.js';

type RouterRequest = JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>;
type RouterResponse = JSONRPCResponse<RouterMethodMap, keyof RouterMethodMap>;

describe('createSessionMiddleware', () => {
  const mockSessionStore = {
    validateAndRefresh: vi.fn(),
    getAll: vi.fn().mockResolvedValue(new Map()),
  } as unknown as SessionStore;

  const mockNext = vi.fn(() => Promise.resolve({ jsonrpc: '2.0' as const, result: null } as RouterResponse));

  it('should use "unknown" as default origin if not provided', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = {} as RouterContext;

    const mockSession = { id: '123', origin: 'unknown' };
    mockSessionStore.validateAndRefresh = vi.fn().mockResolvedValue(mockSession);
    mockSessionStore.getAll = vi.fn().mockResolvedValue(new Map([['123', mockSession]]));

    await middleware(context, request, mockNext);
    expect(mockSessionStore.validateAndRefresh).toHaveBeenCalledWith('123');
  });

  it('should allow new session without sessionId for wm_connect', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_connect',
      params: { permissions: {} },
    } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await middleware(context, request, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle request with null params', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_connect',
      params: null,
    } as unknown as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await middleware(context, request, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle request with undefined params', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = { jsonrpc: '2.0' as const, method: 'wm_connect' } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await middleware(context, request, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw error if sessionId provided for wm_connect', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_connect',
      params: { permissions: {}, sessionId: '123' },
    } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(
      new RouterError('invalidRequest', 'Session ID provided for connect method'),
    );
  });

  it('should require sessionId for wm_reconnect', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_reconnect',
      params: { sessionId: '' },
    } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(
      new RouterError('invalidRequest', 'No session ID provided for reconnect method'),
    );
  });

  it('should validate and refresh existing session', async () => {
    const mockSession = { id: '123', permissions: {}, origin: 'test' };
    mockSessionStore.validateAndRefresh = vi.fn().mockResolvedValue(mockSession);

    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = { origin: 'test', session: mockSession } as RouterContext;

    await middleware(context, request, mockNext);
    expect(mockSessionStore.validateAndRefresh).toHaveBeenCalledWith('123');
    expect(context.session).toEqual(mockSession);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw error when no sessionId provided for regular methods', async () => {
    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(
      new RouterError('invalidRequest', 'No session ID provided'),
    );
  });

  it('should throw error for invalid session', async () => {
    mockSessionStore.validateAndRefresh = vi.fn().mockResolvedValue(null);

    const middleware = createSessionMiddleware(mockSessionStore);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = { origin: 'test' } as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(new RouterError('invalidSession'));
  });
});

describe('createPermissionsMiddleware', () => {
  const mockPermissionCallback = vi.fn();
  const mockNext = vi.fn(() => Promise.resolve({ jsonrpc: '2.0' as const, result: null } as RouterResponse));

  it('should allow request with permission', async () => {
    mockPermissionCallback.mockResolvedValue(true);
    const middleware = createPermissionsMiddleware(mockPermissionCallback);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = {} as RouterContext;

    await middleware(context, request, mockNext);
    expect(mockPermissionCallback).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw error for insufficient permissions', async () => {
    mockPermissionCallback.mockResolvedValue(false);
    const middleware = createPermissionsMiddleware(mockPermissionCallback);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = {} as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(
      new RouterError('insufficientPermissions'),
    );
  });

  it('should handle permission callback errors', async () => {
    mockPermissionCallback.mockRejectedValue(new Error('test error'));
    const middleware = createPermissionsMiddleware(mockPermissionCallback);
    const request = {
      jsonrpc: '2.0' as const,
      method: 'wm_call',
      params: { chainId: 'test', sessionId: '123', call: { method: 'test_method' } },
    } as RouterRequest;
    const context = {} as RouterContext;

    await expect(middleware(context, request, mockNext)).rejects.toThrow(
      new RouterError('insufficientPermissions', 'test error'),
    );
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemorySessionStore, LocalStorageSessionStore } from './session-store.js';
import type { SessionData } from './types.js';

const mockSession: SessionData = {
  id: 'test-session',
  origin: 'test-origin',
  permissions: {
    'test-chain': ['test_method'],
  },
};

describe('MemorySessionStore', () => {
  let store: MemorySessionStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemorySessionStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve sessions', async () => {
    await store.set('test-id', mockSession);
    const retrieved = await store.get('test-id');
    expect(retrieved).toEqual(mockSession);
  });

  it('should return undefined for non-existent sessions', async () => {
    const retrieved = await store.get('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should delete sessions', async () => {
    await store.set('test-id', mockSession);
    await store.delete('test-id');
    const retrieved = await store.get('test-id');
    expect(retrieved).toBeUndefined();
  });

  it('should clear all sessions', async () => {
    await store.set('test-id-1', mockSession);
    await store.set('test-id-2', { ...mockSession, id: 'test-id-2' });
    await store.clear();
    expect(await store.get('test-id-1')).toBeUndefined();
    expect(await store.get('test-id-2')).toBeUndefined();
  });

  it('should handle session expiry', async () => {
    const store = new MemorySessionStore({ lifetime: 1000 }); // 1 second lifetime
    await store.set('test-id', mockSession);

    // Session should be valid initially
    let session = await store.validateAndRefresh('test-id');
    expect(session).toEqual(mockSession);

    // Manually advance time past expiry
    vi.advanceTimersByTime(1100); // 1.1 seconds

    // Session should be expired and removed
    session = await store.validateAndRefresh('test-id');
    expect(session).toBeUndefined();
    expect(await store.get('test-id')).toBeUndefined();
  });

  it('should refresh session expiry when configured', async () => {
    const store = new MemorySessionStore({
      lifetime: 1000,
      refreshOnAccess: true,
    });
    await store.set('test-id', mockSession);

    // Advance time close to expiry
    vi.advanceTimersByTime(900); // 0.9 seconds

    // Access should refresh expiry
    const session = await store.validateAndRefresh('test-id');
    expect(session).toEqual(mockSession);

    // Session should still be valid after original expiry
    vi.advanceTimersByTime(200); // 1.1 seconds total
    const refreshedSession = await store.validateAndRefresh('test-id');
    expect(refreshedSession).toEqual(mockSession);
  });

  it('should get all valid sessions', async () => {
    const store = new MemorySessionStore({ lifetime: 1000 });
    const now = Date.now();

    // Mock Date.now() to control time for each session
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now) // session1
      .mockReturnValueOnce(now) // session2
      .mockReturnValueOnce(now) // session4
      .mockReturnValueOnce(now - 500) // session3 (will expire)
      .mockReturnValue(now + 600); // time when getAll is called

    await store.set('session1', mockSession);
    await store.set('session2', { ...mockSession, id: 'test-session-2' });
    await store.set('session4', { ...mockSession, id: 'test-session-4' });
    await store.set('session3', { ...mockSession, id: 'test-session-3' });

    const allSessions = await store.getAll();
    expect(allSessions.size).toBe(3); // Should only include non-expired sessions
    expect(allSessions.get('session1')).toEqual(mockSession);
    expect(allSessions.get('session2')).toEqual({ ...mockSession, id: 'test-session-2' });
    expect(allSessions.get('session4')).toEqual({ ...mockSession, id: 'test-session-4' });
    expect(allSessions.get('session3')).toBeUndefined();
  });

  it('should refresh expiry when getting all sessions if configured', async () => {
    const store = new MemorySessionStore({
      lifetime: 1000,
      refreshOnAccess: true,
    });
    await store.set('session1', mockSession);

    // Advance time close to expiry
    vi.advanceTimersByTime(900);

    // GetAll should refresh expiry
    await store.getAll();

    // Session should still be valid after original expiry
    vi.advanceTimersByTime(200);
    const session = await store.get('session1');
    expect(session).toEqual(mockSession);
  });

  it('should clean expired sessions', async () => {
    const store = new MemorySessionStore({ lifetime: 1000 });
    await store.set('session1', mockSession);
    await store.set('session2', { ...mockSession, id: 'test-session-2' });
    await store.set('session3', { ...mockSession, id: 'test-session-3' });

    // Advance time to expire some sessions
    vi.advanceTimersByTime(1100); // 1.1 seconds

    // Add a new session that shouldn't expire
    await store.set('session4', { ...mockSession, id: 'test-session-4' });

    const removed = await store.cleanExpired();
    expect(removed).toBe(3); // First 3 sessions should be expired
    expect(await store.get('session4')).toBeDefined(); // New session should remain
  });
});

describe('LocalStorageSessionStore', () => {
  let store: LocalStorageSessionStore;
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    store = new LocalStorageSessionStore();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.key.mockClear();
  });

  it('should store sessions in localStorage', async () => {
    await store.set('test-id', mockSession);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'wm_session_test-id',
      expect.stringContaining('"data":'),
    );
    expect(mockLocalStorage.setItem.mock.calls.length).toBe(1);
    const storedData = JSON.parse((mockLocalStorage.setItem.mock.calls[0] as [string, string])[1]);
    expect(storedData.data).toEqual(mockSession);
  });

  it('should retrieve sessions from localStorage', async () => {
    const storedSession = { data: mockSession, expiresAt: undefined };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));
    const retrieved = await store.get('test-id');
    expect(retrieved).toEqual(mockSession);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('wm_session_test-id');
  });

  it('should handle session expiry in validateAndRefresh', async () => {
    const now = Date.now();
    const storedSession = {
      data: mockSession,
      expiresAt: now - 1000, // Expired 1 second ago
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));

    const retrieved = await store.validateAndRefresh('test-id');
    expect(retrieved).toBeUndefined();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_test-id');
  });

  it('should refresh session expiry when configured', async () => {
    const store = new LocalStorageSessionStore({
      lifetime: 1000,
      refreshOnAccess: true,
    });

    const now = Date.now();
    const storedSession = {
      data: mockSession,
      expiresAt: now + 500, // Expires in 500ms
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));

    const retrieved = await store.validateAndRefresh('test-id');
    expect(retrieved).toEqual(mockSession);

    // Should have updated expiry
    expect(mockLocalStorage.setItem.mock.calls.length).toBe(1);
    const updatedSession = JSON.parse((mockLocalStorage.setItem.mock.calls[0] as [string, string])[1]);
    expect(updatedSession.expiresAt).toBeGreaterThan(now + 900); // Close to now + 1000
  });

  it('should get all valid sessions from localStorage', async () => {
    const now = Date.now();
    mockLocalStorage.length = 4;
    mockLocalStorage.key
      .mockReturnValueOnce('wm_session_1')
      .mockReturnValueOnce('other_key')
      .mockReturnValueOnce('wm_session_2')
      .mockReturnValueOnce('wm_session_3');

    mockLocalStorage.getItem
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now + 1000 })) // Valid
      .mockReturnValueOnce(
        JSON.stringify({ data: { ...mockSession, id: 'test-session-2' }, expiresAt: now + 1000 }),
      ) // Valid
      .mockReturnValueOnce(
        JSON.stringify({ data: { ...mockSession, id: 'test-session-3' }, expiresAt: now - 1000 }),
      ); // Expired

    const allSessions = await store.getAll();
    expect(allSessions.size).toBe(2); // Should only include non-expired sessions
    expect(allSessions.get('1')).toEqual(mockSession);
    expect(allSessions.get('2')).toEqual({ ...mockSession, id: 'test-session-2' });
  });

  it('should refresh expiry when getting all localStorage sessions if configured', async () => {
    const store = new LocalStorageSessionStore({
      lifetime: 1000,
      refreshOnAccess: true,
    });

    const now = Date.now();
    mockLocalStorage.length = 1;
    mockLocalStorage.key.mockReturnValue('wm_session_1');
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: mockSession,
        expiresAt: now + 500, // Expires in 500ms
      }),
    );

    await store.getAll();

    // Should have updated expiry
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const updatedSession = JSON.parse((mockLocalStorage.setItem.mock.calls[0] as [string, string])[1]);
    expect(updatedSession.expiresAt).toBeGreaterThan(now + 900); // Close to now + 1000
  });

  it('should clean expired sessions', async () => {
    const now = Date.now();
    mockLocalStorage.length = 3;
    mockLocalStorage.key
      .mockReturnValueOnce('wm_session_1')
      .mockReturnValueOnce('wm_session_2')
      .mockReturnValueOnce('wm_session_3');

    mockLocalStorage.getItem
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now - 1000 })) // Expired
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now + 1000 })) // Valid
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now - 2000 })); // Expired

    const removed = await store.cleanExpired();
    expect(removed).toBe(2);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_1');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_3');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
  });

  it('should return undefined for non-existent sessions', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const retrieved = await store.get('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should delete sessions from localStorage', async () => {
    await store.delete('test-id');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_test-id');
  });

  it('should clear only prefixed sessions from localStorage', async () => {
    mockLocalStorage.length = 3;
    mockLocalStorage.key
      .mockReturnValueOnce('wm_session_1')
      .mockReturnValueOnce('other_key')
      .mockReturnValueOnce('wm_session_2');

    await store.clear();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_1');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_2');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
  });

  it('should throw error when localStorage is not available', async () => {
    vi.stubGlobal('localStorage', undefined);

    await expect(store.set('test-id', mockSession)).rejects.toThrow(
      'LocalStorage is not available in this environment',
    );
    await expect(store.get('test-id')).rejects.toThrow('LocalStorage is not available in this environment');
    await expect(store.delete('test-id')).rejects.toThrow(
      'LocalStorage is not available in this environment',
    );
    await expect(store.clear()).rejects.toThrow('LocalStorage is not available in this environment');
  });
});

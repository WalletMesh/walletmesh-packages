import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageSessionStore, MemorySessionStore } from './session-store.js';
import type { SessionData } from './types.js';

const mockSession: SessionData = {
  id: 'test-session',
  origin: 'test-origin',
  createdAt: Date.now(),
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

  it('should not expire sessions', async () => {
    const store = new MemorySessionStore(); // Config no longer accepted
    await store.set('test-id', mockSession);

    // Session should be valid initially
    let session = await store.validateAndRefresh('test-id');
    expect(session).toEqual(mockSession);

    // Advance time - session should still be valid since expiration is disabled
    vi.advanceTimersByTime(10000); // 10 seconds

    // Session should still be valid
    session = await store.validateAndRefresh('test-id');
    expect(session).toEqual(mockSession);
  });

  it('should not refresh session expiry', async () => {
    const store = new MemorySessionStore(); // Config no longer accepted
    await store.set('test-id', mockSession);

    // Advance time
    vi.advanceTimersByTime(900); // 0.9 seconds

    // Access session
    const session = await store.validateAndRefresh('test-id');
    expect(session).toEqual(mockSession);

    // Session should still be valid since expiration is disabled
    vi.advanceTimersByTime(200); // 1.1 seconds total
    const refreshedSession = await store.validateAndRefresh('test-id');
    expect(refreshedSession).toEqual(mockSession);
  });

  it('should get all sessions without filtering', async () => {
    const store = new MemorySessionStore(); // Config no longer accepted
    const now = Date.now();

    // Mock Date.now() to control time for each session
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now) // session1
      .mockReturnValueOnce(now) // session2
      .mockReturnValueOnce(now) // session4
      .mockReturnValueOnce(now - 500) // session3
      .mockReturnValue(now + 600); // time when getAll is called

    await store.set('session1', mockSession);
    await store.set('session2', { ...mockSession, id: 'test-session-2' });
    await store.set('session4', { ...mockSession, id: 'test-session-4' });
    await store.set('session3', { ...mockSession, id: 'test-session-3' });

    const allSessions = await store.getAll();
    expect(allSessions.size).toBe(4); // All sessions included since expiration is disabled
    expect(allSessions.get('session1')).toEqual(mockSession);
    expect(allSessions.get('session2')).toEqual({ ...mockSession, id: 'test-session-2' });
    expect(allSessions.get('session4')).toEqual({ ...mockSession, id: 'test-session-4' });
    expect(allSessions.get('session3')).toEqual({ ...mockSession, id: 'test-session-3' });
  });

  it('should not refresh expiry when getting all sessions', async () => {
    const store = new MemorySessionStore(); // Config no longer accepted
    await store.set('session1', mockSession);

    // Advance time
    vi.advanceTimersByTime(900);

    // GetAll returns sessions
    await store.getAll();

    // Session should still be valid since expiration is disabled
    vi.advanceTimersByTime(200);
    const session = await store.get('session1');
    expect(session).toEqual(mockSession);
  });

  it('should not clean sessions since expiration is disabled', async () => {
    const store = new MemorySessionStore(); // Config no longer accepted
    await store.set('session1', mockSession);
    await store.set('session2', { ...mockSession, id: 'test-session-2' });
    await store.set('session3', { ...mockSession, id: 'test-session-3' });

    // Advance time
    vi.advanceTimersByTime(1100); // 1.1 seconds

    // Add a new session
    await store.set('session4', { ...mockSession, id: 'test-session-4' });

    const removed = await store.cleanExpired();
    expect(removed).toBe(0); // No sessions expired since expiration is disabled
    expect(await store.get('session1')).toBeDefined(); // All sessions should remain
    expect(await store.get('session4')).toBeDefined();
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

  it('should store sessions in localStorage without expiry', async () => {
    const store = new LocalStorageSessionStore(); // Config no longer accepted
    await store.set('test-id', mockSession);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'wm_session_test-id',
      expect.stringContaining('"data":'),
    );
    expect(mockLocalStorage.setItem.mock.calls.length).toBe(1);
    const storedData = JSON.parse((mockLocalStorage.setItem.mock.calls[0] as [string, string])[1]);
    expect(storedData.data).toEqual(mockSession);
    expect(storedData.expiresAt).toBeUndefined(); // Expiration disabled
  });

  it('should store sessions in localStorage without expiry when lifetime is not set', async () => {
    const store = new LocalStorageSessionStore(); // No lifetime set
    await store.set('test-id', mockSession);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'wm_session_test-id',
      expect.stringContaining('"data":'),
    );
    expect(mockLocalStorage.setItem.mock.calls.length).toBe(1);
    const storedData = JSON.parse((mockLocalStorage.setItem.mock.calls[0] as [string, string])[1]);
    expect(storedData.data).toEqual(mockSession);
    expect(storedData.expiresAt).toBeUndefined();
  });

  it('should retrieve sessions from localStorage', async () => {
    const storedSession = { data: mockSession, expiresAt: undefined };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));
    const retrieved = await store.get('test-id');
    expect(retrieved).toEqual(mockSession);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('wm_session_test-id');
  });

  it('should not expire sessions in validateAndRefresh', async () => {
    const now = Date.now();
    const storedSession = {
      data: mockSession,
      expiresAt: now - 1000, // Would be expired, but expiration is disabled
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));

    const retrieved = await store.validateAndRefresh('test-id');
    expect(retrieved).toEqual(mockSession); // Still valid
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should not refresh session expiry', async () => {
    const store = new LocalStorageSessionStore(); // Config no longer accepted

    const now = Date.now();
    const storedSession = {
      data: mockSession,
      expiresAt: now + 500, // Would expire, but expiration is disabled
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSession));

    const retrieved = await store.validateAndRefresh('test-id');
    expect(retrieved).toEqual(mockSession);

    // Should not update expiry since expiration is disabled
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should get all sessions from localStorage without filtering', async () => {
    const now = Date.now();
    mockLocalStorage.length = 4;
    mockLocalStorage.key
      .mockReturnValueOnce('wm_session_1')
      .mockReturnValueOnce('other_key')
      .mockReturnValueOnce('wm_session_2')
      .mockReturnValueOnce('wm_session_3');

    mockLocalStorage.getItem
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now + 1000 }))
      .mockReturnValueOnce(
        JSON.stringify({ data: { ...mockSession, id: 'test-session-2' }, expiresAt: now + 1000 }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ data: { ...mockSession, id: 'test-session-3' }, expiresAt: now - 1000 }),
      ); // Would be expired, but expiration is disabled

    const allSessions = await store.getAll();
    expect(allSessions.size).toBe(3); // All sessions included since expiration is disabled
    expect(allSessions.get('1')).toEqual(mockSession);
    expect(allSessions.get('2')).toEqual({ ...mockSession, id: 'test-session-2' });
    expect(allSessions.get('3')).toEqual({ ...mockSession, id: 'test-session-3' });
  });

  it('should not refresh expiry when getting all localStorage sessions', async () => {
    const store = new LocalStorageSessionStore(); // Config no longer accepted

    const now = Date.now();
    mockLocalStorage.length = 1;
    mockLocalStorage.key.mockReturnValue('wm_session_1');
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: mockSession,
        expiresAt: now + 500,
      }),
    );

    await store.getAll();

    // Should not update expiry since expiration is disabled
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should not clean sessions since expiration is disabled', async () => {
    const now = Date.now();
    mockLocalStorage.length = 3;
    mockLocalStorage.key
      .mockReturnValueOnce('wm_session_1')
      .mockReturnValueOnce('wm_session_2')
      .mockReturnValueOnce('wm_session_3');

    mockLocalStorage.getItem
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now - 1000 })) // Would be expired
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now + 1000 }))
      .mockReturnValueOnce(JSON.stringify({ data: mockSession, expiresAt: now - 2000 })); // Would be expired

    const removed = await store.cleanExpired();
    expect(removed).toBe(0); // No sessions cleaned since expiration is disabled
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should return undefined for non-existent sessions', async () => {
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.getItem.mockReturnValue(null);
    const retrieved = await store.get('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should delete sessions from localStorage', async () => {
    await store.delete('test-id');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wm_session_test-id');
  });

  it('should clear only prefixed sessions from localStorage', async () => {
    mockLocalStorage.removeItem.mockReset(); // Ensure clean state
    mockLocalStorage.key.mockReset(); // Fully reset key mock
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

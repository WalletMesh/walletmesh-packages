import { vi } from 'vitest';

export interface MockedPort {
  name: string;
  onMessage: {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
  onDisconnect: {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
  disconnect: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
}

export interface MockedRuntime {
  connect: ReturnType<typeof vi.fn>;
  id: string;
  lastError: null;
  onConnect: {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
  onMessage: {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
}

export const createMockPort = (): MockedPort => ({
  name: 'test-port',
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onDisconnect: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  disconnect: vi.fn(),
  postMessage: vi.fn(),
});

export const createMockRuntime = (port: MockedPort): MockedRuntime => ({
  connect: vi.fn().mockReturnValue(port),
  id: 'test-extension',
  lastError: null,
  onConnect: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
});

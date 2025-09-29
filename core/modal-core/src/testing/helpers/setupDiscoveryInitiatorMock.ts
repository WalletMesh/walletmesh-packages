import type { DiscoveryInitiator } from '@walletmesh/discovery';
import { vi } from 'vitest';

export interface MockDiscoveryInitiator {
  startDiscovery: ReturnType<typeof vi.fn>;
  stopDiscovery: ReturnType<typeof vi.fn>;
  isDiscovering: ReturnType<typeof vi.fn>;
  getQualifiedResponders: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  removeAllListeners: ReturnType<typeof vi.fn>;
}

export async function setupDiscoveryInitiatorMock(
  overrides: Partial<MockDiscoveryInitiator> = {},
): Promise<{ mockInitiator: MockDiscoveryInitiator }>
{  const discoveryModule = await import('@walletmesh/discovery');

  const mockInitiator: MockDiscoveryInitiator = {
    startDiscovery: vi.fn().mockResolvedValue([]),
    stopDiscovery: vi.fn().mockResolvedValue(undefined),
    isDiscovering: vi.fn().mockReturnValue(false),
    getQualifiedResponders: vi.fn().mockReturnValue([]),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    ...overrides,
  };

  vi.mocked(discoveryModule.DiscoveryInitiator).mockImplementation(
    () => mockInitiator as unknown as DiscoveryInitiator,
  );
  vi.mocked(discoveryModule.createInitiatorSession).mockImplementation(
    () => mockInitiator as unknown as DiscoveryInitiator,
  );

  return { mockInitiator };
}

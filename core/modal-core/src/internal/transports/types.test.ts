import { describe, expect, it } from 'vitest';
import type { Transport } from '../../types.js';
import { type InternalTransport, type TestableTransport, TransportEventType } from './types.js';

// Helper to create testable transport with internal properties
function createTestableTransport(props: TestableTransport): TestableTransport {
  return props;
}

// Helper to create internal transport with required properties
function createInternalTransport(
  base: Transport,
  type: string,
  config: Record<string, unknown>,
): InternalTransport {
  return {
    ...base,
    transportType: type,
    transportConfig: config,
  } as InternalTransport;
}

describe('Transport Types', () => {
  describe('TransportEventType enum', () => {
    it('should have correct string values', () => {
      expect(TransportEventType.Connected).toBe('connected');
      expect(TransportEventType.Disconnected).toBe('disconnected');
      expect(TransportEventType.Message).toBe('message');
      expect(TransportEventType.Error).toBe('error');
    });

    it('should have all expected enum members', () => {
      const enumValues = Object.values(TransportEventType);
      expect(enumValues).toContain('connected');
      expect(enumValues).toContain('disconnected');
      expect(enumValues).toContain('message');
      expect(enumValues).toContain('error');
      expect(enumValues).toHaveLength(4);
    });

    it('should have all expected enum keys', () => {
      const enumKeys = Object.keys(TransportEventType);
      expect(enumKeys).toContain('Connected');
      expect(enumKeys).toContain('Disconnected');
      expect(enumKeys).toContain('Message');
      expect(enumKeys).toContain('Error');
      expect(enumKeys).toHaveLength(4);
    });

    it('should be usable in switch statements', () => {
      const handleEvent = (eventType: TransportEventType): string => {
        switch (eventType) {
          case TransportEventType.Connected:
            return 'connected';
          case TransportEventType.Disconnected:
            return 'disconnected';
          case TransportEventType.Message:
            return 'message';
          case TransportEventType.Error:
            return 'error';
          default:
            return 'unknown';
        }
      };

      expect(handleEvent(TransportEventType.Connected)).toBe('connected');
      expect(handleEvent(TransportEventType.Disconnected)).toBe('disconnected');
      expect(handleEvent(TransportEventType.Message)).toBe('message');
      expect(handleEvent(TransportEventType.Error)).toBe('error');
    });

    it('should be usable as object keys', () => {
      const eventHandlers = {
        [TransportEventType.Connected]: () => 'connected handler',
        [TransportEventType.Disconnected]: () => 'disconnected handler',
        [TransportEventType.Message]: () => 'message handler',
        [TransportEventType.Error]: () => 'error handler',
      };

      expect(eventHandlers[TransportEventType.Connected]()).toBe('connected handler');
      expect(eventHandlers[TransportEventType.Disconnected]()).toBe('disconnected handler');
      expect(eventHandlers[TransportEventType.Message]()).toBe('message handler');
      expect(eventHandlers[TransportEventType.Error]()).toBe('error handler');
    });

    it('should be comparable with string values', () => {
      expect(TransportEventType.Connected === 'connected').toBe(true);
      expect(TransportEventType.Disconnected === 'disconnected').toBe(true);
      expect(TransportEventType.Message === 'message').toBe(true);
      expect(TransportEventType.Error === 'error').toBe(true);

      expect(TransportEventType.Connected === 'wrong').toBe(false);
      expect(TransportEventType.Disconnected === 'wrong').toBe(false);
      expect(TransportEventType.Message === 'wrong').toBe(false);
      expect(TransportEventType.Error === 'wrong').toBe(false);
    });
  });

  describe('TestableTransport interface', () => {
    it('should allow objects with optional testing properties', () => {
      const testableTransport = createTestableTransport({
        transportType: 'popup',
        transportConfig: { url: 'https://example.com', timeout: 5000 },
      });

      expect(testableTransport.transportType).toBe('popup');
      expect(testableTransport.transportConfig).toEqual({ url: 'https://example.com', timeout: 5000 });
    });

    it('should allow objects with only transportType property', () => {
      const testableTransport = createTestableTransport({
        transportType: 'chrome-extension',
      });

      expect(testableTransport.transportType).toBe('chrome-extension');
      expect(testableTransport.transportConfig).toBeUndefined();
    });

    it('should allow objects with only transportConfig property', () => {
      const testableTransport = createTestableTransport({
        transportConfig: { port: 8080, secure: true },
      });

      expect(testableTransport.transportType).toBeUndefined();
      expect(testableTransport.transportConfig).toEqual({ port: 8080, secure: true });
    });

    it('should allow empty objects', () => {
      const testableTransport = createTestableTransport({});

      expect(testableTransport.transportType).toBeUndefined();
      expect(testableTransport.transportConfig).toBeUndefined();
    });

    it('should allow complex config objects', () => {
      const complexConfig = {
        url: 'https://wallet.example.com',
        timeout: 30000,
        retries: 3,
        features: {
          width: 400,
          height: 600,
          center: true,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      };

      const testableTransport = createTestableTransport({
        transportType: 'popup-window',
        transportConfig: complexConfig,
      });

      expect(testableTransport.transportType).toBe('popup-window');
      expect(testableTransport.transportConfig).toEqual(complexConfig);
    });

    it('should work with type checking utilities', () => {
      const hasTestingType = (obj: unknown): obj is TestableTransport & { transportType: string } => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'transportType' in obj &&
          typeof (obj as { transportType: unknown }).transportType === 'string'
        );
      };

      const hasTestingConfig = (
        obj: unknown,
      ): obj is TestableTransport & { transportConfig: Record<string, unknown> } => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'transportConfig' in obj &&
          typeof (obj as { transportConfig: unknown }).transportConfig === 'object'
        );
      };

      const withType = createTestableTransport({ transportType: 'test' });
      const withConfig = createTestableTransport({ transportConfig: { test: true } });
      const withBoth = createTestableTransport({ transportType: 'test', transportConfig: { test: true } });
      const withNeither = createTestableTransport({});

      expect(hasTestingType(withType)).toBe(true);
      expect(hasTestingType(withConfig)).toBe(false);
      expect(hasTestingType(withBoth)).toBe(true);
      expect(hasTestingType(withNeither)).toBe(false);

      expect(hasTestingConfig(withType)).toBe(false);
      expect(hasTestingConfig(withConfig)).toBe(true);
      expect(hasTestingConfig(withBoth)).toBe(true);
      expect(hasTestingConfig(withNeither)).toBe(false);
    });
  });

  describe('InternalTransport interface', () => {
    it('should require both transportType and transportConfig properties', () => {
      // Mock Transport implementation for testing
      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const internalTransport = createInternalTransport(mockTransport, 'internal-test', {
        internal: true,
        debug: false,
      });

      expect(internalTransport.transportType).toBe('internal-test');
      expect(internalTransport.transportConfig).toEqual({ internal: true, debug: false });
      expect(typeof internalTransport.connect).toBe('function');
      expect(typeof internalTransport.disconnect).toBe('function');
      expect(typeof internalTransport.send).toBe('function');
      expect(typeof internalTransport.on).toBe('function');
      expect(typeof internalTransport.off).toBe('function');
    });

    it('should extend Transport interface', () => {
      const checkTransportMethods = (transport: Transport): boolean => {
        return (
          typeof transport.connect === 'function' &&
          typeof transport.disconnect === 'function' &&
          typeof transport.send === 'function' &&
          typeof transport.on === 'function' &&
          typeof transport.off === 'function'
        );
      };

      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const internalTransport = createInternalTransport(mockTransport, 'test-transport', {});

      expect(checkTransportMethods(internalTransport)).toBe(true);
    });

    it('should allow different transport types', () => {
      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const transportTypes = ['popup', 'chrome-extension', 'websocket', 'iframe', 'postmessage'];

      for (const type of transportTypes) {
        const internalTransport = createInternalTransport(mockTransport, type, { type });

        expect(internalTransport.transportType).toBe(type);
        expect(internalTransport.transportConfig.type).toBe(type);
      }
    });

    it('should allow complex configuration objects', () => {
      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const complexConfig = {
        url: 'wss://api.example.com/transport',
        timeout: 10000,
        reconnect: true,
        maxReconnects: 5,
        protocols: ['v1', 'v2'],
        headers: {
          'User-Agent': 'WalletMesh/1.0',
          'X-Client-Version': '1.0.0',
        },
        features: {
          encryption: true,
          compression: false,
          batching: true,
        },
      };

      const internalTransport = createInternalTransport(mockTransport, 'websocket', complexConfig);

      expect(internalTransport.transportConfig).toEqual(complexConfig);
      expect(internalTransport.transportConfig.url).toBe('wss://api.example.com/transport');
      expect(internalTransport.transportConfig.timeout).toBe(10000);
      expect(internalTransport.transportConfig.protocols).toEqual(['v1', 'v2']);
      expect(internalTransport.transportConfig.headers).toEqual({
        'User-Agent': 'WalletMesh/1.0',
        'X-Client-Version': '1.0.0',
      });
      expect(internalTransport.transportConfig.features).toEqual({
        encryption: true,
        compression: false,
        batching: true,
      });
    });

    it('should work with transport identification utilities', () => {
      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const isInternalTransport = (obj: unknown): obj is InternalTransport => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'transportType' in obj &&
          'transportConfig' in obj &&
          typeof (obj as { transportType: unknown }).transportType === 'string' &&
          typeof (obj as { transportConfig: unknown }).transportConfig === 'object'
        );
      };

      const getTransportInfo = (transport: InternalTransport): { type: string; configKeys: string[] } => {
        return {
          type: transport.transportType,
          configKeys: Object.keys(transport.transportConfig),
        };
      };

      const internalTransport = createInternalTransport(mockTransport, 'test-transport', {
        url: 'test',
        timeout: 1000,
      });

      const regularObject = { notTransport: true };

      expect(isInternalTransport(internalTransport)).toBe(true);
      expect(isInternalTransport(regularObject)).toBe(false);

      const info = getTransportInfo(internalTransport);
      expect(info.type).toBe('test-transport');
      expect(info.configKeys).toEqual(['url', 'timeout']);
    });
  });

  describe('Type relationships', () => {
    it('should show InternalTransport extends TestableTransport', () => {
      const mockTransport: Pick<Transport, 'connect' | 'disconnect' | 'send' | 'on' | 'off'> = {
        connect: async () => {},
        disconnect: async () => {},
        send: async () => {},
        on: () => () => {},
        off: () => {},
      };

      const internalTransport = createInternalTransport(mockTransport, 'test', { test: true });

      // InternalTransport should be assignable to TestableTransport
      const testableTransport: TestableTransport = internalTransport;

      expect(testableTransport.transportType).toBe('test');
      expect(testableTransport.transportConfig).toEqual({ test: true });
    });

    it('should show compatibility with enum usage', () => {
      const eventTypeToString = (eventType: TransportEventType): string => {
        const descriptions = {
          [TransportEventType.Connected]: 'Transport has established connection',
          [TransportEventType.Disconnected]: 'Transport has lost connection',
          [TransportEventType.Message]: 'Transport received a message',
          [TransportEventType.Error]: 'Transport encountered an error',
        };

        return descriptions[eventType];
      };

      expect(eventTypeToString(TransportEventType.Connected)).toBe('Transport has established connection');
      expect(eventTypeToString(TransportEventType.Disconnected)).toBe('Transport has lost connection');
      expect(eventTypeToString(TransportEventType.Message)).toBe('Transport received a message');
      expect(eventTypeToString(TransportEventType.Error)).toBe('Transport encountered an error');
    });

    it('should work with event filtering based on type', () => {
      interface TransportEvent {
        type: TransportEventType;
        timestamp: number;
        data?: unknown;
      }

      const events: TransportEvent[] = [
        { type: TransportEventType.Connected, timestamp: 1000 },
        { type: TransportEventType.Message, timestamp: 2000, data: { hello: 'world' } },
        { type: TransportEventType.Error, timestamp: 3000, data: { error: 'timeout' } },
        { type: TransportEventType.Disconnected, timestamp: 4000 },
      ];

      const filterEventsByType = (events: TransportEvent[], type: TransportEventType): TransportEvent[] => {
        return events.filter((event) => event.type === type);
      };

      const connectedEvents = filterEventsByType(events, TransportEventType.Connected);
      const messageEvents = filterEventsByType(events, TransportEventType.Message);
      const errorEvents = filterEventsByType(events, TransportEventType.Error);
      const disconnectedEvents = filterEventsByType(events, TransportEventType.Disconnected);

      expect(connectedEvents).toHaveLength(1);
      expect(messageEvents).toHaveLength(1);
      expect(errorEvents).toHaveLength(1);
      expect(disconnectedEvents).toHaveLength(1);

      expect(connectedEvents[0].timestamp).toBe(1000);
      expect(messageEvents[0].data).toEqual({ hello: 'world' });
      expect(errorEvents[0].data).toEqual({ error: 'timeout' });
      expect(disconnectedEvents[0].timestamp).toBe(4000);
    });
  });
});

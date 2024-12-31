import { describe, it, expect } from 'vitest';
import { MethodRegistry } from './method-registry.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCMethodMap, JSONRPCContext, JSONRPCSerializer } from './types.js';

interface TestMethodMap extends JSONRPCMethodMap {
  add: {
    params: { a: number; b: number };
    result: number;
  };
  greet: {
    params: { name: string };
    result: string;
  };
}

interface TestContext extends JSONRPCContext {
  userId?: string;
}

describe('MethodRegistry', () => {
  it('should register and retrieve methods', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler = (_context: TestContext, params: { a: number; b: number }) => params.a + params.b;

    registry.registerMethod('add', handler);
    const method = registry.getMethod('add');

    expect(method.handler).toBe(handler);
    expect(method.serializer).toBeUndefined();
  });

  it('should register methods with serializers', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler = (_context: TestContext, params: { name: string }) => `Hello, ${params.name}!`;
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    registry.registerMethod('greet', handler, serializer);
    const method = registry.getMethod('greet');

    expect(method.handler).toBe(handler);
    expect(method.serializer).toBe(serializer);
  });

  it('should throw error for non-existent methods', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();

    expect(() => registry.getMethod('add')).toThrow(JSONRPCError);
    expect(() => registry.getMethod('add')).toThrow('Method not found');
  });

  it('should check method existence correctly', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler = (_context: TestContext, params: { a: number; b: number }) => params.a + params.b;

    expect(registry.hasMethod('add')).toBe(false);

    registry.registerMethod('add', handler);

    expect(registry.hasMethod('add')).toBe(true);
  });

  it('should remove methods', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler = (_context: TestContext, params: { a: number; b: number }) => params.a + params.b;

    registry.registerMethod('add', handler);
    expect(registry.hasMethod('add')).toBe(true);

    registry.removeMethod('add');
    expect(registry.hasMethod('add')).toBe(false);
    expect(() => registry.getMethod('add')).toThrow(JSONRPCError);
  });

  it('should register and retrieve serializers separately', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    registry.registerSerializer('greet', serializer);
    const retrievedSerializer = registry.getSerializer('greet');

    expect(retrievedSerializer).toBe(serializer);
  });

  it('should remove serializers', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    registry.registerSerializer('greet', serializer);
    expect(registry.getSerializer('greet')).toBe(serializer);

    registry.removeSerializer('greet');
    expect(registry.getSerializer('greet')).toBeUndefined();
  });

  it('should allow overwriting registered methods', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler1 = (_context: TestContext, params: { a: number; b: number }) => params.a + params.b;
    const handler2 = (_context: TestContext, params: { a: number; b: number }) => params.a * params.b;

    registry.registerMethod('add', handler1);
    expect(registry.getMethod('add').handler).toBe(handler1);

    registry.registerMethod('add', handler2);
    expect(registry.getMethod('add').handler).toBe(handler2);
  });

  it('should allow overwriting registered serializers', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const serializer1: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
    };
    const serializer2: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: Buffer.from(JSON.stringify(params)).toString('base64') }),
        deserialize: (data) => JSON.parse(Buffer.from(data.serialized, 'base64').toString()),
      },
    };

    registry.registerSerializer('greet', serializer1);
    expect(registry.getSerializer('greet')).toBe(serializer1);

    registry.registerSerializer('greet', serializer2);
    expect(registry.getSerializer('greet')).toBe(serializer2);
  });

  it('should get serializer from method registration', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const handler = (_context: TestContext, params: { name: string }) => `Hello, ${params.name}!`;
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    registry.registerMethod('greet', handler, serializer);
    const retrievedSerializer = registry.getSerializer('greet');

    expect(retrievedSerializer).toBe(serializer);
  });

  it('should get serializer from separate registration', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    registry.registerSerializer('greet', serializer);
    const retrievedSerializer = registry.getSerializer('greet');

    expect(retrievedSerializer).toBe(serializer);
  });

  it('should return undefined for non-existent serializer', () => {
    const registry = new MethodRegistry<TestMethodMap, TestContext>();
    const retrievedSerializer = registry.getSerializer('greet');

    expect(retrievedSerializer).toBeUndefined();
  });
});

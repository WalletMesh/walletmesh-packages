import { describe, expect, it } from 'vitest';
import { JSONRPCError, TimeoutError } from './error.js';

describe('JSONRPCError', () => {
  it('should create error with code and message', () => {
    const error = new JSONRPCError(-32600, 'Invalid Request');
    expect(error.code).toBe(-32600);
    expect(error.message).toBe('Invalid Request');
    expect(error.name).toBe('JSONRPCError');
  });

  it('should create error with string data', () => {
    const error = new JSONRPCError(-32602, 'Invalid params', 'Missing required fields');
    expect(error.data).toBe('Missing required fields');
  });

  it('should create error with object data', () => {
    const data = { expected: ['username', 'password'], received: ['username'] };
    const error = new JSONRPCError(-32602, 'Invalid params', data);
    expect(error.data).toEqual(data);
  });

  it('should format toString() without data', () => {
    const error = new JSONRPCError(-32600, 'Invalid Request');
    expect(error.toString()).toBe('JSONRPCError(-32600): Invalid Request');
  });

  it('should format toString() with string data', () => {
    const error = new JSONRPCError(-32602, 'Invalid params', 'Missing required fields');
    expect(error.toString()).toBe('JSONRPCError(-32602): Invalid params, Data: Missing required fields');
  });

  it('should format toString() with object data', () => {
    const data = { expected: ['username'], received: [] };
    const error = new JSONRPCError(-32602, 'Invalid params', data);
    expect(error.toString()).toBe(
      'JSONRPCError(-32602): Invalid params, Data: {"expected":["username"],"received":[]}',
    );
  });
});

describe('TimeoutError', () => {
  it('should create timeout error with message and id', () => {
    const error = new TimeoutError('Request timed out', '123');
    expect(error.message).toBe('Request timed out');
    expect(error.id).toBe('123');
    expect(error.code).toBe(-32000);
    expect(error.name).toBe('TimeoutError');
  });

  it('should inherit from JSONRPCError', () => {
    const error = new TimeoutError('Request timed out', '123');
    expect(error).toBeInstanceOf(JSONRPCError);
  });

  it('should format toString()', () => {
    const error = new TimeoutError('Request timed out', '123');
    expect(error.toString()).toBe('TimeoutError(-32000): Request timed out');
  });

  it('should work with numeric id', () => {
    const error = new TimeoutError('Request timed out', 123);
    expect(error.id).toBe(123);
  });

  it('should work with undefined id', () => {
    const error = new TimeoutError('Request timed out', undefined);
    expect(error.id).toBeUndefined();
  });
});

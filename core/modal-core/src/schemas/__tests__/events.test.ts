/**
 * @fileoverview Tests for event system schemas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  transportEventSchema,
  walletMeshEventSchema,
  walletMeshEventTypeSchema,
  modalOpenedEventSchema,
  modalClosedEventSchema,
  walletSelectedEventSchema,
  walletConnectingEventSchema,
  walletConnectedEventSchema,
  walletDisconnectedEventSchema,
  chainChangedEventSchema,
  accountsChangedEventSchema,
  modalErrorEventSchema,
} from '../events.js';

describe('Event Schemas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('transportEventSchema', () => {
    it('should validate transport message event', () => {
      const validEvent = {
        type: 'message' as const,
        data: { test: 'data' },
      };

      expect(() => transportEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate transport connected event', () => {
      const validEvent = {
        type: 'connected' as const,
      };

      expect(() => transportEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate transport disconnected event', () => {
      const validEvent = {
        type: 'disconnected' as const,
        reason: 'User closed connection',
      };

      expect(() => transportEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate transport error event', () => {
      const validEvent = {
        type: 'error' as const,
        error: {
          code: 'CONNECTION_FAILED',
          message: 'Connection failed',
          category: 'network' as const,
        },
      };

      expect(() => transportEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should reject invalid transport event type', () => {
      const invalidEvent = {
        type: 'invalid' as const,
      };

      expect(() => transportEventSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('walletMeshEventSchema', () => {
    it('should validate modal opened event', () => {
      const validEvent = {
        type: 'modal:opened' as const,
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate modal closed event', () => {
      const validEvent = {
        type: 'modal:closed' as const,
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate wallet selected event', () => {
      const validEvent = {
        type: 'wallet:selected' as const,
        walletId: 'metamask',
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate wallet connecting event', () => {
      const validEvent = {
        type: 'wallet:connecting' as const,
        walletId: 'metamask',
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate wallet connected event', () => {
      const validEvent = {
        type: 'wallet:connected' as const,
        walletId: 'metamask',
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1',
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate wallet disconnected event', () => {
      const validEvent = {
        type: 'wallet:disconnected' as const,
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate chain changed event', () => {
      const validEvent = {
        type: 'chain:changed' as const,
        chainId: '137',
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate accounts changed event', () => {
      const validEvent = {
        type: 'accounts:changed' as const,
        accounts: ['0x1234567890123456789012345678901234567890'],
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate modal error event', () => {
      const validEvent = {
        type: 'modal:error' as const,
        error: {
          code: 'CONNECTION_FAILED',
          message: 'Connection failed',
          category: 'network' as const,
        },
      };

      expect(() => walletMeshEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should reject invalid event type', () => {
      const invalidEvent = {
        type: 'invalid:event' as const,
      };

      expect(() => walletMeshEventSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('walletMeshEventTypeSchema', () => {
    it('should validate all wallet mesh event types', () => {
      const eventTypes = [
        'modal:opened',
        'modal:closed',
        'wallet:selected',
        'wallet:connecting',
        'wallet:connected',
        'wallet:disconnected',
        'accounts:changed',
        'chain:changed',
        'modal:error',
      ];

      for (const eventType of eventTypes) {
        expect(() => walletMeshEventTypeSchema.parse(eventType)).not.toThrow();
      }
    });

    it('should reject invalid event types', () => {
      const invalidTypes = ['invalid', 'modal:invalid', 'wallet:unknown'];

      for (const invalidType of invalidTypes) {
        expect(() => walletMeshEventTypeSchema.parse(invalidType)).toThrow();
      }
    });
  });

  describe('Individual event schemas', () => {
    it('should validate modal opened event', () => {
      expect(() => modalOpenedEventSchema.parse({ type: 'modal:opened' })).not.toThrow();
    });

    it('should validate modal closed event', () => {
      expect(() => modalClosedEventSchema.parse({ type: 'modal:closed' })).not.toThrow();
    });

    it('should validate wallet selected event', () => {
      expect(() =>
        walletSelectedEventSchema.parse({
          type: 'wallet:selected',
          walletId: 'metamask',
        }),
      ).not.toThrow();
    });

    it('should validate wallet connecting event', () => {
      expect(() =>
        walletConnectingEventSchema.parse({
          type: 'wallet:connecting',
          walletId: 'metamask',
        }),
      ).not.toThrow();
    });

    it('should validate wallet connected event', () => {
      expect(() =>
        walletConnectedEventSchema.parse({
          type: 'wallet:connected',
          walletId: 'metamask',
          address: '0x1234567890123456789012345678901234567890',
        }),
      ).not.toThrow();
    });

    it('should validate wallet disconnected event', () => {
      expect(() => walletDisconnectedEventSchema.parse({ type: 'wallet:disconnected' })).not.toThrow();
    });

    it('should validate chain changed event', () => {
      expect(() =>
        chainChangedEventSchema.parse({
          type: 'chain:changed',
          chainId: '137',
        }),
      ).not.toThrow();
    });

    it('should validate accounts changed event', () => {
      expect(() =>
        accountsChangedEventSchema.parse({
          type: 'accounts:changed',
          accounts: ['0x1234567890123456789012345678901234567890'],
        }),
      ).not.toThrow();
    });

    it('should validate modal error event', () => {
      expect(() =>
        modalErrorEventSchema.parse({
          type: 'modal:error',
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Connection failed',
            category: 'network' as const,
          },
        }),
      ).not.toThrow();
    });
  });
});

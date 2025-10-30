/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OriginValidator } from './OriginValidator.js';

describe('OriginValidator', () => {
	describe('validateContextOrigin', () => {
		it('should pass validation when _context.origin matches trusted origin', () => {
			const message = {
				_context: { origin: 'https://example.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should fail validation when _context.origin does not match trusted origin', () => {
			const message = {
				_context: { origin: 'https://malicious.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
				isBrowserValidated: true,
			});

			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain('Origin mismatch');
			expect(result.error?.message).toContain('malicious.com');
			expect(result.error?.message).toContain('example.com');
			expect(result.context).toEqual({
				contextOrigin: 'https://malicious.com',
				trustedOrigin: 'https://example.com',
				transportType: 'test',
			});
		});

		it('should pass validation when message has no _context field', () => {
			const message = { data: 'test' };

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should pass validation when _context has no origin field', () => {
			const message = {
				_context: { other: 'field' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should pass validation when trusted origin is undefined (SSR)', () => {
			const message = {
				_context: { origin: 'https://example.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, undefined, {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should include additional context in error', () => {
			const message = {
				_context: { origin: 'https://malicious.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
				additionalContext: {
					targetOrigin: 'https://wallet.com',
					extensionId: 'test-extension',
				},
			});

			expect(result.valid).toBe(false);
			expect(result.error?.data).toMatchObject({
				transport: 'test',
				contextOrigin: 'https://malicious.com',
				trustedOrigin: 'https://example.com',
				targetOrigin: 'https://wallet.com',
				extensionId: 'test-extension',
			});
		});

		it('should indicate browser-validated origin in error message', () => {
			const message = {
				_context: { origin: 'https://malicious.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
				isBrowserValidated: true,
			});

			expect(result.error?.message).toContain('browser origin');
		});

		it('should indicate dApp origin in error message when not browser-validated', () => {
			const message = {
				_context: { origin: 'https://malicious.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
				isBrowserValidated: false,
			});

			expect(result.error?.message).toContain('dApp origin');
		});

		it('should handle non-string origin values gracefully', () => {
			const message = {
				_context: { origin: 123 },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});

		it('should handle null and undefined _context gracefully', () => {
			const nullMessage = { _context: null, data: 'test' };
			const undefinedMessage = { _context: undefined, data: 'test' };

			const nullResult = OriginValidator.validateContextOrigin(nullMessage, 'https://example.com', {
				transportType: 'test',
			});

			const undefinedResult = OriginValidator.validateContextOrigin(
				undefinedMessage,
				'https://example.com',
				{
					transportType: 'test',
				},
			);

			expect(nullResult.valid).toBe(true);
			expect(undefinedResult.valid).toBe(true);
		});
	});

	describe('validateWrappedOrigin', () => {
		it('should pass validation when wrapped origin matches trusted origin', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 'https://example.com',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should fail validation when wrapped origin does not match trusted origin', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 'https://malicious.com',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
				isBrowserValidated: true,
			});

			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain('Origin mismatch');
			expect(result.error?.message).toContain('wrapped message origin');
		});

		it('should fail validation when origin field is required but missing', () => {
			const message = {
				type: 'walletmesh_message',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
				requireOriginField: true,
			});

			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain('missing required origin field');
		});

		it('should pass validation when origin field is missing and not required', () => {
			const message = {
				type: 'walletmesh_message',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
				requireOriginField: false,
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should pass validation when trusted origin is undefined (SSR)', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 'https://example.com',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, undefined, {
				transportType: 'cross-window',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should include additional context in error', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 'https://malicious.com',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
				additionalContext: {
					targetOrigin: 'https://wallet.com',
					messageType: 'walletmesh_message',
				},
			});

			expect(result.valid).toBe(false);
			expect(result.error?.data).toMatchObject({
				transport: 'cross-window',
				wrappedOrigin: 'https://malicious.com',
				trustedOrigin: 'https://example.com',
				targetOrigin: 'https://wallet.com',
				messageType: 'walletmesh_message',
			});
		});

		it('should handle non-string origin values gracefully', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 123,
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
			});

			expect(result.valid).toBe(true);
		});

		it('should pass when message is not an object', () => {
			const result = OriginValidator.validateWrappedOrigin('not an object', 'https://example.com', {
				transportType: 'cross-window',
			});

			expect(result.valid).toBe(true);
		});
	});

	describe('getDAppOrigin', () => {
		it('should return window.location.origin in browser environment', () => {
			const origin = OriginValidator.getDAppOrigin();
			expect(origin).toBe(window.location.origin);
		});

		it('should return undefined in SSR environment', () => {
			const originalWindow = global.window;
			// @ts-expect-error - Testing SSR scenario
			delete global.window;

			const origin = OriginValidator.getDAppOrigin();
			expect(origin).toBeUndefined();

			global.window = originalWindow;
		});
	});

	describe('isBrowserEnvironment', () => {
		it('should return true in browser environment', () => {
			expect(OriginValidator.isBrowserEnvironment()).toBe(true);
		});

		it('should return false in SSR environment', () => {
			const originalWindow = global.window;
			// @ts-expect-error - Testing SSR scenario
			delete global.window;

			expect(OriginValidator.isBrowserEnvironment()).toBe(false);

			global.window = originalWindow;
		});

		it('should return false when window.location is undefined', () => {
			const originalLocation = window.location;
			// @ts-expect-error - Testing scenario
			delete window.location;

			expect(OriginValidator.isBrowserEnvironment()).toBe(false);

			// Restore
			Object.defineProperty(window, 'location', {
				value: originalLocation,
				writable: true,
				configurable: true,
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle null message gracefully in validateContextOrigin', () => {
			const result = OriginValidator.validateContextOrigin(null, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});

		it('should handle undefined message gracefully in validateContextOrigin', () => {
			const result = OriginValidator.validateContextOrigin(undefined, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});

		it('should handle null message gracefully in validateWrappedOrigin', () => {
			const result = OriginValidator.validateWrappedOrigin(null, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});

		it('should handle undefined message gracefully in validateWrappedOrigin', () => {
			const result = OriginValidator.validateWrappedOrigin(undefined, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});

		it('should handle empty strings for origin', () => {
			const message = {
				_context: { origin: '' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			// Empty string should be treated as missing origin
			expect(result.valid).toBe(false);
		});

		it('should handle whitespace-only strings for origin', () => {
			const message = {
				_context: { origin: '   ' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(false);
		});

		it('should be case-sensitive for origin comparison', () => {
			const message = {
				_context: { origin: 'https://EXAMPLE.COM' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			// Origins should be case-sensitive
			expect(result.valid).toBe(false);
		});

		it('should handle complex objects in _context', () => {
			const message = {
				_context: {
					origin: 'https://example.com',
					nested: {
						deep: {
							value: 'test',
						},
					},
				},
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test',
			});

			expect(result.valid).toBe(true);
		});
	});

	describe('Error Data Structure', () => {
		it('should create proper ModalError structure for context validation', () => {
			const message = {
				_context: { origin: 'https://malicious.com' },
				data: 'test',
			};

			const result = OriginValidator.validateContextOrigin(message, 'https://example.com', {
				transportType: 'test-transport',
				isBrowserValidated: true,
			});

			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe('message_failed');
			expect(result.error?.category).toBe('network');
			expect(result.error?.data).toMatchObject({
				transport: 'test-transport',
				contextOrigin: 'https://malicious.com',
				trustedOrigin: 'https://example.com',
				isBrowserValidated: true,
			});
		});

		it('should create proper ModalError structure for wrapped validation', () => {
			const message = {
				type: 'walletmesh_message',
				origin: 'https://malicious.com',
				data: 'test',
			};

			const result = OriginValidator.validateWrappedOrigin(message, 'https://example.com', {
				transportType: 'cross-window',
				isBrowserValidated: true,
			});

			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe('message_failed');
			expect(result.error?.category).toBe('network');
			expect(result.error?.data).toMatchObject({
				transport: 'cross-window',
				wrappedOrigin: 'https://malicious.com',
				trustedOrigin: 'https://example.com',
				isBrowserValidated: true,
			});
		});
	});
});

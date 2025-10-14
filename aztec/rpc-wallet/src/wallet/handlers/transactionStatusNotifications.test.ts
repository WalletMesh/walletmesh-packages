import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AztecHandlerContext } from './index.js';
import { notifyTransactionStatus } from './transactionStatusNotifications.js';

describe('transactionStatusNotifications', () => {
	describe('notifyTransactionStatus', () => {
		let mockContext: AztecHandlerContext;
		let mockNotify: ReturnType<typeof vi.fn>;

		beforeEach(() => {
			mockNotify = vi.fn().mockResolvedValue(undefined);
			mockContext = {
				notify: mockNotify,
			} as unknown as AztecHandlerContext;
		});

		it('should send notification with all required fields', async () => {
			const payload = {
				txStatusId: 'test-status-id',
				status: 'simulating' as const,
			};

			await notifyTransactionStatus(mockContext, payload);

			expect(mockNotify).toHaveBeenCalledOnce();
			expect(mockNotify).toHaveBeenCalledWith('aztec_transactionStatus', {
				txStatusId: 'test-status-id',
				status: 'simulating',
				timestamp: expect.any(Number),
			});
		});

		it('should include optional txHash when provided', async () => {
			const payload = {
				txStatusId: 'test-status-id',
				status: 'sending' as const,
				txHash: '0x1234567890abcdef',
			};

			await notifyTransactionStatus(mockContext, payload);

			expect(mockNotify).toHaveBeenCalledWith('aztec_transactionStatus', {
				txStatusId: 'test-status-id',
				status: 'sending',
				txHash: '0x1234567890abcdef',
				timestamp: expect.any(Number),
			});
		});

		it('should include error message when status is failed', async () => {
			const payload = {
				txStatusId: 'test-status-id',
				status: 'failed' as const,
				error: 'Transaction simulation failed',
			};

			await notifyTransactionStatus(mockContext, payload);

			expect(mockNotify).toHaveBeenCalledWith('aztec_transactionStatus', {
				txStatusId: 'test-status-id',
				status: 'failed',
				error: 'Transaction simulation failed',
				timestamp: expect.any(Number),
			});
		});

		it('should use provided timestamp if given', async () => {
			const customTimestamp = Date.now() - 5000;
			const payload = {
				txStatusId: 'test-status-id',
				status: 'proving' as const,
				timestamp: customTimestamp,
			};

			await notifyTransactionStatus(mockContext, payload);

			expect(mockNotify).toHaveBeenCalledWith('aztec_transactionStatus', {
				txStatusId: 'test-status-id',
				status: 'proving',
				timestamp: customTimestamp,
			});
		});

		it('should not send notification if ctx.notify is not a function', async () => {
			const contextWithoutNotify = {} as AztecHandlerContext;

			const payload = {
				txStatusId: 'test-status-id',
				status: 'simulating' as const,
			};

			await notifyTransactionStatus(contextWithoutNotify, payload);

			// Should not throw and should not call notify
			expect(mockNotify).not.toHaveBeenCalled();
		});

		it('should handle notification errors gracefully', async () => {
			mockNotify.mockRejectedValueOnce(new Error('Network error'));

			const payload = {
				txStatusId: 'test-status-id',
				status: 'simulating' as const,
			};

			// Should not throw despite notification failure
			await expect(notifyTransactionStatus(mockContext, payload)).resolves.not.toThrow();

			expect(mockNotify).toHaveBeenCalledOnce();
		});

		it('should send notifications for all transaction lifecycle stages', async () => {
			const statuses = ['simulating', 'proving', 'sending', 'pending', 'confirmed', 'failed'] as const;

			for (const status of statuses) {
				mockNotify.mockClear();

				await notifyTransactionStatus(mockContext, {
					txStatusId: 'test-id',
					status,
				});

				expect(mockNotify).toHaveBeenCalledWith('aztec_transactionStatus', {
					txStatusId: 'test-id',
					status,
					timestamp: expect.any(Number),
				});
			}
		});

		it('should handle rapid successive notifications', async () => {
			const notifications = [
				{ txStatusId: 'tx-1', status: 'simulating' as const },
				{ txStatusId: 'tx-1', status: 'proving' as const },
				{ txStatusId: 'tx-1', status: 'sending' as const },
				{ txStatusId: 'tx-1', status: 'pending' as const, txHash: '0xabc' },
			];

			for (const notification of notifications) {
				await notifyTransactionStatus(mockContext, notification);
			}

			expect(mockNotify).toHaveBeenCalledTimes(4);

			// Verify each notification was sent with correct data
			expect(mockNotify.mock.calls[0]?.[1]).toMatchObject({
				txStatusId: 'tx-1',
				status: 'simulating',
			});
			expect(mockNotify.mock.calls[1]?.[1]).toMatchObject({
				txStatusId: 'tx-1',
				status: 'proving',
			});
			expect(mockNotify.mock.calls[2]?.[1]).toMatchObject({
				txStatusId: 'tx-1',
				status: 'sending',
			});
			expect(mockNotify.mock.calls[3]?.[1]).toMatchObject({
				txStatusId: 'tx-1',
				status: 'pending',
				txHash: '0xabc',
			});
		});
	});
});

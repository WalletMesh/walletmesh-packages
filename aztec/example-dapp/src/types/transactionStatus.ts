/**
 * Transaction status values matching modal-core's TransactionStatus
 *
 * Uses Aztec-native terminology aligned with the official Aztec.js SDK:
 * - `simulating` maps to Aztec's simulate() method
 * - `proving` is unique to zero-knowledge systems
 * - `sending` maps to Aztec's send() method
 *
 * The transaction lifecycle follows this progression:
 * 1. `idle` - Initial state before any action
 * 2. `simulating` - Transaction is being simulated (maps to Aztec's simulate())
 * 3. `proving` - Zero-knowledge proof is being generated (Aztec only)
 * 4. `sending` - Transaction is being sent to the network (maps to Aztec's send())
 * 5. `pending` - Transaction submitted, awaiting network inclusion
 * 6. `confirming` - Transaction included, awaiting confirmations
 * 7. `confirmed` - Transaction has been confirmed on-chain
 * 8. `failed` - Transaction failed at any stage
 */
export type TransactionStatus =
  | 'idle'
  | 'simulating'
  | 'proving'
  | 'sending'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

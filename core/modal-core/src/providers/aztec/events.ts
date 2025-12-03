/**
 * Aztec event handling utilities
 *
 * Provides utilities for subscribing to and querying Aztec contract events,
 * both private (encrypted) and public events.
 *
 * @module providers/aztec/events
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { AztecDappWallet } from './types.js';

/**
 * Event subscription handle that can be used to unsubscribe
 *
 * @public
 */
export interface EventSubscription {
  /** Unique ID for this subscription */
  id: string;
  /** Function to call to unsubscribe */
  unsubscribe: () => void;
}

/**
 * Options for querying historical events
 *
 * @public
 */
export interface EventQueryOptions {
  /** Starting block number (inclusive) */
  fromBlock?: number;
  /** Ending block number (inclusive) */
  toBlock?: number;
  /** Maximum number of events to return */
  limit?: number;
  /** Filter by specific event topics/values */
  filter?: Record<string, unknown>;
}

/**
 * Subscribe to contract events in real-time
 *
 * This sets up a subscription to listen for new events emitted by a
 * contract. The callback will be invoked whenever a matching event
 * is detected. Returns an unsubscribe function to stop listening.
 *
 * Note: Real-time event subscriptions require polling in the current
 * Aztec architecture, so there may be a delay before events are received.
 *
 * @param wallet - The Aztec wallet instance
 * @param contractAddress - The contract address to watch
 * @param artifact - The contract artifact containing event definitions
 * @param eventName - Name of the event to subscribe to
 * @param callback - Function called when an event is detected
 * @returns A function to unsubscribe from the events
 *
 * @example
 * ```typescript
 * // Subscribe to Transfer events
 * const unsubscribe = await subscribeToEvents(
 *   wallet,
 *   tokenAddress,
 *   TokenArtifact,
 *   'Transfer',
 *   (event) => {
 *     console.log('Transfer event:', event);
 *     console.log('From:', event.from);
 *     console.log('To:', event.to);
 *     console.log('Amount:', event.amount);
 *   }
 * );
 *
 * // Later: stop listening
 * unsubscribe();
 * ```
 *
 * @public
 */
export async function subscribeToEvents(
  wallet: AztecDappWallet | null,
  contractAddress: unknown,
  artifact: unknown,
  eventName: string,
  callback: (event: unknown) => void,
): Promise<() => void> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Create a polling interval to check for new events
    let lastBlockChecked = await wallet.getBlockNumber();
    let isSubscribed = true;

    const pollInterval = setInterval(async () => {
      if (!isSubscribed) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const currentBlock = await wallet.getBlockNumber();

        if (currentBlock > lastBlockChecked) {
          // Query events from the last checked block to current
          const events = await queryEvents(wallet, contractAddress, artifact, eventName, {
            fromBlock: lastBlockChecked + 1,
            toBlock: currentBlock,
          });

          // Invoke callback for each event
          for (const event of events) {
            callback(event);
          }

          lastBlockChecked = currentBlock;
        }
      } catch (error) {
        console.error('Error polling for events:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to subscribe to events: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Query historical events from the blockchain
 *
 * This retrieves past events that match the specified criteria. You can
 * filter by block range and other parameters to find specific events.
 *
 * @param wallet - The Aztec wallet instance
 * @param contractAddress - The contract address
 * @param artifact - The contract artifact
 * @param eventName - Name of the event to query
 * @param options - Query options including block range
 * @returns Array of matching events
 *
 * @example
 * ```typescript
 * // Get all Transfer events from the last 100 blocks
 * const currentBlock = await wallet.getBlockNumber();
 * const events = await queryEvents(
 *   wallet,
 *   tokenAddress,
 *   TokenArtifact,
 *   'Transfer',
 *   {
 *     fromBlock: currentBlock - 100,
 *     toBlock: currentBlock,
 *   }
 * );
 *
 * console.log(`Found ${events.length} transfer events`);
 * ```
 *
 * @public
 */
export async function queryEvents(
  wallet: AztecDappWallet | null,
  _contractAddress: unknown,
  artifact: unknown,
  eventName: string,
  options: EventQueryOptions = {},
): Promise<unknown[]> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Get event metadata from artifact
    const eventMetadata = getEventMetadata(artifact, eventName);
    if (!eventMetadata) {
      throw ErrorFactory.notFound(`Event ${eventName} not found in contract artifact`);
    }

    // Determine block range
    const currentBlock = await wallet.getBlockNumber();
    const fromBlock = options.fromBlock ?? Math.max(0, currentBlock - 100); // Default: last 100 blocks
    const toBlock = options.toBlock ?? currentBlock;
    const numBlocks = toBlock - fromBlock + 1;

    // Query events using the wallet's RPC methods
    // For now, we'll use public events - private events would need recipient addresses
    // Use type assertion for wallet methods
    const walletWithEvents = wallet as unknown as {
      getPublicEvents: (metadata: unknown, fromBlock: number, limit: number) => Promise<unknown[]>;
    };
    const events = await walletWithEvents.getPublicEvents(
      eventMetadata,
      fromBlock,
      options.limit ?? numBlocks * 10, // Rough estimate of max events
    );

    return events;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to query events: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Query private (encrypted) events from the blockchain
 *
 * Private events are encrypted and can only be decrypted by the specified
 * recipients. This function queries such events for the current account.
 *
 * @param wallet - The Aztec wallet instance
 * @param contractAddress - The contract address
 * @param artifact - The contract artifact
 * @param eventName - Name of the private event
 * @param recipients - Array of recipient addresses that can decrypt the events
 * @param options - Query options including block range
 * @returns Array of decrypted events
 *
 * @example
 * ```typescript
 * // Get private Transfer events where we are a recipient
 * const myAddress = wallet.getAddress();
 * const events = await queryPrivateEvents(
 *   wallet,
 *   tokenAddress,
 *   TokenArtifact,
 *   'PrivateTransfer',
 *   [myAddress],
 *   { fromBlock: 1000 }
 * );
 * ```
 *
 * @public
 */
export async function queryPrivateEvents(
  wallet: AztecDappWallet | null,
  contractAddress: unknown,
  artifact: unknown,
  eventName: string,
  recipients: unknown[],
  options: EventQueryOptions = {},
): Promise<unknown[]> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Get event metadata from artifact
    const eventMetadata = getEventMetadata(artifact, eventName);
    if (!eventMetadata) {
      throw ErrorFactory.notFound(`Event ${eventName} not found in contract artifact`);
    }

    // Determine block range
    const currentBlock = await wallet.getBlockNumber();
    const fromBlock = options.fromBlock ?? Math.max(0, currentBlock - 100);
    const numBlocks = (options.toBlock ?? currentBlock) - fromBlock + 1;

    // Query private events
    // Use type assertion for wallet methods
    const walletWithPrivateEvents = wallet as unknown as {
      getPrivateEvents: (
        address: unknown,
        metadata: unknown,
        fromBlock: number,
        numBlocks: number,
        recipients: unknown[],
      ) => Promise<unknown[]>;
    };
    const events = await walletWithPrivateEvents.getPrivateEvents(
      contractAddress,
      eventMetadata,
      fromBlock,
      numBlocks,
      recipients,
    );

    return events;
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to query private events: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Helper to extract event metadata from a contract artifact
 *
 * @param artifact - The contract artifact
 * @param eventName - Name of the event
 * @returns Event metadata or undefined if not found
 *
 * @internal
 */
function getEventMetadata(artifact: unknown, eventName: string): unknown | undefined {
  // Navigate the artifact structure to find event metadata
  // The exact structure depends on the Noir contract compilation
  const artifactWithEvents = artifact as { events?: Record<string, unknown> };
  if (artifactWithEvents.events?.[eventName]) {
    return artifactWithEvents.events[eventName];
  }

  // Alternative location in some artifact formats
  const artifactWithAbi = artifact as {
    abi?: { events?: Array<{ name: string }> };
  };
  if (artifactWithAbi.abi?.events) {
    const event = artifactWithAbi.abi.events.find((e: { name: string }) => e.name === eventName);
    return event;
  }

  return undefined;
}

/**
 * Get a list of all events defined in a contract artifact
 *
 * This utility helps discover what events are available for a contract.
 *
 * @param artifact - The contract artifact
 * @returns Array of event names
 *
 * @example
 * ```typescript
 * const eventNames = getContractEvents(TokenArtifact);
 * console.log('Available events:', eventNames);
 * // Output: ['Transfer', 'Approval', 'Mint', 'Burn']
 * ```
 *
 * @public
 */
export function getContractEvents(artifact: unknown): string[] {
  const eventNames: string[] = [];

  // Check direct events property
  const artifactWithEvents = artifact as { events?: Record<string, unknown> };
  if (artifactWithEvents.events) {
    eventNames.push(...Object.keys(artifactWithEvents.events));
  }

  // Check ABI events
  const artifactWithAbi = artifact as {
    abi?: { events?: Array<{ name: string }> };
  };
  if (artifactWithAbi.abi?.events) {
    const abiEventNames = artifactWithAbi.abi.events.map((e) => e.name);
    // Add only unique names
    for (const name of abiEventNames) {
      if (!eventNames.includes(name)) {
        eventNames.push(name);
      }
    }
  }

  return eventNames;
}

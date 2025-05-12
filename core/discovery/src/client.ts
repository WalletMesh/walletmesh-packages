import type {
  WalletInfo,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryAckEvent,
} from './types.js';
import { isDiscoveryRequestEvent, isDiscoveryAckEvent, isWalletInfo } from './guards.js';
import { WM_PROTOCOL_VERSION, WmDiscovery } from './constants.js';

/**
 * Factory method to create a DiscoveryAnnouncer for web wallets.
 *
 * @param {string} name - The name of the wallet
 * @param {string} icon - Base64 data URI of the wallet's icon
 * @param {string} rdns - Reverse DNS identifier for the wallet
 * @param {string} url - URL of the web wallet
 * @param {string[]} [supportedTechnologies] - Optional list of supported blockchain technologies
 * @param {(origin: string) => boolean} [callback] - Optional callback for origin validation
 *
 * @returns {DiscoveryAnnouncer} An instantiated DiscoveryAnnouncer object for web wallets
 */
export function createWebWalletAnnouncer(
  name: string,
  icon: string,
  rdns: string,
  url: string,
  supportedTechnologies?: string[],
  callback?: (origin: string) => boolean,
): DiscoveryAnnouncer {
  const walletInfo: WalletInfo = { name, icon, rdns, url };
  const options = {
    walletInfo,
    ...(supportedTechnologies ? { supportedTechnologies } : {}),
    ...(callback ? { callback } : {}),
  };
  return new DiscoveryAnnouncer(options);
}

/**
 * Factory method to create a DiscoveryAnnouncer for extension wallets.
 *
 * @param {string} name - The name of the wallet
 * @param {string} icon - Base64 data URI of the wallet's icon
 * @param {string} rdns - Reverse DNS identifier for the wallet
 * @param {string[]} [supportedTechnologies] - Optional list of supported blockchain technologies
 * @param {string} [extensionId] - Optional browser extension ID
 * @param {string} [code] - Optional verification code for extension communication
 * @param {(origin: string) => boolean} [callback] - Optional callback for origin validation
 *
 * @returns {DiscoveryAnnouncer} An instantiated DiscoveryAnnouncer object for extension wallets
 */
export function createExtensionWalletAnnouncer(
  name: string,
  icon: string,
  rdns: string,
  supportedTechnologies?: string[],
  extensionId?: string,
  code?: string,
  callback?: (origin: string) => boolean,
): DiscoveryAnnouncer {
  if (!extensionId && !code) {
    throw new Error('Extension ID or code is required for extension wallets');
  }

  const walletInfo: WalletInfo = { name, icon, rdns, extensionId, code };
  const options = {
    walletInfo,
    ...(supportedTechnologies ? { supportedTechnologies } : {}),
    ...(callback ? { callback } : {}),
  };
  return new DiscoveryAnnouncer(options);
}

/**
 * Options for initializing a DiscoveryAnnouncer.
 *
 * @interface DiscoveryAnnouncerOptions
 * @property {WalletInfo} walletInfo - Information about the wallet to announce
 * @property {string[]} [supportedTechnologies] - Optional list of supported technologies
 * @property {(origin: string) => boolean} [callback] - Optional callback for origin validation
 * @property {EventTarget} [eventTarget] - Optional custom event target (defaults to window)
 */
export interface DiscoveryAnnouncerOptions {
  walletInfo: WalletInfo;
  supportedTechnologies?: string[];
  callback?: ((origin: string) => boolean) | undefined;
  eventTarget?: EventTarget;
}

/**
 * Class representing a DiscoveryAnnouncer.
 *
 * The DiscoveryAnnouncer announces wallet information, listens for discovery requests,
 * and acknowledges discovery events.
 *
 * @class
 */
export class DiscoveryAnnouncer {
  private walletInfo: WalletInfo;
  private supportedTechnologies: string[];
  private callback: ((origin: string) => boolean) | null;
  private eventTarget: EventTarget;
  private sessionId: string;
  private pendingDiscoveryIds = new Set<string>();
  private acknowledgedDiscoveryIds = new Set<string>();

  /**
   * Creates an instance of the client.
   *
   * @param {DiscoveryAnnouncerOptions} options - The options to initialize the DiscoveryAnnouncer.
   */
  constructor({ walletInfo, supportedTechnologies, callback, eventTarget }: DiscoveryAnnouncerOptions) {
    // Early validation to ensure walletInfo has an icon property
    if (!walletInfo?.icon || typeof walletInfo.icon !== 'string') {
      throw new Error('Invalid walletInfo: icon is required and must be a string');
    }

    if (!walletInfo.icon.startsWith('data:')) {
      throw new Error('Invalid walletInfo: icon must be a data URI');
    }

    if (!isWalletInfo(walletInfo)) {
      throw new Error(`Invalid walletInfo: ${JSON.stringify(walletInfo)}`);
    }

    this.walletInfo = walletInfo;
    this.supportedTechnologies = supportedTechnologies ?? [];
    this.callback = callback ?? null;
    this.eventTarget = eventTarget ?? window;
    this.sessionId = crypto.randomUUID();
  }

  /**
   * Starts the client by initializing event listeners and dispatching a ready event.
   *
   * This method performs the following actions:
   * 1. Initializes the event listeners required for handling discovery events.
   * 2. Dispatches a ready event to signal that the client is ready to receive discovery requests.
   *
   * @returns {void}
   */
  start = (): void => {
    this.startEventListeners();
    this.dispatchDiscoveryReadyEvent();
  };

  /**
   * Stops the client by removing event listeners and clearing internal state.
   *
   * This method performs the following actions:
   * 1. Removes the event listeners to stop handling discovery events.
   * 2. Clears the sets of pending and acknowledged discovery IDs.
   *
   * @returns {void}
   */
  stop = (): void => {
    this.stopEventListeners();
    this.pendingDiscoveryIds.clear();
    this.acknowledgedDiscoveryIds.clear();
  };

  /**
   * Initializes and starts the event listeners for handling discovery events.
   *
   * This method performs the following actions:
   * 1. Adds an event listener for the 'Request' event to handle discovery requests.
   * 2. Adds an event listener for the 'Ack' event to handle discovery acknowledgments.
   *
   * @returns {void}
   * @private
   */
  private startEventListeners = () => {
    this.eventTarget.addEventListener(WmDiscovery.Request, this.handleDiscoveryRequestEvent as EventListener);
    this.eventTarget.addEventListener(WmDiscovery.Ack, this.handleDiscoveryAckEvent as EventListener);
  };

  /**
   * Stops the event listeners for handling discovery events.
   *
   * This method performs the following actions:
   * 1. Removes the event listener for the 'Request' event to stop handling discovery requests.
   * 2. Removes the event listener for the 'Ack' event to stop handling discovery acknowledgments.
   *
   * @returns {void}
   * @private
   */
  private stopEventListeners = () => {
    this.eventTarget.removeEventListener(
      WmDiscovery.Request,
      this.handleDiscoveryRequestEvent as EventListener,
    );

    this.eventTarget.removeEventListener(WmDiscovery.Ack, this.handleDiscoveryAckEvent as EventListener);
  };

  /**
   * Handles the 'Request' event for discovery requests.
   *
   * This method performs the following actions:
   * 1. Validates the discovery request event.
   * 2. Checks if the discovery request has already been acknowledged.
   * 3. Validates any required technologies against supported technologies.
   * 4. Dispatches a response event if all validations pass.
   *
   * @param {CustomEvent<DiscoveryRequestEvent>} event - The discovery request event to handle.
   * @returns {void}
   * @private
   */
  private handleDiscoveryRequestEvent = (event: CustomEvent<DiscoveryRequestEvent>) => {
    const request = event.detail;
    if (!isDiscoveryRequestEvent(request)) {
      return;
    }

    const { discoveryId, technologies } = request;

    if (this.acknowledgedDiscoveryIds.has(discoveryId)) {
      return;
    }

    if (this.callback && !this.callback(window.origin)) {
      return;
    }

    // Filter technologies to only those we support
    if (technologies && this.supportedTechnologies.length > 0) {
      const matchingTechnologies = technologies.filter((tech) =>
        this.supportedTechnologies.some((supported) => supported.toLowerCase() === tech.toLowerCase()),
      );

      if (matchingTechnologies.length === 0) {
        return;
      }

      // Keep case from request
      this.dispatchDiscoveryResponseEvent(discoveryId, matchingTechnologies);
    } else {
      this.dispatchDiscoveryResponseEvent(discoveryId, []);
    }
  };

  /**
   * Handles the 'Ack' event for discovery acknowledgments.
   *
   * This method performs the following actions:
   * 1. Validates the discovery acknowledgment event.
   * 2. Checks if the acknowledgment is for a pending discovery request.
   * 3. Updates internal state to mark the discovery request as acknowledged.
   *
   * @param {CustomEvent<DiscoveryAckEvent>} event - The discovery acknowledgment event to handle.
   * @returns {void}
   * @private
   */
  private handleDiscoveryAckEvent = (event: CustomEvent<DiscoveryAckEvent>) => {
    const ack = event.detail;
    if (!isDiscoveryAckEvent(ack)) {
      return;
    }

    const { discoveryId, walletId } = ack;
    if (!this.pendingDiscoveryIds.has(discoveryId) || walletId !== this.sessionId) {
      return;
    }

    this.pendingDiscoveryIds.delete(discoveryId);
    this.acknowledgedDiscoveryIds.add(discoveryId);
  };

  /**
   * Dispatches a `DiscoveryReadyEvent` to the event target.
   *
   * This method creates and dispatches a custom event of type `WmDiscovery.Ready`
   * to signal that the client is ready to receive discovery requests.
   *
   * @returns {void}
   * @private
   */
  private dispatchDiscoveryReadyEvent = (): void => {
    this.eventTarget.dispatchEvent(new CustomEvent(WmDiscovery.Ready));
  };

  /**
   * Dispatches a `DiscoveryResponseEvent` to the event target.
   *
   * This method performs the following actions:
   * 1. Creates a response event with the wallet information and matching technologies.
   * 2. Adds the discovery ID to the pending set.
   * 3. Dispatches the response event.
   *
   * @param {string} discoveryId - The ID of the discovery request being responded to.
   * @param {string[]} matchingTechnologies - The list of matching technologies to include in the response.
   *
   * @returns {void}
   * @private
   */
  private dispatchDiscoveryResponseEvent = (discoveryId: string, matchingTechnologies: string[]): void => {
    // Create a shallow copy of wallet info
    const walletInfo = { ...this.walletInfo };

    // Only include technologies if there are matches
    if (matchingTechnologies.length > 0) {
      walletInfo.technologies = matchingTechnologies;
    }

    const detail: DiscoveryResponseEvent = {
      version: WM_PROTOCOL_VERSION,
      discoveryId,
      wallet: walletInfo,
      walletId: this.sessionId,
    };

    this.pendingDiscoveryIds.add(discoveryId);

    this.eventTarget.dispatchEvent(new CustomEvent<DiscoveryResponseEvent>(WmDiscovery.Response, { detail }));
  };
}

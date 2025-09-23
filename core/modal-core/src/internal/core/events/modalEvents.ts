/**
 * Modal-related events for UI state changes
 *
 * This module defines the event types and interfaces for modal UI state transitions.
 * These events enable reactive UI updates and state synchronization across components.
 *
 * ## Event Flow
 *
 * 1. **Opening → Opened**: Modal initialization and display
 * 2. **ViewChanging → ViewChanged**: Navigation between modal views
 * 3. **Closing → Closed**: Modal teardown and cleanup
 * 4. **Error**: Exception handling during any phase
 *
 * ## Usage
 *
 * ```typescript
 * // Listen for modal lifecycle
 * emitter.on(ModalEventType.Opening, () => {
 *   prepareModalAnimation();
 * });
 *
 * emitter.on(ModalEventType.Opened, () => {
 *   focusFirstElement();
 *   trackModalOpen();
 * });
 *
 * // Handle view navigation
 * emitter.on(ModalEventType.ViewChanging, (event) => {
 *   if (event.cancelable && !canNavigate(event.toView)) {
 *     event.preventDefault();
 *   }
 * });
 * ```
 *
 * @module modalEvents
 * @internal
 */

/**
 * Base interface for all modal events
 *
 * Provides a common structure for all modal events with a discriminated
 * union pattern using the `type` field for type narrowing.
 *
 * @interface BaseEvent
 * @internal
 */
interface BaseEvent {
  /**
   * Type of the event - used for discriminated unions
   * @type {string}
   */
  type: string;
}

/**
 * All possible modal event types
 *
 * Defines the complete set of events that can occur during modal interactions.
 * Events are organized by lifecycle phase and user interactions.
 *
 * @example
 * ```typescript
 * // Type-safe event handling
 * switch (event.type) {
 *   case ModalEventType.Opening:
 *     showLoadingState();
 *     break;
 *   case ModalEventType.Error:
 *     displayError(event.error);
 *     break;
 * }
 * ```
 *
 * @enum {string}
 * @readonly
 */
export enum ModalEventType {
  /** Modal is about to open */
  Opening = 'opening',
  /** Modal opened successfully */
  Opened = 'opened',
  /** Modal is about to close */
  Closing = 'closing',
  /** Modal closed */
  Closed = 'closed',
  /** View is changing */
  ViewChanging = 'viewChanging',
  /** View changed */
  ViewChanged = 'viewChanged',
  /** Error in modal */
  Error = 'error',
}

/**
 * Event fired when modal starts opening
 * @interface OpeningEvent
 * @extends {BaseEvent}
 */
export interface OpeningEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.Opening}
   */
  type: ModalEventType.Opening;
}

/**
 * Event fired when modal is fully opened
 * @interface OpenedEvent
 * @extends {BaseEvent}
 */
export interface OpenedEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.Opened}
   */
  type: ModalEventType.Opened;
}

/**
 * Event fired when modal starts closing
 * @interface ClosingEvent
 * @extends {BaseEvent}
 */
export interface ClosingEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.Closing}
   */
  type: ModalEventType.Closing;
}

/**
 * Event fired when modal is fully closed
 * @interface ClosedEvent
 * @extends {BaseEvent}
 */
export interface ClosedEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.Closed}
   */
  type: ModalEventType.Closed;
}

/**
 * Event fired when the modal view is about to change
 *
 * This event allows for view transition validation and cancellation.
 * Use the cancelable flag to determine if preventDefault is supported.
 *
 * @example
 * ```typescript
 * emitter.on(ModalEventType.ViewChanging, (event) => {
 *   // Validate navigation
 *   if (event.fromView === 'connecting' && event.toView === 'walletSelection') {
 *     if (event.cancelable && isConnectionInProgress()) {
 *       event.preventDefault(); // Prevent going back during connection
 *     }
 *   }
 *
 *   // Prepare transition animation
 *   prepareViewTransition(event.fromView, event.toView);
 * });
 * ```
 *
 * @interface ViewChangingEvent
 * @extends {BaseEvent}
 */
export interface ViewChangingEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.ViewChanging}
   */
  type: ModalEventType.ViewChanging;
  /**
   * Current view being navigated from
   * @type {string}
   */
  fromView: string;
  /**
   * New view being navigated to
   * @type {string}
   */
  toView: string;
  /**
   * Whether the view change can be prevented
   * @type {boolean}
   */
  cancelable: boolean;
}

/**
 * Event fired when the modal view has changed
 * @interface ViewChangedEvent
 * @extends {BaseEvent}
 */
export interface ViewChangedEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.ViewChanged}
   */
  type: ModalEventType.ViewChanged;
  /**
   * Previous view that was displayed
   * @type {string}
   */
  previousView: string;
  /**
   * Current view now displayed
   * @type {string}
   */
  currentView: string;
}

/**
 * Event fired when an error occurs in the modal
 * @interface ModalErrorEvent
 * @extends {BaseEvent}
 */
export interface ModalErrorEvent extends BaseEvent {
  /**
   * Event type identifier
   * @type {ModalEventType.Error}
   */
  type: ModalEventType.Error;
  /**
   * Error that occurred
   * @type {Error}
   */
  error: Error;
}

/**
 * Union type of all modal events
 *
 * Discriminated union enabling type-safe event handling with TypeScript.
 * Use the `type` property to narrow the event type and access specific properties.
 *
 * @example
 * ```typescript
 * function handleModalEvent(event: ModalEvent) {
 *   switch (event.type) {
 *     case ModalEventType.ViewChanging:
 *       // TypeScript knows this is ViewChangingEvent
 *       console.log(`Navigating from ${event.fromView} to ${event.toView}`);
 *       break;
 *     case ModalEventType.Error:
 *       // TypeScript knows this is ModalErrorEvent
 *       console.error('Modal error:', event.error);
 *       break;
 *   }
 * }
 *
 * // Type guard function
 * function isViewEvent(event: ModalEvent): event is ViewChangingEvent | ViewChangedEvent {
 *   return event.type === ModalEventType.ViewChanging ||
 *          event.type === ModalEventType.ViewChanged;
 * }
 * ```
 *
 * @typedef {(OpeningEvent|OpenedEvent|ClosingEvent|ClosedEvent|ViewChangingEvent|ViewChangedEvent|ModalErrorEvent)} ModalEvent
 */
export type ModalEvent =
  | OpeningEvent
  | OpenedEvent
  | ClosingEvent
  | ClosedEvent
  | ViewChangingEvent
  | ViewChangedEvent
  | ModalErrorEvent;

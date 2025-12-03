import { formatError } from '@walletmesh/modal-core';
import { useAccount, useWalletEvents } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';

interface EventLogEntry {
  id: string;
  type: string;
  timestamp: string;
  isError?: boolean;
  data: unknown;
}

export function EventLogger() {
  const { isConnecting } = useAccount();
  const [events, setEvents] = useState<EventLogEntry[]>([]);

  // Debug log
  console.log('[EventLogger] Current events:', events.length, 'isConnecting:', isConnecting);

  // Add a test event when component mounts to verify event system
  useEffect(() => {
    // Add a manual test event to verify the event display works
    const testEvent = {
      id: `test-${Date.now()}`,
      type: 'test:component:mounted',
      timestamp: new Date().toLocaleTimeString(),
      isError: false,
      data: { message: 'EventLogger component mounted - waiting for wallet events' },
    };
    setEvents([testEvent]);
  }, []);

  // Create a generic event handler
  const addEventLog = useCallback((type: string, data: unknown, isError = false) => {
    console.log(`[EventLogger] Event received: ${type}`, data);
    const newEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      timestamp: new Date().toLocaleTimeString(),
      isError,
      data,
    };
    setEvents((prev) => [...prev.slice(-19), newEvent]); // Keep last 20 events
  }, []);

  // Create stable event handlers
  const handleConnectionInitiated = useCallback(
    (data: unknown) => {
      addEventLog('connection:initiated', data);
    },
    [addEventLog],
  );

  const handleConnectionEstablished = useCallback(
    (data: unknown) => {
      addEventLog('connection:established', data);
    },
    [addEventLog],
  );

  const handleConnectionFailed = useCallback(
    (data: unknown) => {
      addEventLog('connection:failed', data, true);
    },
    [addEventLog],
  );

  // Subscribe to all events using a single useWalletEvents call
  useWalletEvents({
    'connection:initiated': handleConnectionInitiated,
    'connection:established': handleConnectionEstablished,
    'connection:failed': handleConnectionFailed,
  });

  const connectionEvents = {
    isConnecting,
    lastConnection: events.find((e) => e.type === 'connection:established'),
    lastError: events.find((e) => e.isError),
  };

  const clear = () => {
    setEvents([]);
  };

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Event Logger
        <button
          type="button"
          onClick={() => clear()}
          style={{
            marginLeft: '12px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            // Manually add a test event
            const testEvent = {
              id: `manual-${Date.now()}`,
              type: 'test:manual:click',
              timestamp: new Date().toLocaleTimeString(),
              isError: false,
              data: { message: 'Manual test event' },
            };
            setEvents((prev) => [...prev, testEvent]);
          }}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test Event
        </button>
      </h2>

      {/* Connection Status from Events */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
        <div style={{ fontSize: '14px' }}>
          <div>Is Connecting: {connectionEvents.isConnecting ? 'Yes' : 'No'}</div>
          {connectionEvents.lastConnection && (
            <div>Last Connected: {connectionEvents.lastConnection.timestamp || 'N/A'}</div>
          )}
          {connectionEvents.lastError && (
            <div style={{ color: '#EF4444' }}>
              Last Error:{' '}
              {connectionEvents.lastError
                ? formatError(connectionEvents.lastError.data).message
                : 'Unknown error'}
            </div>
          )}
        </div>
      </div>

      {/* Event Log */}
      <div
        style={{
          backgroundColor: '#1F2937',
          color: '#F9FAFB',
          padding: '12px',
          borderRadius: '4px',
          maxHeight: '300px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        {events.length === 0 ? (
          <div style={{ color: '#6B7280' }}>No events captured yet. Try connecting a wallet!</div>
        ) : (
          events.map((event: EventLogEntry) => (
            <div
              key={event.id}
              style={{
                marginBottom: '8px',
                borderBottom: '1px solid #374151',
                paddingBottom: '8px',
                color: event.isError ? '#EF4444' : '#F9FAFB',
              }}
            >
              <div style={{ color: event.isError ? '#EF4444' : '#10B981' }}>
                [{event.timestamp}] {event.type}
              </div>
              <pre
                style={{
                  margin: '4px 0 0 0',
                  color: '#D1D5DB',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

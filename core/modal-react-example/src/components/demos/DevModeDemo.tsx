import { useAccount, useConnect } from '@walletmesh/modal-react/all';
import { useState } from 'react';

export function DevModeDemo() {
  const [performanceResults, setPerformanceResults] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { connect } = useConnect();
  const { isConnected } = useAccount();

  // Trigger performance measurement
  const testPerformanceMeasurement = async () => {
    setPerformanceResults(['Testing performance measurement...']);

    // This will trigger performance measurements if devMode is enabled
    try {
      if (!isConnected) {
        await connect();
      }
      setPerformanceResults((prev) => [...prev, 'Check console for performance measurements!']);
    } catch (error) {
      setPerformanceResults((prev) => [...prev, `Error: ${error}`]);
    }
  };

  // Test validation with invalid wallet info
  const testValidation = () => {
    setValidationError(null);

    try {
      // This would normally be internal, but we're demonstrating validation
      // In real usage, this would happen internally when invalid data is passed
      const invalidWallet = {
        id: 123, // Should be string
        name: null, // Should be string
        icon: true, // Should be string
        chains: 'evm', // Should be array
      };

      // Simulate what would happen internally
      if (typeof invalidWallet.id !== 'string') {
        throw new Error('Validation Error: id must be a string, got number');
      }
    } catch (error) {
      setValidationError((error as Error).message);
    }
  };

  // Test state tracking
  const testStateTracking = () => {
    if (window.__WALLETMESH_DEV__) {
      const history = window.__WALLETMESH_DEV__.getStateHistory();
      console.log('📊 Current State History:', history);
      alert(`State history has ${history.length} entries. Check console for details!`);
    } else {
      alert('DevMode is not enabled!');
    }
  };

  // Test event logging
  const testEventLogging = () => {
    if (window.__WALLETMESH_DEV__) {
      const events = window.__WALLETMESH_DEV__.getEventLog();
      console.log('📋 Current Event Log:', events);
      alert(`Event log has ${events.length} entries. Check console for details!`);
    } else {
      alert('DevMode is not enabled!');
    }
  };

  // Generate error report
  const generateErrorReport = async () => {
    try {
      // Simulate an error
      throw new Error('Simulated error for debugging demonstration');
    } catch (error) {
      console.error('🚨 Error Report:', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        context: {
          demo: 'DevModeDemo',
          action: 'generateErrorReport',
        },
      });
      alert('Error report generated! Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>🛠️ DevMode Features Demo</h3>

      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
        This demo showcases the development mode features available in WalletMesh. DevMode provides enhanced
        debugging, validation, and performance monitoring capabilities.
      </p>

      {/* DevMode Status */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: window.__WALLETMESH_DEV_MODE__ ? '#d1fae5' : '#fee2e2',
          borderRadius: '8px',
          border: `1px solid ${window.__WALLETMESH_DEV_MODE__ ? '#10b981' : '#ef4444'}`,
        }}
      >
        <strong>DevMode Status:</strong>{' '}
        {window.__WALLETMESH_DEV_MODE__ ? (
          <span style={{ color: '#10b981' }}>✅ Enabled</span>
        ) : (
          <span style={{ color: '#ef4444' }}>❌ Disabled</span>
        )}
      </div>

      {/* Feature Demos */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {/* Performance Monitoring */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
            ⚡ Performance Monitoring
          </h4>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
            DevMode automatically measures execution time of key operations.
          </p>
          <button
            type="button"
            onClick={testPerformanceMeasurement}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Test Performance Measurement
          </button>
          {performanceResults.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
              {performanceResults.map((result) => (
                <div key={result}>{result}</div>
              ))}
            </div>
          )}
        </div>

        {/* Input Validation */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>✅ Strict Validation</h4>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
            DevMode provides detailed validation errors for invalid data.
          </p>
          <button
            type="button"
            onClick={testValidation}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Test Invalid Wallet Validation
          </button>
          {validationError && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#fee2e2',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#dc2626',
              }}
            >
              {validationError}
            </div>
          )}
        </div>

        {/* State Tracking */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
            📊 State Change Tracking
          </h4>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
            DevMode tracks modal state changes for debugging.
          </p>
          <button
            type="button"
            onClick={testStateTracking}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View State History
          </button>
        </div>

        {/* Event Logging */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>📋 Event Logging</h4>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
            DevMode logs all significant events for analysis.
          </p>
          <button
            type="button"
            onClick={testEventLogging}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Event Log
          </button>
        </div>

        {/* Error Reporting */}
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>🚨 Error Reporting</h4>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
            Generate detailed error reports with context.
          </p>
          <button
            type="button"
            onClick={generateErrorReport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Generate Error Report
          </button>
        </div>
      </div>

      {/* Code Example */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#f3f4f6' }}>
          💻 Code Example
        </h4>
        <pre
          style={{
            margin: 0,
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#e5e7eb',
            overflow: 'auto',
          }}
        >
          {`// Enable DevMode in your HTML
<script>
  window.__WALLETMESH_DEV_MODE__ = true;
</script>

// Access DevMode features
if (window.__WALLETMESH_DEV__) {
  // Get configuration
  const config = window.__WALLETMESH_DEV__.config;
  
  // View state history
  const history = window.__WALLETMESH_DEV__.getStateHistory();
  
  // View event log
  const events = window.__WALLETMESH_DEV__.getEventLog();
  
  // Update configuration
  window.__WALLETMESH_DEV__.setConfig({
    verboseLogging: true,
    performanceMonitoring: true
  });
  
  // Clear history
  window.__WALLETMESH_DEV__.clearHistory();
}`}
        </pre>
      </div>
    </div>
  );
}

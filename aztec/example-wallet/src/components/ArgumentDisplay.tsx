import { type EnhancedParameterInfo, formatArgumentValue } from '@walletmesh/aztec-helpers';
import type React from 'react';
import { useState } from 'react';

type ArgumentDisplayProps = {
  value: unknown;
  paramInfo: EnhancedParameterInfo;
};

/**
 * Component for displaying a single function argument with type-aware formatting.
 *
 * Shows parameter name, type, and formatted value with the ability to toggle
 * between formatted and raw views. Includes a copy button for copyable values.
 */
const ArgumentDisplay: React.FC<ArgumentDisplayProps> = ({ value, paramInfo }) => {
  const [showRaw, setShowRaw] = useState(false);
  const formatted = formatArgumentValue(value, paramInfo.abiType);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleToggle = () => {
    setShowRaw(!showRaw);
  };

  return (
    <div className="argument-display" style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold' }}>{paramInfo.name}</span>
        <span style={{ color: '#666', fontSize: '0.9em' }}>({paramInfo.typeString})</span>
        {formatted.copyable && (
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: '0.8em',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              background: copied ? '#4CAF50' : '#f0f0f0',
              color: copied ? 'white' : 'black',
            }}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
        {formatted.display !== formatted.raw && (
          <button
            type="button"
            onClick={handleToggle}
            style={{
              fontSize: '0.8em',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              background: '#f0f0f0',
            }}
            title={showRaw ? 'Show formatted' : 'Show raw value'}
          >
            {showRaw ? 'Formatted' : 'Raw'}
          </button>
        )}
      </div>
      <div
        style={{
          fontFamily: 'monospace',
          background: '#f5f5f5',
          padding: '0.5rem',
          borderRadius: '3px',
          marginTop: '0.25rem',
          wordBreak: 'break-all',
        }}
      >
        {showRaw ? formatted.raw : formatted.display}
      </div>
    </div>
  );
};

export default ArgumentDisplay;

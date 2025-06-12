import { useState, type FC } from 'react';
import { jsonStringify } from '@aztec/foundation/json-rpc';
import './ParameterDisplay.css';

/**
 * Props for the ParameterDisplay component
 */
interface ParameterDisplayProps {
  /** The parameters to display */
  params: unknown;
  /** Optional title for the parameters section */
  title?: string;
  /** Optional maximum length before truncation (default: 200) */
  maxLength?: number;
}

/**
 * Component to display RPC parameters with expand/collapse functionality
 * and copy-to-clipboard feature.
 */
export const ParameterDisplay: FC<ParameterDisplayProps> = ({ 
  params, 
  title = 'Parameters',
  maxLength = 200 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (params === undefined || params === null) {
    return null;
  }

  // Extract the actual parameters from the RPC structure
  let displayParams = params;
  let paramString: string;

  // Check if this is a wrapped RPC parameter with serialized content
  if (typeof params === 'object' && params !== null && 'serialized' in params) {
    const serialized = (params as any).serialized;
    if (typeof serialized === 'string') {
      try {
        // Parse the serialized JSON string
        displayParams = JSON.parse(serialized);
        // Pretty print the parsed object
        paramString = JSON.stringify(displayParams, null, 2);
      } catch (e) {
        // If parsing fails, use the original serialized string
        paramString = serialized;
      }
    } else {
      paramString = jsonStringify(params);
    }
  } else {
    paramString = jsonStringify(params);
  }

  const isLarge = paramString.length > maxLength;
  const displayString = isLarge && !isExpanded
    ? paramString.slice(0, maxLength) + '...'
    : paramString;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paramString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
    }
  };

  return (
    <div className="params-display">
      <p className="request-details">
        <b>{title}:</b>
        <span className="params-actions">
          {isLarge && (
            <button
              className="params-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            className="params-button"
            onClick={handleCopy}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </span>
      </p>
      <pre className="params-content">{displayString}</pre>
    </div>
  );
};

export default ParameterDisplay;
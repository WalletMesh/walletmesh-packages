import React from 'react';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware';

type FunctionCall = {
  to?: { toString: () => string } | string; // New structure uses 'to' instead of 'contractAddress'
  contractAddress?: string; // Keep for backward compatibility
  name?: string; // New structure uses 'name' instead of 'functionName'
  functionName?: string; // Keep for backward compatibility
  args: unknown[];
};

type FunctionCallDisplayProps = {
  call: FunctionCall;
  functionArgNames?: FunctionArgNames;
  isDeployment?: boolean;
};

const formatParameterValue = (value: unknown) => {
  if (typeof value === 'number' || typeof value === 'bigint') {
    // For numbers and BigInts
    const decimalValue = Number(value).toLocaleString();
    const hexValue = `0x${BigInt(value).toString(16)}`;
    return `${decimalValue} (Hex: ${hexValue})`;
  } else if (
    value &&
    typeof value === 'object' &&
    typeof value.toString === 'function' &&
    /^\d+$/.test(value.toString())
  ) {
    // For objects with numeric toString output
    const decimalValue = BigInt(value.toString()).toLocaleString();
    const hexValue = `0x${BigInt(value.toString()).toString(16)}`;
    return `${decimalValue} (Hex: ${hexValue})`;
  } else {
    // For other types, just stringify
    return String(value);
  }
};

const FunctionCallDisplay: React.FC<FunctionCallDisplayProps> = ({
  call,
  functionArgNames,
  isDeployment,
}) => {
  // Handle both old and new property names
  const contractAddress =
    call.contractAddress || (call.to ? (typeof call.to === 'string' ? call.to : call.to.toString()) : '');
  const functionName = call.functionName || call.name || 'unknown';

  // For deployments, use special handling
  const parameterNames = isDeployment
    ? functionArgNames?.['__deployment__']?.[functionName] || []
    : functionArgNames?.[contractAddress]?.[functionName] || [];

  return (
    <div>
      {!isDeployment && (
        <p className="details">
          <b>Contract Address:</b> {contractAddress}
        </p>
      )}
      <div>
        <p className="details">
          <b>{isDeployment ? 'Contract Deployment:' : 'Function Call:'}</b>
        </p>
        <pre className="function-call">
          {`${functionName}(`}
          {call.args.map((arg, index) => (
            <React.Fragment key={`param-${parameterNames[index]?.name || index}-${index}`}>
              {'\n  '}
              {parameterNames[index]?.name && `${parameterNames[index].name}: `}
              {formatParameterValue(arg)}
              {index < call.args.length - 1 ? ',' : ''}
            </React.Fragment>
          ))}
          {'\n)'}
        </pre>
      </div>
    </div>
  );
};

export default FunctionCallDisplay;

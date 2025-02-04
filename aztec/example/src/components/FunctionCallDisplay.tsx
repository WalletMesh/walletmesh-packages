import React from 'react';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware';

type FunctionCall = {
  contractAddress: string;
  functionName: string;
  args: unknown[];
};

type FunctionCallDisplayProps = {
  call: FunctionCall;
  functionArgNames?: FunctionArgNames;
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
    const hexValue = '0x' + BigInt(value.toString()).toString(16);
    return `${decimalValue} (Hex: ${hexValue})`;
  } else {
    // For other types, just stringify
    return String(value);
  }
};


const FunctionCallDisplay: React.FC<FunctionCallDisplayProps> = ({ call, functionArgNames }) => {
  const parameterNames = functionArgNames?.[call.contractAddress]?.[call.functionName] || [];

  return (
    <div>
      <p className="details">
        <b>Contract Address:</b> {call.contractAddress}
      </p>
      <div>
        <p className="details">
          <b>Function Call:</b>
        </p>
        <pre className="function-call">
          {`${call.functionName}(`}
          {call.args.map((arg, index) => (
            <React.Fragment key={index}>
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

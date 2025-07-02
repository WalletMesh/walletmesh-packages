import React from 'react';
import './Approve.css';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware';

type ApproveProps = {
  method: string;
  params?: {
    functionCalls?: {
      contractAddress: string;
      functionName: string;
      args: unknown[];
    }[];
  };
  origin: string;
  functionArgNames?: FunctionArgNames;
  onApprove: () => void;
  onDeny: () => void;
  onAlwaysAllow: () => void;
  showAlwaysAllow?: boolean;
};

const Approve: React.FC<ApproveProps> = ({
  method,
  params,
  origin,
  functionArgNames,
  onApprove,
  onDeny,
  onAlwaysAllow,
  showAlwaysAllow = true,
}) => {
  return (
    <div className="approve-container">
      <h3>Request Approval</h3>
      <p className="approve-details">
        <b>Origin:</b> {origin}
      </p>
      <p className="approve-details">
        <b>Method:</b> {method}
      </p>
      {params && (
        params.functionCalls ? (
          params.functionCalls.map((call, index) => (
            <FunctionCallDisplay
              key={`${call.contractAddress}-${index}`}
              call={call}
              functionArgNames={functionArgNames}
            />
          ))
        ) : (
          <ParameterDisplay params={params} />
        )
      )}
      <div className="approve-buttons">
        <button onClick={onApprove}>Approve</button>
        {showAlwaysAllow && (
          <button onClick={onAlwaysAllow} className="always-allow-button">
            Always Allow
          </button>
        )}
        <button onClick={onDeny}>Deny</button>
      </div>
    </div>
  );
};

export default Approve;

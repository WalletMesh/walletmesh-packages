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
  onEnableAutoApprove: () => void;
  showAlwaysAllow?: boolean;
  showAutoApprove?: boolean;
};

const Approve: React.FC<ApproveProps> = ({
  method,
  params,
  origin,
  functionArgNames,
  onApprove,
  onDeny,
  onAlwaysAllow,
  onEnableAutoApprove,
  showAlwaysAllow = true,
  showAutoApprove = true,
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

      {showAutoApprove && (
        <div className="auto-approve-option">
          <label className="auto-approve-checkbox">
            <input
              type="checkbox"
              onChange={onEnableAutoApprove}
            />
            Auto Approve All Requests
          </label>
          <p className="auto-approve-hint">
            Enable this to automatically approve all future requests without prompting
          </p>
        </div>
      )}

      {showAlwaysAllow && (
        <div className="always-allow-option">
          <label className="always-allow-checkbox">
            <input
              type="checkbox"
              onChange={onAlwaysAllow}
            />
            Always allow {method} requests
          </label>
          <p className="always-allow-hint">
            Enable this to automatically approve this specific method without prompting in the future
          </p>
        </div>
      )}

      <div className="approve-buttons">
        <button onClick={onApprove} className="approve-button">Approve</button>
        <button onClick={onDeny} className="deny-button">Deny</button>
      </div>
    </div>
  );
};

export default Approve;

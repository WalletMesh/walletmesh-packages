import type React from 'react';
import './Approve.css';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';

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
  onEnableAutoApprove: () => void;
  showAutoApprove?: boolean;
};

const Approve: React.FC<ApproveProps> = ({
  method,
  params,
  origin,
  functionArgNames,
  onApprove,
  onDeny,
  onEnableAutoApprove,
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
      {params &&
        (params.functionCalls ? (
          params.functionCalls.map((call, index) => (
            <FunctionCallDisplay
              key={`${call.contractAddress}-${index}`}
              call={call}
              functionArgNames={functionArgNames}
            />
          ))
        ) : (
          <ParameterDisplay params={params} />
        ))}

      {showAutoApprove && (
        <div className="auto-approve-option">
          <label className="auto-approve-checkbox">
            <input
              type="checkbox"
              onChange={(event) => {
                if (event.target.checked) {
                  onEnableAutoApprove();
                }
              }}
            />
            Auto Approve All Requests
          </label>
          <p className="auto-approve-hint">
            Enable this to automatically approve all future requests without prompting
          </p>
        </div>
      )}

      <div className="approve-buttons">
        <button type="button" onClick={onApprove} className="approve-button">
          Approve
        </button>
        <button type="button" onClick={onDeny} className="deny-button">
          Deny
        </button>
      </div>
    </div>
  );
};

export default Approve;

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
  const isBatchOperation = params?.functionCalls && params.functionCalls.length > 1;

  return (
    <div className="approve-container">
      <h3>Request Approval</h3>
      <p className="approve-details">
        <b>Origin:</b> {origin}
      </p>
      <p className="approve-details">
        <b>Method:</b> {method}
      </p>
      {isBatchOperation && (
        <p className="approve-details" style={{ color: '#4a90e2', fontWeight: 'bold' }}>
          ⚡ Atomic Batch Transaction ({params.functionCalls?.length} operations)
          <br />
          <span style={{ fontSize: '0.9em', fontWeight: 'normal', fontStyle: 'italic' }}>
            All operations succeed together or all fail together
          </span>
        </p>
      )}
      {params &&
        (params.functionCalls ? (
          params.functionCalls.map((call, index) => (
            <div key={`${call.contractAddress}-${index}`}>
              {isBatchOperation && (
                <p className="approve-details" style={{ marginTop: '15px', fontWeight: 'bold' }}>
                  Operation {index + 1} of {params.functionCalls?.length}:
                </p>
              )}
              <FunctionCallDisplay
                call={call}
                functionArgNames={functionArgNames}
              />
            </div>
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

import type React from 'react';
import './Approve.css';
import type { FunctionArgNames } from '../middlewares/functionArgNamesMiddleware';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import ParameterDisplay from './ParameterDisplay.js';

type FunctionCall = {
  contractAddress: string;
  functionName: string;
  args: unknown[];
};

type ExecutionPayloadCall = {
  name: string;
  to: { toString: () => string } | string;
  args: unknown[];
};

type ExecutionPayload = {
  calls?: ExecutionPayloadCall[];
};

type ApproveProps = {
  method: string;
  params?: {
    functionCalls?: FunctionCall[];
    executionPayloads?: ExecutionPayload[];
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
  // Transform executionPayloads to functionCalls if needed
  let functionCalls: FunctionCall[] | undefined = params?.functionCalls;

  if (!functionCalls && params?.executionPayloads) {
    // Transform executionPayloads to functionCalls format
    functionCalls = [];
    for (const payload of params.executionPayloads) {
      if (payload.calls) {
        for (const call of payload.calls) {
          functionCalls.push({
            contractAddress: typeof call.to === 'string' ? call.to : call.to.toString(),
            functionName: call.name,
            args: call.args,
          });
        }
      }
    }
  }

  const isBatchOperation = functionCalls && functionCalls.length > 1;

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
          ⚡ Atomic Batch Transaction ({functionCalls?.length} operations)
          <br />
          <span style={{ fontSize: '0.9em', fontWeight: 'normal', fontStyle: 'italic' }}>
            All operations succeed together or all fail together
          </span>
        </p>
      )}
      {functionCalls ? (
        functionCalls.map((call, index) => (
          <div key={`${call.contractAddress}-${index}`}>
            {isBatchOperation && (
              <p className="approve-details" style={{ marginTop: '15px', fontWeight: 'bold' }}>
                Operation {index + 1} of {functionCalls?.length}:
              </p>
            )}
            <FunctionCallDisplay call={call} functionArgNames={functionArgNames} />
          </div>
        ))
      ) : params ? (
        <ParameterDisplay params={params} />
      ) : null}

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

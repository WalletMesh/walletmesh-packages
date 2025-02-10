import React from "react";
import { WalletError } from "../lib/client/types.js";
import { toast } from "react-hot-toast";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: ((error: Error) => void) | undefined;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error): void {
    const { onError } = this.props;

    if (error instanceof WalletError) {
      console.error(`[WalletMesh Error] ${error.message}`, {
        context: error.context,
        cause: error.cause,
      });
      toast.error(error.message);
    } else {
      console.error("[WalletMesh Error] An unexpected error occurred:", error);
      toast.error("An unexpected error occurred");
    }

    onError?.(error);
  }

  override render(): React.ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || (
        <div role="alert" className="wallet-error">
          <h3>Something went wrong</h3>
          <p>Please try again or contact support if the issue persists.</p>
        </div>
      );
    }

    return children;
  }
}

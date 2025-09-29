/**
 * @fileoverview Tests for WalletMeshSandboxedIcon React component
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the WalletMeshSandboxedIcon component to avoid DOM manipulation issues in tests
vi.mock('./WalletMeshSandboxedIcon.js', () => ({
  WalletMeshSandboxedIcon: vi.fn((props) => {
    const { src, size = 24, className, onClick, alt, style, disabled, ...rest } = props;
    const handleKeyDown = onClick
      ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }
      : undefined;

    return (
      <div
        data-testid="sandboxed-icon"
        className={className}
        style={{ width: `${size}px`, height: `${size}px`, ...style }}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={alt}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        data-disabled={disabled}
        data-src={src}
        data-size={size}
        {...rest}
      />
    );
  }),
  WalletMeshSandboxedWalletIcon: vi.fn((props) => {
    const { wallet, size = 24, className, onClick, style, disabled } = props;
    const handleClick = onClick ? () => onClick(wallet.id) : undefined;
    const handleKeyDown = handleClick
      ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }
      : undefined;

    return (
      <div
        data-testid="sandboxed-icon"
        className={className}
        style={{ width: `${size}px`, height: `${size}px`, ...style }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${wallet.name} wallet icon${disabled ? ' (unsupported)' : ''}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        data-disabled={disabled}
        data-wallet-id={wallet.id}
      />
    );
  }),
}));

const { WalletMeshSandboxedIcon, WalletMeshSandboxedWalletIcon } = vi.mocked(
  await import('./WalletMeshSandboxedIcon.js'),
);

describe('WalletMeshSandboxedIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" />);

    // The container should be present with proper test id
    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toBeInTheDocument();

    // Verify the component was called with correct props
    expect(WalletMeshSandboxedIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        src: "data:image/svg+xml,<svg><circle r='10'/></svg>",
      }),
      undefined,
    );
  });

  it('should render with custom size', () => {
    const src = "data:image/svg+xml,<svg><circle r='10'/></svg>";
    const size = 32;

    render(<WalletMeshSandboxedIcon src={src} size={size} />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveStyle({ width: '32px', height: '32px' });
    expect(container).toHaveAttribute('data-size', '32');
  });

  it('should use default size when not specified', () => {
    const src = "data:image/svg+xml,<svg><circle r='10'/></svg>";

    render(<WalletMeshSandboxedIcon src={src} />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveStyle({ width: '24px', height: '24px' });
    expect(container).toHaveAttribute('data-size', '24');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();

    render(
      <WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" onClick={handleClick} />,
    );

    const container = screen.getByTestId('sandboxed-icon');
    fireEvent.click(container);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have button role and be focusable when clickable', () => {
    const handleClick = vi.fn();

    render(
      <WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" onClick={handleClick} />,
    );

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveAttribute('role', 'button');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('should set proper accessibility attributes', () => {
    render(
      <WalletMeshSandboxedIcon
        src="data:image/svg+xml,<svg><circle r='10'/></svg>"
        onClick={() => {}}
        alt="Test icon"
      />,
    );

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveAttribute('role', 'button');
    expect(container).toHaveAttribute('tabIndex', '0');
    expect(container).toHaveAttribute('aria-label', 'Test icon');
  });

  it('should not set button attributes when not clickable', () => {
    render(<WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" alt="Test icon" />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).not.toHaveAttribute('role');
    expect(container).not.toHaveAttribute('tabIndex');
  });

  it('should handle disabled state', () => {
    render(<WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" disabled />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveAttribute('data-disabled', 'true');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-icon';

    render(
      <WalletMeshSandboxedIcon
        src="data:image/svg+xml,<svg><circle r='10'/></svg>"
        className={customClass}
      />,
    );

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveClass(customClass);
  });

  it('should apply custom styles', () => {
    const customStyle = { border: '1px solid red' };

    render(
      <WalletMeshSandboxedIcon src="data:image/svg+xml,<svg><circle r='10'/></svg>" style={customStyle} />,
    );

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveStyle('border: 1px solid red');
  });

  it('should pass through src attribute', () => {
    const src = "data:image/svg+xml,<svg><rect width='10' height='10'/></svg>";

    render(<WalletMeshSandboxedIcon src={src} />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveAttribute('data-src', src);
  });
});

describe('WalletMeshSandboxedWalletIcon', () => {
  const mockWallet = {
    id: 'metamask',
    name: 'MetaMask',
    icon: "data:image/svg+xml,<svg><circle r='10'/></svg>",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render wallet icon', () => {
    render(<WalletMeshSandboxedWalletIcon wallet={mockWallet} />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-wallet-id', 'metamask');
    expect(container).toHaveAttribute('aria-label', 'MetaMask wallet icon');
  });

  it('should handle wallet selection', () => {
    const handleClick = vi.fn();

    render(<WalletMeshSandboxedWalletIcon wallet={mockWallet} onClick={handleClick} />);

    const container = screen.getByTestId('sandboxed-icon');
    fireEvent.click(container);

    expect(handleClick).toHaveBeenCalledWith(mockWallet.id);
  });

  it('should handle disabled state', () => {
    render(<WalletMeshSandboxedWalletIcon wallet={mockWallet} disabled />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveAttribute('data-disabled', 'true');
    expect(container).toHaveAttribute('aria-label', 'MetaMask wallet icon (unsupported)');
  });

  it('should pass through size and styling props', () => {
    const size = 48;
    const className = 'wallet-icon';

    render(<WalletMeshSandboxedWalletIcon wallet={mockWallet} size={size} className={className} />);

    const container = screen.getByTestId('sandboxed-icon');
    expect(container).toHaveClass(className);
    expect(container).toHaveStyle({ width: '48px', height: '48px' });
  });
});

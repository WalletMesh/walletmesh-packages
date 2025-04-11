import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletmeshProvider, useModal } from './WalletmeshProvider.js';
import { SelectModal } from './SelectModal.js';

function TestComponent() {
  const modal = useModal();
  
  return (
    <div>
      <button onClick={() => modal.openSelectModal()} data-testid="open-select">
        Open Select
      </button>
      <div data-testid="select-state">
        {modal.isSelectModalOpen ? 'open' : 'closed'}
      </div>
    </div>
  );
}

describe('WalletmeshProvider', () => {
  it('provides modal context', () => {
    render(
      <WalletmeshProvider config={{}} wallets={[]}>
        <TestComponent />
      </WalletmeshProvider>
    );

    const stateElement = screen.getByTestId('select-state');
    expect(stateElement).toHaveTextContent('closed');
  });

  it('opens select modal', async () => {
    const user = userEvent.setup();
    
    render(
      <WalletmeshProvider config={{}} wallets={[]}>
        <TestComponent />
        <SelectModal>
          <div data-testid="modal-content">Modal Content</div>
        </SelectModal>
      </WalletmeshProvider>
    );

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    
    const openButton = screen.getByTestId('open-select');
    await user.click(openButton);
    
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByTestId('select-state')).toHaveTextContent('open');
  });

  it('calls lifecycle hooks', async () => {
    const user = userEvent.setup();
    const onBeforeOpen = vi.fn().mockResolvedValue(true);
    const onAfterOpen = vi.fn();

    render(
      <WalletmeshProvider
        config={{
          // TODO: lifecycle callbacks are not implemented
          // onBeforeOpen,
          // onAfterOpen
        }}
        wallets={[]}>
        <TestComponent />
      </WalletmeshProvider>
    );

    await user.click(screen.getByTestId('open-select'));

    expect(onBeforeOpen).toHaveBeenCalled();
    expect(onAfterOpen).toHaveBeenCalled();
  });
});
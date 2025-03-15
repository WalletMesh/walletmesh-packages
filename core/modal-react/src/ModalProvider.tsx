import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { createModalStore, type ModalConfig } from '@walletmesh/modal-core';
import { ModalContext } from './ModalContext.js';

export interface ModalProviderProps extends PropsWithChildren {
  config?: ModalConfig;
}

export function ModalProvider({ children, config }: ModalProviderProps) {
  // Create a new store instance for each provider to avoid state sharing
  const [store] = React.useState(() => createModalStore());
  const [state, setState] = useState(() => store.getState());

  useEffect(() => {
    if (config) {
      store.getState().setConfig(config);
    }
  }, [store, config]);
  
  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    
    return () => {
      unsubscribe();
    };
  }, [store]);

  return (
    <ModalContext.Provider value={state}>
      {children}
    </ModalContext.Provider>
  );
}
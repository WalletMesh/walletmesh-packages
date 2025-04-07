import React, { useEffect, type PropsWithChildren } from 'react';
import { ModalControllerImpl, type ModalConfig } from '@walletmesh/modal-core';
import { ModalContext } from './ModalContext.js';

export interface ModalProviderProps extends PropsWithChildren {
  config?: ModalConfig;
}

export function ModalProvider({ children, config }: ModalProviderProps) {
  // Create a new store instance for each provider to avoid state sharing
  const [store] = React.useState(() => new ModalControllerImpl({
    config: config ?? {},
  }));
  // TODO: Should look into using useSyncExternalStore for subscribing to store updates outside React
  // const [_state, setState] = useState(() => store.getState());

  // Skip initial config update. On first render, config is applied when the controller is created
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (config && !isFirstRender.current) {
      store.updateConfig(config);
    }
    isFirstRender.current = false;
  }, [store, config]);
  
  // TODO: Should look into using useSyncExternalStore for subscribing to store updates outside React
  // // Subscribe to store updates
  // useEffect(() => {
  //   const unsubscribe = store.subscribe(() => {
  //     setState(store.getState());
  //   });
    
  //   return () => {
  //     unsubscribe();
  //   };
  // }, [store]);

  return (
    <ModalContext.Provider value={store}>
      {children}
    </ModalContext.Provider>
  );
}
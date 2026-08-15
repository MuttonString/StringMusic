import { createContext, useContext, useRef } from 'react';
import ConfigDrawer from '../components/shared/ConfigDrawer';
import type { ChildrenProp, OpenConfigDrawerFn } from '../types/component';

const Context = createContext<OpenConfigDrawerFn>(() => {});

export const useConfigDrawer = () => useContext(Context);

export function ConfigDrawerProvider({ children }: ChildrenProp) {
  const drawerRef = useRef<OpenConfigDrawerFn>(() => {});

  return (
    <Context.Provider value={drawerRef.current}>
      {children}
      <ConfigDrawer ref={drawerRef} />
    </Context.Provider>
  );
}

import { createContext, createRef, useContext, useRef } from 'react';
import ConfigDrawer from '../components/shared/ConfigDrawer';
import type { ChildrenProp, OpenConfigDrawerFn } from '../types/component';

const Context = createContext(createRef<OpenConfigDrawerFn>());

export const useConfigDrawer = () => useContext(Context).current || (() => {});

export function ConfigDrawerProvider({ children }: ChildrenProp) {
  const drawerRef = useRef<OpenConfigDrawerFn>(() => {});

  return (
    <Context.Provider value={drawerRef}>
      {children}
      <ConfigDrawer ref={drawerRef} />
    </Context.Provider>
  );
}

import type { ReactNode, RefObject } from 'react';
import type { CONFIG_GROUP_ID_LIST } from '../constants/config';

export interface ChildrenProp {
  children: ReactNode;
}

export interface RefsProp {
  refs: RefObject<Record<string, HTMLElement | null>>;
}

export interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
}

export type SnackbarType = 'error' | 'info' | 'success' | 'warning' | null;

export type OpenSnackbarFn = (
  message: string,
  type?: SnackbarType,
  autoHideDuration?: number,
) => void;

export type OpenConfigDrawerFn = (
  jumpTo?: (typeof CONFIG_GROUP_ID_LIST)[number],
) => void;

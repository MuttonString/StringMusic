import type { ReactNode } from 'react';

export type SnackbarFn = (
  message: ReactNode,
  type?: 'error' | 'info' | 'success' | 'warning' | null,
  autoHideDuration?: number,
) => void;

export type SettingsDrawerFn = (jumpTo?: string) => void;

import type { Variants } from 'framer-motion';
import { isRTL } from '../utils/window';

export const DEFAULT_DURATION = 0.3;

export const DIALOG_LEVAING_MS = 225;

export const BASE_COMPONENT: Variants = {
  visible: ({ w, ps }: { w: string; ps?: string }) => ({
    opacity: 1,
    minWidth: w,
    maxWidth: w,
    paddingInlineStart: ps || 0,
  }),
  hidden: {
    opacity: 0,
    minWidth: 0,
    maxWidth: 0,
    paddingInlineStart: 0,
  },
};

export const VERTICAL: Variants = {
  visible: (h: string) => ({
    opacity: 1,
    maxHeight: h,
  }),
  hidden: {
    opacity: 0,
    maxHeight: 0,
  },
};

export const PAGE: Variants = {
  normal: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  goBack: {
    opacity: 0,
    x: isRTL() ? '-2rem' : '2rem',
  },
  goForward: {
    opacity: 0,
    x: isRTL() ? '2rem' : '-2rem',
  },
  new: {
    opacity: 0,
    y: '1rem',
  },
};

export const LIST: Variants = {
  visible: (durationScale: number) => ({
    transition: {
      when: 'beforeChildren',
      staggerChildren: (durationScale * DEFAULT_DURATION) / 4,
    },
  }),
};

export const LIST_ITEM: Variants = {
  visible: {
    opacity: 1,
    x: 0,
  },
  hidden: {
    opacity: 0,
    x: isRTL() ? '5rem' : '-5rem',
  },
};

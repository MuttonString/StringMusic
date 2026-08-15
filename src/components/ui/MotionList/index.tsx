import List from '@mui/material/List';
import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';
import { LIST } from '../../../constants/animation';
import { useConfig } from '../../../providers/ConfigProvider';

const MotionLi = motion.create(List);

export default function MotionList({
  children,
  ...props
}: ComponentProps<typeof MotionLi>) {
  const [config] = useConfig();
  const duration = config.animationDuration;

  return (
    <MotionLi
      variants={LIST}
      custom={duration}
      initial='hidden'
      animate='visible'
      exit='hidden'
      {...props}
    >
      <AnimatePresence mode='popLayout'>
        {children as ReactNode}
      </AnimatePresence>
    </MotionLi>
  );
}

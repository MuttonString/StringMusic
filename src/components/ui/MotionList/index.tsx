import List from '@mui/material/List';
import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';
import { LIST } from '../../../constants/animation';
import { useConfig } from '../../../providers/ConfigProvider';

const MotionLi = motion.create(List);

interface Props extends ComponentProps<typeof MotionLi> {
  initialAnimation?: boolean;
}

export default function MotionList({
  children,
  initialAnimation,
  ...props
}: Props) {
  const [config] = useConfig();

  return (
    <MotionLi
      variants={LIST}
      custom={config.animationDuration}
      initial='hidden'
      animate='visible'
      exit='hidden'
      {...props}
    >
      <AnimatePresence mode='popLayout' initial={initialAnimation}>
        {children as ReactNode}
      </AnimatePresence>
    </MotionLi>
  );
}

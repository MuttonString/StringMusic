import FormLabel from '@mui/material/FormLabel';
import type { ReactNode, Ref } from 'react';

interface Props {
  ref?: Ref<HTMLLabelElement>;
  label: ReactNode;
  control: ReactNode;
}

export default function LabelControlPair({ ref, label, control }: Props) {
  return (
    <div className='flex flex-col'>
      <FormLabel ref={ref}>{label}</FormLabel>
      {control}
    </div>
  );
}

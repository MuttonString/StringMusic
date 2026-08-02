import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { SnackbarFn } from '../../types/globalSlot';

interface IProps {
  sharp?: boolean;
}

export default forwardRef<SnackbarFn, IProps>(function SnackbarTemplate(
  { sharp },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<ReactNode>();
  const [type, setType] = useState<
    'error' | 'info' | 'success' | 'warning' | null
  >(null);
  const timerRef = useRef<number | null>(null);

  useImperativeHandle(
    ref,
    () =>
      function (message, type = null, autoHideDuration = 5000) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        setMessage(message);
        setType(type);
        setOpen(true);

        // Snackbar的autoHideDuration无法动态调整，用此方法代替
        timerRef.current = setTimeout(() => {
          setOpen(false);
        }, autoHideDuration);
      },
  );

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={
        type ? undefined : (
          <IconButton
            size='small'
            color='inherit'
            onClick={() => setOpen(false)}
          >
            {sharp ? (
              <CloseSharpIcon fontSize='small' />
            ) : (
              <CloseRoundedIcon fontSize='small' />
            )}
          </IconButton>
        )
      }
      message={message}
    >
      {type ? (
        <Alert onClose={() => setOpen(false)} severity={type}>
          {message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
});

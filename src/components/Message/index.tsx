import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import type { ReactNode } from 'react';
import useSettings from '../../hooks/useSettings';

interface IProps {
  open?: boolean;
  onClose?: () => void;
  type?: 'error' | 'info' | 'success' | 'warning' | null;
  message?: ReactNode;
  autoHideDuration?: number;
}

export default function Message(props: IProps) {
  const { onClose, type, message, open, autoHideDuration = 5000 } = props;
  const [settings] = useSettings();

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={
        type ? undefined : (
          <IconButton size='small' color='inherit' onClick={onClose}>
            {settings?.personalization.disableRoundCorner ? (
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
        <Alert onClose={onClose} severity={type}>
          {message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}

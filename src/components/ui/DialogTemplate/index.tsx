import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import type { DialogProps } from '@mui/material/Dialog';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyCode } from '../../../types/keyCode';
import Tip from '../Tip';

interface IProps {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  extraAction?: ReactNode;
  confirmDisabled?: boolean;
  title?: string;
  children?: ReactNode;
  maxWidth: DialogProps['maxWidth'];
  fullWidth?: boolean;
  sharp?: boolean;
}

export default function DialogTemplate(props: IProps) {
  const {
    open,
    onClose,
    onConfirm,
    extraAction,
    confirmDisabled,
    title,
    children,
    maxWidth,
    fullWidth = true,
    sharp,
  } = props;
  const { t } = useTranslation();

  return (
    <Dialog
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      open={open}
      onKeyDown={(e) => {
        switch (e.code) {
          case KeyCode.Esc:
            onClose?.();
            break;
          case KeyCode.Enter:
            e.preventDefault();
            onConfirm?.();
            break;
        }
      }}
    >
      <DialogTitle
        sx={{ padding: '8px 24px' }}
        className='flex justify-between items-center gap-2'
      >
        <div>{title}</div>
        <div className='flex -me-4'>
          {onClose && (
            <Tip title={t(onConfirm ? 'dialog.cancel' : 'dialog.close')}>
              <IconButton onClick={onClose}>
                {sharp ? <CloseSharpIcon /> : <CloseRoundedIcon />}
              </IconButton>
            </Tip>
          )}
          {onConfirm && (
            <Tip title={t('dialog.confirm')}>
              <IconButton
                color='secondary'
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {sharp ? <CheckSharpIcon /> : <CheckRoundedIcon />}
              </IconButton>
            </Tip>
          )}
          {extraAction}
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

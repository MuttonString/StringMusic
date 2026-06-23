import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import type { DialogProps } from '@mui/material/Dialog';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import useSettings from '../../hooks/useSettings';
import { KeyCode } from '../../utils/shortcutKey';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  title?: string;
  children?: ReactNode;
  maxWidth: DialogProps['maxWidth'];
  fullWidth?: boolean;
}

export default function DialogTemplate(props: IProps) {
  const {
    open,
    onClose,
    onConfirm,
    confirmDisabled,
    title,
    children,
    maxWidth,
    fullWidth = true,
  } = props;
  const [settings] = useSettings();
  const { t } = useTranslation();
  const sharp = settings?.personalization.disableRoundCorner;

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
      <DialogTitle sx={{ padding: '8px 24px' }} className={styles.dialogTitle}>
        {title}
        <div className={styles.actions}>
          {onClose && (
            <Tip title={t('dialog.close')}>
              <IconButton onClick={onClose}>
                {sharp ? <CloseSharpIcon /> : <CloseRoundedIcon />}
              </IconButton>
            </Tip>
          )}
          {onConfirm && (
            <Tip title={t('dialog.confirm')}>
              <IconButton
                color='primary'
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {sharp ? <CheckSharpIcon /> : <CheckRoundedIcon />}
              </IconButton>
            </Tip>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <SimpleBar
          tabIndex={-1}
          className={styles.dialogContent}
          autoHide={false}
        >
          {children}
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}

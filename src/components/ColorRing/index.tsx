import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PaletteSharpIcon from '@mui/icons-material/PaletteSharp';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSettings from '../../hooks/useSettings';
import ColorDialog from '../ColorDialog';
import Tip from '../Tip';
import styles from './index.module.less';

const COLORS = [
  ['colorRing.red', '#e2483d'],
  ['colorRing.orange', '#e06c00'],
  ['colorRing.yellow', '#b38600'],
  ['colorRing.lime', '#6a9a23'],
  ['colorRing.green', '#22a06b'],
  ['colorRing.cyan', '#2898bd'],
  ['colorRing.blue', '#357de8'],
  ['colorRing.purple', '#af59e1'],
  ['colorRing.pink', '#cd519d'],
] as const;

interface IProps {
  style?: CSSProperties;
  className?: string;
  disabled?: boolean;
}

export default function ColorRing(props: IProps) {
  const { t } = useTranslation();
  const { style, className, disabled } = props;
  const [settings, updateSettings] = useSettings();
  const sharp = settings?.personalization.disableRoundCorner;
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`${styles.colorRing} ${className} ${disabled ? ` ${styles.colorRingDisabled}` : ''}`}
      style={style}
    >
      {COLORS.map((colorInfo, idx) => (
        <Tip key={idx} title={t(colorInfo[0])}>
          <ButtonBase
            disabled={disabled}
            className={styles.colorBtn}
            style={{
              background: colorInfo[1],
              transform: `rotate(${40 * idx}deg)`,
            }}
            onClick={() =>
              updateSettings('personalization.primaryColor.hex', colorInfo[1])
            }
          />
        </Tip>
      ))}
      <Tip title={t('colorRing.custom')}>
        <IconButton
          disabled={disabled}
          className={styles.customBtn}
          onClick={() => setOpen(true)}
        >
          {sharp ? <PaletteSharpIcon /> : <PaletteRoundedIcon />}
        </IconButton>
      </Tip>
      <ColorDialog
        open={open}
        onClose={() => setOpen(false)}
        color={settings!.personalization.primaryColor.hex}
        onColorChanged={(hex) => {
          updateSettings('personalization.primaryColor.hex', hex);
        }}
      />
    </div>
  );
}

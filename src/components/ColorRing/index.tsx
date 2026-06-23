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
  ['colorRing.red', '#f44336'],
  ['colorRing.pink', '#e91e63'],
  ['colorRing.purple', '#9c27b0'],
  ['colorRing.deepPurple', '#673ab7'],
  ['colorRing.indigo', '#3f51b5'],
  ['colorRing.blue', '#2196f3'],
  ['colorRing.lightBlue', '#03a9f4'],
  ['colorRing.cyan', '#00bcd4'],
  ['colorRing.teal', '#009688'],
  ['colorRing.green', '#4caf50'],
  ['colorRing.lightGreen', '#8bc34a'],
  ['colorRing.lime', '#cddc39'],
  ['colorRing.yellow', '#ffeb3b'],
  ['colorRing.amber', '#ffc107'],
  ['colorRing.orange', '#ff9800'],
  ['colorRing.deepOrange', '#ff5722'],
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
              transform: `rotate(${22.5 * idx}deg)`,
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
          size='large'
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

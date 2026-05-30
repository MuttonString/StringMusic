import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { invoke } from '@tauri-apps/api/core';
import {
  arch,
  eol,
  exeExtension,
  family,
  locale,
  platform,
  type,
  version,
} from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';
import ColorDialog from '../../components/ColorDialog';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';
import { setBlurEffect } from '../../utils/windowOperation';
import styles from './index.module.less';

export default function Home() {
  // const { t } = useTranslation();
  const { goTo } = useDetailHistory();
  const [settings, updateSettings] = useSettings();
  const [open, setOpen] = useState(false);
  const [disableAnimation, setDisableAnimation] = useState(
    settings!.personalization.disableAnimation,
  );
  const [disableRoundCorner, setDisableRoundCorner] = useState(
    settings!.personalization.disableRoundCorner,
  );

  const [info, setInfo] = useState({});
  useEffect(() => {
    const getInfo = async () => {
      setInfo({
        arch: arch(),
        eol: eol(),
        exeExtension: exeExtension(),
        family: family(),
        locale: await locale(),
        platform: platform(),
        type: type(),
        version: version(),
        webviewVersion: await invoke('webview_ver'),
      });
    };
    getInfo();
  }, []);

  const changeBlurEffect = (effect?: number) => {
    setBlurEffect(effect);
    updateSettings('personalization.background.blurEffect', effect);
  };

  return (
    <div className={styles.home}>
      open file | open folder | open url
      <br />
      recent files
      <br />
      <Button variant='contained' onClick={() => goTo('/settings')}>
        settings
      </Button>
      <Button variant='contained' onClick={() => setOpen(true)}>
        color
      </Button>
      <ColorDialog
        open={open}
        onClose={() => setOpen(false)}
        color={settings!.personalization.primaryColor.hex}
        onColorChanged={(hex) => {
          updateSettings('personalization.primaryColor.hex', hex);
        }}
      />
      <br />
      <Button onClick={() => changeBlurEffect(0)}>BLUR</Button>
      <Button onClick={() => changeBlurEffect(1)}>ACRYLIC</Button>
      <Button onClick={() => changeBlurEffect(2)}>MICA</Button>
      <Button onClick={() => changeBlurEffect(3)}>VIBRANCY</Button>
      <Button onClick={() => changeBlurEffect()}>clear</Button>
      <br />
      <Button onClick={() => updateSettings('personalization.colorMode', 0)}>
        AUTO
      </Button>
      <Button onClick={() => updateSettings('personalization.colorMode', 1)}>
        LIGHT
      </Button>
      <Button onClick={() => updateSettings('personalization.colorMode', 2)}>
        DARK
      </Button>
      <br />
      Disable animation
      <Switch
        checked={disableAnimation}
        onChange={(e) => {
          setDisableAnimation(e.target.checked);
          if (e.target.checked) {
            document.documentElement.classList.add('no-animation');
          } else {
            document.documentElement.classList.remove('no-animation');
          }
          updateSettings('personalization.disableAnimation', e.target.checked);
        }}
      />
      Disable round corner
      <Switch
        checked={disableRoundCorner}
        onChange={(e) => {
          setDisableRoundCorner(e.target.checked);
          if (e.target.checked) {
            document.body.classList.add('sharp');
          } else {
            document.body.classList.remove('sharp');
          }
          updateSettings(
            'personalization.disableRoundCorner',
            e.target.checked,
          );
        }}
      />
      <div>
        {JSON.stringify(info)
          .replace('{', '')
          .replace('}', '')
          .replace(/"/g, '')
          .split(',')
          .map((row) => (
            <div key={row}>{row.replace(':', ': ')}</div>
          ))}
      </div>
    </div>
  );
}

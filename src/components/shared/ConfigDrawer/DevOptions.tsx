import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir, appLogDir } from '@tauri-apps/api/path';
import { ask } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IS_DESKTOP } from '../../../constants/os';
import { useConfig } from '../../../providers/ConfigProvider';
import type { RefsProp } from '../../../types/component';
import { compress, decompress } from '../../../utils/data';
import LabelControlPair from '../../ui/LabelControlPair';

export default function DevOptions({ refs }: RefsProp) {
  const { t } = useTranslation();
  const [config, updateConfig] = useConfig();

  const scr = config.script;
  const [script, setScript] = useState('');
  useEffect(() => {
    if (scr) setScript(decompress(scr));
  }, [scr]);

  const addRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      refs.current[key] = el;
    },
    [refs],
  );

  const [err, setErr] = useState(false);
  if (err) throw Error('(╯°Д°)╯ ┻━┻');

  return (
    <div className='flex flex-col gap-4 items-start'>
      <Typography variant='h6' color='secondary' ref={addRef('devOptions')}>
        {t('config.devOptions')}
      </Typography>

      <FormControlLabel
        ref={addRef('enableDevOptions')}
        label={t('config.enableDevOptions')}
        control={
          <Switch
            checked={config.enableDevOptions}
            onChange={(_, val) => updateConfig({ enableDevOptions: val })}
          />
        }
      />

      <FormControlLabel
        ref={addRef('forceRTL')}
        label={t('config.forceRTL')}
        control={
          <Switch
            checked={config.forceRTL}
            onChange={(_, val) => updateConfig({ forceRTL: val })}
          />
        }
      />

      <FormControlLabel
        ref={addRef('showFooter')}
        label={t('config.showFooter')}
        control={
          <Switch
            checked={config.showFooter}
            onChange={(_, val) => updateConfig({ showFooter: val })}
          />
        }
      />

      <LabelControlPair
        ref={addRef('script')}
        label={t('config.script')}
        control={
          <>
            <TextField
              multiline
              fullWidth
              rows={4}
              className='[&_textarea]:font-mono!'
              value={script}
              onChange={(e) => setScript(e.target.value)}
              onBlur={() =>
                updateConfig({
                  script: script.trim() ? compress(script) : '',
                })
              }
            />
            <FormHelperText className='text-warning!'>
              {t('config.scriptWarning')}
            </FormHelperText>
          </>
        }
      />

      {IS_DESKTOP && (
        <>
          <Button
            variant='outlined'
            color='secondary'
            fullWidth
            onClick={async () => openPath(await appDataDir())}
            ref={addRef('openAppdata')}
          >
            {t('config.openAppdata')}
          </Button>

          <Button
            variant='outlined'
            color='secondary'
            fullWidth
            onClick={async () => openPath(await appLogDir())}
            ref={addRef('openLog')}
          >
            {t('config.openLog')}
          </Button>
        </>
      )}

      <Button
        fullWidth
        variant='outlined'
        color={'warning'}
        onClick={async () => {
          if (
            await ask(
              t('msg.areYouSure', {
                title: t('config.throwError'),
                kind: 'warning',
              }),
            )
          ) {
            setErr(true);
          }
        }}
        ref={addRef('throwError')}
      >
        {t('config.throwError')}
      </Button>

      <Button
        fullWidth
        variant='outlined'
        color={'error'}
        onClick={async () => {
          if (
            await ask(
              t('msg.areYouSure', {
                title: t('config.crash'),
                kind: 'warning',
              }),
            )
          ) {
            invoke('crash');
          }
        }}
        ref={addRef('crash')}
      >
        {t('config.crash')}
      </Button>
    </div>
  );
}

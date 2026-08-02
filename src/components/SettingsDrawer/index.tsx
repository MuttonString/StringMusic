import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir, appLogDir } from '@tauri-apps/api/path';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { openPath } from '@tauri-apps/plugin-opener';
import { load } from '@tauri-apps/plugin-store';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsDrawerFn } from '../../types/globalSlot';
import { ColorMode, type ISettings } from '../../types/settings';
import { addCloseListener } from '../../utils/closeListener';
import { getLangs } from '../../utils/i18n';
import ColorRing from '../ColorRing';
import LangDialog from '../LangDialog';
import About from './about';
import { BackgroundSettings } from './backgroundSettings';
import styles from './index.module.less';

interface IProps {
  settings?: ISettings;
  updateSettings: (key: string, value: {}) => Promise<void>;
}

const animationDurationMarks = [
  { value: 0, label: '0' },
  { value: 1, label: '0.5x' },
  { value: 2, label: '1x' },
  { value: 3, label: '1.5x' },
  { value: 4, label: '2x' },
  { value: 5, label: '5x' },
  { value: 6, label: '10x' },
] as const;

export default forwardRef<SettingsDrawerFn, IProps>(
  function SettingsDrawer(props, ref) {
    const { t } = useTranslation();
    const { settings, updateSettings } = props;
    const drawerRef = useRef<null | HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const isDevEnabled = settings?.developerOptions.enabled;
    const refs = useRef<Record<string, HTMLElement | null>>({});

    const [autoStart, setAutoStart] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [script, setScript] = useState(
      settings?.developerOptions.script || '',
    );
    const [animationDuration, setAnimationDuration] = useState(
      animationDurationMarks.find(
        (item) =>
          parseFloat(item.label) ===
          settings?.personalization.animationDuration,
      )?.value ?? 1,
    );

    // 手动制造错误的相关逻辑
    const [error, setError] = useState<boolean>();
    const [crash, setCrash] = useState(false);
    if (error) throw new Error('(╯°Д°)╯ ┻━┻');

    const addRef = useCallback(
      (name: string) => (el: HTMLElement | null) => {
        refs.current[t(name)] = el;
      },
      [t],
    );

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (
          (e.primaryKey && e.shiftKey && e.code === 'KeyI') ||
          e.key === 'F12'
        ) {
          invoke('open_devtools').catch((err) =>
            console.error('Failed to open DevTools: ' + err),
          );
        } else if ((e.primaryKey && e.code === 'KeyR') || e.key === 'F5') {
          location.reload();
        }
      };

      if (isDevEnabled) {
        window.addEventListener('keydown', handler, true);
      } else {
        window.removeEventListener('keydown', handler, true);
      }

      return () => window.removeEventListener('keydown', handler, true);
    }, [isDevEnabled]);

    useEffect(() => {
      if (!settings) return;

      isEnabled()
        .then((val) => setAutoStart(val))
        .catch((err) =>
          console.error('Failed to get auto start state: ' + err),
        );

      // 应用设置，与颜色模式、主题色、文字方向、动画相关的逻辑在App组件内，还有部分设置的逻辑在与之对应的组件内

      const unlistenMusicState = addCloseListener(async () => {
        if (settings.privacy.savePlaying) return;
        try {
          const store = await load('.music-state.json');
          await store.clear();
        } catch (err) {
          console.error('Failed to clear music state: ' + err);
        }
      });

      const personalization = settings.personalization;
      if (personalization.advancedMaterial) {
        document.body.classList.add('advanced-material');
      } else {
        document.body.classList.remove('advanced-material');
      }
      if (personalization.disableRoundCorner) {
        document.body.classList.add('sharp');
      } else {
        document.body.classList.remove('sharp');
      }
      document.body.style.setProperty(
        '--duration',
        String(personalization.animationDuration),
      );

      return () => {
        unlistenMusicState.then((fn) => fn());
      };
    }, [settings]);

    const defaultOptions = useMemo(() => {
      const opts = [
        t('settingsDrawer.common.title'),
        t('settingsDrawer.desktopLyric.title'),
        t('settingsDrawer.personalization.title'),
        t('settingsDrawer.privacy.title'),
        t('settingsDrawer.about.title'),
      ];
      if (isDevEnabled) {
        opts.push(t('settingsDrawer.developerOptions.title'));
      }
      return opts;
    }, [isDevEnabled, t]);

    const options = useMemo(
      () =>
        [
          ...defaultOptions,

          window.desktop && t('settingsDrawer.common.autoStart'),
          t('settingsDrawer.common.language'),

          t('settingsDrawer.personalization.colorMode.title'),
          t('settingsDrawer.personalization.primaryColor.title'),
          t('settingsDrawer.personalization.background.title'),
          t('settingsDrawer.personalization.backgroundMini.title'),
          t('settingsDrawer.personalization.font.title'),
          t('settingsDrawer.personalization.advancedMaterial'),
          t('settingsDrawer.personalization.disableRoundCorner'),
          t('settingsDrawer.personalization.animationDuration'),

          t('settingsDrawer.privacy.recommendation'),
          t('settingsDrawer.privacy.recent'),
          t('settingsDrawer.privacy.searchHistory'),
          t('settingsDrawer.privacy.savePlaying'),

          isDevEnabled && t('settingsDrawer.developerOptions.forceRTL'),
          isDevEnabled && t('settingsDrawer.developerOptions.showFooter'),
          isDevEnabled && t('settingsDrawer.developerOptions.script'),
          isDevEnabled &&
            window.desktop &&
            t('settingsDrawer.developerOptions.openAppdata'),
          isDevEnabled &&
            window.desktop &&
            t('settingsDrawer.developerOptions.openLog'),
          isDevEnabled && t('settingsDrawer.developerOptions.throwError'),
          isDevEnabled && t('settingsDrawer.developerOptions.crash'),
        ].filter(Boolean) as string[],
      [defaultOptions, isDevEnabled, t],
    );

    const handleJump = useCallback((str: string) => {
      const el = refs.current[str];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, []);

    useImperativeHandle(
      ref,
      () =>
        function (jumpTo) {
          setOpen(true);
          if (jumpTo) handleJump(jumpTo);
        },
    );

    return (
      <SwipeableDrawer
        disableSwipeToOpen
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        anchor='right'
        ref={drawerRef}
      >
        <div className={styles.settingsDrawer}>
          <div className={styles.topBar}>
            <Autocomplete
              openOnFocus
              size='small'
              popupIcon={null}
              value={search}
              onChange={(_, val) => {
                if (val) {
                  handleJump(val);
                }
                setSearch(null);
                setSearchInput('');
              }}
              options={options}
              filterOptions={(opt, { inputValue }) => {
                if (!inputValue.trim()) {
                  return defaultOptions;
                }
                const lang = getLangs();
                return opt.filter((val) =>
                  val
                    .toLocaleLowerCase(lang)
                    .includes(inputValue.toLocaleLowerCase(lang)),
                );
              }}
              inputValue={searchInput}
              onInputChange={(_, val) => setSearchInput(val)}
              className={styles.search}
              fullWidth
              renderInput={(params) => (
                <TextField
                  aria-label={t('settingsDrawer.search')}
                  placeholder={t('settingsDrawer.search')}
                  variant='standard'
                  {...params}
                />
              )}
              noOptionsText={t('common.noOptions')}
            />
          </div>
          <Divider />

          {settings && (
            <div className={styles.container}>
              <Typography
                variant='h6'
                color='primary'
                ref={addRef('settingsDrawer.common.title')}
              >
                {t('settingsDrawer.common.title')}
              </Typography>

              <FormControlLabel
                label={t('settingsDrawer.common.autoStart')}
                control={
                  <Switch
                    checked={autoStart}
                    onChange={async (e) => {
                      const checked = e.target.checked;

                      try {
                        if (checked) await enable();
                        else await disable();
                        setAutoStart(checked);
                      } catch (err) {
                        console.error(
                          `Failed to ${checked ? 'enable' : 'disable'} auto start: ${err}`,
                        );
                      }
                    }}
                    ref={addRef('settingsDrawer.common.autoStart')}
                  />
                }
              />

              <div className={styles.btns}>
                <Button
                  variant='contained'
                  onClick={() => setLangOpen(true)}
                  ref={addRef('settingsDrawer.common.language')}
                  startIcon={
                    settings.personalization.disableRoundCorner ? (
                      <OpenInNewSharpIcon />
                    ) : (
                      <OpenInNewRoundedIcon />
                    )
                  }
                >
                  {t('settingsDrawer.common.language')}
                </Button>
                <LangDialog
                  settings={settings}
                  updateSettings={updateSettings}
                  open={langOpen}
                  onClose={() => setLangOpen(false)}
                />
              </div>

              <Typography
                variant='h6'
                color='primary'
                ref={addRef('settingsDrawer.personalization.title')}
              >
                {t('settingsDrawer.personalization.title')}
              </Typography>

              <FormLabel
                ref={addRef('settingsDrawer.personalization.colorMode')}
              >
                {t('settingsDrawer.personalization.colorMode.title')}
              </FormLabel>
              <Select
                value={settings.personalization.colorMode}
                onChange={(e) =>
                  updateSettings('personalization.colorMode', e.target.value)
                }
                fullWidth
                size='small'
              >
                <MenuItem value={ColorMode.FollowSystem}>
                  {t('settingsDrawer.personalization.colorMode.followSystem')}
                </MenuItem>
                <MenuItem value={ColorMode.Light}>
                  {t('settingsDrawer.personalization.colorMode.light')}
                </MenuItem>
                <MenuItem value={ColorMode.Dark}>
                  {t('settingsDrawer.personalization.colorMode.dark')}
                </MenuItem>
              </Select>

              <FormControlLabel
                label={t('settingsDrawer.personalization.advancedMaterial')}
                control={
                  <Switch
                    checked={settings.personalization.advancedMaterial}
                    onChange={(e) =>
                      updateSettings(
                        'personalization.advancedMaterial',
                        e.target.checked,
                      )
                    }
                    ref={addRef(
                      'settingsDrawer.personalization.advancedMaterial',
                    )}
                  />
                }
              />

              <FormControlLabel
                label={t('settingsDrawer.personalization.disableRoundCorner')}
                control={
                  <Switch
                    checked={settings.personalization.disableRoundCorner}
                    onChange={(e) =>
                      updateSettings(
                        'personalization.disableRoundCorner',
                        e.target.checked,
                      )
                    }
                    ref={addRef(
                      'settingsDrawer.personalization.disableRoundCorner',
                    )}
                  />
                }
              />

              <FormLabel
                ref={addRef('settingsDrawer.personalization.animationDuration')}
              >
                {t('settingsDrawer.personalization.animationDuration')}
              </FormLabel>
              <Slider
                step={null}
                marks={animationDurationMarks}
                value={animationDuration}
                onChange={(_, val) =>
                  setAnimationDuration(val as 0 | 1 | 2 | 3 | 4 | 5 | 6)
                }
                onChangeCommitted={(_, val) =>
                  updateSettings(
                    'personalization.animationDuration',
                    parseFloat(animationDurationMarks[val].label),
                  )
                }
                max={6}
                scale={(val) => parseFloat(animationDurationMarks[val].label)}
              />

              <Typography
                variant='subtitle1'
                ref={addRef(
                  'settingsDrawer.personalization.primaryColor.title',
                )}
              >
                {t('settingsDrawer.personalization.primaryColor.title')}
              </Typography>

              <FormControlLabel
                label={t(
                  'settingsDrawer.personalization.primaryColor.followSystem',
                )}
                control={
                  <Switch
                    checked={settings.personalization.primaryColor.followSystem}
                    onChange={(e) =>
                      updateSettings(
                        'personalization.primaryColor.followSystem',
                        e.target.checked,
                      )
                    }
                  />
                }
              />
              <ColorRing
                settings={settings}
                updateSettings={updateSettings}
                disabled={settings.personalization.primaryColor.followSystem}
              />

              <Typography
                variant='subtitle1'
                ref={addRef('settingsDrawer.personalization.background.title')}
              >
                {t('settingsDrawer.personalization.background.title')}
              </Typography>

              <BackgroundSettings
                settings={settings}
                updateSettings={updateSettings}
                namespace='background'
              />

              <Typography
                variant='subtitle1'
                ref={addRef(
                  'settingsDrawer.personalization.backgroundMini.title',
                )}
              >
                {t('settingsDrawer.personalization.backgroundMini.title')}
              </Typography>

              <BackgroundSettings
                settings={settings}
                updateSettings={updateSettings}
                namespace='backgroundMini'
              />

              <Typography
                variant='h6'
                color='primary'
                ref={addRef('settingsDrawer.privacy.title')}
              >
                {t('settingsDrawer.privacy.title')}
              </Typography>

              <FormControlLabel
                label={t('settingsDrawer.privacy.recommendation')}
                control={
                  <Switch
                    checked={settings.privacy.recommendation}
                    onChange={(e) =>
                      updateSettings('privacy.recommendation', e.target.checked)
                    }
                    ref={addRef('settingsDrawer.privacy.recommendation')}
                  />
                }
              />

              <FormControlLabel
                label={t('settingsDrawer.privacy.recent')}
                control={
                  <Switch
                    checked={settings.privacy.recent}
                    onChange={(e) =>
                      updateSettings('privacy.recent', e.target.checked)
                    }
                    ref={addRef('settingsDrawer.privacy.recent')}
                  />
                }
              />

              <FormControlLabel
                label={t('settingsDrawer.privacy.searchHistory')}
                control={
                  <Switch
                    checked={settings.privacy.searchHistory}
                    onChange={(e) =>
                      updateSettings('privacy.searchHistory', e.target.checked)
                    }
                    ref={addRef('settingsDrawer.privacy.searchHistory')}
                  />
                }
              />

              <FormControlLabel
                label={t('settingsDrawer.privacy.savePlaying')}
                control={
                  <Switch
                    checked={settings.privacy.savePlaying}
                    onChange={async (e) =>
                      updateSettings('privacy.savePlaying', e.target.checked)
                    }
                    ref={addRef('settingsDrawer.privacy.savePlaying')}
                  />
                }
              />

              <Typography
                variant='h6'
                color='primary'
                ref={addRef('settingsDrawer.about.title')}
              >
                {t('settingsDrawer.about.title')}
              </Typography>

              <About settings={settings} updateSettings={updateSettings} />

              {isDevEnabled && (
                <>
                  <Typography
                    variant='h6'
                    color='primary'
                    ref={addRef('settingsDrawer.developerOptions.title')}
                  >
                    {t('settingsDrawer.developerOptions.title')}
                  </Typography>

                  <FormControlLabel
                    label={t('settingsDrawer.developerOptions.enabled')}
                    control={
                      <Switch
                        checked={settings.developerOptions.enabled}
                        onChange={(e) =>
                          updateSettings(
                            'developerOptions.enabled',
                            e.target.checked,
                          )
                        }
                      />
                    }
                  />

                  <FormControlLabel
                    label={t('settingsDrawer.developerOptions.forceRTL')}
                    control={
                      <Switch
                        checked={settings.developerOptions.forceRTL}
                        onChange={(e) =>
                          updateSettings(
                            'developerOptions.forceRTL',
                            e.target.checked,
                          )
                        }
                        ref={addRef('settingsDrawer.developerOptions.forceRTL')}
                      />
                    }
                  />

                  <FormControlLabel
                    label={t('settingsDrawer.developerOptions.showFooter')}
                    control={
                      <Switch
                        checked={settings.developerOptions.showFooter}
                        onChange={(e) =>
                          updateSettings(
                            'developerOptions.showFooter',
                            e.target.checked,
                          )
                        }
                        ref={addRef(
                          'settingsDrawer.developerOptions.showFooter',
                        )}
                      />
                    }
                  />

                  <FormLabel
                    ref={addRef('settingsDrawer.developerOptions.script')}
                  >
                    {t('settingsDrawer.developerOptions.script')}
                  </FormLabel>
                  <Typography variant='body2' color='warning'>
                    {t('settingsDrawer.developerOptions.warning')}
                  </Typography>
                  <TextField
                    multiline
                    fullWidth
                    rows={4}
                    className={styles.script}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    onBlur={() => {
                      if (settings.developerOptions.script !== script) {
                        updateSettings(
                          'developerOptions.script',
                          script.trim(),
                        );
                      }
                    }}
                  />

                  <div className={styles.btns}>
                    {window.desktop && (
                      <>
                        <Button
                          variant='contained'
                          onClick={async () => {
                            try {
                              await openPath(await appDataDir());
                            } catch (err) {
                              console.error(
                                'Failed to open app data directory: ' + err,
                              );
                            }
                          }}
                          ref={addRef(
                            'settingsDrawer.developerOptions.openAppdata',
                          )}
                        >
                          {t('settingsDrawer.developerOptions.openAppdata')}
                        </Button>

                        <Button
                          variant='contained'
                          onClick={async () => {
                            try {
                              await openPath(await appLogDir());
                            } catch (err) {
                              console.error(
                                'Failed to open app log directory: ' + err,
                              );
                            }
                          }}
                          ref={addRef(
                            'settingsDrawer.developerOptions.openLog',
                          )}
                        >
                          {t('settingsDrawer.developerOptions.openLog')}
                        </Button>
                      </>
                    )}

                    <Button
                      variant='contained'
                      color={error === false ? 'error' : 'warning'}
                      onClick={() => {
                        if (error === false) {
                          setError(true);
                        } else {
                          setError(false);
                          setTimeout(() => setError(undefined), 3000);
                        }
                      }}
                      ref={addRef('settingsDrawer.developerOptions.throwError')}
                    >
                      {t('settingsDrawer.developerOptions.throwError')}
                    </Button>

                    <Button
                      variant='contained'
                      color={crash ? 'error' : 'warning'}
                      onClick={() => {
                        if (crash) {
                          invoke('crash');
                        } else {
                          setCrash(true);
                          setTimeout(() => setCrash(false), 3000);
                        }
                      }}
                      ref={addRef('settingsDrawer.developerOptions.crash')}
                    >
                      {t('settingsDrawer.developerOptions.crash')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SwipeableDrawer>
    );
  },
);

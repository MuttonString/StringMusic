import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { basename, pictureDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VERTICAL } from '../../../constants/animation';
import {
  COLOR_LABEL_MAP,
  DARK_SECONDARY_COLOR_SHADE,
  DEFAULT_COLOR_SHADE,
  LIGHT_SECONDARY_COLOR_SHADE,
  SORTED_COLOR_ENTRIES,
} from '../../../constants/colors';
import { IMAGE_FILE_FILTER } from '../../../constants/file';
import { IS_DESKTOP } from '../../../constants/os';
import {
  SUPPORT_ACRYLIC,
  SUPPORT_BLUR,
  SUPPORT_MICA,
} from '../../../constants/window';
import { useConfig } from '../../../providers/ConfigProvider';
import type { RefsProp } from '../../../types/component';
import type { Colors } from '../../../types/config';
import { BackgroundType, ColorMode } from '../../../types/config';
import { isDarkMode } from '../../../utils/window';
import FontSelect from '../../ui/FontSelect';
import LabelControlPair from '../../ui/LabelControlPair';
import MaterialIcon from '../../ui/MaterialIcon';
import Tip from '../../ui/Tip';

const showOpacity = [
  BackgroundType.Standard,
  BackgroundType.SinglePicture,
  BackgroundType.RandomPictures,
];

const showPicture = [
  BackgroundType.SinglePicture,
  BackgroundType.RandomPictures,
];

const animationDurationMarks = [
  { value: 0, label: '0' },
  { value: 1, label: '0.5x' },
  { value: 2, label: '1x' },
  { value: 3, label: '1.5x' },
  { value: 4, label: '2x' },
  { value: 5, label: '5x' },
  { value: 6, label: '10x' },
] as const;

export default function WindowAppeance({ refs }: RefsProp) {
  const { t } = useTranslation();
  const [config, updateConfig] = useConfig();

  const addRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      refs.current[key] = el;
    },
    [refs],
  );

  const globalFont = config.globalFont;
  const [font, setFont] = useState(globalFont);
  useEffect(() => setFont(globalFont), [globalFont]);

  const bgMainOpacity = config.backgroundMainWindow.opacity;
  const [opacityMain, setOpacityMain] = useState(bgMainOpacity);
  useEffect(() => setOpacityMain(bgMainOpacity), [bgMainOpacity]);

  const bgMiniOpacity = config.backgroundMiniWindow.opacity;
  const [opacityMini, setOpacityMini] = useState(bgMiniOpacity);
  useEffect(() => setOpacityMini(bgMiniOpacity), [bgMiniOpacity]);

  const bgPath = config.backgroundMainWindow.path;
  const [path, setPath] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setPath(bgPath);
    if (bgPath) {
      basename(bgPath)
        .then((val) => setName(val))
        .catch((err) => console.log('Failed to get basename: ' + err));
    } else {
      setName('');
    }
  }, [bgPath]);

  const duration = config.animationDuration;
  const [animationDuration, setAnimationDuration] = useState(duration);
  useEffect(
    () =>
      setAnimationDuration(
        animationDurationMarks.find(
          (item) => parseFloat(item.label) === duration,
        )?.value ?? 2,
      ),
    [duration],
  );

  const selectPicture = useCallback(
    async (directory?: boolean) => {
      let defaultPath: string | undefined = undefined;
      try {
        defaultPath = path || (await pictureDir());
      } catch (err) {
        console.error('Failed to get picture directory: ' + err);
      }

      const newPath = await open({
        title: t(
          `settingsDrawer.personalization.background.${directory ? 'selectFolder' : 'selectPicture'}`,
        ),
        defaultPath,
        filters: [
          {
            name: t('common.imageFile'),
            extensions: [
              'png',
              'jpg',
              'jpeg',
              'jfif',
              'pjpeg',
              'pjp',
              'webp',
              'bmp',
              'gif',
              'apng',
              'avif',
            ],
          },
          ...IMAGE_FILE_FILTER,
          { name: t('common.allFile'), extensions: ['*'] },
        ],
        directory,
      });

      if (!newPath) return;
      updateConfig({
        backgroundMainWindow: {
          ...config.backgroundMainWindow,
          path: newPath,
        },
      });
    },
    [config.backgroundMainWindow, path, t, updateConfig],
  );

  return (
    <div className='flex flex-col gap-4 items-start'>
      <Typography
        variant='h6'
        color='secondary'
        ref={addRef('windowAppearance')}
      >
        {t('config.windowAppearance')}
      </Typography>

      <LabelControlPair
        label={t('config.colorMode')}
        ref={addRef('colorMode')}
        control={
          <Select
            value={config.colorMode}
            onChange={(e) => updateConfig({ colorMode: e.target.value })}
          >
            <MenuItem value={ColorMode.FollowSystem}>
              {t('config.followSystem')}
            </MenuItem>
            <MenuItem value={ColorMode.Light}>{t('config.light')}</MenuItem>
            <MenuItem value={ColorMode.Dark}>{t('config.dark')}</MenuItem>
          </Select>
        }
      />

      <LabelControlPair
        ref={addRef('primaryColor')}
        label={t('config.primaryColor')}
        control={
          <div className='grid grid-cols-7 gap-1 grid-rows-3 aspect-7/3'>
            {SORTED_COLOR_ENTRIES.map(([key, value]) => {
              const colorId: Colors = Number(key);
              return (
                <Tip key={key} title={t('color.' + COLOR_LABEL_MAP[colorId])}>
                  <Button
                    color='inherit'
                    className='min-w-0! p-0! border-2!'
                    style={{
                      background: value[DEFAULT_COLOR_SHADE],
                      borderColor:
                        value[
                          isDarkMode()
                            ? DARK_SECONDARY_COLOR_SHADE
                            : LIGHT_SECONDARY_COLOR_SHADE
                        ],
                    }}
                    onClick={() => {
                      if (config.primaryColor === colorId) return;
                      updateConfig({ primaryColor: colorId });
                    }}
                  >
                    {config.primaryColor === colorId && (
                      <MaterialIcon name='checkCircle' />
                    )}
                  </Button>
                </Tip>
              );
            })}
          </div>
        }
      />

      <div className='w-full'>
        <LabelControlPair
          ref={addRef('backgroundMainWindow')}
          label={t('config.backgroundMainWindow')}
          control={
            <Select
              fullWidth
              value={config.backgroundMainWindow.type}
              onChange={(e) =>
                updateConfig({
                  backgroundMainWindow: {
                    ...config.backgroundMainWindow,
                    path: '',
                    type: e.target.value,
                  },
                })
              }
            >
              <MenuItem value={BackgroundType.Standard}>
                {t('config.standard')}
              </MenuItem>
              {SUPPORT_BLUR && (
                <MenuItem value={BackgroundType.Blur}>
                  {t('config.blur')}
                </MenuItem>
              )}
              {SUPPORT_ACRYLIC && (
                <MenuItem value={BackgroundType.Acrylic}>
                  {t('config.acrylic')}
                </MenuItem>
              )}
              {SUPPORT_MICA && (
                <MenuItem value={BackgroundType.Mica}>
                  {t('config.mica')}
                </MenuItem>
              )}
              <MenuItem value={BackgroundType.SinglePicture}>
                {t('config.singlePicture')}
              </MenuItem>
              {IS_DESKTOP && (
                <MenuItem value={BackgroundType.RandomPictures}>
                  {t('config.randomPictures')}
                </MenuItem>
              )}
            </Select>
          }
        />

        <AnimatePresence>
          {showOpacity.includes(config.backgroundMainWindow.type) && (
            <motion.div
              className='flex gap-4 me-6'
              layout
              variants={VERTICAL}
              custom='30px'
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              {t('config.opacity')}
              <Slider
                value={opacityMain}
                onChange={(_, val) => {
                  const style = document.body.style;
                  style.backgroundColor = `rgb(var(--mui-palette-AppBar-defaultBgChannel) / ${val}%)`;
                  style.setProperty(
                    '--bg-color',
                    `rgb(var(--mui-palette-background-defaultChannel) / ${(val / 100) ** 5})`,
                  );
                  setOpacityMain(val);
                }}
                onChangeCommitted={(_, val) =>
                  updateConfig({
                    backgroundMainWindow: {
                      ...config.backgroundMainWindow,
                      opacity: val,
                    },
                  })
                }
                valueLabelDisplay='auto'
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPicture.includes(config.backgroundMainWindow.type) && (
            <motion.div
              variants={VERTICAL}
              layout
              custom='60px'
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              <ButtonGroup fullWidth>
                <Button
                  startIcon={
                    <MaterialIcon
                      name={
                        config.backgroundMainWindow.type ===
                        BackgroundType.SinglePicture
                          ? 'fileOpen'
                          : 'folderOpen'
                      }
                    />
                  }
                  variant='outlined'
                  color='secondary'
                  onClick={() =>
                    selectPicture(
                      config.backgroundMainWindow.type ===
                        BackgroundType.RandomPictures,
                    )
                  }
                >
                  {t(
                    config.backgroundMainWindow.type ===
                      BackgroundType.SinglePicture
                      ? 'config.selectPicture'
                      : 'config.selectFolder',
                  )}
                </Button>
                <Tip title={t('common.clear')}>
                  <Button
                    sx={{ width: '2rem' }}
                    variant='outlined'
                    color='secondary'
                    onClick={() =>
                      updateConfig({
                        backgroundMainWindow: {
                          ...config.backgroundMainWindow,
                          path: '',
                        },
                      })
                    }
                  >
                    <MaterialIcon name='clear' />
                  </Button>
                </Tip>
              </ButtonGroup>
              <Tip title={path} disabled={!path}>
                <FormHelperText>
                  {name || t('config.defaultPictureName')}
                </FormHelperText>
              </Tip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className='w-full'>
        <LabelControlPair
          label={t('config.backgroundMiniWindow')}
          ref={addRef('backgroundMiniWindow')}
          control={
            <Select
              fullWidth
              value={config.backgroundMiniWindow.type}
              onChange={(e) =>
                updateConfig({
                  backgroundMiniWindow: {
                    ...config.backgroundMiniWindow,
                    type: e.target.value,
                  },
                })
              }
            >
              <MenuItem value={BackgroundType.Standard}>
                {t('config.standard')}
              </MenuItem>
              {SUPPORT_BLUR && (
                <MenuItem value={BackgroundType.Blur}>
                  {t('config.blur')}
                </MenuItem>
              )}
              {SUPPORT_ACRYLIC && (
                <MenuItem value={BackgroundType.Acrylic}>
                  {t('config.acrylic')}
                </MenuItem>
              )}
              {SUPPORT_MICA && (
                <MenuItem value={BackgroundType.Mica}>
                  {t('config.mica')}
                </MenuItem>
              )}
              <MenuItem value={BackgroundType.SinglePicture}>
                {t('config.useCover')}
              </MenuItem>
            </Select>
          }
        />

        <AnimatePresence>
          {showOpacity.includes(config.backgroundMiniWindow.type) && (
            <motion.div
              className='flex gap-4 me-6'
              layout
              variants={VERTICAL}
              custom='30px'
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              {t('config.opacity')}
              <Slider
                value={opacityMini}
                onChange={(_, val) => {
                  setOpacityMini(val);
                }}
                onChangeCommitted={(_, val) =>
                  updateConfig({
                    backgroundMiniWindow: {
                      ...config.backgroundMiniWindow,
                      opacity: val,
                    },
                  })
                }
                valueLabelDisplay='auto'
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LabelControlPair
        label={t('config.globalFont')}
        ref={addRef('globalFont')}
        control={
          <FontSelect
            value={font}
            onChange={(val) => setFont(val)}
            onBlur={() => updateConfig({ globalFont: font })}
          />
        }
      />

      <FormControlLabel
        ref={addRef('advancedMaterial')}
        label={t('config.advancedMaterial')}
        control={
          <Switch
            checked={config.advancedMaterial}
            onChange={(_, val) => updateConfig({ advancedMaterial: val })}
          />
        }
      />

      <FormControlLabel
        ref={addRef('sharpStyle')}
        label={t('config.sharpStyle')}
        control={
          <Switch
            checked={config.sharpStyle}
            onChange={(_, val) => updateConfig({ sharpStyle: val })}
          />
        }
      />

      <LabelControlPair
        ref={addRef('animationDuration')}
        label={t('config.animationDuration')}
        control={
          <div className='ms-6 me-6'>
            <Slider
              step={null}
              marks={animationDurationMarks}
              value={animationDuration}
              onChange={(_, val) => setAnimationDuration(val)}
              onChangeCommitted={(_, val) =>
                updateConfig({
                  animationDuration: parseFloat(
                    animationDurationMarks[val].label,
                  ),
                })
              }
              max={6}
            />
          </div>
        }
      />
    </div>
  );
}

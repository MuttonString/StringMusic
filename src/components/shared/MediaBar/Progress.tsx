import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import { tooltipClasses } from '@mui/material/Tooltip';
import { emit } from '@tauri-apps/api/event';
import { AnimatePresence, motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import WaveformGenerator from 'waveform-generator-web';
import { useAudio } from '../../../providers/AudioProvider';
import { useConfig } from '../../../providers/ConfigProvider';
import { BackendEvent } from '../../../types/backend';
import { ShowAudioWave } from '../../../types/config';
import { isRTL } from '../../../utils/window';
import Tip from '../../ui/Tip';

const formatTime = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const MotionSlider = motion.create(Slider);

export default function Progress() {
  const [config] = useConfig();
  const media = useAudio();
  const currSong = media.playQueue[media.currIdx];

  const draggingRef = useRef(false);
  const [sliderVal, setSliderVal] = useState(media.currentTime);
  useEffect(() => {
    if (draggingRef.current) return;
    setSliderVal(media.currentTime);
  }, [media.currentTime]);

  // 显示悬停处的时间
  const [sliderLabel, setSliderLabel] = useState('');
  const duration = currSong?.duration || 0;
  const [pointerX, setPointerX] = useState(NaN);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const slider = e.currentTarget;
      const rect = slider.getBoundingClientRect();
      const relativeX = isRTL()
        ? rect.right - e.clientX
        : e.clientX - rect.left;
      const value = Math.round((relativeX / rect.width) * duration);
      setSliderLabel(
        formatTime(Math.min(Math.floor(duration), Math.max(value, 0))),
      );
      setPointerX(relativeX > rect.width || relativeX < 0 ? NaN : relativeX);
    },
    [duration],
  );

  // 显示波形
  const showAudioWaveMode = config.showAudioWave;
  const [showWave, setShowWave] = useState(
    showAudioWaveMode === ShowAudioWave.Always,
  );
  useEffect(() => {
    setShowWave(showAudioWaveMode === ShowAudioWave.Always);
  }, [showAudioWaveMode]);

  const [waveSrc, setWaveSrc] = useState<string>();
  const primaryColor = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--mui-palette-primary-main');

  useEffect(() => {
    let cancelled = false;
    setWaveSrc(undefined);
    if (showAudioWaveMode === ShowAudioWave.Never || !media.currArrayBuffer) {
      return;
    }

    const generator = new WaveformGenerator(media.currArrayBuffer);
    generator
      .getWaveform({
        waveformColor: primaryColor,
        waveformWidth: 2000,
        waveformHeight: 56,
        barAlign: 'center',
        barWidth: 1,
        barGap: 0,
        drawMode: 'png',
      })
      .then((val) => {
        if (cancelled) return;
        setWaveSrc(val);
      })
      .catch((err) => console.error('Failed to get waveform: ' + err));

    return () => {
      cancelled = true;
    };
  }, [media.currArrayBuffer, primaryColor, showAudioWaveMode]);

  return (
    <div className='flex gap-2 items-center'>
      <div className='w-10'>{formatTime(sliderVal)}</div>
      <Tip
        disabled={media.pending}
        title={sliderLabel}
        placement='top'
        enterDelay={0}
        enterNextDelay={0}
        enterTouchDelay={0}
        arrow
        followCursor
        slotProps={{
          popper: {
            sx: {
              [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                {
                  marginBottom: '20px',
                },
            },
          },
          tooltip: isNaN(pointerX) ? { sx: { display: 'none' } } : undefined,
        }}
      >
        <motion.div
          className='w-full flex h-7 relative'
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setPointerX(NaN)}
          onHoverStart={
            showAudioWaveMode === ShowAudioWave.OnHover
              ? () => setShowWave(true)
              : undefined
          }
          onHoverEnd={
            showAudioWaveMode === ShowAudioWave.OnHover
              ? () => setShowWave(false)
              : undefined
          }
        >
          {/* 波形 */}
          <AnimatePresence initial={false}>
            {showWave && (
              <motion.div
                className='absolute h-7 w-full'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: config.animationDuration * 0.15,
                }}
              >
                {/* 未播放波形 */}
                {waveSrc && (
                  <img
                    className='absolute rtl:-scale-x-100 h-full w-full opacity-(--mui-palette-action-disabledOpacity)'
                    alt=''
                    src={waveSrc}
                  />
                )}
                {/* 未播放中线 */}
                <Divider className='absolute w-full top-[calc(50%-0.5px)]' />
                {/* 已播放波形 */}
                {waveSrc && (
                  <motion.img
                    className='absolute rtl:-scale-x-100 h-full w-full'
                    initial={false}
                    animate={{
                      clipPath: `inset(0 ${100 - (sliderVal / duration) * 100}% 0 0)`,
                    }}
                    transition={{
                      duration: draggingRef.current
                        ? 0
                        : config.animationDuration * 0.15,
                    }}
                    alt=''
                    src={waveSrc}
                  />
                )}
                {/* 已播放中线 */}
                <motion.div
                  className='absolute h-px top-[calc(50%-0.5px)] bg-primary-dark dark:bg-primary-light'
                  initial={false}
                  animate={{
                    width: (sliderVal / duration) * 100 + '%',
                  }}
                  transition={{
                    duration: draggingRef.current
                      ? 0
                      : config.animationDuration * 0.15,
                  }}
                />
                {/* 播放位置指示 */}
                <motion.div
                  className='absolute h-full w-px bg-text-disabled'
                  initial={false}
                  animate={{
                    insetInlineStart: (sliderVal / duration) * 100 + '%',
                  }}
                  transition={{
                    duration: draggingRef.current
                      ? 0
                      : config.animationDuration * 0.15,
                  }}
                />
                {/* 光标指示 */}
                {!isNaN(pointerX) && (
                  <div
                    className='absolute h-full w-px bg-text-primary'
                    style={{ insetInlineStart: pointerX - 0.5 + 'px' }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 进度条 */}
          <MotionSlider
            className='absolute inset-0'
            style={
              showAudioWaveMode === ShowAudioWave.Never
                ? undefined
                : { cursor: 'default' }
            }
            initial={false}
            animate={{ opacity: showWave ? 0 : 1 }}
            transition={{
              duration: config.animationDuration * 0.15,
            }}
            size='small'
            max={duration}
            marks={currSong.marks?.map((item) => ({ value: item }))}
            disabled={media.pending}
            value={sliderVal}
            onChange={(_, val) => {
              draggingRef.current = true;
              setSliderVal(val as number);
            }}
            onChangeCommitted={(_, val) => {
              draggingRef.current = false;
              emit(BackendEvent.SetPosition, val as number);
            }}
          />
        </motion.div>
      </Tip>
      <div className='w-10 text-end'>
        {formatTime(Math.floor(currSong.duration ?? 0))}
      </div>
    </div>
  );
}

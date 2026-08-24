import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import defaultCover from '../../../assets/CD.png';
import { BASE_COMPONENT } from '../../../constants/animation';
import {
  MD_WIDTH,
  MEDIA_BAR_HEIGHT,
  SM_WIDTH,
} from '../../../constants/window';
import useLongPress from '../../../hooks/useLongPress';
import useWidthQuery from '../../../hooks/useWidthQuery';
import { useAudio } from '../../../providers/AudioProvider';
import { useConfig } from '../../../providers/ConfigProvider';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import Tip from '../../ui/Tip';

export default function MediaBar() {
  const [config, updateConfig] = useConfig();
  const { t } = useTranslation();
  const media = useAudio();
  const showFooter = config.enableDevOptions && config.showFooter;
  const wide = useWidthQuery(MD_WIDTH);
  const notNarrow = useWidthQuery(SM_WIDTH);
  const rotation = useMotionValue(0);
  const resetAnimation = useRef<ReturnType<typeof animate> | null>(null);

  const realSpeed = useMemo(
    () => config.speed * 2 ** (config.detune / 1200),
    [config.detune, config.speed],
  );

  const coverLongPress = useLongPress(
    () => {
      updateConfig({ coverRotate: !config.coverRotate });
    },
    () => {
      //todo playpage
    },
  );

  useEffect(() => {
    if (config.coverRotate) {
      if (resetAnimation.current) {
        resetAnimation.current.stop();
        resetAnimation.current = null;
      }
    } else {
      if (resetAnimation.current) {
        resetAnimation.current.stop();
        resetAnimation.current = null;
      }
      resetAnimation.current = animate(rotation, 0);
    }
  }, [rotation, config.coverRotate]);

  useAnimationFrame((_, delta) => {
    if (config.coverRotate && !media.paused) {
      const increment = (delta / 1000) * (360 / 15) * realSpeed;
      rotation.set((rotation.get() + increment) % 360);
    }
  });

  return (
    <motion.div
      initial={{ insetInlineStart: '0.5rem', bottom: '0.5rem' }}
      animate={{
        insetInlineStart: wide
          ? '15.5rem' // SIDE_BAR_WIDTH + 0.5rem
          : '0.5rem',
        bottom: showFooter ? '2.5rem' : '0.5rem',
      }}
      className='z-10 overflow-clip MuiPopover-paper h-(--media-bar-height) rounded-full! fixed overlay-16 inset-e-2 shadow-2 border border-divider'
    >
      <AnimatePresence>
        {notNarrow && media.playQueue[media.currIdx] && (
          <motion.div
            variants={BASE_COMPONENT}
            custom={{ w: MEDIA_BAR_HEIGHT }}
            initial='hidden'
            whileInView='visible'
            exit='hidden'
            layout
            className='m-1'
          >
            <Tip
              title={`${showShortcutKey(t('media.playPage'), KeyCode.Ctrl, 'N')}\n${t(
                config.coverRotate
                  ? 'media.disableCoverRotate'
                  : 'media.enableCoverRotate',
              )}`}
            >
              <motion.img
                alt={t('media.playPage')}
                className='bg-background-default rounded-full! h-18 w-18 shadow-2 cursor-pointer'
                style={{ rotate: rotation }}
                src={media.playQueue[media.currIdx].cover || defaultCover}
                onError={(e) => {
                  e.currentTarget.src = defaultCover;
                  e.currentTarget.onerror = null;
                }}
                {...coverLongPress}
              />
            </Tip>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

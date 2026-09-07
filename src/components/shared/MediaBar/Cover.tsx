import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import defaultCover from '../../../assets/CD.png';
import { BASE_COMPONENT } from '../../../constants/animation';
import { MEDIA_BAR_HEIGHT } from '../../../constants/window';
import useLongPress from '../../../hooks/useLongPress';
import { useAudio } from '../../../providers/AudioProvider';
import { useConfig } from '../../../providers/ConfigProvider';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import Tip from '../../ui/Tip';

export default function Cover() {
  const [config, updateConfig] = useConfig();
  const { t } = useTranslation();
  const media = useAudio();
  const rotation = useMotionValue(0);
  const resetAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const currSong = media.playQueue[media.currIdx];

  const rotationSpeed = useMemo(
    () => (360 / 15 / 1000) * config.speed * 2 ** (config.detune / 1200),
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

  // 封面旋转动画
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
      const increment = delta * rotationSpeed;
      rotation.set((rotation.get() + increment) % 360);
    }
  });

  return (
    <motion.div
      variants={BASE_COMPONENT}
      custom={{ w: MEDIA_BAR_HEIGHT }}
      initial='hidden'
      whileInView='visible'
      exit='hidden'
      layout
      className='p-1 h-(--media-bar-height)'
    >
      <Tip
        placement='top'
        title={`${showShortcutKey(t('media.playPage'), KeyCode.Ctrl, 'N')}\n${t(
          config.coverRotate
            ? 'media.disableCoverRotate'
            : 'media.enableCoverRotate',
        )}`}
      >
        <div>
          <motion.img
            alt={t('media.playPage')}
            className='bg-background-default object-cover object-center rounded-full! h-18 w-18 shadow-2 cursor-pointer'
            style={{ rotate: rotation }}
            src={currSong.cover || defaultCover}
            onError={(e) => {
              e.currentTarget.src = defaultCover;
              e.currentTarget.onerror = null;
            }}
            {...coverLongPress}
          />
        </div>
      </Tip>
    </motion.div>
  );
}

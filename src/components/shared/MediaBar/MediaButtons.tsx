import IconButton from '@mui/material/IconButton';
import { emit } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import { PRIMARY_MODIFIER_KEY } from '../../../constants/keys';
import { SM_WIDTH } from '../../../constants/window';
import useWidthQuery from '../../../hooks/useWidthQuery';
import { useAudio } from '../../../providers/AudioProvider';
import { useConfig } from '../../../providers/ConfigProvider';
import { BackendEvent } from '../../../types/backend';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import { isRTL } from '../../../utils/window';
import MaterialIcon from '../../ui/MaterialIcon';
import Tip from '../../ui/Tip';

export default function MediaButtons() {
  const [config] = useConfig();
  const { t } = useTranslation();
  const media = useAudio();
  const notNarrow = useWidthQuery(SM_WIDTH);

  const canChangeTrack = media.playQueue.length > 1;
  const prevSong = canChangeTrack && media.playQueue[media.prevIdx];
  const nextSong = canChangeTrack && media.playQueue[media.nextIdx];
  const canSeekBySentence = config.seekBySentence && media.lyric.length > 1;

  return (
    <div className='flex justify-between w-1/5 min-w-fit border border-divider rounded-full p-1'>
      {notNarrow && (
        <Tip
          placement='top'
          title={showShortcutKey(
            t(canSeekBySentence ? 'media.prevSentence' : 'media.prev10Sec'),
            KeyCode.Shift,
            isRTL() ? KeyCode.Right : KeyCode.Left,
          )}
          disabled={media.pending}
        >
          <IconButton
            size='small'
            className='p-0.75!'
            disabled={media.pending}
            onClick={() => emit(BackendEvent.SeekForward)}
          >
            <MaterialIcon
              name={
                isRTL()
                  ? canSeekBySentence
                    ? 'redo'
                    : 'forward10'
                  : canSeekBySentence
                    ? 'undo'
                    : 'replay10'
              }
            />
          </IconButton>
        </Tip>
      )}

      <Tip
        placement='top'
        disabled={!prevSong}
        title={
          prevSong && (
            <div className='flex flex-col'>
              <div className='font-bold'>
                {showShortcutKey(
                  t('media.prev'),
                  PRIMARY_MODIFIER_KEY,
                  isRTL() ? KeyCode.Right : KeyCode.Left,
                )}
              </div>
              <div className='flex gap-1 items-center'>
                {prevSong.cover && (
                  <img
                    alt=''
                    src={prevSong!.cover}
                    className='object-cover object-center w-8 h-8 rounded-lg'
                  />
                )}
                <div className='flex flex-col'>
                  <div>
                    {prevSong.title}
                    {prevSong.translation && (
                      <span className='ms-2 opacity-70'>
                        ({prevSong.translation})
                      </span>
                    )}
                  </div>
                  {prevSong.artists && (
                    <div className='opacity-70'>
                      {prevSong.artists.map((item) => item.label).join('; ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      >
        <IconButton
          size='small'
          className='p-0.75!'
          disabled={!prevSong}
          onClick={() => emit(BackendEvent.Previous)}
        >
          <MaterialIcon name={isRTL() ? 'fastForward' : 'fastRewind'} />
        </IconButton>
      </Tip>

      <Tip
        placement='top'
        disabled={media.pending}
        title={showShortcutKey(
          t(media.paused ? 'media.play' : 'media.pause'),
          PRIMARY_MODIFIER_KEY,
          'P',
        )}
      >
        <IconButton
          size='small'
          className='p-0! text-3xl!'
          loading={media.pending}
          onClick={() => emit(BackendEvent.Toggle)}
        >
          <MaterialIcon
            fontSize='inherit'
            name={media.paused ? 'playCircleFilled' : 'pauseCircleFilled'}
          />
        </IconButton>
      </Tip>

      <Tip
        placement='top'
        disabled={!nextSong}
        title={
          nextSong && (
            <div className='flex flex-col'>
              <div className='font-bold'>
                {showShortcutKey(
                  t('media.next'),
                  PRIMARY_MODIFIER_KEY,
                  isRTL() ? KeyCode.Left : KeyCode.Right,
                )}
              </div>
              <div className='flex gap-1 items-center'>
                {nextSong.cover && (
                  <img
                    alt=''
                    src={nextSong!.cover}
                    className='object-cover object-center w-8 h-8 rounded-lg'
                  />
                )}
                <div className='flex flex-col'>
                  <div>
                    {nextSong.title}
                    {nextSong.translation && (
                      <span className='ms-2 opacity-70'>
                        ({nextSong.translation})
                      </span>
                    )}
                  </div>
                  {nextSong.artists && (
                    <div className='opacity-70'>
                      {nextSong.artists.map((item) => item.label).join('; ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      >
        <IconButton
          size='small'
          className='p-0.75!'
          disabled={!nextSong}
          onClick={() => emit(BackendEvent.Next)}
        >
          <MaterialIcon name={isRTL() ? 'fastRewind' : 'fastForward'} />
        </IconButton>
      </Tip>

      {notNarrow && (
        <Tip
          placement='top'
          title={showShortcutKey(
            t(canSeekBySentence ? 'media.nextSentence' : 'media.next10Sec'),
            KeyCode.Shift,
            isRTL() ? KeyCode.Left : KeyCode.Right,
          )}
          disabled={media.pending}
        >
          <IconButton
            size='small'
            className='p-0.75!'
            disabled={media.pending}
            onClick={() => emit(BackendEvent.SeekBackward)}
          >
            <MaterialIcon
              name={
                isRTL()
                  ? canSeekBySentence
                    ? 'undo'
                    : 'replay10'
                  : canSeekBySentence
                    ? 'redo'
                    : 'forward10'
              }
            />
          </IconButton>
        </Tip>
      )}
    </div>
  );
}

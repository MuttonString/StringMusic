import Button from '@mui/material/Button';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { SM_WIDTH } from '../../../constants/window';
import useWidthQuery from '../../../hooks/useWidthQuery';
import { useAudio } from '../../../providers/AudioProvider';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import Tip from '../../ui/Tip';

export default function Metadata() {
  const { t } = useTranslation();
  const media = useAudio();
  const notNarrow = useWidthQuery(SM_WIDTH);
  const currSong = media.playQueue[media.currIdx];

  return (
    <div
      className={classNames(
        'flex flex-col align-middle',
        notNarrow
          ? 'max-w-[calc(100%-max(20%,160px))]'
          : 'max-w-[calc(100%-max(20%,100px))]',
      )}
    >
      {/* 标题 */}
      <div className='leading-none'>
        <Tip
          placement='top'
          title={
            <div className='flex flex-col'>
              <div>{currSong.title}</div>
              {currSong.translation && (
                <div className='opacity-70'>({currSong.translation})</div>
              )}
              <div>
                {showShortcutKey(t('media.playPage'), KeyCode.Ctrl, 'N')}
              </div>
            </div>
          }
        >
          <Button
            size='small'
            color='inherit'
            className='pt-0! pb-0! max-w-full min-w-0!'
          >
            <div className='truncate font-bold'>{currSong.title}</div>
            {currSong.translation && (
              <div className='ms-2 truncate font-bold text-text-secondary'>
                ({currSong.translation})
              </div>
            )}
          </Button>
        </Tip>
      </div>

      {/* 艺术家和专辑 */}
      {((currSong.artists && currSong.artists.length > 0) ||
        currSong.album) && (
        <div className='flex items-center w-full'>
          {currSong.artists && currSong.artists.length > 0 && (
            <div className='flex items-center max-w-4/5'>
              {currSong.artists.map((item, idx) => (
                <Tip
                  placement='top'
                  key={idx}
                  title={
                    <div className='flex flex-col'>
                      <div className='font-bold'>{t('media.artist')}</div>
                      <div>{item.label}</div>
                      {item.translation && (
                        <div className='opacity-70'>({item.translation})</div>
                      )}
                    </div>
                  }
                >
                  <div className='shrink grow-0 min-w-0 leading-none'>
                    <Button
                      size='small'
                      color='inherit'
                      className='pt-0! pb-0! w-full min-w-0!'
                      disabled={!item.api}
                    >
                      <div
                        className={classNames(
                          'truncate',
                          item.api
                            ? 'text-text-secondary'
                            : 'text-text-disabled',
                        )}
                      >
                        {item.label}
                      </div>
                    </Button>
                  </div>
                </Tip>
              ))}
            </div>
          )}

          {currSong.artists &&
            currSong.artists.length > 0 &&
            currSong.album && (
              <div className='leading-none text-divider'>|</div>
            )}

          {currSong.album && (
            <Tip
              placement='top'
              title={
                <div className='flex flex-col'>
                  <div className='font-bold'>{t('media.album')}</div>
                  <div>{currSong.album.label}</div>
                  {currSong.album.translation && (
                    <div className='opacity-70'>
                      ({currSong.album.translation})
                    </div>
                  )}
                </div>
              }
            >
              <div className='flex min-w-0'>
                <Button
                  size='small'
                  color='inherit'
                  className='pt-0! pb-0! min-w-0!'
                  disabled={!currSong.album.api}
                >
                  <div
                    className={classNames(
                      'truncate',
                      currSong.album.api
                        ? 'text-text-secondary'
                        : 'text-text-disabled',
                    )}
                  >
                    {currSong.album.label}
                  </div>
                </Button>
              </div>
            </Tip>
          )}
        </div>
      )}
    </div>
  );
}

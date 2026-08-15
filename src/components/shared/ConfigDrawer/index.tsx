import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import TextField from '@mui/material/TextField';
import type { RefObject } from 'react';
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  CONFIG_GROUP_ID_LIST,
  CONFIG_ID_LIST,
  DEV_CONFIG_GROUP_ID_LIST,
  DEV_CONFIG_ID_LIST,
} from '../../../constants/config';
import { useConfig } from '../../../providers/ConfigProvider';
import type { OpenConfigDrawerFn } from '../../../types/component';
import { getLangs } from '../../../utils/lang';
import About from './About';
import Common from './Common';
import DevOptions from './DevOptions';
import WindowAppeance from './WindowAppeearance';

interface Props {
  ref: RefObject<OpenConfigDrawerFn>;
}

export default function ConfigDrawer({ ref }: Props) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const { t } = useTranslation();

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

  const [config] = useConfig();
  const devEnabled = config.enableDevOptions;

  const defaultOptions: { id: string; label: string }[] = useMemo(
    () =>
      [...CONFIG_GROUP_ID_LIST, devEnabled && DEV_CONFIG_GROUP_ID_LIST]
        .filter(Boolean)
        .map((item) => ({ id: item as string, label: t('config.' + item) })),
    [devEnabled, t],
  );

  const options: typeof defaultOptions = useMemo(
    () => [
      ...defaultOptions,
      ...[...CONFIG_ID_LIST, ...(devEnabled ? DEV_CONFIG_ID_LIST : [])].map(
        (item) => ({
          id: item,
          label: t('config.' + item),
        }),
      ),
    ],
    [defaultOptions, devEnabled, t],
  );

  return (
    <SwipeableDrawer
      disableSwipeToOpen
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      anchor='right'
    >
      <div className='w-75 h-full overflow-clip flex flex-col'>
        <div className='p-4'>
          <Autocomplete
            openOnFocus
            forcePopupIcon={false}
            size='small'
            popupIcon={null}
            value={null}
            onChange={(_, val) => {
              if (val) {
                handleJump(val.id);
              }
              setSearchInput('');
            }}
            options={options}
            filterOptions={(opt, { inputValue }) => {
              const val = inputValue.trim();
              if (!val.trim()) {
                return defaultOptions;
              }
              const lang = getLangs();
              return opt.filter((item) =>
                item.id
                  .toLocaleLowerCase(lang)
                  .includes(val.toLocaleLowerCase(lang)),
              );
            }}
            inputValue={searchInput}
            onInputChange={(_, val) => setSearchInput(val)}
            fullWidth
            renderInput={(params) => (
              <TextField
                aria-label={t('config.search')}
                placeholder={t('config.search')}
                variant='standard'
                {...params}
              />
            )}
          />
        </div>
        <Divider />

        <div className='overflow-auto flex-1 p-4 flex flex-col gap-12'>
          <Common refs={refs} />
          <WindowAppeance refs={refs} />
          <About refs={refs} />
          {devEnabled && <DevOptions refs={refs} />}
        </div>
      </div>
    </SwipeableDrawer>
  );
}

import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { invoke } from '@tauri-apps/api/core';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import FiltersSvg from '../../../assets/filters.svg?react';
import { PRIMARY_MODIFIER_KEY } from '../../../constants/keys';
import { IS_DESKTOP } from '../../../constants/os';
import { useNavigator } from '../../../providers/NavigatorProvider';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import MaterialIcon from '../../ui/MaterialIcon';
import Tip from '../../ui/Tip';

const enum VisionFilters {
  None = '',
  Blurred = 'blur(2px)',
  Protanopia = 'url("#protanopia")',
  Deuteranopia = 'url("#deuteranopia")',
  Tritanopia = 'url("#tritanopia")',
  Achromatopsia = 'url("#achromatopsia")',
}

const originalFetch = window.fetch;
const originalSend = XMLHttpRequest.prototype.send;

interface Props {
  ref?: RefObject<HTMLElement>;
}

export default function Footer({ ref }: Props) {
  const location = useLocation();
  const [input, setInput] = useState('');
  const { goTo } = useNavigator();
  const { t } = useTranslation();
  const [networkSimAnchor, setNetworkSimAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [visionSimAnchor, setVisionSimAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [networkSim, setNetWorkSim] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setInput(location.pathname + location.search + location.hash);
  }, [location]);

  const networkSimItems = useMemo(
    () => [t('footer.none'), t('footer.slow'), t('footer.offline')],
    [t],
  );

  const visionSimItems = useMemo(
    () => [
      { id: VisionFilters.None, label: t('footer.none') },
      { id: VisionFilters.Blurred, label: t('footer.blurred') },
      { id: VisionFilters.Protanopia, label: t('footer.protanopia') },
      { id: VisionFilters.Deuteranopia, label: t('footer.deuteranopia') },
      { id: VisionFilters.Tritanopia, label: t('footer.tritanopia') },
      { id: VisionFilters.Achromatopsia, label: t('footer.achromatopsia') },
    ],
    [t],
  );

  const simulateNetwork = useCallback((type: 0 | 1 | 2) => {
    setNetWorkSim(type);
    setNetworkSimAnchor(null);
    switch (type) {
      case 0:
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.send = originalSend;
        break;
      case 1:
        const delay = () => Math.random() * 2000 + 2000;
        window.fetch = function (...args) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalFetch(...args)
                .then((resp) => resolve(resp))
                .catch((err) => reject(err));
            }, delay());
          });
        };
        XMLHttpRequest.prototype.send = function (...args) {
          setTimeout(() => {
            originalSend.call(this, ...args);
          }, delay());
        };
        break;
      case 2:
        window.fetch = function () {
          return new Promise((_, reject) => {
            const error = new TypeError('(Simulation) Failed to fetch');
            error.name = 'TypeError';
            reject(error);
          });
        };
        XMLHttpRequest.prototype.send = function () {
          Object.defineProperty(this, 'readyState', { value: 4 });
          Object.defineProperty(this, 'status', { value: 0 });
          Object.defineProperty(this, 'response', { value: '' });
          Object.defineProperty(this, 'responseText', { value: '' });
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('error'));
        };
        break;
    }
  }, []);

  // 销毁时还原调试设置
  useEffect(
    () => () => {
      document.documentElement.style = '';
      simulateNetwork(0);
    },
    [simulateNetwork],
  );

  return (
    <footer
      ref={ref}
      className='w-full bg-(--bg-color) border-t border-divider flex ps-1 pe-1'
    >
      <InputBase
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === KeyCode.Enter) {
            goTo(input);
          }
        }}
      />

      <Tip
        title={showShortcutKey(t('footer.refresh'), PRIMARY_MODIFIER_KEY, 'R')}
      >
        <IconButton
          aria-label={t('footer.refresh')}
          size='small'
          onClick={() => window.location.reload()}
        >
          <MaterialIcon name='refresh' fontSize='small' />
        </IconButton>
      </Tip>

      <Tip title={t('footer.networkSim')}>
        <IconButton
          size='small'
          onClick={(e) => setNetworkSimAnchor(e.currentTarget)}
        >
          {networkSim === 2 ? (
            <MaterialIcon name='publicOff' fontSize='small' />
          ) : (
            <MaterialIcon name='public' fontSize='small' />
          )}
        </IconButton>
      </Tip>
      <Menu
        open={!!networkSimAnchor}
        onClose={() => setNetworkSimAnchor(null)}
        anchorEl={networkSimAnchor}
      >
        {networkSimItems.map((item, idx) => (
          <MenuItem
            key={idx}
            selected={idx === networkSim}
            onClick={() => simulateNetwork(idx as 0 | 1 | 2)}
          >
            {item}
          </MenuItem>
        ))}
      </Menu>

      <Tip title={t('footer.visionSim')}>
        <IconButton
          size='small'
          onClick={(e) => setVisionSimAnchor(e.currentTarget)}
        >
          <MaterialIcon name='visibility' fontSize='small' />
        </IconButton>
      </Tip>
      <FiltersSvg style={{ display: 'none' }} />
      <Menu
        open={!!visionSimAnchor}
        onClose={() => setVisionSimAnchor(null)}
        anchorEl={visionSimAnchor}
      >
        {visionSimItems.map((item) => (
          <MenuItem
            key={item.id}
            selected={item.id === document.documentElement.style.filter}
            onClick={() => {
              setVisionSimAnchor(null);
              if (item.id) document.documentElement.style.filter = item.id;
              else document.documentElement.style = '';
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      {IS_DESKTOP && (
        <Tip
          title={showShortcutKey(
            t('footer.devtools'),
            PRIMARY_MODIFIER_KEY,
            KeyCode.Shift,
            'I',
          )}
        >
          <IconButton
            aria-label={t('footer.devtools')}
            size='small'
            onClick={() => invoke('open_devtools')}
          >
            <MaterialIcon name='code' fontSize='small' />
          </IconButton>
        </Tip>
      )}
    </footer>
  );
}

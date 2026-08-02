import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CodeSharpIcon from '@mui/icons-material/CodeSharp';
import PublicOffRoundedIcon from '@mui/icons-material/PublicOffRounded';
import PublicOffSharpIcon from '@mui/icons-material/PublicOffSharp';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PublicSharpIcon from '@mui/icons-material/PublicSharp';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RefreshSharpIcon from '@mui/icons-material/RefreshSharp';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import FiltersSvg from '../../assets/filters.svg?react';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';
import useSnackbar from '../../hooks/useSnackbar';
import {
  KeyCode,
  PRIMARY_MODIFIER_KEY,
  showShortcutKey,
} from '../../utils/shortcutKey';
import Tip from '../Tip';
import styles from './index.module.less';

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

export default function Footer() {
  const location = useLocation();
  const [input, setInput] = useState('');
  const { goTo } = useDetailHistory();
  const { t } = useTranslation();
  const [settings] = useSettings();
  const sharp = settings!.personalization.disableRoundCorner;
  const snackbar = useSnackbar();
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

  useEffect(
    () => () => {
      document.documentElement.style = '';
      simulateNetwork(0);
    },
    [simulateNetwork],
  );

  return (
    <footer className={styles.footer}>
      <div>
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
          title={showShortcutKey(
            t('footer.refresh'),
            PRIMARY_MODIFIER_KEY,
            'R',
          )}
        >
          <IconButton
            aria-label={t('footer.refresh')}
            size='small'
            onClick={() => window.location.reload()}
          >
            {sharp ? (
              <RefreshSharpIcon fontSize='small' />
            ) : (
              <RefreshRoundedIcon fontSize='small' />
            )}
          </IconButton>
        </Tip>

        <Tip title={t('footer.networkSim')}>
          <IconButton
            size='small'
            onClick={(e) => setNetworkSimAnchor(e.currentTarget)}
          >
            {sharp ? (
              networkSim === 2 ? (
                <PublicOffSharpIcon fontSize='small' />
              ) : (
                <PublicSharpIcon fontSize='small' />
              )
            ) : networkSim === 2 ? (
              <PublicOffRoundedIcon fontSize='small' />
            ) : (
              <PublicRoundedIcon fontSize='small' />
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
            {sharp ? (
              <VisibilitySharpIcon fontSize='small' />
            ) : (
              <VisibilityRoundedIcon fontSize='small' />
            )}
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
            onClick={() =>
              invoke('open_devtools').catch((err) => {
                console.error('Failed to open DevTools: ' + err);
                snackbar(
                  <>
                    {t('msg.devtoolFail')}
                    <br />
                    {err}
                  </>,
                  'error',
                );
              })
            }
          >
            {sharp ? (
              <CodeSharpIcon fontSize='small' />
            ) : (
              <CodeRoundedIcon fontSize='small' />
            )}
          </IconButton>
        </Tip>
      </div>
    </footer>
  );
}

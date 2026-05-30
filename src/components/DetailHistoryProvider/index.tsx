import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';
import SettingsSharpIcon from '@mui/icons-material/SettingsBrightnessSharp';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import useSettings from '../../hooks/useSettings';
import type { BrowsingItem, IDetailHistory } from '../../types/history';
import { PageAnimation } from '../../types/history';

interface IProps {
  children: ReactNode;
}

const iconMap: { [key: string]: [ReactNode, ReactNode] } = {
  '/': [
    <HomeRoundedIcon key={0} fontSize='small' />,
    <HomeSharpIcon key={1} fontSize='small' />,
  ],
  '/settings': [
    <SettingsRoundedIcon key={0} fontSize='small' />,
    <SettingsSharpIcon key={1} fontSize='small' />,
  ],
} as const;

const titleMap: { [key: string]: string } = {
  '/': 'page.home',
  '/settings': 'page.settings',
} as const;

export const DetailHistoryContext = createContext<IDetailHistory | null>(null);

export default function DetailHistoryProvider({ children }: IProps) {
  const { t } = useTranslation();
  const [settings] = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [prev, setPrev] = useState<BrowsingItem[]>([]);
  const [next, setNext] = useState<BrowsingItem[]>([]);
  const [current, setCurrent] = useState<BrowsingItem>({
    icon: iconMap[location.pathname][
      Number(settings?.personalization.colorMode)
    ] || <SentimentVeryDissatisfiedRoundedIcon fontSize='small' />,
    title: t(titleMap[location.pathname]) || location.pathname,
  });
  const [animation, setAnimation] = useState<PageAnimation>();

  useEffect(() => {
    const curr = {
      icon: iconMap[location.pathname][
        Number(settings?.personalization.colorMode)
      ] || <SentimentVeryDissatisfiedRoundedIcon fontSize='small' />,
      title: t(titleMap[location.pathname]) || location.pathname,
    };
    setCurrent(curr);
  }, [location, t, settings]);

  const goBack = useCallback(
    (n = 1, animation = PageAnimation.Back) => {
      if (n <= 0 || n > prev.length) return;
      setPrev(prev.slice(0, -n));
      if (n === 1) {
        setNext([current, ...next]);
      } else {
        setNext([...prev.slice(-n + 1), current, ...next]);
      }
      setAnimation(animation);
      console.info(`Navigate back ${n} step(s).`);
      navigate(-n);
    },
    [current, navigate, next, prev],
  );

  const goForward = useCallback(
    (n = 1, animation = PageAnimation.Forward) => {
      if (n <= 0 || n > next.length) return;
      setNext(next.slice(n));
      setPrev([...prev, current, ...next.slice(0, n - 1)]);
      setAnimation(animation);
      console.info(`Navigate forward ${n} step(s).`);
      navigate(n);
    },
    [current, navigate, next, prev],
  );

  const goTo = useCallback(
    (path: string, animation = PageAnimation.New) => {
      setPrev([...prev, current]);
      setNext([]);
      setAnimation(animation);
      console.info(`Navigate to ${path}.`);
      navigate(path);
    },
    [current, navigate, prev],
  );

  const setTitle = useCallback(
    (title: string) => {
      console.info(`Set page title from "${current.title}" to "${title}".`);
      setCurrent({ ...current, title });
    },
    [current],
  );

  return (
    <DetailHistoryContext.Provider
      value={{
        prev,
        current,
        next,
        goBack,
        goForward,
        goTo,
        setTitle,
        animation,
      }}
    >
      {children}
    </DetailHistoryContext.Provider>
  );
}

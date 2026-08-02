import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import QuestionMarkSharpIcon from '@mui/icons-material/QuestionMarkSharp';
import { type } from '@tauri-apps/plugin-os';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { onBackpressed } from 'tauri-plugin-backpressed';
import useSettings from '../../hooks/useSettings';
import type { BrowsingItem, IDetailHistory } from '../../types/history';
import { PageAnimation } from '../../types/history';

interface IProps {
  children: ReactNode;
}

const isMobile = ['android', 'ios'].includes(type());

const iconMap: Record<string, [ReactNode, ReactNode]> = {
  home: [
    <HomeRoundedIcon key={0} fontSize='small' />,
    <HomeSharpIcon key={1} fontSize='small' />,
  ],
  _: [
    <QuestionMarkRoundedIcon key={0} fontSize='small' />,
    <QuestionMarkSharpIcon key={1} fontSize='small' />,
  ],
} as const;

const titleMap: Record<string, string> = {
  home: 'page.home',
} as const;

export const DetailHistoryContext = createContext<IDetailHistory | null>(null);

export default function DetailHistoryProvider({ children }: IProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/')[1];
  const [settings] = useSettings();
  const iconType = Number(settings?.personalization.disableRoundCorner);
  const [prev, setPrev] = useState<BrowsingItem[]>([]);
  const [next, setNext] = useState<BrowsingItem[]>([]);
  const [current, setCurrent] = useState<BrowsingItem>({
    icon: null,
    title: '',
  });
  const [animation, setAnimation] = useState<PageAnimation>();

  useEffect(() => {
    const curr = {
      icon: (iconMap[path] || iconMap['_'])[iconType],
      title: t(titleMap[path]) || path,
    };
    setCurrent(curr);
  }, [iconType, path, t]);

  const goBack = useCallback(
    (n = 1, animation = PageAnimation.Back) => {
      if (n <= 0 || n > prev.length) return false;
      setPrev(prev.slice(0, -n));
      if (n === 1) {
        setNext([current, ...next]);
      } else {
        setNext([...prev.slice(-n + 1), current, ...next]);
      }
      setAnimation(animation);
      console.info(`Navigate back ${n} step(s).`);
      navigate(-n);
      return true;
    },
    [current, navigate, next, prev],
  );

  const goForward = useCallback(
    (n = 1, animation = PageAnimation.Forward) => {
      if (n <= 0 || n > next.length) return false;
      setNext(next.slice(n));
      setPrev([...prev, current, ...next.slice(0, n - 1)]);
      setAnimation(animation);
      console.info(`Navigate forward ${n} step(s).`);
      navigate(n);
      return true;
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

  // 拦截原生鼠标前进、后退按钮的事件
  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      e.preventDefault();
      switch (e.button) {
        case 3:
          console.info('Mouse back button pressed.');
          goBack();
          break;
        case 4:
          console.info('Mouse forward button pressed.');
          goForward();
          break;
      }
    };
    window.addEventListener('mouseup', mouseHandler, true);

    return () => window.removeEventListener('mouseup', mouseHandler, true);
  }, [goBack, goForward]);

  // 拦截移动端后退事件
  useEffect(() => {
    if (!isMobile) return;

    const unlisten = onBackpressed((e) => {
      console.info(`Action ${e.source} (${e.requestId}) performed.`);
      return goBack();
    }).catch((err) =>
      console.error('Can not listen back pressed event: ' + err),
    );

    return () => {
      unlisten.then((fn) => {
        if (fn) fn.unregister();
      });
    };
  }, [goBack, goForward]);

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

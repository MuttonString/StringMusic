import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { LIST_ITEM } from '../../../constants/animation';
import { useConfigDrawer } from '../../../providers/ConfigDrawerProvider';
import { useConfig } from '../../../providers/ConfigProvider';
import { useNavigator } from '../../../providers/NavigatorProvider';
import MaterialIcon from '../../ui/MaterialIcon';
import MotionList from '../../ui/MotionList';

interface Props {
  onButtonClicked?: () => void;
  noAnimation?: boolean;
  className?: string;
}

const MotionLiBtn = motion.create(ListItemButton);

export default function NavigatorList({
  onButtonClicked,
  className,
  noAnimation,
}: Props) {
  const [config] = useConfig();
  const openDrawer = useConfigDrawer();
  const [selected, setSelected] = useState('');
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const { t } = useTranslation();
  const { goTo } = useNavigator();
  const [disabled, setDisabled] = useState<string[]>([]);

  const Li = useMemo(() => (noAnimation ? List : MotionList), [noAnimation]);
  const Btn = useMemo(
    () => (noAnimation ? ListItemButton : MotionLiBtn),
    [noAnimation],
  );

  const items = useMemo(
    () => [
      {
        id: 'home',
        icon: <MaterialIcon name='home' />,
        label: t('page.home'),
      },
      {
        id: 'recommendation',
        icon: <MaterialIcon name='assistant' />,
        label: t('page.recommendation'),
      },
      {
        id: 'recent',
        icon: <MaterialIcon name='history' />,
        label: t('page.recent'),
      },
      {
        id: 'artistCollection',
        icon: <MaterialIcon name='peopleAlt' />,
        label: t('page.artistCollection'),
      },
      {
        id: 'albumCollection',
        icon: <MaterialIcon name='album' />,
        label: t('page.albumCollection'),
      },
      {
        id: 'mvCollection',
        icon: <MaterialIcon name='videoLibrary' />,
        label: t('page.mvCollection'),
      },
      {
        id: 'songCollection',
        icon: <MaterialIcon name='libraryMusic' />,
        label: t('page.songCollection'),
      },
      {
        id: 'playlistCollection',
        icon: <MaterialIcon name='playlistAddCheckCircle' />,
        label: t('page.playlistCollection'),
      },
      {
        id: 'myPlaylist',
        icon: <MaterialIcon name='playlistAddCheck' />,
        label: t('page.myPlaylist'),
      },
    ],
    [t],
  );

  useEffect(() => {
    setSelected(path);
  }, [path]);

  useEffect(() => {
    const newDisabled = [];
    if (!config.recommendation) {
      newDisabled.push('recommendation');
    }
    if (!config.recentPlayed) {
      newDisabled.push('recent');
    }
    setDisabled(newDisabled);
  }, [config.recentPlayed, config.recommendation]);

  return (
    <div
      className={classNames(
        'flex flex-col justify-between w-full h-full',
        className,
      )}
    >
      <Li className='[body:not(.sharp-corner)_&]:ml-2! [body:not(.sharp-corner)_&]:mr-2!'>
        {items
          .filter((item) => !disabled.includes(item.id))
          .map((item) => (
            <Btn
              className='[body:not(.sharp-corner)_&]:ps-2! [body:not(.sharp-corner)_&]:pe-2!'
              layout={noAnimation ? undefined : true}
              variants={noAnimation ? undefined : LIST_ITEM}
              key={item.id}
              selected={selected === item.id}
              onClick={() => {
                if (selected === item.id) return;
                setSelected(item.id);
                goTo('/' + item.id);
                onButtonClicked?.();
              }}
            >
              <ListItemIcon
                className={classNames(
                  selected === item.id && 'text-secondary!',
                )}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                className={classNames(selected === item.id && '**:font-bold!')}
                primary={item.label}
              />
            </Btn>
          ))}
      </Li>

      <MotionList className='[body:not(.sharp-corner)_&]:ml-2! [body:not(.sharp-corner)_&]:mr-2!'>
        <MotionLiBtn
          key={0}
          className='[body:not(.sharp-corner)_&]:ps-2! [body:not(.sharp-corner)_&]:pe-2!'
          variants={LIST_ITEM}
          onClick={() => {
            onButtonClicked?.();
          }}
        >
          <ListItemIcon>
            <MaterialIcon name='download' />
          </ListItemIcon>
          <ListItemText primary={t('drawer.download')} />
        </MotionLiBtn>

        <MotionLiBtn
          key={1}
          className='[body:not(.sharp-corner)_&]:ps-2! [body:not(.sharp-corner)_&]:pe-2!'
          variants={LIST_ITEM}
          onClick={() => {
            openDrawer();
            onButtonClicked?.();
          }}
        >
          <ListItemIcon>
            <MaterialIcon name='settings' />
          </ListItemIcon>
          <ListItemText primary={t('drawer.settings')} />
        </MotionLiBtn>
      </MotionList>
    </div>
  );
}

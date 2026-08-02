import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DownloadSharpIcon from '@mui/icons-material/DownloadSharp';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import UpdateSharpIcon from '@mui/icons-material/UpdateSharp';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { appDataDir, join } from '@tauri-apps/api/path';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { message } from '@tauri-apps/plugin-dialog';
import type { UnwatchFn } from '@tauri-apps/plugin-fs';
import {
  exists,
  readDir,
  readTextFile,
  watchImmediate,
} from '@tauri-apps/plugin-fs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ResInfo } from '../../types/resource';
import type { ISettings } from '../../types/settings';
import i18n, {
  BuiltInLang,
  getLangs,
  isBuiltInLang,
  setLang,
} from '../../utils/i18n';
import DialogTemplate from '../DialogTemplate';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  onClose: () => void;
  settings: ISettings;
  updateSettings: (key: string, value: {}) => Promise<void>;
}

interface ListItem extends ResInfo {
  folder: string;
  local: boolean;
  newVer?: number;
}

export default function LangDialog(props: IProps) {
  const { open, onClose, settings, updateSettings } = props;
  const unwatchRef = useRef<Promise<UnwatchFn>>(null);
  const sharp = settings.personalization.disableRoundCorner;
  const [list, setList] = useState<ListItem[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(list);
  const [selected, setSelected] = useState(settings.common.language);
  const [detail, setDetail] = useState<ListItem | null>(null);
  const { t } = useTranslation();
  const langs = useMemo(getLangs, [t]);

  // 初次启动时应用语言设置
  useEffect(() => {
    const init = async () => {
      await setLang(settings.common.language);

      const appWindow = getCurrentWebviewWindow();
      try {
        appWindow.show();
      } catch (err) {
        console.error('Failed to show window: ' + err);
        message(`Failed to show window.\n${err}`, {
          title: 'String Music',
          kind: 'error',
        });
        appWindow.close();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortList = useCallback(
    (oldList: ListItem[]) => {
      const folderMap: Record<string, [ListItem | null, ListItem | null]> = {};
      oldList.forEach((item) => {
        if (!folderMap[item.folder]) {
          folderMap[item.folder] = [null, null];
        }
        folderMap[item.folder][Number(item.local)] = item;
      });

      return oldList
        .sort((a, b) => {
          if (a.local !== b.local) return Number(b.local) - Number(a.local);
          if (a.name !== b.name) return a.name.localeCompare(b.name, langs);
          return a.folder.localeCompare(b.folder, langs);
        })
        .filter((item) => {
          // 同种资源，列表中只显示本地的
          if (item.local) {
            if (!folderMap[item.folder][0]) return true;
            const onlineVer = folderMap[item.folder][0]!.version;
            const localVer = folderMap[item.folder][1]!.version;
            if (onlineVer > localVer) item.newVer = onlineVer;
            return true;
          }
          if (folderMap[item.folder][1]) return false;
          return true;
        });
    },
    [langs],
  );

  const getLocalList = useCallback(
    async (selected = '') => {
      try {
        const langFolder = await join(await appDataDir(), 'lang');
        if (!(await exists(langFolder))) return;
        const entries = await readDir(langFolder);
        const localList: ListItem[] = [
          {
            lang: BuiltInLang.zh,
            name: '简体中文',
            author: 'Mutton String',
            version: 1,
            folder: BuiltInLang.zh,
            local: true,
          },
          {
            lang: BuiltInLang.en,
            name: 'English',
            author: 'Mutton String',
            version: 1,
            folder: BuiltInLang.en,
            local: true,
          },
        ];

        for (const entry of entries) {
          if (!entry.isDirectory) return;
          const folder = await join(langFolder, entry.name);
          const infoPath = await join(folder, 'info.json');
          if (
            (await exists(infoPath)) &&
            (await exists(await join(folder, 'index.json')))
          ) {
            localList.push({
              ...JSON.parse(await readTextFile(infoPath)),
              folder: entry.name,
              local: true,
            });
          }
        }

        setList((oldList) => {
          const newList = [
            ...sortList(localList),
            ...oldList.filter((item) => !item.local),
          ];
          if (selected) {
            setDetail(newList.find((item) => item.folder === selected)!);
          } else {
            setDetail(null);
          }
          return newList;
        });
      } catch (err) {
        console.error('Failed to get lang directory: ' + err);
      }
    },
    [sortList],
  );

  // 打开时载入列表、监听目录等
  useEffect(() => {
    const init = async () => {
      setSearch('');
      getLocalList(settings.common.language);
      // todo fetch online res

      try {
        unwatchRef.current = watchImmediate(
          await join(await appDataDir(), 'lang'),
          () => getLocalList(),
        );
      } catch (err) {
        console.error('Failed to watch lang directory: ' + err);
      }
    };
    if (open) init();

    return () => {
      unwatchRef.current?.then((fn) => fn());
      unwatchRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 过滤搜索项
  useEffect(() => {
    setFiltered(() => {
      const s = search.trim();
      return s
        ? list.filter((item) =>
            item.name
              .toLocaleLowerCase(langs)
              .includes(s.toLocaleLowerCase(langs)),
          )
        : list;
    });
  }, [langs, list, search]);

  return (
    <DialogTemplate
      maxWidth='xs'
      title={t('langDialog.title')}
      open={open}
      onClose={async () => {
        onClose();
        await new Promise((resolve) =>
          setTimeout(resolve, settings.personalization.animationDuration * 195),
        );
        setSelected(settings.common.language);
      }}
      onConfirm={async () => {
        if (await setLang(selected)) {
          onClose();
          updateSettings('common.language', selected);
        } else {
          setSelected(settings.common.language);
        }
      }}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <Input
            placeholder={t('langDialog.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <List className={styles.list} dense disablePadding>
            <ListItemButton
              selected={selected === ''}
              onClick={() => {
                setSelected('');
                setDetail(null);
              }}
            >
              <ListItem disablePadding>
                <ListItemText primary={t('langDialog.followSystem')} />
              </ListItem>
            </ListItemButton>
            {filtered.map((item) => (
              <ListItemButton
                key={item.folder + item.local}
                selected={item.folder === selected}
                onClick={() => {
                  if (item.local) setSelected(item.folder);
                  setDetail(item);
                }}
              >
                <ListItem
                  disablePadding
                  secondaryAction={
                    item.local ? (
                      item.newVer !== undefined && (
                        <Tip title={t('langDialog.update')}>
                          <IconButton>
                            {sharp ? (
                              <UpdateSharpIcon />
                            ) : (
                              <UpdateRoundedIcon />
                            )}
                          </IconButton>
                        </Tip>
                      )
                    ) : (
                      <Tip title={t('langDialog.download')}>
                        <IconButton>
                          {sharp ? (
                            <DownloadSharpIcon />
                          ) : (
                            <DownloadRoundedIcon />
                          )}
                        </IconButton>
                      </Tip>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <span
                        style={
                          item.local
                            ? undefined
                            : { color: 'var(--mui-palette-text-secondary)' }
                        }
                        lang={item.lang}
                      >
                        {item.name}
                      </span>
                    }
                    secondary={
                      isBuiltInLang(item.folder)
                        ? t('langDialog.builtIn')
                        : item.folder
                    }
                  />
                </ListItem>
              </ListItemButton>
            ))}
          </List>
        </div>

        <Divider orientation='vertical' variant='fullWidth' />

        <List className={styles.right} dense disablePadding>
          {detail && (
            <>
              <ListItem disablePadding>
                <strong lang={detail.lang}>{detail.name}</strong>
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={t('langDialog.code')}
                  secondary={
                    isBuiltInLang(detail.lang)
                      ? detail.lang.substring(3)
                      : detail.lang
                  }
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={t('langDialog.version')}
                  secondary={
                    detail.newVer === undefined ? (
                      detail.version
                    ) : i18n.dir() === 'ltr' ? (
                      <>
                        {detail.version} →{' '}
                        <span
                          style={{ color: 'var(--mui-palette-success-main)' }}
                        >
                          {detail.newVer}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{ color: 'var(--mui-palette-success-main)' }}
                        >
                          {detail.newVer}
                        </span>{' '}
                        ← {detail.version}
                      </>
                    )
                  }
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={t('langDialog.author')}
                  secondary={detail.author}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={t('langDialog.desc')}
                  secondary={
                    <span lang={detail.lang} className={styles.desc}>
                      {detail.desc || '-'}
                    </span>
                  }
                />
              </ListItem>
            </>
          )}
        </List>
      </div>
    </DialogTemplate>
  );
}

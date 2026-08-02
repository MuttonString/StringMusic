import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSettings from '../../hooks/useSettings';
import useSettingsDrawer from '../../hooks/useSettingsDrawer';
import styles from './index.module.less';

export default function Recent() {
  const [settings] = useSettings();
  const openDrawer = useSettingsDrawer();
  const { t } = useTranslation();
  const pageEnabled = settings!.privacy.recent;

  useEffect(() => {
    if (pageEnabled) return;
    openDrawer(t('settingsDrawer.privacy.recent'));
  }, [openDrawer, pageEnabled, t]);

  return pageEnabled && <div className={styles.recent}>recent</div>;
}

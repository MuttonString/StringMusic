import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSettings from '../../hooks/useSettings';
import useSettingsDrawer from '../../hooks/useSettingsDrawer';
import styles from './index.module.less';

export default function Recommendation() {
  const [settings] = useSettings();
  const openDrawer = useSettingsDrawer();
  const { t } = useTranslation();
  const pageEnabled = settings!.privacy.recommendation;

  useEffect(() => {
    if (pageEnabled) return;
    openDrawer(t('settingsDrawer.privacy.recommendation'));
  }, [openDrawer, pageEnabled, t]);

  return (
    pageEnabled && <div className={styles.recommendation}>recommendation</div>
  );
}

import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import Tip from '../../components/Tip';
import styles from './index.module.less';

export default function Settings() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  return (
    <div className={styles.settings}>
      <div className={styles.tabs}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            minHeight: '32px',
            height: '32px',
            '& .MuiTab-root': {
              minHeight: '32px',
              height: '32px',
              width: '48px',
              minWidth: 'unset',
            },
          }}
        >
          <Tab label='1' />
          <Tab label='2' />
          <Tab
            label={
              <Tip title={t('settings.about')}>
                <InfoRoundedIcon />
              </Tip>
            }
          />
        </Tabs>
      </div>
      <SimpleBar>
        <Typography>settings</Typography>
      </SimpleBar>
    </div>
  );
}

import IconButton from '@mui/material/IconButton';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BASE_COMPONENT } from '../../../constants/animation';
import { MEDIA_BAR_HEIGHT } from '../../../constants/window';
import { useConfigDrawer } from '../../../providers/ConfigDrawerProvider';
import MaterialIcon from '../../ui/MaterialIcon';
import Tip from '../../ui/Tip';

export default function OperationButtons() {
  const { t } = useTranslation();
  const openDrawer = useConfigDrawer();

  return (
    <motion.div
      variants={BASE_COMPONENT}
      custom={{ w: MEDIA_BAR_HEIGHT }}
      initial='hidden'
      whileInView='visible'
      exit='hidden'
      layout
      className='relative -me-1 h-(--media-bar-height)'
    >
      <Tip placement='top' title={'TEST'}>
        <IconButton
          size='small'
          className='p-0.75! absolute! top-0.5 inset-s-6.25'
        >
          <MaterialIcon name='clear' />
        </IconButton>
      </Tip>

      <Tip placement='top' title={'TEST'}>
        <IconButton
          size='small'
          className='p-0.75! absolute! top-6.25 inset-s-0.5'
        >
          <MaterialIcon name='clear' />
        </IconButton>
      </Tip>

      <Tip placement='top' title={t('media.moreOpt')}>
        <IconButton
          size='small'
          className='p-0.75! absolute! top-6.25 inset-e-0.5'
          onClick={() => openDrawer('playback')}
        >
          <MaterialIcon name='moreHoriz' />
        </IconButton>
      </Tip>

      <Tip placement='top' title={'TEST'}>
        <IconButton
          size='small'
          className='p-0.75! absolute! bottom-0.5 inset-s-6.25'
        >
          <MaterialIcon name='clear' />
        </IconButton>
      </Tip>
    </motion.div>
  );
}

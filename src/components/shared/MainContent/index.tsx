import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { PAGE } from '../../../constants/animation';
import { MAIN_WINDOW } from '../../../constants/window';
import { useNavigator } from '../../../providers/NavigatorProvider';
import { PageOperation } from '../../../types/navigator';

export default function MainContent() {
  const { lastOperation } = useNavigator();
  const location = useLocation();
  const { t } = useTranslation();

  const enterAnimation = useMemo(() => {
    switch (lastOperation) {
      case PageOperation.Back:
        return 'goBack';
      case PageOperation.Forward:
        return 'goForward';
      case PageOperation.New:
        return 'new';
    }
  }, [lastOperation]);

  useEffect(() => {
    // todo 禁用了标题随音乐，且无音乐播放，执行：
    MAIN_WINDOW.setTitle(t('common.stringMusic'));
  }, [t]);

  return (
    <main
      className={`bg-(--bg-color) flex-1 min-h-0 min-w-0 flex overflow-clip border-s border-t border-divider rounded-ss-lg max-[50rem]:border-s-0 max-[50rem]:rounded-ss-none`}
    >
      <AnimatePresence>
        <motion.div
          key={location.pathname}
          variants={PAGE}
          initial={enterAnimation}
          whileInView='normal'
          className='flex-1 min-h-0 overflow-auto p-2 pb-[calc(var(--media-bar-height)+0.5rem)]'
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

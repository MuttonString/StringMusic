import { AnimatePresence, motion } from 'framer-motion';
import CloseWindowHandler from '../../components/shared/CloseWindowHandler';
import Footer from '../../components/shared/Footer';
import MainContent from '../../components/shared/MainContent';
import SideBar from '../../components/shared/SideBar';
import TitleBar from '../../components/shared/TitleBar';
import { VERTICAL } from '../../constants/animation';
import useTrayMenu from '../../hooks/useTrayMenu';
import { ConfigDrawerProvider } from '../../providers/ConfigDrawerProvider';
import { useConfig } from '../../providers/ConfigProvider';
import { NavigatorProvider } from '../../providers/NavigatorProvider';
import { SnackbarProvider } from '../../providers/SnackbarProvider';

const MotionFooter = motion.create(Footer);

export default function Layout() {
  const [config] = useConfig();
  const showFooter = config.enableDevOptions && config.showFooter;

  useTrayMenu();

  return (
    <NavigatorProvider>
      <SnackbarProvider>
        <ConfigDrawerProvider>
          <TitleBar />
          <div className='flex flex-1 min-h-0 min-w-0'>
            <SideBar />
            <MainContent />
          </div>
          <AnimatePresence>
            {showFooter && (
              <MotionFooter
                variants={VERTICAL}
                custom='2rem'
                initial='hidden'
                whileInView='visible'
                exit='hidden'
              />
            )}
          </AnimatePresence>
          <CloseWindowHandler />
        </ConfigDrawerProvider>
      </SnackbarProvider>
    </NavigatorProvider>
  );
}

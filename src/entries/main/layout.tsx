import { AnimatePresence } from 'framer-motion';
import CloseWindowHandler from '../../components/shared/CloseWindowHandler';
import Footer from '../../components/shared/Footer';
import MainContent from '../../components/shared/MainContent';
import MediaBar from '../../components/shared/MediaBar';
import SideBar from '../../components/shared/SideBar';
import TitleBar from '../../components/shared/TitleBar';
import useTrayMenu from '../../hooks/useTrayMenu';
import { ConfigDrawerProvider } from '../../providers/ConfigDrawerProvider';
import { useConfig } from '../../providers/ConfigProvider';
import { NavigatorProvider } from '../../providers/NavigatorProvider';

export default function Layout() {
  const [config] = useConfig();
  const showFooter = config.enableDevOptions && config.showFooter;

  useTrayMenu();

  return (
    <NavigatorProvider>
      <ConfigDrawerProvider>
        <TitleBar />
        <div className='flex flex-1 min-h-0 min-w-0'>
          <SideBar />
          <MainContent />
        </div>
        <MediaBar />
        <AnimatePresence>{showFooter && <Footer />}</AnimatePresence>
        <CloseWindowHandler />
      </ConfigDrawerProvider>
    </NavigatorProvider>
  );
}

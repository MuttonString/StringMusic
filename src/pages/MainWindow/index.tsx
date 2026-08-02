import { useContext } from 'react';
import Footer from '../../components/Footer';
import GlobalAudio from '../../components/GlobalAudio';
import { SlotContext } from '../../components/GlobalProvider';
import MainContent from '../../components/MainContent';
import SideBar from '../../components/SideBar';
import TitleBar from '../../components/TitleBar';
import useSettings from '../../hooks/useSettings';

export default function MainWindow() {
  const [settings] = useSettings();
  const slot = useContext(SlotContext);

  return (
    <>
      <TitleBar />
      <div id='client-area'>
        <SideBar />
        <MainContent />
      </div>
      {settings!.developerOptions.enabled &&
        settings!.developerOptions.showFooter && <Footer />}
      {slot}
      <GlobalAudio />
    </>
  );
}

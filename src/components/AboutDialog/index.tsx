import ReactLogo from '../../assets/react.svg?react';
import TauriLogo from '../../assets/tauri.svg?react';
import ViteLogo from '../../assets/vite.svg?react';
import classNames from '../../utils/classNames';
import DialogTemplate from '../DialogTemplate';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDialog(props: IProps) {
  return (
    <DialogTemplate maxWidth='sm' {...props}>
      <div className={styles.container}>
        <a href='https://vite.dev' rel='noreferrer' target='_blank'>
          <ViteLogo className={classNames(styles.logo, styles.vite)} />
        </a>
        <a href='https://tauri.app' rel='noreferrer' target='_blank'>
          <TauriLogo className={classNames(styles.logo, styles.tauri)} />
        </a>
        <a href='https://react.dev' rel='noreferrer' target='_blank'>
          <ReactLogo className={classNames(styles.logo, styles.react)} />
        </a>
      </div>
    </DialogTemplate>
  );
}

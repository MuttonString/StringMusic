import { invoke } from '@tauri-apps/api/core';
import { exit } from '@tauri-apps/plugin-process';
import styles from './index.module.less';

interface IProps {
  error?: string | null;
  errorInfo?: string | null;
}

export default function ErrorBoundaryBase({ error, errorInfo }: IProps) {
  return (
    <div lang='en' className={styles.errorBoundary}>
      <header data-tauri-drag-region className={styles.titleBar} />
      <div className={styles.title}>Unexpected Application Error!</div>
      {error && <div className={styles.error}>{error}</div>}
      {errorInfo && <div className={styles.errorInfo}>{errorInfo}</div>}
      <button className={styles.btn} onClick={() => location.reload()}>
        Refresh Page
      </button>
      <br />
      <button className={styles.btn} onClick={() => invoke('open_devtools')}>
        Open DevTools
      </button>
      <br />
      <button className={styles.btn} onClick={() => exit()}>
        Exit Application
      </button>
    </div>
  );
}

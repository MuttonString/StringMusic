import NavigatorList from '../NavigatorList';
import styles from './index.module.less';

export default function SideBar() {
  return (
    <aside className={styles.sideBar}>
      <NavigatorList />
    </aside>
  );
}

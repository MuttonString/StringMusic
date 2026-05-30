import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import useDetailHistory from '../../hooks/useDetailHistory';
import styles from './index.module.less';

export default function Footer() {
  const location = useLocation();
  const [input, setInput] = useState('');
  const { goTo } = useDetailHistory();

  useEffect(() => {
    setInput(location.pathname + location.search + location.hash);
  }, [location]);

  return (
    <footer className={styles.footer}>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            goTo(input);
          }
        }}
      />
    </footer>
  );
}

import { useRef } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';
import MusicBar from '../MusicBar';
import styles from './index.module.less';

const animations = [
  {
    exit: styles.pageExitForward,
    exitActive: styles.pageExitActiveForward,
    enter: styles.pageEnterForward,
    enterActive: styles.pageEnterActiveForward,
  },
  {
    exit: styles.pageExitBack,
    exitActive: styles.pageExitActiveBack,
    enter: styles.pageEnterBack,
    enterActive: styles.pageEnterActiveBack,
  },
  {
    exit: styles.pageExitNew,
    exitActive: styles.pageExitActiveNew,
    enter: styles.pageEnterNew,
    enterActive: styles.pageEnterActiveNew,
  },
] as const;

export default function MainContent() {
  const outlet = useOutlet();
  const { animation } = useDetailHistory();
  const nodeRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [settings] = useSettings();

  return (
    <main className={styles.mainContent}>
      <SwitchTransition>
        <CSSTransition
          nodeRef={nodeRef}
          key={location.key}
          timeout={250 * settings!.personalization.animationDuration}
          classNames={
            animation === undefined ? undefined : animations[animation]
          }
        >
          <div className={styles.container} ref={nodeRef}>
            {outlet}
          </div>
        </CSSTransition>
      </SwitchTransition>
      <MusicBar />
    </main>
  );
}

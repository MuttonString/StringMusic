import { useRef } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import useDetailHistory from '../../hooks/useDetailHistory';
import { PageAnimation } from '../../types/history';
import styles from './index.module.less';

const getAnimation = (animationType?: PageAnimation) => {
  switch (animationType) {
    case PageAnimation.Forward:
      return {
        exit: styles.pageExitForward,
        exitActive: styles.pageExitActiveForward,
        enter: styles.pageEnterForward,
        enterActive: styles.pageEnterActiveForward,
      };
    case PageAnimation.Back:
      return {
        exit: styles.pageExitBack,
        exitActive: styles.pageExitActiveBack,
        enter: styles.pageEnterBack,
        enterActive: styles.pageEnterActiveBack,
      };
    case PageAnimation.New:
      return {
        exit: styles.pageExitNew,
        exitActive: styles.pageExitActiveNew,
        enter: styles.pageEnterNew,
        enterActive: styles.pageEnterActiveNew,
      };
  }
};

export default function MainContent() {
  const outlet = useOutlet();
  const { animation } = useDetailHistory();
  const nodeRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  return (
    <main className={styles.mainContent}>
      <SwitchTransition>
        <CSSTransition
          nodeRef={nodeRef}
          key={location.key}
          timeout={125}
          classNames={getAnimation(animation)}
        >
          <div ref={nodeRef}>{outlet}</div>
        </CSSTransition>
      </SwitchTransition>
    </main>
  );
}

import { useEffect, useState } from 'react';
import styles from './LineCompleteAnimation.module.css';

interface LineCompleteAnimationProps {
  onComplete?: () => void;
}

export function LineCompleteAnimation({ onComplete }: LineCompleteAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>LINE COMPLETE!</h2>
        <p className={styles.bonus}>+6 BONUS POINTS!</p>
      </div>
    </div>
  );
}

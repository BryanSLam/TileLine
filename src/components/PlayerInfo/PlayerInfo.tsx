import { Player } from '../../types';
import styles from './PlayerInfo.module.css';
import clsx from 'clsx';

interface PlayerInfoProps {
  player: Player;
}

export function PlayerInfo({ player }: PlayerInfoProps) {
  const playerColorStyle: React.CSSProperties = {
    borderLeftColor: `var(--player-${player.color}-border)`,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid'
  };

  const colorDotStyle: React.CSSProperties = {
    backgroundColor: `var(--player-${player.color})`
  };

  return (
    <div
      className={clsx(styles.container, { [styles.active]: player.isActive })}
      style={playerColorStyle}
    >
      <div className={styles.header}>
        <div className={styles.nameWithColor}>
          <span className={styles.colorDot} style={colorDotStyle} />
          <span className={styles.name}>{player.name}</span>
        </div>
        {player.type === 'ai' && <span className={styles.badge}>AI</span>}
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Score:</span>
          <span className={styles.statValue}>{player.score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tiles:</span>
          <span className={styles.statValue}>{player.hand.length}</span>
        </div>
      </div>
      {player.isActive && <div className={styles.activeIndicator}>Your Turn</div>}
    </div>
  );
}

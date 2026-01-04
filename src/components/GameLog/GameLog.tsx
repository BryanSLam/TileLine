import { GameHistoryEntry, Player } from '../../types';
import { GameLogEntry } from './GameLogEntry';
import styles from './GameLog.module.css';

interface GameLogProps {
  history: GameHistoryEntry[];
  players: Player[];
}

export function GameLog({ history, players }: GameLogProps) {
  // Display entries in reverse order (most recent first)
  const recentEntries = [...history].reverse().slice(0, 10); // Show last 10 moves

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Game Log</h3>
      </div>

      <div className={styles.logEntries}>
        {recentEntries.length === 0 ? (
          <p className={styles.empty}>No moves yet</p>
        ) : (
          recentEntries.map((entry, index) => (
            <GameLogEntry
              key={history.length - index}
              entry={entry}
              player={players[entry.playerIndex]}
              moveNumber={history.length - index}
            />
          ))
        )}
      </div>
    </div>
  );
}

import { GameState } from '../../types';
import { useGameStore } from '../../store/gameStore';
import styles from './GameOver.module.css';

interface GameOverProps {
  gameState: GameState;
}

export function GameOver({ gameState }: GameOverProps) {
  const returnToSetup = useGameStore(state => state.returnToSetup);

  // Sort players by score (descending)
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.filter(p => p.score === winner.score).length > 1;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Game Over!</h2>

        {isTie ? (
          <div className={styles.winnerSection}>
            <p className={styles.tieMessage}>It's a tie!</p>
            <p className={styles.scoreValue}>{winner.score} points</p>
          </div>
        ) : (
          <div className={styles.winnerSection}>
            <p className={styles.winnerLabel}>Winner</p>
            <h3 className={styles.winnerName}>{winner.name}</h3>
            <p className={styles.scoreValue}>{winner.score} points</p>
          </div>
        )}

        <div className={styles.playerList}>
          <h4 className={styles.subtitle}>Final Scores</h4>
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className={styles.playerRow}>
              <div className={styles.playerInfo}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.playerName}>{player.name}</span>
                {player.type === 'ai' && (
                  <span className={styles.aiBadge}>AI</span>
                )}
              </div>
              <span className={styles.playerScore}>{player.score}</span>
            </div>
          ))}
        </div>

        <button className={styles.newGameButton} onClick={returnToSetup}>
          New Game
        </button>
      </div>
    </div>
  );
}

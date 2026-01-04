import { useGameStore } from '../../store/gameStore';
import { BoardGrid } from './BoardGrid';
import styles from './GameBoard.module.css';

export function GameBoard() {
  const gameState = useGameStore(state => state.gameState);

  if (!gameState) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        <BoardGrid board={gameState.board} pendingPlacements={gameState.pendingPlacements} />
      </div>
    </div>
  );
}

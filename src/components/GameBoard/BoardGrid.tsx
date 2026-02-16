import { BoardState, PendingPlacement } from '../../types';
import { BoardModel } from '../../models/BoardModel';
import { useGameStore } from '../../store/gameStore';
import { useUIPreferencesStore } from '../../store/uiPreferencesStore';
import { BoardCell } from './BoardCell';
import styles from './BoardGrid.module.css';
import { PlayerColor } from '../../types/Player';

interface BoardGridProps {
  board: BoardState;
  pendingPlacements: PendingPlacement[];
}

export function BoardGrid({ board, pendingPlacements }: BoardGridProps) {
  const validPositions = useGameStore(state => state.getValidPositions());
  const gameState = useGameStore(state => state.gameState);
  const showPlacementHints = useUIPreferencesStore(
    (state) => state.preferences.showPlacementHints
  );

  // Calculate the highest turn number (most recent move)
  const lastTurnNumber = gameState.turnNumber - 1;

  // Calculate visible bounds with padding
  const padding = 3;
  const minRow = board.bounds.minRow - padding;
  const maxRow = board.bounds.maxRow + padding;
  const minCol = board.bounds.minCol - padding;
  const maxCol = board.bounds.maxCol + padding;

  // Create pending placement lookup
  const pendingMap = new Map<string, PendingPlacement>();
  pendingPlacements.forEach(p => {
    pendingMap.set(BoardModel.positionToKey(p.position), p);
  });

  // Create valid positions lookup (only when hints are enabled)
  const validPositionsSet = new Set<string>();
  if (showPlacementHints) {
    validPositions.forEach(pos => {
      validPositionsSet.add(BoardModel.positionToKey(pos));
    });
  }

  // Generate grid rows and columns
  const rows: JSX.Element[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    const cells: JSX.Element[] = [];

    for (let col = minCol; col <= maxCol; col++) {
      const position = { row, col };
      const key = BoardModel.positionToKey(position);
      const placedTile = board.tiles.get(key);
      const pending = pendingMap.get(key);
      const isValid = validPositionsSet.has(key);

      // Determine if this tile is from the last move and get owner color
      const isLastMove = placedTile ? placedTile.turnPlaced === lastTurnNumber : false;
      let ownerPlayerColor: PlayerColor | undefined;
      if (placedTile && placedTile.placedByPlayerIndex >= 0 && placedTile.placedByPlayerIndex < gameState.players.length) {
        ownerPlayerColor = gameState.players[placedTile.placedByPlayerIndex].color;
      }

      cells.push(
        <BoardCell
          key={key}
          position={position}
          tile={pending ? { ...pending.tile, position, placedByPlayerIndex: -1, turnPlaced: -1 } : placedTile}
          isPending={!!pending}
          isValidPlacement={isValid}
          isLastMove={isLastMove}
          ownerPlayerColor={ownerPlayerColor}
        />
      );
    }

    rows.push(
      <div key={`row-${row}`} className={styles.row}>
        {cells}
      </div>
    );
  }

  return <div className={styles.grid}>{rows}</div>;
}

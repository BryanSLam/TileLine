import { BoardPosition, PlacedTile } from '../../types';
import { Tile } from '../Tile/Tile';
import { useGameStore } from '../../store/gameStore';
import { useUIPreferencesStore } from '../../store/uiPreferencesStore';
import styles from './BoardCell.module.css';
import clsx from 'clsx';

interface BoardCellProps {
  position: BoardPosition;
  tile?: PlacedTile;
  isPending?: boolean;
  isValidPlacement?: boolean;
}

export function BoardCell({ position, tile, isPending = false, isValidPlacement = false }: BoardCellProps) {
  const selectedTile = useGameStore(state => state.selectedTile);
  const addPendingPlacement = useGameStore(state => state.addPendingPlacement);
  const removePendingPlacement = useGameStore(state => state.removePendingPlacement);
  const showPlacementHints = useUIPreferencesStore(
    (state) => state.preferences.showPlacementHints
  );

  const handleClick = () => {
    // If clicking on a pending tile, remove it
    if (isPending) {
      removePendingPlacement(position);
      return;
    }

    // If a tile is selected and cell is empty
    if (selectedTile && !tile) {
      // Allow placement anywhere when hints disabled, or only valid positions when enabled
      if (!showPlacementHints || isValidPlacement) {
        addPendingPlacement(selectedTile, position);
      }
    }
  };

  const isClickable = isPending || (selectedTile && !tile && (!showPlacementHints || isValidPlacement));

  return (
    <div
      className={clsx(styles.cell, {
        [styles.validPlacement]: isValidPlacement && !tile && selectedTile,
        [styles.pending]: isPending,
        [styles.clickable]: isClickable
      })}
      data-row={position.row}
      data-col={position.col}
      onClick={handleClick}
    >
      {tile && <Tile tile={tile} isPlaced={!isPending} />}
    </div>
  );
}

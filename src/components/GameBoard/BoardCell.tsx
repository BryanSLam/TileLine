import { BoardPosition, PlacedTile } from '../../types';
import { PlayerColor } from '../../types/Player';
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
  isLastMove?: boolean;
  ownerPlayerColor?: PlayerColor;
}

export function BoardCell({
  position,
  tile,
  isPending = false,
  isValidPlacement = false,
  isLastMove = false,
  ownerPlayerColor
}: BoardCellProps) {
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

  // Build style object for owner color border
  const cellStyle: React.CSSProperties = {};
  if (ownerPlayerColor && tile && !isPending) {
    cellStyle.borderColor = `var(--player-${ownerPlayerColor}-border)`;
    cellStyle.borderWidth = '3px';
  }

  return (
    <div
      className={clsx(styles.cell, {
        [styles.validPlacement]: isValidPlacement && !tile && selectedTile,
        [styles.pending]: isPending,
        [styles.lastMove]: isLastMove && !isPending,
        [styles.ownerColor]: ownerPlayerColor && tile && !isPending,
        [styles.clickable]: isClickable
      })}
      style={cellStyle}
      data-row={position.row}
      data-col={position.col}
      onClick={handleClick}
    >
      {tile && <Tile tile={tile} isPlaced={!isPending} />}
    </div>
  );
}

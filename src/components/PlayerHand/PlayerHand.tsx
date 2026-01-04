import { Tile as TileType } from '../../types';
import { Tile } from '../Tile/Tile';
import { useGameStore } from '../../store/gameStore';
import styles from './PlayerHand.module.css';
import clsx from 'clsx';

interface PlayerHandProps {
  tiles: TileType[];
  isCurrentPlayer: boolean;
}

export function PlayerHand({ tiles, isCurrentPlayer }: PlayerHandProps) {
  const selectedTile = useGameStore(state => state.selectedTile);
  const selectTile = useGameStore(state => state.selectTile);

  // Create array of 6 slots
  const slots = Array(6).fill(null);

  const handleTileClick = (tile: TileType) => {
    if (!isCurrentPlayer) return;

    // Toggle selection
    if (selectedTile?.id === tile.id) {
      selectTile(null);
    } else {
      selectTile(tile);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Your Hand {isCurrentPlayer && '(Click to select)'}</h3>
      <div className={styles.hand}>
        {slots.map((_, index) => (
          <div key={index} className={styles.slot}>
            {tiles[index] ? (
              <div
                className={clsx(styles.tileWrapper, {
                  [styles.selected]: selectedTile?.id === tiles[index].id,
                  [styles.clickable]: isCurrentPlayer
                })}
                onClick={() => handleTileClick(tiles[index])}
              >
                <Tile tile={tiles[index]} />
              </div>
            ) : (
              <div className={styles.emptySlot} />
            )}
          </div>
        ))}
      </div>
      {!isCurrentPlayer && (
        <div className={styles.waitingMessage}>
          Waiting for other players...
        </div>
      )}
    </div>
  );
}

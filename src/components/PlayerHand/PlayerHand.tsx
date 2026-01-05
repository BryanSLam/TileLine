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
  const exchangeMode = useGameStore(state => state.exchangeMode);
  const selectedTileIdsForExchange = useGameStore(state => state.selectedTileIdsForExchange);
  const toggleTileForExchange = useGameStore(state => state.toggleTileForExchange);

  // Create array of 6 slots
  const slots = Array(6).fill(null);

  const handleTileClick = (tile: TileType) => {
    if (!isCurrentPlayer) return;

    if (exchangeMode) {
      // In exchange mode: toggle tile for exchange
      toggleTileForExchange(tile.id);
    } else {
      // Normal mode: toggle selection for placement
      if (selectedTile?.id === tile.id) {
        selectTile(null);
      } else {
        selectTile(tile);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Your Hand {isCurrentPlayer && (exchangeMode ? '(Click to select for exchange)' : '(Click to select)')}
      </h3>
      <div className={styles.hand}>
        {slots.map((_, index) => (
          <div key={index} className={styles.slot}>
            {tiles[index] ? (
              <div
                className={clsx(styles.tileWrapper, {
                  [styles.selected]: !exchangeMode && selectedTile?.id === tiles[index].id,
                  [styles.selectedForExchange]: exchangeMode && selectedTileIdsForExchange.includes(tiles[index].id),
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

import { GameHistoryEntry, Player, PlacedTile } from '../../types';
import styles from './GameLogEntry.module.css';

interface GameLogEntryProps {
  entry: GameHistoryEntry;
  player: Player;
  moveNumber: number;
}

export function GameLogEntry({ entry, player }: GameLogEntryProps) {
  // Format tile placements for display - show all tiles
  const tileDescription = entry.placements.length === 1
    ? formatTile(entry.placements[0])
    : entry.placements.map(tile => formatTile(tile)).join(', ');

  // Check for full line bonus (6-tile line = scored 12+ points)
  const isFullLine = entry.pointsScored >= 12; // Heuristic for full line detection

  return (
    <div className={styles.entry}>
      <div className={styles.entryHeader}>
        <span className={styles.playerName}>{player.name}</span>
        <span className={styles.points}>
          +{entry.pointsScored}
          {isFullLine && ' 🎉'}
        </span>
      </div>

      <div className={styles.entryDetails}>
        <span className={styles.move}>
          Placed {tileDescription}
        </span>
      </div>
    </div>
  );
}

function formatTile(tile: PlacedTile): string {
  const colorNames: Record<string, string> = {
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    purple: 'Purple'
  };

  const shapeIcons: Record<string, string> = {
    circle: '●',
    square: '■',
    diamond: '♦',
    star: '★',
    cross: '✚',
    clover: '♣'
  };

  return `${shapeIcons[tile.shape]} ${colorNames[tile.color]}`;
}

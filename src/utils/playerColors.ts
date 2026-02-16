import { PlayerColor } from '../types/Player';

/**
 * Array of available player colors in order
 */
export const PLAYER_COLORS: PlayerColor[] = [
  PlayerColor.BLUE,
  PlayerColor.RED,
  PlayerColor.GREEN,
  PlayerColor.YELLOW
];

/**
 * Get player color by index (0-3)
 * @param index - Player index (0-3)
 * @returns PlayerColor for the given index
 */
export function getPlayerColor(index: number): PlayerColor {
  if (index < 0 || index >= PLAYER_COLORS.length) {
    throw new Error(`Invalid player index: ${index}. Must be between 0 and ${PLAYER_COLORS.length - 1}`);
  }
  return PLAYER_COLORS[index];
}

/**
 * Get CSS color value for a player color
 * @param color - PlayerColor enum value
 * @returns CSS color string (e.g., 'var(--player-blue)')
 */
export function getPlayerColorCSS(color: PlayerColor): string {
  return `var(--player-${color})`;
}

/**
 * Get player color by player index with bounds checking
 * @param index - Player index
 * @param totalPlayers - Total number of players in game
 * @returns PlayerColor for the given index
 */
export function assignPlayerColor(index: number, totalPlayers: number): PlayerColor {
  if (totalPlayers > PLAYER_COLORS.length) {
    throw new Error(`Too many players: ${totalPlayers}. Maximum is ${PLAYER_COLORS.length}`);
  }
  return getPlayerColor(index);
}

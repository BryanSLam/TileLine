import { TileColor, TileShape } from '../types';

export const GameRules = {
  // Tile configuration
  COLORS: Object.values(TileColor),
  SHAPES: Object.values(TileShape),
  COPIES_PER_TILE: 3,
  TOTAL_TILES: 108, // 6 colors × 6 shapes × 3 copies

  // Player configuration
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  INITIAL_HAND_SIZE: 6,

  // Game rules
  MAX_LINE_LENGTH: 6,
  FULL_LINE_BONUS: 6,
  FULL_LINE_LENGTH: 6,

  // Board configuration
  STARTING_POSITION: { row: 0, col: 0 }
} as const;

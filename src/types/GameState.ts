import { Player } from './Player';
import { Tile, PlacedTile } from './Tile';
import { BoardState, PendingPlacement } from './Board';

export enum GamePhase {
  SETUP = 'setup',
  PLAYING = 'playing',
  GAME_OVER = 'gameOver'
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  board: BoardState;
  tileBag: Tile[];
  pendingPlacements: PendingPlacement[];
  lastScoredPoints: number;
  gameHistory: GameHistoryEntry[];
}

export interface GameHistoryEntry {
  playerIndex: number;
  placements: PlacedTile[];
  pointsScored: number;
  tilesDrawn: Tile[];
}

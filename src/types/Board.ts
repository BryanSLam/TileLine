import { PlacedTile, Tile, BoardPosition } from './Tile';

export interface BoardState {
  tiles: Map<string, PlacedTile>;
  bounds: BoardBounds;
}

export interface BoardBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export interface PendingPlacement {
  tile: Tile;
  position: BoardPosition;
}

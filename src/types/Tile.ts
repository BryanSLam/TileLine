export enum TileColor {
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple'
}

export enum TileShape {
  CIRCLE = 'circle',
  SQUARE = 'square',
  DIAMOND = 'diamond',
  STAR = 'star',
  CROSS = 'cross',
  CLOVER = 'clover'
}

export interface Tile {
  id: string;
  color: TileColor;
  shape: TileShape;
}

export interface PlacedTile extends Tile {
  position: BoardPosition;
}

export interface BoardPosition {
  row: number;
  col: number;
}

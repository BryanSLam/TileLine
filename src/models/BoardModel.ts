import { BoardPosition, PlacedTile, BoardBounds } from '../types';

export class BoardModel {
  /**
   * Convert board position to string key for Map storage
   */
  static positionToKey(position: BoardPosition): string {
    return `${position.row},${position.col}`;
  }

  /**
   * Convert string key back to BoardPosition
   */
  static keyToPosition(key: string): BoardPosition {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  }

  /**
   * Check if a position is occupied on the board
   */
  static isOccupied(tiles: Map<string, PlacedTile>, position: BoardPosition): boolean {
    return tiles.has(this.positionToKey(position));
  }

  /**
   * Get tile at a specific position, or null if empty
   */
  static getTileAt(tiles: Map<string, PlacedTile>, position: BoardPosition): PlacedTile | null {
    return tiles.get(this.positionToKey(position)) || null;
  }

  /**
   * Get all adjacent positions (up, down, left, right)
   */
  static getAdjacentPositions(position: BoardPosition): BoardPosition[] {
    return [
      { row: position.row - 1, col: position.col }, // Up
      { row: position.row + 1, col: position.col }, // Down
      { row: position.row, col: position.col - 1 }, // Left
      { row: position.row, col: position.col + 1 }  // Right
    ];
  }

  /**
   * Check if a position is adjacent to any placed tile
   */
  static isAdjacentToTile(tiles: Map<string, PlacedTile>, position: BoardPosition): boolean {
    return this.getAdjacentPositions(position).some(
      adjPos => this.isOccupied(tiles, adjPos)
    );
  }

  /**
   * Update board bounds to include a new position
   */
  static updateBounds(bounds: BoardBounds, position: BoardPosition): BoardBounds {
    return {
      minRow: Math.min(bounds.minRow, position.row),
      maxRow: Math.max(bounds.maxRow, position.row),
      minCol: Math.min(bounds.minCol, position.col),
      maxCol: Math.max(bounds.maxCol, position.col)
    };
  }

  /**
   * Get all tiles in a horizontal line at a specific row
   */
  static getHorizontalLine(
    tiles: Map<string, PlacedTile>,
    row: number,
    startCol: number,
    endCol: number
  ): PlacedTile[] {
    const line: PlacedTile[] = [];
    for (let col = startCol; col <= endCol; col++) {
      const tile = this.getTileAt(tiles, { row, col });
      if (tile) {
        line.push(tile);
      }
    }
    return line;
  }

  /**
   * Get all tiles in a vertical line at a specific column
   */
  static getVerticalLine(
    tiles: Map<string, PlacedTile>,
    col: number,
    startRow: number,
    endRow: number
  ): PlacedTile[] {
    const line: PlacedTile[] = [];
    for (let row = startRow; row <= endRow; row++) {
      const tile = this.getTileAt(tiles, { row, col });
      if (tile) {
        line.push(tile);
      }
    }
    return line;
  }

  /**
   * Find the extent of a line containing a position in a given direction
   */
  static findLineExtent(
    tiles: Map<string, PlacedTile>,
    position: BoardPosition,
    direction: 'horizontal' | 'vertical'
  ): { start: number; end: number } {
    const isHorizontal = direction === 'horizontal';
    const coord = isHorizontal ? position.col : position.row;

    let start = coord;
    let end = coord;

    // Extend backwards
    while (true) {
      const checkPos = isHorizontal
        ? { row: position.row, col: start - 1 }
        : { row: start - 1, col: position.col };

      if (this.isOccupied(tiles, checkPos)) {
        start--;
      } else {
        break;
      }
    }

    // Extend forwards
    while (true) {
      const checkPos = isHorizontal
        ? { row: position.row, col: end + 1 }
        : { row: end + 1, col: position.col };

      if (this.isOccupied(tiles, checkPos)) {
        end++;
      } else {
        break;
      }
    }

    return { start, end };
  }
}

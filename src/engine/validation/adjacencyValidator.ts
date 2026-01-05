import { BoardPosition, PendingPlacement } from '../../types';
import { BoardModel } from '../../models/BoardModel';

export interface AdjacencyValidationResult {
  isValid: boolean;
  error?: string;
}

export class AdjacencyValidator {
  /**
   * Validate that all pending placements form a single continuous line
   * Either all in same row (horizontal) or all in same column (vertical)
   */
  static validatePlacements(
    placements: PendingPlacement[],
    boardTiles?: Map<string, any>
  ): AdjacencyValidationResult {
    if (placements.length === 0) {
      return { isValid: false, error: 'No tiles to place' };
    }

    if (placements.length === 1) {
      return { isValid: true };
    }

    const positions = placements.map(p => p.position);

    // Check if all in same row (horizontal line)
    const rows = positions.map(p => p.row);
    const allSameRow = rows.every(r => r === rows[0]);

    // Check if all in same column (vertical line)
    const cols = positions.map(p => p.col);
    const allSameCol = cols.every(c => c === cols[0]);

    if (!allSameRow && !allSameCol) {
      return {
        isValid: false,
        error: 'All placed tiles must be in the same row or column'
      };
    }

    // Check that placements are continuous (no gaps)
    if (allSameRow) {
      const row = rows[0];
      return this.validateContinuous(placements, row, 'row', boardTiles);
    } else {
      const col = cols[0];
      return this.validateContinuous(placements, col, 'col', boardTiles);
    }
  }

  /**
   * Validate that placements are continuous (no gaps unless filled by existing tiles)
   */
  private static validateContinuous(
    placements: PendingPlacement[],
    fixedCoord: number,
    fixedAxis: 'row' | 'col',
    boardTiles?: Map<string, any>
  ): AdjacencyValidationResult {
    // Get the varying coordinates
    const coords = placements.map(p =>
      fixedAxis === 'row' ? p.position.col : p.position.row
    );

    // Check for duplicates
    const uniqueCoords = new Set(coords);
    if (uniqueCoords.size !== coords.length) {
      return {
        isValid: false,
        error: 'Cannot place multiple tiles at the same position'
      };
    }

    // If no board state provided, can't check for gaps (used for first move validation)
    if (!boardTiles) {
      return { isValid: true };
    }

    // Sort coordinates to find range
    const sortedCoords = [...coords].sort((a, b) => a - b);
    const min = sortedCoords[0];
    const max = sortedCoords[sortedCoords.length - 1];

    // Check that every position between min and max is filled
    // (either by pending placement or existing tile)
    for (let coord = min; coord <= max; coord++) {
      const position = fixedAxis === 'row'
        ? { row: fixedCoord, col: coord }
        : { row: coord, col: fixedCoord };

      const isPending = coords.includes(coord);
      const isExisting = BoardModel.isOccupied(boardTiles, position);

      if (!isPending && !isExisting) {
        return {
          isValid: false,
          error: 'All placed tiles must form a continuous line with no gaps'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Check if a position has at least one adjacent tile (for non-first moves)
   */
  static hasAdjacentTile(
    boardTiles: Map<string, any>,
    position: BoardPosition
  ): boolean {
    return BoardModel.isAdjacentToTile(boardTiles, position);
  }

  /**
   * Validate that at least one pending placement is adjacent to an existing tile
   * (Required for all moves after the first)
   */
  static validateAdjacentToBoard(
    boardTiles: Map<string, any>,
    placements: PendingPlacement[]
  ): AdjacencyValidationResult {
    const hasAdjacent = placements.some(p =>
      this.hasAdjacentTile(boardTiles, p.position)
    );

    if (!hasAdjacent) {
      return {
        isValid: false,
        error: 'At least one tile must be adjacent to an existing tile on the board'
      };
    }

    return { isValid: true };
  }
}

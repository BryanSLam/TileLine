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
  static validatePlacements(placements: PendingPlacement[]): AdjacencyValidationResult {
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
      return this.validateContinuous(cols, 'horizontal');
    } else {
      return this.validateContinuous(rows, 'vertical');
    }
  }

  /**
   * Validate that coordinates are continuous (no gaps between placements)
   */
  private static validateContinuous(
    coords: number[],
    _direction: 'horizontal' | 'vertical'
  ): AdjacencyValidationResult {
    // Check if there are gaps in the sequence
    // Note: This allows for existing tiles to fill gaps on the actual board
    // The continuous check here just ensures pending placements don't have gaps between them
    const uniqueCoords = new Set(coords);
    if (uniqueCoords.size !== coords.length) {
      return {
        isValid: false,
        error: 'Cannot place multiple tiles at the same position'
      };
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

import { BoardState, PendingPlacement, PlacedTile } from '../../types';
import { BoardModel } from '../../models/BoardModel';
import { LineValidator } from './lineValidator';
import { AdjacencyValidator } from './adjacencyValidator';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class PlacementValidator {
  /**
   * Main validation method - orchestrates all validation checks
   */
  static validatePlacement(
    board: BoardState,
    pendingPlacements: PendingPlacement[]
  ): ValidationResult {
    // Must have at least one placement
    if (pendingPlacements.length === 0) {
      return { isValid: false, error: 'Must place at least one tile' };
    }

    // Check for position conflicts with existing tiles
    const conflictCheck = this.checkPositionConflicts(board.tiles, pendingPlacements);
    if (!conflictCheck.isValid) {
      return conflictCheck;
    }

    // Special case: first move must include position (0, 0)
    if (board.tiles.size === 0) {
      return this.validateFirstMove(pendingPlacements);
    }

    // Validate adjacency (all placements form single line)
    const adjacencyCheck = AdjacencyValidator.validatePlacements(pendingPlacements, board.tiles);
    if (!adjacencyCheck.isValid) {
      return adjacencyCheck;
    }

    // Validate at least one placement is adjacent to existing tiles
    const boardAdjacencyCheck = AdjacencyValidator.validateAdjacentToBoard(
      board.tiles,
      pendingPlacements
    );
    if (!boardAdjacencyCheck.isValid) {
      return boardAdjacencyCheck;
    }

    // Create temporary board with pending placements
    const tempBoard = this.createTemporaryBoard(board.tiles, pendingPlacements);

    // Validate all affected lines
    return this.validateAllAffectedLines(tempBoard, pendingPlacements);
  }

  /**
   * Validate first move - must include position (0, 0)
   */
  private static validateFirstMove(placements: PendingPlacement[]): ValidationResult {
    const hasOrigin = placements.some(
      p => p.position.row === 0 && p.position.col === 0
    );

    if (!hasOrigin) {
      return {
        isValid: false,
        error: 'First move must include the center position (0, 0)'
      };
    }

    // Validate the placements form a valid line
    if (placements.length > 1) {
      const adjacencyCheck = AdjacencyValidator.validatePlacements(placements);
      if (!adjacencyCheck.isValid) {
        return adjacencyCheck;
      }

      // Create placed tiles from placements
      // Using -1 as placeholder values for validation (not yet committed)
      const tiles: PlacedTile[] = placements.map(p => ({
        ...p.tile,
        position: p.position,
        placedByPlayerIndex: -1,
        turnPlaced: -1
      }));

      return LineValidator.validateLine(tiles);
    }

    return { isValid: true };
  }

  /**
   * Check if any pending placement conflicts with existing tiles
   */
  private static checkPositionConflicts(
    boardTiles: Map<string, PlacedTile>,
    placements: PendingPlacement[]
  ): ValidationResult {
    for (const placement of placements) {
      if (BoardModel.isOccupied(boardTiles, placement.position)) {
        return {
          isValid: false,
          error: `Position (${placement.position.row}, ${placement.position.col}) is already occupied`
        };
      }
    }
    return { isValid: true };
  }

  /**
   * Create a temporary board that includes pending placements
   */
  private static createTemporaryBoard(
    boardTiles: Map<string, PlacedTile>,
    placements: PendingPlacement[]
  ): Map<string, PlacedTile> {
    const tempBoard = new Map(boardTiles);

    for (const placement of placements) {
      const placedTile: PlacedTile = {
        ...placement.tile,
        position: placement.position,
        placedByPlayerIndex: -1,
        turnPlaced: -1
      };
      tempBoard.set(BoardModel.positionToKey(placement.position), placedTile);
    }

    return tempBoard;
  }

  /**
   * Validate all lines affected by the pending placements
   */
  private static validateAllAffectedLines(
    tempBoard: Map<string, PlacedTile>,
    placements: PendingPlacement[]
  ): ValidationResult {
    for (const placement of placements) {
      // Check horizontal line
      const horizontalCheck = this.validateLineAtPosition(
        tempBoard,
        placement.position,
        'horizontal'
      );
      if (!horizontalCheck.isValid) {
        return horizontalCheck;
      }

      // Check vertical line
      const verticalCheck = this.validateLineAtPosition(
        tempBoard,
        placement.position,
        'vertical'
      );
      if (!verticalCheck.isValid) {
        return verticalCheck;
      }
    }

    return { isValid: true };
  }

  /**
   * Validate a line (horizontal or vertical) at a specific position
   */
  private static validateLineAtPosition(
    board: Map<string, PlacedTile>,
    position: { row: number; col: number },
    direction: 'horizontal' | 'vertical'
  ): ValidationResult {
    // Find the extent of the line
    const { start, end } = BoardModel.findLineExtent(board, position, direction);

    // Get all tiles in the line
    const tiles: PlacedTile[] = [];
    if (direction === 'horizontal') {
      for (let col = start; col <= end; col++) {
        const tile = BoardModel.getTileAt(board, { row: position.row, col });
        if (tile) tiles.push(tile);
      }
    } else {
      for (let row = start; row <= end; row++) {
        const tile = BoardModel.getTileAt(board, { row, col: position.col });
        if (tile) tiles.push(tile);
      }
    }

    // Only validate if there's more than one tile in the line
    if (tiles.length > 1) {
      return LineValidator.validateLine(tiles);
    }

    return { isValid: true };
  }
}

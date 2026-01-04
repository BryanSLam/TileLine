import { BoardState, Tile, BoardPosition, PendingPlacement } from '../../types';
import { BoardModel } from '../../models/BoardModel';
import { PlacementValidator } from '../validation/placementValidator';
import { ScoreCalculator } from '../scoring/scoreCalculator';

export interface AIMove {
  placements: PendingPlacement[];
  expectedScore: number;
  tilesUsed: number;
}

export class MoveGenerator {
  /**
   * Generate all valid single-tile moves for the AI
   */
  static generateValidMoves(board: BoardState, hand: Tile[]): AIMove[] {
    const moves: AIMove[] = [];

    // Get all valid placement positions
    const validPositions = this.getValidPositions(board);

    // For each tile in hand, try placing at each valid position
    for (const tile of hand) {
      for (const position of validPositions) {
        const placements: PendingPlacement[] = [{ tile, position }];

        // Validate the placement
        const validation = PlacementValidator.validatePlacement(board, placements);
        if (!validation.isValid) continue;

        // Calculate score
        const scoringResult = ScoreCalculator.calculateScore(board, placements);

        moves.push({
          placements,
          expectedScore: scoringResult.totalPoints,
          tilesUsed: 1
        });
      }
    }

    return moves;
  }

  /**
   * Get all positions adjacent to existing tiles (valid placement positions)
   * For first move, return only (0,0)
   */
  private static getValidPositions(board: BoardState): BoardPosition[] {
    // First move: only (0,0)
    if (board.tiles.size === 0) {
      return [{ row: 0, col: 0 }];
    }

    const validPositions = new Set<string>();

    // For each placed tile, get adjacent empty positions
    board.tiles.forEach((tile) => {
      const adjacents = BoardModel.getAdjacentPositions(tile.position);
      adjacents.forEach((pos) => {
        if (!BoardModel.isOccupied(board.tiles, pos)) {
          validPositions.add(BoardModel.positionToKey(pos));
        }
      });
    });

    return Array.from(validPositions).map(key => BoardModel.keyToPosition(key));
  }

  /**
   * Rank moves by score, with tie-breaker on tiles used
   */
  static rankMoves(moves: AIMove[]): AIMove[] {
    return moves.sort((a, b) => {
      // Primary: higher score is better
      if (b.expectedScore !== a.expectedScore) {
        return b.expectedScore - a.expectedScore;
      }
      // Tie-breaker: more tiles used is better
      return b.tilesUsed - a.tilesUsed;
    });
  }
}

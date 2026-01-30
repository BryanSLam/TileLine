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
   * Generate all valid moves for the AI (single-tile and multi-tile)
   */
  static generateValidMoves(board: BoardState, hand: Tile[]): AIMove[] {
    const moves: AIMove[] = [];

    // Generate single-tile moves
    moves.push(...this.generateSingleTileMoves(board, hand));

    // Generate multi-tile moves (2-6 tiles)
    moves.push(...this.generateMultiTileMoves(board, hand));

    return moves;
  }

  /**
   * Generate all valid single-tile moves
   */
  private static generateSingleTileMoves(board: BoardState, hand: Tile[]): AIMove[] {
    const moves: AIMove[] = [];
    const validPositions = this.getValidPositions(board);

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
   * Generate all valid multi-tile moves (2+ tiles in a line)
   */
  private static generateMultiTileMoves(board: BoardState, hand: Tile[]): AIMove[] {
    const moves: AIMove[] = [];

    // Don't generate multi-tile moves if hand is too small
    if (hand.length < 2) return moves;

    const validPositions = this.getValidPositions(board);

    // For each starting position
    for (const startPosition of validPositions) {
      // Try horizontal and vertical directions
      for (const direction of ['horizontal', 'vertical'] as const) {
        // Try different numbers of tiles (2 to min(hand.length, 6))
        const maxTiles = Math.min(hand.length, 6);
        for (let numTiles = 2; numTiles <= maxTiles; numTiles++) {
          // Generate combinations of tiles from hand
          const tileCombinations = this.getCombinations(hand, numTiles);

          for (const tiles of tileCombinations) {
            // Try different permutations of tile order
            const permutations = this.getPermutations(tiles);

            for (const orderedTiles of permutations) {
              // Generate placements for this line
              const placements = this.generateLinePlacements(
                board,
                startPosition,
                direction,
                orderedTiles
              );

              if (placements.length === 0) continue;

              // Validate the placement
              const validation = PlacementValidator.validatePlacement(board, placements);
              if (!validation.isValid) continue;

              // Calculate score
              const scoringResult = ScoreCalculator.calculateScore(board, placements);

              moves.push({
                placements,
                expectedScore: scoringResult.totalPoints,
                tilesUsed: orderedTiles.length
              });
            }
          }
        }
      }
    }

    return moves;
  }

  /**
   * Generate placements for a line of tiles in a given direction
   * Skips positions that are already occupied (allowing tiles to fit around existing tiles)
   */
  private static generateLinePlacements(
    board: BoardState,
    startPosition: BoardPosition,
    direction: 'horizontal' | 'vertical',
    tiles: Tile[]
  ): PendingPlacement[] {
    const placements: PendingPlacement[] = [];
    let currentPosition = { ...startPosition };
    let tileIndex = 0;

    // Try to place all tiles in the given direction
    while (tileIndex < tiles.length) {
      // Check if current position is occupied
      if (BoardModel.isOccupied(board.tiles, currentPosition)) {
        // Skip this position and move to next
        if (direction === 'horizontal') {
          currentPosition = { row: currentPosition.row, col: currentPosition.col + 1 };
        } else {
          currentPosition = { row: currentPosition.row + 1, col: currentPosition.col };
        }
        continue;
      }

      // Place tile at current position
      placements.push({
        tile: tiles[tileIndex],
        position: { ...currentPosition }
      });

      tileIndex++;

      // Move to next position
      if (direction === 'horizontal') {
        currentPosition = { row: currentPosition.row, col: currentPosition.col + 1 };
      } else {
        currentPosition = { row: currentPosition.row + 1, col: currentPosition.col };
      }
    }

    return placements;
  }

  /**
   * Get all combinations of k elements from array
   */
  private static getCombinations<T>(array: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (k > array.length) return [];

    const combinations: T[][] = [];

    const helper = (start: number, combo: T[]) => {
      if (combo.length === k) {
        combinations.push([...combo]);
        return;
      }

      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    };

    helper(0, []);
    return combinations;
  }

  /**
   * Get all permutations of an array
   */
  private static getPermutations<T>(array: T[]): T[][] {
    if (array.length <= 1) return [array];

    const permutations: T[][] = [];

    for (let i = 0; i < array.length; i++) {
      const rest = [...array.slice(0, i), ...array.slice(i + 1)];
      const restPermutations = this.getPermutations(rest);

      for (const perm of restPermutations) {
        permutations.push([array[i], ...perm]);
      }
    }

    return permutations;
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

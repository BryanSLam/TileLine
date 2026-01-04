import { BoardState, Tile, PendingPlacement } from '../../types';
import { MoveGenerator, AIMove } from './moveGenerator';

export class GreedyAI {
  /**
   * Select the best move for the AI using a greedy algorithm
   * Returns null if no valid moves are available
   */
  static selectBestMove(board: BoardState, hand: Tile[]): AIMove | null {
    // Generate all valid moves
    const moves = MoveGenerator.generateValidMoves(board, hand);

    if (moves.length === 0) {
      return null; // No valid moves
    }

    // Rank moves by score
    const rankedMoves = MoveGenerator.rankMoves(moves);

    // Return the best move
    return rankedMoves[0];
  }

  /**
   * Execute AI turn with a delay to simulate thinking
   */
  static async executeAITurn(
    board: BoardState,
    hand: Tile[],
    onMove: (placements: PendingPlacement[]) => void,
    thinkingDelay: number = 1000
  ): Promise<boolean> {
    // Simulate thinking time
    await this.delay(thinkingDelay);

    // Select best move
    const move = this.selectBestMove(board, hand);

    if (!move) {
      // No valid moves available
      return false;
    }

    // Execute the move
    onMove(move.placements);
    return true;
  }

  /**
   * Helper to create a delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

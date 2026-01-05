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
   * If no valid moves, exchange all tiles
   */
  static async executeAITurn(
    board: BoardState,
    hand: Tile[],
    tileBagSize: number,
    onMove: (placements: PendingPlacement[]) => void,
    onExchange: (tileIds: string[]) => void,
    thinkingDelay: number = 1000
  ): Promise<void> {
    // Simulate thinking time
    await this.delay(thinkingDelay);

    // Select best move
    const move = this.selectBestMove(board, hand);

    if (!move) {
      // No valid moves available - exchange tiles if possible
      if (tileBagSize >= hand.length && hand.length > 0) {
        console.log('AI exchanging all tiles (no valid moves)');
        const tileIds = hand.map(t => t.id);
        onExchange(tileIds);
      } else {
        console.warn('AI has no valid moves and cannot exchange tiles');
      }
      return;
    }

    // Execute the move
    onMove(move.placements);
  }

  /**
   * Helper to create a delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

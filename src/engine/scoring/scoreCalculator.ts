import { BoardState, PendingPlacement, PlacedTile } from '../../types';
import { BoardModel } from '../../models/BoardModel';
import { LineScorer, ScoredLine } from './lineScorer';

export interface ScoringResult {
  totalPoints: number;
  lines: ScoredLine[];
  hasFullLine: boolean;
}

export class ScoreCalculator {
  /**
   * Calculate the score for placing tiles
   * Rules:
   * - Each tile scores points for all lines it's part of (horizontal AND vertical)
   * - If multiple new tiles are in the same line, score that line once
   * - Single tile scores: points from horizontal line + points from vertical line
   * - 6-tile line (full line) = base points + 6 bonus
   */
  static calculateScore(
    board: BoardState,
    placements: PendingPlacement[]
  ): ScoringResult {
    if (placements.length === 0) {
      return { totalPoints: 0, lines: [], hasFullLine: false };
    }

    // Create temporary board with new placements
    const tempBoard = this.createTemporaryBoard(board.tiles, placements);

    // Track scored lines to avoid double-counting
    const scoredLines: ScoredLine[] = [];
    const scoredLineKeys = new Set<string>();

    // Determine primary direction of placements
    const placementDirection = this.getPlacementDirection(placements);

    for (const placement of placements) {
      // Score horizontal line
      const horizontalLine = this.getLineAtPosition(
        tempBoard,
        placement.position,
        'horizontal'
      );
      if (horizontalLine.length > 1) {
        const lineKey = this.getLineKey(horizontalLine, 'horizontal');
        if (!scoredLineKeys.has(lineKey)) {
          scoredLines.push(LineScorer.scoreLine(horizontalLine, 'horizontal'));
          scoredLineKeys.add(lineKey);
        }
      }

      // Score vertical line
      const verticalLine = this.getLineAtPosition(
        tempBoard,
        placement.position,
        'vertical'
      );
      if (verticalLine.length > 1) {
        const lineKey = this.getLineKey(verticalLine, 'vertical');
        if (!scoredLineKeys.has(lineKey)) {
          scoredLines.push(LineScorer.scoreLine(verticalLine, 'vertical'));
          scoredLineKeys.add(lineKey);
        }
      }
    }

    // Special case: single tile placed with no adjacent tiles in any direction
    // This should not happen in normal play (except first move), but handle it
    if (scoredLines.length === 0 && placements.length === 1) {
      // First move, single tile: 1 point
      scoredLines.push({
        tiles: [{ ...placements[0].tile, position: placements[0].position }],
        points: 1,
        isFullLine: false,
        direction: 'horizontal'
      });
    }

    const totalPoints = scoredLines.reduce((sum, line) => sum + line.points, 0);
    const hasFullLine = scoredLines.some(line => line.isFullLine);

    return {
      totalPoints,
      lines: scoredLines,
      hasFullLine
    };
  }

  /**
   * Determine if placements are primarily horizontal or vertical
   */
  private static getPlacementDirection(
    placements: PendingPlacement[]
  ): 'horizontal' | 'vertical' | null {
    if (placements.length <= 1) return null;

    const rows = placements.map(p => p.position.row);
    const allSameRow = rows.every(r => r === rows[0]);

    return allSameRow ? 'horizontal' : 'vertical';
  }

  /**
   * Get all tiles in a line at a specific position
   */
  private static getLineAtPosition(
    board: Map<string, PlacedTile>,
    position: { row: number; col: number },
    direction: 'horizontal' | 'vertical'
  ): PlacedTile[] {
    const { start, end } = BoardModel.findLineExtent(board, position, direction);

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

    return tiles;
  }

  /**
   * Create unique key for a line to avoid double-counting
   */
  private static getLineKey(tiles: PlacedTile[], direction: string): string {
    const sorted = [...tiles].sort((a, b) => {
      const aKey = `${a.position.row},${a.position.col}`;
      const bKey = `${b.position.row},${b.position.col}`;
      return aKey.localeCompare(bKey);
    });

    const positions = sorted.map(t => `${t.position.row},${t.position.col}`).join('|');
    return `${direction}:${positions}`;
  }

  /**
   * Create temporary board with pending placements
   */
  private static createTemporaryBoard(
    boardTiles: Map<string, PlacedTile>,
    placements: PendingPlacement[]
  ): Map<string, PlacedTile> {
    const tempBoard = new Map(boardTiles);

    for (const placement of placements) {
      const placedTile: PlacedTile = {
        ...placement.tile,
        position: placement.position
      };
      tempBoard.set(BoardModel.positionToKey(placement.position), placedTile);
    }

    return tempBoard;
  }
}

import { PlacedTile } from '../../types';

export interface ScoredLine {
  tiles: PlacedTile[];
  points: number;
  isFullLine: boolean;
  direction: 'horizontal' | 'vertical';
}

export class LineScorer {
  private static readonly FULL_LINE_BONUS = 6;
  private static readonly FULL_LINE_LENGTH = 6;

  /**
   * Score a line of tiles
   * 1 point per tile, plus 6 bonus points if line is complete (6 tiles)
   */
  static scoreLine(
    tiles: PlacedTile[],
    direction: 'horizontal' | 'vertical'
  ): ScoredLine {
    const points = tiles.length;
    const isFullLine = tiles.length === this.FULL_LINE_LENGTH;
    const totalPoints = isFullLine ? points + this.FULL_LINE_BONUS : points;

    return {
      tiles,
      points: totalPoints,
      isFullLine,
      direction
    };
  }

  /**
   * Check if a scored line is a full line (6 tiles)
   */
  static isFullLine(line: ScoredLine): boolean {
    return line.isFullLine;
  }
}

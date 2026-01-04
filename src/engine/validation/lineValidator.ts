import { PlacedTile, TileColor, TileShape } from '../../types';

export interface LineValidationResult {
  isValid: boolean;
  error?: string;
}

export class LineValidator {
  private static readonly MAX_LINE_LENGTH = 6;

  /**
   * Validate a line of tiles follows tile-matching line rules:
   * - All same color with different shapes, OR
   * - All same shape with different colors
   * - No duplicates (same color AND shape)
   * - Maximum 6 tiles
   */
  static validateLine(tiles: PlacedTile[]): LineValidationResult {
    if (tiles.length === 0) {
      return { isValid: true };
    }

    if (tiles.length === 1) {
      return { isValid: true };
    }

    if (tiles.length > this.MAX_LINE_LENGTH) {
      return {
        isValid: false,
        error: `Line exceeds maximum length of ${this.MAX_LINE_LENGTH}`
      };
    }

    // Check for duplicates
    const duplicateCheck = this.checkForDuplicates(tiles);
    if (!duplicateCheck.isValid) {
      return duplicateCheck;
    }

    // Check if all same color
    const colors = tiles.map(t => t.color);
    const allSameColor = colors.every(c => c === colors[0]);

    // Check if all same shape
    const shapes = tiles.map(t => t.shape);
    const allSameShape = shapes.every(s => s === shapes[0]);

    // Valid if (same color AND different shapes) OR (same shape AND different colors)
    if (allSameColor && !allSameShape) {
      return this.validateUniqueShapes(shapes);
    }

    if (allSameShape && !allSameColor) {
      return this.validateUniqueColors(colors);
    }

    return {
      isValid: false,
      error: 'Line must have all same color with different shapes, or all same shape with different colors'
    };
  }

  /**
   * Check for duplicate tiles (same color AND shape)
   */
  private static checkForDuplicates(tiles: PlacedTile[]): LineValidationResult {
    const seen = new Set<string>();

    for (const tile of tiles) {
      const key = `${tile.color}-${tile.shape}`;
      if (seen.has(key)) {
        return {
          isValid: false,
          error: `Duplicate tile: ${tile.color} ${tile.shape}`
        };
      }
      seen.add(key);
    }

    return { isValid: true };
  }

  /**
   * Validate all shapes are unique
   */
  private static validateUniqueShapes(shapes: TileShape[]): LineValidationResult {
    const uniqueShapes = new Set(shapes);
    if (uniqueShapes.size !== shapes.length) {
      return {
        isValid: false,
        error: 'All tiles in line with same color must have different shapes'
      };
    }
    return { isValid: true };
  }

  /**
   * Validate all colors are unique
   */
  private static validateUniqueColors(colors: TileColor[]): LineValidationResult {
    const uniqueColors = new Set(colors);
    if (uniqueColors.size !== colors.length) {
      return {
        isValid: false,
        error: 'All tiles in line with same shape must have different colors'
      };
    }
    return { isValid: true };
  }
}

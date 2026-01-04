import { v4 as uuidv4 } from 'uuid';
import { Tile, TileColor, TileShape } from '../types';

export class TileFactory {
  /**
   * Creates a full deck of 108 tiles
   * 6 colors × 6 shapes × 3 copies = 108 tiles
   */
  static createDeck(): Tile[] {
    const tiles: Tile[] = [];
    const colors = Object.values(TileColor);
    const shapes = Object.values(TileShape);
    const copies = 3;

    for (const color of colors) {
      for (const shape of shapes) {
        for (let i = 0; i < copies; i++) {
          tiles.push({
            id: uuidv4(),
            color,
            shape
          });
        }
      }
    }

    return this.shuffle(tiles);
  }

  /**
   * Fisher-Yates shuffle algorithm for array randomization
   */
  private static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Draw N tiles from the tile bag
   */
  static drawTiles(bag: Tile[], count: number): { drawn: Tile[]; remaining: Tile[] } {
    const drawn = bag.slice(0, count);
    const remaining = bag.slice(count);
    return { drawn, remaining };
  }
}

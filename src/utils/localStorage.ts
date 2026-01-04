import { GameState } from '../types';

const SAVE_KEY = 'tileline_save';
const SAVE_VERSION = '1.0';

export interface SavedGame {
  version: string;
  timestamp: number;
  gameState: GameState;
}

export class LocalStorageService {
  /**
   * Save game state to localStorage
   */
  static saveGame(gameState: GameState): void {
    try {
      const savedGame: SavedGame = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState: this.serializeGameState(gameState)
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(savedGame));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Load game state from localStorage
   */
  static loadGame(): GameState | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return null;

      const savedGame: SavedGame = JSON.parse(saved);

      // Version check
      if (savedGame.version !== SAVE_VERSION) {
        console.warn('Save version mismatch, clearing old save');
        this.clearSave();
        return null;
      }

      return this.deserializeGameState(savedGame.gameState);
    } catch (error) {
      console.error('Failed to load game:', error);
      this.clearSave();
      return null;
    }
  }

  /**
   * Clear saved game
   */
  static clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  /**
   * Check if a saved game exists
   */
  static hasSavedGame(): boolean {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved !== null;
    } catch {
      return false;
    }
  }

  /**
   * Serialize game state for storage
   * Convert Map to array of entries
   */
  private static serializeGameState(gameState: GameState): any {
    return {
      ...gameState,
      board: {
        ...gameState.board,
        tiles: Array.from(gameState.board.tiles.entries())
      }
    };
  }

  /**
   * Deserialize game state from storage
   * Convert array of entries back to Map
   */
  private static deserializeGameState(serialized: any): GameState {
    return {
      ...serialized,
      board: {
        ...serialized.board,
        tiles: new Map(serialized.board.tiles)
      }
    };
  }
}

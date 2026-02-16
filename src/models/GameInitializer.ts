import { v4 as uuidv4 } from 'uuid';
import { GameState, GamePhase, Player, PlayerConfig, BoardState } from '../types';
import { TileFactory } from './TileFactory';
import { getPlayerColor } from '../utils/playerColors';

export class GameInitializer {
  private static readonly INITIAL_HAND_SIZE = 6;

  /**
   * Initialize a new game with the specified player configurations
   */
  static initializeGame(playerConfigs: PlayerConfig[]): GameState {
    if (playerConfigs.length < 2 || playerConfigs.length > 4) {
      throw new Error('Game requires 2-4 players');
    }

    // Create tile deck and shuffle
    const deck = TileFactory.createDeck();
    let remainingTiles = deck;

    // Create players and deal initial hands
    const players: Player[] = playerConfigs.map((config, index) => {
      const { drawn, remaining } = TileFactory.drawTiles(remainingTiles, this.INITIAL_HAND_SIZE);
      remainingTiles = remaining;

      return {
        id: uuidv4(),
        name: config.name,
        type: config.type,
        score: 0,
        hand: drawn,
        isActive: index === 0, // First player is active
        color: getPlayerColor(index)
      };
    });

    // Initialize empty board
    const board: BoardState = {
      tiles: new Map(),
      bounds: {
        minRow: 0,
        maxRow: 0,
        minCol: 0,
        maxCol: 0
      }
    };

    return {
      phase: GamePhase.PLAYING,
      players,
      currentPlayerIndex: 0,
      board,
      tileBag: remainingTiles,
      pendingPlacements: [],
      lastScoredPoints: 0,
      gameHistory: [],
      turnNumber: 0
    };
  }

  /**
   * Create default player names based on type
   */
  static getDefaultPlayerName(type: PlayerConfig['type'], index: number): string {
    return type === 'human' ? `Player ${index + 1}` : `AI ${index + 1}`;
  }
}

import { create } from 'zustand';
import {
  GameState,
  GamePhase,
  PlayerConfig,
  Tile,
  BoardPosition,
  PendingPlacement,
  PlacedTile
} from '../types';
import { GameInitializer } from '../models/GameInitializer';
import { TileFactory } from '../models/TileFactory';
import { BoardModel } from '../models/BoardModel';
import { PlacementValidator } from '../engine/validation/placementValidator';
import { ScoreCalculator } from '../engine/scoring/scoreCalculator';

interface GameStore {
  // State
  gameState: GameState | null;
  showLineCompleteAnimation: boolean;
  selectedTile: Tile | null;

  // Setup actions
  initializeGame: (playerConfigs: PlayerConfig[]) => void;
  loadGame: (savedState: GameState) => void;
  returnToSetup: () => void;

  // Turn actions
  selectTile: (tile: Tile | null) => void;
  addPendingPlacement: (tile: Tile, position: BoardPosition) => void;
  removePendingPlacement: (position: BoardPosition) => void;
  clearPendingPlacements: () => void;
  commitTurn: () => boolean;

  // UI actions
  hideLineCompleteAnimation: () => void;

  // Getters
  getCurrentPlayer: () => GameState['players'][0] | null;
  isValidMove: () => boolean;
  canCommitTurn: () => boolean;
  getValidPositions: () => BoardPosition[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: null,
  showLineCompleteAnimation: false,
  selectedTile: null,

  // Initialize a new game
  initializeGame: (playerConfigs: PlayerConfig[]) => {
    const gameState = GameInitializer.initializeGame(playerConfigs);
    set({ gameState, showLineCompleteAnimation: false, selectedTile: null });
  },

  // Load a saved game
  loadGame: (savedState: GameState) => {
    set({ gameState: savedState });
  },

  // Return to setup screen
  returnToSetup: () => {
    set({ gameState: null, selectedTile: null });
  },

  // Select a tile from hand
  selectTile: (tile: Tile | null) => {
    set({ selectedTile: tile });
  },

  // Add a tile to pending placements
  addPendingPlacement: (tile: Tile, position: BoardPosition) => {
    const { gameState } = get();
    if (!gameState) return;

    // Check if position already has a pending placement
    const existingIndex = gameState.pendingPlacements.findIndex(
      p => p.position.row === position.row && p.position.col === position.col
    );

    // Remove tile from current player's hand
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const tileIndex = currentPlayer.hand.findIndex(t => t.id === tile.id);
    if (tileIndex === -1) return; // Tile not in hand

    const newHand = [...currentPlayer.hand];
    newHand.splice(tileIndex, 1);

    // Add to pending placements
    const newPendingPlacements = [...gameState.pendingPlacements];
    if (existingIndex >= 0) {
      // Replace existing placement
      newPendingPlacements[existingIndex] = { tile, position };
    } else {
      // Add new placement
      newPendingPlacements.push({ tile, position });
    }

    // Update player hand
    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      hand: newHand
    };

    set({
      gameState: {
        ...gameState,
        players: newPlayers,
        pendingPlacements: newPendingPlacements
      },
      selectedTile: null  // Clear selection after placing
    });
  },

  // Remove a pending placement
  removePendingPlacement: (position: BoardPosition) => {
    const { gameState } = get();
    if (!gameState) return;

    const placementIndex = gameState.pendingPlacements.findIndex(
      p => p.position.row === position.row && p.position.col === position.col
    );

    if (placementIndex === -1) return;

    // Get the tile being removed
    const removedPlacement = gameState.pendingPlacements[placementIndex];

    // Remove from pending placements
    const newPendingPlacements = [...gameState.pendingPlacements];
    newPendingPlacements.splice(placementIndex, 1);

    // Return tile to hand
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const newHand = [...currentPlayer.hand, removedPlacement.tile];

    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      hand: newHand
    };

    set({
      gameState: {
        ...gameState,
        players: newPlayers,
        pendingPlacements: newPendingPlacements
      }
    });
  },

  // Clear all pending placements
  clearPendingPlacements: () => {
    const { gameState } = get();
    if (!gameState || gameState.pendingPlacements.length === 0) return;

    // Return all tiles to hand
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const returnedTiles = gameState.pendingPlacements.map(p => p.tile);
    const newHand = [...currentPlayer.hand, ...returnedTiles];

    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      hand: newHand
    };

    set({
      gameState: {
        ...gameState,
        players: newPlayers,
        pendingPlacements: []
      },
      selectedTile: null  // Clear selection
    });
  },

  // Commit the current turn
  commitTurn: () => {
    const { gameState } = get();
    if (!gameState || gameState.pendingPlacements.length === 0) {
      return false;
    }

    // Validate placement
    const validation = PlacementValidator.validatePlacement(
      gameState.board,
      gameState.pendingPlacements
    );

    if (!validation.isValid) {
      console.error('Invalid placement:', validation.error);
      return false;
    }

    // Calculate score
    const scoringResult = ScoreCalculator.calculateScore(
      gameState.board,
      gameState.pendingPlacements
    );

    // Place tiles on board
    const newBoardTiles = new Map(gameState.board.tiles);
    let newBounds = gameState.board.bounds;

    for (const placement of gameState.pendingPlacements) {
      const placedTile: PlacedTile = {
        ...placement.tile,
        position: placement.position
      };
      newBoardTiles.set(BoardModel.positionToKey(placement.position), placedTile);
      newBounds = BoardModel.updateBounds(newBounds, placement.position);
    }

    // Update current player score
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      score: currentPlayer.score + scoringResult.totalPoints,
      isActive: false
    };

    // Draw new tiles for current player
    const tilesToDraw = Math.min(
      gameState.pendingPlacements.length,
      gameState.tileBag.length
    );
    const { drawn, remaining } = TileFactory.drawTiles(gameState.tileBag, tilesToDraw);
    newPlayers[gameState.currentPlayerIndex].hand.push(...drawn);

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    newPlayers[nextPlayerIndex] = {
      ...newPlayers[nextPlayerIndex],
      isActive: true
    };

    // Check for game over
    const isGameOver =
      remaining.length === 0 &&
      newPlayers[gameState.currentPlayerIndex].hand.length === 0;

    set({
      gameState: {
        ...gameState,
        board: {
          tiles: newBoardTiles,
          bounds: newBounds
        },
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        tileBag: remaining,
        pendingPlacements: [],
        lastScoredPoints: scoringResult.totalPoints,
        phase: isGameOver ? GamePhase.GAME_OVER : GamePhase.PLAYING,
        gameHistory: [
          ...gameState.gameHistory,
          {
            playerIndex: gameState.currentPlayerIndex,
            placements: gameState.pendingPlacements.map(p => ({
              ...p.tile,
              position: p.position
            })),
            pointsScored: scoringResult.totalPoints,
            tilesDrawn: drawn
          }
        ]
      }
    });

    // Show line complete animation if applicable
    if (scoringResult.hasFullLine) {
      set({ showLineCompleteAnimation: true });
    }

    return true;
  },

  // Hide line complete animation
  hideLineCompleteAnimation: () => {
    set({ showLineCompleteAnimation: false });
  },

  // Get current player
  getCurrentPlayer: () => {
    const { gameState } = get();
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex];
  },

  // Check if current placements are valid
  isValidMove: () => {
    const { gameState } = get();
    if (!gameState || gameState.pendingPlacements.length === 0) {
      return false;
    }

    const validation = PlacementValidator.validatePlacement(
      gameState.board,
      gameState.pendingPlacements
    );

    return validation.isValid;
  },

  // Check if player can commit turn
  canCommitTurn: () => {
    const { gameState } = get();
    if (!gameState) return false;
    return gameState.pendingPlacements.length > 0 && get().isValidMove();
  },

  // Get valid positions for placing a tile
  getValidPositions: () => {
    const { gameState, selectedTile } = get();
    if (!gameState || !selectedTile) return [];

    const validPositions: BoardPosition[] = [];

    // First move: only (0,0)
    if (gameState.board.tiles.size === 0 && gameState.pendingPlacements.length === 0) {
      return [{ row: 0, col: 0 }];
    }

    // Get all positions adjacent to placed tiles and pending placements
    const occupiedPositions = new Set<string>();
    const adjacentPositions = new Set<string>();

    // Add all placed tiles
    gameState.board.tiles.forEach((tile) => {
      occupiedPositions.add(BoardModel.positionToKey(tile.position));
      const adjacents = BoardModel.getAdjacentPositions(tile.position);
      adjacents.forEach((pos) => {
        const key = BoardModel.positionToKey(pos);
        if (!occupiedPositions.has(key)) {
          adjacentPositions.add(key);
        }
      });
    });

    // Add all pending placements
    gameState.pendingPlacements.forEach((placement) => {
      occupiedPositions.add(BoardModel.positionToKey(placement.position));
      const adjacents = BoardModel.getAdjacentPositions(placement.position);
      adjacents.forEach((pos) => {
        const key = BoardModel.positionToKey(pos);
        if (!occupiedPositions.has(key)) {
          adjacentPositions.add(key);
        }
      });
    });

    // If there are pending placements, constrain to the same line
    // All placements in a turn must be in the same row OR same column
    if (gameState.pendingPlacements.length > 0) {
      const firstPending = gameState.pendingPlacements[0];

      // Filter adjacent positions to only those in the same line
      const constrainedPositions = new Set<string>();

      if (gameState.pendingPlacements.length === 1) {
        // First placement - next tile can be in same row OR same column
        for (const key of adjacentPositions) {
          const position = BoardModel.keyToPosition(key);
          if (position.row === firstPending.position.row || position.col === firstPending.position.col) {
            constrainedPositions.add(key);
          }
        }
      } else {
        // Multiple placements - determine if they're horizontal or vertical
        const allSameRow = gameState.pendingPlacements.every(p => p.position.row === firstPending.position.row);
        const allSameCol = gameState.pendingPlacements.every(p => p.position.col === firstPending.position.col);

        for (const key of adjacentPositions) {
          const position = BoardModel.keyToPosition(key);
          if (allSameRow && position.row === firstPending.position.row) {
            // Continue the horizontal line
            constrainedPositions.add(key);
          } else if (allSameCol && position.col === firstPending.position.col) {
            // Continue the vertical line
            constrainedPositions.add(key);
          }
        }
      }

      adjacentPositions.clear();
      constrainedPositions.forEach(key => adjacentPositions.add(key));
    }

    // Test each adjacent position
    for (const key of adjacentPositions) {
      const position = BoardModel.keyToPosition(key);

      // Try placing the tile here
      const testPlacement: PendingPlacement = {
        tile: selectedTile,
        position
      };

      const testPlacements = [...gameState.pendingPlacements, testPlacement];

      // Validate the placement
      const validation = PlacementValidator.validatePlacement(
        gameState.board,
        testPlacements
      );

      if (validation.isValid) {
        validPositions.push(position);
      }
    }

    return validPositions;
  }
}));

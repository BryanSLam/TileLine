import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LocalStorageService } from '../utils/localStorage';
import { GamePhase } from '../types';

export function useGamePersistence() {
  const gameState = useGameStore(state => state.gameState);

  // Auto-save on state changes
  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.PLAYING) {
      // Save game after each turn
      LocalStorageService.saveGame(gameState);
    }
  }, [gameState]);

  // Clear save on game over
  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.GAME_OVER) {
      // Clear the save after a delay (allow user to see final state)
      const timer = setTimeout(() => {
        LocalStorageService.clearSave();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameState?.phase]);
}

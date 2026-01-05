import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GreedyAI } from '../engine/ai/greedyAI';

export function useAITurn() {
  const gameState = useGameStore(state => state.gameState);
  const commitTurn = useGameStore(state => state.commitTurn);
  const isProcessingRef = useRef(false);
  const currentPlayerIndexRef = useRef(-1);

  useEffect(() => {
    if (!gameState) {
      isProcessingRef.current = false;
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Reset processing flag if the player changed
    if (currentPlayerIndexRef.current !== gameState.currentPlayerIndex) {
      currentPlayerIndexRef.current = gameState.currentPlayerIndex;
      isProcessingRef.current = false;
    }

    // Only process if it's an AI player's turn, no pending placements, and not already processing
    if (
      currentPlayer.type !== 'ai' ||
      gameState.pendingPlacements.length > 0 ||
      isProcessingRef.current
    ) {
      return;
    }

    // Execute AI turn
    isProcessingRef.current = true;

    GreedyAI.executeAITurn(
      gameState.board,
      currentPlayer.hand,
      gameState.tileBag.length,
      (placements) => {
        // Add placements to pending
        placements.forEach(placement => {
          useGameStore.getState().addPendingPlacement(placement.tile, placement.position);
        });

        // Commit the turn after a short delay
        setTimeout(() => {
          const success = commitTurn();
          if (!success) {
            console.error('AI failed to commit turn');
          }
          isProcessingRef.current = false;
        }, 300);
      },
      (tileIds) => {
        // Exchange tiles callback
        setTimeout(() => {
          const success = useGameStore.getState().exchangeTiles(tileIds);
          if (!success) {
            console.error('AI failed to exchange tiles');
          }
          isProcessingRef.current = false;
        }, 300);
      },
      600 // Thinking delay
    ).catch(error => {
      console.error('AI turn error:', error);
      isProcessingRef.current = false;
    });

  }, [gameState, commitTurn]);
}

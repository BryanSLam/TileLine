import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAITurn } from '../../hooks/useAITurn';
import { useGamePersistence } from '../../hooks/useGamePersistence';
import { GameBoard } from '../GameBoard/GameBoard';
import { PlayerInfo } from '../PlayerInfo/PlayerInfo';
import { PlayerHand } from '../PlayerHand/PlayerHand';
import { TurnControls } from '../Controls/TurnControls';
import { GameOver } from '../GameOver/GameOver';
import { LineCompleteAnimation } from '../ScoreDisplay/LineCompleteAnimation';
import { GameLog } from '../GameLog/GameLog';
import { GamePhase } from '../../types';
import styles from './GameContainer.module.css';

export function GameContainer() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const showLineCompleteAnimation = useGameStore(state => state.showLineCompleteAnimation);
  const hideLineCompleteAnimation = useGameStore(state => state.hideLineCompleteAnimation);

  // Automatically execute AI turns
  useAITurn();

  // Auto-save game state
  useGamePersistence();

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.type === 'human';
  const isGameOver = gameState.phase === GamePhase.GAME_OVER;

  return (
    <div className={styles.container}>
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <button
          className={styles.collapseToggle}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Show players and log" : "Hide players and log"}
        >
          {sidebarCollapsed ? '▼' : '▲'}
        </button>

        {!sidebarCollapsed && (
          <>
            <div className={styles.sidebarHeader}>
              <h2>Players</h2>
            </div>

            <div className={styles.playerList}>
              {gameState.players.map(player => (
                <PlayerInfo key={player.id} player={player} />
              ))}
            </div>

            <GameLog
              history={gameState.gameHistory}
              players={gameState.players}
            />

            <div className={styles.gameInfo}>
              <div className={styles.infoItem}>
                <span>Tiles Remaining:</span>
                <strong>{gameState.tileBag.length}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.mainArea}>
        <GameBoard />

        <div className={styles.bottomPanel}>
          {isHumanTurn ? (
            <>
              <PlayerHand
                tiles={currentPlayer.hand}
                isCurrentPlayer={true}
              />
              <TurnControls />
            </>
          ) : (
            <div className={styles.aiTurnMessage}>
              <p>{currentPlayer.name} is thinking...</p>
            </div>
          )}
        </div>
      </div>

      {isGameOver && <GameOver gameState={gameState} />}
      {showLineCompleteAnimation && <LineCompleteAnimation onComplete={hideLineCompleteAnimation} />}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { PlayerType, PlayerConfig } from '../../types';
import { GameInitializer } from '../../models/GameInitializer';
import { useGameStore } from '../../store/gameStore';
import { LocalStorageService } from '../../utils/localStorage';
import styles from './GameSetup.module.css';

export function GameSetup() {
  const initializeGame = useGameStore(state => state.initializeGame);
  const loadGame = useGameStore(state => state.loadGame);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>([
    PlayerType.HUMAN,
    PlayerType.AI
  ]);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    setHasSavedGame(LocalStorageService.hasSavedGame());
  }, []);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    // Adjust playerTypes array
    const newTypes = [...playerTypes];
    while (newTypes.length < count) {
      newTypes.push(PlayerType.AI);
    }
    while (newTypes.length > count) {
      newTypes.pop();
    }
    setPlayerTypes(newTypes);
  };

  const handlePlayerTypeChange = (index: number, type: PlayerType) => {
    const newTypes = [...playerTypes];
    newTypes[index] = type;
    setPlayerTypes(newTypes);
  };

  const handleStartGame = () => {
    const playerConfigs: PlayerConfig[] = playerTypes.map((type, index) => ({
      name: GameInitializer.getDefaultPlayerName(type, index),
      type
    }));

    initializeGame(playerConfigs);
  };

  const handleResumeGame = () => {
    const savedGame = LocalStorageService.loadGame();
    if (savedGame) {
      loadGame(savedGame);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.setupCard}>
        <h2>Setup Game</h2>

        {hasSavedGame && (
          <div className={styles.resumeSection}>
            <button className={styles.resumeButton} onClick={handleResumeGame}>
              Resume Saved Game
            </button>
            <p className={styles.resumeText}>Continue your previous game</p>
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.label}>Number of Players</label>
          <div className={styles.buttonGroup}>
            {[2, 3, 4].map(count => (
              <button
                key={count}
                className={playerCount === count ? styles.buttonActive : styles.button}
                onClick={() => handlePlayerCountChange(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Player Types</label>
          {playerTypes.map((type, index) => (
            <div key={index} className={styles.playerRow}>
              <span className={styles.playerLabel}>Player {index + 1}</span>
              <div className={styles.buttonGroup}>
                <button
                  className={type === PlayerType.HUMAN ? styles.buttonActive : styles.button}
                  onClick={() => handlePlayerTypeChange(index, PlayerType.HUMAN)}
                >
                  Human
                </button>
                <button
                  className={type === PlayerType.AI ? styles.buttonActive : styles.button}
                  onClick={() => handlePlayerTypeChange(index, PlayerType.AI)}
                >
                  AI
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.startButton} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}

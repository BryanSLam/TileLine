import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/GameSetup/GameSetup';
import { GameContainer } from './components/GameContainer/GameContainer';
import { useUIPreferencesPersistence } from './hooks/useUIPreferencesPersistence';
import styles from './App.module.css';

function App() {
  useUIPreferencesPersistence();
  const gameState = useGameStore(state => state.gameState);
  const returnToSetup = useGameStore(state => state.returnToSetup);

  const handleRestart = () => {
    if (gameState && window.confirm('Are you sure you want to start a new game? Current progress will be lost.')) {
      returnToSetup();
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>TileLine</h1>
        {gameState && (
          <button className={styles.restartButton} onClick={handleRestart}>
            New Game
          </button>
        )}
      </header>
      <main className={styles.main}>
        {gameState ? <GameContainer /> : <GameSetup />}
      </main>
    </div>
  );
}

export default App;

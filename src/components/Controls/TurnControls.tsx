import { useGameStore } from '../../store/gameStore';
import { useUIPreferencesStore } from '../../store/uiPreferencesStore';
import styles from './TurnControls.module.css';

export function TurnControls() {
  const gameState = useGameStore(state => state.gameState);
  const commitTurn = useGameStore(state => state.commitTurn);
  const clearPendingPlacements = useGameStore(state => state.clearPendingPlacements);
  const canCommit = useGameStore(state => state.canCommitTurn());
  const showPlacementHints = useUIPreferencesStore((state) => state.preferences.showPlacementHints);
  const togglePlacementHints = useUIPreferencesStore((state) => state.togglePlacementHints);

  if (!gameState) return null;

  const hasPendingPlacements = gameState.pendingPlacements.length > 0;

  const handleConfirm = () => {
    const success = commitTurn();
    if (!success) {
      const hintsEnabled = useUIPreferencesStore.getState().preferences.showPlacementHints;
      if (!hintsEnabled) {
        alert('Invalid placement!\n\nTip: Enable "Show placement hints" for guidance on valid placements.');
      } else {
        alert('Invalid placement! Please check the rules and try again.');
      }
    }
  };

  const handleCancel = () => {
    clearPendingPlacements();
  };

  return (
    <div className={styles.container}>
      <div className={styles.hintsToggle}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showPlacementHints}
            onChange={togglePlacementHints}
            className={styles.checkbox}
          />
          <span className={styles.toggleText}>Show placement hints</span>
        </label>
      </div>

      <div className={styles.buttons}>
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={!hasPendingPlacements}
        >
          Cancel
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleConfirm}
          disabled={!canCommit}
        >
          Confirm Move
        </button>
      </div>

      {hasPendingPlacements && !canCommit && (
        <div className={styles.errorMessage}>
          Invalid placement. {!showPlacementHints && 'Enable hints for guidance, or '}
          Check that tiles form a valid line.
        </div>
      )}
    </div>
  );
}

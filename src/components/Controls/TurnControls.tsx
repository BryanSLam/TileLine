import { useGameStore } from '../../store/gameStore';
import { useUIPreferencesStore } from '../../store/uiPreferencesStore';
import styles from './TurnControls.module.css';

export function TurnControls() {
  const gameState = useGameStore(state => state.gameState);
  const commitTurn = useGameStore(state => state.commitTurn);
  const exchangeTiles = useGameStore(state => state.exchangeTiles);
  const clearPendingPlacements = useGameStore(state => state.clearPendingPlacements);
  const selectTile = useGameStore(state => state.selectTile);
  const canCommit = useGameStore(state => state.canCommitTurn());
  const exchangeMode = useGameStore(state => state.exchangeMode);
  const selectedTileIds = useGameStore(state => state.selectedTileIdsForExchange);
  const setExchangeMode = useGameStore(state => state.setExchangeMode);
  const clearExchangeSelection = useGameStore(state => state.clearExchangeSelection);
  const showPlacementHints = useUIPreferencesStore((state) => state.preferences.showPlacementHints);
  const togglePlacementHints = useUIPreferencesStore((state) => state.togglePlacementHints);

  if (!gameState) return null;

  const hasPendingPlacements = gameState.pendingPlacements.length > 0;
  const canExchange = gameState.tileBag.length > 0 && !hasPendingPlacements;

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
    if (exchangeMode) {
      setExchangeMode(false);
      clearExchangeSelection();
      selectTile(null);
    } else {
      clearPendingPlacements();
    }
  };

  const handleStartExchange = () => {
    setExchangeMode(true);
    clearExchangeSelection();
    clearPendingPlacements();
    selectTile(null);
  };

  const handleConfirmExchange = () => {
    const success = exchangeTiles(selectedTileIds);
    if (success) {
      setExchangeMode(false);
      clearExchangeSelection();
    } else {
      alert('Unable to exchange tiles. Make sure the bag has enough tiles.');
    }
  };

  return (
    <div className={styles.container}>
      {!exchangeMode && (
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
      )}

      {exchangeMode && (
        <div className={styles.exchangeInfo}>
          <p className={styles.exchangeText}>
            Select tiles to exchange ({selectedTileIds.length} selected)
          </p>
          <p className={styles.exchangeHelp}>
            Click tiles in your hand to select them
          </p>
        </div>
      )}

      <div className={styles.buttons}>
        {exchangeMode ? (
          <>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className={styles.confirmButton}
              onClick={handleConfirmExchange}
              disabled={selectedTileIds.length === 0}
            >
              Exchange {selectedTileIds.length > 0 ? `${selectedTileIds.length} Tile${selectedTileIds.length > 1 ? 's' : ''}` : ''}
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={!hasPendingPlacements}
            >
              Cancel
            </button>
            <button
              className={styles.exchangeButton}
              onClick={handleStartExchange}
              disabled={!canExchange}
              title={!canExchange ? (hasPendingPlacements ? 'Clear placements first' : 'No tiles left in bag') : 'Exchange tiles from your hand'}
            >
              Exchange
            </button>
            <button
              className={styles.confirmButton}
              onClick={handleConfirm}
              disabled={!canCommit}
            >
              Confirm
            </button>
          </>
        )}
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

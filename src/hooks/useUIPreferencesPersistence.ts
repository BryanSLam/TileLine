import { useEffect } from 'react';
import { useUIPreferencesStore } from '../store/uiPreferencesStore';

const UI_PREFERENCES_KEY = 'tileline_ui_preferences';

export function useUIPreferencesPersistence() {
  const preferences = useUIPreferencesStore((state) => state.preferences);
  const setPlacementHints = useUIPreferencesStore((state) => state.setPlacementHints);

  // Load preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UI_PREFERENCES_KEY);
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPlacementHints(parsedPreferences.showPlacementHints ?? true);
      }
    } catch (error) {
      console.error('Failed to load UI preferences:', error);
    }
  }, [setPlacementHints]);

  // Save preferences on change
  useEffect(() => {
    try {
      localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save UI preferences:', error);
    }
  }, [preferences]);
}

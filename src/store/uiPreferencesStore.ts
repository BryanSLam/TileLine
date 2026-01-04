import { create } from 'zustand';

interface UIPreferences {
  showPlacementHints: boolean;
}

interface UIPreferencesStore {
  preferences: UIPreferences;
  togglePlacementHints: () => void;
  setPlacementHints: (value: boolean) => void;
}

export const useUIPreferencesStore = create<UIPreferencesStore>((set) => ({
  preferences: {
    showPlacementHints: true, // Default to hints enabled
  },

  togglePlacementHints: () => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        showPlacementHints: !state.preferences.showPlacementHints,
      },
    }));
  },

  setPlacementHints: (value: boolean) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        showPlacementHints: value,
      },
    }));
  },
}));

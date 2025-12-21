'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  showEQAnalysis: boolean;
  soundEffects: boolean;
  
  setShowEQAnalysis: (value: boolean) => void;
  setSoundEffects: (value: boolean) => void;
  toggleShowEQAnalysis: () => void;
  toggleSoundEffects: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showEQAnalysis: true,
      soundEffects: false,
      
      setShowEQAnalysis: (value) => set({ showEQAnalysis: value }),
      setSoundEffects: (value) => set({ soundEffects: value }),
      toggleShowEQAnalysis: () => set((state) => ({ showEQAnalysis: !state.showEQAnalysis })),
      toggleSoundEffects: () => set((state) => ({ soundEffects: !state.soundEffects })),
    }),
    {
      name: 'eq-coach-settings',
    }
  )
);



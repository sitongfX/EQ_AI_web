'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  date: string; // ISO string
  averageScore: number;
  goalsCompleted: number;
  totalGoals: number;
  scores: {
    selfAwareness: number;
    selfManagement: number;
    socialAwareness: number;
    relationshipManagement: number;
  };
}

interface HistoryState {
  sessions: SessionRecord[];
  totalSessions: number;
  currentStreak: number;
  lastSessionDate: string | null;
  
  addSession: (session: Omit<SessionRecord, 'id'>) => void;
  clearHistory: () => void;
  getAverageScore: () => number;
}

function calculateStreak(sessions: SessionRecord[], lastDate: string | null): number {
  if (!lastDate || sessions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const last = new Date(lastDate);
  last.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  
  // If more than 1 day has passed, streak is broken
  if (diffDays > 1) return 0;
  
  // Count consecutive days with sessions
  let streak = 1;
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let currentDate = last;
  for (let i = 1; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i].date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
      currentDate = sessionDate;
    } else if (dayDiff > 1) {
      break;
    }
    // If dayDiff === 0, same day, continue checking
  }
  
  return streak;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      totalSessions: 0,
      currentStreak: 0,
      lastSessionDate: null,
      
      addSession: (sessionData) => {
        const newSession: SessionRecord = {
          ...sessionData,
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        
        set((state) => {
          const newSessions = [newSession, ...state.sessions];
          const newStreak = calculateStreak(newSessions, newSession.date);
          
          return {
            sessions: newSessions,
            totalSessions: state.totalSessions + 1,
            currentStreak: newStreak,
            lastSessionDate: newSession.date,
          };
        });
      },
      
      clearHistory: () => set({
        sessions: [],
        totalSessions: 0,
        currentStreak: 0,
        lastSessionDate: null,
      }),
      
      getAverageScore: () => {
        const { sessions } = get();
        if (sessions.length === 0) return 0;
        const sum = sessions.reduce((acc, s) => acc + s.averageScore, 0);
        return Math.round(sum / sessions.length);
      },
    }),
    {
      name: 'niceai-history',
    }
  )
);



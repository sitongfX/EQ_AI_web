'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Scenario } from '@/data/scenarios';
import { analyzeAndRespond, getCoachHint, Message, EQScore, EQAnalysis } from '@/lib/ai-client';

interface Session {
  id: string;
  scenarioId: string;
  userId: string;
  messages: Message[];
  startedAt: Date;
  completedAt?: Date;
  averageEQScores?: EQScore[];
  completedTasks: string[];
}

interface ConversationState {
  scenario: Scenario | null;
  session: Session | null;
  messages: Message[];
  currentEQScores: EQScore[];
  completedTasks: Set<string>;
  isAIResponding: boolean;
  isSessionComplete: boolean;
  hintsAvailable: number;
  showHintPrompt: boolean;
  hasEQData: boolean; // Whether user has sent at least one message with EQ analysis
  
  initSession: (scenario: Scenario) => void;
  sendMessage: (content: string) => Promise<void>;
  requestHint: () => void;
  confirmHintRequest: () => Promise<void>;
  cancelHintRequest: () => void;
  completeSession: () => void;
  resetSession: () => void;
}

const initialEQScores: EQScore[] = [
  { dimension: 'selfAwareness', score: 50 },
  { dimension: 'selfManagement', score: 50 },
  { dimension: 'socialAwareness', score: 50 },
  { dimension: 'relationshipManagement', score: 50 },
];

function checkTaskCompletion(task: string, message: string, analysis: EQAnalysis): boolean {
  const taskLower = task.toLowerCase();
  const messageLower = message.toLowerCase();

  if ((taskLower.includes('express') || taskLower.includes('feel')) && 
      (messageLower.includes('i feel') || messageLower.includes("i'm feeling"))) {
    return analysis.selfAwareness >= 60;
  }

  if ((taskLower.includes('listen') || taskLower.includes('perspective')) &&
      (messageLower.includes('i understand') || messageLower.includes('i hear') || messageLower.includes('i see'))) {
    return analysis.socialAwareness >= 60;
  }

  if ((taskLower.includes('resolution') || taskLower.includes('solution')) &&
      (messageLower.includes("let's") || messageLower.includes('we could') || messageLower.includes('how about'))) {
    return analysis.relationshipManagement >= 60;
  }

  return analysis.overallScore >= 70;
}

export function parseObjectives(userObjective: string): string[] {
  let tasks: string[] = [];

  if (userObjective.includes('. ')) {
    tasks = userObjective.split('. ').map(t => t.trim()).filter(t => t.length > 10);
  }

  if (tasks.length < 3 && userObjective.includes(', ')) {
    const byComma = userObjective.split(', ').map(t => t.trim()).filter(t => t.length > 10);
    if (byComma.length >= tasks.length) tasks = byComma;
  }

  if (tasks.length < 3) {
    const byAnd = userObjective.split(' and ').map(t => t.trim()).filter(t => t.length > 10);
    if (byAnd.length > tasks.length) tasks = byAnd;
  }

  tasks = tasks.map(t => {
    let clean = t.trim();
    while (clean.endsWith('.')) clean = clean.slice(0, -1);
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  });

  if (tasks.length > 3) {
    tasks = tasks.slice(0, 3);
  } else if (tasks.length < 3) {
    const defaults = [
      'Express your feelings clearly and respectfully',
      "Listen actively to the other person's perspective",
      'Work collaboratively toward a resolution',
    ];
    while (tasks.length < 3) {
      const next = defaults.find(d => !tasks.includes(d));
      if (next) tasks.push(next);
      else break;
    }
  }

  return tasks.slice(0, 3);
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  scenario: null,
  session: null,
  messages: [],
  currentEQScores: [...initialEQScores],
  completedTasks: new Set(),
  isAIResponding: false,
  isSessionComplete: false,
  hintsAvailable: 0,
  showHintPrompt: false,
  hasEQData: false,

  initSession: (scenario: Scenario) => {
    const session: Session = {
      id: uuidv4(),
      scenarioId: scenario.id,
      userId: 'anonymous',
      messages: [],
      startedAt: new Date(),
      completedTasks: [],
    };

    const openingMessage: Message = {
      id: uuidv4(),
      content: scenario.openingLine,
      isUser: false,
      timestamp: new Date(),
    };

    set({
      scenario,
      session,
      messages: [openingMessage],
      currentEQScores: [...initialEQScores],
      completedTasks: new Set(),
      isAIResponding: false,
      isSessionComplete: false,
      hintsAvailable: 0,
      showHintPrompt: false,
      hasEQData: false,
    });
  },

  sendMessage: async (content: string) => {
    const { scenario, messages } = get();
    if (!scenario || !content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isAIResponding: true,
    }));

    try {
      // Single API call for both EQ analysis and character response (optimized)
      const { eqAnalysis, characterResponse } = await analyzeAndRespond(content, scenario, messages);

      const userMessageWithAnalysis: Message = {
        ...userMessage,
        eqAnalysis,
      };

      const aiMessage: Message = {
        id: uuidv4(),
        content: characterResponse,
        isUser: false,
        timestamp: new Date(),
      };

      const newScores: EQScore[] = [
        { dimension: 'selfAwareness', score: eqAnalysis.selfAwareness },
        { dimension: 'selfManagement', score: eqAnalysis.selfManagement },
        { dimension: 'socialAwareness', score: eqAnalysis.socialAwareness },
        { dimension: 'relationshipManagement', score: eqAnalysis.relationshipManagement },
      ];

      const { completedTasks } = get();
      const tasks = parseObjectives(scenario.userObjective);
      const newCompletedTasks = new Set(completedTasks);

      tasks.forEach(task => {
        if (checkTaskCompletion(task, content, eqAnalysis)) {
          newCompletedTasks.add(task);
        }
      });

      set(state => ({
        messages: state.messages.map(m => m.id === userMessage.id ? userMessageWithAnalysis : m).concat(aiMessage),
        currentEQScores: newScores,
        completedTasks: newCompletedTasks,
        isAIResponding: false,
        hasEQData: true,
      }));
    } catch (error) {
      console.error('Error in conversation:', error);
      const fallbackMessage: Message = {
        id: uuidv4(),
        content: "I hear what you're saying. That's an interesting perspective. Can you tell me more?",
        isUser: false,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, fallbackMessage],
        isAIResponding: false,
      }));
    }
  },

  requestHint: () => {
    set({ showHintPrompt: true });
  },

  confirmHintRequest: async () => {
    const { scenario, messages, currentEQScores } = get();
    if (!scenario) return;

    set({ showHintPrompt: false, isAIResponding: true });

    try {
      const hint = await getCoachHint(scenario, messages, currentEQScores);

      const hintMessage: Message = {
        id: uuidv4(),
        content: hint,
        isUser: false,
        timestamp: new Date(),
        isCoachIntervention: true,
      };

      set(state => ({
        messages: [...state.messages, hintMessage],
        hintsAvailable: state.hintsAvailable + 1,
        isAIResponding: false,
      }));
    } catch (error) {
      console.error('Error getting hint:', error);
      set({ isAIResponding: false });
    }
  },

  cancelHintRequest: () => {
    set({ showHintPrompt: false });
  },

  completeSession: () => {
    const { messages, currentEQScores, completedTasks, session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        messages,
        completedAt: new Date(),
        averageEQScores: currentEQScores,
        completedTasks: Array.from(completedTasks),
      },
      isSessionComplete: true,
    });
  },

  resetSession: () => {
    set({
      scenario: null,
      session: null,
      messages: [],
      currentEQScores: [...initialEQScores],
      completedTasks: new Set(),
      isAIResponding: false,
      isSessionComplete: false,
      hintsAvailable: 0,
      showHintPrompt: false,
      hasEQData: false,
    });
  },
}));


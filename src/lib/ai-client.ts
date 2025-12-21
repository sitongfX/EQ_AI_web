// Client-side AI functions that call our secure API route
// API keys are NEVER exposed to the client

import { Scenario } from '@/data/scenarios';

export interface EQAnalysis {
  selfAwareness: number;
  selfManagement: number;
  socialAwareness: number;
  relationshipManagement: number;
  overallScore: number;
  feedback: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  eqAnalysis?: EQAnalysis;
  isCoachIntervention?: boolean;
}

export interface EQScore {
  dimension: string;
  score: number;
}

// Combined response type
interface AnalyzeAndRespondResult {
  eqAnalysis: EQAnalysis;
  characterResponse: string;
}

// OPTIMIZED: Single API call for both EQ analysis AND character response
export async function analyzeAndRespond(
  message: string,
  scenario: Scenario,
  conversationHistory: Message[]
): Promise<AnalyzeAndRespondResult> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyzeAndRespond',
        message,
        scenario,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Combined analysis error:', error);
    return {
      eqAnalysis: fallbackEQAnalysis(message),
      characterResponse: fallbackCharacterResponse(message, conversationHistory),
    };
  }
}

// Legacy: Analyze user message for EQ scores (kept for backwards compatibility)
export async function analyzeMessage(
  message: string,
  scenario: Scenario,
  conversationHistory: Message[]
): Promise<EQAnalysis> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyzeEQ',
        message,
        scenario,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('EQ Analysis error:', error);
    return fallbackEQAnalysis(message);
  }
}

// Legacy: Generate character response (kept for backwards compatibility)
export async function generateCharacterResponse(
  message: string,
  scenario: Scenario,
  conversationHistory: Message[]
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateResponse',
        message,
        scenario,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Character response error:', error);
    return fallbackCharacterResponse(message, conversationHistory);
  }
}

// Get coach hint
export async function getCoachHint(
  scenario: Scenario,
  conversationHistory: Message[],
  eqScores: EQScore[]
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getHint',
        scenario,
        conversationHistory,
        eqScores,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.hint;
  } catch (error) {
    console.error('Coach hint error:', error);
    return fallbackHint(eqScores);
  }
}

// Fallback functions when API fails
function fallbackEQAnalysis(message: string): EQAnalysis {
  const text = message.toLowerCase();
  let selfAwareness = 50, selfManagement = 50, socialAwareness = 50, relationshipManagement = 50;

  if (text.includes('i feel') || text.includes("i'm feeling")) selfAwareness += 25;
  if (text.includes('i notice') || text.includes('i realize')) selfAwareness += 15;

  const negativePatterns = ['you always', 'you never', 'stupid', 'idiot', "you're wrong", 'ridiculous', 'whatever'];
  if (negativePatterns.some(p => text.includes(p))) {
    selfManagement -= 30;
  } else {
    selfManagement += 15;
  }

  if (text.includes('you feel') || text.includes('you might') || text.includes('your perspective')) socialAwareness += 25;
  if (text.includes('understand') || text.includes('i hear') || text.includes('i see')) socialAwareness += 15;

  if (text.includes("let's") || text.includes('we could') || text.includes('together')) relationshipManagement += 25;

  selfAwareness = Math.min(100, Math.max(0, selfAwareness));
  selfManagement = Math.min(100, Math.max(0, selfManagement));
  socialAwareness = Math.min(100, Math.max(0, socialAwareness));
  relationshipManagement = Math.min(100, Math.max(0, relationshipManagement));

  const overallScore = (selfAwareness + selfManagement + socialAwareness + relationshipManagement) / 4;

  let feedback = 'Keep practicing your emotional intelligence skills!';
  if (selfAwareness >= 70) feedback = "Great self-awareness! You're expressing your emotions clearly.";
  else if (socialAwareness >= 70) feedback = "Strong empathy shown - you're acknowledging the other person's perspective.";

  return { selfAwareness, selfManagement, socialAwareness, relationshipManagement, overallScore, feedback };
}

function fallbackCharacterResponse(message: string, history: Message[]): string {
  const text = message.toLowerCase();
  let tone: 'defensive' | 'receptive' | 'neutral' = 'neutral';

  if (text.includes('you did') || text.includes("you didn't")) tone = 'defensive';
  else if (text.includes('i feel') || text.includes('i understand')) tone = 'receptive';

  const responses = {
    defensive: ["Wait, what? That's not how I see it.", "Are you implying something?"],
    receptive: ["Oh... I hadn't realized. I'm sorry.", "You're right, let me think about that."],
    neutral: ["Hmm, tell me more.", "I'm listening."],
  };

  return responses[tone][history.length % responses[tone].length];
}

function fallbackHint(scores: EQScore[]): string {
  const weakest = scores.reduce((min, s) => (s.score < min.score ? s : min));
  
  const hints: Record<string, string> = {
    selfAwareness: "💡 Try starting with 'I feel...' to express your emotions clearly.",
    selfManagement: "💡 Pause and soften your tone. Use curiosity instead of accusations.",
    socialAwareness: "💡 Acknowledge their perspective: 'I can see why you might feel that way...'",
    relationshipManagement: "💡 Propose a solution together: 'What if we tried...'",
  };

  return hints[weakest.dimension] || hints.selfAwareness;
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// API keys are stored securely on the server - NEVER exposed to client
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

// Round-robin key selection for load balancing
let currentKeyIndex = 0;
function getNextApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No API keys configured');
  }
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

function getModel() {
  const apiKey = getNextApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, scenario, conversationHistory, eqScores } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const model = getModel();

    switch (action) {
      case 'analyzeEQ': {
        const result = await analyzeEQ(model, message, scenario);
        return NextResponse.json(result);
      }
      case 'generateResponse': {
        const result = await generateCharacterResponse(model, message, scenario, conversationHistory);
        return NextResponse.json({ response: result });
      }
      case 'getHint': {
        const result = await getCoachHint(model, scenario, conversationHistory, eqScores);
        return NextResponse.json({ hint: result });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function analyzeEQ(model: any, message: string, scenario: any) {
  try {
    const prompt = `You are an expert emotional intelligence (EQ) analyst. Analyze the following message in the context of a difficult conversation scenario.

SCENARIO: ${scenario.title}
CONTEXT: ${scenario.context}
USER'S OBJECTIVE: ${scenario.userObjective}

USER'S MESSAGE TO ANALYZE:
"${message}"

Evaluate the message across these 4 EQ dimensions (score 0-100):

1. SELF-AWARENESS: Does the person identify and express their own emotions? Look for "I feel" statements, emotional vocabulary, self-reflection.

2. SELF-MANAGEMENT: Does the person stay calm and composed? Look for measured tone, absence of blame/accusations, thoughtful responses.

3. SOCIAL AWARENESS: Does the person show empathy and understanding? Look for acknowledgment of others' feelings, perspective-taking, active listening cues.

4. RELATIONSHIP MANAGEMENT: Does the person work toward resolution? Look for collaborative language, constructive suggestions, relationship-preserving approach.

Respond in this EXACT JSON format only (no markdown, no extra text):
{
  "selfAwareness": <number 0-100>,
  "selfManagement": <number 0-100>,
  "socialAwareness": <number 0-100>,
  "relationshipManagement": <number 0-100>,
  "feedback": "<one specific, encouraging sentence about what they did well or could improve>"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const overallScore = (parsed.selfAwareness + parsed.selfManagement + parsed.socialAwareness + parsed.relationshipManagement) / 4;
      
      return {
        selfAwareness: Math.min(100, Math.max(0, parsed.selfAwareness)),
        selfManagement: Math.min(100, Math.max(0, parsed.selfManagement)),
        socialAwareness: Math.min(100, Math.max(0, parsed.socialAwareness)),
        relationshipManagement: Math.min(100, Math.max(0, parsed.relationshipManagement)),
        overallScore,
        feedback: parsed.feedback || 'Keep practicing your emotional intelligence skills!',
      };
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('EQ Analysis error:', error);
    return fallbackEQAnalysis(message);
  }
}

async function generateCharacterResponse(model: any, message: string, scenario: any, history: any[]) {
  try {
    const conversationText = history
      .map((m: any) => `${m.isUser ? 'User' : scenario.characterName}: ${m.content}`)
      .join('\n');

    const prompt = `You are playing the role of ${scenario.characterName} in a realistic conversation scenario.

YOUR CHARACTER:
${scenario.characterPersona}

SCENARIO: ${scenario.title}
SITUATION: ${scenario.context}

CONVERSATION SO FAR:
${conversationText}

User: ${message}

INSTRUCTIONS:
- Respond AS ${scenario.characterName}, staying completely in character
- React realistically based on your persona and how the user just spoke to you
- If the user was empathetic and used "I feel" statements, be more receptive
- If the user was accusatory or aggressive, respond defensively but realistically
- Keep response to 1-3 sentences, natural and conversational
- Do NOT break character or mention you're an AI
- Do NOT give advice - just respond as the character would

${scenario.characterName}:`;

    const result = await model.generateContent(prompt);
    let response = result.response.text().trim();
    response = response.replace(new RegExp(`^${scenario.characterName}:\\s*`, 'i'), '');
    
    if (response.length > 500) {
      response = response.substring(0, 500).trim() + '...';
    }
    
    return response || fallbackCharacterResponse(message, history);
  } catch (error) {
    console.error('Character response error:', error);
    return fallbackCharacterResponse(message, history);
  }
}

async function getCoachHint(model: any, scenario: any, history: any[], scores: any[]) {
  try {
    const weakestDimension = scores.reduce((min, s) => (s.score < min.score ? s : min));
    const recentConversation = history
      .slice(-4)
      .map((m: any) => `${m.isUser ? 'User' : scenario.characterName}: ${m.content}`)
      .join('\n');

    const prompt = `You are an EQ coach helping someone practice a difficult conversation.

SCENARIO: ${scenario.title}
USER'S GOAL: ${scenario.userObjective}

RECENT CONVERSATION:
${recentConversation}

The user's weakest EQ dimension is: ${weakestDimension.dimension} (score: ${weakestDimension.score}/100)

Give ONE specific, actionable tip for their next message. The tip should:
- Be 1-2 sentences max
- Include an example phrase they could use
- Focus on improving their ${weakestDimension.dimension}
- Start with "💡"

Tip:`;

    const result = await model.generateContent(prompt);
    let hint = result.response.text().trim();
    
    if (!hint.startsWith('💡')) {
      hint = '💡 ' + hint;
    }
    
    return hint || fallbackHint(scores);
  } catch (error) {
    console.error('Coach hint error:', error);
    return fallbackHint(scores);
  }
}

// Fallback functions when API fails
function fallbackEQAnalysis(message: string) {
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
  if (text.includes('that must be') || text.includes('sounds like')) socialAwareness += 20;

  if (text.includes("let's") || text.includes('we could') || text.includes('together')) relationshipManagement += 25;
  if (text.includes('how about') || text.includes('what if') || text.includes('would it help')) relationshipManagement += 15;

  selfAwareness = Math.min(100, Math.max(0, selfAwareness));
  selfManagement = Math.min(100, Math.max(0, selfManagement));
  socialAwareness = Math.min(100, Math.max(0, socialAwareness));
  relationshipManagement = Math.min(100, Math.max(0, relationshipManagement));

  const overallScore = (selfAwareness + selfManagement + socialAwareness + relationshipManagement) / 4;

  let feedback = 'Keep practicing your emotional intelligence skills!';
  if (selfAwareness >= 70) feedback = "Great self-awareness! You're expressing your emotions clearly.";
  else if (socialAwareness >= 70) feedback = "Strong empathy shown - you're acknowledging the other person's perspective.";
  else if (selfAwareness < 50) feedback = "Try using 'I feel' statements to express your emotions more clearly.";
  else if (socialAwareness < 50) feedback = 'Try acknowledging how the other person might be feeling.';

  return { selfAwareness, selfManagement, socialAwareness, relationshipManagement, overallScore, feedback };
}

function fallbackCharacterResponse(message: string, history: any[]) {
  const text = message.toLowerCase();
  let tone: 'defensive' | 'receptive' | 'neutral' = 'neutral';

  if (text.includes('you did') || text.includes("you didn't") || text.includes('you took')) {
    tone = 'defensive';
  } else if (text.includes('i feel') || text.includes('i understand') || text.includes('appreciate')) {
    tone = 'receptive';
  }

  const responses = {
    defensive: [
      "Wait, what? I thought we did great together. What are you saying?",
      "Are you implying I did something wrong? That's not how I see it.",
      "This feels a bit unfair. I worked really hard on this too.",
    ],
    receptive: [
      "Oh... I hadn't realized that's how it came across. I'm sorry.",
      "You're right, I should have been more explicit. What can I do to make this right?",
      "I appreciate you telling me. Let me think about how to fix this.",
    ],
    neutral: [
      "Hmm, tell me more about what you're thinking.",
      "I'm listening. What specifically bothered you?",
      "That's interesting. How do you think we should handle this?",
    ],
  };

  return responses[tone][history.length % responses[tone].length];
}

function fallbackHint(scores: any[]) {
  const weakest = scores.reduce((min, s) => (s.score < min.score ? s : min));
  
  const hints: Record<string, string[]> = {
    selfAwareness: [
      "💡 Try starting with 'I feel...' to express your emotions clearly.",
      "💡 Name your emotion: 'I notice I'm feeling frustrated because...'",
    ],
    selfManagement: [
      "💡 Pause and soften your tone. Use curiosity instead of accusations.",
      "💡 Replace 'You always...' with 'I've noticed...' for a calmer approach.",
    ],
    socialAwareness: [
      "💡 Acknowledge their perspective: 'I can see why you might feel that way...'",
      "💡 Ask about their experience: 'How did that situation feel for you?'",
    ],
    relationshipManagement: [
      "💡 Propose a solution together: 'What if we tried...' or 'How about we...'",
      "💡 Find common ground: 'We both want this to work out. Let's figure this out together.'",
    ],
  };

  const options = hints[weakest.dimension] || hints.selfAwareness;
  return options[Math.floor(Math.random() * options.length)];
}


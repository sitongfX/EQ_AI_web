import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

// API keys are stored securely on the server - NEVER exposed to client
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

const GROQ_API_KEYS = [
  process.env.GROQ_KEY_1,
  process.env.GROQ_KEY_2,
].filter(Boolean) as string[];

// Log Groq keys availability (without exposing keys)
if (typeof process !== 'undefined') {
  console.log(`Groq API keys configured: ${GROQ_API_KEYS.length} keys available`);
  console.log(`Gemini API keys configured: ${GEMINI_API_KEYS.length} keys available`);
}

// Track which key to use next
let currentGeminiKeyIndex = 0;
let currentGroqKeyIndex = 0;

// Unified model interface for both Gemini and Groq
interface UnifiedModel {
  type: 'gemini' | 'groq';
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>;
}

// Get Gemini model with specific key index
function getGeminiModelWithKey(keyIndex: number): GenerativeModel {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  const key = GEMINI_API_KEYS[keyIndex % GEMINI_API_KEYS.length];
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
}

// Get Groq model with specific key index
function getGroqModelWithKey(keyIndex: number): UnifiedModel {
  if (GROQ_API_KEYS.length === 0) {
    throw new Error('No Groq API keys configured');
  }
  const key = GROQ_API_KEYS[keyIndex % GROQ_API_KEYS.length];
  const groq = new Groq({ apiKey: key });
  
  return {
    type: 'groq',
    generateContent: async (prompt: string) => {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });
      return {
        response: {
          text: () => completion.choices[0]?.message?.content || '',
        },
      };
    },
  };
}

// Adapter to convert Gemini model to unified interface
function geminiToUnified(model: GenerativeModel): UnifiedModel {
  return {
    type: 'gemini',
    generateContent: async (prompt: string) => {
      const result = await model.generateContent(prompt);
      return result;
    },
  };
}

// Helper function to check if error is a 429 rate limit error
function isRateLimitError(error: any): boolean {
  return error?.status === 429 ||
         error?.statusText === 'Too Many Requests' ||
         error?.errorDetails?.some((d: any) => d['@type']?.includes('QuotaFailure')) ||
         error?.message?.includes('429') ||
         error?.message?.includes('quota') ||
         error?.message?.includes('rate limit');
}

// Call API with automatic retry on rate limit (429), fallback to Groq
async function callWithRetry<T>(
  fn: (model: UnifiedModel) => Promise<T>,
  maxRetries: number = GEMINI_API_KEYS.length
): Promise<T> {
  let lastError: any;
  
  // Try Gemini keys first
  let geminiAttempts = 0;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const keyIndex = (currentGeminiKeyIndex + attempt) % GEMINI_API_KEYS.length;
      geminiAttempts++;
      console.log(`Attempting Gemini API call ${geminiAttempts}/${maxRetries} with key index ${keyIndex}`);
      const geminiModel = getGeminiModelWithKey(keyIndex);
      const unifiedModel = geminiToUnified(geminiModel);
      const result = await fn(unifiedModel);
      // Success - update index to use next key for load balancing
      currentGeminiKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
      console.log(`Gemini API call succeeded with key index ${keyIndex}`);
      return result;
    } catch (error: any) {
      lastError = error;
      // Check multiple possible error status locations
      const errorStatus = error?.status || error?.response?.status || error?.statusCode || 
                         (error?.errorDetails?.[0]?.['@type']?.includes('QuotaFailure') ? 429 : null) ||
                         'unknown';
      
      console.log(`Gemini API call failed with key ${(currentGeminiKeyIndex + attempt) % GEMINI_API_KEYS.length}`);
      console.log(`Error details: status=${errorStatus}, message=${error?.message || 'N/A'}`);
      
      // Check if it's a 429 rate limit error
      const isRateLimit = isRateLimitError(error);
      
      if (isRateLimit) {
        console.log(`Rate limited (429), trying next Gemini key... (attempt ${attempt + 1}/${maxRetries})`);
        // Continue to next Gemini key
        if (attempt < maxRetries - 1) {
          continue;
        }
        // If this was the last Gemini key, fall through to Groq
        console.log(`All ${maxRetries} Gemini keys returned 429, will try Groq fallback`);
      } else {
        // For other errors, don't retry with Gemini, try Groq immediately
        console.log(`Non-429 error (${errorStatus}), will try Groq fallback`);
        break;
      }
    }
  }
  
  // All Gemini keys exhausted, try Groq fallback
  console.log(`=== Checking Groq fallback: ${GROQ_API_KEYS.length} Groq keys available ===`);
  if (GROQ_API_KEYS.length === 0) {
    console.error('⚠️  No Groq API keys configured! Groq fallback will not work.');
    console.error('Please set GROQ_KEY_1 and GROQ_KEY_2 environment variables.');
  } else {
    console.log('✅ Groq keys found, attempting fallback...');
    for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
      try {
        const keyIndex = (currentGroqKeyIndex + attempt) % GROQ_API_KEYS.length;
        console.log(`🔄 Attempting Groq API call ${attempt + 1}/${GROQ_API_KEYS.length} with key index ${keyIndex}`);
        const groqModel = getGroqModelWithKey(keyIndex);
        const result = await fn(groqModel);
        // Success - update index to use next key for load balancing
        currentGroqKeyIndex = (keyIndex + 1) % GROQ_API_KEYS.length;
        console.log('✅ Groq fallback succeeded!');
        return result;
      } catch (error: any) {
        lastError = error;
        const errorStatus = error?.status || error?.response?.status || 'unknown';
        console.log(`❌ Groq API call failed with key ${(currentGroqKeyIndex + attempt) % GROQ_API_KEYS.length}, status: ${errorStatus}`);
        console.log(`Error message: ${error?.message || 'N/A'}`);
        
        // Only retry on rate limit (429) errors
        if (errorStatus === 429) {
          console.log(`⚠️  Groq rate limited, trying next key...`);
          continue;
        }
        // For other errors, don't retry
        console.log(`⚠️  Non-429 error from Groq, stopping retries`);
        break;
      }
    }
  }
  
  // All keys exhausted
  throw lastError || new Error('All API keys exhausted');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, scenario, conversationHistory, eqScores, currentEQScores } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      // Combined endpoint - single API call for both EQ analysis AND character response
      case 'analyzeAndRespond': {
        const result = await callWithRetry(async (model) => {
          return await analyzeAndRespond(model, message, scenario, conversationHistory);
        });
        return NextResponse.json(result);
      }
      case 'analyzeEQ': {
        const result = await callWithRetry(async (model) => {
          return await analyzeEQ(model, message, scenario);
        });
        return NextResponse.json(result);
      }
      case 'generateResponse': {
        const result = await callWithRetry(async (model) => {
          return await generateCharacterResponse(model, message, scenario, conversationHistory);
        });
        return NextResponse.json({ response: result });
      }
      case 'getHint': {
        const result = await callWithRetry(async (model) => {
          return await getCoachHint(model, scenario, conversationHistory, eqScores);
        });
        return NextResponse.json({ hint: result });
      }
      case 'getImprovements': {
        const result = await callWithRetry(async (model) => {
          return await getImprovementSuggestions(model, scenario, currentEQScores || eqScores, conversationHistory);
        });
        return NextResponse.json({ suggestions: result });
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

// COMBINED: Single API call for EQ analysis + character response (cuts API usage in half)
async function analyzeAndRespond(model: UnifiedModel, message: string, scenario: any, history: any[]) {
  try {
    const conversationText = history
      .map((m: any) => `${m.isUser ? 'User' : scenario.characterName}: ${m.content}`)
      .join('\n');

    const prompt = `You are an expert at TWO things:
1. Analyzing emotional intelligence in conversations
2. Role-playing as a character in a scenario

SCENARIO: ${scenario.title}
CONTEXT: ${scenario.context}
USER'S OBJECTIVE: ${scenario.userObjective}

CHARACTER YOU WILL PLAY: ${scenario.characterName}
CHARACTER PERSONA: ${scenario.characterPersona}

CONVERSATION SO FAR:
${conversationText}

USER'S NEW MESSAGE: "${message}"

Provide TWO things in your response:

PART 1 - EQ ANALYSIS: Evaluate the user's message across these 4 dimensions (0-100):
- selfAwareness: Does person identify/express their emotions? ("I feel" statements, emotional vocabulary)
- selfManagement: Does person stay calm/composed? (measured tone, no blame/accusations)
- socialAwareness: Does person show empathy? (acknowledging others' feelings, perspective-taking)
- relationshipManagement: Does person work toward resolution? (collaborative language, constructive suggestions)

PART 2 - CHARACTER RESPONSE: Respond AS ${scenario.characterName}, staying completely in character:
- React realistically based on how the user just spoke
- If empathetic, be more receptive. If accusatory, respond defensively but realistically
- Keep to 1-3 sentences, natural and conversational
- Do NOT break character or give advice

Respond in this EXACT JSON format only (no markdown, no extra text):
{
  "eqAnalysis": {
    "selfAwareness": <number 0-100>,
    "selfManagement": <number 0-100>,
    "socialAwareness": <number 0-100>,
    "relationshipManagement": <number 0-100>,
    "feedback": "<one encouraging sentence about what they did well or could improve>"
  },
  "characterResponse": "<${scenario.characterName}'s response, 1-3 sentences>"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const eq = parsed.eqAnalysis;
      const overallScore = (eq.selfAwareness + eq.selfManagement + eq.socialAwareness + eq.relationshipManagement) / 4;
      
      return {
        eqAnalysis: {
          selfAwareness: Math.min(100, Math.max(0, eq.selfAwareness)),
          selfManagement: Math.min(100, Math.max(0, eq.selfManagement)),
          socialAwareness: Math.min(100, Math.max(0, eq.socialAwareness)),
          relationshipManagement: Math.min(100, Math.max(0, eq.relationshipManagement)),
          overallScore,
          feedback: eq.feedback || 'Keep practicing your emotional intelligence skills!',
        },
        characterResponse: parsed.characterResponse || fallbackCharacterResponse(message, history),
      };
    }
    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Combined analysis error:', error);
    // Re-throw 429 errors so callWithRetry can handle them and trigger Groq fallback
    if (isRateLimitError(error)) {
      throw error;
    }
    return {
      eqAnalysis: fallbackEQAnalysis(message),
      characterResponse: fallbackCharacterResponse(message, history),
    };
  }
}

async function analyzeEQ(model: UnifiedModel, message: string, scenario: any) {
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
  } catch (error: any) {
    console.error('EQ Analysis error:', error);
    // Re-throw 429 errors so callWithRetry can handle them and trigger Groq fallback
    if (isRateLimitError(error)) {
      throw error;
    }
    return fallbackEQAnalysis(message);
  }
}

async function generateCharacterResponse(model: UnifiedModel, message: string, scenario: any, history: any[]) {
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
  } catch (error: any) {
    console.error('Character response error:', error);
    // Re-throw 429 errors so callWithRetry can handle them and trigger Groq fallback
    if (isRateLimitError(error)) {
      throw error;
    }
    return fallbackCharacterResponse(message, history);
  }
}

async function getCoachHint(model: UnifiedModel, scenario: any, history: any[], scores: any[]) {
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
  } catch (error: any) {
    console.error('Coach hint error:', error);
    // Re-throw 429 errors so callWithRetry can handle them and trigger Groq fallback
    if (isRateLimitError(error)) {
      throw error;
    }
    return fallbackHint(scores);
  }
}

async function getImprovementSuggestions(model: UnifiedModel, scenario: any, scores: any[], history: any[]) {
  try {
    const weakestDimension = scores.reduce((min, s) => (s.score < min.score ? s : min));
    const conversationSummary = history
      .slice(-6)
      .map((m: any) => `${m.isUser ? 'User' : scenario.characterName}: ${m.content}`)
      .join('\n');

    const dimensionNames: Record<string, string> = {
      selfAwareness: 'Self-Awareness',
      selfManagement: 'Self-Management',
      socialAwareness: 'Social Awareness',
      relationshipManagement: 'Relationship Management',
    };

    const prompt = `You are an EQ coach providing personalized improvement suggestions after a practice conversation.

SCENARIO: ${scenario.title}
USER'S GOAL: ${scenario.userObjective}

CONVERSATION SUMMARY:
${conversationSummary}

FINAL EQ SCORES:
${scores.map(s => `- ${dimensionNames[s.dimension] || s.dimension}: ${Math.round(s.score)}/100`).join('\n')}

The user's weakest area is: ${dimensionNames[weakestDimension.dimension] || weakestDimension.dimension} (${Math.round(weakestDimension.score)}/100)

Provide 3 specific, actionable improvement suggestions. Each suggestion should:
- Be 1-2 sentences
- Be practical and immediately applicable
- Focus on improving ${dimensionNames[weakestDimension.dimension] || weakestDimension.dimension}
- Include concrete examples or phrases they can use
- Be encouraging and supportive

Respond in this EXACT JSON format only (no markdown, no extra text):
{
  "suggestions": [
    "<first suggestion>",
    "<second suggestion>",
    "<third suggestion>"
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return parsed.suggestions.slice(0, 3);
      }
    }
    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Improvement suggestions error:', error);
    // Re-throw 429 errors so callWithRetry can handle them and trigger Groq fallback
    if (isRateLimitError(error)) {
      throw error;
    }
    return getFallbackImprovements(scores);
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

function getFallbackImprovements(scores: any[]): string[] {
  const weakest = scores.reduce((min, s) => (s.score < min.score ? s : min));
  
  const improvements: Record<string, string[]> = {
    selfAwareness: [
      "Practice identifying your emotions in real-time. Try saying 'I notice I'm feeling...' before responding in conversations.",
      "Keep an emotion journal. Write down how you felt during difficult conversations and what triggered those feelings.",
      "Use 'I feel' statements more often. Instead of 'You made me angry,' try 'I feel frustrated when...'"
    ],
    selfManagement: [
      "Take a pause before responding. Count to three and take a deep breath when you feel triggered.",
      "Practice reframing negative thoughts. Instead of 'This is terrible,' try 'This is challenging, but I can handle it.'",
      "Use curiosity instead of accusations. Replace 'You always...' with 'I've noticed... Can you help me understand?'"
    ],
    socialAwareness: [
      "Practice active listening. Paraphrase what the other person said: 'So what I'm hearing is...'",
      "Ask about their experience: 'How did that situation feel for you?' or 'What was that like from your perspective?'",
      "Acknowledge their emotions explicitly: 'I can see why you might feel that way' or 'That must have been difficult.'"
    ],
    relationshipManagement: [
      "Use collaborative language: 'Let's figure this out together' or 'What if we tried...'",
      "Find common ground first: 'We both want this to work out. How can we make that happen?'",
      "Propose solutions together: 'How about we...' or 'Would it help if we...'"
    ],
  };

  return improvements[weakest.dimension] || improvements.selfAwareness;
}

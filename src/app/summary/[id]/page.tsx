'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Home, RefreshCw, Trophy, Target, Brain, TrendingUp, Star, 
  Share2, Check, X, Zap, User, Bot, Sparkles, Lightbulb
} from 'lucide-react';
import { scenarios } from '@/data/scenarios';
import { useConversationStore, parseObjectives } from '@/store/conversation';
import { useHistoryStore } from '@/store/history';
import { EQRadar } from '@/components/EQRadar';
import { Button } from '@/components/Button';
import { eqDimensions } from '@/data/eq-dimensions';
import { Message } from '@/lib/ai-client';

// Share Modal Component
function ShareModal({ isOpen, onClose, shareData }: { isOpen: boolean; onClose: () => void; shareData: any }) {
  const [copied, setCopied] = useState(false);

  const shareText = `🧠 NiceAI Session Complete!\n\n📊 Results:\n• Average EQ Score: ${shareData.avgScore}\n• Goals Completed: ${shareData.completedCount}/${shareData.totalTasks}\n• Messages: ${shareData.messageCount}\n\n🎯 Scenario: ${shareData.scenarioTitle}\n\nPractice your emotional intelligence at: https://niceai.chat/`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NiceAI Session Results',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Share Your Results</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">{shareText}</pre>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCopy} fullWidth icon={copied ? <Check className="w-4 h-4" /> : undefined}>
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          <Button onClick={handleShare} fullWidth icon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// High Impact Moment Component
function HighImpactMoment({ message, scenario }: { message: Message; scenario: any }) {
  if (!message.eqAnalysis) return null;
  
  const analysis = message.eqAnalysis;
  const highestDimension = Object.entries({
    selfAwareness: analysis.selfAwareness,
    selfManagement: analysis.selfManagement,
    socialAwareness: analysis.socialAwareness,
    relationshipManagement: analysis.relationshipManagement,
  }).reduce((max, [key, value]) => value > max[1] ? [key, value] : max, ['', 0]);

  const dimensionInfo = eqDimensions[highestDimension[0]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">⭐ High Impact Moment</h3>
          <p className="text-xs text-amber-600">Your best EQ response in this session</p>
        </div>
      </div>

      <div className="bg-white/70 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">You said:</p>
            <p className="text-slate-800 font-medium">&ldquo;{message.content}&rdquo;</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Score</span>
            <span className="text-2xl font-bold gradient-text">{Math.round(analysis.overallScore)}</span>
          </div>
          <div className="flex gap-1">
            {Object.entries({
              selfAwareness: analysis.selfAwareness,
              selfManagement: analysis.selfManagement,
              socialAwareness: analysis.socialAwareness,
              relationshipManagement: analysis.relationshipManagement,
            }).map(([dim, score]) => (
              <div
                key={dim}
                className="flex-1 h-2 rounded-full"
                style={{ backgroundColor: `${eqDimensions[dim].color}40` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${score}%`,
                    backgroundColor: eqDimensions[dim].color 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/50 border border-amber-200/50">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
          <span>{analysis.feedback}</span>
        </p>
      </div>
    </motion.div>
  );
}

// Further Improvement Component
function FurtherImprovement({ scenario, scores, messages }: { scenario: any; scores: any[]; messages: Message[] }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getImprovements',
            scenario,
            currentEQScores: scores,
            conversationHistory: messages,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        } else {
          throw new Error('Failed to fetch suggestions');
        }
      } catch (error) {
        console.error('Error fetching improvement suggestions:', error);
        // Fallback to static suggestions
        const weakest = scores.reduce((min, s) => (s.score < min.score ? s : min));
        setSuggestions(getFallbackSuggestions(weakest.dimension));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [scenario, scores, messages]);

  const weakest = scores.reduce((min, s) => (s.score < min.score ? s : min));
  const dimensionInfo = eqDimensions[weakest.dimension];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Further Improvement</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Further Improvement</h3>
          <p className="text-xs text-slate-500">Focus area: {dimensionInfo.name}</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: dimensionInfo.color }}
          />
          <span className="text-sm font-semibold text-slate-700">
            {dimensionInfo.name} Score: {Math.round(weakest.score)}/100
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function getFallbackSuggestions(dimension: string): string[] {
  const suggestions: Record<string, string[]> = {
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

  return suggestions[dimension] || suggestions.selfAwareness;
}

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showShare, setShowShare] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { session, currentEQScores, completedTasks, messages, resetSession } = useConversationStore();

  // Track client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { addSession } = useHistoryStore();

  const scenario = scenarios.find(s => s.id === id);

  useEffect(() => {
    if (!session && scenario) {
      router.push(`/conversation/${id}`);
    }
  }, [session, scenario, id, router]);

  // Save session to history once
  useEffect(() => {
    if (session && scenario && !historySaved) {
      const tasks = parseObjectives(scenario.userObjective);
      const completedCount = tasks.filter(t => completedTasks.has(t)).length;
      const avgScore = currentEQScores.length > 0 
        ? currentEQScores.reduce((sum, s) => sum + s.score, 0) / currentEQScores.length
        : 50;
      
      addSession({
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        date: new Date().toISOString(),
        averageScore: Math.round(avgScore),
        goalsCompleted: completedCount,
        totalGoals: tasks.length,
        scores: {
          selfAwareness: currentEQScores.find(s => s.dimension === 'selfAwareness')?.score || 50,
          selfManagement: currentEQScores.find(s => s.dimension === 'selfManagement')?.score || 50,
          socialAwareness: currentEQScores.find(s => s.dimension === 'socialAwareness')?.score || 50,
          relationshipManagement: currentEQScores.find(s => s.dimension === 'relationshipManagement')?.score || 50,
        },
      });
      setHistorySaved(true);
    }
  }, [session, scenario, currentEQScores, completedTasks, addSession, historySaved]);

  if (!scenario || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl animated-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500">Loading summary...</p>
        </div>
      </div>
    );
  }

  const tasks = parseObjectives(scenario.userObjective);
  const completedCount = tasks.filter(t => completedTasks.has(t)).length;
  // Ensure safe calculation to avoid hydration mismatch
  const avgScore = currentEQScores.length > 0 
    ? currentEQScores.reduce((sum, s) => sum + s.score, 0) / currentEQScores.length
    : 50; // Default fallback to match initial EQ scores
  const userMessages = messages.filter(m => m.isUser);
  
  // Find highest impact moment (user message with highest overall score)
  const highImpactMessage = userMessages
    .filter(m => m.eqAnalysis)
    .sort((a, b) => (b.eqAnalysis?.overallScore || 0) - (a.eqAnalysis?.overallScore || 0))[0];

  const handleRetry = () => {
    resetSession();
    router.push(`/conversation/${id}`);
  };

  const handleHome = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    resetSession();
    // Use direct navigation for reliability
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  const shareData = {
    avgScore: Math.round(avgScore),
    completedCount,
    totalTasks: tasks.length,
    messageCount: userMessages.length,
    scenarioTitle: scenario.title,
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleHome}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
            <h1 className="font-bold text-slate-900">Session Complete</h1>
            <button
              onClick={() => setShowShare(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors group"
              title="Share Results"
            >
              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-border"
        >
          <div className="bg-white rounded-[22px] p-6 sm:p-8 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl animated-gradient flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-primary/30">
              <Trophy className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Great Practice Session!</h2>
            <p className="text-slate-600 mb-6">{scenario.title} with {scenario.characterName}</p>

            <div className="flex justify-center gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {isMounted && currentEQScores.length > 0 ? Math.round(avgScore) : '50'}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Avg EQ Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">
                  {isMounted ? `${completedCount}/${tasks.length}` : '-'}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Goals Met</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500">
                  {isMounted ? userMessages.length : '-'}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">Messages</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* High Impact Moment */}
        {highImpactMessage && (
          <HighImpactMoment message={highImpactMessage} scenario={scenario} />
        )}

        {/* EQ Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your EQ Performance</h3>
          </div>
          
          <div className="flex justify-center">
            <div className="hidden sm:block">
              <EQRadar scores={currentEQScores} size={250} />
            </div>
            <div className="sm:hidden">
              <EQRadar scores={currentEQScores} size={180} />
            </div>
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Goals Progress</h3>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => {
              const isCompleted = completedTasks.has(task);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isCompleted ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    {isCompleted ? (
                      <Star className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {task}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Further Improvement */}
        <FurtherImprovement scenario={scenario} scores={currentEQScores} messages={messages} />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Button variant="outline" onClick={handleRetry} fullWidth icon={<RefreshCw className="w-4 h-4" />}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => setShowShare(true)} fullWidth icon={<Share2 className="w-4 h-4" />}>
            Share Report
          </Button>
          <Button onClick={handleHome} fullWidth icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </motion.div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} shareData={shareData} />}
      </AnimatePresence>
    </div>
  );
}

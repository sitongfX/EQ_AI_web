'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, RefreshCw, Trophy, Target, Brain, TrendingUp, Star, Share2, Check, X } from 'lucide-react';
import { scenarios } from '@/data/scenarios';
import { useConversationStore, parseObjectives } from '@/store/conversation';
import { EQRadar } from '@/components/EQRadar';
import { Button } from '@/components/Button';

// Share Modal Component
function ShareModal({ isOpen, onClose, shareData }: { isOpen: boolean; onClose: () => void; shareData: any }) {
  const [copied, setCopied] = useState(false);

  const shareText = `🧠 EQ Coach Session Complete!\n\n📊 Results:\n• Average EQ Score: ${shareData.avgScore}\n• Goals Completed: ${shareData.completedCount}/${shareData.totalTasks}\n• Messages: ${shareData.messageCount}\n\n🎯 Scenario: ${shareData.scenarioTitle}\n\nPractice your emotional intelligence at: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EQ Coach Session Results',
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

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showShare, setShowShare] = useState(false);

  const { session, currentEQScores, completedTasks, resetSession } = useConversationStore();

  const scenario = scenarios.find(s => s.id === id);

  useEffect(() => {
    if (!session && scenario) {
      router.push(`/conversation/${id}`);
    }
  }, [session, scenario, id, router]);

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
  const avgScore = currentEQScores.reduce((sum, s) => sum + s.score, 0) / currentEQScores.length;
  const userMessages = session.messages.filter(m => m.isUser);

  const handleRetry = () => {
    resetSession();
    router.push(`/conversation/${id}`);
  };

  const handleHome = () => {
    resetSession();
    router.push('/scenarios');
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-border"
        >
          <div className="bg-white rounded-[22px] p-8 text-center">
            <div className="w-20 h-20 rounded-2xl animated-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Great Practice Session!</h2>
            <p className="text-slate-600 mb-6">{scenario.title} with {scenario.characterName}</p>

            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">{Math.round(avgScore)}</div>
                <div className="text-sm text-slate-500">Avg EQ Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500">{completedCount}/{tasks.length}</div>
                <div className="text-sm text-slate-500">Goals Met</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{userMessages.length}</div>
                <div className="text-sm text-slate-500">Messages</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* EQ Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your EQ Performance</h3>
          </div>
          
          <div className="flex justify-center">
            <EQRadar scores={currentEQScores} size={250} />
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
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

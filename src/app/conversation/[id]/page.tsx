'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageCircle, Lightbulb, CheckCircle, Clock, Send,
  Info, Target, User, Bot, Sparkles, Brain,
} from 'lucide-react';
import { scenarios } from '@/data/scenarios';
import { eqDimensions, difficultyInfo } from '@/data/eq-dimensions';
import { useConversationStore, parseObjectives } from '@/store/conversation';
import { CompactEQRadar } from '@/components/EQRadar';
import { Button } from '@/components/Button';
import { Message } from '@/lib/ai-client';

// Message Bubble Component
function MessageBubble({ message, showAnalysis = true }: { message: Message; showAnalysis?: boolean }) {
  const isUser = message.isUser;
  const isCoach = message.isCoachIntervention;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`
          flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          ${isCoach ? 'bg-gradient-to-br from-amber-100 to-orange-100' : isUser ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-gradient-to-br from-slate-100 to-slate-200'}
        `}
      >
        {isCoach ? (
          <Lightbulb className="w-4 h-4 text-amber-600" />
        ) : isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-slate-600" />
        )}
      </div>

      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {isCoach && (
          <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            EQ Coach Hint
          </span>
        )}

        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isCoach ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200' : isUser ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-md' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'}
          `}
        >
          {message.content}
        </div>

        {showAnalysis && isUser && message.eqAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-1"
          >
            <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                {Object.entries({
                  selfAwareness: message.eqAnalysis.selfAwareness,
                  selfManagement: message.eqAnalysis.selfManagement,
                  socialAwareness: message.eqAnalysis.socialAwareness,
                  relationshipManagement: message.eqAnalysis.relationshipManagement,
                }).map(([dimension, score]) => {
                  const dim = eqDimensions[dimension];
                  return (
                    <div
                      key={dimension}
                      className="flex items-center gap-1"
                      title={dim.name}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium"
                        style={{ backgroundColor: `${dim.color}20`, color: dim.color }}
                      >
                        {Math.round(score)}
                      </div>
                    </div>
                  );
                })}
                <span className="text-xs text-slate-400 ml-auto">
                  Avg: {Math.round(message.eqAnalysis.overallScore)}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{message.eqAnalysis.feedback}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <Bot className="w-4 h-4 text-slate-600" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white shadow-sm border border-slate-100">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-slate-300 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [showContext, setShowContext] = useState(true); // Show context by default

  const {
    scenario,
    messages,
    currentEQScores,
    completedTasks,
    isAIResponding,
    isSessionComplete,
    showHintPrompt,
    hasEQData,
    initSession,
    sendMessage,
    requestHint,
    confirmHintRequest,
    cancelHintRequest,
    completeSession,
  } = useConversationStore();

  // Initialize session on mount
  useEffect(() => {
    const foundScenario = scenarios.find(s => s.id === id);
    if (foundScenario) {
      initSession(foundScenario);
      // Scroll to top to show context card when entering page
      setTimeout(() => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.scrollTop = 0;
        }
      }, 50);
    }
  }, [id, initSession]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Navigate to summary when session is complete
  useEffect(() => {
    if (isSessionComplete && scenario) {
      router.push(`/summary/${scenario.id}`);
    }
  }, [isSessionComplete, scenario, router]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAIResponding) return;
    const message = inputValue;
    setInputValue('');
    // Don't auto-hide context on first message
    if (messages.filter(m => m.isUser).length >= 1) {
      setShowContext(false);
    }
    await sendMessage(message);
    inputRef.current?.focus();
  };

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl animated-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const tasks = parseObjectives(scenario.userObjective);
  const userMessageCount = messages.filter(m => m.isUser).length;
  const difficulty = difficultyInfo[scenario.difficulty];

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC] overflow-hidden">
      {/* Header - compact, sticky to keep radar visible */}
      <header className="sticky top-0 flex-shrink-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50" style={{ minHeight: '72px' }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5">
          {/* Grid layout: Back button | Title section | Radar */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center h-full">
            {/* Column 1: Back button */}
            <button
              onClick={() => router.push('/')}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors group flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>

            {/* Column 2: Title section */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <h1 className="font-semibold text-base text-slate-900 truncate">{scenario.title}</h1>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: `${difficulty.color}15`, color: difficulty.color }}
                >
                  {difficulty.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-slate-400" />
                <span>Conversation with {scenario.characterName}</span>
              </p>
            </div>

            {/* Column 3: Compact Radar (always visible, stays in header) */}
            <div className="flex-shrink-0 flex items-center justify-end">
              <CompactEQRadar scores={currentEQScores} hasData={hasEQData} size={90} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area - scrollable */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-4 sm:pt-3 sm:pb-6 space-y-4 sm:space-y-5">
          {/* Context Card - shown by default, top always visible at start */}
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="card p-5 sm:p-6"
                style={{ scrollMarginTop: '0px' }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">Situation</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{scenario.context}</p>
                  </div>
                </div>

                <hr className="border-slate-100 my-5" />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-violet-600 mb-3 uppercase tracking-wide">Your Goals</p>
                    <div className="space-y-2.5">
                      {tasks.map((task, index) => {
                        const isCompleted = completedTasks.has(task);
                        return (
                          <motion.div
                            key={index}
                            className="flex items-start gap-3"
                            animate={isCompleted ? { scale: [1, 1.02, 1] } : {}}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCompleted ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-100 border-2 border-slate-200'}`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-sm transition-all duration-300 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                            >
                              {task}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowContext(false)}
                  className="mt-1 mb-0 w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-0"
                >
                  Click to minimize context
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showContext && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowContext(true)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Info className="w-4 h-4" />
              Show scenario context
            </motion.button>
          )}

          {/* Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            {isAIResponding && <TypingIndicator />}
          </div>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area - anchored at bottom */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your response..."
                disabled={isAIResponding}
                rows={1}
                className="w-full px-5 py-3.5 bg-white rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none text-sm text-slate-700 placeholder:text-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
            </div>

            {/* Hint and Complete buttons */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={requestHint}
              disabled={isAIResponding}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-amber-200 text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50"
            >
              <Lightbulb className="w-5 h-5" />
            </motion.button>

            {userMessageCount >= 3 ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={completeSession}
                disabled={isAIResponding}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.button>
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-slate-200 text-slate-300 opacity-50">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || isAIResponding}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${inputValue.trim() && !isAIResponding ? 'animated-gradient text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={cancelHintRequest}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Need a Hint?</h3>
                <p className="text-slate-500 mb-6">
                  Your AI Coach will provide personalized guidance to help you navigate this conversation more effectively.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 mb-6">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Hints are tailored to your current conversation</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={cancelHintRequest} fullWidth>
                  Cancel
                </Button>
                <Button onClick={confirmHintRequest} fullWidth>
                  Get Hint
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

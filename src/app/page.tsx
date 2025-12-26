'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, History, Settings, Grid3X3, Briefcase, Heart, Star,
  TrendingUp, Lightbulb, Flame, Quote, ChevronRight, Clock, Target, X, Info,
} from 'lucide-react';
import { scenarios, Scenario } from '@/data/scenarios';
import { eqDimensions, categoryInfo, difficultyInfo } from '@/data/eq-dimensions';
import { useSettingsStore } from '@/store/settings';
import { useHistoryStore, SessionRecord } from '@/store/history';

const categoryIcons: Record<string, React.ElementType> = {
  Briefcase,
  Heart,
  Star,
};

// Scenario Card Component
function ScenarioCard({ scenario, onClick, index = 0 }: { scenario: Scenario; onClick: () => void; index?: number }) {
  const difficulty = difficultyInfo[scenario.difficulty];
  const category = categoryInfo[scenario.category];
  const IconComponent = categoryIcons[category.icon] || Briefcase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                {scenario.title}
              </h3>
              <p className="text-xs text-slate-500">{category.fullName}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{scenario.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {scenario.skillsFocused.slice(0, 3).map(skill => (
              <div
                key={skill}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: `${eqDimensions[skill].color}20` }}
                title={eqDimensions[skill].name}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: eqDimensions[skill].color }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span
              className="px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${difficulty.color}15`, color: difficulty.color }}
            >
              {difficulty.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scenario.estimatedDuration}m
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Practice with <span className="font-medium text-slate-600">{scenario.characterName}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Category Filter Component
function CategoryFilter({
  category,
  label,
  icon: Icon,
  isSelected,
  onClick,
}: {
  category: string | null;
  label: string;
  icon: React.ElementType;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm
        transition-all duration-200 flex-1 justify-center
        ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  );
}

// Session History Item
function SessionHistoryItem({ session }: { session: SessionRecord }) {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-slate-900 text-sm">{session.scenarioTitle}</h4>
          <p className="text-xs text-slate-500">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{session.averageScore}</p>
          <p className="text-xs text-slate-400">avg score</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{ width: `${session.averageScore}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">
          {session.goalsCompleted}/{session.totalGoals} goals
        </span>
      </div>
    </div>
  );
}

// History Modal
function HistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sessions, clearHistory } = useHistoryStore();
  
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
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Session History</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No sessions yet</p>
            <p className="text-sm text-slate-400 mt-2">Complete a practice session to see your history here.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {sessions.map((session) => (
                <SessionHistoryItem key={session.id} session={session} />
              ))}
            </div>
            <button
              onClick={clearHistory}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors text-center"
            >
              Clear History
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Settings Modal
function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showEQAnalysis, soundEffects, toggleShowEQAnalysis, toggleSoundEffects } = useSettingsStore();
  
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
          <h3 className="text-xl font-bold text-slate-900">Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Show EQ Analysis</p>
              <p className="text-sm text-slate-500">Display scores after each message</p>
            </div>
            <button 
              onClick={toggleShowEQAnalysis}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${showEQAnalysis ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <motion.div 
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: showEQAnalysis ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Sound Effects</p>
              <p className="text-sm text-slate-500">Play sounds for notifications</p>
            </div>
            <button 
              onClick={toggleSoundEffects}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${soundEffects ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <motion.div 
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: soundEffects ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center">Settings are saved automatically</p>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { totalSessions, currentStreak, getAverageScore } = useHistoryStore();
  const avgScore = getAverageScore();

  const filteredScenarios = useMemo(() => {
    if (!selectedCategory) return scenarios;
    return scenarios.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl animated-gradient flex items-center justify-center shadow-lg shadow-primary/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">
                  <span className="gradient-text">NiceAI</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide" aria-label="Tagline">YOUR PERSONAL EQ & SOCIAL SKILLS COACH</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <button 
                onClick={() => router.push('/learnmore')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary font-medium text-sm hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Learn More</span>
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors group" 
                title="History"
              >
                <History className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors group" 
                title="Settings"
              >
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8" role="main">
        {/* Welcome Card */}
        <section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="gradient-border">
            <div className="bg-white rounded-[22px] p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Welcome Back! <span className="wave">👋</span>
                      </h2>
                      <p className="text-sm text-slate-500">Ready to improve your EQ?</p>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Choose a scenario below and have a meaningful conversation with our AI character. You&apos;ll receive real-time feedback on your emotional intelligence.
                  </p>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="stat-card px-5 py-4 text-center">
                    <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">{totalSessions}</p>
                    <p className="text-xs text-slate-500">Sessions</p>
                  </div>
                  <div className="stat-card px-5 py-4 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">{currentStreak}</p>
                    <p className="text-xs text-slate-500">Day Streak</p>
                  </div>
                  <div className="stat-card px-5 py-4 text-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">{avgScore || '-'}</p>
                    <p className="text-xs text-slate-500">Avg Score</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-1">💡 Daily Tip</p>
                    <p className="text-sm text-amber-900/80">
                      Practice using &apos;I feel&apos; statements to express emotions. This builds self-awareness and helps others understand your perspective without feeling blamed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Scenarios Section */}
        <section
          aria-labelledby="scenarios-heading"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 id="scenarios-heading" className="text-2xl font-bold text-slate-900">Practice Scenarios</h2>
              <p className="text-slate-500 mt-1">Choose a situation to practice your emotional intelligence</p>
            </div>
            <span className="text-sm text-slate-400" aria-label="Number of scenarios">{filteredScenarios.length} scenarios</span>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            <CategoryFilter
              category={null}
              label="All"
              icon={Grid3X3}
              isSelected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            />
            <CategoryFilter
              category="workplace"
              label="Workplace"
              icon={Briefcase}
              isSelected={selectedCategory === 'workplace'}
              onClick={() => setSelectedCategory('workplace')}
            />
            <CategoryFilter
              category="personal"
              label="Personal"
              icon={Heart}
              isSelected={selectedCategory === 'personal'}
              onClick={() => setSelectedCategory('personal')}
            />
            <CategoryFilter
              category="advanced"
              label="Advanced"
              icon={Star}
              isSelected={selectedCategory === 'advanced'}
              onClick={() => setSelectedCategory('advanced')}
            />
          </div>
        </motion.section>

        {/* Scenario Grid */}
        <section>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredScenarios.map((scenario, index) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  index={index}
                  onClick={() => router.push(`/conversation/${scenario.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showHistory && <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />}
        {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}

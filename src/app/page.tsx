'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Play, ArrowRight, History, Settings,
  Grid3X3, Briefcase, Heart, Star, TrendingUp, Lightbulb,
  Flame, Quote, ChevronRight, Clock, Shield, Users, Zap,
  Target,
} from 'lucide-react';
import { scenarios, Scenario } from '@/data/scenarios';
import { eqDimensions, categoryInfo, difficultyInfo } from '@/data/eq-dimensions';
import { BannerAd, InFeedAd } from '@/components/AdPlaceholder';

const categoryIcons: Record<string, React.ElementType> = {
  Briefcase,
  Heart,
  Star,
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
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
        {/* Top gradient line on hover */}
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

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredScenarios = useMemo(() => {
    if (!selectedCategory) return scenarios;
    return scenarios.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
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
                  <span className="gradient-text">EQ</span>
                  <span className="text-slate-800"> Coach</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">AI-POWERED EQ TRAINING</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors group" title="History">
                <History className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors group" title="Settings">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 pb-32">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC]/80 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Practice real conversations with AI</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900">Master Your</span>
              <br />
              <span className="gradient-text">Emotional Intelligence</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto text-balance">
              Practice difficult conversations in a safe environment. Get real-time feedback on your emotional intelligence and communication skills.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => document.getElementById('scenarios')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl animated-gradient text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Start Practicing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold hover:bg-white hover:-translate-y-1 transition-all duration-300">
                <Brain className="w-5 h-5 text-primary" />
                Learn More
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 sm:gap-12">
              {[
                { value: '12', label: 'Scenarios', icon: Target },
                { value: '4', label: 'EQ Dimensions', icon: Brain },
                { value: '∞', label: 'Practice Sessions', icon: TrendingUp },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                  </div>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Welcome Card */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500">Sessions</p>
                  </div>
                  <div className="stat-card px-5 py-4 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500">Day Streak</p>
                  </div>
                  <div className="stat-card px-5 py-4 text-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">-</p>
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

        {/* Ad Banner */}
        <BannerAd className="!min-h-[100px]" />

        {/* Scenarios Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          id="scenarios"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Practice Scenarios</h2>
              <p className="text-slate-500 mt-1">Choose a situation to practice your emotional intelligence</p>
            </div>
            <span className="text-sm text-slate-400">{filteredScenarios.length} scenarios</span>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
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
                <div key={scenario.id}>
                  <ScenarioCard
                    scenario={scenario}
                    index={index}
                    onClick={() => router.push(`/conversation/${scenario.id}`)}
                  />
                  {(index + 1) % 4 === 0 && index < filteredScenarios.length - 1 && (
                    <div className="md:col-span-2">
                      <InFeedAd />
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Why EQ Matters Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8"
        >
          <div className="text-center mb-12">
            <span className="badge badge-primary mb-4">The Science</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why EQ Matters</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Emotional intelligence is the strongest predictor of performance and the foundation of critical skills.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'Self-Awareness', description: 'Recognize your emotions and understand how they affect your thoughts and behavior.', color: '#F59E0B', gradient: 'from-amber-500 to-orange-500' },
              { icon: Shield, title: 'Self-Management', description: 'Control impulsive feelings and adapt to changing circumstances effectively.', color: '#10B981', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Users, title: 'Social Awareness', description: 'Understand the emotions, needs, and concerns of other people around you.', color: '#EC4899', gradient: 'from-pink-500 to-rose-500' },
              { icon: Zap, title: 'Relationship Skills', description: 'Build strong relationships, communicate clearly, and manage conflict constructively.', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card p-6 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 10px 30px -10px ${item.color}50` }}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8"
        >
          <div className="text-center mb-12">
            <span className="badge badge-success mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple. Effective. Transformative.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose a Scenario', description: 'Pick from workplace, personal, or advanced situations that challenge your EQ.', icon: Target },
              { step: '02', title: 'Have a Conversation', description: 'Interact with an AI character in realistic role-play scenarios.', icon: Sparkles },
              { step: '03', title: 'Get Feedback', description: 'Receive instant analysis of your emotional intelligence across 4 dimensions.', icon: TrendingUp },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-200 to-transparent" />
                )}
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full animated-gradient flex items-center justify-center text-xs font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quote */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="gradient-border">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[22px] p-8 sm:p-12 text-center">
              <Quote className="w-12 h-12 text-primary/50 mx-auto mb-6" />
              <blockquote className="text-xl sm:text-2xl text-white font-medium mb-6 max-w-3xl mx-auto leading-relaxed">
                &ldquo;EQ is responsible for 58% of your job performance. It&apos;s the single biggest predictor of performance in the workplace and the strongest driver of leadership and personal excellence.&rdquo;
              </blockquote>
              <cite className="text-slate-400 not-italic">— Travis Bradberry, Author of Emotional Intelligence 2.0</cite>
            </div>
          </div>
        </motion.section>

        <BannerAd className="mt-8" />

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ready to Level Up Your EQ?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Start practicing difficult conversations today and become a better communicator.
          </p>
          <button
            onClick={() => document.getElementById('scenarios')?.scrollIntoView({ behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl animated-gradient text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-800">EQ Coach</span>
                <p className="text-xs text-slate-500">Powered by AI</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-500 hover:text-primary transition-colors">Support</a>
            </div>

            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} EQ Coach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


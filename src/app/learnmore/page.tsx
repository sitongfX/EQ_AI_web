'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, Play, ArrowRight,
  TrendingUp, Lightbulb, Quote, ChevronRight, Shield, Users, Zap,
  Target,
} from 'lucide-react';

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

export default function LearnMorePage() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFBFC] via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
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
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">YOUR PERSONAL EQ & SOCIAL SKILLS COACH</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors hidden sm:block"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('why-eq')}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors hidden sm:block"
              >
                Why EQ
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
              >
                Start Practicing
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 pb-32">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

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
                onClick={() => router.push('/')}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl animated-gradient text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Start Practicing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('why-eq')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold hover:bg-white hover:-translate-y-1 transition-all duration-300"
              >
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-24">
        {/* Why EQ Matters Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8"
          id="why-eq"
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
          id="how-it-works"
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
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl animated-gradient text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-800">NiceAI</span>
                <p className="text-xs text-slate-500">Powered by AI</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <a href="/about.html" className="text-slate-500 hover:text-primary transition-colors">About</a>
              <a href="/privacy-policy.html" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms-of-service.html" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</a>
              <a href="/support.html" className="text-slate-500 hover:text-primary transition-colors">Support</a>
            </div>

            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} NiceAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


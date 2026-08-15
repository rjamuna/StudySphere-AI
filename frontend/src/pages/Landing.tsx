import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Bot, FileText, Map, Brain, Zap, ArrowRight, Star, CheckCircle, Sun, Moon, Flame, BookOpen, Target } from 'lucide-react';

const FEATURES = [
  { icon: Bot, title: 'AI Tutor', desc: 'Ask anything, get instant expert explanations with examples and analogies', color: '#5B5FEF', gradient: 'linear-gradient(135deg, rgba(91,95,239,0.12), rgba(91,95,239,0.04))' },
  { icon: FileText, title: 'PDF Learning', desc: 'Upload any PDF — get summaries, flashcards & Q&A in seconds', color: '#7C3AED', gradient: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04))' },
  { icon: Map, title: 'AI Roadmap', desc: 'Personalized month-by-month learning paths for any goal or skill', color: '#06B6D4', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))' },
  { icon: Brain, title: 'Smart Quizzes', desc: 'AI-generated MCQ, True/False, and fill-in-the-blank quizzes', color: '#10B981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))' },
  { icon: Zap, title: 'Study Planner', desc: 'Daily tasks, Pomodoro timer, and smart scheduling', color: '#F59E0B', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))' },
  { icon: Star, title: 'Gamification', desc: 'XP, levels, streaks and badges to keep you motivated daily', color: '#EF4444', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))' },
];

const STATS = [
  { value: '50K+', label: 'Active Learners' },
  { value: '2M+', label: 'Questions Answered' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9★', label: 'Average Rating' },
];

const CHECKS = ['No credit card required', 'Free forever plan', 'Cancel anytime'];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4,0,0.2,1] } } };

export default function Landing() {
  const { dark, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Nav */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,95,239,0.35)' }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>StudySphere <span className="gradient-text">AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button className="btn-icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'clamp(4rem, 8vw, 7rem) 1.5rem clamp(3rem, 6vw, 5rem)', maxWidth: 860, margin: '0 auto', position: 'relative' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(91,95,239,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.4,0,0.2,1] }} style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(91,95,239,0.08)', border: '1px solid rgba(91,95,239,0.2)', borderRadius: 99, padding: '0.375rem 1rem', marginBottom: '1.75rem', fontSize: '0.8rem', color: '#5B5FEF', fontWeight: 600 }}>
            <Sparkles size={13} /> AI-Powered Learning Platform
          </motion.div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: 'var(--text)', letterSpacing: '-0.04em' }}>
            Your Personal<br />
            <span className="gradient-text">AI Learning Companion</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-2)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Stop juggling 10 different apps. StudySphere AI brings tutoring, PDF learning, roadmaps, quizzes, and planning into one beautiful platform.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              Start Learning Free <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {CHECKS.map(c => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                <CheckCircle size={14} color="var(--success)" /> {c}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 1.5rem 4rem', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }} className="gradient-text">{value}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 1.5rem 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Everything you need to <span className="gradient-text">learn faster</span>
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>Six powerful AI tools, one seamless experience.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc, color, gradient }) => (
            <motion.div key={title} variants={item} className="card card-hover card-glow"
              style={{ padding: '1.5rem', cursor: 'default', background: gradient }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 1.5rem 6rem', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card" style={{ padding: 'clamp(2rem, 5vw, 3.5rem)', background: 'linear-gradient(135deg, rgba(91,95,239,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(91,95,239,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(91,95,239,0.15), transparent)', pointerEvents: 'none' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(91,95,239,0.4)' }}>
            <Sparkles size={26} color="white" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Ready to transform your learning?</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>Join thousands of students already using StudySphere AI to study smarter.</p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
            Get Started Free <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={12} color="white" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>StudySphere AI</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>© 2025 StudySphere AI. Built with ❤️ for learners.</p>
      </footer>
    </div>
  );
}

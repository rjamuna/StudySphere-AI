import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ProgressBar, ProgressRing } from '../components/ui';
import { Award, Lock, Zap, Flame, Star } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: '7day_streak',      icon: '🔥', label: '7 Day Streak',      desc: 'Study 7 days in a row',       color: '#EF4444', xp: 100, stat: 'streak',            target: 7 },
  { id: '30day_streak',     icon: '⚡', label: '30 Day Streak',     desc: 'Study 30 days in a row',      color: '#F59E0B', xp: 500, stat: 'streak',            target: 30 },
  { id: '100_hours',        icon: '⏰', label: '100 Study Hours',   desc: 'Log 100 total study hours',   color: '#06B6D4', xp: 300, stat: 'totalStudyHours',   target: 100 },
  { id: 'quiz_master',      icon: '🧠', label: 'Quiz Master',       desc: 'Complete 10 quizzes',         color: '#8B5CF6', xp: 200, stat: 'quizzesCompleted',  target: 10 },
  { id: 'roadmap_explorer', icon: '🗺️', label: 'Roadmap Explorer',  desc: 'Create 3 roadmaps',           color: '#10B981', xp: 150, stat: 'roadmapsCreated',   target: 3 },
  { id: 'fast_learner',     icon: '🚀', label: 'Fast Learner',      desc: 'Earn 500 XP',                 color: '#5B5FEF', xp: 250, stat: 'xp',                target: 500 },
  { id: 'ai_explorer',      icon: '🤖', label: 'AI Explorer',       desc: 'Send 20 AI messages',         color: '#7C3AED', xp: 200, stat: 'aiChats',           target: 20 },
  { id: 'pdf_genius',       icon: '📄', label: 'PDF Genius',        desc: 'Upload 5 PDFs',               color: '#EC4899', xp: 150, stat: 'pdfsUploaded',      target: 5 },
  { id: 'note_taker',       icon: '📝', label: 'Note Taker',        desc: 'Create 10 notes',             color: '#F59E0B', xp: 150, stat: 'notesCreated',      target: 10 },
];

export default function Achievements() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { api.get('/user/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  const earnedIds = (stats?.achievements || user?.achievements || []).map((a: any) => a.id);
  const earned = ACHIEVEMENTS.filter(a => earnedIds.includes(a.id));
  const totalXP = earned.reduce((s, a) => s + a.xp, 0);

  const getProgress = (a: typeof ACHIEVEMENTS[0]) => {
    if (!stats) return 0;
    const val = stats[a.stat] ?? 0;
    return Math.min(100, (val / a.target) * 100);
  };

  const getCurrent = (a: typeof ACHIEVEMENTS[0]) => {
    if (!stats) return 0;
    return Math.min(a.target, stats[a.stat] ?? 0);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Achievements</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Earn badges by reaching learning milestones</p>
      </motion.div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
        {[
          { label: 'Badges Earned', value: `${earned.length}/${ACHIEVEMENTS.length}`, icon: Award, color: '#F59E0B', pct: (earned.length / ACHIEVEMENTS.length) * 100 },
          { label: 'Achievement XP', value: `${totalXP} XP`, icon: Zap, color: '#5B5FEF', pct: (totalXP / 2000) * 100 },
          { label: 'Current Streak', value: `${stats?.streak ?? user?.streak ?? 0} days`, icon: Flame, color: '#EF4444', pct: Math.min(100, ((stats?.streak ?? 0) / 30) * 100) },
          { label: 'Total XP', value: `${stats?.xp ?? user?.xp ?? 0}`, icon: Star, color: '#10B981', pct: Math.min(100, ((stats?.xp ?? 0) / 1000) * 100) },
        ].map(({ label, value, icon: Icon, color, pct }) => (
          <div key={label} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon size={16} /></div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 500 }}>{label}</p>
            </div>
            <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.625rem' }}>{value}</p>
            <ProgressBar value={pct} color={color} height={4} />
          </div>
        ))}
      </motion.div>

      {/* Earned */}
      {earned.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Earned Badges</h2>
            <span className="badge badge-success">{earned.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
            {earned.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '1.25rem', background: `${a.color}08`, border: `1px solid ${a.color}25`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${a.color}10`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', border: `2px solid ${a.color}30`, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{a.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{a.desc}</p>
                    <span style={{ display: 'inline-block', marginTop: '0.375rem', fontSize: '0.7rem', fontWeight: 700, color: a.color, background: `${a.color}15`, padding: '0.15rem 0.5rem', borderRadius: 99 }}>+{a.xp} XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Achievements with progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>All Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = earnedIds.includes(a.id);
            const pct = getProgress(a);
            const current = getCurrent(a);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card" style={{ padding: '1.25rem', opacity: unlocked ? 1 : 0.75, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: unlocked ? `${a.color}20` : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `1px solid ${unlocked ? a.color + '30' : 'var(--border)'}`, flexShrink: 0, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                    {unlocked ? a.icon : <Lock size={18} color="var(--text-3)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: unlocked ? 'var(--text)' : 'var(--text-2)' }}>{a.label}</p>
                      {unlocked && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '0.1rem 0.4rem', borderRadius: 99 }}>✓</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.4 }}>{a.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: a.color, background: `${a.color}12`, padding: '0.2rem 0.5rem', borderRadius: 99, flexShrink: 0 }}>+{a.xp} XP</span>
                </div>
                {!unlocked && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.375rem' }}>
                      <span>Progress</span><span>{current}/{a.target}</span>
                    </div>
                    <ProgressBar value={pct} color={a.color} height={5} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

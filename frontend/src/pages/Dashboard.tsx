import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatCard, ProgressBar, ProgressRing, SkeletonCard } from '../components/ui';
import {
  Zap, Flame, Clock, Brain, CheckSquare, TrendingUp, Bot, FileText,
  Map, ArrowRight, Star, StickyNote, CalendarDays, Play, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats { xp: number; level: number; streak: number; totalStudyHours: number; quizzesCompleted: number; tasksCompleted: number; }

const QUICK_ACTIONS = [
  { label: 'Ask AI Tutor', href: '/tutor', icon: Bot, color: '#5B5FEF', desc: 'Get instant answers' },
  { label: 'Upload PDF', href: '/pdf', icon: FileText, color: '#7C3AED', desc: 'Learn from documents' },
  { label: 'Generate Roadmap', href: '/roadmap', icon: Map, color: '#06B6D4', desc: 'Plan your journey' },
  { label: 'Take a Quiz', href: '/quiz', icon: Brain, color: '#10B981', desc: 'Test your knowledge' },
  { label: 'Study Planner', href: '/planner', icon: CalendarDays, color: '#F59E0B', desc: 'Organize your day' },
  { label: 'My Notes', href: '/notes', icon: StickyNote, color: '#8B5CF6', desc: 'Review your notes' },
];

const MOCK_ACTIVITY = [
  { day: 'Mon', xp: 45 }, { day: 'Tue', xp: 80 }, { day: 'Wed', xp: 35 },
  { day: 'Thu', xp: 120 }, { day: 'Fri', xp: 90 }, { day: 'Sat', xp: 60 }, { day: 'Sun', xp: 110 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem 0.875rem', boxShadow: 'var(--shadow-md)', fontSize: '0.8125rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{payload[0].value} XP</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/chats', { params: { limit: 3 } }).then(r => setRecentChats(r.data.slice(0, 3))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const xpToNext = (user?.level || 1) * 100;
  const xpPct = Math.min(100, ((user?.xp || 0) % xpToNext) / xpToNext * 100);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const CONTINUE_ITEMS = [
    { label: 'Continue Last Chat', href: recentChats[0] ? `/history/${recentChats[0]._id}` : '/tutor', icon: Bot, color: '#5B5FEF', desc: recentChats[0]?.title || 'Start a new conversation' },
    { label: 'Continue Quiz', href: '/quiz', icon: Brain, color: '#8B5CF6', desc: 'Resume where you left off' },
    { label: 'Continue Roadmap', href: '/roadmap', icon: Map, color: '#06B6D4', desc: 'Keep building your path' },
    { label: 'Study Planner', href: '/planner', icon: CalendarDays, color: '#10B981', desc: 'Check today\'s tasks' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Here's your learning overview for today</p>
      </motion.div>

      {/* XP Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
        className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(91,95,239,0.07), rgba(124,58,237,0.04))', border: '1px solid rgba(91,95,239,0.15)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <ProgressRing value={xpPct} size={88} strokeWidth={8} color="#5B5FEF">
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{user?.level}</p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</p>
          </div>
        </ProgressRing>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>Level {user?.level}</span>
            <span className="badge badge-primary"><Zap size={10} /> {user?.xp} XP</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
            {xpToNext - ((user?.xp || 0) % xpToNext)} XP to reach Level {(user?.level || 1) + 1}
          </p>
          <ProgressBar value={xpPct} />
        </div>
        <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Streak', value: `${stats?.streak || user?.streak || 0}d`, icon: Flame, color: '#EF4444' },
            { label: 'Hours', value: `${stats?.totalStudyHours || 0}h`, icon: Clock, color: '#06B6D4' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem', color }}>
                <Icon size={17} />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '0.875rem' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)
        ) : (
          <>
            <motion.div variants={fadeUp}><StatCard icon={<Zap size={18} />} label="Total XP" value={stats?.xp || user?.xp || 0} color="#F59E0B" /></motion.div>
            <motion.div variants={fadeUp}><StatCard icon={<Brain size={18} />} label="Quizzes Done" value={stats?.quizzesCompleted || 0} color="#8B5CF6" /></motion.div>
            <motion.div variants={fadeUp}><StatCard icon={<CheckSquare size={18} />} label="Tasks Done" value={stats?.tasksCompleted || 0} color="#10B981" /></motion.div>
            <motion.div variants={fadeUp}><StatCard icon={<TrendingUp size={18} />} label="Current Level" value={stats?.level || user?.level || 1} color="#5B5FEF" /></motion.div>
          </>
        )}
      </motion.div>

      {/* Quick Continue */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <Play size={15} color="var(--primary)" fill="var(--primary)" />
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Quick Continue</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
          {CONTINUE_ITEMS.map(({ label, href, icon: Icon, color, desc }) => (
            <motion.div key={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to={href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}14`; (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}08`; (e.currentTarget as HTMLElement).style.borderColor = `${color}18`; }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.2 }} className="truncate">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chart + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Weekly Activity</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>XP earned this week</p>
            </div>
            <span className="badge badge-success">+{MOCK_ACTIVITY.reduce((a, b) => a + b.xp, 0)} XP</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MOCK_ACTIVITY} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="xp" stroke="#5B5FEF" strokeWidth={2.5} fill="url(#xpGrad)" dot={false} activeDot={{ r: 5, fill: '#5B5FEF', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>Quick Start</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {QUICK_ACTIONS.slice(0, 4).map(({ label, href, icon: Icon, color, desc }) => (
              <motion.div key={href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                <Link to={href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}14`; (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}08`; (e.currentTarget as HTMLElement).style.borderColor = `${color}18`; }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{label}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.2 }}>{desc}</p>
                  </div>
                  <ArrowRight size={13} color="var(--text-3)" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Chats */}
      {recentChats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={15} color="var(--primary)" />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Recent Chats</h2>
            </div>
            <Link to="/history" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentChats.map(chat => (
              <Link key={chat._id} to={`/history/${chat._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,95,239,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(91,95,239,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(91,95,239,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={15} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }} className="truncate">{chat.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }} className="truncate">{chat.lastMessage || 'No messages'}</p>
                </div>
                <ArrowRight size={13} color="var(--text-3)" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

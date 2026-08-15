import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Bot, FileText, Map, StickyNote, Brain, CalendarDays, Trophy, Clock, ArrowRight, RefreshCw } from 'lucide-react';

const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  chat:        { icon: Bot,          color: '#5B5FEF', bg: 'rgba(91,95,239,0.12)',  label: 'AI Chat' },
  pdf:         { icon: FileText,     color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', label: 'PDF Upload' },
  roadmap:     { icon: Map,          color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  label: 'Roadmap' },
  notes:       { icon: StickyNote,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Notes' },
  quiz:        { icon: Brain,        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Quiz' },
  planner:     { icon: CalendarDays, color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Study Session' },
  achievement: { icon: Trophy,       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Achievement' },
};

const GROUP_ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Older'];

function getGroupLabel(dateStr: string): string {
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const week      = new Date(today); week.setDate(today.getDate() - 7);
  const month     = new Date(today); month.setDate(today.getDate() - 30);
  const d         = new Date(new Date(dateStr).getFullYear(), new Date(dateStr).getMonth(), new Date(dateStr).getDate());

  if (d >= today)     return 'Today';
  if (d >= yesterday) return 'Yesterday';
  if (d >= week)      return 'Last 7 Days';
  if (d >= month)     return 'Last 30 Days';
  return 'Older';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'chat',     label: 'AI Chats' },
  { id: 'quiz',     label: 'Quizzes' },
  { id: 'pdf',      label: 'PDFs' },
  { id: 'notes',    label: 'Notes' },
  { id: 'roadmap',  label: 'Roadmaps' },
  { id: 'planner',  label: 'Sessions' },
];

export default function Activity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/activity')
      .then(r => setActivities(r.data))
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const seedActivity = async () => {
    const samples = [
      { type: 'chat',     title: 'Started AI Chat: React Hooks',        description: 'Asked about useState and useEffect', link: '/tutor' },
      { type: 'quiz',     title: 'Completed quiz: Python Basics',        description: 'Score: 85%',                        link: '/quiz' },
      { type: 'pdf',      title: 'Uploaded PDF: Data Structures.pdf',    description: '2.4 MB',                            link: '/pdf' },
      { type: 'notes',    title: 'Created note: JavaScript Notes',       description: 'Arrow functions, closures...',      link: '/notes' },
      { type: 'roadmap',  title: 'Created roadmap: Full Stack Dev',      description: 'Beginner · 2h/day',                 link: '/roadmap' },
      { type: 'planner',  title: 'Completed study session',              description: '2 hours · 3 tasks done',            link: '/planner' },
      { type: 'achievement', title: 'Achievement Unlocked: Fast Learner', description: 'Earned 500 XP',                   link: '/achievements' },
    ];
    try {
      await Promise.all(samples.map(s => api.post('/activity', s)));
      toast.success('Sample activity added!');
      load();
    } catch { toast.error('Failed to seed'); }
  };

  // Filter
  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  // Group in guaranteed order
  const grouped: Record<string, any[]> = {};
  GROUP_ORDER.forEach(g => { grouped[g] = []; });
  filtered.forEach(a => {
    const label = getGroupLabel(a.createdAt);
    grouped[label].push(a);
  });
  const activeGroups = GROUP_ORDER.filter(g => grouped[g].length > 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Recent Activity</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Your complete learning timeline</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={load} style={{ gap: '0.375rem' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={seedActivity} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
            Add samples
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s',
              background: filter === f.id ? 'var(--primary)' : 'var(--surface-2)',
              color:      filter === f.id ? 'white'          : 'var(--text-2)',
              boxShadow:  filter === f.id ? '0 4px 12px rgba(91,95,239,0.3)' : 'none',
            }}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 5 }} />
                <div className="skeleton" style={{ height: 14, width: '65%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 11, width: '80%', borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Clock size={26} color="var(--text-3)" />
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {filter === 'all' ? 'No activity yet' : `No ${filter} activity`}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', maxWidth: 300, lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {filter === 'all'
              ? 'Start learning — chat with AI, take a quiz, or create notes to see your timeline here.'
              : `Switch to a different filter or start using ${filter} features.`}
          </p>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/tutor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.125rem', borderRadius: 10, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', color: 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(91,95,239,0.35)' }}>
              Start Learning
            </Link>
            <button onClick={seedActivity} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.125rem', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Add sample data
            </button>
          </div>
        </motion.div>
      )}

      {/* Timeline groups */}
      {!loading && activeGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AnimatePresence>
            {activeGroups.map((groupLabel, gi) => (
              <motion.div key={groupLabel}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06, duration: 0.35 }}>

                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                    {groupLabel}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {grouped[groupLabel].length} {grouped[groupLabel].length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {grouped[groupLabel].map((activity, i) => {
                    const meta = TYPE_META[activity.type] || TYPE_META['chat'];
                    const Icon = meta.icon;
                    return (
                      <motion.div key={activity._id || i}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                          padding: '0.875rem 1rem',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 14, transition: 'all 0.2s',
                          borderLeft: `3px solid ${meta.color}`,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = meta.color;
                          (e.currentTarget as HTMLElement).style.background = meta.bg;
                          (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                          (e.currentTarget as HTMLElement).style.borderLeftColor = meta.color;
                        }}>

                        {/* Icon */}
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: meta.bg, border: `1px solid ${meta.color}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={17} color={meta.color} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.6875rem', fontWeight: 700, color: meta.color,
                              background: meta.bg, padding: '0.15rem 0.55rem', borderRadius: 99,
                              border: `1px solid ${meta.color}20`,
                            }}>
                              {meta.label}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                              {timeAgo(activity.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: activity.description ? '0.2rem' : 0 }}>
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                              {activity.description}
                            </p>
                          )}
                        </div>

                        {/* Arrow link */}
                        {activity.link && (
                          <Link to={activity.link}
                            style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0.25rem', borderRadius: 7, transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = meta.color; (e.currentTarget as HTMLElement).style.background = meta.bg; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            <ArrowRight size={15} />
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

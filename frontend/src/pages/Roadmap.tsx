import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { Map, Plus, Trash2, ChevronDown, ChevronUp, Target, BookOpen, Calendar, Clock, CheckCircle, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, ProgressBar, Badge, Spinner } from '../components/ui';
import { useBookmark } from '../hooks/useBookmark';

interface Roadmap { _id: string; goal: string; skillLevel: string; dailyHours: number; progress: number; content: any; createdAt: string; }

const LEVEL_COLORS: Record<string, string> = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };
const PHASE_COLORS = ['#5B5FEF', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [form, setForm] = useState({ goal: '', skillLevel: 'beginner', dailyHours: 2, targetDate: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toggle: toggleBookmark, isBookmarked } = useBookmark();

  useEffect(() => {
    api.get('/roadmap').then(r => setRoadmaps(r.data)).catch(() => {}).finally(() => setFetching(false));
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/roadmap/generate', form);
      setRoadmaps(prev => [data, ...prev]);
      setExpanded(data._id);
      toast.success('Roadmap generated! 🗺️');
    } catch { toast.error('Failed to generate roadmap'); } finally { setLoading(false); }
  };

  const deleteRoadmap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/roadmap/${id}`);
    setRoadmaps(prev => prev.filter(r => r._id !== id));
    toast.success('Roadmap deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Generate form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Plus size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Generate New Roadmap</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>AI-personalized learning path for any goal</p>
          </div>
        </div>
        <form onSubmit={generate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
          <div style={{ gridColumn: '1 / -1' }} className="input-group">
            <label className="input-label">Learning Goal</label>
            <input className="input" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
              placeholder="e.g. Full Stack Development, Data Science, UPSC" required />
          </div>
          <div className="input-group">
            <label className="input-label">Current Level</label>
            <select className="input" value={form.skillLevel} onChange={e => setForm(p => ({ ...p, skillLevel: e.target.value }))}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Daily Study Hours</label>
            <input className="input" type="number" min={0.5} max={12} step={0.5} value={form.dailyHours}
              onChange={e => setForm(p => ({ ...p, dailyHours: +e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Target Date (optional)</label>
            <input className="input" type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ gap: '0.4rem', width: '100%' }}>
              {loading ? <><Spinner size={15} /> Generating...</> : <><Map size={15} /> Generate Roadmap</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Roadmaps list */}
      {fetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2].map(i => <div key={i} className="card" style={{ padding: '1.5rem', height: 100 }}><div className="skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>)}
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState icon={<Map size={28} />} title="No roadmaps yet" description="Generate your first personalized learning roadmap above." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roadmaps.map((r, idx) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
              className="card" style={{ overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                      <Target size={16} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.goal}</h3>
                    <Badge variant={r.skillLevel === 'beginner' ? 'success' : r.skillLevel === 'intermediate' ? 'warning' : 'danger'}>
                      {r.skillLevel}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-3)', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {r.dailyHours}h/day</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                    {r.content?.totalWeeks && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={12} /> {r.content.totalWeeks} weeks</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}><ProgressBar value={r.progress} /></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flexShrink: 0 }}>{r.progress}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={e => deleteRoadmap(r._id, e)} className="btn-icon" style={{ width: 30, height: 30, padding: '0.25rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleBookmark({ type: 'roadmap', title: r.goal, description: `${r.skillLevel} · ${r.dailyHours}h/day`, link: '/roadmap', refId: r._id }); }}
                    className="btn-icon"
                    style={{ width: 30, height: 30, padding: '0.25rem', color: isBookmarked(r._id) ? '#F59E0B' : 'var(--text-3)' }}
                    title={isBookmarked(r._id) ? 'Remove bookmark' : 'Bookmark roadmap'}>
                    <Bookmark size={13} fill={isBookmarked(r._id) ? '#F59E0B' : 'none'} />
                  </button>
                  <button className="btn-icon" style={{ width: 30, height: 30, padding: '0.25rem' }}>
                    {expanded === r._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expanded === r._id && r.content && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
                    style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      {r.content.overview && (
                        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem', padding: '0.875rem 1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          {r.content.overview}
                        </p>
                      )}
                      {r.content.phases?.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '0.875rem' }}>Learning Phases</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {r.content.phases.map((phase: any, i: number) => {
                              const color = PHASE_COLORS[i % PHASE_COLORS.length];
                              return (
                                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                                  style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '1rem 1.25rem', border: `1px solid var(--border)`, borderLeft: `3px solid ${color}` }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color, flexShrink: 0 }}>{phase.phase}</span>
                                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{phase.title}</h5>
                                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{phase.duration}</span>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                                    {phase.goals?.length > 0 && (
                                      <div>
                                        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Goals</p>
                                        {phase.goals.map((g: string, j: number) => (
                                          <div key={j} style={{ display: 'flex', gap: '0.375rem', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                                            <CheckCircle size={12} color={color} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                                            <span style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{g}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {phase.topics?.length > 0 && (
                                      <div>
                                        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Topics</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                          {phase.topics.map((t: string, j: number) => <span key={j} className="tag" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { EmptyState, Tabs } from '../components/ui';
import { Bookmark, Trash2, ExternalLink, Bot, FileText, Map, StickyNote, Brain, Star } from 'lucide-react';

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  chat:     { icon: Bot,      color: '#5B5FEF', label: 'Chat' },
  pdf:      { icon: FileText, color: '#7C3AED', label: 'PDF' },
  roadmap:  { icon: Map,      color: '#06B6D4', label: 'Roadmap' },
  notes:    { icon: StickyNote,color: '#F59E0B', label: 'Note' },
  quiz:     { icon: Brain,    color: '#EF4444', label: 'Quiz' },
  resource: { icon: Star,     color: '#10B981', label: 'Resource' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'chat', label: 'Chats' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'roadmap', label: 'Roadmaps' },
  { id: 'notes', label: 'Notes' },
  { id: 'quiz', label: 'Quizzes' },
  { id: 'resource', label: 'Resources' },
];

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = (type?: string) => {
    const params = type && type !== 'all' ? { type } : {};
    api.get('/bookmarks', { params }).then(r => setBookmarks(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const remove = async (id: string) => {
    await api.delete(`/bookmarks/${id}`);
    setBookmarks(b => b.filter(x => x._id !== id));
    toast.success('Bookmark removed');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Bookmarks</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Your saved resources and content</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem' }}>
              <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 10, marginBottom: '0.875rem' }} />
              <div className="skeleton" style={{ height: 13, width: '70%', borderRadius: 5, marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: 11, width: '90%', borderRadius: 5 }} />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState icon={<Bookmark size={28} />} title="No bookmarks yet" description="Save chats, notes, roadmaps and more to find them quickly here." />
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
          <AnimatePresence>
            {bookmarks.map((bm, i) => {
              const meta = TYPE_META[bm.type] || TYPE_META['resource'];
              const Icon = meta.icon;
              return (
                <motion.div key={bm._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                  className="card card-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${meta.color}20`, flexShrink: 0 }}>
                      <Icon size={17} color={meta.color} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {bm.link && (
                        <Link to={bm.link} className="btn-icon" style={{ width: 28, height: 28, padding: '0.3rem' }} title="Open">
                          <ExternalLink size={12} />
                        </Link>
                      )}
                      <button onClick={() => remove(bm._id)} className="btn-icon" style={{ width: 28, height: 28, padding: '0.3rem', color: 'var(--danger)' }} title="Remove">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: meta.color, background: `${meta.color}12`, padding: '0.1rem 0.5rem', borderRadius: 99 }}>{meta.label}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.25rem' }}>{bm.title}</p>
                    {bm.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }} className="line-clamp-2">{bm.description}</p>}
                  </div>
                  {bm.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {bm.tags.map((t: string) => <span key={t} className="tag" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                    </div>
                  )}
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 'auto' }}>
                    {new Date(bm.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/ui';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  exam: '#EF4444', assignment: '#F59E0B', reminder: '#06B6D4',
  milestone: '#10B981', achievement: '#F59E0B', quiz: '#8B5CF6', system: '#5B5FEF',
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications);
      setUnread(r.data.unread);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
    toast.success('All marked as read');
  };

  const remove = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    const n = notifications.find(x => x._id === id);
    setNotifications(prev => prev.filter(x => x._id !== id));
    if (n && !n.read) setUnread(u => Math.max(0, u - 1));
  };

  const seed = async () => {
    await api.post('/notifications/seed');
    load();
    toast.success('Sample notifications added');
  };

  const FILTERS = ['all', 'exam', 'assignment', 'reminder', 'milestone', 'achievement', 'quiz'];
  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Notifications</h1>
            {unread > 0 && <span className="badge badge-danger">{unread} new</span>}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Stay on top of your learning</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unread > 0 && <button className="btn btn-secondary btn-sm" onClick={markAll}><CheckCheck size={13} /> Mark all read</button>}
          <button className="btn btn-ghost btn-sm" onClick={seed} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Add samples</button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.3rem 0.75rem', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s', background: filter === f ? 'var(--primary)' : 'var(--surface-2)', color: filter === f ? 'white' : 'var(--text-2)', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.875rem' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: '55%', borderRadius: 5, marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: 11, width: '85%', borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {filtered.map((n, i) => {
              const color = TYPE_COLORS[n.type] || '#5B5FEF';
              return (
                <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }} transition={{ delay: i * 0.03 }}
                  className="card" style={{ padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', background: n.read ? 'var(--surface)' : `${color}06`, border: `1px solid ${n.read ? 'var(--border)' : color + '20'}`, cursor: n.read ? 'default' : 'pointer', transition: 'all 0.2s' }}
                  onClick={() => !n.read && markRead(n._id)}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', border: `1px solid ${color}20` }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: n.read ? 500 : 700, color: 'var(--text)' }}>{n.title}</p>
                      {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginLeft: 'auto' }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{n.message}</p>
                    <span style={{ display: 'inline-block', marginTop: '0.375rem', fontSize: '0.6875rem', fontWeight: 600, color, background: `${color}12`, padding: '0.1rem 0.5rem', borderRadius: 99, textTransform: 'capitalize' }}>{n.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); markRead(n._id); }} className="btn-icon" style={{ width: 26, height: 26, padding: '0.25rem' }} title="Mark read">
                        <Check size={12} />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); remove(n._id); }} className="btn-icon" style={{ width: 26, height: 26, padding: '0.25rem', color: 'var(--danger)' }} title="Delete">
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

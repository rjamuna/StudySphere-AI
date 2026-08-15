import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Bot, StickyNote, Map, Brain, FileText, Clock, ArrowRight, X } from 'lucide-react';

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  chat:    { icon: Bot,       color: '#5B5FEF', label: 'Chat' },
  notes:   { icon: StickyNote,color: '#F59E0B', label: 'Note' },
  roadmap: { icon: Map,       color: '#06B6D4', label: 'Roadmap' },
  quiz:    { icon: Brain,     color: '#8B5CF6', label: 'Quiz' },
  pdf:     { icon: FileText,  color: '#7C3AED', label: 'PDF' },
};

const SUGGESTIONS = ['React hooks', 'Machine learning', 'Data structures', 'Python basics', 'System design', 'JavaScript async'];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        setResults(data.results);
        setSearched(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounce.current);
  }, [query]);

  const grouped: Record<string, any[]> = {};
  results.forEach(r => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Search</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Find anything across your learning content</p>
      </motion.div>

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input ref={inputRef} className="input" placeholder="Search chats, notes, roadmaps, quizzes…" value={query} onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '0.875rem', fontSize: '1rem', height: 52, borderRadius: 14, boxShadow: 'var(--shadow-md)' }} />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)' }}>
            <X size={12} />
          </button>
        )}
      </motion.div>

      {/* Suggestions */}
      {!query && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suggestions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setQuery(s)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 99, background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-2)', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                <Clock size={12} />{s}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: '50%', borderRadius: 5, marginBottom: '0.4rem' }} />
                <div className="skeleton" style={{ height: 11, width: '75%', borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <AnimatePresence>
          {results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Search size={40} color="var(--text-3)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>No results for "{query}"</p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Try different keywords or check your spelling.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>{results.length} result{results.length !== 1 ? 's' : ''} for "<strong style={{ color: 'var(--text)' }}>{query}</strong>"</p>
              {Object.entries(grouped).map(([type, items]) => {
                const meta = TYPE_META[type] || TYPE_META['notes'];
                const Icon = meta.icon;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                      <Icon size={14} color={meta.color} />
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'capitalize' }}>{meta.label}s</p>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{items.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {items.map((r, i) => (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <Link to={r.link} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = meta.color + '40'; (e.currentTarget as HTMLElement).style.background = meta.color + '06'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${meta.color}20` }}>
                              <Icon size={16} color={meta.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{r.title}</p>
                              {r.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)' }} className="truncate">{r.description}</p>}
                            </div>
                            <ArrowRight size={14} color="var(--text-3)" style={{ flexShrink: 0 }} />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

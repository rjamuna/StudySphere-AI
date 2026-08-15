import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { StickyNote, Plus, Trash2, Search, Tag, FileText, Clock, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, Spinner } from '../components/ui';
import { useBookmark } from '../hooks/useBookmark';

interface Note { _id: string; title: string; content: string; tags: string[]; folder: string; updatedAt: string; }

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toggle: toggleBookmark, isBookmarked } = useBookmark();

  useEffect(() => {
    api.get('/notes').then(r => setNotes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createNote = async () => {
    try {
      const { data } = await api.post('/notes', { title: 'Untitled Note', content: '', tags: [], folder: 'General' });
      setNotes(prev => [data, ...prev]);
      setSelected(data);
      toast.success('Note created');
    } catch { toast.error('Failed to create note'); }
  };

  const autoSave = (updated: Note) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.patch(`/notes/${updated._id}`, { title: updated.title, content: updated.content, tags: updated.tags });
        setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
      } catch {} finally { setSaving(false); }
    }, 800);
  };

  const updateSelected = (field: keyof Note, value: any) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value };
    setSelected(updated);
    autoSave(updated);
  };

  const deleteNote = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
    if (selected?._id === id) setSelected(null);
    toast.success('Note deleted');
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const wordCount = selected?.content.trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', height: 'calc(100vh - var(--topnav-h) - 3rem)', minHeight: 400 }}>
      {/* Notes list */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0.875rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ paddingLeft: '1.875rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem 0.5rem 1.875rem' }} />
          </div>
          <motion.button className="btn btn-primary" onClick={createNote} whileTap={{ scale: 0.95 }} style={{ padding: '0.5rem 0.625rem', flexShrink: 0 }}>
            <Plus size={16} />
          </motion.button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '0.625rem 0.75rem', borderRadius: 10 }}>
                <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: '0.375rem', borderRadius: 5 }} />
                <div className="skeleton" style={{ height: 10, width: '50%', borderRadius: 5 }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-3)' }}>
              <StickyNote size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.8rem' }}>{search ? 'No notes found' : 'No notes yet'}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map(note => (
                <motion.div key={note._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  onClick={() => setSelected(note)}
                  style={{ padding: '0.625rem 0.75rem', borderRadius: 10, cursor: 'pointer', background: selected?._id === note._id ? 'rgba(91,95,239,0.08)' : 'transparent', border: `1px solid ${selected?._id === note._id ? 'rgba(91,95,239,0.2)' : 'transparent'}`, transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (selected?._id !== note._id) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (selected?._id !== note._id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8375rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: selected?._id === note._id ? 'var(--primary)' : 'var(--text)' }}>
                      {note.title || 'Untitled'}
                    </p>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark({ type: 'notes', title: note.title, description: note.content?.slice(0, 80), link: '/notes', refId: note._id }); }}
                      style={{ background: 'none', border: 'none', color: isBookmarked(note._id) ? '#F59E0B' : 'var(--text-3)', cursor: 'pointer', padding: '0.1rem', flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <Bookmark size={11} fill={isBookmarked(note._id) ? '#F59E0B' : 'none'} />
                    </button>
                    <button onClick={e => deleteNote(note._id, e)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.1rem', flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.content.slice(0, 55) || 'Empty note'}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={10} /> {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.625rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textAlign: 'center' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Editor */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key={selected._id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.25rem' }}>
            {/* Editor header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
              <input value={selected.title} onChange={e => updateSelected('title', e.target.value)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.125rem', fontWeight: 700, outline: 'none', flex: 1, fontFamily: 'inherit', letterSpacing: '-0.02em' }}
                placeholder="Note title..." />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <button
                  onClick={() => selected && toggleBookmark({ type: 'notes', title: selected.title, description: selected.content?.slice(0, 80), link: '/notes', refId: selected._id })}
                  className="btn-icon" title={isBookmarked(selected?._id || '') ? 'Remove bookmark' : 'Bookmark note'}
                  style={{ width: 30, height: 30, color: isBookmarked(selected?._id || '') ? '#F59E0B' : 'var(--text-3)' }}>
                  <Bookmark size={14} fill={isBookmarked(selected?._id || '') ? '#F59E0B' : 'none'} />
                </button>
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <Spinner size={12} color="var(--text-3)" /> Saving...
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>✓ Saved</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
              <Tag size={13} color="var(--text-3)" style={{ flexShrink: 0 }} />
              <input value={selected.tags.join(', ')} onChange={e => updateSelected('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '0.8rem', outline: 'none', flex: 1, fontFamily: 'inherit' }}
                placeholder="Add tags (comma separated)..." />
              {selected.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {selected.tags.map(tag => <span key={tag} className="tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{tag}</span>)}
                </div>
              )}
            </div>

            {/* Content */}
            <textarea value={selected.content} onChange={e => updateSelected('content', e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.75, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
              placeholder="Start writing your notes here... Markdown is supported!" />

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.625rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{wordCount} words · {selected.content.length} chars</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Last edited {new Date(selected.updatedAt).toLocaleString()}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <EmptyState icon={<FileText size={28} />} title="Select a note" description="Choose a note from the list or create a new one to start writing."
              action={<button className="btn btn-primary" onClick={createNote} style={{ gap: '0.4rem' }}><Plus size={15} /> New Note</button>} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

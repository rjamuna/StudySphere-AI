import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/ui';
import {
  Search, Pin, Heart, Archive, Trash2, Edit3, Copy, MessageSquare,
  ChevronDown, ChevronRight, X, Bot, MoreHorizontal, Bookmark
} from 'lucide-react';
import { useBookmark } from '../hooks/useBookmark';

interface Chat { _id: string; title: string; lastMessage: string; subject: string; pinned: boolean; favorite: boolean; archived: boolean; messageCount: number; updatedAt: string; }

function groupChats(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today); week.setDate(week.getDate() - 7);
  const month = new Date(today); month.setDate(month.getDate() - 30);

  const groups: Record<string, Chat[]> = { Pinned: [], Today: [], Yesterday: [], 'Last 7 Days': [], 'Last 30 Days': [], Older: [] };
  chats.forEach(c => {
    if (c.pinned) { groups['Pinned'].push(c); return; }
    const d = new Date(c.updatedAt);
    if (d >= today) groups['Today'].push(c);
    else if (d >= yesterday) groups['Yesterday'].push(c);
    else if (d >= week) groups['Last 7 Days'].push(c);
    else if (d >= month) groups['Last 30 Days'].push(c);
    else groups['Older'].push(c);
  });
  return groups;
}

function ChatItem({ chat, active, onSelect, onAction }: { chat: Chat; active: boolean; onSelect: () => void; onAction: (action: string, chat: Chat) => void }) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitRename = () => { if (title.trim()) onAction('rename', { ...chat, title: title.trim() }); setRenaming(false); };

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} layout
      style={{ position: 'relative', borderRadius: 10, background: active ? 'linear-gradient(135deg, rgba(91,95,239,0.1), rgba(124,58,237,0.07))' : 'transparent', border: `1px solid ${active ? 'rgba(91,95,239,0.18)' : 'transparent'}`, transition: 'all 0.15s', marginBottom: '0.125rem' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', cursor: 'pointer' }} onClick={onSelect}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? 'rgba(91,95,239,0.15)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
          <Bot size={14} color={active ? 'var(--primary)' : 'var(--text-3)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {renaming ? (
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenaming(false); }}
              onBlur={submitRename}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 6, padding: '0.2rem 0.4rem', fontSize: '0.8125rem', color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }}
              onClick={e => e.stopPropagation()} />
          ) : (
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: active ? 'var(--primary)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{chat.title}</p>
          )}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{chat.lastMessage || 'No messages yet'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          {chat.favorite && <Heart size={10} color="#EF4444" fill="#EF4444" />}
          {chat.pinned && <Pin size={10} color="var(--primary)" />}
        </div>
      </div>

      {/* Context menu button */}
      <div ref={menuRef} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
        <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
          style={{ width: 24, height: 24, borderRadius: 6, background: menu ? 'var(--surface-3)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', opacity: 0, transition: 'opacity 0.15s' }}
          className="chat-menu-btn">
          <MoreHorizontal size={13} />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }} transition={{ duration: 0.12 }}
              style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: 160, overflow: 'hidden' }}>
              {[
                { icon: Edit3, label: 'Rename', action: 'rename-start' },
                { icon: Pin, label: chat.pinned ? 'Unpin' : 'Pin', action: 'pin' },
                { icon: Heart, label: chat.favorite ? 'Unfavorite' : 'Favorite', action: 'favorite' },
                { icon: Copy, label: 'Duplicate', action: 'duplicate' },
                { icon: Archive, label: chat.archived ? 'Unarchive' : 'Archive', action: 'archive' },
                { icon: Bookmark, label: 'Bookmark', action: 'bookmark' },
                { icon: Trash2, label: 'Delete', action: 'delete', danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button key={action} onClick={e => { e.stopPropagation(); setMenu(false); if (action === 'rename-start') setRenaming(true); else onAction(action, chat); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.875rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: danger ? 'var(--danger)' : 'var(--text-2)', fontFamily: 'inherit', transition: 'background 0.1s', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const load = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (subject) params.subject = subject;
      if (showArchived) params.archived = 'true';
      const { data } = await api.get('/chats', { params });
      setChats(data);
    } catch { toast.error('Failed to load chats'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, subject, showArchived]);

  useEffect(() => {
    if (activeId) {
      setChatLoading(true);
      api.get(`/chats/${activeId}`).then(r => setActiveChat(r.data)).catch(() => {}).finally(() => setChatLoading(false));
    }
  }, [activeId]);

  const handleAction = async (action: string, chat: Chat) => {
    try {
      if (action === 'delete') {
        await api.delete(`/chats/${chat._id}`);
        setChats(c => c.filter(x => x._id !== chat._id));
        if (activeId === chat._id) navigate('/history');
        toast.success('Chat deleted');
      } else if (action === 'pin') {
        const { data } = await api.patch(`/chats/${chat._id}`, { pinned: !chat.pinned });
        setChats(c => c.map(x => x._id === chat._id ? { ...x, pinned: data.pinned } : x));
      } else if (action === 'favorite') {
        const { data } = await api.patch(`/chats/${chat._id}`, { favorite: !chat.favorite });
        setChats(c => c.map(x => x._id === chat._id ? { ...x, favorite: data.favorite } : x));
      } else if (action === 'archive') {
        await api.patch(`/chats/${chat._id}`, { archived: !chat.archived });
        setChats(c => c.filter(x => x._id !== chat._id));
        toast.success(chat.archived ? 'Unarchived' : 'Archived');
      } else if (action === 'duplicate') {
        const { data } = await api.post(`/chats/${chat._id}/duplicate`);
        setChats(c => [data, ...c]);
        toast.success('Chat duplicated');
      } else if (action === 'rename') {
        const { data } = await api.patch(`/chats/${chat._id}`, { title: chat.title });
        setChats(c => c.map(x => x._id === chat._id ? { ...x, title: data.title } : x));
      } else if (action === 'bookmark') {
        await api.post('/bookmarks', {
          type: 'chat', title: chat.title,
          description: chat.lastMessage || '',
          link: `/history/${chat._id}`, refId: chat._id,
        });
        toast.success('Chat bookmarked!');
      }
    } catch { toast.error('Action failed'); }
  };

  const groups = groupChats(chats);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--topnav-h) - 3rem)', gap: '1.25rem' }}>
      {/* Sidebar */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card"
        style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Chat History</h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/tutor')}>+ New</button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input className="input" placeholder="Search chats…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem', fontSize: '0.8125rem' }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}><X size={13} /></button>}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
            <button onClick={() => setShowArchived(false)} style={{ flex: 1, padding: '0.3rem', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, background: !showArchived ? 'var(--primary)' : 'var(--surface-2)', color: !showArchived ? 'white' : 'var(--text-2)', fontFamily: 'inherit', transition: 'all 0.15s' }}>Active</button>
            <button onClick={() => setShowArchived(true)} style={{ flex: 1, padding: '0.3rem', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, background: showArchived ? 'var(--primary)' : 'var(--surface-2)', color: showArchived ? 'white' : 'var(--text-2)', fontFamily: 'inherit', transition: 'all 0.15s' }}>Archived</button>
          </div>
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.625rem', padding: '0.625rem', marginBottom: '0.25rem' }}>
                <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 5, marginBottom: '0.375rem' }} />
                  <div className="skeleton" style={{ height: 10, width: '90%', borderRadius: 5 }} />
                </div>
              </div>
            ))
          ) : chats.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <MessageSquare size={32} color="var(--text-3)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>No chats yet</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => {
              if (!items.length) return null;
              const isCollapsed = collapsed[group];
              return (
                <div key={group} style={{ marginBottom: '0.5rem' }}>
                  <button onClick={() => setCollapsed(c => ({ ...c, [group]: !c[group] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.5rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'inherit', marginBottom: '0.25rem' }}>
                    {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                    {group} <span style={{ marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{items.length}</span>
                  </button>
                  <AnimatePresence>
                    {!isCollapsed && items.map(chat => (
                      <ChatItem key={chat._id} chat={chat} active={activeId === chat._id}
                        onSelect={() => navigate(`/history/${chat._id}`)}
                        onAction={handleAction} />
                    ))}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Chat View */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {!activeId ? (
          <EmptyState icon={<MessageSquare size={28} />} title="Select a conversation" description="Choose a chat from the sidebar to view the full conversation." />
        ) : chatLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dot-loader"><span /><span /><span /></div>
          </div>
        ) : activeChat ? (
          <>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, rgba(91,95,239,0.15), rgba(124,58,237,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(91,95,239,0.2)' }}>
                <Bot size={16} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{activeChat.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{activeChat.messageCount} messages · {activeChat.subject || 'General'}</p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/tutor')}>Continue Chat</button>
              <button
                onClick={() => api.post('/bookmarks', { type: 'chat', title: activeChat.title, description: activeChat.lastMessage || '', link: `/history/${activeChat._id}`, refId: activeChat._id }).then(() => toast.success('Bookmarked!')).catch(() => toast.error('Failed'))}
                className="btn-icon" title="Bookmark this chat" style={{ width: 32, height: 32 }}>
                <Bookmark size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeChat.messages?.length === 0 ? (
                <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>No messages in this chat.</p>
              ) : (
                activeChat.messages?.map((msg: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Bot size={13} color="white" />
                      </div>
                    )}
                    <div style={{ maxWidth: '72%', padding: '0.75rem 1rem', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #5B5FEF, #7C3AED)' : 'var(--surface-2)', color: msg.role === 'user' ? 'white' : 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6, border: msg.role === 'user' ? 'none' : '1px solid var(--border)' }}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        ) : null}
      </motion.div>

      <style>{`.chat-menu-btn { opacity: 0 !important; } div:hover > .chat-menu-btn, div:hover .chat-menu-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

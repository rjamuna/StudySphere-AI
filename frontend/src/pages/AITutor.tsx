import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Bot, User, Trash2, Copy, Check, Lightbulb, Plus, History, Bookmark } from 'lucide-react';
import { useBookmark } from '../hooks/useBookmark';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'Explain machine learning simply',
  'What is recursion in programming?',
  'How does photosynthesis work?',
  'Explain the French Revolution',
  'What is quantum entanglement?',
  'How does the internet work?',
];

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm your **AI Tutor** 👋\n\nI can explain any concept, generate examples, create quizzes, or help you understand any topic. What would you like to learn today?",
};

export default function AITutor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const { toggle: toggleBookmark, isBookmarked } = useBookmark();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load existing chat if ?chat=id is in URL
  useEffect(() => {
    const id = searchParams.get('chat');
    if (!id) return;
    setInitializing(true);
    api.get(`/chats/${id}`)
      .then(r => {
        setChatId(r.data._id);
        const msgs: Message[] = r.data.messages.map((m: any) => ({ role: m.role, content: m.content }));
        setMessages(msgs.length ? msgs : [WELCOME]);
      })
      .catch(() => toast.error('Could not load chat'))
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Create a new chat session in MongoDB (called on first user message)
  const ensureChat = async (firstMessage: string): Promise<string> => {
    if (chatId) return chatId;
    const { data } = await api.post('/chats', {
      title: firstMessage.slice(0, 60),
      subject: '',
    });
    setChatId(data._id);
    // Update URL without navigation
    navigate(`/tutor?chat=${data._id}`, { replace: true });
    return data._id;
  };

  // Persist a single message to the chat
  const persistMessage = async (id: string, role: 'user' | 'assistant', content: string) => {
    try {
      await api.post(`/chats/${id}/messages`, { role, content });
    } catch {
      // non-blocking — don't break the chat UX
    }
  };

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      // 1. Ensure chat exists in DB
      const id = await ensureChat(msg);

      // 2. Persist user message
      await persistMessage(id, 'user', msg);

      // 3. Call AI service
      const { data } = await axios.post('http://localhost:8000/tutor/chat', {
        message: msg,
        history: messages,
      });

      const reply = data.reply as string;

      // 4. Add AI reply to UI
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // 5. Persist AI reply
      await persistMessage(id, 'assistant', reply);

    } catch (err: any) {
      const errMsg = 'Sorry, I encountered an error. Please check that the AI service is running.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      // Still try to persist the error message so history is consistent
      if (chatId) await persistMessage(chatId, 'assistant', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([WELCOME]);
    setInput('');
    navigate('/tutor', { replace: true });
  };

  const copyMsg = (content: string, i: number) => {
    navigator.clipboard.writeText(content);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  if (initializing) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topnav-h) - 3rem)' }}>
      <div className="dot-loader"><span /><span /><span /></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topnav-h) - 3rem)', minHeight: 400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,95,239,0.3)' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>AI Tutor</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {chatId ? 'Chat saved to history' : 'Online · chat saves on first message'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')} style={{ gap: '0.375rem', color: 'var(--text-3)' }}>
            <History size={14} /> History
          </button>
          <button className="btn btn-secondary btn-sm" onClick={startNewChat} style={{ gap: '0.375rem' }}>
            <Plus size={14} /> New Chat
          </button>
          {chatId && (
            <button
              onClick={() => toggleBookmark({ type: 'chat', title: messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'AI Chat', description: messages[messages.length - 1]?.content?.slice(0, 80) || '', link: `/history/${chatId}`, refId: chatId })}
              className="btn-icon"
              style={{ color: isBookmarked(chatId) ? '#F59E0B' : 'var(--text-3)' }}
              title={isBookmarked(chatId) ? 'Remove bookmark' : 'Bookmark this chat'}>
              <Bookmark size={15} fill={isBookmarked(chatId) ? '#F59E0B' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="card" style={{ flex: 1, overflow: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.75rem' }}>
        {/* Suggestions */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-3)' }}>
              <Lightbulb size={14} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Try asking...</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SUGGESTIONS.map(s => (
                <motion.button key={s} onClick={() => send(s)} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>{s}</motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #5B5FEF, #7C3AED)' : 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: msg.role === 'user' ? '0 2px 8px rgba(91,95,239,0.3)' : 'none' }}>
                {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--primary)" />}
              </div>

              <div style={{ maxWidth: '78%', position: 'relative' }}>
                <div style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #5B5FEF, #7C3AED)' : 'var(--surface-2)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  padding: '0.75rem 1rem',
                  color: msg.role === 'user' ? 'white' : 'var(--text)',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(91,95,239,0.25)' : 'none',
                }}>
                  <div className="prose" style={{ fontSize: '0.875rem', color: msg.role === 'user' ? 'white' : undefined }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === 'assistant' && (
                  <button onClick={() => copyMsg(msg.content, i)}
                    style={{ position: 'absolute', top: 8, right: -34, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '0.25rem', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', opacity: 0, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    {copied === i ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={14} color="var(--primary)" />
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px 18px 18px 18px', padding: '0.875rem 1.125rem' }}>
              <div className="dot-loader"><span /><span /><span /></div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea ref={inputRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder="Ask me anything… (Enter to send, Shift+Enter for new line)"
          rows={1} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', color: 'var(--text)', fontSize: '0.875rem', fontFamily: 'inherit', lineHeight: 1.55, overflowY: 'auto', padding: '0.25rem 0', minHeight: 24 }} />
        <motion.button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}
          whileTap={{ scale: 0.93 }} style={{ padding: '0.625rem', borderRadius: 10, flexShrink: 0, width: 38, height: 38 }}>
          <Send size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
}

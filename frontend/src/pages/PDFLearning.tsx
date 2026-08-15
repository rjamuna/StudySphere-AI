import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, Sparkles, MessageSquare, Send, BookOpen, RotateCcw, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, Spinner, Badge } from '../components/ui';

interface PDFData { summary: string; keyPoints: string[]; flashcards: { front: string; back: string }[]; topics: string[]; textContent: string; }

const TABS = [
  { id: 'summary', label: 'Summary', icon: <Sparkles size={13} /> },
  { id: 'flashcards', label: 'Flashcards', icon: <RotateCcw size={13} /> },
  { id: 'ask', label: 'Ask PDF', icon: <MessageSquare size={13} /> },
];

function FlashCard({ card, index }: { card: { front: string; back: string }; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="flashcard-scene" style={{ minHeight: 160, cursor: 'pointer' }} onClick={() => setFlipped(f => !f)}>
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%', minHeight: 160 }}>
        {/* Front */}
        <div className="flashcard-face card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>Question</span>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--text)', fontWeight: 500 }}>{card.front}</p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Click to reveal answer</span>
        </div>
        {/* Back */}
        <div className="flashcard-face flashcard-back card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160, background: 'linear-gradient(135deg, rgba(91,95,239,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(91,95,239,0.2)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--success)' }}>Answer</span>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--text)' }}>{card.back}</p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Click to flip back</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PDFLearning() {
  const [pdfData, setPdfData] = useState<PDFData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [tab, setTab] = useState('summary');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF file');
    if (file.size > 20 * 1024 * 1024) return toast.error('File too large (max 20MB)');
    setLoading(true);
    setFileName(file.name);
    const form = new FormData();
    form.append('pdf', file);
    try {
      const { data } = await api.post('/pdf/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPdfData(data);
      toast.success('PDF processed successfully! 🎉');
    } catch { toast.error('Failed to process PDF'); setFileName('');
    } finally { setLoading(false); }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const askQuestion = async () => {
    if (!question.trim() || !pdfData) return;
    setAsking(true);
    try {
      const { data } = await api.post('/pdf/ask', { question, context: pdfData.textContent });
      setAnswer(data.answer);
    } catch { toast.error('Failed to get answer'); } finally { setAsking(false); }
  };

  if (!pdfData) return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(91,95,239,0.08))', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7C3AED' }}>
            <FileText size={26} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>PDF Learning</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Upload any PDF to get AI-powered summaries, flashcards & Q&A</p>
        </div>

        <label
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-2)'}`, borderRadius: 20, padding: '3.5rem 2rem', cursor: 'pointer', transition: 'all 0.2s', background: dragging ? 'rgba(91,95,239,0.04)' : 'var(--surface)', textAlign: 'center' }}>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(91,95,239,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spinner size={24} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Processing {fileName}...</p>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>AI is analyzing your document</p>
              </div>
            </div>
          ) : (
            <>
              <motion.div animate={{ y: dragging ? -4 : 0 }} transition={{ duration: 0.2 }}
                style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(91,95,239,0.08)', border: '1px solid rgba(91,95,239,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--primary)' }}>
                <Upload size={28} />
              </motion.div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>Drop your PDF here</p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>or click to browse files</p>
              <span className="badge badge-neutral">PDF only · Max 20MB</span>
            </>
          )}
        </label>
      </motion.div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
            <FileText size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{fileName || 'PDF Document'}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              {pdfData.topics.slice(0, 3).map(t => <span key={t} className="tag" style={{ fontSize: '0.7rem' }}>{t}</span>)}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setPdfData(null); setFileName(''); setAnswer(''); }} style={{ gap: '0.375rem' }}>
          <X size={14} /> Upload New
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={16} color="var(--warning)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Summary</h3>
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.9rem' }}>{pdfData.summary}</p>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BookOpen size={16} color="var(--accent)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Key Points</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {pdfData.keyPoints.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <CheckCircle size={12} color="var(--accent)" />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{p}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'flashcards' && (
          <motion.div key="flashcards" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{pdfData.flashcards.length} flashcards · Click to flip</p>
              <Badge variant="accent">{pdfData.flashcards.length} cards</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {pdfData.flashcards.map((card, i) => <FlashCard key={i} card={card} index={i} />)}
            </div>
          </motion.div>
        )}

        {tab === 'ask' && (
          <motion.div key="ask" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Ask a question about your PDF</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input" value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askQuestion()}
                placeholder="What is the main argument of chapter 2?" style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={askQuestion} disabled={asking || !question.trim()} style={{ gap: '0.4rem', flexShrink: 0 }}>
                {asking ? <><Spinner size={15} /> Thinking...</> : <><Send size={15} /> Ask</>}
              </button>
            </div>
            <AnimatePresence>
              {answer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                  <div className="prose" style={{ fontSize: '0.9rem' }}><ReactMarkdown>{answer}</ReactMarkdown></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

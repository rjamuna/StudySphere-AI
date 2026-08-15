import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { Brain, Plus, Trash2, Play, Check, X, Trophy, RotateCcw, ChevronRight, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, Badge, ProgressBar, Spinner } from '../components/ui';
import { useBookmark } from '../hooks/useBookmark';

interface Question { question: string; type: string; options: string[]; answer: string; }
interface Quiz { _id: string; title: string; topic: string; questions: Question[]; score?: number; completed: boolean; createdAt: string; }

const TYPE_LABELS: Record<string, string> = { mcq: 'MCQ', truefalse: 'True/False', fillin: 'Fill in Blank' };

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [form, setForm] = useState({ topic: '', numQuestions: 5, type: 'mcq' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const { toggle: toggleBookmark, isBookmarked } = useBookmark();

  useEffect(() => {
    api.get('/quiz').then(r => setQuizzes(r.data)).catch(() => {}).finally(() => setFetching(false));
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/generate', form);
      setQuizzes(prev => [data, ...prev]);
      toast.success('Quiz generated! 🎉');
    } catch { toast.error('Failed to generate quiz'); } finally { setLoading(false); }
  };

  const startQuiz = (quiz: Quiz) => { setActiveQuiz(quiz); setAnswers({}); setSubmitted(false); setScore(0); setCurrentQ(0); };

  const isCorrect = (userAnswer: string, correctAnswer: string) =>
    userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const correct = activeQuiz.questions.filter((q, i) => isCorrect(answers[i] ?? '', q.answer)).length;
    const pct = Math.round((correct / activeQuiz.questions.length) * 100);
    setScore(pct); setSubmitted(true);
    await api.patch(`/quiz/${activeQuiz._id}/submit`, { score: pct });
    setQuizzes(prev => prev.map(q => q._id === activeQuiz._id ? { ...q, score: pct, completed: true } : q));
  };

  const deleteQuiz = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/quiz/${id}`);
    setQuizzes(prev => prev.filter(q => q._id !== id));
    toast.success('Quiz deleted');
  };

  // Active quiz view
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQ];
    const answered = Object.keys(answers).length;
    const progress = (answered / activeQuiz.questions.length) * 100;

    if (submitted) return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
          className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: score >= 80 ? 'linear-gradient(135deg, #10B981, #06B6D4)' : score >= 60 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'linear-gradient(135deg, #EF4444, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <Trophy size={36} color="white" />
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}%</motion.p>
          <p style={{ color: 'var(--text-2)', marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
            {activeQuiz.questions.filter((q, i) => isCorrect(answers[i] ?? '', q.answer)).length} / {activeQuiz.questions.length} correct
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            {score >= 80 ? '🎉 Excellent work!' : score >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => startQuiz(activeQuiz)} style={{ gap: '0.4rem' }}>
              <RotateCcw size={15} /> Retake Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveQuiz(null)}>Back to Quizzes</button>
          </div>
        </motion.div>
      </div>
    );

    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{activeQuiz.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{currentQ + 1} of {activeQuiz.questions.length} questions</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveQuiz(null)}>← Exit</button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <ProgressBar value={answered} max={activeQuiz.questions.length} />
        </div>

        {/* Question navigation dots */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {activeQuiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${i === currentQ ? 'var(--primary)' : answers[i] ? 'var(--success)' : 'var(--border)'}`, background: i === currentQ ? 'rgba(91,95,239,0.12)' : answers[i] ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', color: i === currentQ ? 'var(--primary)' : answers[i] ? 'var(--success)' : 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
            className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Q{currentQ + 1}.</span> {q.question}
            </p>
            {q.type === 'fillin' ? (
              <input className="input" value={answers[currentQ] || ''} onChange={e => setAnswers(p => ({ ...p, [currentQ]: e.target.value }))} placeholder="Type your answer..." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, j) => {
                  const selected = answers[currentQ] === opt;
                  return (
                    <motion.button key={j} onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))}
                      whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                      style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 10, border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, background: selected ? 'rgba(91,95,239,0.08)' : 'var(--surface-2)', color: selected ? 'var(--primary)' : 'var(--text)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-2)'}`, background: selected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {selected && <Check size={12} color="white" />}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>← Prev</button>
          {currentQ < activeQuiz.questions.length - 1 ? (
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentQ(currentQ + 1)} style={{ gap: '0.375rem' }}>Next <ChevronRight size={14} /></button>
          ) : (
            <button className="btn btn-primary" onClick={submitQuiz} disabled={answered < activeQuiz.questions.length} style={{ gap: '0.4rem' }}>
              <Trophy size={15} /> Submit Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Generate form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
            <Plus size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Generate Quiz</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>AI-powered questions on any topic</p>
          </div>
        </div>
        <form onSubmit={generate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '2 1 200px' }} className="input-group">
            <label className="input-label">Topic</label>
            <input className="input" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} placeholder="e.g. Python basics, World War II, Calculus" required />
          </div>
          <div style={{ flex: '0 1 130px' }} className="input-group">
            <label className="input-label">Questions</label>
            <select className="input" value={form.numQuestions} onChange={e => setForm(p => ({ ...p, numQuestions: +e.target.value }))}>
              {[3, 5, 10, 15].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div style={{ flex: '0 1 150px' }} className="input-group">
            <label className="input-label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="mcq">Multiple Choice</option>
              <option value="truefalse">True / False</option>
              <option value="fillin">Fill in Blank</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ gap: '0.4rem', flexShrink: 0 }}>
            {loading ? <><Spinner size={15} /> Generating...</> : <><Brain size={15} /> Generate</>}
          </button>
        </form>
      </motion.div>

      {/* Quiz list */}
      {fetching ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="card" style={{ padding: '1.25rem', height: 140 }}><div className="skeleton" style={{ height: '100%', borderRadius: 8 }} /></div>)}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={<Brain size={28} />} title="No quizzes yet" description="Generate your first AI-powered quiz above to test your knowledge." />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {quizzes.map((quiz, i) => (
            <motion.div key={quiz._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card card-hover" style={{ padding: '1.25rem', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={e => deleteQuiz(quiz._id, e)} className="btn-icon" style={{ width: 28, height: 28, padding: '0.25rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); toggleBookmark({ type: 'quiz', title: quiz.title, description: `${quiz.questions.length} questions · ${quiz.completed ? `Score: ${quiz.score}%` : 'Not completed'}`, link: '/quiz', refId: quiz._id }); }}
                  className="btn-icon"
                  style={{ width: 28, height: 28, padding: '0.25rem', color: isBookmarked(quiz._id) ? '#F59E0B' : 'var(--text-3)' }}
                  title={isBookmarked(quiz._id) ? 'Remove bookmark' : 'Bookmark quiz'}>
                  <Bookmark size={13} fill={isBookmarked(quiz._id) ? '#F59E0B' : 'none'} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <Badge variant="primary">{quiz.questions.length} questions</Badge>
                <Badge variant="neutral">{TYPE_LABELS[quiz.questions[0]?.type] || 'MCQ'}</Badge>
                {quiz.completed && <Badge variant="success">Score: {quiz.score}%</Badge>}
              </div>
              {quiz.completed && quiz.score !== undefined && (
                <div style={{ marginBottom: '0.875rem' }}>
                  <ProgressBar value={quiz.score} color={quiz.score >= 80 ? 'var(--success)' : quiz.score >= 60 ? 'var(--warning)' : 'var(--danger)'} />
                </div>
              )}
              <motion.button className="btn btn-primary" onClick={() => startQuiz(quiz)} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', gap: '0.4rem', fontSize: '0.8375rem' }}>
                <Play size={14} /> {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

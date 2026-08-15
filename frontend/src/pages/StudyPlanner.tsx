import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { CalendarDays, Plus, Trash2, Check, Timer, AlertCircle, X, Flame, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, Badge } from '../components/ui';

interface Task { _id: string; title: string; subject?: string; dueDate?: string; completed: boolean; priority: 'low' | 'medium' | 'high'; type: 'task' | 'exam' | 'assignment'; }

const PRIORITY_COLOR = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
const PRIORITY_BG = { low: 'rgba(16,185,129,0.1)', medium: 'rgba(245,158,11,0.1)', high: 'rgba(239,68,68,0.1)' };
const TYPE_ICON: Record<string, string> = { task: '📋', exam: '📝', assignment: '📌' };

export default function StudyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', priority: 'medium', type: 'task' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get('/planner').then(r => setTasks(r.data.tasks || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pomodoroRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroTime(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setPomodoroRunning(false);
            const next = pomodoroMode === 'work' ? 'break' : 'work';
            if (pomodoroMode === 'work') setSessions(s => s + 1);
            setPomodoroMode(next);
            const nextTime = next === 'work' ? 25 * 60 : 5 * 60;
            setPomodoroTime(nextTime);
            toast.success(next === 'break' ? '🎉 Break time! You earned it.' : '💪 Back to work!');
            return nextTime;
          }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(timerRef.current!);
    return () => clearInterval(timerRef.current!);
  }, [pomodoroRunning, pomodoroMode]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/planner/task', form);
      setTasks(data.tasks);
      setForm({ title: '', subject: '', dueDate: '', priority: 'medium', type: 'task' });
      setShowForm(false);
      toast.success('Task added!');
    } catch { toast.error('Failed to add task'); }
  };

  const toggleTask = async (task: Task) => {
    try {
      const { data } = await api.patch(`/planner/task/${task._id}`, { completed: !task.completed });
      setTasks(data.tasks);
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id: string) => {
    try {
      const { data } = await api.delete(`/planner/task/${id}`);
      setTasks(data.tasks);
    } catch { toast.error('Failed to delete task'); }
  };

  const mins = Math.floor(pomodoroTime / 60).toString().padStart(2, '0');
  const secs = (pomodoroTime % 60).toString().padStart(2, '0');
  const totalTime = pomodoroMode === 'work' ? 25 * 60 : 5 * 60;
  const progress = (1 - pomodoroTime / totalTime) * 100;
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);
  const timerColor = pomodoroMode === 'work' ? '#5B5FEF' : '#10B981';

  const today = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
  const upcoming = tasks.filter(t => !t.completed && (!t.dueDate || new Date(t.dueDate) > new Date()) && !today.includes(t));
  const completed = tasks.filter(t => t.completed);

  const TaskItem = ({ task }: { task: Task }) => (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
      className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', opacity: task.completed ? 0.55 : 1, transition: 'opacity 0.2s' }}>
      <motion.button onClick={() => toggleTask(task)} whileTap={{ scale: 0.9 }}
        style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${task.completed ? 'var(--success)' : PRIORITY_COLOR[task.priority]}`, background: task.completed ? 'var(--success)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
        {task.completed && <Check size={12} color="white" />}
      </motion.button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-3)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {TYPE_ICON[task.type]} {task.title}
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
          {task.subject && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{task.subject}</span>}
          {task.dueDate && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], boxShadow: `0 0 0 2px ${PRIORITY_BG[task.priority]}` }} />
        {task.type === 'exam' && <AlertCircle size={13} color="var(--danger)" />}
        <button onClick={() => deleteTask(task._id)} className="btn-icon" style={{ width: 26, height: 26, padding: '0.2rem', color: 'var(--text-3)' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: '1.25rem', alignItems: 'start' }}>
      {/* Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Study Tasks</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>{tasks.filter(t => !t.completed).length} pending · {completed.length} done</p>
          </div>
          <motion.button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} whileTap={{ scale: 0.97 }} style={{ gap: '0.375rem' }}>
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Task</>}
          </motion.button>
        </div>

        {/* Add task form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
              <form onSubmit={addTask} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }} className="input-group">
                  <label className="input-label">Task Title</label>
                  <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What do you need to study?" required autoFocus />
                </div>
                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input className="input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" />
                </div>
                <div className="input-group">
                  <label className="input-label">Due Date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="task">📋 Task</option>
                    <option value="exam">📝 Exam</option>
                    <option value="assignment">📌 Assignment</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" type="submit" style={{ gap: '0.375rem' }}><Plus size={14} /> Add Task</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task sections */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="card" style={{ padding: '0.875rem 1rem', height: 60 }}><div className="skeleton" style={{ height: '100%', borderRadius: 6 }} /></div>)
        ) : tasks.length === 0 ? (
          <EmptyState icon={<CalendarDays size={28} />} title="No tasks yet" description="Add your first study task to get started with your learning plan."
            action={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} style={{ gap: '0.375rem' }}><Plus size={14} /> Add Task</button>} />
        ) : (
          <>
            {[
              { label: "Today's Tasks", items: today, color: '#F59E0B', badge: 'warning' as const },
              { label: 'Upcoming', items: upcoming, color: '#5B5FEF', badge: 'primary' as const },
              { label: 'Completed', items: completed, color: '#10B981', badge: 'success' as const },
            ].map(({ label, items, color, badge }) => items.length > 0 && (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{label}</span>
                  <Badge variant={badge}>{items.length}</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <AnimatePresence>
                    {items.map(task => <TaskItem key={task._id} task={task} />)}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pomodoro Timer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 'calc(var(--topnav-h) + 1.5rem)' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Timer size={16} color="var(--warning)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Pomodoro Timer</h3>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '0.375rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
            {[{ id: 'work', label: 'Focus', time: 25 }, { id: 'break', label: 'Break', time: 5 }].map(m => (
              <button key={m.id} onClick={() => { setPomodoroRunning(false); setPomodoroMode(m.id as any); setPomodoroTime(m.time * 60); }}
                style={{ flex: 1, padding: '0.375rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s', background: pomodoroMode === m.id ? 'var(--surface)' : 'transparent', color: pomodoroMode === m.id ? 'var(--text)' : 'var(--text-3)', boxShadow: pomodoroMode === m.id ? 'var(--shadow-sm)' : 'none' }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Ring */}
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.25rem' }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
              <motion.circle cx="70" cy="70" r={r} fill="none" stroke={timerColor} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em', lineHeight: 1, color: timerColor }}>{mins}:{secs}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{pomodoroMode}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.875rem' }}>
            <motion.button className="btn btn-primary" onClick={() => setPomodoroRunning(!pomodoroRunning)} whileTap={{ scale: 0.97 }} style={{ flex: 1, gap: '0.375rem' }}>
              {pomodoroRunning ? '⏸ Pause' : '▶ Start'}
            </motion.button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setPomodoroRunning(false); setPomodoroMode('work'); setPomodoroTime(25 * 60); }}>
              Reset
            </button>
          </div>

          {sessions > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
              <Flame size={13} color="var(--danger)" />
              <span>{sessions} session{sessions !== 1 ? 's' : ''} completed</span>
            </div>
          )}
        </motion.div>

        {/* Stats summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.875rem' }}>Task Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: "Today's tasks", count: today.length, color: '#F59E0B' },
              { label: 'Upcoming', count: upcoming.length, color: '#5B5FEF' },
              { label: 'Completed', count: completed.length, color: '#10B981' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

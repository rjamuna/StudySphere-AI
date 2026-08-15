import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Modal, ProgressBar, ProgressRing, Skeleton } from '../components/ui';
import {
  Camera, Edit3, Save, X, Lock, Trash2, LogOut, Sun, Moon,
  Flame, Zap, Clock, Brain, FileText, Map, StickyNote, Star,
  Plus, Target, BookOpen, Award, Shield, ChevronRight
} from 'lucide-react';

const STUDY_TIMES = ['morning', 'afternoon', 'evening', 'night', 'flexible'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'];

const ACHIEVEMENT_META: Record<string, { icon: string; color: string; desc: string }> = {
  '7day_streak':      { icon: '🔥', color: '#EF4444', desc: 'Study 7 days in a row' },
  '30day_streak':     { icon: '⚡', color: '#F59E0B', desc: 'Study 30 days in a row' },
  '100_hours':        { icon: '⏰', color: '#06B6D4', desc: 'Log 100 study hours' },
  'quiz_master':      { icon: '🧠', color: '#8B5CF6', desc: 'Complete 10 quizzes' },
  'roadmap_explorer': { icon: '🗺️', color: '#10B981', desc: 'Create 3 roadmaps' },
  'fast_learner':     { icon: '🚀', color: '#5B5FEF', desc: 'Earn 500 XP' },
  'ai_explorer':      { icon: '🤖', color: '#7C3AED', desc: 'Send 20 AI messages' },
  'pdf_genius':       { icon: '📄', color: '#EC4899', desc: 'Upload 5 PDFs' },
  'note_taker':       { icon: '📝', color: '#F59E0B', desc: 'Create 10 notes' },
};

const ALL_ACHIEVEMENTS = Object.entries(ACHIEVEMENT_META).map(([id, meta]) => ({ id, ...meta, label: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }));

const S = { display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' };

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const [form, setForm] = useState({
    name: '', bio: '', college: '', course: '', year: '',
    preferredStudyTime: 'morning', skills: [] as string[], learningGoals: [] as string[],
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name, bio: user.bio || '', college: user.college || '', course: user.course || '', year: user.year || '', preferredStudyTime: user.preferredStudyTime || 'morning', skills: user.skills || [], learningGoals: user.learningGoals || [] });
    api.get('/user/stats').then(r => setStats(r.data)).catch(() => {});
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', form);
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match');
    if (pw.next.length < 6) return toast.error('Min 6 characters');
    try {
      await api.patch('/user/password', { currentPassword: pw.current, newPassword: pw.next });
      toast.success('Password changed!');
      setPwModal(false);
      setPw({ current: '', next: '', confirm: '' });
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/user/account');
      logout();
      navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };

  const addGoal = () => {
    const g = goalInput.trim();
    if (g && !form.learningGoals.includes(g)) setForm(f => ({ ...f, learningGoals: [...f.learningGoals, g] }));
    setGoalInput('');
  };

  const xpToNext = (user?.level || 1) * 100;
  const xpPct = Math.min(100, ((user?.xp || 0) % xpToNext) / xpToNext * 100);
  const earned = stats?.achievements || user?.achievements || [];
  const earnedIds = earned.map((a: any) => a.id);

  const STAT_ITEMS = [
    { label: 'Study Streak', value: `${stats?.streak ?? user?.streak ?? 0}d`, icon: Flame, color: '#EF4444' },
    { label: 'Study Hours', value: `${stats?.totalStudyHours ?? 0}h`, icon: Clock, color: '#06B6D4' },
    { label: 'AI Chats', value: stats?.aiChats ?? user?.aiChats ?? 0, icon: Brain, color: '#5B5FEF' },
    { label: 'PDFs Uploaded', value: stats?.pdfsUploaded ?? user?.pdfsUploaded ?? 0, icon: FileText, color: '#7C3AED' },
    { label: 'Quizzes Done', value: stats?.quizzesCompleted ?? 0, icon: Brain, color: '#8B5CF6' },
    { label: 'Roadmaps', value: stats?.roadmapsCreated ?? 0, icon: Map, color: '#10B981' },
    { label: 'Notes', value: stats?.notesCreated ?? 0, icon: StickyNote, color: '#F59E0B' },
    { label: 'Flashcards', value: stats?.flashcardsGenerated ?? user?.flashcardsGenerated ?? 0, icon: BookOpen, color: '#EC4899' },
  ];

  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card"
        style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(91,95,239,0.07), rgba(124,58,237,0.04))', border: '1px solid rgba(91,95,239,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,95,239,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', border: '3px solid rgba(91,95,239,0.3)', boxShadow: '0 8px 24px rgba(91,95,239,0.3)' }}>
              {user.name[0].toUpperCase()}
            </div>
            <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Camera size={12} color="white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{user.name}</h1>
              <span className="badge badge-primary"><Zap size={10} /> Lv.{user.level}</span>
              {earned.length > 0 && <span className="badge badge-warning"><Star size={10} fill="currentColor" /> {earned.length} badges</span>}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.25rem' }}>{user.email}</p>
            {user.college && <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{user.college} {user.course && `· ${user.course}`} {user.year && `· ${user.year}`}</p>}
            {user.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.5rem', lineHeight: 1.6 }}>{user.bio}</p>}
            <div style={{ marginTop: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.375rem' }}>
                <span>{user.xp} XP</span><span>{xpToNext - ((user.xp || 0) % xpToNext)} to Lv.{user.level + 1}</span>
              </div>
              <ProgressBar value={xpPct} height={5} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {editing ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : <><Save size={13} /> Save</>}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
              </>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit3 size={13} /> Edit</button>
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Edit Form */}
          {editing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Edit Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={S}><label className="input-label">Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div style={S}><label className="input-label">Bio</label><textarea className="input" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={S}><label className="input-label">College</label><input className="input" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} /></div>
                  <div style={S}><label className="input-label">Course</label><input className="input" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={S}><label className="input-label">Year</label>
                    <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                      <option value="">Select</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div style={S}><label className="input-label">Study Time</label>
                    <select className="input" value={form.preferredStudyTime} onChange={e => setForm(f => ({ ...f, preferredStudyTime: e.target.value }))}>
                      {STUDY_TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Skills */}
                <div style={S}>
                  <label className="input-label">Skills</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input" placeholder="Add skill…" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 1 }} />
                    <button className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={13} /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.375rem' }}>
                    {form.skills.map(s => (
                      <span key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}>{s} <X size={10} /></span>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div style={S}>
                  <label className="input-label">Learning Goals</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input" placeholder="Add goal…" value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} style={{ flex: 1 }} />
                    <button className="btn btn-secondary btn-sm" onClick={addGoal}><Plus size={13} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.375rem' }}>
                    {form.learningGoals.map(g => (
                      <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.625rem', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                        <Target size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{g}</span>
                        <button onClick={() => setForm(f => ({ ...f, learningGoals: f.learningGoals.filter(x => x !== g) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {STAT_ITEMS.map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills & Goals display */}
          {!editing && (user.skills?.length > 0 || user.learningGoals?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: '1.5rem' }}>
              {user.skills?.length > 0 && (
                <div style={{ marginBottom: user.learningGoals?.length > 0 ? '1rem' : 0 }}>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.625rem' }}>Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {user.skills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
              )}
              {user.learningGoals?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.625rem' }}>Learning Goals</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {user.learningGoals.map(g => (
                      <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                        <Target size={12} color="var(--primary)" />{g}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* XP Ring */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <ProgressRing value={xpPct} size={100} strokeWidth={9} color="#5B5FEF">
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>{user.level}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</p>
              </div>
            </ProgressRing>
            <p style={{ marginTop: '0.875rem', fontWeight: 700, fontSize: '0.9rem' }}>{user.xp} XP total</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{xpToNext - ((user.xp || 0) % xpToNext)} XP to next level</p>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Award size={16} color="var(--primary)" />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Achievements</h2>
              <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{earnedIds.length}/{ALL_ACHIEVEMENTS.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ALL_ACHIEVEMENTS.map(a => {
                const unlocked = earnedIds.includes(a.id);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 10, background: unlocked ? `${a.color}10` : 'var(--surface-2)', border: `1px solid ${unlocked ? a.color + '25' : 'var(--border)'}`, opacity: unlocked ? 1 : 0.5, transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{a.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: unlocked ? 'var(--text)' : 'var(--text-3)' }}>{a.label}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{a.desc}</p>
                    </div>
                    {unlocked && <span style={{ fontSize: '0.65rem', fontWeight: 600, color: a.color, background: `${a.color}15`, padding: '0.15rem 0.5rem', borderRadius: 99 }}>Earned</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={16} color="var(--primary)" />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Account</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { icon: dark ? Sun : Moon, label: dark ? 'Switch to Light Mode' : 'Switch to Dark Mode', onClick: toggle, color: '#F59E0B' },
                { icon: Lock, label: 'Change Password', onClick: () => setPwModal(true), color: '#5B5FEF' },
                { icon: LogOut, label: 'Sign Out', onClick: () => { logout(); navigate('/login'); }, color: '#EF4444' },
                { icon: Trash2, label: 'Delete Account', onClick: () => setDelModal(true), color: '#EF4444', danger: true },
              ].map(({ icon: Icon, label, onClick, color, danger }) => (
                <button key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 10, background: 'none', border: '1px solid transparent', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s', color: danger ? 'var(--danger)' : 'var(--text-2)', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = danger ? 'rgba(239,68,68,0.15)' : 'var(--border)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                  <Icon size={15} color={color} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ChevronRight size={13} color="var(--text-3)" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
            <div key={key} style={S}>
              <label className="input-label">{label}</label>
              <input className="input" type="password" value={pw[key as keyof typeof pw]} onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={changePassword} style={{ marginTop: '0.5rem' }}>Update Password</button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal open={delModal} onClose={() => setDelModal(false)} title="Delete Account">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={22} color="var(--danger)" />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>This will permanently delete your account and all data. This cannot be undone.</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDelModal(false)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={deleteAccount}>Delete Forever</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

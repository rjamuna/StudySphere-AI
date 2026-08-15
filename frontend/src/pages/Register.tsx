import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Spinner } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome to StudySphere AI! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.4,0,0.2,1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(91,95,239,0.4)' }}>
            <Sparkles size={24} color="white" />
          </motion.div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>Create your account</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Join thousands of learners on <span style={{ color: 'var(--primary)', fontWeight: 600 }}>StudySphere AI</span></p>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="name">Full Name</label>
              <input id="name" className="input" value={form.name} onChange={set('name')} placeholder="Your full name" required autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" className="input" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min. 6 characters" required style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password visibility"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: '0.25rem' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button className="btn btn-primary" type="submit" disabled={loading}
              whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', fontSize: '0.9375rem', gap: '0.5rem' }}>
              {loading ? <><Spinner size={16} /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}

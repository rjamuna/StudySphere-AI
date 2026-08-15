import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react';
import api from '../../lib/api';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Dashboard',     subtitle: 'Your learning overview' },
  '/tutor':         { title: 'AI Tutor',       subtitle: 'Ask anything, learn everything' },
  '/pdf':           { title: 'PDF Learning',   subtitle: 'Upload & learn from documents' },
  '/roadmap':       { title: 'Roadmap',        subtitle: 'Personalized learning paths' },
  '/planner':       { title: 'Study Planner',  subtitle: 'Organize your study sessions' },
  '/quiz':          { title: 'Quiz',           subtitle: 'Test your knowledge' },
  '/notes':         { title: 'Notes',          subtitle: 'Capture your thoughts' },
  '/profile':       { title: 'Profile',        subtitle: 'Manage your account' },
  '/history':       { title: 'Chat History',   subtitle: 'All your conversations' },
  '/activity':      { title: 'Activity',       subtitle: 'Your learning timeline' },
  '/notifications': { title: 'Notifications',  subtitle: 'Stay up to date' },
  '/bookmarks':     { title: 'Bookmarks',      subtitle: 'Your saved content' },
  '/search':        { title: 'Search',         subtitle: 'Find anything instantly' },
  '/achievements':  { title: 'Achievements',   subtitle: 'Your earned badges' },
  '/settings':      { title: 'Settings',       subtitle: 'Customize your experience' },
};

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const page = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/history') ? { title: 'Chat History', subtitle: 'All your conversations' } : { title: 'StudySphere', subtitle: '' });

  useEffect(() => {
    api.get('/notifications').then(r => setUnread(r.data.unread || 0)).catch(() => {});
  }, [location.pathname]);

  return (
    <header style={{
      height: 'var(--topnav-h)', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button className="btn-icon show-mobile-only" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={18} />
        </button>
        <div className="hide-mobile">
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{page.title}</h1>
          {page.subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1 }}>{page.subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        {/* Search */}
        <button className="btn-icon tooltip" onClick={() => navigate('/search')} aria-label="Search">
          <Search size={16} />
          <span className="tooltip-content">Search</span>
        </button>

        {/* Theme toggle */}
        <button className="btn-icon tooltip" onClick={toggle} aria-label="Toggle theme">
          <AnimatePresence mode="wait">
            <motion.div key={dark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </AnimatePresence>
          <span className="tooltip-content">{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Notifications */}
        <button className="btn-icon tooltip" onClick={() => navigate('/notifications')} aria-label="Notifications" style={{ position: 'relative' }}>
          <Bell size={16} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          <span className="tooltip-content">Notifications</span>
        </button>

        {/* User avatar */}
        {user && (
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0.625rem', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user.name[0].toUpperCase()}
            </div>
            <div className="hide-mobile" style={{ lineHeight: 1.2 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{user.name.split(' ')[0]}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Lv.{user.level}</p>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

export default function Layout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
          </svg>
        </div>
        <div className="dot-loader"><span /><span /><span /></div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 'var(--sidebar-w)', minWidth: 0, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto', maxWidth: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

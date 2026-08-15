import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Bot, FileText, Map, CalendarDays, Brain, StickyNote,
  LogOut, Zap, Star, Sparkles, Flame, ChevronLeft, ChevronRight,
  User, History, Activity, Bell, Bookmark, Search, Award, Settings
} from 'lucide-react';
import { useState } from 'react';

const NAV_MAIN = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',    color: '#5B5FEF' },
  { to: '/tutor',     icon: Bot,             label: 'AI Tutor',     color: '#7C3AED' },
  { to: '/pdf',       icon: FileText,        label: 'PDF Learning', color: '#06B6D4' },
  { to: '/roadmap',   icon: Map,             label: 'Roadmap',      color: '#10B981' },
  { to: '/planner',   icon: CalendarDays,    label: 'Study Planner',color: '#F59E0B' },
  { to: '/quiz',      icon: Brain,           label: 'Quiz',         color: '#EF4444' },
  { to: '/notes',     icon: StickyNote,      label: 'Notes',        color: '#8B5CF6' },
];

const NAV_EXTRA = [
  { to: '/history',      icon: History,  label: 'Chat History',  color: '#5B5FEF' },
  { to: '/activity',     icon: Activity, label: 'Activity',      color: '#06B6D4' },
  { to: '/notifications',icon: Bell,     label: 'Notifications', color: '#F59E0B' },
  { to: '/bookmarks',    icon: Bookmark, label: 'Bookmarks',     color: '#EC4899' },
  { to: '/search',       icon: Search,   label: 'Search',        color: '#10B981' },
  { to: '/achievements', icon: Award,    label: 'Achievements',  color: '#F59E0B' },
];

const BOTTOM_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/tutor',     icon: Bot,             label: 'Tutor' },
  { to: '/quiz',      icon: Brain,           label: 'Quiz' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/profile',   icon: User,            label: 'Profile' },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

function NavItem({ to, icon: Icon, label, color, collapsed, onClick }: any) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <div className="tooltip" style={{ position: 'relative' }}>
      <NavLink to={to} onClick={onClick}
        className={`nav-item ${isActive ? 'active' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.625rem' : '0.5625rem 0.75rem' }}>
        <span className="nav-icon" style={{ color: isActive ? color : undefined, flexShrink: 0 }}>
          <Icon size={17} />
        </span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span className="nav-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ fontSize: '0.875rem' }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
      {collapsed && <span className="tooltip-content" style={{ left: 'calc(100% + 12px)', bottom: 'auto', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>{label}</span>}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const xpToNext = (user?.level || 1) * 100;
  const xpPct = Math.min(100, ((user?.xp || 0) % xpToNext) / xpToNext * 100);
  const handleLogout = () => { logout(); navigate('/login'); onClose(); };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div style={{ padding: collapsed && !mobile ? '1.25rem 0' : '1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: collapsed && !mobile ? 'center' : 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(91,95,239,0.35)' }}>
            <Sparkles size={16} color="white" />
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <p className="sidebar-logo-text" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>StudySphere</p>
                <p className="sidebar-logo-text" style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1 }}>AI Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!mobile && !collapsed && (
          <button className="btn-icon" onClick={() => setCollapsed(true)} style={{ padding: '0.3rem', width: 26, height: 26 }}>
            <ChevronLeft size={14} />
          </button>
        )}
        {mobile && <button className="btn-icon" onClick={onClose}><ChevronLeft size={16} /></button>}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && !mobile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
          <button className="btn-icon" onClick={() => setCollapsed(false)} style={{ padding: '0.3rem', width: 26, height: 26 }}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {(!collapsed || mobile) && <p className="sidebar-section-label" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.75rem 0.5rem' }}>Learn</p>}
        {NAV_MAIN.map(item => <NavItem key={item.to} {...item} collapsed={collapsed && !mobile} onClick={onClose} />)}

        <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0.5rem' }} />

        {(!collapsed || mobile) && <p className="sidebar-section-label" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.75rem 0.5rem' }}>Manage</p>}
        {NAV_EXTRA.map(item => <NavItem key={item.to} {...item} collapsed={collapsed && !mobile} onClick={onClose} />)}
      </nav>

      {/* User Profile */}
      {user && (
        <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {(!collapsed || mobile) && (
            <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
              <NavLink to="/profile" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem', textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{user.name}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Flame size={10} color="#EF4444" /> {user.streak}d</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Star size={10} color="#F59E0B" fill="#F59E0B" /> Lv.{user.level}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Zap size={10} color="#5B5FEF" /> {user.xp}</span>
                  </div>
                </div>
              </NavLink>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #5B5FEF, #7C3AED)', borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>{xpToNext - ((user.xp || 0) % xpToNext)} XP to next level</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <NavLink to="/settings" onClick={onClose} className="nav-item" style={{ flex: 1, justifyContent: collapsed && !mobile ? 'center' : 'flex-start', padding: collapsed && !mobile ? '0.625rem' : '0.5625rem 0.75rem' }}>
              <Settings size={15} style={{ flexShrink: 0 }} />
              {(!collapsed || mobile) && <span className="nav-label">Settings</span>}
            </NavLink>
            <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--danger)', justifyContent: 'center', padding: '0.5625rem 0.75rem', flex: collapsed && !mobile ? 1 : 'none' }}>
              <LogOut size={15} style={{ flexShrink: 0 }} />
              {(!collapsed || mobile) && <span className="nav-label">Sign Out</span>}
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar hide-mobile ${isOpen ? 'open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}
        style={{ width: collapsed ? 72 : 'var(--sidebar-w)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`sidebar show-mobile-only ${isOpen ? 'open' : ''}`} style={{ width: 'var(--sidebar-w)' }}>
        <SidebarContent mobile />
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

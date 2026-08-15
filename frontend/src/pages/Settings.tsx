import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sun, Moon, Bell, Shield, Download, Palette, Type, Globe, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'data', label: 'Data & Export', icon: Download },
  { id: 'language', label: 'Language', icon: Globe },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 99, background: value ? 'var(--primary)' : 'var(--surface-3)', border: `1px solid ${value ? 'var(--primary)' : 'var(--border-2)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.25s', flexShrink: 0 }}>
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: desc ? '0.2rem' : 0 }}>{label}</p>
        {desc && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { dark, toggle } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('appearance');
  const [fontSize, setFontSize] = useState('medium');
  const [notifs, setNotifs] = useState({ email: true, push: true, reminders: true, achievements: true, weekly: false });
  const [privacy, setPrivacy] = useState({ analytics: true, suggestions: true });

  const exportData = () => { toast.success('Data export started — check your email shortly'); };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card"
        style={{ width: 200, flexShrink: 0, padding: '0.75rem', position: 'sticky', top: 80 }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.5rem 0.625rem' }}>Settings</p>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSection(id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: 9, width: '100%', background: section === id ? 'linear-gradient(135deg, rgba(91,95,239,0.1), rgba(124,58,237,0.07))' : 'none', border: `1px solid ${section === id ? 'rgba(91,95,239,0.18)' : 'transparent'}`, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, color: section === id ? 'var(--primary)' : 'var(--text-2)', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left', marginBottom: '0.125rem' }}
            onMouseEnter={e => { if (section !== id) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { if (section !== id) (e.currentTarget as HTMLElement).style.background = 'none'; }}>
            <Icon size={15} style={{ flexShrink: 0 }} />{label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="card" style={{ flex: 1, padding: '1.5rem' }}>

        {section === 'appearance' && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Appearance</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>Customize how StudySphere looks</p>

            <SettingRow label="Dark Mode" desc="Switch between light and dark theme">
              <Toggle value={dark} onChange={toggle} />
            </SettingRow>

            <SettingRow label="Theme" desc="Choose your color theme">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[{ color: '#5B5FEF', name: 'Indigo' }, { color: '#7C3AED', name: 'Purple' }, { color: '#06B6D4', name: 'Cyan' }, { color: '#10B981', name: 'Green' }].map(t => (
                  <button key={t.name} title={t.name} style={{ width: 24, height: 24, borderRadius: '50%', background: t.color, border: t.color === '#5B5FEF' ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'} />
                ))}
              </div>
            </SettingRow>

            <SettingRow label="Font Size" desc="Adjust the text size">
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {['small', 'medium', 'large'].map(s => (
                  <button key={s} onClick={() => setFontSize(s)}
                    style={{ padding: '0.3rem 0.625rem', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'inherit', background: fontSize === s ? 'var(--primary)' : 'var(--surface-2)', color: fontSize === s ? 'white' : 'var(--text-2)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </SettingRow>
          </>
        )}

        {section === 'notifications' && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Notifications</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>Control what notifications you receive</p>
            <SettingRow label="Email Notifications" desc="Receive updates via email"><Toggle value={notifs.email} onChange={v => setNotifs(n => ({ ...n, email: v }))} /></SettingRow>
            <SettingRow label="Push Notifications" desc="Browser push notifications"><Toggle value={notifs.push} onChange={v => setNotifs(n => ({ ...n, push: v }))} /></SettingRow>
            <SettingRow label="Study Reminders" desc="Daily study session reminders"><Toggle value={notifs.reminders} onChange={v => setNotifs(n => ({ ...n, reminders: v }))} /></SettingRow>
            <SettingRow label="Achievement Alerts" desc="Get notified when you earn badges"><Toggle value={notifs.achievements} onChange={v => setNotifs(n => ({ ...n, achievements: v }))} /></SettingRow>
            <SettingRow label="Weekly Summary" desc="Weekly progress report email"><Toggle value={notifs.weekly} onChange={v => setNotifs(n => ({ ...n, weekly: v }))} /></SettingRow>
            <div style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</button>
            </div>
          </>
        )}

        {section === 'privacy' && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Privacy</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>Manage your data and privacy settings</p>
            <SettingRow label="Usage Analytics" desc="Help improve StudySphere by sharing anonymous usage data"><Toggle value={privacy.analytics} onChange={v => setPrivacy(p => ({ ...p, analytics: v }))} /></SettingRow>
            <SettingRow label="AI Suggestions" desc="Allow AI to personalize suggestions based on your activity"><Toggle value={privacy.suggestions} onChange={v => setPrivacy(p => ({ ...p, suggestions: v }))} /></SettingRow>
            <SettingRow label="AI Memory" desc="Allow AI to remember context from previous conversations">
              <Toggle value={true} onChange={() => toast('AI memory helps personalize your experience')} />
            </SettingRow>
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.375rem' }}>Danger Zone</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.875rem' }}>These actions are irreversible. Please be careful.</p>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                <button className="btn btn-danger btn-sm" onClick={() => navigate('/profile')}>Delete Account</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
              </div>
            </div>
          </>
        )}

        {section === 'data' && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Data & Export</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>Download or manage your data</p>
            {[
              { label: 'Export All Data', desc: 'Download a complete copy of your data as JSON', action: exportData },
              { label: 'Export Notes', desc: 'Download all your notes as Markdown files', action: () => toast.success('Notes export started') },
              { label: 'Export Roadmaps', desc: 'Download your roadmaps as PDF', action: () => toast.success('Roadmaps export started') },
              { label: 'Download Quiz Results', desc: 'Get all quiz results as CSV', action: () => toast.success('Quiz results export started') },
            ].map(({ label, desc, action }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{desc}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={action}><Download size={13} /> Export</button>
              </div>
            ))}
          </>
        )}

        {section === 'language' && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Language</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>Choose your preferred language</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[['English', 'en', true], ['Spanish', 'es', false], ['French', 'fr', false], ['German', 'de', false], ['Japanese', 'ja', false], ['Chinese', 'zh', false]].map(([lang, code, active]) => (
                <button key={code as string} onClick={() => active ? null : toast('More languages coming soon!')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 10, border: `1px solid ${active ? 'rgba(91,95,239,0.25)' : 'var(--border)'}`, background: active ? 'rgba(91,95,239,0.06)' : 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, color: active ? 'var(--primary)' : 'var(--text)' }}>{lang as string}</span>
                  {active && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(91,95,239,0.1)', padding: '0.15rem 0.5rem', borderRadius: 99 }}>Active</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

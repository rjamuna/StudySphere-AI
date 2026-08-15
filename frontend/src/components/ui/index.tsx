import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, glow = false, onClick, style }: {
  children: ReactNode; className?: string; hover?: boolean;
  glow?: boolean; onClick?: () => void; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={`card ${hover ? 'card-hover' : ''} ${glow ? 'card-glow' : ''} ${onClick ? 'card-interactive' : ''} ${className}`}
      style={style} onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, change, color = '#5B5FEF', loading = false, suffix = '' }: {
  icon: ReactNode; label: string; value: string | number;
  change?: string; color?: string; loading?: boolean; suffix?: string;
}) {
  if (loading) return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="skeleton" style={{ height: 40, width: 40, borderRadius: 12, marginBottom: '0.875rem' }} />
      <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: '0.5rem', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 26, width: '40%', borderRadius: 6 }} />
    </div>
  );

  return (
    <motion.div className="card card-hover" style={{ padding: '1.25rem', cursor: 'default' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', color, border: `1px solid ${color}20` }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.25rem', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}{suffix}
      </p>
      {change && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.375rem', fontWeight: 500 }}>{change}</p>}
    </motion.div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.03em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description: string; action?: ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--text-3)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', maxWidth: 300, lineHeight: 1.6, marginBottom: action ? '1.5rem' : 0 }}>{description}</p>
      {action}
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width, height, radius = 8, style }: { width?: string | number; height?: string | number; radius?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <Skeleton height={16} width="60%" radius={6} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${80 - i * 15}%`} radius={5} />
      ))}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'primary' }: { children: ReactNode; variant?: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color, height = 6 }: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress-bar" style={{ height }}>
      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={color ? { background: color } : undefined} />
    </div>
  );
}

// ── ProgressRing ──────────────────────────────────────────────────────────────
export function ProgressRing({ value, size = 80, strokeWidth = 7, color = '#5B5FEF', children }: {
  value: number; size?: number; strokeWidth?: number; color?: string; children?: ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(100, value) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="stat-ring">
        <circle className="stat-ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={strokeWidth} />
        <motion.circle className="stat-ring-fill" cx={size/2} cy={size/2} r={r} strokeWidth={strokeWidth}
          stroke={color} strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} />
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 520 }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: number;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `min(${maxWidth}px, calc(100vw - 2rem))`, zIndex: 200, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{title}</h2>
                <button className="btn-icon" onClick={onClose} style={{ width: 28, height: 28, padding: '0.25rem' }}><X size={15} /></button>
              </div>
            )}
            <div style={{ padding: '1.5rem' }}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${color}30`, borderTopColor: color, display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: ReactNode }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s', background: active === tab.id ? 'var(--surface)' : 'transparent', color: active === tab.id ? 'var(--text)' : 'var(--text-2)', boxShadow: active === tab.id ? 'var(--shadow-sm)' : 'none' }}>
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  );
}

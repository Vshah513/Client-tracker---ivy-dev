import { useEffect, useRef } from 'react';
import { CLIENT_STATUSES, HEALTH_STATUSES, PRIORITY_OPTIONS, TEAM_MEMBERS } from '../data/schema';

// ─── Stat Card ───
export function StatCard({ icon: Icon, label, value, prefix = '', color, delay = 0 }) {
  return (
    <div className={`stat-card animate-slide-up stagger-${delay + 1}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && <div className="stat-card-icon" style={{ background: `${color}15`, color }}><Icon size={18} /></div>}
      </div>
      <div className="stat-card-value" style={{ color }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// ─── Progress Ring ───
export function ProgressRing({ percentage = 0, size = 56, strokeWidth = 4, color }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;
  const ringColor = color || (percentage >= 80 ? 'var(--accent)' : percentage >= 50 ? 'var(--warning)' : 'var(--text-muted)');
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ringColor} strokeWidth={strokeWidth}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size * 0.22, fontWeight: 800, fill: 'var(--text-primary)' }}>
        {percentage}%
      </text>
    </svg>
  );
}

// ─── Status Badge ───
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{CLIENT_STATUSES.find(s => s.value === status)?.label || status}</span>;
}

// ─── Health Badge ───
export function HealthBadge({ health }) {
  const h = HEALTH_STATUSES.find(s => s.value === health);
  if (!h) return null;
  return <span className={`health-badge health-${health}`}>{h.icon} {h.label}</span>;
}

// ─── Priority Chip ───
export function PriorityChip({ priority }) {
  const p = PRIORITY_OPTIONS.find(x => x.value === priority);
  if (!p) return null;
  return <span className="priority-chip"><span className="priority-dot" style={{ background: p.color }} />{p.label}</span>;
}

// ─── Assignee Avatar ───
export function AssigneeAvatar({ assignee, size = 'sm' }) {
  const m = TEAM_MEMBERS.find(x => x.id === assignee);
  if (!m) return null;
  return <div className={`avatar avatar-${m.id} avatar-${size}`} title={m.name}>{m.initials}</div>;
}

// ─── Modal ───
export function Modal({ isOpen, onClose, title, children, footer, wide }) {
  const ref = useRef();
  useEffect(() => {
    if (isOpen) {
      const handler = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" ref={ref} style={wide ? { maxWidth: 800 } : {}}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-ghost btn-icon" onClick={onClose} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Blocker Badge ───
export function BlockerBadge({ text }) {
  return <span className="blocker-badge">⚠ {text || 'Blocked'}</span>;
}

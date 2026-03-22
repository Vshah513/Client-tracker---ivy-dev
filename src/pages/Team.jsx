import { useClients } from '../context/AppContext';
import { getMemberStats, formatCurrency, getDaysUntil, formatDate } from '../utils/helpers';
import { TEAM_MEMBERS } from '../data/schema';
import { ProgressRing, AssigneeAvatar, PriorityChip } from '../components/UIComponents';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckSquare, Users, AlertTriangle, Target, Code, Calendar, Briefcase } from 'lucide-react';

export default function Team() {
  const { clients } = useClients();
  const navigate = useNavigate();

  const members = TEAM_MEMBERS.map(m => ({ ...m, stats: getMemberStats(clients, m.id) }));

  return (
    <div className="page">
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Team</h1>
        <p className="page-subtitle">Workload, tasks, and assignments for Viraj & Ishan</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {members.map(m => (
          <div key={m.id} className="glass-card-static animate-slide-up stagger-1" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className={`avatar avatar-${m.id} avatar-xl`}>{m.initials}</div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{m.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.role}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="team-stats" style={{ marginBottom: 20 }}>
              <div className="team-stat"><div className="team-stat-value" style={{ color: 'var(--accent)' }}>{m.stats.done}</div><div className="team-stat-label">Completed</div></div>
              <div className="team-stat"><div className="team-stat-value">{m.stats.inProgress}</div><div className="team-stat-label">In Progress</div></div>
              <div className="team-stat"><div className="team-stat-value" style={{ color: m.stats.overdue > 0 ? 'var(--danger)' : undefined }}>{m.stats.overdue}</div><div className="team-stat-label">Overdue</div></div>
              <div className="team-stat"><div className="team-stat-value">{m.stats.totalHours}h</div><div className="team-stat-label">Logged</div></div>
            </div>

            {/* Workload Gauge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <ProgressRing percentage={m.stats.completion} size={80} strokeWidth={5} />
            </div>

            {/* Assigned Clients */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Assigned Clients: {m.stats.assignedClients}</div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Pages Owned: {m.stats.pages.length}</div>
            </div>

            {/* Upcoming Deadlines */}
            {m.stats.upcomingDeadlines.length > 0 && (
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> Due This Week</div>
                {m.stats.upcomingDeadlines.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate(`/clients/${t.clientId}`)}>
                    <PriorityChip priority={t.priority} />
                    <span style={{ flex: 1, fontSize: '0.75rem' }}>{t.title}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{t.clientName}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--warning)' }}>{getDaysUntil(t.deadline)}d</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Workload Comparison */}
      <div className="glass-card-static animate-slide-up stagger-2" style={{ padding: 20 }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 16 }}>Workload Comparison</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {['Tasks', 'Pages', 'Hours Logged', 'Est. Hours'].map(metric => (
            <div key={metric} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>{metric}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {members.map(m => {
                  const val = metric === 'Tasks' ? m.stats.total : metric === 'Pages' ? m.stats.pages.length : metric === 'Hours Logged' ? m.stats.totalHours : m.stats.estHours;
                  const max = Math.max(...members.map(mm => {
                    const mms = mm.stats;
                    return metric === 'Tasks' ? mms.total : metric === 'Pages' ? mms.pages.length : metric === 'Hours Logged' ? mms.totalHours : mms.estHours;
                  })) || 1;
                  return (
                    <div key={m.id} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AssigneeAvatar assignee={m.id} size="sm" />
                      <div style={{ flex: 1 }}>
                        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(val / max) * 100}%`, background: m.id === 'viraj' ? 'var(--accent)' : 'var(--accent-secondary)' }} /></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 30 }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

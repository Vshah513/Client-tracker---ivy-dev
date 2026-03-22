import { ProgressRing, AssigneeAvatar, HealthBadge } from '../UIComponents';
import { formatCurrency, formatDate, formatShortDate, getDaysUntil, getFinancialsPending, getTaskStats, getScopeCreepWarning } from '../../utils/helpers';
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Target, Users, Code, Calendar } from 'lucide-react';

export default function OverviewTab({ client, dispatch, progress, msProgress, pending }) {
  const taskStats = getTaskStats(client.tasks || []);
  const scopeCreep = getScopeCreepWarning(client);
  const daysLeft = getDaysUntil(client.targetDate);
  const virajPages = (client.pages || []).filter(p => p.owner === 'viraj');
  const ishanPages = (client.pages || []).filter(p => p.owner === 'ishan');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Warning Banners */}
        {scopeCreep && (
          <div style={{ padding: '12px 16px', background: scopeCreep === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${scopeCreep === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem' }}>
            <AlertTriangle size={16} style={{ color: scopeCreep === 'critical' ? 'var(--danger)' : 'var(--warning)' }} />
            <span style={{ color: scopeCreep === 'critical' ? 'var(--danger)' : 'var(--warning)' }}>
              <strong>Scope Creep {scopeCreep === 'critical' ? 'Alert' : 'Warning'}:</strong> {(client.scope?.changeRequests || []).filter(cr => cr.approved).length} approved change requests
            </span>
          </div>
        )}
        {daysLeft !== null && daysLeft < 0 && client.status !== 'completed' && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: 'var(--danger)' }}>
            <Clock size={16} /> <strong>Overdue:</strong> Target delivery was {Math.abs(daysLeft)} days ago
          </div>
        )}

        {/* Project Summary */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Project Summary</h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{client.description || 'No description yet.'}</p>
          {client.businessGoal && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(6,214,160,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>Business Goal</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{client.businessGoal}</div>
            </div>
          )}
          {client.targetAudience && (
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}><strong>Audience:</strong> {client.targetAudience}</div>
          )}
        </div>

        {/* Key Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="glass-card-static" style={{ padding: 14, textAlign: 'center' }}>
            <ProgressRing percentage={progress} size={48} strokeWidth={3} />
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 6 }}>Page Progress</div>
          </div>
          <div className="glass-card-static" style={{ padding: 14, textAlign: 'center' }}>
            <ProgressRing percentage={msProgress} size={48} strokeWidth={3} color="var(--accent-secondary)" />
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 6 }}>Milestones</div>
          </div>
          <div className="glass-card-static" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{taskStats.done}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/{taskStats.total}</span></div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 6 }}>Tasks Done</div>
          </div>
          <div className="glass-card-static" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pending > 0 ? 'var(--warning)' : 'var(--accent)' }}>{formatCurrency(pending)}</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 6 }}>Outstanding</div>
          </div>
        </div>

        {/* Work Split */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Work Split</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{ id: 'viraj', pages: virajPages }, { id: 'ishan', pages: ishanPages }].map(({ id, pages }) => (
              <div key={id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AssigneeAvatar assignee={id} size="sm" />
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{id === 'viraj' ? 'Viraj' : 'Ishan'}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{pages.length} pages</span>
                </div>
                {pages.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.75rem' }}>
                    <span style={{ flex: 1, color: 'var(--text-tertiary)' }}>{p.name}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.6875rem', color: p.progress === 100 ? 'var(--accent)' : 'var(--text-muted)' }}>{p.progress}%</span>
                  </div>
                ))}
                {pages.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No pages assigned</div>}
              </div>
            ))}
          </div>
        </div>

        {/* What's Remaining */}
        {client.status !== 'completed' && (
          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} /> What's Remaining
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(client.tasks || []).filter(t => t.status !== 'done').slice(0, 5).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', padding: '6px 0' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.blocker ? 'var(--danger)' : t.priority === 'high' ? 'var(--warning)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{t.title}</span>
                  <AssigneeAvatar assignee={t.assignee} />
                </div>
              ))}
              {(client.pages || []).filter(p => p.progress < 100).slice(0, 3).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', padding: '6px 0' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--info)', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{p.name} — {p.progress}%</span>
                  <AssigneeAvatar assignee={p.owner} />
                </div>
              ))}
              {(client.tasks || []).filter(t => t.status !== 'done').length === 0 && (client.pages || []).filter(p => p.progress < 100).length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: '0.8125rem' }}><CheckCircle2 size={14} /> All caught up!</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Quick Info */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Details</h4>
          {[
            { label: 'Project Type', value: client.projectType, icon: Code },
            { label: 'Start Date', value: formatDate(client.startDate), icon: Calendar },
            { label: 'Target Delivery', value: client.targetDate ? `${formatShortDate(client.targetDate)}${daysLeft !== null ? ` (${daysLeft > 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d overdue`})` : ''}` : '—', icon: Clock },
            { label: 'Launch Date', value: formatDate(client.launchDate), icon: CheckCircle2 },
            { label: 'Revisions', value: client.revisionCount || 0, icon: AlertTriangle },
            { label: 'Tech Stack', value: client.techStack || '—', icon: Code },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={12} /> {label}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14} /> Financial Summary</h4>
          <div style={{ marginBottom: 12 }}>
            <div className="flex-between" style={{ marginBottom: 6, fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Collected</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(client.financials?.totalReceived)} / {formatCurrency(client.financials?.totalAgreed)}</span>
            </div>
            <div className="financial-bar">
              <div className="financial-bar-segment financial-bar-received" style={{ width: `${client.financials?.totalAgreed ? (client.financials.totalReceived / client.financials.totalAgreed * 100) : 0}%` }} />
            </div>
          </div>
          {[
            { label: 'Agreed', value: formatCurrency(client.financials?.totalAgreed) },
            { label: 'Received', value: formatCurrency(client.financials?.totalReceived) },
            { label: 'Outstanding', value: formatCurrency(pending) },
            { label: 'Deposit', value: client.financials?.depositPaid ? `✓ ${formatCurrency(client.financials.depositAmount)}` : 'Pending' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Competitors */}
        {client.competitors && (
          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 10 }}>Inspiration / Competitors</h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{client.competitors}</div>
          </div>
        )}
      </div>
    </div>
  );
}

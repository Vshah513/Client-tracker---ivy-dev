import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import { StatCard, HealthBadge, StatusBadge, ProgressRing, AssigneeAvatar } from '../components/UIComponents';
import TeamBoard from '../components/TeamBoard';
import { getBusinessFinancials, getOverdueTasks, getDueThisWeek, getBlockedTasks, getAtRiskClients, getWaitingOnClient, getRecentActivity, getClientProgress, getFinancialsPending, formatCurrency, formatDate, formatRelativeDate, getDaysUntil } from '../utils/helpers';
import { Users, DollarSign, AlertTriangle, Clock, CheckSquare, Calendar, TrendingUp, Target, Activity, ArrowRight, Plus, Zap, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const fin = getBusinessFinancials(clients);
  const overdueTasks = getOverdueTasks(clients);
  const activeClients = clients.filter(c => ['active', 'review', 'revisions'].includes(c.status));

  return (
    <div className="page">
      <div className="page-header animate-fade-in">
        <div className="flex-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <span className="uppercase-label" style={{ marginBottom: 12, display: 'block' }}>Operational Intelligence</span>
            <h1 className="page-title">Command Center</h1>
            <p className="page-subtitle">SYSTEM STATUS: {overdueTasks.length > 0 ? 'ATTENTION REQUIRED' : 'NOMINAL'}</p>
          </div>
          <div className="quick-actions" style={{ display: 'flex', gap: 1 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/pipeline')}>PIPELINE</button>
            <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>NEW CLIENT</button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 48 }}>
        <StatCard label="ACTIVE PROJECTS" value={activeClients.length} color="var(--accent)" />
        <StatCard label="REVENUE REALIZED" value={formatCurrency(fin.totalReceived)} color="var(--accent)" />
        <StatCard label="OUTSTANDING CAPITAL" value={formatCurrency(fin.totalOutstanding)} color={fin.totalOutstanding > 0 ? 'var(--warning)' : 'var(--accent)'} />
        <StatCard label="PIPELINE ASSETS" value={formatCurrency(fin.pipeline)} color="var(--accent)" />
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Intelligence Board */}
          <TeamBoard />

          {/* Strategic Portfolio */}
          <div>
            <div className="flex-between" style={{ marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <span className="uppercase-label">STRATEGIC PORTFOLIO</span>
              <Link to="/clients" style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)' }}>FULL REPERTOIRE →</Link>
            </div>
            
            {activeClients.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
                {activeClients.map(c => {
                  const progress = getClientProgress(c);
                  return (
                    <div key={c.id} className="glass-card-static" style={{ padding: 24, cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => navigate(`/clients/${c.id}`)}>
                      <div className="flex-between" style={{ marginBottom: 24 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>{c.name}</div>
                        <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>{c.health === 'nominal' ? 'NOMINAL' : 'AT RISK'}</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)', width: '100%', marginBottom: 16 }}>
                        <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%` }} />
                      </div>
                      <div className="flex-between">
                         <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLETION: {progress}%</span>
                         <span className="md-hide" style={{ fontSize: '0.5625rem', color: 'var(--accent)', fontWeight: 700 }}>VERIFIED</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 48, border: '1px dashed var(--border)' }}><p className="uppercase-label" style={{ opacity: 0.5 }}>No active engagements</p></div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Status Alerts */}
          {overdueTasks.length > 0 && (
            <div style={{ border: '1px solid var(--border)', padding: 32 }}>
              <span className="uppercase-label" style={{ color: 'var(--danger)', marginBottom: 24, display: 'block' }}>PRIORITY ALERTS</span>
              <div className="widget-list">
                {overdueTasks.slice(0,3).map(t => (
                  <div key={t.id} className="widget-list-item" onClick={() => navigate(`/clients/${t.clientId}`)} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>OVERDUE DELIVERABLE</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.clientName} | {t.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logs */}
          <div style={{ border: '1px solid var(--border)', padding: 32 }}>
            <span className="uppercase-label" style={{ marginBottom: 24, display: 'block' }}>PROTOCOL LOGS</span>
            <div className="widget-list">
              {getRecentActivity(clients, 6).map(a => (
                <div key={a.id} className="widget-list-item" style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{a.description.toUpperCase()}</div>
                    <div style={{ fontSize: '0.5625rem', color: 'var(--accent)', marginTop: 4, letterSpacing: '0.05em' }}>{formatRelativeDate(a.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

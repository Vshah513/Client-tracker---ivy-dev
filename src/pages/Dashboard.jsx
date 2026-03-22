import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import { StatCard, HealthBadge, StatusBadge, ProgressRing, AssigneeAvatar } from '../components/UIComponents';
import { getBusinessFinancials, getOverdueTasks, getDueThisWeek, getBlockedTasks, getAtRiskClients, getWaitingOnClient, getRecentActivity, getClientProgress, getFinancialsPending, formatCurrency, formatDate, formatRelativeDate, getDaysUntil } from '../utils/helpers';
import { Users, DollarSign, AlertTriangle, Clock, CheckSquare, Calendar, TrendingUp, Target, Activity, ArrowRight, Plus, Zap, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const fin = getBusinessFinancials(clients);
  const overdueTasks = getOverdueTasks(clients);
  const dueThisWeek = getDueThisWeek(clients);
  const blockedTasks = getBlockedTasks(clients);
  const atRisk = getAtRiskClients(clients);
  const waitingOnClient = getWaitingOnClient(clients);
  const recentActivity = getRecentActivity(clients, 8);
  const activeClients = clients.filter(c => ['active', 'review', 'revisions'].includes(c.status));

  return (
    <div className="page">
      <div className="page-header animate-slide-up">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Ivy Devs command center — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate('/clients/new')}><Plus size={13} /> New Client</button>
            <button className="quick-action-btn" onClick={() => navigate('/pipeline')}><Target size={13} /> Pipeline</button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Briefcase} label="Active Projects" value={activeClients.length} color="var(--accent)" delay={0} />
        <StatCard icon={DollarSign} label="Revenue Earned" value={formatCurrency(fin.totalReceived)} color="var(--success)" delay={1} />
        <StatCard icon={Clock} label="Outstanding" value={formatCurrency(fin.totalOutstanding)} color={fin.totalOutstanding > 0 ? 'var(--warning)' : 'var(--accent)'} delay={2} />
        <StatCard icon={TrendingUp} label="Pipeline Value" value={formatCurrency(fin.pipeline)} color="var(--accent-secondary)" delay={3} />
      </div>

      {/* Alert Banners */}
      {(atRisk.length > 0 || overdueTasks.length > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }} className="animate-slide-up stagger-3">
          {atRisk.length > 0 && (
            <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: 'var(--danger)' }}>
              <AlertTriangle size={16} /> <strong>{atRisk.length}</strong> project{atRisk.length > 1 ? 's' : ''} at risk — {atRisk.map(c => c.name).join(', ')}
            </div>
          )}
          {overdueTasks.length > 0 && (
            <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: 'var(--warning)' }}>
              <Clock size={16} /> <strong>{overdueTasks.length}</strong> overdue task{overdueTasks.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Projects */}
          <div className="widget animate-slide-up stagger-4">
            <div className="widget-header">
              <div><span className="widget-title">Active Projects</span></div>
              <Link to="/clients" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ArrowRight size={12} /></Link>
            </div>
            {activeClients.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeClients.map(c => {
                  const progress = getClientProgress(c);
                  const daysLeft = getDaysUntil(c.targetDate);
                  return (
                    <div key={c.id} className="widget-list-item" onClick={() => navigate(`/clients/${c.id}`)}>
                      <ProgressRing percentage={progress} size={40} strokeWidth={3} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{c.name}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                          <HealthBadge health={c.health} />
                          {daysLeft !== null && (
                            <span style={{ fontSize: '0.6875rem', color: daysLeft < 0 ? 'var(--danger)' : daysLeft < 7 ? 'var(--warning)' : 'var(--text-muted)' }}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{progress}%</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{formatCurrency(getFinancialsPending(c))} due</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}><p>No active projects</p></div>
            )}
          </div>

          {/* Due This Week */}
          {dueThisWeek.length > 0 && (
            <div className="widget animate-slide-up stagger-5">
              <div className="widget-header"><span className="widget-title">Due This Week</span><span className="widget-subtitle">{dueThisWeek.length} deliverables</span></div>
              <div className="widget-list">
                {dueThisWeek.map(d => (
                  <div key={d.id} className="widget-list-item" onClick={() => navigate(`/clients/${d.clientId}`)}>
                    <Calendar size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{d.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{d.clientName} · {formatDate(d.dueDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked Tasks */}
          {blockedTasks.length > 0 && (
            <div className="widget animate-slide-up stagger-6">
              <div className="widget-header"><span className="widget-title">Blocked</span><span className="blocker-badge">{blockedTasks.length}</span></div>
              <div className="widget-list">
                {blockedTasks.map(t => (
                  <div key={t.id} className="widget-list-item" onClick={() => navigate(`/clients/${t.clientId}`)}>
                    <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{t.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{t.clientName}</div>
                    </div>
                    <AssigneeAvatar assignee={t.assignee} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Waiting On Client */}
          {waitingOnClient.length > 0 && (
            <div className="widget animate-slide-up stagger-4">
              <div className="widget-header"><span className="widget-title">Waiting on Client</span></div>
              <div className="widget-list">
                {waitingOnClient.map((item, i) => (
                  <div key={i} className="widget-list-item" onClick={() => navigate(`/clients/${item.clientId}`)}>
                    <Clock size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.clientName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue by Client */}
          <div className="widget animate-slide-up stagger-5">
            <div className="widget-header">
              <span className="widget-title">Revenue by Client</span>
              <Link to="/financials" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>Details <ArrowRight size={12} /></Link>
            </div>
            {clients.filter(c => c.financials?.totalAgreed > 0).length > 0 ? (
              <div className="chart-container">
                {clients.filter(c => c.financials?.totalAgreed > 0).map(c => {
                  const maxVal = Math.max(...clients.map(cl => cl.financials?.totalAgreed || 0));
                  return (
                    <div key={c.id} className="chart-bar-wrapper" onClick={() => navigate(`/clients/${c.id}`)} style={{ cursor: 'pointer' }}>
                      <div className="chart-bar-container">
                        <div className="chart-bar" style={{ height: `${(c.financials.totalReceived / maxVal) * 100}%`, flex: 1 }} />
                        <div className="chart-bar chart-bar-secondary" style={{ height: `${(c.financials.totalAgreed / maxVal) * 100}%`, flex: 1, opacity: 0.3 }} />
                      </div>
                      <span className="chart-label">{c.name.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No financial data yet</div>
            )}
            <div className="financial-legend" style={{ justifyContent: 'center' }}>
              <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'var(--accent)' }} />Received</div>
              <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'var(--accent-secondary)' }} />Agreed</div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="widget animate-slide-up stagger-6">
            <div className="widget-header"><span className="widget-title">Recent Activity</span></div>
            {recentActivity.length > 0 ? (
              <div className="widget-list">
                {recentActivity.map(a => (
                  <div key={a.id} className="widget-list-item" onClick={() => navigate(`/clients/${a.clientId}`)}>
                    <Activity size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.description}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{a.clientName} · {formatRelativeDate(a.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import { StatusBadge, HealthBadge, ProgressRing, AssigneeAvatar } from '../components/UIComponents';
import { CLIENT_STATUSES } from '../data/schema';
import { getClientProgress, getFinancialsPending, formatCurrency, getDaysUntil, formatShortDate } from '../utils/helpers';
import { Search, Grid, List, Plus, Clock, DollarSign } from 'lucide-react';

export default function Clients() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('grid');

  const filtered = clients.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.idea?.toLowerCase().includes(search.toLowerCase()) && !c.contactName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header animate-slide-up">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Clients</h1>
            <p className="page-subtitle">{clients.length} total · {clients.filter(c => c.status === 'active').length} active</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}><Plus size={14} /> Add Client</button>
        </div>
      </div>

      {/* Filters */}
      <div className="animate-slide-up stagger-2" style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search clients, contacts, or ideas..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, overflow: 'auto' }}>
          <button className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('all')}>All</button>
          {CLIENT_STATUSES.map(s => (
            <button key={s.value} className={`btn btn-sm ${statusFilter === s.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s.value)}>{s.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`btn btn-sm btn-icon ${view === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('grid')}><Grid size={14} /></button>
          <button className={`btn btn-sm btn-icon ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}><List size={14} /></button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="animate-slide-up stagger-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(c => {
            const progress = getClientProgress(c);
            const pending = getFinancialsPending(c);
            const daysLeft = getDaysUntil(c.targetDate);
            const assignees = [...new Set([...(c.pages || []).map(p => p.owner), ...(c.tasks || []).map(t => t.assignee)])];
            return (
              <div key={c.id} className="client-card" onClick={() => navigate(`/clients/${c.id}`)}>
                <div className="client-card-header">
                  <div>
                    <div className="client-card-name">{c.name}</div>
                    <div className="client-card-idea">{c.idea}</div>
                  </div>
                  <HealthBadge health={c.health} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <StatusBadge status={c.status} />
                  {daysLeft !== null && c.status !== 'completed' && (
                    <span style={{ fontSize: '0.6875rem', padding: '3px 8px', borderRadius: 20, background: daysLeft < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', color: daysLeft < 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  )}
                </div>
                <div className="client-card-progress">
                  <div className="flex-between" style={{ marginBottom: 4, fontSize: '0.6875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                </div>
                <div className="client-card-footer">
                  <div className="client-card-team">
                    {assignees.includes('viraj') && <div className="avatar avatar-viraj avatar-sm">VS</div>}
                    {assignees.includes('ishan') && <div className="avatar avatar-ishan avatar-sm">IS</div>}
                  </div>
                  <div className="client-card-financial">
                    {c.financials?.totalAgreed > 0 && <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(c.financials.totalReceived)}</span>}
                    {c.financials?.totalAgreed > 0 && <span> / {formatCurrency(c.financials.totalAgreed)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass-card-static animate-slide-up stagger-3" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr>
              <th>Client</th><th>Status</th><th>Health</th><th>Progress</th><th>Revenue</th><th>Outstanding</th><th>Deadline</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                const progress = getClientProgress(c);
                const pending = getFinancialsPending(c);
                return (
                  <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
                    <td><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{c.contactName}</div></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><HealthBadge health={c.health} /></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="progress-bar" style={{ flex: 1, minWidth: 60 }}><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div><span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{progress}%</span></div></td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(c.financials?.totalReceived)}</td>
                    <td style={{ color: pending > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{formatCurrency(pending)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatShortDate(c.targetDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && <div className="empty-state"><h3>No clients found</h3><p>Try adjusting your search or filters.</p></div>}
    </div>
  );
}

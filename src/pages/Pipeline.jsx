import { useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import { PIPELINE_STAGES } from '../data/schema';
import { StatusBadge, HealthBadge } from '../components/UIComponents';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DollarSign, Calendar, Users, ArrowRight, Plus } from 'lucide-react';

export default function Pipeline() {
  const { clients, dispatch } = useClients();
  const navigate = useNavigate();

  // Group pipeline stages into visible columns
  const columns = [
    { stages: ['lead'], label: 'Lead', color: '#f59e0b' },
    { stages: ['discovery_scheduled', 'proposal_drafting'], label: 'Discovery', color: '#a78bfa' },
    { stages: ['proposal_sent', 'negotiation'], label: 'Proposal', color: '#818cf8' },
    { stages: ['won', 'deposit_received'], label: 'Won', color: '#06d6a0' },
    { stages: ['converted'], label: 'Active', color: '#10b981' },
    { stages: ['lost'], label: 'Lost', color: '#ef4444' },
  ];

  return (
    <div className="page">
      <div className="page-header animate-slide-up">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Pipeline</h1>
            <p className="page-subtitle">Track clients from lead to active project</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}><Plus size={14} /> New Lead</button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }} className="animate-slide-up stagger-2">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {columns.slice(0, -1).map(col => {
            const count = clients.filter(c => col.stages.includes(c.pipelineStage)).length;
            const value = clients.filter(c => col.stages.includes(c.pipelineStage))
              .reduce((s, c) => s + (c.financials?.totalAgreed || c.proposal?.amountProposed || 0), 0);
            return (
              <div key={col.label} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: col.color, textTransform: 'uppercase' }}>{col.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{formatCurrency(value)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="pipeline-board animate-slide-up stagger-3">
        {columns.map(col => {
          const colClients = clients.filter(c => col.stages.includes(c.pipelineStage));
          return (
            <div key={col.label} className="pipeline-column">
              <div className="pipeline-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{col.label}</span>
                  <span style={{ fontSize: '0.625rem', padding: '2px 8px', background: `${col.color}15`, color: col.color, borderRadius: 10, fontWeight: 700 }}>{colClients.length}</span>
                </div>
              </div>
              <div className="pipeline-column-body">
                {colClients.map(c => {
                  const amount = c.financials?.totalAgreed || c.proposal?.amountProposed || 0;
                  return (
                    <div key={c.id} className="pipeline-card" onClick={() => navigate(`/clients/${c.id}`)}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.idea}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {amount > 0 && <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(amount)}</span>}
                        <HealthBadge health={c.health} />
                      </div>
                      {c.contactName && <div style={{ marginTop: 6, fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {c.contactName}</div>}
                    </div>
                  );
                })}
                {colClients.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

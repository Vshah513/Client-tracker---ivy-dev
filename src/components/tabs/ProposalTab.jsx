import { PIPELINE_STAGES } from '../../data/schema';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FileText, ExternalLink, DollarSign, Calendar, Clock, CheckCircle2, Send } from 'lucide-react';

export default function ProposalTab({ client, dispatch }) {
  const p = client.proposal || {};
  function updateP(updates) { dispatch({ type: 'UPDATE_PROPOSAL', payload: { clientId: client.id, proposal: updates } }); }

  const STEPS = [
    { value: 'none', label: 'Not Started', icon: Clock },
    { value: 'draft', label: 'Drafting', icon: FileText },
    { value: 'sent', label: 'Sent', icon: Send },
    { value: 'approved', label: 'Approved', icon: CheckCircle2 },
  ];
  const currentIdx = STEPS.findIndex(s => s.value === p.status);

  return (
    <div>
      {/* Stepper */}
      <div className="glass-card-static" style={{ padding: 24, marginBottom: 20 }}>
        <div className="proposal-stepper" style={{ position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.value} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={`proposal-step ${i <= currentIdx ? 'active' : ''} ${i === currentIdx ? 'current' : ''}`}
                onClick={() => updateP({ status: step.value })}>
                <div className="proposal-step-circle"><step.icon size={14} /></div>
                <span className="proposal-step-label">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--accent)' : 'var(--border)', margin: '0 -4px', marginBottom: 20 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Details */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Proposal Details</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-row">
              <div className="input-group"><label className="input-label">Version</label>
                <input className="input-field" type="number" value={p.version || 1} onChange={e => updateP({ version: Number(e.target.value) })} /></div>
              <div className="input-group"><label className="input-label">Amount Proposed</label>
                <input className="input-field" type="number" value={p.amountProposed || ''} onChange={e => updateP({ amountProposed: Number(e.target.value) })} /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label className="input-label">Timeline Proposed</label>
                <input className="input-field" value={p.timelineProposed || ''} onChange={e => updateP({ timelineProposed: e.target.value })} placeholder="e.g. 6-8 weeks" /></div>
              <div className="input-group"><label className="input-label">Deposit Required</label>
                <input className="input-field" type="number" value={p.depositRequired || ''} onChange={e => updateP({ depositRequired: Number(e.target.value) })} /></div>
            </div>
            <div className="input-group"><label className="input-label">Scope Summary</label>
              <textarea className="input-field" value={p.scopeSummary || ''} onChange={e => updateP({ scopeSummary: e.target.value })} placeholder="High-level scope description..." /></div>
            <div className="input-group"><label className="input-label">Proposal URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" value={p.url || ''} onChange={e => updateP({ url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={12} /> Open</a>}
              </div>
            </div>
            <div className="input-group"><label className="input-label">Notes</label>
              <textarea className="input-field" value={p.notes || ''} onChange={e => updateP({ notes: e.target.value })} /></div>
          </div>
        </div>

        {/* Contract & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Contract Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Signed Date</span>
                <input className="input-field" type="date" style={{ width: 150, padding: '3px 8px', fontSize: '0.75rem' }} value={p.signedDate || ''} onChange={e => updateP({ signedDate: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Final Agreed Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(client.financials?.totalAgreed)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontWeight: 600, color: p.signedDate ? 'var(--accent)' : 'var(--warning)' }}>{p.signedDate ? '✓ Signed' : '⏳ Unsigned'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Pipeline Stage</h4>
            <select className="input-field" value={client.pipelineStage || 'lead'} onChange={e => dispatch({ type: 'UPDATE_CLIENT', payload: { id: client.id, pipelineStage: e.target.value } })}>
              {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

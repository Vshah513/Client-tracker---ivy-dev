import { useState } from 'react';
import { createDeliverable, DELIVERABLE_TYPES, DELIVERABLE_STATUSES, TEAM_MEMBERS } from '../../data/schema';
import { formatDate, getDaysUntil } from '../../utils/helpers';
import { AssigneeAvatar } from '../UIComponents';
import { Plus, Trash2, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';

export default function DeliverablesTab({ client, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [newDel, setNewDel] = useState({ title: '', type: 'demo', owner: 'viraj', dueDate: '' });
  const deliverables = client.deliverables || [];

  function add() {
    if (!newDel.title) return;
    dispatch({ type: 'ADD_DELIVERABLE', payload: { clientId: client.id, item: createDeliverable(newDel) } });
    setNewDel({ title: '', type: 'demo', owner: 'viraj', dueDate: '' }); setAdding(false);
  }

  function update(del, updates) {
    dispatch({ type: 'UPDATE_DELIVERABLE', payload: { clientId: client.id, item: { id: del.id, ...updates } } });
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h4 className="section-title">Deliverables</h4>
          <p className="section-subtitle">
            {deliverables.filter(d => d.approved).length} approved · {deliverables.filter(d => d.status === 'submitted' && !d.approved).length} awaiting
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Add</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {deliverables.map(del => {
          const daysLeft = getDaysUntil(del.dueDate);
          const overdue = daysLeft !== null && daysLeft < 0 && !del.approved && del.status !== 'approved';
          return (
            <div key={del.id} className="deliverable-card">
              {del.dueDate && (
                <div className="deliverable-date">
                  <span className="deliverable-date-month">{new Date(del.dueDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="deliverable-date-day">{new Date(del.dueDate).getDate()}</span>
                </div>
              )}
              <div className="deliverable-info" style={{ flex: 1 }}>
                <div className="deliverable-title">{del.title}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.625rem', padding: '2px 6px', background: 'rgba(124,58,237,0.1)', color: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 600 }}>
                    {DELIVERABLE_TYPES.find(t => t.value === del.type)?.label || del.type}
                  </span>
                  <AssigneeAvatar assignee={del.owner} />
                  {overdue && <span style={{ fontSize: '0.625rem', color: 'var(--danger)', fontWeight: 700 }}>OVERDUE</span>}
                  {del.submittedDate && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Sent {formatDate(del.submittedDate)}</span>}
                </div>
                {del.clientFeedback && <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>"{del.clientFeedback}"</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select className="input-field" style={{ width: 120, padding: '4px 8px', fontSize: '0.6875rem' }} value={del.status}
                  onChange={e => update(del, { status: e.target.value, approved: e.target.value === 'approved', submittedDate: e.target.value === 'submitted' && !del.submittedDate ? new Date().toISOString().split('T')[0] : del.submittedDate })}>
                  {DELIVERABLE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_DELIVERABLE', payload: { clientId: client.id, itemId: del.id } })}><Trash2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {deliverables.length === 0 && <div className="empty-state"><h3>No deliverables</h3><p>Track proposals, demos, designs, and handoffs.</p></div>}

      {adding && (
        <div className="glass-card-static" style={{ padding: 16, marginTop: 12 }}>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <input className="input-field" placeholder="Title" value={newDel.title} onChange={e => setNewDel({...newDel, title: e.target.value})} autoFocus />
            <select className="input-field" value={newDel.type} onChange={e => setNewDel({...newDel, type: e.target.value})}>{DELIVERABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          </div>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <select className="input-field" value={newDel.owner} onChange={e => setNewDel({...newDel, owner: e.target.value})}>{TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <input className="input-field" type="date" value={newDel.dueDate} onChange={e => setNewDel({...newDel, dueDate: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={add}>Add Deliverable</button>
          </div>
        </div>
      )}
    </div>
  );
}

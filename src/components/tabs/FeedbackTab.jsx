import { useState } from 'react';
import { createFeedback, FEEDBACK_CATEGORIES, PRIORITY_OPTIONS, TEAM_MEMBERS } from '../../data/schema';
import { formatDate } from '../../utils/helpers';
import { AssigneeAvatar } from '../UIComponents';
import { Plus, CheckCircle2, Circle } from 'lucide-react';

export default function FeedbackTab({ client, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newFb, setNewFb] = useState({ text: '', category: 'general', priority: 'medium', source: 'client', owner: '' });
  const feedback = client.feedback || [];

  const filtered = filter === 'all' ? feedback : filter === 'open' ? feedback.filter(f => !f.resolved) : feedback.filter(f => f.resolved);

  function add() {
    if (!newFb.text) return;
    dispatch({ type: 'ADD_FEEDBACK', payload: { clientId: client.id, item: createFeedback(newFb) } });
    setNewFb({ text: '', category: 'general', priority: 'medium', source: 'client', owner: '' }); setAdding(false);
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h4 className="section-title">Feedback</h4>
          <p className="section-subtitle">{feedback.filter(f => !f.resolved).length} open · {feedback.filter(f => f.resolved).length} resolved</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'open', 'resolved'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Add</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(fb => (
          <div key={fb.id} className={`feedback-card priority-${fb.priority} ${fb.resolved ? 'resolved' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{fb.text}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>{fb.source}</span>
                  <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>{FEEDBACK_CATEGORIES.find(c => c.value === fb.category)?.label}</span>
                  <span>{formatDate(fb.date)}</span>
                  {fb.linkedItem && <span>→ {fb.linkedItem}</span>}
                  {fb.owner && <AssigneeAvatar assignee={fb.owner} />}
                </div>
              </div>
              <button className={`btn btn-sm ${fb.resolved ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => dispatch({ type: 'UPDATE_FEEDBACK', payload: { clientId: client.id, item: { id: fb.id, resolved: !fb.resolved } } })}>
                {fb.resolved ? <><CheckCircle2 size={12} /> Resolved</> : <><Circle size={12} /> Open</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state" style={{ padding: 32 }}><p>No {filter === 'all' ? '' : filter} feedback</p></div>}

      {adding && (
        <div className="glass-card-static" style={{ padding: 16, marginTop: 12 }}>
          <textarea className="input-field" placeholder="Feedback text..." value={newFb.text} onChange={e => setNewFb({...newFb, text: e.target.value})} style={{ marginBottom: 8 }} autoFocus />
          <div className="form-row-3" style={{ marginBottom: 8 }}>
            <select className="input-field" value={newFb.category} onChange={e => setNewFb({...newFb, category: e.target.value})}>{FEEDBACK_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
            <select className="input-field" value={newFb.priority} onChange={e => setNewFb({...newFb, priority: e.target.value})}>{PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
            <select className="input-field" value={newFb.owner} onChange={e => setNewFb({...newFb, owner: e.target.value})}>
              <option value="">Assign to...</option>{TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={add}>Add Feedback</button>
          </div>
        </div>
      )}
    </div>
  );
}

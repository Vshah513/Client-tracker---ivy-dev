import { useState } from 'react';
import { createMilestone, MILESTONE_DEFAULTS, MILESTONE_STATUSES, TEAM_MEMBERS } from '../../data/schema';
import { AssigneeAvatar } from '../UIComponents';
import { formatDate, getDaysUntil } from '../../utils/helpers';
import { Plus, Trash2, List, BarChart3, AlertTriangle } from 'lucide-react';

export default function MilestonesTab({ client, dispatch }) {
  const [view, setView] = useState('timeline');
  const [adding, setAdding] = useState(false);
  const [newMs, setNewMs] = useState({ title: '', owner: 'viraj', dueDate: '' });
  const milestones = client.milestones || [];

  function addMilestone() {
    if (!newMs.title) return;
    dispatch({ type: 'ADD_MILESTONE', payload: { clientId: client.id, item: createMilestone(newMs) } });
    setNewMs({ title: '', owner: 'viraj', dueDate: '' }); setAdding(false);
  }

  function seedDefaults() {
    MILESTONE_DEFAULTS.forEach((title, i) => {
      dispatch({ type: 'ADD_MILESTONE', payload: { clientId: client.id, item: createMilestone({ title, owner: i % 2 === 0 ? 'viraj' : 'ishan' }) } });
    });
  }

  function updateMs(ms, updates) {
    dispatch({ type: 'UPDATE_MILESTONE', payload: { clientId: client.id, item: { id: ms.id, ...updates } } });
  }

  const statusColor = (s) => {
    if (s === 'completed') return 'var(--accent)';
    if (s === 'in_progress') return 'var(--info)';
    if (s === 'blocked') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div><h4 className="section-title">Milestones</h4><p className="section-subtitle">{milestones.filter(m => m.status === 'completed').length} / {milestones.length} complete</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${view === 'timeline' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('timeline')}><BarChart3 size={12} /> Timeline</button>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}><List size={12} /> List</button>
          {milestones.length === 0 && <button className="btn btn-secondary btn-sm" onClick={seedDefaults}>Load Defaults</button>}
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Add</button>
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && milestones.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="milestone-bar" style={{ marginBottom: 16 }}>
            {milestones.map(ms => (
              <div key={ms.id} className={`milestone-bar-segment ${ms.status === 'completed' ? 'completed' : ms.status === 'in_progress' ? 'in-progress' : ms.status === 'blocked' ? 'blocked' : ''}`}
                title={`${ms.title}: ${ms.progress}%`} style={{ cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      )}

      {/* Milestone Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {milestones.map((ms, i) => {
          const daysLeft = getDaysUntil(ms.dueDate);
          const overdue = daysLeft !== null && daysLeft < 0 && ms.status !== 'completed';
          return (
            <div key={ms.id} className="glass-card-static" style={{ padding: 16, borderLeft: `3px solid ${statusColor(ms.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{ms.title}</span>
                    {ms.status === 'blocked' && <span className="blocker-badge">Blocked</span>}
                    {overdue && <span style={{ fontSize: '0.625rem', color: 'var(--danger)', fontWeight: 700 }}>⚠ OVERDUE</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                    <AssigneeAvatar assignee={ms.owner} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{ms.dueDate ? formatDate(ms.dueDate) : 'No due date'}</span>
                    {ms.dependencies && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>→ {ms.dependencies}</span>}
                  </div>
                  {ms.blockers && <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} />{ms.blockers}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right', minWidth: 50 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{ms.progress}%</div>
                  </div>
                  <select className="input-field" style={{ width: 120, padding: '4px 8px', fontSize: '0.6875rem' }} value={ms.status}
                    onChange={e => updateMs(ms, { status: e.target.value, progress: e.target.value === 'completed' ? 100 : ms.progress })}>
                    {MILESTONE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_MILESTONE', payload: { clientId: client.id, itemId: ms.id } })}><Trash2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${ms.progress}%` }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input type="range" min="0" max="100" value={ms.progress} onChange={e => updateMs(ms, { progress: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--accent)' }} />
                <input className="input-field" style={{ width: 70, padding: '3px 6px', fontSize: '0.6875rem' }} placeholder="Due date" type="date" value={ms.dueDate || ''}
                  onChange={e => updateMs(ms, { dueDate: e.target.value })} />
                <select className="input-field" style={{ width: 80, padding: '3px 6px', fontSize: '0.6875rem' }} value={ms.owner}
                  onChange={e => updateMs(ms, { owner: e.target.value })}>
                  {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {milestones.length === 0 && (
        <div className="empty-state"><h3>No milestones yet</h3><p>Add milestones to track project phases, or load the defaults.</p></div>
      )}

      {adding && (
        <div className="glass-card-static" style={{ padding: 16, marginTop: 12 }}>
          <div className="form-row-3" style={{ marginBottom: 8 }}>
            <div className="input-group">
              <select className="input-field" value={newMs.title} onChange={e => setNewMs({...newMs, title: e.target.value})}>
                <option value="">Custom title...</option>{MILESTONE_DEFAULTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input className="input-field" placeholder="Or type custom title" value={newMs.title} onChange={e => setNewMs({...newMs, title: e.target.value})} />
            <input className="input-field" type="date" value={newMs.dueDate} onChange={e => setNewMs({...newMs, dueDate: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addMilestone}>Add Milestone</button>
          </div>
        </div>
      )}
    </div>
  );
}
